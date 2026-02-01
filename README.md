# MERN Live Polling System

A real-time live polling system built with **MongoDB, Express, React, Node.js**, **TypeScript**, and **Socket.IO**.

## Features
- Live polls with timers and real-time vote updates
- Student/Teacher roles with session-based access
- Chat + participants list with teacher kick control
- Poll history and resilience on refresh/late join
- Duplicate vote prevention + race condition handling

---

## ✅ Testing Checklist (Multi‑Tab)
Open 1 teacher tab + 2+ student tabs.

1. **Teacher creates poll** → All students see it instantly.
2. **Student votes** → Teacher sees live results.
3. **Refresh student tab** → State re-syncs (poll + timer + results).
4. **Late join student** → Gets current poll state.
5. **Kick student** → Student sees “kicked” screen.
6. **Chat** → Messages sync between all tabs.
7. **Double vote prevention** → Try voting twice; should be rejected.
8. **Timer ends** → Poll auto‑closes + final results broadcast.

---

## ⚙️ Local Setup

### Backend
```
cd backend
npm install
npm run dev
```

Create `.env` in backend:
```
MONGODB_URI=your_mongo_atlas_uri
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend
```
cd frontend
npm install
npm run dev
```

Create `.env` in frontend:
```
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Deployment

### 1) MongoDB Atlas
- Create a free cluster
- Add database user + whitelist IP (0.0.0.0/0 for testing)
- Copy the connection string

### 2) Backend (Render or Heroku)
**Render**
1. Create **Web Service** → connect GitHub repo
2. Root: `/backend`
3. Build: `npm install` | Start: `npm run start`
4. Add env vars:
   - `MONGODB_URI=...`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
   - `PORT=5000`

**Heroku**
1. Create app → set buildpacks for Node.js
2. `heroku config:set MONGODB_URI=... CLIENT_URL=https://your-vercel-app.vercel.app`
3. Deploy from GitHub or CLI

✅ Make sure backend uses **wss://** in production (Socket.IO will automatically upgrade when served over HTTPS).

### 3) Frontend (Vercel)
1. Import GitHub repo on Vercel
2. Root: `/frontend`
3. Set env:
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`
4. Deploy

---

## 🔒 CORS / Cross‑Origin
Backend reads `CLIENT_URL` (comma‑separated allowed origins). Example:
```
CLIENT_URL=http://localhost:5173,https://your-vercel-app.vercel.app
```

---

## UI Polish Notes
- Rounded cards + soft shadows
- Purple primary buttons (#A855F7)
- Red countdown timer chip
- Progress bars with % overlay

---

## Scripts
**Backend**
- `npm run dev` → ts-node + nodemon
- `npm run start` → production build

**Frontend**
- `npm run dev`
- `npm run build`

---

## Final Notes
- Socket events are centralized in backend handler
- Optimistic UI for vote (local preview, rollback on error)
- Strong race‑condition protection + single vote per student

If you want CI, tests, or Docker next — just say the word.
