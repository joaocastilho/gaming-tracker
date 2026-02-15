# Gaming Tracker — Quality Verification TODO Checklist

**Purpose**: This is a comprehensive, step-by-step verification checklist. An AI agent (or human reviewer) should go through every single item, verify the current state, and mark it as passing or failing. Items marked as failing should be fixed before the project can be considered 10/10.

**How to Use**:
1. Go through each section in order
2. For each check, run the specified command or manually verify
3. Mark `[ ]` → `[x]` when passing, or add a `[!]` note if failing
4. After all checks pass, the project is verified at 10/10

**Tech Stack**: SvelteKit 2 · Svelte 5 Runes · TypeScript 5.9 (strict) · Tailwind CSS 4 · Bun · Vite 7 · Dexie.js · Zod · Cloudflare Workers

---

## 1. TypeScript & Type Safety

### 1.1 Compiler Configuration
- [ ] Verify `tsconfig.json` has `"strict": true`
- [ ] Verify `"noUnusedLocals": true` is set
- [ ] Verify `"noUnusedParameters": true` is set
- [ ] Verify `"forceConsistentCasingInFileNames": true` is set
- [ ] Run `bun run check` — expect zero errors and zero warnings

### 1.2 Type Assertion Audit
- [ ] Run: `grep -rn "as any" src/` — expect zero results
- [ ] Run: `grep -rn "as unknown" src/` — expect zero results
- [ ] Run: `grep -rn "@ts-ignore" src/` — expect zero results
- [ ] Run: `grep -rn "@ts-expect-error" src/` — if present, each must have an adjacent comment explaining why
- [ ] Run: `grep -rn "eslint-disable.*no-explicit-any" src/` — expect zero results

### 1.3 Type Quality
- [ ] Verify all public store methods have explicit return type annotations
- [ ] Verify all utility functions have explicit return type annotations
- [ ] Verify `catch` blocks type errors as `unknown` (not `any`)
- [ ] Verify generic components (e.g., `VirtualList`) use constrained generics
- [ ] Verify `app.d.ts` properly extends the `App` namespace with `PageState` types
- [ ] Verify shared types between frontend and Cloudflare Functions import from `src/lib/types/`
- [ ] Check if Zod schemas use `z.infer<typeof Schema>` to derive TypeScript types (avoid manual duplication)

---

## 2. Svelte 5 Runes & Component Patterns

### 2.1 Zero Legacy Patterns
- [ ] Run: `grep -rn '^\$:' src/` — expect zero reactive declarations (use `$derived`)
- [ ] Run: `grep -rn 'onMount' src/lib/` — expect zero results (use `$effect`)
- [ ] Run: `grep -rn 'onDestroy' src/lib/` — expect zero results (use `$effect` cleanup)
- [ ] Run: `grep -rn 'createEventDispatcher' src/` — expect zero results (use callback props)
- [ ] Run: `grep -rn 'on:click' src/` — expect zero results (use `onclick={handler}`)
- [ ] Run: `grep -rn '<slot' src/` — expect zero results (use `{@render children()}` pattern)
- [ ] Run: `grep -rn '\$inspect' src/` — expect zero results (development-only)

### 2.2 Modern Patterns
- [ ] Verify all components use `let { ... } = $props()` for props
- [ ] Verify all computed values use `$derived` or `$derived.by()`
- [ ] Verify all side effects use `$effect` with proper cleanup (return cleanup function)
- [ ] Verify `$effect` is NOT used for derived state (only for side effects like DOM, subscriptions, URLs)
- [ ] Verify event handlers use `onclick={handler}` syntax (not `on:click`)

### 2.3 Component Size & Architecture
- [ ] Check `DetailModal.svelte` size — if > 500 lines, document justification or create decomposition plan
- [ ] Check `+layout.svelte` size — if > 500 lines, document justification or extract sub-components
- [ ] Check `GameCard.svelte` size — if > 500 lines, document justification
- [ ] Check `MobileFilters.svelte` size — if > 500 lines, document justification
- [ ] Verify each component follows Single Responsibility Principle
- [ ] Verify no direct DOM manipulation (`document.querySelector`) — use Svelte bindings/actions

---

## 3. State Management (Stores)

### 3.1 Store Pattern
- [ ] Verify all stores use class-based pattern with `$state`, `$derived`, and methods
- [ ] Run: `grep -rn 'writable\|readable' src/lib/stores/` — expect zero legacy stores
- [ ] Run: `grep -rn 'subscribe(' src/lib/stores/` — expect zero legacy subscribe methods
- [ ] Verify private fields use underscore prefix (`_games`) with public getters
- [ ] Verify store instances are exported as singletons

### 3.2 State Mutations
- [ ] Verify state mutations are immutable (new array/object references, not `.push()` / `.splice()`)
- [ ] Verify `filteredGamesStore` cache key strategy doesn't cause stale reads
- [ ] Verify no circular dependencies between stores (trace dependency graph)

