# Life Portfolio

An interactive personal portfolio for Hemanth Naga Sai Chakka with cinematic multi-dimension navigation, a guestbook ("Leave a Trace"), and a downloadable ATS-friendly resume PDF.

## Run & Operate

- **Frontend**: `cd frontend && PORT=5000 HOST=0.0.0.0 BROWSER=none yarn start` (port 5000)
- **Backend**: `cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload` (port 8000)
- **Required secrets**: `MONGO_URL`, `DB_NAME`

## Stack

- **Frontend**: React 19, CRA + CRACO, Tailwind CSS, Framer Motion, React Router v7, shadcn/ui (Radix)
- **Backend**: FastAPI 0.110, Motor (async MongoDB), ReportLab (PDF), Python 3.12
- **Database**: MongoDB (external Atlas cluster via MONGO_URL)
- **Node**: v20, Yarn 1.22

## Where things live

- Frontend source: `frontend/src/`
- Pages: `frontend/src/pages/` (Gateway, Professional, Personal, Emotional, Recruiter, LayerZero)
- Components: `frontend/src/components/`
- Backend API: `backend/server.py`
- CRACO config: `frontend/craco.config.js`

## Architecture decisions

- Frontend calls backend via `REACT_APP_BACKEND_URL` env var (set to `http://localhost:8000` in dev)
- CRACO devServer configured with `allowedHosts: "all"` and `host: "0.0.0.0"` for Replit proxy compatibility
- Backend `.env` file removed — secrets are injected directly via Replit environment
- `emergentintegrations` removed from pip install (in requirements.txt but not used in code)
- Backend uses `host 0.0.0.0` so the workflow port detection works in Replit

## Product

- Multi-world cinematic portfolio with 6 "dimensions": Gateway, Professional, Personal, Emotional, Recruiter, Layer Zero
- "Leave a Trace" guestbook — visitors submit a single word stored in MongoDB
- Resume download endpoint generates an ATS-friendly PDF via ReportLab
- Custom cursor, noise overlay, and animated transitions between worlds

## User preferences

_Populate as you build_

## Gotchas

- `emergentintegrations==0.1.0` is in `requirements.txt` but not on PyPI and not used — skip it during install
- Backend `.env` must NOT be present (it would override Replit secrets with placeholder values)
- ajv v8 must be present in `frontend/node_modules` — npm install with `--legacy-peer-deps` if reinstalling

## Pointers

- [CRACO docs](https://craco.js.org/)
- [Motor (async MongoDB)](https://motor.readthedocs.io/)
