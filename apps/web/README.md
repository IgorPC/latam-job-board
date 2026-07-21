# LATAM Job Board — Web

Frontend for the LATAM Job Board aggregator. A one-time setup wizard collects the user's stack and job-type preference, then the board lists scraped jobs with search, filters, and pagination — plus a couple of bonus touches (a source carousel and Google boolean-search shortcuts) inspired by `BUSINESS_MODEL.md`'s Dynamite Jobs-style brief.

> The resume-matching AI feature (DeepSeek) is documented in [`AI_INTEGRATION.md`](../../AI_INTEGRATION.md) but **is not part of this stage** — there's no upload UI or analysis modal in this codebase yet.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router 6 |
| Server state | TanStack Query (React Query) |
| Forms & validation | React Hook Form + Zod |
| Styling | Tailwind CSS |
| HTTP client | Axios |
| Realtime | Socket.IO client |

## Folder structure

```
src/
├── components/       # global, generic, reusable across features (Button, AuroraBackground, LoadingSpinner...)
├── config/           # axios client instance
├── layouts/          # MainLayout + Header (logo, countdown, "Reconfigure" link)
├── routes/           # AppRoutes — gates "/" behind settings.setupCompleted
├── styles/           # Tailwind entrypoint
├── utils/            # cn() class merger, isSafeUrl() href guard
└── features/
    ├── settings/     # setup wizard: TagInput, JobTypeSelector, Zod schema, useSettings/useSaveSettings
    ├── jobs/          # board: SearchBar, Filters, JobCard, JobList, Pagination, useJobs/useJobsFilters
    ├── scraping/      # CountdownTimer, ScanningBanner, useScrapingStatus/useTriggerScraping/useScrapingSocket
    ├── sources/       # SourceCarousel + metadata for the 19 backend scraping sources
    └── search/        # BooleanSearchLinks — Google site: search shortcuts per SCRAPING.md §13
```

Every feature keeps its own `components/`, `hooks/`, `services/`, `types/` — a component/hook only gets promoted to the global `src/components`/`src/hooks` once a second feature actually needs it.

## Pages & flow

| Route | Component | Shown when |
|---|---|---|
| `/setup` | `SetupPage` (`SetupWizard`) | Always reachable; the app redirects here automatically while `GET /settings` returns `setupCompleted: false` |
| `/` | `JobsBoardPage` (inside `MainLayout`) | `settings.setupCompleted === true` |

**Setup wizard** — a 4-step form (primary stack → secondary stack → job type → confirm) built with `useReducer` for step transitions and `react-hook-form` + `zod` for validation (1–2 primary skills required, 0–2 secondary, job type required). On confirm it calls `POST /settings` and then `POST /scraping/run?initialRun=true`. The trigger endpoint responds immediately (`202 Accepted`, fire-and-forget on the backend), so the wizard redirects to the board right away instead of blocking on the multi-minute scan.

**Board** — `GET /jobs` through `useJobs`, with filter state (`search`, `since`, `type`, `latam`, `page`) held in a `useReducer` (`useJobsFilters`) so changing any filter resets pagination in one place. Search is debounced client-side before hitting the query. A `ScanningBanner` shows above the list whenever `scraping-status`'s `isRunning` is true (initial setup or the 9am cron), so the (empty, until configured) board never looks broken while the first scan is still running.

**Realtime updates** — `useScrapingSocket` (mounted once in `App.tsx`) opens a Socket.IO connection and listens for two events broadcast by the API: `scraping:status` (patches the cached `isRunning` flag directly) and `scraping:completed` (invalidates the `jobs` and `scraping-status` queries so the board refetches with the freshly scraped results). No polling is needed to detect completion — `GET /scraping/status`'s `isRunning` field is only used to hydrate state on first load or after a page reload mid-scan.

**Countdown** — `useScrapingStatus` polls `GET /scraping/status` every 60s as a fallback; `useCountdown` ticks a local `setInterval` against the returned `nextRunAt` to render the `HH:MM:SS` in the header. While a scan is running, the header shows "Scanning now…" instead of the countdown.

## Bonus features

- **Source carousel** — an infinite marquee of stylized badges (gradient monogram + name) for all 19 scraping sources the API aggregates from (`features/sources/constants/sources.ts`), pausing on hover.
- **Boolean search links** — generates pre-filled Google `site:` searches (Lever, Greenhouse, Ashby, Loxo, LinkedIn, Wellfound, Indeed, Glassdoor) from the user's stack, ported from the generator documented in `SCRAPING.md` §13, for ATS platforms the scraper doesn't cover directly.

## Environment variables

See [`.env.example`](.env.example).

```bash
# Dev: hits the API directly (matches docker-compose.yml's CORS_ORIGIN allow-list)
VITE_API_URL=http://localhost:3000
```

In production this is left empty (see root `.env.example`) — the app then calls relative `/api/*`, which the nginx container proxies to the `api` service (see `nginx.conf`), stripping the `/api` prefix so it reaches the backend's actual routes (`/jobs`, `/settings`, ...).

## Running locally

Via Docker (recommended — brings up API + MySQL + Web together):

```bash
docker compose up
```

Without Docker (needs the API reachable at `VITE_API_URL`):

```bash
npm install
npm run dev
```

## Implementation notes

- **No `dangerouslySetInnerHTML` anywhere** — all job data (title, company, stack) renders as plain JSX text, which React escapes by default.
- **`isSafeUrl()`** gates every job's `url` before it's bound to an `<a href>` — only `http:`/`https:` are allowed, since the value comes from scraped, unsanitized third-party data.
- **No authentication, no admin panel** — matches the API's single-user, wizard-configured design (`settings.id = 1`).
- **Server state never lives in `useState`** — every network-backed value (`jobs`, `settings`, `scraping status`) goes through TanStack Query; only ephemeral UI state (form step, filter draft, countdown tick) uses `useState`/`useReducer`.
