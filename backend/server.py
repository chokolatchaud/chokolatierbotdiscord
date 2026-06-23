from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Header
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict


# ---------------- App & DB ----------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Farm & Build API")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']
PLUGIN_API_KEY = os.environ['PLUGIN_API_KEY']
SERVER_IP = os.environ.get('SERVER_IP', 'mine.farm-and.fr')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'Admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin78')


# ---------------- Helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, username: str) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Non authentifié")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user


async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return user


async def get_staff_user(user: dict = Depends(get_current_user)) -> dict:
    """Admin OR moderator. Used for vote sites management."""
    if user.get("role") not in ("admin", "moderator"):
        raise HTTPException(status_code=403, detail="Accès staff requis")
    return user


ALLOWED_ROLES = {"player", "moderator", "admin"}


def require_plugin_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != PLUGIN_API_KEY:
        raise HTTPException(status_code=403, detail="Clé API plugin invalide")
    return True


# ---------------- Models ----------------
class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=16)
    password: str = Field(min_length=6, max_length=128)


class LoginIn(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    created_at: str


class StructureUpdateIn(BaseModel):
    name: str
    price: float
    icon: Optional[str] = None
    category: Optional[str] = "Structure"


class LeaderboardEntryIn(BaseModel):
    username: str
    balance: float
    structures: Optional[int] = 0


# ---------------- Auth Endpoints ----------------
@api_router.post("/auth/register")
async def register(data: RegisterIn, response: Response):
    username = data.username.strip()
    existing = await db.users.find_one({"username_lower": username.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Ce pseudo est déjà utilisé")

    user_id = str(uuid.uuid4())
    role = "admin" if username.lower() == ADMIN_USERNAME.lower() else "player"
    doc = {
        "id": user_id,
        "username": username,
        "username_lower": username.lower(),
        "password_hash": hash_password(data.password),
        "role": role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, username)
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")
    return {"id": user_id, "username": username, "role": role,
            "created_at": doc["created_at"], "token": token}


@api_router.post("/auth/login")
async def login(data: LoginIn, response: Response):
    user = await db.users.find_one({"username_lower": data.username.strip().lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Pseudo ou mot de passe incorrect")
    token = create_access_token(user["id"], user["username"])
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")
    return {"id": user["id"], "username": user["username"],
            "role": user.get("role", "player"),
            "created_at": user["created_at"], "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


@api_router.post("/auth/change-password")
async def change_password(data: ChangePasswordIn,
                          user: dict = Depends(get_current_user)):
    full = await db.users.find_one({"id": user["id"]})
    if not full or not verify_password(data.current_password, full["password_hash"]):
        raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit être différent")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password_hash": hash_password(data.new_password)}},
    )
    return {"ok": True}


# ---------------- Server Status ----------------
@api_router.get("/server/status")
async def server_status():
    settings = await get_settings_doc()
    state = await db.server_state.find_one({"id": "main"}, {"_id": 0})
    if not state:
        state = {
            "online_players": 0,
            "max_players": 100,
            "version": "1.21",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    state["ip"] = settings["ip"]
    state["motd"] = settings["motd"]
    state["maintenance"] = settings["maintenance"]
    return state


@api_router.post("/server/status", dependencies=[Depends(require_plugin_key)])
async def update_server_status(payload: dict):
    payload["id"] = "main"
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.server_state.update_one({"id": "main"}, {"$set": payload}, upsert=True)
    return {"ok": True}


# ---------------- Market ----------------
@api_router.get("/market/structures")
async def list_structures():
    items = await db.structures.find({}, {"_id": 0}).to_list(500)
    items.sort(key=lambda x: x.get("name", ""))
    return items


@api_router.get("/market/structures/{name}/history")
async def structure_history(name: str):
    item = await db.structures.find_one({"name": name}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Structure introuvable")
    return item.get("history", [])


@api_router.post("/market/structures", dependencies=[Depends(require_plugin_key)])
async def upsert_structure(data: StructureUpdateIn):
    now = datetime.now(timezone.utc).isoformat()
    existing = await db.structures.find_one({"name": data.name})
    history = existing.get("history", []) if existing else []
    history.append({"t": now, "price": data.price})
    history = history[-100:]
    prev = existing.get("price") if existing else data.price
    change = ((data.price - prev) / prev * 100) if prev else 0
    doc = {
        "name": data.name,
        "price": data.price,
        "previous_price": prev,
        "change_pct": round(change, 2),
        "icon": data.icon or "block",
        "category": data.category or "Structure",
        "history": history,
        "updated_at": now,
    }
    await db.structures.update_one({"name": data.name}, {"$set": doc}, upsert=True)
    doc.pop("_id", None)
    return doc


# ---------------- Leaderboard ----------------
@api_router.get("/leaderboard")
async def leaderboard():
    rows = await db.leaderboard.find({}, {"_id": 0}).to_list(500)
    rows.sort(key=lambda x: x.get("balance", 0), reverse=True)
    return rows[:50]


@api_router.post("/leaderboard", dependencies=[Depends(require_plugin_key)])
async def upsert_leaderboard(data: LeaderboardEntryIn):
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "username": data.username,
        "balance": data.balance,
        "structures": data.structures or 0,
        "updated_at": now,
    }
    await db.leaderboard.update_one({"username": data.username}, {"$set": doc}, upsert=True)
    return doc


# ---------------- Site Settings (admin-editable texts) ----------------
DEFAULT_SETTINGS = {
    "id": "site",
    "ip": SERVER_IP,
    "motd": "Farm & Build — Freebuild économique",
    "hero_title_accent": "réinventé",
    "hero_subtitle": "Construis ce que tu veux. Définis tes structures. Le marché fixe leur valeur. Plus la demande monte, plus tu gagnes.",
    "discord_url": "",
    "maintenance": False,
    "maintenance_message": "Le serveur est en maintenance. On revient très vite.",
}


async def get_settings_doc() -> dict:
    doc = await db.settings.find_one({"id": "site"}, {"_id": 0})
    if not doc:
        doc = DEFAULT_SETTINGS.copy()
        await db.settings.insert_one(doc.copy())
    # Ensure all keys exist (forward-compat)
    for k, v in DEFAULT_SETTINGS.items():
        doc.setdefault(k, v)
    return doc


class SettingsIn(BaseModel):
    ip: Optional[str] = None
    motd: Optional[str] = None
    hero_title_accent: Optional[str] = None
    hero_subtitle: Optional[str] = None
    discord_url: Optional[str] = None
    maintenance: Optional[bool] = None
    maintenance_message: Optional[str] = None


@api_router.get("/settings")
async def public_settings():
    return await get_settings_doc()


@api_router.put("/admin/settings")
async def admin_update_settings(data: SettingsIn,
                                _: dict = Depends(get_admin_user)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Aucun changement fourni")
    await db.settings.update_one(
        {"id": "site"}, {"$set": update}, upsert=True
    )
    return await get_settings_doc()


# ---------------- Vote Sites ----------------
@api_router.get("/vote/sites")
async def vote_sites():
    sites = await db.vote_sites.find({}, {"_id": 0}).to_list(50)
    sites.sort(key=lambda x: x.get("order", 999))
    return sites


# ---------------- Player Dashboard ----------------
@api_router.get("/player/me")
async def player_me(user: dict = Depends(get_current_user)):
    """Returns the player's market data: balance, owned structures, rank."""
    entry = await db.leaderboard.find_one(
        {"username": user["username"]}, {"_id": 0}
    )
    inv = await db.player_inventory.find_one(
        {"username": user["username"]}, {"_id": 0}
    )
    # compute rank from leaderboard
    rank = None
    if entry:
        higher = await db.leaderboard.count_documents(
            {"balance": {"$gt": entry["balance"]}}
        )
        rank = higher + 1
    return {
        "username": user["username"],
        "role": user.get("role", "player"),
        "balance": entry["balance"] if entry else 0,
        "structures_count": entry["structures"] if entry else 0,
        "rank": rank,
        "owned_structures": inv["structures"] if inv else [],
        "linked": entry is not None,
    }


class InventoryIn(BaseModel):
    username: str
    structures: List[dict]  # [{"name": "...", "qty": 1, "value": 1234.5}]


@api_router.post("/player/inventory", dependencies=[Depends(require_plugin_key)])
async def upsert_inventory(data: InventoryIn):
    doc = {
        "username": data.username,
        "structures": data.structures,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.player_inventory.update_one(
        {"username": data.username}, {"$set": doc}, upsert=True
    )
    return {"ok": True}


# ---------------- Admin: Vote Sites Management ----------------
class VoteSiteIn(BaseModel):
    name: str
    url: str
    reward: str
    order: int = 999
    configured: bool = True


@api_router.get("/admin/vote-sites")
async def admin_list_sites(_: dict = Depends(get_staff_user)):
    sites = await db.vote_sites.find({}, {"_id": 0}).to_list(100)
    sites.sort(key=lambda x: x.get("order", 999))
    return sites


@api_router.post("/admin/vote-sites")
async def admin_create_site(data: VoteSiteIn, _: dict = Depends(get_staff_user)):
    existing = await db.vote_sites.find_one({"name": data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Un site avec ce nom existe déjà")
    doc = data.model_dump()
    await db.vote_sites.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/vote-sites/{name}")
async def admin_update_site(name: str, data: VoteSiteIn,
                            _: dict = Depends(get_staff_user)):
    res = await db.vote_sites.update_one(
        {"name": name}, {"$set": data.model_dump()}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Site introuvable")
    return data.model_dump()


@api_router.delete("/admin/vote-sites/{name}")
async def admin_delete_site(name: str, _: dict = Depends(get_staff_user)):
    res = await db.vote_sites.delete_one({"name": name})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Site introuvable")
    return {"ok": True}


# ---------------- Admin: User Management ----------------
class CreateUserIn(BaseModel):
    username: str = Field(min_length=3, max_length=16)
    password: str = Field(min_length=6, max_length=128)
    role: str = "player"


class UpdateRoleIn(BaseModel):
    role: str


@api_router.get("/admin/users")
async def admin_list_users(_: dict = Depends(get_admin_user)):
    users = await db.users.find(
        {}, {"_id": 0, "password_hash": 0, "username_lower": 0}
    ).to_list(500)
    users.sort(key=lambda x: x.get("created_at", ""))
    return users


@api_router.post("/admin/users")
async def admin_create_user(data: CreateUserIn, _: dict = Depends(get_admin_user)):
    if data.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Rôle invalide")
    if await db.users.find_one({"username_lower": data.username.lower()}):
        raise HTTPException(status_code=400, detail="Ce pseudo est déjà utilisé")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "username": data.username,
        "username_lower": data.username.lower(),
        "password_hash": hash_password(data.password),
        "role": data.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    return {"id": uid, "username": data.username, "role": data.role,
            "created_at": doc["created_at"]}


@api_router.put("/admin/users/{user_id}/role")
async def admin_update_role(user_id: str, data: UpdateRoleIn,
                            admin: dict = Depends(get_admin_user)):
    if data.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Rôle invalide")
    if user_id == admin["id"] and data.role != "admin":
        raise HTTPException(status_code=400, detail="Tu ne peux pas te rétrograder toi-même")
    res = await db.users.update_one({"id": user_id}, {"$set": {"role": data.role}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {"ok": True, "role": data.role}


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Tu ne peux pas te supprimer toi-même")
    res = await db.users.delete_one({"id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return {"ok": True}


# ---------------- Admin: Stats ----------------
@api_router.get("/admin/stats")
async def admin_stats(_: dict = Depends(get_staff_user)):
    settings = await get_settings_doc()
    state = await db.server_state.find_one({"id": "main"}, {"_id": 0}) or {}
    return {
        "users_count": await db.users.count_documents({}),
        "admins_count": await db.users.count_documents({"role": "admin"}),
        "moderators_count": await db.users.count_documents({"role": "moderator"}),
        "structures_count": await db.structures.count_documents({}),
        "leaderboard_count": await db.leaderboard.count_documents({}),
        "vote_sites_count": await db.vote_sites.count_documents({}),
        "online_players": state.get("online_players", 0),
        "max_players": state.get("max_players", 100),
        "maintenance": settings.get("maintenance", False),
        "ip": settings.get("ip"),
    }


# ---------------- Seed ----------------
async def seed_demo_data():
    """Indexes only — no fake data. Real data is pushed by the Minecraft plugin
    (market & leaderboard & inventory) or created by the admin (vote sites)."""
    await db.users.create_index("username_lower", unique=True)
    await db.structures.create_index("name", unique=True)
    await db.leaderboard.create_index("username", unique=True)
    await db.player_inventory.create_index("username", unique=True)
    await db.vote_sites.create_index("name", unique=True)


@app.on_event("startup")
async def startup_event():
    await seed_demo_data()
    # Auto-create admin account on first boot only.
    # We DO NOT overwrite the password on later restarts so that admin can
    # change it freely through /api/auth/change-password.
    existing = await db.users.find_one({"username_lower": ADMIN_USERNAME.lower()})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "username": ADMIN_USERNAME,
            "username_lower": ADMIN_USERNAME.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif existing.get("role") != "admin":
        await db.users.update_one(
            {"username_lower": ADMIN_USERNAME.lower()},
            {"$set": {"role": "admin"}},
        )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ---------------- Mount ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