### 3.3 URL ↔ State Synchronization
- [ ] Verify URL → state restoration works on page load (test with filter/sort/modal URLs)
- [ ] Verify state → URL updates work on user action (filters, search, sort, modal open)
- [ ] Verify no infinite loops in URL sync (set a breakpoint and cycle through filter toggling)
- [ ] Verify debounced URL updates (300ms for search) don't lose state on rapid navigation
- [ ] Verify `replaceState` is used for filter/search URL updates (not `pushState`) to avoid polluting history

### 3.4 Store Cleanup
- [ ] Verify store reset/cleanup logic exists and is called on tab switch
- [ ] Verify editor store validates form state and shows loading indicator during submission
- [ ] Verify filter state resets when switching to tier list tab

---

## 4. SvelteKit Routing & Data Loading

- [ ] Verify `+layout.ts` load function has try/catch with fallback (not blank screen on error)
- [ ] Verify static adapter config: `pages: 'build'`, `assets: 'build'`, `fallback: '404.html'`, `precompress: true`
- [ ] Verify all routes under `src/routes/` have proper file structure
- [ ] Verify `+error.svelte` exists and provides user-friendly error UI
- [ ] Test: Navigate with browser back/forward after applying filters — state should be preserved
- [ ] Test: Open `/?s=zelda&platform=PC` directly — filters should be pre-applied
- [ ] Test: Open `/?game=some-slug` directly — detail modal should open
- [ ] Run: `grep -rn '\$env/static/private' src/lib/ src/routes/` — expect zero results (server secrets in client)
- [ ] Verify prerender configuration is correct for routes that can be prerendered

---

## 5. Styling & Tailwind CSS 4

### 5.1 Configuration
- [ ] Verify `postcss.config.js` includes `@tailwindcss/postcss` and `autoprefixer`
- [ ] Verify `@tailwindcss/forms` plugin is applied in `tailwind.config.js`
- [ ] Verify `app.css` uses CSS custom properties for theming (dark/light variables)
- [ ] Verify dark mode is implemented via `.dark` class on `<html>` element

### 5.2 Quality
- [ ] Run: `grep -rn '!important' src/` — expect zero results (indicates specificity issues)
- [ ] Run: `grep -rn 'style="' src/lib/components/` — expect zero inline styles (use Tailwind classes)
- [ ] Verify responsive design uses mobile-first breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- [ ] Verify no hardcoded color values in component `<style>` blocks

### 5.3 Typography & Fonts
- [ ] Verify `font-display: swap` is set for all web fonts
- [ ] Verify fonts load non-blocking (preload or async)
- [ ] Verify fonts are preloaded in `app.html` `<head>` for fast rendering

### 5.4 Accessibility Styling
- [ ] Verify all interactive elements have visible `:focus-visible` indicators
- [ ] Verify color contrast ratios ≥ 4.5:1 for normal text in BOTH dark and light themes
- [ ] Verify color contrast ratios ≥ 3:1 for large text in BOTH themes
- [ ] Verify `prefers-reduced-motion` media query is respected for all CSS animations
- [ ] Verify focus indicators are visible against both dark and light backgrounds

---

## 6. Performance

### 6.1 Lighthouse Audit (Production Build)
```bash
bun run build
bun run preview
# Open Chrome DevTools > Lighthouse tab
# Run on Mobile AND Desktop
```
- [ ] Lighthouse Performance score ≥ 95 (mobile)
- [ ] Lighthouse Performance score ≥ 95 (desktop)
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Speed Index < 3.4s
- [ ] Export and save report to `docs/audits/lighthouse-report.json`

### 6.2 Bundle Analysis
- [ ] Verify `rollup-plugin-visualizer` is installed — if not, install and run
```bash
bun run build
# Open stats.html to review chunk sizes
```
- [ ] Verify initial JS bundle < 200 KB gzipped
- [ ] Verify no single chunk exceeds 500 KB uncompressed
- [ ] Verify vendor chunks are properly split (svelte, ui libs, utils)
- [ ] Verify tree-shaking is working (no unused library code in bundle)

### 6.3 Runtime Performance
- [ ] Verify `VirtualList.svelte` renders only visible items + overscan buffer
- [ ] Verify `filteredGamesStore` memoization — changing unrelated state does NOT recompute filters
- [ ] Verify search debounce is 300ms (test by typing rapidly)
- [ ] Verify images use `loading="lazy"` attribute (except priority/above-fold images)
- [ ] Verify `ResizeObserver` and `IntersectionObserver` are disconnected in `$effect` cleanup
- [ ] Verify scroll listeners use `{ passive: true }`
- [ ] Verify `content-visibility: auto` on `TierRow` component
- [ ] Test with large dataset: app scrolls smoothly with 500+ games

---

## 7. Accessibility (a11y)

