# Knowledge Base API

Simple knowledge base backend with topics (tree + versioning), resources, and authentication with RBAC. Built with **Node.js + TypeScript + Express**, in-memory **LokiJS** for storage, **JWT** for auth, **Zod** for input validation, and **Jest** for tests. OpenAPI/Swagger docs available.

## Quick start

```bash
# 1) Install
npm ci

# 2) Dev
export JWT_SECRET=change_me
npm run dev

# 3) Prod build + run
npm run build
export JWT_SECRET=change_me
npm start
```

- API base: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`

> The app fails fast if `JWT_SECRET` is missing.

## Environment variables

You can use a `.env` or `.env.local` (and `.env.test` for tests):

```
# required
JWT_SECRET=change_me

# optional
PORT=3000
```

## Auth & Roles

- JWT Bearer auth on protected routes: `Authorization: Bearer <token>`
- Roles: `Admin`, `Editor`, `Viewer`
- Dev seeding (creates default users): `POST /auth/seed-defaults`
  - `admin@example.com / password` (Admin)
  - `editor@example.com / password` (Editor)
  - `viewer@example.com / password` (Viewer)

### Login example

```bash
curl -s -X POST http://localhost:3000/auth/login   -H 'Content-Type: application/json'   -d '{"email":"admin@example.com","password":"password"}'
```

Response includes a `token` field.

## Endpoints (high level)

- `POST /topics` — create topic (RBAC)
- `GET /topics/:id` — read topic (RBAC)
- `PATCH /topics/:id` — update (creates new immutable version) (RBAC)
- `DELETE /topics/:id` — soft delete (RBAC)
- `GET /topics/:id/versions` — list versions
- `GET /topics/:id/tree?version=latest&includeResources=true|false` — tree
- `POST /resources` / `GET /resources` / `PATCH /resources/:id` / `DELETE /resources/:id` — resources per topic
- `POST /auth/seed-defaults` — dev only
- `POST /auth/login` — JWT login

See **Swagger** for full schemas/params.

## Swagger / OpenAPI

- Swagger UI: `GET /docs`
- OpenAPI JSON: `GET /docs.json`

## Data model (in-memory)

- **Topic**: parent/child (tree), soft delete via `deletedAt`
- **TopicVersion**: immutable snapshots (`name`, `content`, `version` monotonic per topic)
- **Resource**: belongs to a topic, soft delete
- **User**: name, email (normalized to lowercase with TLD validation), role, `passwordHash` (bcrypt)

---

## Tests

### TL;DR

```bash
# set a test secret
export JWT_SECRET=test_secret

# run all tests
npm test

# run with coverage
npm test -- --coverage

# watch mode
npm run test:watch

# run a single file
npm test -- src/tests/integration/topics.int.test.ts

# run a single test by name
npm test -- -t "builds correct tree structure"
```

### What’s covered

- **Integration tests** (Express app via Supertest, no real network):
  - **Auth & RBAC**: login, protected routes, role checks
  - **Topics**: CRUD, sibling-name uniqueness, soft delete
  - **Tree**: `GET /topics/:id/tree` with `version=latest|<number>`, `includeResources`
  - **Versioning**: `GET /topics/:id/versions`, version increments on updates
  - **Resources**: CRUD and listing by topic, tree includes resources when requested
  - **Shortest Path** (if enabled): BFS parent/child traversal

- **Unit tests** (pure functions/services):
  - `TopicVersionFactory` (stable `createdAt`, monotonic versioning)
  - `AuthService` email normalization & password check (bcrypt)
  - (And other small services/helpers if present)

> Tests validate that emails include a **TLD** and are normalized to lowercase.  
> Seeding helpers in tests create the default users when needed.

### Test environment

- Uses **Jest** (TS via ts-jest or transpiled JS depending on your setup).
- In-memory **LokiJS** database — tests are self-contained and reset between runs.
- Requires `JWT_SECRET` in the environment (use `.env.test` or export before running).

Example `.env.test`:

```
JWT_SECRET=test_secret
PORT=0
```

Then:

```bash
# Uses .env.test if your test runner loads it (or export manually as above)
npm test
```

### Running tests against a live dev server (optional)

If you want to exercise endpoints manually while the dev server is running:

```bash
# 1) Start server (in another terminal)
export JWT_SECRET=change_me
npm run dev

# 2) Seed defaults (dev only)
curl -s -X POST http://localhost:3000/auth/seed-defaults -H 'Content-Type: application/json' -d '{}'

# 3) Login as viewer
viewer_token=$(curl -s -X POST http://localhost:3000/auth/login   -H 'Content-Type: application/json'   -d '{"email":"viewer@example.com","password":"password"}' | jq -r .token)

# 4) Create a root topic
root=$(curl -s -X POST http://localhost:3000/topics   -H "Authorization: Bearer $viewer_token"   -H 'Content-Type: application/json'   -d '{"name":"RootT","content":"T","parentId":null}')

echo "$root"
```

> Note: RBAC is enforced; use the appropriate role for each action in your scripts.

---

## Docker

**Runtime image (no devDependencies):**

```dockerfile
# ---- builder ----
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Build & run:

```bash
docker build -t knowledge-base-api .
docker run -p 3000:3000 -e JWT_SECRET=change_me knowledge-base-api
```

> If you want to run Jest **inside Docker**, run it in the **builder** stage (where devDependencies are installed).

---

## Project scripts

- `npm run dev` — start in watch mode
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled server
- `npm test` — run tests
- `npm run test:watch` — jest watch (if defined)
- `npm run lint` — lint (if configured)

---

## Notes

- This is an in-memory API for assessment/demo. For production, swap LokiJS with a real database and persist resources accordingly.
- `POST /auth/seed-defaults` is **dev-only**; remove or guard it in production.
