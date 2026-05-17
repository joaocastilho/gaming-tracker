# Code Quality Improvement Plan

> Generated: 17 May 2026
> Baseline: lint 0 errors, typecheck 0 errors, 599 tests passing, format clean

## Priority Legend

- **P0**: Bug risk / type unsafety
- **P1**: Maintainability / clarity
- **P2**: Style / minor polish

---

## 1. Duplicate `TabValue` Type Definition ✅

**Files**: `src/lib/stores/app.svelte.ts` + `src/lib/utils/filtering.ts`

**Done**: `filtering.ts` now uses `FilterTab` (internal-only type, 4 values). `TabValue` (7 values) is defined solely in `app.svelte.ts`. A `toFilterTab()` helper bridges the gap in `filteredGamesStore.svelte.ts`.

---

## 2. Unnecessary `as BaseFilters | null` Assertions ✅

**Files**:
- `src/lib/stores/filteredGamesStore.svelte.ts:18,37`
- `src/lib/stores/filteredCounts.svelte.ts:20`

**Done**: Removed all `as BaseFilters | null` casts. TypeScript's structural typing handles it since `FilterState` is a superset of `BaseFilters`.

---

## 3. `as TabValue` Assertions (Linked to #1) ✅

**Files**:
- `src/lib/stores/modalNavigation.svelte.ts:29,32`
- `src/lib/stores/filteredGamesStore.svelte.ts:18,26`

**Done**: Removed all `as TabValue` casts. `modalNavigation` no longer needs them (same type). `filteredGamesStore` uses `toFilterTab()` helper instead of casts.

---

## 4. `as Game` Assertion in `buildNewGame` ✅

**File**: `src/lib/stores/modalForm.svelte.ts:86`

**Done**: Replaced the `as Game` cast with an explicit object that sets every `Game` field with safe defaults for missing values.

---

## 6. `buildSaveFormData` Loose Typing ✅

**File**: `src/lib/stores/editor.svelte.ts:259,457`

**Done**: Changed `{ games: unknown }` to `{ games: Game[] }` in both `buildSaveFormData` and `saveGames`. Updated tests to provide proper Game objects.
---

## 5. Redundant `as ChartOptions` Assertion ✅

**File**: `src/lib/components/Chart.svelte:59`

```typescript
function buildOptions(): ChartOptions {
    return { ... } as ChartOptions;  // redundant
}
```

**Done**: Removed the redundant `as ChartOptions` cast and the `options?.scales ||` dead code.

---

## 6. `buildSaveFormData` Loose Typing

**File**: `src/lib/stores/editor.svelte.ts:259,457`

```typescript
private buildSaveFormData(payload: { games: unknown }): FormData
async saveGames(buildPayload: () => { games: unknown }): Promise<boolean>
```

**Fix**: Replace `games: unknown` with `games: Game[]` to improve type safety through the save pipeline.

---

## 7. Redundant Methods in `editor.svelte.ts` ✅

**File**: `src/lib/stores/editor.svelte.ts`

**Done**: Removed `clearPending()` (callers updated to `discardAllChanges()`). Removed `isEditor` getter (callers use `editorMode`).

---

## 8. Repeated State Update Pattern ✅

**File**: `src/lib/stores/editor.svelte.ts`

**Done**: Extracted `private patchState(partial: Partial<EditorState>)` helper. Replaced all 16 `this._state = { ...this._state, ... }` occurrences.

---

## 9. Double `$effect` in Chart.svelte ✅

**File**: `src/lib/components/Chart.svelte:62-91`

**Done**: Removed the redundant second `$effect` block. The first already tracks `textColor` (derived from theme) through `buildOptions()` closure.

---

## 10. Confusing Spread Order in Chart.svelte ✅

**File**: `src/lib/components/Chart.svelte:47-58`

```typescript
scales: options?.scales || { ... },  // dead code
...options,
```