### 7.1 Automated Audit
```bash
# Install axe DevTools browser extension
bun run build && bun run preview
# Test EACH route in browser with axe DevTools
```
- [ ] axe-core: zero critical violations on `/`
- [ ] axe-core: zero critical violations on `/completed`
- [ ] axe-core: zero critical violations on `/planned`
- [ ] axe-core: zero critical violations on `/tierlist`
- [ ] axe-core: zero critical violations on `/login`
- [ ] axe-core: zero serious violations across all routes

### 7.2 Images & Icons
- [ ] All `<img>` elements have descriptive `alt` text (e.g., `alt="Game cover for {game.title}"`)
- [ ] Decorative images use `alt=""` and `role="presentation"`
- [ ] Icon-only buttons have `aria-label` (e.g., theme toggle, close button)

### 7.3 Forms & Inputs
- [ ] All form inputs have associated `<label>` or `aria-label`
- [ ] Error messages are linked to inputs via `aria-describedby`
- [ ] Required fields have `aria-required="true"` or HTML5 `required` attribute
- [ ] Search input has clear `aria-label`

### 7.4 Modals & Dialogs
- [ ] Modals use `role="dialog"` and `aria-modal="true"`
- [ ] Modals have `aria-labelledby` pointing to the title element
- [ ] Focus is trapped inside open modals (cannot Tab outside)
- [ ] Focus returns to trigger element when modal closes
- [ ] Escape key closes modal

### 7.5 Keyboard Navigation
```
Manual test: Use Tab, Shift+Tab, Enter, Space, Escape, Arrow keys
```
- [ ] All interactive elements are reachable via Tab
- [ ] Tab order follows logical visual order (top-to-bottom, left-to-right)
- [ ] Focus indicator is clearly visible on every focused element
- [ ] Buttons activate with Enter and Space
- [ ] Filter dropdowns navigable with Arrow keys
- [ ] Ctrl+K focuses search bar (documented shortcut)
- [ ] Skip-to-content link is first focusable element and works

### 7.6 Semantic HTML
- [ ] Page has proper heading hierarchy (single `<h1>`, nested `<h2>`, `<h3>`)
- [ ] `<main>`, `<nav>`, `<header>` landmarks are used correctly
- [ ] Dynamic content changes use `aria-live` regions (e.g., filtered game count)
- [ ] Loading states use `aria-busy="true"`

### 7.7 Motion & Color
- [ ] `prefers-reduced-motion` is respected for all CSS/JS animations
- [ ] Color is not the only means of conveying information (e.g., tiers have text + color)
- [ ] Minimum touch target size of 44×44px for all interactive elements (verify on mobile)

---

## 8. Security

### 8.1 XSS Prevention
- [ ] Run: `grep -rn '{@html' src/` — if present, verify NONE use user-provided content
- [ ] Run: `grep -rn 'innerHTML' src/` — expect zero results
- [ ] Run: `grep -rn 'document.write' src/` — expect zero results
- [ ] Run: `grep -rn 'eval(' src/` — expect zero results

### 8.2 Input Validation
- [ ] Verify all user inputs are validated with Zod before processing
- [ ] Verify URL slug validation before DOM/store lookups in `modal.svelte.ts`
- [ ] Verify Cloudflare Worker validates `Content-Type` header on all endpoints

### 8.3 Authentication & Sessions
- [ ] Verify session cookie has: `HttpOnly`, `Secure`, `SameSite=Lax`, and expiry
- [ ] Verify password comparison uses timing-safe comparison
- [ ] Verify rate limiting on POST `/api/login` (20 attempts/60s)
- [ ] Verify rate limiting on POST `/api/games` (30 requests/60s)

### 8.4 Secrets
- [ ] Run: `grep -rn 'GITHUB_TOKEN\|SESSION_SECRET\|EDITOR_PASSWORD' src/` — expect zero results (secrets only in Worker env)
- [ ] Verify error responses don't leak stack traces or internal paths
- [ ] Verify `console.error` calls in Worker don't log sensitive data (tokens, passwords)

### 8.5 Dependencies
- [ ] Run dependency vulnerability audit (if bun supports it, or use `npx audit-ci`)
- [ ] Verify no unnecessary dependencies in `dependencies` (vs `devDependencies`)
- [ ] Verify `@opentelemetry/api` in devDependencies is actually used or should be removed

---

## 9. Testing

### 9.1 Test Execution
```bash
bun run test
```
- [ ] All tests pass with zero failures
- [ ] Test execution time < 30 seconds
- [ ] Run: `grep -rn '\.skip\|\.only' tests/` — expect zero results (no skipped/focused tests)

### 9.2 Test Coverage
```bash
bun run test -- --coverage
```
- [ ] Overall coverage > 80%
- [ ] Store coverage > 90%
- [ ] Utility function coverage > 90%
- [ ] Validation schema coverage > 90%
- [ ] Component coverage > 70%

