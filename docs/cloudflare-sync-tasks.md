# Cloudflare Sync Implementation Tasks (Option B - Login + Cookie + GitHub Sync)

This document defines the tasks required to implement secure, owner-only editing of games with automatic synchronization to both Cloudflare KV and GitHub `static/games.json`.

The implementation must:

- Use Cloudflare Pages + Functions/Workers.
- Use a secure login endpoint and HttpOnly session cookie (Option B).
- Store canonical game data in Cloudflare KV.
- On each successful save:
  - Update KV.
  - Update `static/games.json` in the GitHub repo via GitHub API (all-or-nothing).
- Keep the public UX unchanged for read-only users.

---

## Phase 0 – Prerequisites

- [x] Confirm Cloudflare Pages project is connected to the `gaming-tracker` GitHub repo.
- [x] Enable Cloudflare Functions/Workers for the Pages project.
- [x] Decide production domain for cookie scope (e.g. `gaming-tracker.pages.dev` or custom domain).
- [x] Choose Cloudflare KV for storing the canonical games JSON.
- [x] Confirm `static/games.json` is the authoritative file to sync with GitHub.

---

## Phase 1 – Cloudflare Environment and Secrets

Configure the following for the Pages/Worker environment:

- [x] Create KV namespace for games data:
  - Name suggestion: `GAMES_KV`
- [x] Bind KV namespace to the Worker/Functions as `GAMES_KV`.

Add secrets / variables:

- [x] `SESSION_SECRET`
- [x] `EDITOR_USERNAME`
- [x] `EDITOR_PASSWORD` or `EDITOR_PASSWORD_HASH`
- [x] `GITHUB_TOKEN`
- [x] `GH_REPO_OWNER` = `joaocastilho`
- [x] `GH_REPO_NAME` = `gaming-tracker`
- [x] `GH_FILE_PATH` = `static/games.json`
- [x] `GH_BRANCH` = `main`

---

## Phase 2 – Worker API Implementation

Implement Cloudflare Functions/Worker under e.g. `/api/*`.

### 2.1 Shared Types and Validation

- [x] Reuse or mirror the existing `Game` type and Zod schema from the app.
- [x] Create a validation module for:
  - [x] `games` array shape.
  - [x] Planned vs Completed field rules.
  - [x] Score calculation constraints.

### 2.2 Session Utilities

- [x] Implement secure session token handling using `SESSION_SECRET`:
  - [x] Login issues signed `gt_session` cookie (HMAC-SHA256, HttpOnly, Secure, SameSite=Lax, ~12h).
  - [x] Worker verifies `gt_session` on protected endpoints using the same secret.

### 2.3 Login Endpoint – `POST /api/login`

- [x] Accept JSON body: `{ "username": string, "password": string }`.
- [x] Verify against `EDITOR_USERNAME` and `EDITOR_PASSWORD`.
- [x] On failure:
  - [x] Return `401` with generic message.
- [x] On success:
  - [x] Create signed session token.
  - [x] Set cookie `gt_session` with:
    - HttpOnly, Secure, SameSite=Lax, Path=/.
  - [x] Return `200 { "ok": true }`.

### 2.4 Read Endpoint – `GET /api/games`

- [x] Try `GAMES_KV.get("games")`:
  - [x] If present:
    - [x] Parse JSON.
    - [x] Return `200` with `{ games, meta }`.
- [x] If not present:
  - [x] Return 404 with a clear message so client can fall back to static `games.json`.

(Explicit KV bootstrap from static file can be added later if desired.)

### 2.5 Write Endpoint – `POST /api/games` (Full Replace)

- [x] Require valid session:
  - [x] Validate `gt_session`; if missing/invalid → `401`.
- [x] Accept JSON body: `{ "games": Game[], "meta"?: {...} }`.
- [x] Validation:
  - [x] Use shared Zod `GamesPayloadSchema` from `src/lib/validation/game.ts`:
    - [x] Enforce structural shape of `Game`.
    - [x] Enforce Planned vs Completed rules.
    - [x] Validate score constraints.
- [x] If validation fails → `400` with issues.
- [x] If validation passes:
  - [x] Recompute score for completed games using shared `computeScore`.
  - [x] Prepare `nextData = { games: normalizedGames, meta: { lastUpdated: now, ... } }`.
  - [x] Call `syncGamesToGitHub(nextData)` (Phase 2.6).
  - [x] If GitHub sync succeeds:
    - [x] Write `nextData` to KV as key `games`.
    - [x] Return `200 { "ok": true, "meta": nextData.meta }`.
  - [x] If GitHub sync fails:
    - [x] Do NOT update KV.
    - [x] Return `500` with error (all-or-nothing).

### 2.6 GitHub Sync Helper – `syncGamesToGitHub`

- [x] Read repo config from env (`GH_*`).
- [x] Fetch current file:
  - [x] `GET /repos/{owner}/{repo}/contents/{path}?ref={branch}`.
  - [x] Decode `content` from Base64, get `sha`.
- [x] Compare:
  - [x] If existing content equals new JSON:
    - [x] Return success (no-op).
- [x] Update:
  - [x] `PUT /repos/{owner}/{repo}/contents/{path}` with:
    - message: `chore(data): update games.json via cloudflare editor`
    - content: base64-encoded new JSON
    - sha: previous sha
    - branch: `GH_BRANCH`
