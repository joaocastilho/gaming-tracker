# AI Agent Instructions (AGENTS.md)

**Project**: Gaming Tracker — a single-user game collection tracker. SvelteKit 3.1 (static adapter), Svelte 5 runes, TypeScript, Tailwind 4, Dexie, Chart.js. Vite 8 (Rolldown) builds the site; Bun runs scripts and tests. Deployed to Cloudflare Pages: prerendered site + Pages Functions behind the editor.

---

## Project map

| Path                             | Contents                                                                                                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`                 | SvelteKit 3 config (there is no `svelte.config.js`), Tailwind, service-worker asset emission, adapter post-processing, Rolldown chunk groups.                                                            |
| `src/routes/`                    | `+layout.ts` loads/caches games; `+layout.svelte` owns the shell, filters, and modal wiring; `api/games` and `api/games-local` expose save endpoints; `stats/`, `login/`, and the list routes prerender. |
| `src/lib/stores/*.svelte.ts`     | Class-based rune stores exported as singletons: games, filters/filtered lists, modal/navigation, editor, offline, app/window, image errors.                                                              |
| `src/lib/views/`                 | Page-level views (`GamesView`) composed from stores + components.                                                                                                                                        |
| `src/lib/components/`            | Reusable UI. `game-card/`, `detail-modal/`, `game-editor/`, `layout/`, and `mobile-filters/` are feature folders.                                                                                        |
| `src/lib/utils/`                 | Framework-free helpers. No store imports; pure where possible.                                                                                                                                           |
| `src/lib/styles/`, `src/app.css` | Theme tokens: dark on `:root`, light overrides under `.light`.                                                                                                                                           |
| `src/service-worker.source.js`   | Production service worker source. Minified to `/service-worker.js` at build time; the `.source` suffix keeps Kit from treating it as its own entry.                                                      |
| `functions/`                     | Cloudflare Pages Functions; editor saves commit `static/games.json` to GitHub.                                                                                                                           |
| `static/`                        | `games.json`, covers, icons, manifest — user data, read-only for agents.                                                                                                                                 |
| `tests/`                         | Vitest suites; shared factories in `tests/helpers/factories.ts`.                                                                                                                                         |

Layer direction: `types` ← `utils` ← `stores` ← `components`/`routes`. Never import upward.

## Data flow (read before touching the store)

1. `src/routes/+layout.ts` hydrates from IndexedDB when cached, otherwise fetches `/games.json`.
2. A background fetch compares `meta.lastUpdated`; unchanged data skips the Dexie rewrite.
3. `gamesStore.initializeGames(games, { persist })` transforms raw data once. `persist: false` for cache hits.
4. Views derive from stores — do not duplicate derived state locally.
5. `?game=<slug>` drives the detail modal. Resolution uses the prebuilt `gamesStore` slug/id index; never re-scan the games array.
6. Editor saves go through `functions/api/games.ts` → GitHub Contents API. Offline saves queue in `db.sync_queue`.
7. The service worker is registered only in production. Dev unregisters workers left behind by older setups (they request the removed `src/service-worker.js` and trigger reload spam).

## Commands

| Command                                   | Purpose                                                |
| ----------------------------------------- | ------------------------------------------------------ |
| `bun run dev`                             | Vite dev server                                        |
| `bun run validate`                        | Gate: `lint:fix → format → check → test`               |
| `bun run test` / `bunx vitest run <file>` | Full / focused tests                                   |
| `bun run check:functions`                 | Real wrangler Functions build (pinned wrangler 3 line) |
| `bun run build`                           | Static production build                                |

## Non-negotiables

1. **`bun run validate`** is the gate. Run it after code changes and iterate until green; don't run its steps separately.
2. **Anything reachable from `functions/`** must use extensionless relative imports (`../utils/tierUtils`), never `#lib/...` — wrangler does not do Vite's `.js` → `.ts` rewriting. This broke deploys once. Verify with `bun run check:functions` whenever the functions graph or routing changes.
3. **Test-first for refactors and bug fixes**: failing test → implement → full suite green → `validate`. No exceptions.
4. **Never commit without user approval.** Present the plan and commits first.
5. **`static/games.json` and `static/covers/` are read-only** unless the user explicitly authorizes changes.

## Testing

- Component tests use `@testing-library/svelte`: `render(Component, { props })`; query roles/text/classes the component owns.
- Use `createTestGame` / `createCompletedGame` factories instead of hand-writing `Game` objects.
- Default environment is `jsdom`; opt into `happy-dom` with `// @vitest-environment happy-dom` when a test needs `window.location` mocking.
- `jsdom` is pinned to **30.0.1**: 30.1+ requires `this === globalThis` inside its vm context, which Bun's vm does not provide (oven-sh/bun#43671). Do not bump it until that lands.

## Dependency pins

`bun outdated` will flag both of these. That is expected:

- **`jsdom` 30.0.1** — see above.
- **`typescript` 6.0.3** — TypeScript 7 ships the native compiler without `ts.sys.readFile`, so `svelte-kit sync` crashes with `undefined is not an object`. Bump only after SvelteKit supports it.

## Known traps

- **Rolldown chunking**: SvelteKit 3.1 always sets `output.codeSplitting`, and Rolldown ignores `manualChunks` whenever it is present. Configure vendor groups under `build.rolldownOptions.output.codeSplitting` and repeat Kit's `sveltekit-manifest` group unchanged. Never capture `@sveltejs/kit/src/runtime/client/entry.js` or `client-entry.js` in a group: Kit follows a dynamic import between them and fails with `Could not find the client runtime chunk`.
- **Service worker source name**: keep it as `src/service-worker.source.js`. Naming it `src/service-worker.js` makes Kit treat it as its own dev entry; renaming it leaves stale dev registrations, which the dev cleanup in `src/lib/utils/serviceWorker.ts` now removes.
- **Themed colors**: use CSS variables (`var(--color-text-primary)`, `--color-rating-*`, `--color-status-*`). Never hard-code dark-theme hexes — `.light` shares the components.
- **Scoped CSS**: a rule targeting an element rendered by a child component (e.g. a lucide icon given `class="rating-icon"`) needs `:global(...)`.
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
- No `console.log`, `debugger`, `$inspect()`, stray TODOs, or temp files.
- Comments explain _why_, never _what_.
- Read the surrounding code first; match its patterns instead of inventing new ones.

## Code standards

### Svelte 5 runes (required)

- `$props()`, `$state()`, `$derived()` / `$derived.by()`, `$effect()`.
- No `export let`, `$:`, `on:`, or `onMount`.
- Stores use `.svelte.ts` and class-based `$state`.
- Events use `onclick` (lowercase).

### TypeScript (strict)

- No `any` — use `unknown` + type guards. No `as Type` assertions; fix types at the source.
- No `@ts-ignore`. `@ts-expect-error` only with a comment explaining why.
- Explicit return types on public methods; type `catch` blocks.

### Other

- Deep-clone with `structuredClone()`, never `JSON.parse(JSON.stringify())`.
- Import order: `$app/*` → external → `#lib/*` (stores, utils/types, components) → relative → styles.
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
- **Dev log spam about `src/service-worker.js`**: a stale dev worker is still registered. The app unregisters it on the next load; hard-refresh once if the current tab is still controlled.
- **Stuck**: state the problem and what you tried, then ask. Don't guess repeatedly.

## Definition of done

- [ ] `bun run validate` green; run `check:functions` + `build` too if `functions/`, routing, `vite.config.ts`, or dependencies changed
- [ ] New behavior has a test written before the implementation
- [ ] No `any`, `@ts-ignore`, `console.*`, or debug leftovers
- [ ] Diff scoped — no drive-by reformatting or unrelated files
- [ ] Commit follows the convention and has user approval