### 9.3 Test Quality
- [ ] Run: `grep -rn 'as any\|as Game' tests/` — minimize type assertions in tests
- [ ] Verify each test file has clear `describe` / `it` blocks with descriptive names
- [ ] Verify tests are independent (not relying on execution order)
- [ ] Verify mocks are properly set up and torn down (check `restoreMocks: true` in config)
- [ ] Verify `fake-indexeddb/auto` is in `setupFiles` for Dexie tests

### 9.4 Test Scope
- [ ] Store tests exist for: `gamesStore`, `filtersStore`, `filteredGamesStore`, `modalStore`, `editorStore`, `appStore`
- [ ] Utility tests exist for: `dateUtils`, `slugUtils`, `dataTransformer`, `colorConstants`, `filterOptions`
- [ ] Integration tests exist for: search + filter + sort interaction
- [ ] URL ↔ state sync tests exist and test both directions
- [ ] Component tests exist for key interactive components (GameCard, SearchBar, FilterDropdown)
- [ ] Data persistence tests verify Dexie and IndexedDB operations

### 9.5 Missing Test Areas (Nice to Have)
- [ ] VirtualList component has dedicated tests
- [ ] Error boundary behavior is tested
- [ ] Service worker lifecycle is tested
- [ ] Cloudflare Functions have unit tests (login, save, rate limiting, GitHub sync)
- [ ] E2E tests with Playwright cover critical user flows (add game, edit game, filter, search)
- [ ] Visual regression tests exist for GameCard, DetailModal, TierList

---

## 10. Build, Bundle & Deployment

### 10.1 Build Integrity
```bash
bun run build
```
- [ ] Build completes with zero errors
- [ ] Build completes with zero warnings
- [ ] Output directory `build/` contains HTML, JS, CSS, and static assets
- [ ] `fallback` file (`404.html` or `index.html`) exists in `build/`

### 10.2 Production Artifacts
- [ ] Verify sourcemaps are disabled for production (`sourcemap: false` in vite.config.ts)
- [ ] Verify JavaScript is minified (check a `.js` file in `build/_app/`)
- [ ] Verify CSS is minified (check a `.css` file in `build/_app/`)
- [ ] Verify `.gz` and/or `.br` pre-compressed files exist (from `precompress: true`)

### 10.3 Code Splitting
- [ ] Verify `manualChunks` in `vite.config.ts` produces separate vendor chunks
- [ ] Verify no single chunk exceeds 500 KB
- [ ] Verify critical-path code is not lazy-loaded (initial route must load fast)

### 10.4 Production Cleanliness
- [ ] Run: `grep -rn 'console.log' build/` — expect zero results (only console.error/warn in error paths)
- [ ] Verify HTML comments are stripped from production `.html` files
- [ ] Verify no development-only plugins are active in production

### 10.5 Deployment
- [ ] `wrangler.toml` has correct `compatibility_date` and KV bindings
- [ ] Production preview works: `bun run preview` serves the app correctly
- [ ] All routes work in preview mode (/, /completed, /planned, /tierlist, /login)

### 10.6 CI/CD
- [ ] GitHub Actions workflow exists (`.github/workflows/`)
- [ ] CI runs: lint → check → test → build
- [ ] CI fails if any step fails
- [ ] Cloudflare Pages is connected for automatic deployments

---

## 11. Code Quality & Linting

### 11.1 Automated Checks
```bash
bun run lint
bun run format:check
```
- [ ] `bun run lint` — zero errors, zero warnings
- [ ] `bun run format:check` — all files match Prettier formatting

### 11.2 ESLint Rule Audit
- [ ] Review `eslint.config.js` — ensure `@typescript-eslint/no-explicit-any` is set to `error` (currently `off`)
- [ ] Review — ensure `@typescript-eslint/no-non-null-assertion` is set to `warn` or `error` (currently `off`)
- [ ] Review — ensure `svelte/no-at-html-tags` is `warn` (currently `off`)
- [ ] Document justification for any rules that remain disabled

### 11.3 Manual Code Smell Checks
```bash
# Run these grep searches from the project root
```
- [ ] Run: `grep -rn 'TODO\|FIXME\|HACK\|XXX' src/` — expect zero results
- [ ] Run: `grep -rn 'debugger' src/` — expect zero results
- [ ] Run: `grep -rn 'console.log' src/lib/ src/routes/` — each result must be justified (error handling only)
- [ ] Verify import order is consistent: external → internal absolute (`$lib/`) → relative → styles
- [ ] Verify file naming conventions match project standards (PascalCase.svelte, camelCase.svelte.ts, test-kebab-case.test.ts)
- [ ] Verify no dead code (unused functions, unreachable branches)
- [ ] Verify magic numbers are extracted to named constants

---

## 12. Error Handling

