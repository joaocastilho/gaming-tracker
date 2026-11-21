# AI Agent Instructions (AGENTS.md)

**Project**: Gaming Tracker — a single-user game collection tracker. SolidJS 2.0, Solid Router 2, TypeScript 7, Tailwind 4, Dexie, Chart.js. Vite 8 (Rolldown) builds the static SPA to `dist/client/` and mirrors it to `build/`; Bun runs scripts and tests. Deployed to Cloudflare Pages: static site + Pages Functions behind the editor and OG metadata middleware.

---

## Project map

| Path                                                | Contents                                                                                                                                                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                                    | `@solidjs/vite-plugin`, `@tailwindcss/vite`, `devApiPlugin` (local `/api/games` & `/api/games-local`), service-worker asset emission, static shell post-processing (`index.html`, `404.html`, `.gz`, `.br`), Rolldown chunk groups.            |
| `src/Document.tsx`, `src/App.tsx`, `src/router.tsx` | HTML document shell (theme bootstrap, font preloads, manifest/icons), router root, and route definitions.                                                                                                                                      |
| `src/pages/`                                        | Route pages: `Layout.tsx` (shell, filters, URL sync, modal wiring), `HomePage.tsx`, `StatsPage.tsx`, `LoginPage.tsx`, `NotFoundPage.tsx`, each with colocated `.css`.                                                                          |
| `src/lib/stores/*.ts`                               | Class-based Solid 2.0 signal stores exported as singletons: games, filters/filtered lists, modal/navigation, editor, offline, app/window, image errors. Uses `createSyncSignal` (`signalHelpers.ts`) so imperative writes flush synchronously. |
| `src/lib/views/`                                    | Page-level views (`GamesView`, `TierListView`) composed from stores + components.                                                                                                                                                              |
| `src/lib/components/`                               | Reusable UI (`.tsx` + colocated `.css`). `game-card/`, `detail-modal/`, `game-editor/`, `layout/`, and `mobile-filters/` are feature folders.                                                                                                  |
| `src/lib/utils/`                                    | Framework-free helpers (`gamesLoader.ts`, `routerBridge.ts`, `env.ts`, `tierUtils.ts`, etc.). Pure where possible.                                                                                                                             |
| `src/lib/styles/`, `src/app.css`                    | Theme tokens: dark on `:root`, light overrides under `.light`.                                                                                                                                                                                 |
| `src/service-worker.source.js`                      | Production service worker source. Minified to `/service-worker.js` at build time.                                                                                                                                                              |
| `functions/`                                        | Cloudflare Pages Functions; editor saves commit `static/games.json` to GitHub, `_middleware.ts` injects per-game OG tags.                                                                                                                      |
| `static/`                                           | `games.json`, covers, icons, manifest — user data, read-only for agents.                                                                                                                                                                       |
| `tests/`                                            | Vitest suites (`.test.ts` / `.test.tsx`); shared factories in `tests/helpers/factories.ts`.                                                                                                                                                    |

Layer direction: `types` ← `utils` ← `stores` ← `components`/`pages`. Never import upward.

## Data flow (read before touching the store)

1. `src/lib/utils/gamesLoader.ts` (`loadGamesData()`) hydrates from IndexedDB when cached, otherwise fetches `/games.json`.
2. A background fetch compares `meta.lastUpdated`; unchanged data skips the Dexie rewrite.
3. `gamesStore.initializeGames(games, { persist })` transforms raw data once. `persist: false` for cache hits.
4. Views derive from stores with `createMemo` — do not duplicate derived state locally.
5. `?game=<slug>` drives the detail modal. Resolution uses the prebuilt `gamesStore` slug/id index; never re-scan the games array.
6. Editor saves go through `functions/api/games.ts` → GitHub Contents API (or `scripts/devApiPlugin.ts` in local dev). Offline saves queue in `db.sync_queue`.
7. The service worker is registered only in production (`import.meta.env.PROD`). Dev unregisters any stale workers left behind.

## Commands

| Command                                   | Purpose                                                |
| ----------------------------------------- | ------------------------------------------------------ |
| `bun run dev`                             | Vite dev server                                        |
| `bun run validate`                        | Gate: `lint:fix → format → check → test`               |
| `bun run test` / `bunx vitest run <file>` | Full / focused tests                                   |
| `bun run check:functions`                 | Real wrangler Functions build (pinned wrangler 3 line) |
| `bun run build`                           | Static production build to `dist/client/`              |

## Non-negotiables

1. **`bun run validate`** is the gate. Run it after code changes and iterate until green; don't run its steps separately.
2. **Anything reachable from `functions/`** must use extensionless relative imports (`../utils/tierUtils`), never `#lib/...` — wrangler does not do Vite's `.js` → `.ts` rewriting. Verify with `bun run check:functions` whenever the functions graph or routing changes.
3. **Test-first for refactors and bug fixes**: failing test → implement → full suite green → `validate`. No exceptions.
4. **Never commit without user approval.** Present the plan and commits first.
5. **`static/games.json` and `static/covers/` are read-only** unless the user explicitly authorizes changes.

## Testing

