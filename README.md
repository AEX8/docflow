```
  ██████╗   ██████╗   ██████╗    ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔══██╗ ██╔═══██╗ ██╔════╝    ██╔════╝██║     ██╔═══██╗██║    ██║
  ██║  ██║ ██║   ██║ ██║         █████╗  ██║     ██║   ██║██║ █╗ ██║
  ██║  ██║ ██║   ██║ ██║         ██╔══╝  ██║     ██║   ██║██║███╗██║
  ██████╔╝ ╚██████╔╝ ╚██████╗    ██║     ███████╗╚██████╔╝╚███╔███╔╝
  ╚═════╝   ╚═════╝   ╚═════╝    ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝

  document intelligence pipeline
  ─────────────────────────────────────────────────────────────────
  fastapi · react · typescript · postgresql · aws s3 · anthropic claude
```

# DocFlow

A configurable document intelligence pipeline that extracts structured data from any document using LLMs — built end-to-end with a typed React frontend, a FastAPI backend, and a production AWS deployment.

> Upload a document, define what you want extracted, and get clean structured JSON back — no matter whether it's an invoice, a medical referral, a contract, or a shipping manifest.

<!-- ![DocFlow dashboard](./docs/screenshot-dashboard.png) -->

---

## Why DocFlow

Most document extraction tools are built for one document type. DocFlow flips that — instead of hardcoding what to extract, users define a **schema** (a list of fields, types, and descriptions), and the system uses Claude to extract exactly those fields from any uploaded document. The same engine works for an invoice today and a medical form tomorrow, with zero code changes.

---

## Live Demo

<!-- Add once redeplyed -->
🔗 **[Live app]** 

```
Demo login:
email:    demo@docflow.app
password: demo1234
```

---

## Architecture


```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   React +   │──────▶   FastAPI    │──────▶   PostgreSQL    │
│  TypeScript │ HTTP │   Backend    │ ORM  │   (AWS RDS)     │
│  (Nginx)    │◀─────│              │◀─────│                 │
└─────────────┘      └──────-───────┘      └─────────────────┘
                             │
                 ┌───────────┼───────────┐
                 ▼                       ▼
         ┌───────────────┐      ┌───────────────┐
         │    AWS S3     │      │  Anthropic    │
         │ (file storage)│      │  Claude API   │
         └───────────────┘      └───────────────┘
```



**Request flow for an extraction:**

1. User uploads a document → stored in S3, pointer saved in Postgres
2. User defines or selects a schema (field names, types, descriptions)
3. User triggers extraction → backend fetches the file from S3
4. File + schema-derived prompt sent to Claude API
5. Claude returns structured JSON matching the schema
6. Result validated and persisted to Postgres
7. Frontend displays the structured result

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, TailwindCSS, React Router, React Query, Axios |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL + pgvector (Docker locally, AWS RDS in production) |
| Auth | JWT (python-jose), bcrypt password hashing, role-based access control |
| File storage | AWS S3 (boto3), presigned URLs for secure access |
| AI / LLM | Anthropic Claude API — document understanding + structured extraction |
| Infrastructure | Docker, Docker Compose, AWS EC2, Nginx (reverse proxy + static serving) |
| Tooling | GitHub Actions CI, pytest, Vitest |

---

## Key Features

- **Configurable extraction schemas** — define any set of fields (name, type, description, required/optional) and reuse them across documents
- **JWT authentication** with role-based access (admin / user) and per-user data isolation
- **Secure file handling** — private S3 storage, presigned URLs for temporary access, file type and size validation
- **Confidence scoring** — every extraction reports what percentage of requested fields were successfully found
- **Fully typed frontend** — migrated from JavaScript to TypeScript, with types mirroring the backend's Pydantic schemas end-to-end
- **Containerised throughout** — identical Docker setup for local development and production deployment

---

## Local Setup

**Prerequisites:** Docker Desktop, an Anthropic API key, an AWS account (S3 bucket + IAM user)

```bash
# Clone the repo
git clone https://github.com/AEX8/docflow.git
cd docflow

# Set up environment variables
cp .env.example .env
# fill in your AWS credentials, Anthropic API key, and a SECRET_KEY

# Start everything — Postgres, FastAPI backend, React frontend
docker compose up --build
```

Once running:
- Frontend → [http://localhost:5173](http://localhost:5173)
- Backend API docs (Swagger) → [http://localhost:8000/docs](http://localhost:8000/docs)

Run database migrations (first time only):

```bash
docker compose exec backend alembic upgrade head
```

---

## Project Structure

```
docflow/
├── backend/
│   ├── app/
│   │   ├── api/          # route handlers (auth, documents, schemas, extraction)
│   │   ├── core/         # config, database session, security, dependencies
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # S3 and LLM extraction business logic
│   ├── alembic/          # database migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/          # typed API client functions
│   │   ├── components/   # shared UI (Navbar, Layout)
│   │   ├── pages/        # route-level pages
│   │   └── types/        # shared TypeScript interfaces
│   └── Dockerfile.prod   # multi-stage build → static files served by Nginx
├── docker-compose.yml       # local development
└── docker-compose.prod.yml  # production (EC2 + RDS)
```

---

## Engineering Notes

A few decisions worth highlighting:

- **Service layer separation** — route handlers stay thin; S3 and LLM logic live in `services/`, making the LLM provider swappable without touching API code
- **Pointer pattern for file storage** — documents are never stored in the database, only an S3 key reference, keeping Postgres lean
- **Prompt engineering for structured output** — the extraction prompt enforces JSON-only output, ISO 8601 dates, and numeric (not string) amounts, directly reducing post-processing work
- **TypeScript migration** — the frontend was built first in JavaScript, then fully migrated to TypeScript on a separate branch (`typescript-migration`) once the feature set stabilised, with types inferred end-to-end from the API layer down to component props

---


## License

MIT
