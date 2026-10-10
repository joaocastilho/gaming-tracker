# AI Agent Instructions (AGENTS.md)

**Project**: Gaming Tracker (SvelteKit 3 + Svelte 5 Runes + TypeScript, Bun) — a single-user, client-side game collection tracker deployed to Cloudflare Pages.

---

## Non-negotiables

1. **`bun run validate`** runs `lint:fix → format → check → test`. Always run it after code changes and iterate until green. Don't run the steps separately.
2. **`functions/` is bundled by wrangler, not Vite.** Anything imported from `functions/` (directly or transitively) must **not** use `#lib/...` imports — wrangler can't resolve the `.js`→`.ts` rewriting Vite does. Use extensionless relative imports (`../utils/tierUtils`, never `#lib/utils/tierUtils.js`). After changes, run `bun run check:functions` (real wrangler build) in addition to `validate`. This exact mistake broke deploys once already.
3. **Test-first for refactors and bug fixes**: failing test → implement → full suite green → `validate`. No exceptions.
4. **Never commit without user approval.** Ask with a clear plan when scope is ambiguous.
5. **`static/games.json` and `static/covers/` are read-only** unless the user explicitly authorizes changes.

## Ask first when…

- Requirements are unclear, or multiple valid approaches exist
- A change would alter existing behavior in a user-visible way
- No existing test covers the area you're changing (say so explicitly)
- You find yourself modifying > 3 files for one concern

Don't ask for: typos, formatting, following existing patterns, or work the task already specified.

## Working style

- One focused, verified change at a time. Never chain 3+ unverified changes.
- Clean up after yourself: no `console.log`/`debugger`/`$inspect()`, no stray TODOs, no temp files.
- Comments explain *why*, never *what*. Delete obvious ones.

## Code standards

### Svelte 5 Runes (required)

- `$props()`, `$state()`, `$derived()` / `$derived.by()`, `$effect()`. No legacy `export let`, `$:`, `on:`, or `onMount`.
- Store files use the `.svelte.ts` extension and class-based `$state` patterns.
- Events: `onclick` (lowercase), not `on:click`.

### TypeScript (strict)

- No `any` — use `unknown` + type guards. No `as Type` assertions; fix types at the source.
- No `@ts-ignore`. `@ts-expect-error` only with a comment explaining why.
- Explicit return types on public methods; type `catch` blocks properly.

### Other

- Deep-clone with `structuredClone()`, never `JSON.parse(JSON.stringify())`.
- Import order: `$app/*` → external libs → `#lib/*` (stores, then utils/types/components) → relative → styles.
- Layer direction: `types/` ← `utils/` ← `stores/` ← `components/`. Never invert (no `utils → stores`, no `types → utils`).

## Commits

Conventional commits, imperative, ≤ 72 chars, no trailing period:

| Type       | Use for              | Example                              |
| ---------- | -------------------- | ------------------------------------ |
| `feat`     | New features         | `feat(auth): add login modal`        |
| `fix`      | Bug fixes            | `fix(cart): correct total`           |
| `perf`     | Performance          | `perf(store): cache sorted master`   |
| `refactor` | Restructure, no behavior change | `refactor(utils): simplify dates` |
| `test`     | Tests                | `test(auth): add login tests`        |
| `docs`     | Documentation        | `docs: update README`                |
| `chore` / `build` / `ci` | Deps, tooling, pipelines | `build: upgrade vite` |
| `style`    | Formatting only      | `style: format with biome`           |

## When things go wrong

- **Lint/type errors**: fix, re-run, never disable a rule to get green.
- **Failing tests**: check whether they failed before your change; if you broke them, fix them; if pre-existing, say so and don't block on them.
- **Cloudflare build errors**: assumption is a `#lib` import (or another wrangler-resolvability issue) in the functions graph — verify with `bun run check:functions` before pushing.
- **Stuck**: state the problem and what you tried, then ask. Don't guess repeatedly.

## Pre-commit checklist

- [ ] `bun run validate` green (and `check:functions` + `build` if `functions/` or routing touched)
- [ ] New behavior has a test written **before** the implementation
- [ ] No `any`, no `console.*`, no leftover debug code
- [ ] Diff reviewed for scope creep
