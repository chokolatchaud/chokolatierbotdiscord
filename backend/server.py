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
    doc = {
        "id": user_id,
        "username": username,
        "username_lower": username.lower(),
        "password_hash": hash_password(data.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, username)
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")
    return {"id": user_id, "username": username, "created_at": doc["created_at"], "token": token}


@api_router.post("/auth/login")
async def login(data: LoginIn, response: Response):
    user = await db.users.find_one({"username_lower": data.username.strip().lower()})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Pseudo ou mot de passe incorrect")
    token = create_access_token(user["id"], user["username"])
    response.set_cookie("access_token", token, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")
    return {"id": user["id"], "username": user["username"],
            "created_at": user["created_at"], "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------------- Server Status ----------------
@api_router.get("/server/status")
async def server_status():
    state = await db.server_state.find_one({"id": "main"}, {"_id": 0})
    if not state:
        state = {
            "ip": SERVER_IP,
            "online_players": 0,
            "max_players": 100,
            "version": "1.21",
            "motd": "Farm & Build — Freebuild économique",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    state["ip"] = SERVER_IP
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


# ---------------- Vote Sites ----------------
@api_router.get("/vote/sites")
async def vote_sites():
    sites = await db.vote_sites.find({}, {"_id": 0}).to_list(50)
    sites.sort(key=lambda x: x.get("order", 999))
    return sites


# ---------------- Seed ----------------
async def seed_demo_data():
    await db.users.create_index("username_lower", unique=True)
    await db.structures.create_index("name", unique=True)
    await db.leaderboard.create_index("username", unique=True)

    if await db.structures.count_documents({}) == 0:
        import random
        names = [
            ("Château de pierre", "castle", "Médiéval"),
            ("Ferme automatique", "wheat", "Agriculture"),
            ("Tour de guet", "tower", "Défense"),
            ("Maison moderne", "house", "Résidentiel"),
            ("Mine de diamants", "pickaxe", "Industriel"),
            ("Pont suspendu", "bridge", "Infrastructure"),
            ("Phare côtier", "lighthouse", "Maritime"),
            ("Statue colossale", "statue", "Art"),
        ]
        now = datetime.now(timezone.utc)
        for name, icon, cat in names:
            base = random.uniform(500, 5000)
            history = []
            price = base
            for i in range(40, 0, -1):
                price *= random.uniform(0.95, 1.06)
                t = (now - timedelta(hours=i)).isoformat()
                history.append({"t": t, "price": round(price, 2)})
            prev = history[-2]["price"] if len(history) > 1 else price
            change = (price - prev) / prev * 100 if prev else 0
            await db.structures.insert_one({
                "name": name, "price": round(price, 2),
                "previous_price": round(prev, 2),
                "change_pct": round(change, 2),
                "icon": icon, "category": cat,
                "history": history,
                "updated_at": now.isoformat(),
            })

    if await db.leaderboard.count_documents({}) == 0:
        demo = [
            ("Steve_Builder", 125430.50, 24),
            ("Alex_Mining", 98220.10, 18),
            ("Notch_Reborn", 76450.00, 15),
            ("Herobrine_FR", 65120.75, 12),
            ("PixelKing", 54300.00, 10),
            ("BlockMaster", 43210.80, 9),
            ("RedstoneGuru", 38900.25, 7),
            ("CreeperFarmer", 29870.00, 6),
            ("EnderQueen", 21540.45, 5),
            ("ZombieSlayer", 15200.00, 4),
        ]
        for u, b, s in demo:
            await db.leaderboard.insert_one({
                "username": u, "balance": b, "structures": s,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })

    if await db.vote_sites.count_documents({}) == 0:
        sites = [
            {"name": "Minecraft-Server.net", "url": "https://minecraft-server.net/vote/votre-serveur",
             "reward": "100 coins + 1 diamant", "order": 1, "configured": False},
            {"name": "Serveur-Minecraft.com", "url": "https://serveur-minecraft.com/vote/votre-serveur",
             "reward": "150 coins", "order": 2, "configured": False},
            {"name": "Top-Serveurs.net", "url": "https://top-serveurs.net/minecraft/vote/votre-serveur",
             "reward": "200 coins + clé légendaire", "order": 3, "configured": False},
            {"name": "Minecraft-MP.com", "url": "https://minecraft-mp.com/server/vote/",
             "reward": "100 coins", "order": 4, "configured": False},
        ]
        for s in sites:
            await db.vote_sites.insert_one(s)


@app.on_event("startup")
async def startup_event():
    await seed_demo_data()


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
