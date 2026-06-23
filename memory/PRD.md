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
  - Auth: `register`, `login`, `logout`, `me` (with role)
  - **Player Dashboard**: `GET /api/player/me`
  - **Plugin**: `POST /api/player/inventory`
  - **Admin Vote Sites**: GET/POST/PUT/DELETE `/api/admin/vote-sites[/{name}]`
- Frontend pages: Home, Marché, Classement, Vote, Login, Register, **Dashboard** (/dashboard), **AdminVotes** (/admin/votes)
- Navbar shows Dashboard link (auth) + ADMIN badge (admin)
- ProtectedRoute component (adminOnly support)
- Admin auto-promotion via env `ADMIN_USERNAME` (default "Admin")
- Seed MongoDB: 8 structures with 40-pt history, 10 leaderboard entries, 4 vote sites
- Polices: Outfit / Inter / JetBrains Mono / Silkscreen
- Tests: 100% iter1 + 100% iter2 (after fix of insert_one ObjectId bug)

## Backlog (P1/P2)
- P2: Forgot-password / change password
- P2: Détail d'une structure avec historique long (page dédiée)
- P2: Notifications temps réel (WebSocket) pour les variations de prix
- P2: Intégration discord webhook lors des gros mouvements de marché

## Plugin Integration (à faire côté plugin Minecraft)
Le plugin doit POSTer avec header `X-API-Key: <PLUGIN_API_KEY>`:
- `POST /api/server/status` body `{"online_players": N, "max_players": M, "version": "..."}`
- `POST /api/market/structures` body `{"name":"...","price":1234.5,"category":"...","icon":"..."}`
- `POST /api/leaderboard` body `{"username":"...","balance":1234.5,"structures":12}`
