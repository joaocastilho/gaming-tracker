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

- [ ] Confirm Cloudflare Pages project is connected to the `gaming-tracker` GitHub repo.
- [ ] Enable Cloudflare Functions/Workers for the Pages project.
- [ ] Decide production domain for cookie scope (e.g. `gaming-tracker.pages.dev` or custom domain).
- [ ] Choose Cloudflare KV for storing the canonical games JSON.
- [ ] Confirm `static/games.json` is the authoritative file to sync with GitHub.

---

## Phase 1 – Cloudflare Environment and Secrets

Configure the following for the Pages/Worker environment:

- [ ] Create KV namespace for games data:
  - Name suggestion: `GAMES_KV`
- [ ] Bind KV namespace to the Worker/Functions as `GAMES_KV`.

Add secrets / variables:

- [ ] `SESSION_SECRET`
  - Strong random string.
  - Used to sign session tokens.
- [ ] `EDITOR_USERNAME`
  - Optional; can be a fixed value like `owner`.
- [ ] `EDITOR_PASSWORD` or `EDITOR_PASSWORD_HASH`
  - Strong password known only to you.
  - Prefer a hashed value with comparison in the Worker.
- [ ] `GITHUB_TOKEN`
  - GitHub PAT with `repo` / `contents:write` access to `gaming-tracker`.
- [ ] `GH_REPO_OWNER` = `joaocastilho`
- [ ] `GH_REPO_NAME` = `gaming-tracker`
- [ ] `GH_FILE_PATH` = `static/games.json`
- [ ] `GH_BRANCH` = `main`

---

## Phase 2 – Worker API Implementation

Implement Cloudflare Functions/Worker under e.g. `/api/*`.

### 2.1 Shared Types and Validation

- [ ] Reuse or mirror the existing `Game` type and Zod schema from the app.
- [ ] Create a validation module for:
  - [ ] `games` array shape.
  - [ ] Planned vs Completed field rules.
  - [ ] Score calculation constraints.

### 2.2 Session Utilities

- [ ] Implement `createSessionToken(sub, exp)`:
  - Signs payload with `SESSION_SECRET`.
- [ ] Implement `verifySessionToken(token)`:
  - Verifies signature and expiration.
- [ ] Implement `getSessionFromRequest(request)`:
  - Reads `gt_session` cookie.
  - Uses `verifySessionToken` to return session or null.

### 2.3 Login Endpoint – `POST /api/login`

- [ ] Accept JSON body: `{ "username": string, "password": string }`.
- [ ] Verify against `EDITOR_USERNAME` and `EDITOR_PASSWORD`/hash.
- [ ] On failure:
  - [ ] Return `401` with generic message.
- [ ] On success:
  - [ ] Create signed session token (e.g. subject: `owner`, expiry: 12h).
  - [ ] Set cookie `gt_session` with:
    - HttpOnly, Secure, SameSite=Lax, Path=/.
  - [ ] Return `200 { "ok": true }`.

### 2.4 Read Endpoint – `GET /api/games`

- [ ] Try `GAMES_KV.get("games")`:
  - If present:
    - [ ] Parse and validate JSON.
    - [ ] Return `200` with `{ games, meta }`.
- [ ] If not present:
  - [ ] Load bundled `static/games.json` (via asset binding or import).
  - [ ] Validate.
  - [ ] Seed KV with `{ games, meta }`.
  - [ ] Return seeded data.

### 2.5 Write Endpoint – `POST /api/games` (Full Replace)

- [ ] Require valid session:
  - [ ] Use `getSessionFromRequest`; if missing/invalid → `401/403`.
- [ ] Accept JSON body: `{ "games": Game[], "meta"?: {...} }`.
- [ ] Validate with Zod and business rules:
  - [ ] Enforce Planned/Completed constraints.
  - [ ] Enforce score formula consistency.
- [ ] If validation fails → `400`.
- [ ] If validation passes:
  - [ ] Prepare `nextData = { games, meta: { lastUpdated: now, ... } }`.
  - [ ] Call `syncGamesToGitHub(nextData)` (see Phase 2.6).
  - [ ] If GitHub sync succeeds:
    - [ ] Write `nextData` to KV as key `games`.
    - [ ] Return `200 { "ok": true, "meta": nextData.meta }`.
  - [ ] If GitHub sync fails:
    - [ ] Do NOT update KV.
    - [ ] Return `500` with error (all-or-nothing).

### 2.6 GitHub Sync Helper – `syncGamesToGitHub`

