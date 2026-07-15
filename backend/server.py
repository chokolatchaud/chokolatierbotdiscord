import os
import uuid
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager

# ── Config ──────────────────────────────────────────────────────────────────
MONGO_URL        = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME          = os.environ.get("DB_NAME", "farmland")
JWT_SECRET       = os.environ.get("JWT_SECRET", "change_me")
JWT_ALGORITHM    = "HS256"
PLUGIN_API_KEY   = os.environ.get("PLUGIN_API_KEY", "")
ADMIN_USERNAME   = os.environ.get("ADMIN_USERNAME", "Chokolatchaud")
ADMIN_PASSWORD   = os.environ.get("ADMIN_PASSWORD", "admin78")
CORS_ORIGINS     = os.environ.get("CORS_ORIGINS", "*").split(",")
# URL secrète du panel admin — jamais dans le code source
ADMIN_SECRET_PATH = os.environ.get("ADMIN_SECRET_PATH", "admin_secret")

# ── DB ───────────────────────────────────────────────────────────────────────
client = AsyncIOMotorClient(MONGO_URL)
db     = client[DB_NAME]

# ── App ──────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_event()
    yield
    client.close()

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

# ── Helpers ──────────────────────────────────────────────────────────────────
def hash_password(p: str) -> str:
    import hashlib
    return hashlib.sha256(p.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed

def create_access_token(user_id: str, username: str) -> str:
    payload = {"sub": user_id, "username": username,
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
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
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur introuvable")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expirée")
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès administrateur requis")
    return user

def require_plugin_key(x_api_key: Optional[str] = Header(None)):
    if not PLUGIN_API_KEY or x_api_key != PLUGIN_API_KEY:
        raise HTTPException(status_code=403, detail="Clé API invalide")

# ── Models ───────────────────────────────────────────────────────────────────
class LoginIn(BaseModel):
    username: str
    password: str

class LeaderboardEntryIn(BaseModel):
    username: str
    balance: float
    structures: Optional[int] = 0
    blocpose: Optional[int] = 0

class StructureUpdateIn(BaseModel):
    name: str
    price: float
    category: Optional[str] = "Marché"

class VoteSiteIn(BaseModel):
    name: str
    url: str
    description: Optional[str] = ""
    active: Optional[bool] = True

class SettingsIn(BaseModel):
    server_ip: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None

# ── Auth (admin uniquement) ──────────────────────────────────────────────────
@api_router.post("/auth/login")
async def login(data: LoginIn, response: Response):
    user = await db.users.find_one({"username_lower": data.username.strip().lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Pseudo ou mot de passe incorrect")
    token = create_access_token(user["id"], user["username"])
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")
    return {"id": user["id"], "username": user["username"], "role": user.get("role", "admin"),
            "created_at": user.get("created_at"), "token": token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

# ── Statut serveur ───────────────────────────────────────────────────────────
@api_router.get("/server/status")
async def server_status():
    state = await db.server_state.find_one({}, {"_id": 0}) or {}
    settings = await db.settings.find_one({}, {"_id": 0}) or {}
    return {
        "online": state.get("online_players", 0),
        "max":    state.get("max_players", 100),
        "version": state.get("version", "1.21"),
        "ip":     settings.get("server_ip", "mine.farm-land.fr"),
        "online_players": state.get("online_players", 0),
        "max_players":    state.get("max_players", 100),
    }

@api_router.post("/server/status", dependencies=[Depends(require_plugin_key)])
async def update_server_status(payload: dict):
    doc = {"online_players": payload.get("online_players", 0),
           "max_players":    payload.get("max_players", 100),
           "version":        payload.get("version", ""),
           "updated_at":     datetime.now(timezone.utc).isoformat()}
    await db.server_state.replace_one({}, doc, upsert=True)
    return {"ok": True}

# ── Marché ───────────────────────────────────────────────────────────────────
@api_router.get("/market/structures")
async def list_structures():
    items = await db.structures.find({}, {"_id": 0}).to_list(500)
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
    prev_price = existing["price"] if existing else data.price
    doc = {"name": data.name, "price": data.price, "category": data.category,
           "history": history, "updated_at": now,
           "change_pct": round((data.price - prev_price) / prev_price * 100, 2) if prev_price else 0}
    await db.structures.update_one({"name": data.name}, {"$set": doc}, upsert=True)
    return {"ok": True}

# ── Classement ───────────────────────────────────────────────────────────────
@api_router.get("/leaderboard")
async def leaderboard():
    rows = await db.leaderboard.find({}, {"_id": 0}).to_list(1000)
    rows.sort(key=lambda x: x.get("balance", 0), reverse=True)
    return rows[:20]

@api_router.get("/leaderboard/argent")
async def leaderboard_argent():
    rows = await db.leaderboard.find({}, {"_id": 0}).to_list(1000)
    rows.sort(key=lambda x: x.get("balance", 0), reverse=True)
    return rows[:20]

@api_router.get("/leaderboard/structures")
async def leaderboard_structures():
    rows = await db.leaderboard.find({}, {"_id": 0}).to_list(1000)
    rows.sort(key=lambda x: x.get("structures", 0), reverse=True)
    return rows[:20]

@api_router.get("/leaderboard/blocpose")
async def leaderboard_blocpose():
    rows = await db.leaderboard.find({}, {"_id": 0}).to_list(1000)
    rows.sort(key=lambda x: x.get("blocpose", 0), reverse=True)
    return rows[:20]

@api_router.post("/leaderboard", dependencies=[Depends(require_plugin_key)])
async def upsert_leaderboard(data: LeaderboardEntryIn):
    now = datetime.now(timezone.utc).isoformat()
    doc = {"username": data.username, "balance": data.balance,
           "structures": data.structures or 0,
           "blocpose": data.blocpose or 0,
           "updated_at": now}
    await db.leaderboard.update_one({"username": data.username}, {"$set": doc}, upsert=True)
    return {"ok": True}

# ── Settings ─────────────────────────────────────────────────────────────────
async def get_settings_doc() -> dict:
    doc = await db.settings.find_one({}, {"_id": 0})
    return doc or {
        "server_ip": "mine.farm-land.fr",
        "hero_title": "Construis. Définis. Vends.",
        "hero_subtitle": "Construis ce que tu veux. Définis tes structures. Le marché fixe leur valeur.",
        "maintenance_mode": False,
        "maintenance_message": "Le serveur est en maintenance.",
    }

@api_router.get("/settings")
async def public_settings():
    return await get_settings_doc()

@api_router.put("/admin/settings")
async def admin_update_settings(data: SettingsIn, _: dict = Depends(get_admin_user)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if update:
        await db.settings.update_one({}, {"$set": update}, upsert=True)
    return await get_settings_doc()

# ── Vote ─────────────────────────────────────────────────────────────────────
@api_router.get("/vote/sites")
async def vote_sites():
    sites = await db.vote_sites.find({"active": True}, {"_id": 0}).to_list(100)
    return sites

@api_router.get("/admin/vote-sites")
async def admin_list_sites(_: dict = Depends(get_admin_user)):
    return await db.vote_sites.find({}, {"_id": 0}).to_list(100)

@api_router.post("/admin/vote-sites")
async def admin_create_site(data: VoteSiteIn, _: dict = Depends(get_admin_user)):
    doc = {**data.model_dump(), "id": str(uuid.uuid4()), "created_at": datetime.now(timezone.utc).isoformat()}
    await db.vote_sites.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/admin/vote-sites/{name}")
async def admin_update_site(name: str, data: VoteSiteIn, _: dict = Depends(get_admin_user)):
    await db.vote_sites.update_one({"name": name}, {"$set": data.model_dump()})
    return {"ok": True}

@api_router.delete("/admin/vote-sites/{name}")
async def admin_delete_site(name: str, _: dict = Depends(get_admin_user)):
    await db.vote_sites.delete_one({"name": name})
    return {"ok": True}

@api_router.get("/admin/stats")
async def admin_stats(_: dict = Depends(get_admin_user)):
    return {
        "total_players": await db.leaderboard.count_documents({}),
        "total_structures": await db.structures.count_documents({}),
        "total_vote_sites": await db.vote_sites.count_documents({}),
    }

# ── Startup ──────────────────────────────────────────────────────────────────
async def startup_event():
    # Crée le compte admin si inexistant
    existing = await db.users.find_one({"username_lower": ADMIN_USERNAME.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "username": ADMIN_USERNAME,
            "username_lower": ADMIN_USERNAME.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

app.include_router(api_router)
