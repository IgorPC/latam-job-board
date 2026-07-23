<p align="center">
  <img src="apps/web/public/LOGO_RENDER.png" alt="LATAM Job Board" width="360" />
</p>

<p align="center">
  A full-stack job aggregator for remote/relocation tech positions in Latin America — scraping
  19 sources daily, filtering by stack and LATAM candidate acceptance, with AI-assisted resume
  compatibility scoring.
</p>

---

## About the project

LATAM Job Board is a portfolio project built to showcase a production-style aggregation
pipeline, not just a static job list. Users set up a one-time profile (primary/secondary tech
stack, remote vs. relocation, LATAM country), and a scheduled scraper pulls from 19 different
sources — public JSON APIs, RSS feeds, HTML scraping, and aggregated ATS platforms (Greenhouse,
Lever, Ashby, Workable) — normalizing everything into one schema and scoring each job for
whether it explicitly accepts candidates from the configured country.

From any job's detail page, a user can upload their resume (PDF) and ask an LLM (DeepSeek) to
score how well it matches that specific posting — with a numeric score, strengths, gaps, and
concrete improvement suggestions, all stored so a full analysis history builds up per job.

The repo is a small monorepo with two apps: the **API** (NestJS) and the **web client** (React).

---

## Tech stack

Roughly in order of how central each piece is to the project:

| | Technology | Role |
|---|---|---|
| <img src="https://cdn.simpleicons.org/nestjs" width="20"/> | **NestJS** | Backend framework — scraping orchestration, REST API, WebSocket gateway |
| <img src="https://cdn.simpleicons.org/typescript" width="20"/> | **TypeScript** | End-to-end, used across both API and web client |
| <img src="https://cdn.simpleicons.org/react" width="20"/> | **React 18** | Web client UI |
| <img src="https://cdn.simpleicons.org/vite" width="20"/> | **Vite** | Build tooling for the React client |
| <img src="https://cdn.simpleicons.org/mysql" width="20"/> | **MySQL** | Primary datastore |
| <img src="https://cdn.simpleicons.org/typeorm" width="20"/> | **TypeORM** | ORM / entities, schema sync |
| <img src="https://cdn.simpleicons.org/socketdotio" width="20"/> | **Socket.IO** | Real-time scraping status/completion events (no client polling) |
| <img src="https://cdn.simpleicons.org/tailwindcss" width="20"/> | **Tailwind CSS v4** | Styling — CSS-first theme, no JS config file |
| <img src="https://cdn.simpleicons.org/deepseek" width="20"/> | **DeepSeek API** | LLM used for resume × job compatibility analysis |
| <img src="https://cdn.simpleicons.org/cheerio" width="20"/> | **Cheerio + Axios** | HTML scraping for sources without a public API |
| <img src="https://cdn.simpleicons.org/rss" width="20"/> | **rss-parser** | RSS-based sources |
| <img src="https://cdn.simpleicons.org/reacthookform" width="20"/> | **React Hook Form + Zod** | Setup wizard form state and validation |
| <img src="https://cdn.simpleicons.org/reactquery" width="20"/> | **TanStack Query** | Server-state cache/fetching on the client |
| <img src="https://cdn.simpleicons.org/docker" width="20"/> | **Docker Compose** | Local dev and production containers |
| <img src="https://cdn.simpleicons.org/nginx" width="20"/> | **Nginx** | Serves the built web client in production |
| <img src="https://cdn.simpleicons.org/traefikproxy" width="20"/> | **Traefik** | Reverse proxy + automatic TLS in production |

Frontend components are built on **Untitled UI React** (open-source, MIT) and
**react-aria-components**, with a couple of hand-adapted **reactbits.dev** pieces
(`CountUp`, `SpotlightCard`) for the AI analysis result view.

---

## Interesting concepts applied

- **19-source scraping pipeline, one shared schema** — public JSON APIs, RSS feeds, raw HTML
  scraping (Cheerio), and aggregated ATS platforms (Greenhouse/Lever/Ashby/Workable) are all
  normalized into the same `Job` shape, with niche sources (Laravel, JS, Web3 boards) toggled
  on automatically based on the user's configured stack.
- **Fire-and-forget scraping runs** — `POST /scraping/run` responds in ~100ms (`202 Accepted`)
  while the run continues server-side; a durable DB flag (survives restarts) plus a Socket.IO
  gateway push real-time status/completion to every connected client, so nothing has to poll.
- **Structured LATAM-acceptance detection over keyword guessing** — when a source exposes a
  schema.org `JobPosting` JSON-LD block with an `applicantLocationRequirements` allow-list, that
  ground truth takes priority over fuzzy text matching, which is kept only as a fallback for
  sources without structured data.
- **No default results** — the board shows zero jobs until the setup wizard is completed; there
  is no "show everything" fallback that would defeat the point of filtering by stack.
- **Salary plausibility validation** — extracted salary figures are checked against a sane
  numeric floor/ceiling before being displayed, so a stray number (team size, a year, a version)
  never gets rendered as if it were a salary.
- **AI resume matching, never cached** — every `POST /ai/analyze` call is a fresh DeepSeek
  request that inserts a new row; the same résumé/job pair can be re-analyzed as many times as
  wanted, and the full history stays queryable per job even after the résumé itself is deleted
  (the filename is denormalized at analysis time).
- **Feature flags enforced server-side, not just hidden in the UI** — both the AI feature
  (`DEEPSEEK_API_KEY`) and a read-only demo mode (`LOCK_EDIT`) are checked by NestJS guards on
  the actual routes; the frontend reflects the same flags to grey out buttons with an
  explanatory tooltip, but the backend is the real gate.
