# LATAM Job Board — API

Backend for an aggregator of remote/relocation jobs for tech professionals in Latin America. It scrapes multiple sources automatically, filters by relevance and by LATAM candidate acceptance, and exposes the results over REST.

> The resume-matching AI feature (DeepSeek) is documented in [`AI_INTEGRATION.md`](../../AI_INTEGRATION.md) but **is not part of this stage** — not implemented in this codebase yet.

## Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10 (Node.js) |
| Language | TypeScript |
| Database | MySQL 8 |
| ORM | TypeORM |
| Scheduling | `@nestjs/schedule` — daily cron at 9am |
| HTML scraping | Cheerio + Axios |
| RSS parsing | rss-parser |
| Dates | dayjs |
| Validation | class-validator / class-transformer |
| Rate limiting | `@nestjs/throttler` (in-memory, no Redis) |

## Modules

```
src/
├── jobs/          # GET /jobs — read, filter, paginate
├── settings/       # GET/POST /settings — configuration wizard (singleton, id=1)
├── scraping/        # Source orchestration, daily cron, manual trigger endpoint
│   ├── sources/     # 19 sources (JSON API, RSS, HTML scraping, Greenhouse/Lever/Ashby/Workable)
│   ├── utils/       # filters (isRelevant/isRecent/acceptsLatam), detectors (stack/type/salary), date-parser, rate-limiter
│   └── data/        # remote-companies.json — curated static snapshot (see note below)
└── common/          # throttler exception filter
```

Every module follows: `entity/`, `dto/`, `consts/endpoints.ts`, `<module>.repository.ts` (repository wrapper — never `@InjectRepository` directly in the service), `<module>.service.ts`, `<module>.controller.ts`, `<module>.module.ts`.

## Routes

### Jobs

| Method | Route | Description |
|---|---|---|
| `GET` | `/jobs` | List jobs with filters and pagination |

Query params: `search`, `since` (`24h`/`3d`/`7d`/`all`), `type` (`remote`/`relocation`/`both`), `latam` (`yes`/`no`/`maybe`), `page`, `limit`, `sort` (`recent`).

Stored `type` values: `Remote`, `Relocation`, `Remote / Relocation`, `Onsite`. Stored `acceptsLatam` values: `Yes`, `No`, `Maybe`.

### Settings

| Method | Route | Description |
|---|---|---|
| `GET` | `/settings` | Returns current configuration (or "not configured" state if the wizard never ran) |
| `POST` | `/settings` | Saves `primaryStack` (1–2), `secondaryStack` (0–2) and `jobType`, marks `setupCompleted = true` |

### Scraping

| Method | Route | Description |
|---|---|---|
| `POST` | `/scraping/run?initialRun=true` | Triggers scraping manually. `initialRun=true` covers the last 15 days (wizard's initial search); without the parameter, it covers 24h (same behavior as the cron) |
| `GET` | `/scraping/status` | Returns `lastSyncAt` and `nextRunAt` (next 9am) for the frontend countdown |

Automatic daily cron at 9am (`@Cron('0 9 * * *')`) runs the same flow as `POST /scraping/run` without `initialRun`.

## Scraping sources (19)

Public JSON APIs: Remote OK, Arbeitnow, Working Nomads, Himalayas, Jobicy.
RSS: We Work Remotely, LaraJobs, JS Remotely, Crypto Jobs List.
HTML scraping: Jobgether, Relocate.me, Dynamite Jobs, Dice (`__NEXT_DATA__`), VisaJobs.xyz, LaravelRemotely, Strider, FitNext (Loxo ATS).
Aggregated ATS: Relocation Companies (Greenhouse + Lever via the README of `AndrewStetsenko/tech-jobs-with-relocation`), Remote Tech Companies (Lever/Greenhouse/Ashby/Workable from the `scraping/data/remote-companies.json` snapshot).

Niche sources (Laravel, JS, Web3) are activated automatically based on the user's `primaryStack`/`secondaryStack` — see `NICHE_SOURCE_RULES` in `scraping/consts/scraping.consts.ts`.

> **About `remote-companies.json`:** a static snapshot (21 companies) curated from the `remoteintech/remote-jobs` repository, containing only companies with an ATS detectable from their `careers_url` (Lever, Greenhouse, Ashby, Workable). It's read directly by `remote-tech-companies.source.ts` — no fetch to GitHub happens at runtime. To refresh it, manually repeat the process described in `SCRAPING.md` §14 and replace the file.

## Environment variables

See [`.env.example`](.env.example). Summary:

```bash
MYSQL_HOST=db
MYSQL_PORT=3306
MYSQL_USER=latam
MYSQL_PASSWORD=
MYSQL_DATABASE=latam_job_board

PORT=3000
CORS_ORIGIN=http://localhost:5173

# Reserved for the next stage (AI resume analysis) — unused so far
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-flash
```

## Running locally

Via Docker (recommended — brings up API + MySQL together):

```bash
docker compose up
```

Without Docker (needs a reachable MySQL):

```bash
npm install
npm run start:dev
```

## Implementation notes

- **No authentication** — public job board, single configuration via wizard (`settings.id = 1`), per `BUSINESS_MODEL.md`.
- **No Redis** — rate limiting uses `@nestjs/throttler`'s in-memory storage, sufficient for a single instance.
- **`isRelevant()`** was simplified relative to the pseudo-code in `SCRAPING.md` (which referenced a `profile.roleContext` never defined anywhere else in the documentation): here, a job is relevant if its text contains any term from `primaryStack` **or** `secondaryStack`.
- **`synchronize: true`** in TypeORM is acceptable at this stage (dev/portfolio) — production should migrate to versioned migrations.
- **Domain values in English:** `type` and `acceptsLatam` are stored in English (`Remote`/`Relocation`/`Onsite`, `Yes`/`No`/`Maybe`) even though the original planning docs (`SCRAPING.md`/`BUSINESS_MODEL.md`) used Portuguese labels — those docs are kept as historical reference and were not updated to match.