- [ ] Verify no silent `catch` blocks — all exceptions are logged or surfaced
- [ ] Verify `+error.svelte` exists with user-friendly error UI
- [ ] Verify data loading errors show fallback UI (not blank screen)
- [ ] Verify image load errors show gradient placeholder
- [ ] Verify network/offline errors are handled (OfflineIndicator component)
- [ ] Verify form validation errors display inline with `aria-describedby`
- [ ] Verify Cloudflare Worker errors return proper HTTP status codes with JSON body
- [ ] Verify error logs don't contain sensitive information

---

## 13. SEO & Meta

- [ ] Verify `<title>` is dynamic per route (check each route's title in browser tab)
- [ ] Verify `<meta name="description">` is present and descriptive in `app.html`
- [ ] Verify Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) in `app.html`
- [ ] Verify `<link rel="canonical">` is set
- [ ] Verify single `<h1>` per page with proper heading hierarchy
- [ ] Verify semantic HTML5 elements (`<main>`, `<nav>`, `<header>`) are used correctly
- [ ] Verify favicon set includes multiple sizes (16x16, 32x32, apple-touch-icon)
- [ ] Run Lighthouse SEO audit — expect score of 100

---

## 14. Documentation & Developer Experience

- [ ] Verify `README.md` has: setup instructions, tech stack, available scripts, deployment guide
- [ ] Verify `AGENTS.md` has current grade and workflow steps matching the codebase
- [ ] Verify `docs/TECHNICAL.md` accurately reflects current stores, data flow, and component hierarchy
- [ ] Verify no obsolete documentation files that contradict current state
- [ ] Verify all `package.json` scripts have clear purpose
- [ ] Verify complex algorithms have inline comments explaining the "why"
- [ ] Verify API endpoint documentation exists for Cloudflare Functions
- [ ] Verify `docs/` directory has no redundant files (merged audits should be deleted)

---

## 15. Cloudflare Functions & Edge API

- [ ] Verify `POST /api/login` validates `Content-Type`, returns 200/401/429 correctly
- [ ] Verify `GET /api/games` reads from KV and falls back to 404
- [ ] Verify `POST /api/games` validates payload with Zod, writes to KV + GitHub atomically
- [ ] Verify GitHub sync handles SHA conflicts gracefully
- [ ] Verify session token uses HMAC-SHA256 with proper expiry
- [ ] Verify KV writes only happen after GitHub sync succeeds (no partial writes)
- [ ] Verify rate limiting works when `ENABLE_RATE_LIMITING=true`
- [ ] Verify structured logging doesn't leak secrets
- [ ] Verify `wrangler.toml` has correct KV namespace and compatibility config

---

## 16. Data Layer & Validation

- [ ] Verify Zod schemas are the single source of truth (shared between client and Worker)
- [ ] Verify Planned games enforce null rating/score/tier/completion fields
- [ ] Verify Completed games enforce non-null rating/score/tier/completion fields
- [ ] Verify score calculation `(P + S + G) / 3 × 2` is a shared utility function
- [ ] Verify Dexie database schema has proper version management
- [ ] Verify data loading fallback chain: Dexie → API → static `games.json`
- [ ] Verify `static/games.json` conforms to Zod schema (run validation on it)
- [ ] Verify UUID generation uses `crypto.randomUUID()`
- [ ] Verify date fields use ISO 8601 format

---

## 17. Image Pipeline & Static Assets

- [ ] Verify cover images are WebP at 85% quality
- [ ] Verify image dimensions are consistent (600×900 or documented)
- [ ] Verify `<img>` elements have explicit `width` and `height` (prevents CLS)
- [ ] Verify `srcset` provides responsive sizes where applicable
- [ ] Verify image load errors show gradient placeholder
- [ ] Run: `bun run optimize-covers` — should complete without errors
- [ ] Verify no raw/unoptimized images are served in production
- [ ] Verify favicon generation script works: `bun run generate-favicons`

---

## 18. Progressive Enhancement & Offline

- [ ] Verify `OfflineIndicator` detects `navigator.onLine` changes
- [ ] Verify IndexedDB (Dexie) provides offline data persistence
- [ ] Verify service worker (if present) caches critical assets
- [ ] Verify service worker pauses when tab is hidden (`visibilityState`)
- [ ] Verify offline data sync resolves when connection is restored

---

## 19. Modern Svelte 5.1+ Features

- [ ] Verify `{#snippet}` is used for reusable template fragments
- [ ] Verify `$effect.active()` is used for conditional effect execution
- [ ] Verify `$effect.root()` is used for root-level effects with cleanup
- [ ] Verify `@render` tag is used for component composition
- [ ] Verify `$state.snapshot()` is used for immutable snapshots
- [ ] Verify `$state.is()` is used for reactive equality checking
- [ ] Verify `$props()` uses proper TypeScript typing

---

## 20. Tailwind CSS v4 Best Practices

```bash
# Verify Tailwind v4 CSS-first configuration
grep -n "@theme" src/app.css
grep -n "@import \"tailwindcss\"" src/app.css
```

