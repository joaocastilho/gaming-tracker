# Gaming Tracker — Comprehensive Quality, Performance & Best Practices Review

**Project**: Gaming Tracker  
**Tech Stack**: SvelteKit 2 · Svelte 5 Runes · TypeScript 5.9 (strict) · Tailwind CSS 4 · Bun · Vite 7 · Dexie.js · Zod · Cloudflare Workers  
**Review Date**: 15 February 2026  
**Scope**: Full-stack client + edge functions, covering code quality, architecture, performance, accessibility, security, testing, build/deploy, documentation, and developer experience.

---

## Table of Contents

1. [TypeScript & Type Safety](#1-typescript--type-safety)
2. [Svelte 5 Runes & Component Architecture](#2-svelte-5-runes--component-architecture)
3. [State Management (Stores)](#3-state-management-stores)
4. [SvelteKit Routing & Data Loading](#4-sveltekit-routing--data-loading)
5. [Styling & Tailwind CSS 4](#5-styling--tailwind-css-4)
6. [Performance](#6-performance)
7. [Accessibility (a11y)](#7-accessibility-a11y)
8. [Security](#8-security)
9. [Testing](#9-testing)
10. [Build, Bundle & Deployment](#10-build-bundle--deployment)
11. [Code Quality & Linting](#11-code-quality--linting)
12. [Error Handling](#12-error-handling)
13. [SEO & Meta](#13-seo--meta)
14. [Documentation & Developer Experience](#14-documentation--developer-experience)
15. [Cloudflare Functions & Edge API](#15-cloudflare-functions--edge-api)
16. [Data Layer & Validation](#16-data-layer--validation)
17. [Image Pipeline & Static Assets](#17-image-pipeline--static-assets)
18. [Progressive Enhancement & Offline](#18-progressive-enhancement--offline)
19. [Scoring Rubric](#19-scoring-rubric)

---

## 1. TypeScript & Type Safety

A 10/10 project in TypeScript requires **zero tolerance for type escapes** and maximum benefit from the compiler.

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 1.1 | `tsconfig.json` has `"strict": true` enabled | Enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc. |
| 1.2 | `noUnusedLocals` and `noUnusedParameters` are `true` | Prevents dead code accumulation |
| 1.3 | Zero `as any` or `as unknown as T` assertions in `src/` | Each assertion is a type-safety hole; fix types at the source |
| 1.4 | No `@ts-ignore` or `@ts-expect-error` without an adjacent comment explaining why | Silently ignoring errors hides bugs |
| 1.5 | No `// eslint-disable @typescript-eslint/no-explicit-any` overrides | Same as above, at the lint level |
| 1.6 | All public store methods and utility functions have **explicit return type annotations** | Prevents accidental type widening |
| 1.7 | `catch` blocks type the error as `unknown` and use type guards — never `catch (e: any)` | Prevents masking unexpected error shapes |
| 1.8 | Generic components (e.g., `VirtualList`) use constrained generics (`<T extends { id: string }>`) | Ensures type-safe item rendering |
| 1.9 | Shared types between frontend and Cloudflare Functions are imported from a single source (`src/lib/types/`) | Prevents type drift between client and edge |
| 1.10 | `app.d.ts` properly extends `App` namespace with custom `PageState`, `Platform`, etc. | SvelteKit-specific type augmentation |
| 1.11 | Discriminated unions used for state (e.g., `Game` should be `PlannedGame | CompletedGame` with status discriminant) | Eliminates nullable field ambiguity |
| 1.12 | Zod schemas infer TypeScript types (`z.infer<typeof GameSchema>`) instead of manually maintaining parallel types | Single source of truth |

### Standards

- **Target**: `bun run check` produces zero errors and zero warnings.
- **Metric**: `grep -rn "as any\|as unknown" src/` returns zero results.
- **Best Practice**: Prefer `satisfies` over `as` for type assertions introduced in TS 4.9+.

---

## 2. Svelte 5 Runes & Component Architecture

Svelte 5 introduces a new reactivity model. A top-tier project must use it consistently and idiomatically.

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 2.1 | **Zero legacy patterns**: No `$:` reactive declarations, no `onMount`/`onDestroy` (use `$effect`), no `createEventDispatcher` (use callback props) | Svelte 5 Runes replace all of these |
| 2.2 | All component props declared with `let { prop1, prop2 } = $props()` | Modern Svelte 5 props pattern |
| 2.3 | Computed values use `$derived` or `$derived.by()` — never `$:` or manual recalculation | Ensures fine-grained reactivity |
| 2.4 | Side effects use `$effect` with proper cleanup (return a cleanup function) | Prevents memory leaks from event listeners, timers, observers |
| 2.5 | No `$effect` used for derived state (it should only be for side effects like DOM manipulation, subscriptions, URL updates) | `$effect` for derived values is an anti-pattern that causes unnecessary re-renders |
| 2.6 | Component size: no single `.svelte` file exceeds ~500 lines (UI + script + style) | Large monoliths are hard to maintain; extract sub-components |
| 2.7 | `DetailModal.svelte` (65 KB) should be evaluated for decomposition into smaller logical components | Reduce cognitive load and improve testability |
| 2.8 | `+layout.svelte` (34 KB) should be evaluated for extracting logic into dedicated components or layout utilities | God-layout anti-pattern |
| 2.9 | Components follow **Single Responsibility Principle** — each does one thing well | Ensures reusability and testability |
| 2.10 | No direct DOM manipulation (`document.querySelector`, etc.) — use Svelte bindings (`bind:this`, `use:action`) | Keeps Svelte in control of the DOM |
| 2.11 | `$inspect()` is not present in production code (development-only debugging tool) | Would log to console in prod |
| 2.12 | Snippets (`{#snippet}`) are used for reusable template fragments within components | Svelte 5 feature replacing slots in some cases |
| 2.13 | Event handlers use the new `onclick={handler}` syntax, not `on:click={handler}` | Svelte 5 event handler syntax |
| 2.14 | Use `{@render children()}` pattern for slot-like children in Svelte 5 | Replaces `<slot>` |
| 2.15 | Transitions and animations use Svelte's built-in transition directives | Consistent animation behavior |

### Standards

- **Global rule**: Zero instances of legacy Svelte 3/4 patterns.
- **File size ceiling**: Aim for <500 lines per `.svelte` file. Files above this should have documented justification or a decomposition plan.

---

## 3. State Management (Stores)

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 3.1 | Stores use the class-based pattern with `$state`, `$derived` getters, and action methods | Modern Svelte 5 store pattern |
| 3.2 | No legacy `writable()` / `readable()` / `derived()` from `svelte/store` | Deprecated pattern in Svelte 5 Runes |
| 3.3 | No `subscribe()` methods on stores — components access state via direct property access | Legacy compat should not exist in production |
| 3.4 | Private fields use underscore prefix (`_games`) with public getters | Encapsulation |
| 3.5 | Store instances are singleton exports (`export const gamesStore = new GamesStore()`) | Prevents multiple instances |
| 3.6 | No circular dependencies between stores | Causes infinite loops and unpredictable behavior |
| 3.7 | State mutations are immutable (e.g., `this._games = [...this._games, newGame]` not `this._games.push(newGame)`) | Svelte 5 `$state` requires new references for reactivity on arrays/objects |
| 3.8 | `filteredGamesStore` caching uses a stable cache key strategy that doesn't cause stale reads | Prevents serving outdated data |
| 3.9 | URL ↔ state synchronization is bidirectional and idempotent (URL → state on load, state → URL on action, no infinite loops) | Deep-linking and shareability |
| 3.10 | Debounced URL updates (300ms for search) don't lose state on rapid navigation | Edge case: user types fast then hits Enter |
| 3.11 | Store reset/cleanup logic exists and is called appropriately (e.g., on tab switch, logout) | Prevents state leakage |
| 3.12 | `editorStore` properly validates form state before submission and shows loading states | Prevents double-submit |

---

## 4. SvelteKit Routing & Data Loading

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 4.1 | `+layout.ts` load function handles errors gracefully with try/catch and fallback | Prevents blank screens |
| 4.2 | Static adapter is correctly configured with `fallback: '404.html'` and `precompress: true` | Required for SPA behavior on static hosting |
| 4.3 | All routes under `src/routes/` have proper `+page.ts` or `+page.svelte` files | SvelteKit conventions |
| 4.4 | Route-level `prerender` is correctly configured (static pages should be prerendered) | Improves FCP |
| 4.5 | Browser back/forward navigation preserves filter, search, and sort state from URL params | Critical UX requirement |
| 4.6 | Deep-linking works: opening `/?s=zelda&platform=PC` restores full state | Shareability |
| 4.7 | Modal deep-linking works: opening `/?game=slug` opens the detail modal directly | Shareability |
| 4.8 | Error page `+error.svelte` exists and provides helpful user feedback | SvelteKit convention |
| 4.9 | `goto()` usage always provides `{ replaceState: true }` for filter/search URL updates to avoid polluting browser history | UX: back button should not navigate through every filter change |
| 4.10 | No server-only code leaking into client bundles (check for `$env/static/private` imports in client code) | Security and bundle size |

---

## 5. Styling & Tailwind CSS 4

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 5.1 | Tailwind CSS v4 is properly configured with `@tailwindcss/postcss` plugin | v4 uses a new engine |
| 5.2 | Custom CSS in `app.css` uses CSS custom properties for theming (dark/light mode variables) | Enables clean theme switching |
| 5.3 | Dark mode is implemented via class strategy (`.dark` on `<html>`) with proper transitions | Standard approach for user-toggleable themes |
| 5.4 | No hardcoded colors in component `<style>` blocks — everything references CSS variables or Tailwind classes | Consistency and maintainability |
| 5.5 | `@tailwindcss/forms` plugin is correctly applied for form element resets | Consistent form styling |
| 5.6 | No `!important` overrides in custom CSS (indicates specificity issues) | Code smell |
| 5.7 | Responsive design uses mobile-first approach with ascending breakpoints (`sm:`, `md:`, `lg:`, `xl:`) | Tailwind convention |
| 5.8 | All interactive elements have visible focus indicators (`:focus-visible` ring) | Accessibility requirement |
| 5.9 | Color contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text) in both themes | Accessibility compliance |
| 5.10 | No unused CSS classes accumulate in production builds (Tailwind v4 tree-shakes automatically) | Bundle size |
| 5.11 | `postcss.config.js` has proper plugin chain (Tailwind → Autoprefixer) | Build correctness |
| 5.12 | CSS animations use `prefers-reduced-motion` media query for users who disable animations | Accessibility |
| 5.13 | `font-display: swap` is set for all web fonts (e.g., Google Fonts) | Prevents FOIT (Flash of Invisible Text) |
| 5.14 | Font loading is non-blocking (preload or async) | Performance |
| 5.15 | No inline styles (`style="..."`) in components — use Tailwind classes or CSS variables | Maintainability |

---

## 6. Performance

### What to Check

#### 6.1 Core Web Vitals

| # | Metric | Target | How to Measure |
|---|--------|--------|----------------|
| 6.1.1 | First Contentful Paint (FCP) | < 1.8s (mobile) | Lighthouse |
| 6.1.2 | Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| 6.1.3 | Total Blocking Time (TBT) | < 200ms | Lighthouse |
| 6.1.4 | Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| 6.1.5 | Interaction to Next Paint (INP) | < 200ms | Chrome UX Report |
| 6.1.6 | Lighthouse Performance score | ≥ 95 (mobile & desktop) | Lighthouse |

#### 6.2 Bundle & Loading

| # | Check | Why It Matters |
|---|-------|----------------|
| 6.2.1 | Initial JS bundle < 200 KB gzipped | Fast first load |
| 6.2.2 | CSS is code-split and loaded only for used routes | Reduces unused CSS |
| 6.2.3 | `manualChunks` in `vite.config.ts` correctly splits vendor and app code | Parallel loading, better caching |
| 6.2.4 | `rollup-plugin-visualizer` installed and bundle composition reviewed | Identify heavy dependencies |
| 6.2.5 | Tree-shaking working: no unused library code in production bundle | Verify with visualizer |
| 6.2.6 | `modulePreload: { polyfill: false }` is set (browsers support native module preload) | Reduces polyfill overhead |
| 6.2.7 | `precompress: true` in static adapter enables gzip/brotli pre-compression | Faster served responses |
| 6.2.8 | No dynamic `import()` of modules that are always needed on initial render | Prevents waterfall loading |

#### 6.3 Runtime Performance

| # | Check | Why It Matters |
|---|-------|----------------|
| 6.3.1 | Virtual scrolling (`VirtualList.svelte`) correctly renders only visible items + overscan buffer | O(visible) DOM nodes |
| 6.3.2 | `filteredGamesStore` uses cache key memoization — recomputes only when inputs change | Avoids O(n) filtering on every render |
| 6.3.3 | Search input debounced at 300ms to prevent rapid recomputation | Prevents jank during typing |
| 6.3.4 | Images use `loading="lazy"` with priority for above-fold images | Reduces initial network calls |
| 6.3.5 | `ResizeObserver` and `IntersectionObserver` are properly disconnected in cleanup | Prevents memory leaks |
| 6.3.6 | Scroll event listeners use `{ passive: true }` | Allows browser scroll optimization |
| 6.3.7 | `content-visibility: auto` used on off-screen sections (e.g., `TierRow`) | Skips rendering of hidden content |
| 6.3.8 | Canvas singleton for text measurement (reuse, don't recreate per component) | Reduces GC pressure |
| 6.3.9 | No expensive computations in `$derived` without memoization | `$derived` runs on every dependency change |
| 6.3.10 | `requestAnimationFrame` used for scroll-related visual updates | Prevents layout thrashing |

---

## 7. Accessibility (a11y)

### What to Check

| # | Check | Standard | Why It Matters |
|---|-------|----------|----------------|
| 7.1 | axe-core audit on all routes returns zero critical and serious violations | WCAG 2.1 AA | Legal compliance in many jurisdictions |
| 7.2 | All images have descriptive `alt` text (e.g., `alt="Game cover for {game.title}"`) | WCAG 1.1.1 | Screen reader content |
| 7.3 | All form inputs have associated `<label>` elements or `aria-label` | WCAG 1.3.1 | Form accessibility |
| 7.4 | Modals implement focus trapping (focus stays within modal when open) | WCAG 2.1.2 | Keyboard users can't tab out of modal |
| 7.5 | Modals restore focus to trigger element on close | Best practice | Prevents focus loss |
| 7.6 | Modals use `role="dialog"` and `aria-modal="true"` with `aria-labelledby` | WCAG 4.1.2 | Screen reader announces dialog |
| 7.7 | Escape key closes all modals | WCAG 2.1.1 | Keyboard navigation |
| 7.8 | Skip-to-content link exists and is first focusable element | WCAG 2.4.1 | Bypass navigation for keyboard users |
| 7.9 | Color is not the only means of conveying information (e.g., tier badges have text AND color) | WCAG 1.4.1 | Color-blind users |
| 7.10 | Interactive elements have minimum 44×44px touch target size | WCAG 2.5.5 (AAA) / Apple HIG | Mobile usability |
| 7.11 | Focus indicators are visible and high-contrast (`:focus-visible` style) | WCAG 2.4.7 | Keyboard navigation visibility |
| 7.12 | Page has proper heading hierarchy (`<h1>` once, `<h2>` nested, etc.) | WCAG 1.3.1 | Document structure for screen readers |
| 7.13 | `<main>`, `<nav>`, `<header>`, `<footer>` landmark elements are used correctly | WCAG 1.3.1 | Screen reader navigation |
| 7.14 | Dynamic content changes announce to screen readers via `aria-live` regions | WCAG 4.1.3 | Status messages (e.g., "3 games found") |
| 7.15 | `prefers-reduced-motion` is respected for all animations | WCAG 2.3.3 | Motion sensitivity |
| 7.16 | Tab order follows logical visual order (left-to-right, top-to-bottom) | WCAG 2.4.3 | Keyboard navigation consistency |
| 7.17 | Dropdown filters are keyboard-navigable with arrow keys | WCAG 2.1.1 | Full keyboard operability |
| 7.18 | Loading/skeleton states have `aria-busy="true"` on the container | Best practice | Screen reader announces loading state |

---

## 8. Security

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 8.1 | Zero usage of `{@html}` with user-provided content (XSS vector) | Svelte's safe templating is bypassed |
| 8.2 | All user inputs validated with Zod schemas before processing | Prevents injection and data corruption |
| 8.3 | `innerHTML` is never used in TypeScript/JavaScript code | XSS prevention |
| 8.4 | URL slugs are validated before use in DOM or store lookups | Prevents injection via URL params |
| 8.5 | Cloudflare Worker endpoints validate `Content-Type` header | Prevents CSRF-like attacks |
| 8.6 | Session cookie uses `HttpOnly`, `Secure`, `SameSite=Lax`, and has an expiry | Cookie security best practices |
| 8.7 | No secrets (API keys, tokens) are exposed in client-side code or source control | Check `$env/static/private` usage |
| 8.8 | Rate limiting is implemented on login and write endpoints | Brute-force protection |
| 8.9 | Error responses don't leak stack traces or internal details | Information disclosure |
| 8.10 | CSP headers are configured (even if using `unsafe-inline` for SvelteKit — this should be documented) | Defense in depth |
| 8.11 | `GITHUB_TOKEN` and `SESSION_SECRET` are only accessed server-side (Cloudflare Worker env) | Never in client bundles |
| 8.12 | Password comparison uses timing-safe comparison (constant-time) | Prevents timing attacks |
| 8.13 | Dependencies are regularly audited for vulnerabilities (`bun audit` or similar) | Supply chain security |

---

## 9. Testing

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 9.1 | `bun run test` (or `vitest run`) passes with zero failures | Baseline requirement |
| 9.2 | No `.skip` or `.only` in committed test files | Prevents accidentally disabling tests |
| 9.3 | Test coverage exceeds 80% for critical paths (stores, utils, validation) | Confidence in correctness |
| 9.4 | Store tests cover CRUD operations, edge cases, and error states | Stores are the application core |
| 9.5 | Component tests use `@testing-library/svelte` for user-centric assertions | Test behavior, not implementation |
| 9.6 | No `as any` or `as Game` type assertions in test code | Tests should be type-safe too |
| 9.7 | Test setup files (`tests/setup.ts`) properly configure mocks for SvelteKit modules (`$app/*`) | Prevents import resolution errors |
| 9.8 | `fake-indexeddb` is correctly initialized as `setupFiles` in `vitest.config.ts` | Required for Dexie.js testing |
| 9.9 | Tests use `restoreMocks: true` to prevent mock leakage between tests | Test isolation |
| 9.10 | Test file naming follows `test-{feature}.test.ts` convention | Consistency |
| 9.11 | Each test has clear describe/it blocks with descriptive names | Readability |
| 9.12 | Integration tests verify cross-store interactions (e.g., filter + sort + search) | Catch integration bugs |
| 9.13 | No tests depend on execution order (each test is independently runnable) | Fragility prevention |
| 9.14 | E2E tests with Playwright or similar cover critical user flows | Highest confidence |
| 9.15 | Visual regression tests exist for critical UI components (or plan documented) | Catch unintended visual changes |
| 9.16 | Tests for URL ↔ state synchronization verify both directions | Critical for deep-linking |
| 9.17 | Tests for Cloudflare Functions verify login, save, rate limiting, and GitHub sync | Edge API reliability |
| 9.18 | Test execution time is < 30 seconds for the full suite | Developer experience |

---

## 10. Build, Bundle & Deployment

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 10.1 | `bun run build` completes with zero errors and zero warnings | Build integrity |
| 10.2 | Static adapter outputs to `build/` with correct `fallback` for SPA routing | Required for client-side routing |
| 10.3 | `precompress: true` generates `.gz` and `.br` files for all assets | Faster served responses |
| 10.4 | `vite.config.ts` `manualChunks` produces reasonable chunk sizes (no single chunk > 500 KB) | Loading performance |
| 10.5 | Sourcemaps disabled for production (`sourcemap: false`) | Security and bundle size |
| 10.6 | `build.target` is appropriate for browser support (currently `es2020`) | Compatibility |
| 10.7 | CSS is minified in production build | Bundle size |
| 10.8 | JavaScript is minified with `esbuild` (or `terser`) | Bundle size |
| 10.9 | `assetsInlineLimit: 4096` prevents inlining large assets | Balance between requests and bundle size |
| 10.10 | No development-only code (console.log, $inspect, debugger) in production bundle | Clean production output |
| 10.11 | HTML comments are stripped from production builds (Svelte preprocessor or post-build) | Clean output |
| 10.12 | GitHub Actions CI pipeline exists and runs lint + check + test + build | Automated quality gates |
| 10.13 | Cloudflare Pages deployment is connected to the repo with automatic builds | Continuous deployment |
| 10.14 | Cache headers for static assets use hashed filenames with long cache (`Cache-Control: max-age=31536000, immutable`) | Asset caching |
| 10.15 | `wrangler.toml` correctly configures KV namespace bindings and compatibility date | Cloudflare deployment |

---

## 11. Code Quality & Linting

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 11.1 | `bun run lint` produces zero errors and zero warnings | Baseline code quality |
| 11.2 | `bun run format:check` confirms all files match Prettier formatting | Consistent style |
| 11.3 | ESLint config enforces `@typescript-eslint/no-explicit-any` (currently `off` — should be `error`) | Type safety enforcement |
| 11.4 | `@typescript-eslint/no-non-null-assertion` is enabled (currently `off`) | Prevents runtime null crashes |
| 11.5 | `svelte/no-at-html-tags` is enabled (currently `off`) | XSS prevention |
| 11.6 | No `TODO`, `FIXME`, `HACK`, or `XXX` comments in `src/` | Clean codebase |
| 11.7 | No `debugger;` statements in `src/` | Development artifacts |
| 11.8 | Console statements (`console.log/warn/error`) are justified — only in error-handling paths, not general logging | Clean production output |
| 11.9 | Import order is consistent: external → internal absolute → relative → styles | Readability |
| 11.10 | File naming follows conventions: PascalCase for components, camelCase.svelte.ts for stores, camelCase.ts for utils, test-kebab-case.test.ts for tests | Consistency |
| 11.11 | Comments are meaningful — no obvious comments like `// increment counter` | Clean code |
| 11.12 | Magic numbers are extracted to named constants | Readability |
| 11.13 | Dead code (unreachable branches, unused functions) has been eliminated | Clean codebase |
| 11.14 | `.prettierrc` configuration matches team standards (printWidth, tabWidth, singleQuote, plugins) | Consistency |
| 11.15 | `.gitignore` excludes all generated files (`build/`, `node_modules/`, `.svelte-kit/`, etc.) | Clean repository |

---

## 12. Error Handling

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 12.1 | No silent `catch` blocks — all exceptions are logged or surfaced | Prevents hidden failures |
| 12.2 | `+error.svelte` provides user-friendly error UI with recovery options | UX for unexpected errors |
| 12.3 | Data loading errors show meaningful fallback UI (not blank screen) | UX resilience |
| 12.4 | Image loading errors show a gradient placeholder (not broken image icon) | Visual consistency |
| 12.5 | Network errors (offline, API failures) are handled with retry or user notification | Offline resilience |
| 12.6 | Form validation errors are displayed inline next to the relevant field with `aria-describedby` | Accessibility and UX |
| 12.7 | Custom error types or error codes are used for domain-specific errors (instead of generic `Error`) | Debuggability |
| 12.8 | Error boundaries prevent single-component errors from crashing the entire app | Fault isolation |
| 12.9 | Cloudflare Worker errors return proper HTTP status codes with JSON error bodies | API contract |
| 12.10 | Error logs do not contain sensitive information (passwords, tokens, PII) | Security |

---

## 13. SEO & Meta

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 13.1 | `<title>` tag is dynamic and descriptive per route (e.g., "Completed Games — Gaming Tracker") | Search engine indexing |
| 13.2 | `<meta name="description">` is present and descriptive | Search result snippets |
| 13.3 | Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`) are present | Social media sharing previews |
| 13.4 | Canonical URL (`<link rel="canonical">`) is set | Prevents duplicate content |
| 13.5 | Single `<h1>` per page with proper heading hierarchy | Document structure |
| 13.6 | Semantic HTML5 elements (`<main>`, `<nav>`, `<article>`, `<section>`) are used | SEO and accessibility |
| 13.7 | `robots.txt` exists if needed (allow/disallow specific paths) | Search engine crawling |
| 13.8 | Sitemap generation is configured for static pages | Search engine discovery |
| 13.9 | Lighthouse SEO score is 100 | Comprehensive check |
| 13.10 | Favicon set includes multiple sizes (16x16, 32x32, apple-touch-icon, etc.) | Cross-device support |

---

## 14. Documentation & Developer Experience

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 14.1 | `README.md` has clear setup instructions, tech stack overview, and scripts documentation | Onboarding |
| 14.2 | `AGENTS.md` is up-to-date with current grade, workflow steps, and code standards | AI agent productivity |
| 14.3 | `docs/TECHNICAL.md` accurately reflects current architecture (stores, data flow, component hierarchy) | Maintenance |
| 14.4 | All `package.json` scripts are documented with their purpose | Developer experience |
| 14.5 | No obsolete documentation files that contradict current state | Prevents confusion |
| 14.6 | TypeScript types serve as documentation for data schemas (well-named, commented where non-obvious) | Self-documenting code |
| 14.7 | Complex algorithms have inline comments explaining the "why" (not the "what") | Maintenance |
| 14.8 | API endpoint documentation exists for Cloudflare Functions | Integration clarity |
| 14.9 | `.agent/workflows/` directory has up-to-date workflow definitions | Automation support |
| 14.10 | `docs/` directory is organized without redundancy (no duplicate/obsolete files) | Clean documentation |

---

## 15. Cloudflare Functions & Edge API

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 15.1 | All endpoints validate `Content-Type: application/json` | Prevents malformed requests |
| 15.2 | Login endpoint (`POST /api/login`) returns proper HTTP status codes (200, 401, 429) | API contract |
| 15.3 | Games endpoint (`POST /api/games`) validates the full payload with Zod before processing | Data integrity |
| 15.4 | GitHub sync helper handles race conditions (sha conflicts) with proper error handling | Data consistency |
| 15.5 | Rate limiting is properly implemented with KV-based sliding window | Security |
| 15.6 | CORS headers are correctly configured (or not needed for same-origin) | Security |
| 15.7 | KV writes happen only after GitHub sync succeeds (all-or-nothing) | Data consistency |
| 15.8 | Session token uses HMAC-SHA256 signing with proper expiry | Authentication security |
| 15.9 | Environment variables are documented and secrets never appear in logs | Security |
| 15.10 | Functions use the Cloudflare `compatibility_date` to access latest platform APIs | Stability |
| 15.11 | Error responses are structured JSON with consistent schema (`{ error: string }`) | API developer experience |
| 15.12 | `wrangler.toml` has correct KV binding names | Deployment correctness |

---

## 16. Data Layer & Validation

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 16.1 | Zod schemas are the single source of truth for data validation (shared between client and worker) | Consistency |
| 16.2 | `z.infer<typeof Schema>` is used to derive TypeScript types from Zod schemas | No manual type duplication |
| 16.3 | Planned games enforce `null` for rating, score, tier, and completion fields | Data integrity |
| 16.4 | Completed games enforce non-null for rating, score, tier, and completion fields | Data integrity |
| 16.5 | Score calculation `(P + S + G) / 3 × 2` is implemented as a shared utility function | Consistency between client and server |
| 16.6 | Dexie.js database schema has proper version management for migrations | Forward compatibility |
| 16.7 | Data loading gracefully falls back: Dexie → API → static `games.json` | Resilience |
| 16.8 | `games.json` structure matches the Zod schema exactly (test this) | Build correctness |
| 16.9 | UUID generation uses `crypto.randomUUID()` (browser-native, no library needed) | Security and simplicity |
| 16.10 | Date fields use ISO 8601 format consistently | Interoperability |

---

## 17. Image Pipeline & Static Assets

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 17.1 | Cover images are optimized to WebP format at 85% quality | File size reduction |
| 17.2 | Image dimensions are consistent (600×900 or documented variations) | Visual consistency |
| 17.3 | `srcset` attribute provides responsive image sizes | Bandwidth optimization |
| 17.4 | Fallback gradients/placeholders display when images fail to load | UX error handling |
| 17.5 | `scripts/optimize-covers-full.ts` runs without errors and processes all images | Build pipeline integrity |
| 17.6 | No raw/unoptimized images are served in production (only WebP from `static/covers/`) | Performance |
| 17.7 | Favicon set is generated and includes all required sizes | Cross-device support |
| 17.8 | Static assets use content-hashed filenames for cache busting (Vite does this automatically for JS/CSS) | Cache invalidation |
| 17.9 | `<img>` elements have explicit `width` and `height` attributes to prevent CLS | Layout stability |
| 17.10 | Consider AVIF format with WebP fallback for further size reduction | Future optimization |

---

## 18. Progressive Enhancement & Offline

### What to Check

| # | Check | Why It Matters |
|---|-------|----------------|
| 18.1 | App functions with JavaScript disabled (graceful degradation at minimum — show a message) | Progressive enhancement |
| 18.2 | `OfflineIndicator` component correctly detects `navigator.onLine` changes | Offline UX |
| 18.3 | Service worker (if present) correctly caches critical assets and serves them offline | Offline capability |
| 18.4 | Service worker pauses polling/sync when tab is hidden (` document.visibilityState`) | Battery and performance |
| 18.5 | IndexedDB (Dexie) provides offline data persistence beyond the session | Data durability |
| 18.6 | Offline data sync queue (in `offline.svelte.ts`) resolves correctly when connection is restored | Data consistency |

---

## 19. Scoring Rubric

Use this rubric to grade the project on a 0–10 scale:

| Score | Category | Weight | Criteria |
|-------|----------|--------|----------|
| /2.0 | **Type Safety** | 20% | Zero type escapes, strict mode, Zod inference |
| /1.5 | **Svelte 5 Idioms** | 15% | Zero legacy patterns, proper Runes usage, component decomposition |
| /1.5 | **Performance** | 15% | Lighthouse 95+, virtual scrolling, memoization, lazy loading |
| /1.0 | **Accessibility** | 10% | axe-core zero violations, keyboard nav, focus management |
| /1.0 | **Testing** | 10% | 80%+ coverage, all passing, proper isolation |
| /1.0 | **Security** | 10% | No XSS vectors, secure auth, input validation |
| /0.5 | **Build & Deploy** | 5% | Clean build, CI/CD, caching |
| /0.5 | **Code Quality** | 5% | No dead code, proper linting, naming conventions |
| /0.5 | **SEO & Meta** | 5% | Proper meta tags, heading hierarchy, semantic HTML |
| /0.5 | **Documentation** | 5% | Up-to-date, accurate, helpful |
| **10.0** | **Total** | **100%** | |

---

*This review document is designed to be comprehensive and demanding. Each check item can be independently verified. The project should achieve a passing grade on every single check to be considered 10/10.*