- [x] Handle errors:
  - [x] If any GitHub error:
    - [x] Throw/fail so `POST /api/games` can return `500` and avoid KV divergence.

---

## Phase 3 – Frontend: Use Dynamic Data Source

- [x] P3.1: Update root data-loading logic (e.g. `src/routes/+layout.ts` or `+page.ts`) to:
  - [x] Prefer fetching `/api/games` on load.
  - [x] On success, normalize and populate the shared games store from the response.
  - [x] On 404/failed fetch, fall back to bundled `static/games.json`.
- [x] P3.2: Ensure all views (Games, Completed, Planned, Tierlist) read from the shared store instead of importing `static/games.json` directly.
- [x] P3.3: Preserve existing UX (filters, sorting, modals, navigation) using the dynamic source transparently.

---

## Phase 4 – Frontend: Owner-Only Editor Mode (With Login)

### 4.1 Editor State

- [x] Add `editorMode` boolean to a global store that:
  - [x] Is toggled on successful login.
  - [x] Resets on logout/expiry (follow-up task).

### 4.2 Login UI

- [x] Add a discreet login trigger (e.g. icon in header).
- [x] Implement login modal:
  - [x] Submits to `POST /api/login`.
  - [x] On 200:
    - [x] Set `editorMode = true`.
  - [x] On error:
    - [x] Show generic error.

### 4.3 Edit Controls

- [x] When `editorMode === true`:
  - [x] Show “Add Game” entrypoint.
  - [x] Show “Edit” controls on cards / detail modal.

### 4.4 Save Flow

- [x] On save:
  - [x] Build updated `games` array on client.
  - [x] POST `/api/games` with `{ games }` (cookie sent automatically).
  - [x] On success:
    - [x] Refresh games store with response.
    - [x] Show success feedback.
  - [x] On error:
    - [x] Show failure feedback.
    - [x] Do not commit local optimistic changes.

---

## Phase 5 – Data Integrity and Rules

- [x] Implement shared utilities for:
  - [x] Score calculation: `(P + S + G) / 3 × 2` via `computeScore`.
  - [x] Planned: enforce null rating/score/tier/completion fields.
  - [x] Completed: enforce required ratings/score/tier/completion fields.
- [x] Ensure:
  - [x] Frontend uses these utilities / rules:
    - [x] `GameEditorModal.svelte` mirrors integrity rules and uses `GameSchema` client-side.
  - [x] Worker validates and rejects invalid payloads:
    - [x] `functions/api/games.ts` uses `GamesPayloadSchema` + recomputes score.
- [x] Keep Zod schemas shared/synced (`src/lib/validation/game.ts` as single source of truth).

---

## Phase 6 – Security Hardening

- [x] Ensure `gt_session` cookie is secure (HttpOnly, Secure, SameSite=Lax, exp).
- [x] Ensure no secrets leak to client.
- [x] Add basic rate limiting and logging:
  - [x] Shared `functions/utils/rateLimit.ts`:
    - KV-based sliding window helper: `checkRateLimit(kv, ip, { windowMs, max, prefix })`.
  - [x] `/api/games` (functions/api/games.ts):
    - [x] Optional env `ENABLE_RATE_LIMITING === 'true'` enables:
      - Limit: 30 write requests per IP per 60s with prefix `rl:games`.
      - On exceed: 429 + JSON `{ error: 'Too many requests' }`.
      - Logs `rate_limit_denied` events.
    - [x] Structured logs:
      - `config_error` when SESSION_SECRET missing.
      - `auth_failed` for invalid/missing session.
      - `validation_failed` for bad content-type/payload/schema issues.
      - `games_write_success` with count + meta.
      - `games_write_error` on exceptions (error message only, no secrets).
  - [x] `/api/login` (functions/api/login.ts):
    - [x] Optional env `ENABLE_RATE_LIMITING === 'true'` and `GAMES_KV`:
      - Limit: 20 login attempts per IP per 60s with prefix `rl:login`.
      - On exceed: 429 + JSON `{ error: 'Too many requests' }`.
      - Logs `rate_limit_denied` events.
    - [x] Structured logs:
      - `validation_failed` for invalid content-type or payload.
      - `config_error` when env missing.
      - `auth_failed` on bad credentials.
      - `login_success` on successful login.
      - `login_error` on unexpected exceptions.
- Behavior:
  - Rate limiting is opt-in via `ENABLE_RATE_LIMITING` to keep local/dev simple.
  - Logging is JSON-structured, safe for Cloudflare logs, and contains no sensitive secrets.

---

## Phase 7 – Deployment and Verification

- [ ] Deploy Cloudflare Pages + Functions + KV.
- [ ] Seed/verify KV:
  - [ ] Confirm `GAMES_KV` key `games` exists or is set by first successful save.
- [ ] Verify:
  - [ ] `/api/games` works for public users.
  - [ ] Login sets `gt_session`.
  - [ ] Editor-only UI gated by valid session.
  - [ ] POST `/api/games` updates KV + GitHub and reflects in UI.
  - [ ] Unauthorized writes are rejected.
  - [ ] Rate limiting and logs behave as expected when enabled.