- [ ] Configuration uses `@theme` directive (CSS-first)
- [ ] Custom theme extensions use `--color-*`, `--font-*` syntax
- [ ] Uses `@import "tailwindcss"` instead of `@tailwind`
- [ ] No `@apply` anti-patterns for composition
- [ ] Uses v4 container queries (`@container`, `@min-*`)
- [ ] Uses v4 text wrap utilities (`text-wrap`, `text-balance`)
- [ ] CSS variables follow naming conventions
- [ ] Dark mode uses `dark:` variant properly

---

## 21. Core Web Vitals 2024/2025

```bash
# Run production build and test with Lighthouse
bun run build
bun run preview
# Open Chrome DevTools > Lighthouse > Mobile and Desktop
```

### 21.1 Primary Metrics (2024 Standard)

- [ ] INP (Interaction to Next Paint) < 200ms "Good"
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] TTFB (Time to First Byte) < 800ms
- [ ] FCP (First Contentful Paint) < 1.8s

### 21.2 Supporting Metrics

- [ ] TBT (Total Blocking Time) < 200ms
- [ ] Speed Index < 3.4s

### 21.3 INP Optimization

- [ ] Verify `scheduler.yield()` or `setTimeout` used for long tasks
- [ ] No forced synchronous layouts (read/write separation)
- [ ] Event handlers are debounced/throttled
- [ ] `content-visibility` used on off-screen content
- [ ] Virtual scrolling implemented for long lists

---

## 22. Bun-Specific Optimizations

```bash
# Verify Bun lockfile is committed
ls -la bun.lock

# Verify Bun-specific scripts work
bun install --frozen-lockfile
bun run build
```

- [ ] `bun.lock` is committed (not package-lock.json or yarn.lock)
- [ ] All scripts use Bun (`bun install`, `bun run`)
- [ ] TypeScript config includes `@types/bun`
- [ ] Bun's built-in bundler considered for edge cases
- [ ] Bun's file I/O APIs used where beneficial (`Bun.file()`)
- [ ] Cloudflare Workers compatible with Bun runtime features
- [ ] `bun:test` runner works if applicable

---

## 23. Advanced Security

### 23.1 Content Security Policy (CSP)

```bash
# Check CSP headers in build output
grep -rn "Content-Security-Policy" build/ .svelte-kit/
```

- [ ] CSP headers configured via `svelte.config.js` or meta tags
- [ ] `default-src 'self'` as baseline policy
- [ ] `script-src` uses nonces or hashes (no `unsafe-inline`)
- [ ] `style-src 'unsafe-inline'` documented if needed for Tailwind
- [ ] `img-src` includes `data:` and `blob:` if used
- [ ] `connect-src` restricts API endpoints
- [ ] `frame-ancestors` prevents clickjacking
- [ ] Report-only mode tested before enforcement

### 23.2 Subresource Integrity (SRI)

- [ ] External scripts have integrity attributes
- [ ] External stylesheets have integrity attributes
- [ ] SRI hashes verified during build

### 23.3 Trusted Types

- [ ] Trusted Types policy defined if using DOM XSS sinks
- [ ] `require-trusted-types-for 'script'` in CSP

### 23.4 Permissions Policy

- [ ] `Permissions-Policy` header restricts unused features
- [ ] Unused features disabled (geolocation, camera, microphone)
- [ ] Only required features enabled

### 23.5 Security Headers

- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] `Strict-Transport-Security` (HSTS) for HTTPS
- [ ] `Cross-Origin-Embedder-Policy: require-corp`
- [ ] `Cross-Origin-Opener-Policy: same-origin`

---

## 24. Modern Web APIs

### 24.1 View Transitions API

- [ ] View Transitions API used for page navigations
- [ ] `document.startViewTransition()` is feature-detected
- [ ] CSS `view-transition-name` applied to shared elements
- [ ] Fallback behavior for unsupported browsers

### 24.2 Speculation Rules API

- [ ] Speculation rules configured for prerender/prefetch
- [ ] Rules target high-probability navigation paths
- [ ] `eagerness` tuned (immediate, eager, moderate, conservative)

### 24.3 Import Maps

- [ ] Import map defined for module resolution
- [ ] CDN URLs use integrity hashes
- [ ] Scoped imports used where appropriate

### 24.4 Other Modern APIs

- [ ] `navigator.storage` API for quota management
- [ ] `BroadcastChannel` for cross-tab communication
- [ ] `Page Visibility API` for pausing expensive operations
- [ ] `Performance Observer` for custom metrics
- [ ] `Intersection Observer v2` for visibility
- [ ] `Resize Observer` for responsive components

---

## 25. Progressive Web App (PWA)

### 25.1 Service Worker

```bash
# Verify service worker is generated
ls -la build/service-worker.js 2>/dev/null || echo "No service worker found"
```

