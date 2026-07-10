# Invenger Visitor Management System

Enterprise-grade visitor management platform built with Next.js 16, PostgreSQL, Prisma, and JWT authentication.

## Project Structure

```
├── app/                    # Next.js App Router (routes + API entry points)
│   ├── api/                # REST API route handlers
│   ├── (protected)/        # Authenticated pages
│   └── login/              # Public login page
├── backend/                # Server-side logic (data, auth, services)
│   ├── prisma/             # Database schema, migrations, seed
│   ├── services/           # Business logic layer
│   ├── lib/                # Auth, Prisma client, API utilities
│   ├── middleware/         # Auth helpers for route middleware
│   ├── types/              # Shared TypeScript interfaces
│   └── utils/              # Validation, helpers
├── frontend/               # UI layer (components, features, hooks)
│   ├── components/         # Reusable UI + layout components
│   ├── features/           # Feature-specific UI modules
│   └── hooks/              # Custom React hooks
├── middleware.ts           # Next.js route protection
└── public/                 # Static assets
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Update `DATABASE_URL` and `JWT_SECRET` in `.env`.

### 3. Start database and apply schema

```bash
npx prisma dev -d
npx prisma db push
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Default Admin Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@invenger.local` |
| Password | `Admin@123`            |

## Available Scripts

| Script            | Description                    |
|-------------------|--------------------------------|
| `npm run dev`     | Start development server       |
| `npm run build`   | Generate Prisma client + build |
| `npm run db:push` | Push schema to database        |
| `npm run db:seed` | Seed default admin user        |
| `npm run db:studio` | Open Prisma Studio         |

## Development Phases

### Phase 1 (Complete)
- Authentication, layout, dashboard, database foundation

### Phase 2 (In Progress)
- Visitor model, validation, service layer
- Visitor CRUD APIs, registration, list, edit, checkout (upcoming)

## Important Notes

- Do **not** run `npm audit fix --force` — it downgrades Next.js and breaks the project.
- Start Prisma Dev (`npx prisma dev -d`) before running the app if using the local dev database.
