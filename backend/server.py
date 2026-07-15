from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Header
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# ============================================================
#  Farmland — API vitrine
#  Aucune base de données : tout vit en mémoire.
#  Le plugin Minecraft est la seule source de vérité, il pousse
#  son état régulièrement. Si le backend redémarre, les données
#  reviennent au prochain push du plugin (30s max).
#  Si le plugin ne pousse plus rien => le site s'affiche hors ligne.
# ============================================================

app = FastAPI(title="Farmland API")
api_router = APIRouter(prefix="/api")

PLUGIN_API_KEY = os.environ['PLUGIN_API_KEY']
SERVER_IP = os.environ.get('SERVER_IP', 'mine.farm-land.fr')
DISCORD_URL = os.environ.get('DISCORD_URL', '')

# combien de secondes sans push avant de considérer le serveur hors ligne
OFFLINE_AFTER_SECONDS = int(os.environ.get('OFFLINE_AFTER_SECONDS', '120'))

# ---------------- Stockage en mémoire ----------------
STORE = {
    "server_state": None,       # {online_players, max_players, version, updated_at}
    "last_push": None,          # datetime du dernier push reçu (n'importe lequel)
    "structures": {},           # name -> {name, price, change_pct, history[100], ...}
    "leaderboard": {},          # username -> {username, balance, structures, blocpose, updated_at}
    "vote_sites": [],           # [{name, url, reward, order}]
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def touch_push():
    STORE["last_push"] = datetime.now(timezone.utc)


def server_is_online() -> bool:
    if STORE["last_push"] is None:
        return False
    age = (datetime.now(timezone.utc) - STORE["last_push"]).total_seconds()
    return age < OFFLINE_AFTER_SECONDS


def require_plugin_key(x_api_key: Optional[str] = Header(None)):
    if x_api_key != PLUGIN_API_KEY:
        raise HTTPException(status_code=403, detail="Clé API plugin invalide")
    return True


# ---------------- Modèles ----------------
class ServerStatusIn(BaseModel):
    online_players: int = 0
    max_players: int = 100
    version: str = "1.21"


class StructureUpdateIn(BaseModel):
    name: str
    price: float
    icon: Optional[str] = None
    category: Optional[str] = "Structure"


class LeaderboardEntryIn(BaseModel):
    username: str
    balance: float
    structures: Optional[int] = 0
    blocpose: Optional[int] = 0


class VoteSiteIn(BaseModel):
    name: str
    url: str
    reward: str = ""
    order: int = 999


# ---------------- Endpoints publics (lecture) ----------------
@api_router.get("/settings")
async def public_settings():
    online = server_is_online()
    return {
        "ip": SERVER_IP,
        "motd": "Farmland — Freebuild économique",
        "hero_title_accent": "réinventé",
        "hero_subtitle": "Construis ce que tu veux. Définis tes structures. Le marché fixe leur valeur. Plus la demande monte, plus tu gagnes.",
        "discord_url": DISCORD_URL,
        # le bandeau maintenance du site sert d'indicateur hors ligne
        "maintenance": not online,
        "maintenance_message": "Le serveur Minecraft est actuellement hors ligne. Les données affichées datent de la dernière connexion.",
    }


@api_router.get("/server/status")
async def server_status():
    state = STORE["server_state"] or {
        "online_players": 0,
        "max_players": 100,
        "version": "1.21",
        "updated_at": now_iso(),
    }
    return {**state, "ip": SERVER_IP, "online": server_is_online()}


@api_router.get("/market/structures")
async def list_structures():
    items = list(STORE["structures"].values())
    items.sort(key=lambda x: x.get("name", ""))
    return items


@api_router.get("/market/structures/{name}/history")
async def structure_history(name: str):
    item = STORE["structures"].get(name)
    if not item:
        raise HTTPException(status_code=404, detail="Structure introuvable")
    return item.get("history", [])


@api_router.get("/leaderboard")
async def leaderboard():
    rows = list(STORE["leaderboard"].values())
    rows.sort(key=lambda x: x.get("balance", 0), reverse=True)
    return rows[:50]


@api_router.get("/leaderboard/argent")
async def leaderboard_argent():
    rows = list(STORE["leaderboard"].values())
    rows.sort(key=lambda x: x.get("balance", 0), reverse=True)
    return rows[:20]


@api_router.get("/leaderboard/structures")
async def leaderboard_structures():
    rows = list(STORE["leaderboard"].values())
    rows.sort(key=lambda x: x.get("structures", 0), reverse=True)
    return rows[:20]


@api_router.get("/leaderboard/blocpose")
async def leaderboard_blocpose():
    rows = list(STORE["leaderboard"].values())
    rows.sort(key=lambda x: x.get("blocpose", 0), reverse=True)
    return rows[:20]


@api_router.get("/vote/sites")
async def vote_sites():
    sites = list(STORE["vote_sites"])
    sites.sort(key=lambda x: x.get("order", 999))
    return sites


# ---------------- Endpoints plugin (écriture, clé API requise) ----------------
@api_router.post("/server/status")
async def update_server_status(data: ServerStatusIn, _: bool = None, x_api_key: Optional[str] = Header(None)):
    require_plugin_key(x_api_key)
    STORE["server_state"] = {**data.model_dump(), "updated_at": now_iso()}
    touch_push()
    return {"ok": True}


@api_router.post("/market/structures")
async def upsert_structure(data: StructureUpdateIn, x_api_key: Optional[str] = Header(None)):
    require_plugin_key(x_api_key)
    now = now_iso()
    existing = STORE["structures"].get(data.name)
    history = existing.get("history", []) if existing else []
    history = history + [{"t": now, "price": data.price}]
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
    STORE["structures"][data.name] = doc
    touch_push()
    return doc


@api_router.post("/leaderboard")
async def upsert_leaderboard(data: LeaderboardEntryIn, x_api_key: Optional[str] = Header(None)):
    require_plugin_key(x_api_key)
    doc = {**data.model_dump(), "updated_at": now_iso()}
    STORE["leaderboard"][data.username] = doc
    touch_push()
    return doc


@api_router.post("/vote/sites")
async def replace_vote_sites(sites: List[VoteSiteIn], x_api_key: Optional[str] = Header(None)):
    """Le plugin pousse la liste COMPLETE des sites de vote (depuis son config.yml).
    Une seule source de vérité : le serveur Minecraft."""
    require_plugin_key(x_api_key)
    STORE["vote_sites"] = [s.model_dump() for s in sites]
    touch_push()
    return {"ok": True, "count": len(STORE["vote_sites"])}


# ---------------- Mount ----------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'https://www.farm-land.fr,https://farm-land.fr').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