- [ ] Service worker is registered and installs correctly
- [ ] Cache-first strategy for static assets
- [ ] Network-first or stale-while-revalidate for API calls
- [ ] Background sync for offline mutations
- [ ] Service worker updates gracefully (skip waiting)
- [ ] Service worker size under 100KB
- [ ] Push notifications handled if implemented

### 25.2 Web App Manifest

```bash
# Verify manifest exists
ls -la static/manifest.json
```

- [ ] `manifest.json` exists and is valid
- [ ] All required fields present
- [ ] Icons include 192x192 and 512x512 sizes
- [ ] `theme_color` and `background_color` match app theme
- [ ] `display: standalone` or `minimal-ui`
- [ ] `categories` and `screenshots` provided
- [ ] `shortcuts` defined for quick actions

### 25.3 Offline Experience

- [ ] Offline indicator shows when connection lost
- [ ] Critical functionality works offline
- [ ] Data syncs when connection restored
- [ ] IndexedDB/Dexie provides offline persistence
- [ ] Background fetch API for large downloads
- [ ] Periodic background sync for updates

### 25.4 Install Experience

- [ ] `beforeinstallprompt` event handled
- [ ] PWA passes Lighthouse PWA audit
- [ ] App works as standalone without browser chrome

---

## 26. Zod v4 Features

```bash
# Verify Zod version
bun list zod
```

- [ ] Use `z.interface()` for better performance
- [ ] Use branded types (`z.brand()`) for nominal typing
- [ ] Use pipeline API (`z.pipeline()`) for transformations
- [ ] Use `z.coerce` for type coercion
- [ ] Use `z.strictObject()` when extra properties not allowed
- [ ] Improved error messages with custom issues
- [ ] Use generics with schemas for reusable validation
- [ ] Async refinements for async validation
- [ ] Use `z.preprocess()` for input sanitization
- [ ] Schema composition with `z.union()`, `z.intersection()`

---

## 27. Developer Experience (DX)

### 27.1 Git Hooks

```bash
# Verify git hooks are configured
ls -la .git/hooks/
```

- [ ] `lefthook` or `husky` configured for pre-commit hooks
- [ ] `lint-staged` runs linting on staged files
- [ ] Pre-commit hook runs: lint, format, type-check
- [ ] Commit message hook enforces conventional commits

### 27.2 Editor Configuration

```bash
# Verify editor config files exist
ls -la .editorconfig .vscode/
```

- [ ] `.editorconfig` exists with consistent settings
- [ ] `.vscode/extensions.json` recommends extensions
- [ ] `.vscode/settings.json` configures editor
- [ ] TypeScript plugin recommendations included
- [ ] Svelte extension and settings configured

### 27.3 Scripts & Automation

- [ ] `package.json` scripts well-organized and documented
- [ ] Composite scripts exist (e.g., `validate`)
- [ ] Script naming follows conventions
- [ ] `Makefile` or task runner for complex workflows
- [ ] Health check script verifies environment

### 27.4 Versioning & Releases

- [ ] `package.json` version follows semantic versioning
- [ ] `CHANGELOG.md` exists and maintained
- [ ] Git tags used for releases
- [ ] Version displayed in app UI

### 27.5 Documentation

- [ ] `CONTRIBUTING.md` exists for contributors
- [ ] Architecture Decision Records (ADRs) for major decisions
- [ ] API documentation auto-generated
- [ ] Component documentation/storybook if applicable
- [ ] Setup troubleshooting guide

---

## 28. Cloudflare Platform Features

### 28.1 Workers & Edge

```bash
# Verify wrangler.toml
cat wrangler.toml
```

- [ ] `wrangler.toml` properly configured with all bindings
- [ ] Durable Objects used for coordination if needed
- [ ] R2 integration for object storage
- [ ] D1 database bindings if using SQLite at edge
- [ ] Queues for background job processing
- [ ] Analytics Engine for metrics
- [ ] Proper error handling and logging in Workers
- [ ] Workers use `compatibility_date` and `compatibility_flags`

### 28.2 Pages & Deployment

- [ ] Cloudflare Pages build command configured
- [ ] Environment variables managed via Cloudflare dashboard
- [ ] Preview deployments enabled for branches
- [ ] Custom domains configured if applicable
- [ ] Redirect rules configured in `_redirects`
- [ ] Headers configured in `_headers`

### 28.3 Performance Features

- [ ] Cloudflare Images used for optimization
- [ ] Early Hints (HTTP 103) enabled
- [ ] Auto Minify enabled for CSS/JS/HTML
- [ ] Brotli compression enabled
- [ ] Cache rules configured for static assets
- [ ] Smart Placement configured for Workers

---

## 29. Additional 10/10 Requirements

### 29.1 Code Quality Excellence

```bash
# Verify zero warnings
bun run lint
bun run check
```

