# Invenger Visitor Management System

Enterprise visitor management platform built with Next.js 16, PostgreSQL, Prisma, and JWT authentication.

## Architecture

```text
Request → app/api (thin route) → controllers → services → repositories → Prisma
```

```text
invenger-vms/
├── prisma/                      # Schema, migrations, seed
├── storage/                     # Persistent uploads (Docker volume)
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login / password flows
│   │   ├── (dashboard)/         # Authenticated pages
│   │   └── api/                 # Thin HTTP entry points
│   ├── components/              # Shared UI (ui, layout, common, forms, tables)
│   ├── features/                # Feature modules (UI + feature schemas/types)
│   ├── server/
│   │   ├── controllers/         # HTTP orchestration (auth, audit, notify)
│   │   ├── services/            # Business rules
│   │   ├── repositories/        # Data access
│   │   ├── auth/ validation/ prisma/ middleware/ mail/
│   │   └── api/                 # Response helpers, requireAuth, errors
│   ├── lib/ hooks/ types/ config/ utils/
│   └── middleware.ts
├── public/
├── docs/ scripts/ deploy/
├── Dockerfile
└── docker-compose.yml
```

### Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| `app/api` | Parse nothing beyond wiring; call controller; map errors |
| `controllers` | Authz, validation parse, call services, side effects (audit/notify/cookies) |
| `services` | Business rules, policies, photo handling, orchestration across repos |
| `repositories` | Prisma queries only |

### Feature folders

Each feature can grow into:

```text
features/visitors/
  components/
  hooks/
  schemas/     # re-exports server validation for forms
  types/
  constants/
  utils/
  lib/         # client API helpers
```

## Getting started

```bash
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, and seed admin credentials
npx prisma generate
npx prisma migrate deploy   # or npm run db:push
npm run db:seed
npm run dev
```

Admin login is created by the seed script using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` from your local `.env` (never commit real credentials).

## Docker (Linux VPS)

```bash
docker compose up -d --build
```

Photos persist in the `visitor_storage` volume mounted at `/app/storage`.