- **No authentication, by design** — this is a personal aggregator, not a multi-tenant SaaS: a
  single shared configuration row (`settings.id = 1`) drives the whole board.

---

## Backend structure (`apps/api`)

NestJS, one module per domain, each following the same internal shape (`entity/`, `dto/`,
`consts/endpoints.ts`, a thin repository wrapper, service, controller, module):

```
apps/api/src/
├── jobs/          GET /jobs — list, filter, paginate, source counts, detail view
├── settings/       GET/POST /settings — the one-time setup wizard (singleton row)
├── scraping/        Source orchestration, daily cron, manual trigger, WebSocket gateway
│   ├── sources/     19 sources (JSON API, RSS, HTML scraping, Greenhouse/Lever/Ashby/Workable)
│   ├── utils/       Relevance/recency/LATAM filters, stack/type/salary detectors
│   └── data/        Curated static snapshot for the "Remote Tech Companies" source
├── ai/              Resume upload + DeepSeek job-match analysis
│   ├── entity/       Resume, ResumeAnalysis
│   └── guards/       AiEnabledGuard (DEEPSEEK_API_KEY)
└── common/          Shared guards (LockEditGuard) and the throttler exception filter
```

---

## Frontend structure (`apps/web`)

Feature-based, not file-type-based — each feature owns its own components/hooks/services/types:

```
apps/web/src/
├── features/
│   ├── jobs/          Board, filters, pagination, job detail page
│   ├── settings/       Setup wizard, reconfigure flow
│   ├── scraping/        Countdown timer, manual trigger, realtime socket status
│   ├── sources/         Source carousel
│   ├── search/           Boolean/manual search link generator
│   └── ai/               Resumes modal, compatibility analysis, analysis history
├── components/         Global, reusable UI (Untitled UI base components, Modal, SpotlightCard, CountUp)
├── layouts/            Header, MainLayout
├── routes/              React Router config + the setup-required guard
├── config/              Axios client instance
└── styles/              Tailwind v4 entry point + theme tokens
```

---

## Environment variables

The API reads its configuration from two different `.env` files depending on how it's run —
same app, two execution paths:

- **`.env.example`** (project root) → copy to `.env`, used by `docker-compose.prod.yml`
  (production).
- **`apps/api/.env.example`** → copy to `apps/api/.env`, used by the local dev Docker Compose
  setup (`docker-compose.yml`) and when running the API directly with `npm run start:dev`.

### Database (MySQL)

| Variable | Required | Description |
|---|---|---|
| `MYSQL_DATABASE` | No (default `latam_job_board`) | Database name. |
| `MYSQL_USER` | No (default `latam`) | Database user. |
| `MYSQL_PASSWORD` | **Yes** (prod) | Database password. |
| `MYSQL_ROOT_PASSWORD` | **Yes** (prod) | MySQL root password, required by the official `mysql:8` image. |

### Server

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `3000`) | Port the NestJS API listens on. |
| `CORS_ORIGIN` | **Yes** | Comma-separated list of origins allowed to call the API — the deployed web app's URL. |

### Public URLs (production only)

| Variable | Required | Description |
|---|---|---|
| `APP_DOMAIN` | **Yes** | Bare hostname Traefik routes to this app (e.g. `latam-job-board.example.com`). |
| `APP_URL` | **Yes** | Full public URL of the app — feeds `CORS_ORIGIN`. |
| `VITE_API_URL` | No | API base URL baked into the web client at build time. Leave empty locally to use the `/api` proxy. |

### AI — DeepSeek API

| Variable | Required | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | No | API key from [platform.deepseek.com](https://platform.deepseek.com). Leave empty to disable the entire résumé/AI feature — every `/ai/*` route except `/ai/status` returns `503`. |
| `DEEPSEEK_MODEL` | No (default `deepseek-v4-flash`) | Which DeepSeek model to call. |

### Access control

| Variable | Required | Description |
|---|---|---|
| `LOCK_EDIT` | No (default `false`) | When `true`, turns the deployment read-only: reconfiguring the profile and adding/removing résumés are blocked with `403`, both in the UI and at the route level. Useful for a public demo. |

---

## Deployment

### Running locally

Requires Docker Desktop.

```bash
docker compose up
```

| Service | URL |
|---|---|
| Web client (React, Vite dev server) | http://localhost:5173 |
| API (NestJS) | http://localhost:3000 |
| MySQL | localhost:3306 |

The local `docker-compose.yml` doesn't read a `.env` file — every value is hardcoded for
convenience (throwaway MySQL credentials). `synchronize: true` in TypeORM creates the schema
automatically on first run. To exercise the AI feature locally, copy `apps/api/.env.example` to
`apps/api/.env` and fill in a real `DEEPSEEK_API_KEY`.

### Production deployment (Coolify + Traefik)

This project deploys as a single **Docker Compose** resource on [Coolify](https://coolify.io),
with Traefik handling TLS and routing.

**Prerequisites:** a VPS with Coolify installed, and a domain you control the DNS for.

**1. DNS** — point an `A` record for your app domain at the VPS's IP address.

**2. Create the resource** — in Coolify, create a new resource of type **Docker Compose**,
pointing at this repository, with **Compose file** set to `docker-compose.prod.yml`.

**3. Set environment variables** — copy every variable from the
[Environment variables](#environment-variables) section above into the resource's environment
panel, using your real values (`APP_DOMAIN`/`APP_URL` set to the domain from step 1).

**4. Deploy** — click **Deploy**. Traefik issues a TLS certificate automatically via Let's
Encrypt once DNS has propagated. The `web` service exposes port 80 internally only (`expose`,
not `ports`) — all public routing goes through Traefik. The web container is a two-stage build:
Vite produces a static bundle, which Nginx then serves.