- [ ] Zero lint warnings (not just errors)
- [ ] Cyclomatic complexity < 10 per function
- [ ] Functions have single responsibility
- [ ] No code duplication (DRY principle)
- [ ] Meaningful variable and function names
- [ ] JSDoc comments for public APIs
- [ ] No commented-out code
- [ ] Consistent code style throughout

### 29.2 Performance Excellence

- [ ] Lighthouse score 100 (not just 95+)
- [ ] Core Web Vitals "Good" on all metrics
- [ ] Bundle size under budget limits
- [ ] Zero render-blocking resources
- [ ] Critical CSS inlined
- [ ] Font loading optimized (FOUT elimination)

### 29.3 Accessibility Excellence

```bash
# Run axe-core audit
npx axe-core --help 2>/dev/null || echo "Install axe-core CLI for automated testing"
```

- [ ] WCAG 2.2 Level AA compliance
- [ ] Tested with actual screen readers
- [ ] Keyboard-only navigation fully functional
- [ ] High contrast mode support
- [ ] Focus visible on all interactive elements
- [ ] Skip links implemented
- [ ] Form error messages clearly associated

### 29.4 User Experience Excellence

- [ ] Loading states for all async operations
- [ ] Error boundaries prevent app crashes
- [ ] Empty states guide users
- [ ] Confirmation dialogs for destructive actions
- [ ] Undo functionality for critical actions
- [ ] Smooth transitions and micro-interactions
- [ ] Responsive images with art direction
- [ ] Touch gestures work correctly

---

## 30. Final Validation Pipeline

Run the complete validation pipeline in order:

```bash
# Step 1: Format
bun run format

# Step 2: Lint
bun run lint

# Step 3: Type check
bun run check

# Step 4: Tests
bun run test

# Step 5: Build
bun run build

# Step 6: Preview and manual verification
bun run preview
```

### Final Gate Checks
- [ ] Step 1 (format) — clean, no changes needed
- [ ] Step 2 (lint) — zero errors, zero warnings
- [ ] Step 3 (check) — zero TypeScript errors
- [ ] Step 4 (test) — all tests pass, zero failures
- [ ] Step 5 (build) — successful, zero errors, zero warnings
- [ ] Step 6 (preview) — app loads correctly, all routes work

### Regression Search
```bash
grep -rn "as any\|as unknown" src/ || echo "✓ No type assertions"
grep -rn "TODO\|FIXME\|XXX\|HACK" src/ || echo "✓ No TODOs"
grep -rn "debugger;" src/ || echo "✓ No debugger statements"
grep -rn "console\.log" src/lib/ src/routes/ --include="*.svelte" --include="*.ts" | grep -v "console.error\|console.warn" || echo "✓ No console.log"
grep -rn '\$inspect' src/ || echo "✓ No $inspect"
```
- [ ] Zero type assertions found
- [ ] Zero TODO/FIXME comments found
- [ ] Zero debugger statements found
- [ ] Zero console.log statements (only console.error/warn in error paths)
- [ ] Zero $inspect statements

---

## Summary

| Section | Checks | Status |
|---------|--------|--------|
| 1. TypeScript & Type Safety | 12 | ☐ |
| 2. Svelte 5 Runes | 18 | ☐ |
| 3. State Management | 14 | ☐ |
| 4. SvelteKit Routing | 9 | ☐ |
| 5. Styling & Tailwind CSS 4 | 17 | ☐ |
| 6. Performance | 22 | ☐ |
| 7. Accessibility | 30 | ☐ |
| 8. Security | 15 | ☐ |
| 9. Testing | 24 | ☐ |
| 10. Build & Deployment | 16 | ☐ |
| 11. Code Quality & Linting | 13 | ☐ |
| 12. Error Handling | 8 | ☐ |
| 13. SEO & Meta | 8 | ☐ |
| 14. Documentation | 8 | ☐ |
| 15. Cloudflare Functions | 9 | ☐ |
| 16. Data Layer | 9 | ☐ |
| 17. Images & Assets | 8 | ☐ |
| 18. Progressive Enhancement & Offline | 5 | ☐ |
| 19. Modern Svelte 5.1+ Features | 7 | ☐ |
| 20. Tailwind CSS v4 Best Practices | 8 | ☐ |
| 21. Core Web Vitals 2024/2025 | 12 | ☐ |
| 22. Bun-Specific Optimizations | 7 | ☐ |
| 23. Advanced Security | 22 | ☐ |
| 24. Modern Web APIs | 12 | ☐ |
| 25. Progressive Web App (PWA) | 20 | ☐ |
| 26. Zod v4 Features | 10 | ☐ |
| 27. Developer Experience (DX) | 20 | ☐ |
| 28. Cloudflare Platform Features | 18 | ☐ |
| 29. Additional 10/10 Requirements | 28 | ☐ |
| 30. Final Validation | 10 | ☐ |
| **Total** | **~400** | ☐ |

---

*When all ~400 checks pass, the project is verified at 10/10 quality.*

*Last Updated: 15 February 2026*