- Component tests use `@solidjs/testing-library`: `render(() => <Component ... />)`; query roles/text/classes the component owns.
- Solid 2.0 signals flush asynchronously by default: call `flush()` from `solid-js` after user events or signal writes before synchronous DOM assertions.
- Use `createTestGame` / `createCompletedGame` factories instead of hand-writing `Game` objects.
- Default environment is `jsdom`; opt into `happy-dom` with `// @vitest-environment happy-dom` when a test needs `window.location` mocking.
- `jsdom` is pinned to **30.0.1**: 30.1+ requires `this === globalThis` inside its vm context, which Bun's vm does not provide (oven-sh/bun#43671). Do not bump it until that lands.

## Dependency pins

`bun outdated` will flag these. That is expected:

- **`jsdom` 30.0.1** — see above.
- **`vitest` / `@vitest/coverage-v8` 5.1.0** — 5.1.1 fails to terminate forks workers under Bun (`setMaxListeners` out of range). Bump once pool teardown works again.

## Known traps

- **Solid 2.0 `createEffect` signature**: `createEffect` takes two arguments: `createEffect(() => tracked, (value) => { ... return () => cleanup; })`. Use `onSettled(() => { ... return () => cleanup; })` for mount/cleanup effects.
- **Solid 2.0 ARIA boolean attributes**: `@solidjs/web` 2.0 types require `'true' | 'false'` strings for `aria-expanded`, `aria-selected`, `aria-pressed`, etc.
- **Solid 2.0 HTML attributes & events**: HTML attributes are lowercase (`tabindex`, `readonly`, `autocomplete`); events are camelCase (`onClick`, `onInput`, `onKeyDown`).
- **Windows case-insensitive `.d.ts` collision**: Do not create `src/app.d.ts` alongside `src/App.tsx`; ambient declarations live in `src/env.d.ts`.
- **Rolldown chunking**: Configure vendor groups under `build.rolldownOptions.output.codeSplitting` (Rolldown ignores `manualChunks` when `codeSplitting` is set).
- **Themed colors**: use CSS variables (`var(--color-text-primary)`, `--color-rating-*`, `--color-status-*`). Never hard-code dark-theme hexes — `.light` shares the components.
- **Build hashes**: `__BUILD_DATE__: Date.now()` makes every bundle hash differ. Compare output sizes, not hashes.
- **Modal ratings layout**: DOM order is metadata (Hours Played) → ratings → score/status. Keep it that way on portrait phones; do not use `margin-top: auto` to push the ratings block down.

## Ask first when…

- Requirements are ambiguous, or several valid approaches produce different user-visible results.
- A change alters existing behavior the request did not specify.
- No test covers the area and you cannot add one.
- One concern would touch more than three files.

Don't ask for: typos, formatting, following existing patterns, or work the task already specified.

## Working style

- One focused, verified change at a time; never stack three or more unverified changes.
- No `console.log`, `debugger`, stray TODOs, or temp files.
- Comments explain _why_, never _what_.
- Read the surrounding code first; match its patterns instead of inventing new ones.

## Code standards

### SolidJS 2.0 (required)

- `createSignal`, `createMemo`, `createEffect(compute, effect)`, `onSettled`, `Show`, `For`, `Switch`/`Match`, `lazy`, `Loading`, `Errored`.
- Never destructure `props` — read `props.foo` inside reactive scopes.
- Class-based stores use `createSyncSignal` from `#lib/stores/signalHelpers.js`.
- Conditional classes use array/object form: `class={['base', { active: isActive() }]}`.

### TypeScript 7 (strict)

- No `any` — use `unknown` + type guards. No `as Type` assertions; fix types at the source.
- No `@ts-ignore`. `@ts-expect-error` only with a comment explaining why.
- Explicit return types on public methods; type `catch` blocks.

### Other

- Deep-clone with `structuredClone()`, never `JSON.parse(JSON.stringify())`.
- Import order: external → `#lib/*` (stores, utils/types, components) → relative → styles.
- Prefer existing utilities over new helpers; check `src/lib/utils/` first.

## Commits

Conventional commits, imperative, ≤ 72 chars, no trailing period:

| Type                     | Use for                         | Example                            |
| ------------------------ | ------------------------------- | ---------------------------------- |
| `feat`                   | New features                    | `feat(auth): add login modal`      |
| `fix`                    | Bug fixes                       | `fix(cart): correct total`         |
| `perf`                   | Performance                     | `perf(store): cache sorted master` |
| `refactor`               | Restructure, no behavior change | `refactor(utils): simplify dates`  |
| `test`                   | Tests                           | `test(auth): add login tests`      |
| `docs`                   | Documentation                   | `docs: update README`              |
| `chore` / `build` / `ci` | Deps, tooling, pipelines        | `build: upgrade vite`              |
| `style`                  | Formatting only                 | `style: format with biome`         |

## When things go wrong

- **Lint/type errors**: fix and re-run; never disable a rule to get green.
- **Failing tests**: check whether they failed before your change. Fix what you broke; report pre-existing failures instead of masking them.
- **Cloudflare build errors**: assume a `#lib` import (or another wrangler-resolvability issue) in the functions graph. Confirm with `check:functions` before pushing.
- **Stuck**: state the problem and what you tried, then ask. Don't guess repeatedly.

## Definition of done

- [ ] `bun run validate` green; run `check:functions` + `build` too if `functions/`, routing, `vite.config.ts`, or dependencies changed
- [ ] New behavior has a test written before the implementation
- [ ] No `any`, `@ts-ignore`, `console.*`, or debug leftovers
- [ ] Diff scoped — no drive-by reformatting or unrelated files
- [ ] Commit follows the convention and has user approval