**Done**: Removed the dead `options?.scales || {...}` — the defaults are now set directly and `...options` still allows overrides.

---

## 11. Unused Parameters in `virtualScroll.ts` ✅

**File**: `src/lib/utils/virtualScroll.ts:1,16`

**Done**: Removed `_overscan` parameter from both `binarySearchStart` and `binarySearchEnd` signatures. Updated callers in `VirtualList.svelte` to match.

---

## 12. `initializeForTesting()` in Production Code ✅

**File**: `src/lib/stores/filters.svelte.ts:388-392`

**Done**: Removed `initializeForTesting()`. Exported `createInitialFilters()` factory. Updated all 6 test callers.

---

## 13. `console.warn` in `safeKeyExtractor.ts` ✅

**File**: `src/lib/utils/safeKeyExtractor.ts:15`

**Done**: Removed `console.warn` call. Updated test to not expect the warn spy.

---

## 14. `console.debug` in API Routes ✅

**Files**:
- `src/routes/api/games/+server.ts:33`
- `src/routes/api/games-local/+server.ts:104`

**Done**: Replaced `console.debug` calls with silent empty catch blocks.

---

## 15. `$effect.root()` in Constructor ✅

**File**: `src/lib/stores/app.svelte.ts:24`

**Done**: Added clarifying comment explaining `$effect.root()` creates an untracked scope for side effects inside a constructor without reactive context.

---

## 16. Large `+layout.svelte` Component *(deferred — requires architectural refactor)*

**File**: `src/routes/+layout.svelte` (~802 lines, 34 `$state` declarations, 13+ `$effect` blocks)

The layout component handles: data initialization, service worker registration, scroll handling, filter syncing, keyboard shortcuts, URL sync, tab routing, lazy loading, scroll restoration, PWA install, and editor mode. This is too many concerns for one component.

**Fix**: Extract into smaller composables/custom stores: `searchState.svelte.ts`, `lazyLoader.svelte.ts`, `pwaInstall.svelte.ts`, `keyboardShortcuts.svelte.ts`.

---

## 17. Inconsistent `window.location` vs `page.url` Usage ✅

**File**: `src/routes/+layout.svelte:491`

**Done**: Replaced `new URLSearchParams(window.location.search)` with `page.url.searchParams.get('s')`.

---

## 18. Scattered Console Calls (17 in src/) ✅

**Done**: Removed all `console.debug` (2) and `console.warn` (4) calls — either deleted or gated behind `dev`. Error-level logs retained (all in catch blocks).

---

## 19. Test Code Type Assertions *(deferred — low priority)*

43 `as` assertions, 7 `as unknown as` casts, 1 `@ts-expect-error` remain in test files. Creating shared mock factories would improve ergonomics but adds overhead.

---

## Summary

| Category | Count | Done | Deferred |
|----------|-------|------|----------|
| Type unsafety | 6 | 6 | 0 |
| Dead/redundant code | 4 | 4 | 0 |
| Logging issues | 3 | 3 | 0 |
| Architecture & design | 3 | 1 | 2 |
| Test quality | 2 | 0 | 2 |
| **Total** | **18** | **14** | **4** |

### Completed (14)
#1 ✓ TabValue type unification · #2 ✓ as BaseFilters removal · #3 ✓ as TabValue removal · #4 ✓ as Game removal · #5 ✓ as ChartOptions removal · #6 ✓ buildSaveFormData typing · #7 ✓ Redundant methods · #8 ✓ patchState helper · #9 ✓ Double $effect · #10 ✓ Chart spread order · #11 ✓ _overscan removal · #12 ✓ initializeForTesting removal · #13 ✓ safeKeyExtractor · #14 ✓ console.debug removal · #15 ✓ $effect.root comment · #17 ✓ page.url consistency · #18 ✓ Console call cleanup

### Deferred (4)
- #16 Large `+layout.svelte` — architectural refactor
- #19 Test type assertions — low priority, additive work
