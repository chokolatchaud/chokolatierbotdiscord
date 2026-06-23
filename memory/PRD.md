# Farm & Build — PRD

## Problem Statement (original)
Site web pour un serveur Minecraft qui réinvente le freebuild avec des structures
définies par le joueur. Selon les courbes du marché, le joueur gagne de l'argent.
Affichage de l'IP du serveur `mine.farm-and.fr`. Page prête pour implémenter les votes.

## User Choices
- Site vitrine simple avec pages statiques
- Authentification: Pseudo Minecraft + mot de passe (JWT, cookie httpOnly)
- Marché alimenté par plugin Minecraft externe (codé par l'utilisateur)
- Pages: Accueil, Marché, Classement, Vote
- Style: Sombre / gaming

## Architecture
- **Frontend**: React 19 + react-router + Tailwind + shadcn/ui + Recharts
- **Backend**: FastAPI + Motor (MongoDB) + bcrypt + PyJWT
- **Auth**: cookie httpOnly `access_token` (7 jours, samesite=lax)
- **Plugin API**: endpoints protégés par header `X-API-Key` (env `PLUGIN_API_KEY`)

## Implemented (2026-02)
- Backend endpoints
  - `GET /api/server/status`, `POST` (plugin)
  - `GET /api/market/structures`, `GET /api/market/structures/{name}/history`, `POST` (plugin)
  - `GET /api/leaderboard`, `POST` (plugin)
  - `GET /api/vote/sites`
  - Auth: `register`, `login`, `logout`, `me`
- Frontend pages: Home (hero + IP copier), Marché (cards + courbes Recharts + search), Classement (podium + table), Vote (4 sites + bannière info), Login, Register
- Navbar + Footer + AuthContext
- Seed MongoDB: 8 structures avec historique 40 points, 10 entrées leaderboard, 4 sites de vote
- Polices: Outfit (titres), Inter (corps), JetBrains Mono (stats), Silkscreen (pixel accents)
- All testing passed (100% backend + frontend)

## Personas
- Joueur Minecraft (consulte le marché, vote, regarde son rang)
- Administrateur du serveur (configure sites de vote, branche le plugin sur API)

## Backlog (P0/P1/P2)
- P1: Dashboard joueur (solde personnel + portefeuille de structures)
- P1: Interface admin pour configurer les vraies URL de vote
- P2: Forgot-password / changement de mot de passe
- P2: Détail d'une structure avec historique long (page dédiée)
- P2: Notifications temps réel (WebSocket) pour les variations de prix
- P2: Intégration discord webhook lors des gros mouvements de marché

## Plugin Integration (à faire côté plugin Minecraft)
Le plugin doit POSTer avec header `X-API-Key: <PLUGIN_API_KEY>`:
- `POST /api/server/status` body `{"online_players": N, "max_players": M, "version": "..."}`
- `POST /api/market/structures` body `{"name":"...","price":1234.5,"category":"...","icon":"..."}`
- `POST /api/leaderboard` body `{"username":"...","balance":1234.5,"structures":12}`
