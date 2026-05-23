# 🚀 Deploy Test Project

A full-stack test application for validating one-click deployment workflows.

## Stack

| Layer      | Tech                     |
|------------|--------------------------|
| Frontend   | React + Vite (→ Vercel)  |
| Backend    | FastAPI + Uvicorn        |
| Database   | PostgreSQL 16            |
| Container  | Docker Compose           |

## Quick Start (Local)

### 1. Spin up with Docker Compose

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **FastAPI** on `localhost:8000`

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `localhost:5173` and proxies API calls to `:8000`.

### 3. Verify

- Frontend: [http://localhost:5173](http://localhost:5173)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

## API Endpoints

| Method   | Path             | Description        |
|----------|------------------|--------------------|
| `GET`    | `/`              | Status check       |
| `GET`    | `/health`        | DB health check    |
| `GET`    | `/items`         | List all items     |
| `POST`   | `/items`         | Create an item     |
| `GET`    | `/items/{id}`    | Get single item    |
| `PUT`    | `/items/{id}`    | Update item        |
| `DELETE` | `/items/{id}`    | Delete item        |

## Environment Variables

### Backend (`backend/.env`)

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:8000
```

## Deployment

- **Frontend** → Deploy `frontend/` to Vercel  
- **Backend** → Deploy `backend/` to Railway / Render / Fly.io  
- **Database** → Use managed PostgreSQL (Supabase / Neon / Railway)