- [ ] Read repo config from env (`GH_*`).
- [ ] Fetch current file:
  - [ ] `GET /repos/{owner}/{repo}/contents/{path}?ref={branch}`.
  - [ ] Decode `content` from Base64, get `sha`.
- [ ] Compare:
  - [ ] If existing content equals `JSON.stringify(nextData, null, 2)`:
    - [ ] Return success (no-op).
- [ ] Update:
  - [ ] `PUT /repos/{owner}/{repo}/contents/{path}` with:
    - message: `chore(data): update games.json via cloudflare editor`
    - content: base64-encoded new JSON
    - sha: previous sha
    - branch: `GH_BRANCH`
- [ ] Handle errors:
  - [ ] If any GitHub error:
    - [ ] Throw/fail so `POST /api/games` can return `500` and avoid KV divergence.

---

## Phase 3 – Frontend: Use Dynamic Data Source

- [ ] Update root data-loading logic (`+layout.ts` or equivalent) to:
  - [ ] On client, fetch `/api/games`.
  - [ ] On success:
    - [ ] Populate games store from response.
  - [ ] On failure:
    - [ ] Fallback to bundled `static/games.json`.
- [ ] Ensure all views (Completed, Planned, Tierlist, etc.) derive from the shared games store.
- [ ] Maintain existing UX (filters, sorting, modals).

---

## Phase 4 – Frontend: Owner-Only Editor Mode (With Login)

### 4.1 Editor State

- [ ] Add `editorMode` boolean to a global store.

### 4.2 Login UI

- [ ] Add a discreet login trigger (e.g. small icon/shortcut).
- [ ] Implement login modal:
  - [ ] Submits to `POST /api/login`.
  - [ ] On 200:
    - [ ] Set `editorMode = true`.
  - [ ] On error:
    - [ ] Show generic error.

### 4.3 Edit Controls

- [ ] Only when `editorMode === true`:
  - [ ] Show “Add Game” button.
  - [ ] Show “Edit” buttons in cards/table/modal.

### 4.4 Save Flow

- [ ] On save:
  - [ ] Compute updated `games` array in client.
  - [ ] POST `/api/games` with `{ games }`:
    - Cookie `gt_session` is sent automatically (HttpOnly).
  - [ ] On success:
    - [ ] Refresh games store with server response.
    - [ ] Show success notification.
  - [ ] On error:
    - [ ] Show failure notification.
    - [ ] Do not mutate local store on failed sync.

---

## Phase 5 – Data Integrity and Rules

- [ ] Implement shared utilities for:
  - [ ] Score calculation: `(P + S + G) / 3 × 2`.
  - [ ] Planned → must have null rating/score/tier fields.
  - [ ] Completed → must have all required fields set.
- [ ] Ensure:
  - [ ] Frontend uses utilities when building updates.
  - [ ] Worker revalidates and rejects inconsistent payloads.
- [ ] Keep Zod schemas in sync between frontend and Worker.

---

## Phase 6 – Security Hardening

- [ ] Ensure `gt_session` cookie:
  - [ ] HttpOnly
  - [ ] Secure
  - [ ] SameSite=Lax (or Strict)
  - [ ] Reasonable expiration (e.g. 12h).
- [ ] Ensure no secrets (`EDITOR_*`, `SESSION_SECRET`, `GITHUB_TOKEN`) appear in client bundle.
- [ ] Add basic protections:
  - [ ] Rate limiting or throttling on `/api/login` and `/api/games`.
  - [ ] Log auth and write attempts via Cloudflare logs.

---

## Phase 7 – Deployment and Verification

- [ ] Deploy Cloudflare Pages + Functions + KV configuration.
- [ ] Seed KV:
  - [ ] Confirm `GAMES_KV` key `games` is initialized (via GET /api/games or manual seed).
- [ ] Verify read:
  - [ ] Public user can fetch `/api/games` and see data.
  - [ ] App renders correctly using API data.
- [ ] Verify login:
  - [ ] Correct credentials set session cookie.
  - [ ] `editorMode` toggles on.
- [ ] Verify save and sync:
  - [ ] Add/edit a game in editor mode.
  - [ ] Confirm:
    - [ ] `POST /api/games` returns 200.
    - [ ] KV has updated data.
    - [ ] GitHub repo `static/games.json` updated with a new commit.
    - [ ] Reloading site shows updated data.
- [ ] Verify access control:
  - [ ] Without login:
    - [ ] No editor UI.
    - [ ] Direct POST /api/games` without session → 401/403.
- [ ] Confirm:
  - [ ] No manual editing of `games.json` required for normal usage.
  - [ ] KV and GitHub remain in sync after each successful save.
