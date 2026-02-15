# AI Agent Instructions (AGENTS.md)

**Project**: Gaming Tracker (SvelteKit + TypeScript + Bun)  
**Purpose**: Instructions for AI agents working on this codebase  
**Current Grade**: 9.7/10 (All type assertions removed, production ready)

**Key Documents**:

- `docs/project-audit.md` - Comprehensive codebase audit
- `docs/implementation-roadmap.md` - Path to 10/10 implementation
- `docs/TECHNICAL.md` - Architecture documentation

---

## Quick Start: What Are You Doing?

| If you're changing...                     | Follow this workflow                | Skip these steps       |
| ----------------------------------------- | ----------------------------------- | ---------------------- |
| **README, docs, .md files**               | [Docs Workflow](#docs-workflow)     | Lint, TypeCheck, Tests |
| **Config files (.yml, .json, configs)**   | [Config Workflow](#config-workflow) | Tests (usually)        |
| **Source code (src/, components, logic)** | [Code Workflow](#code-workflow)     | None                   |
| **Tests only**                            | [Test Workflow](#test-workflow)     | Live verification      |
| **Mixed (docs + code)**                   | Use **Code Workflow**               | —                      |

---

## Universal Rules (Always Apply)

### 0. Test-First Development (CRITICAL)

**MANDATORY for all refactors and bug fixes:**

1. **Write the test FIRST** - Create a failing test that demonstrates the bug/missing feature
2. **Run the test** - Verify it fails with a clear error message
3. **Implement the fix** - Make the minimal change to make the test pass
4. **Run the test** - Verify it now passes
5. **Run full suite** - `bun test` - ensure no regressions
6. **Proceed to quality checks** - Lint, typecheck, format

**This is non-negotiable.** Every refactor must be covered by tests before implementation.

### 1. Ask Before Assuming

**ASK when:**

- Requirements are unclear ("improve the UI" - how?)
- Multiple valid approaches exist
- Breaking changes to existing behavior
- > 3 files need modification
- User says "maybe" or "think about it"
- **No existing test covers the change area**

**DON'T ask when:**

- Fixing a typo
- Applying obvious formatting
- Following existing patterns
- The task explicitly specifies what to do

### 2. Work in Small Steps

1. Make one focused change
2. Verify it works (check/lint/test)
3. Then make the next change

**Never chain 3+ unverified changes together**

### 3. Clean Up After Yourself

- Delete temp files (temp.md, debug.json, notes.txt)
- Remove console.log() before committing
- Don't leave TODO comments unless user requested

### 4. Static Data is Read-Only

`/static/games.json` and `/static/covers/` are **immutable** unless user explicitly authorizes changes.

### 5. Read project.md First

Always check `docs/project.md` for:

- Tech stack details
- Architecture constraints
- Data schemas

---

## Docs Workflow

**For**: README, documentation, comments, markdown files

```bash
# Step 1: Review your changes
# - Check spelling
# - Verify links work
# - Ensure accuracy

# Step 2: Format
bun run format

# Step 3: Commit with 'docs:' prefix
git add <files>
git commit -m "docs: update installation instructions"
```

**That's it.** No linting, type checking, or tests needed.

---

## Config Workflow

**For**: .github/workflows/, package.json (non-deps), config files

```bash
# Step 1: Validate syntax
# - YAML: check indentation, valid structure
# - JSON: verify with jq or jsonlint
# - Ensure no trailing commas

# Step 2: Format
bun run format

# Step 3: Commit with appropriate prefix:
# - ci: for GitHub Actions changes
# - chore: for tooling/config updates
# - build: for build system changes
```

---

## Test Workflow

**For**: Adding or fixing tests only (no source code changes)

```bash
# Step 1: Run affected tests
bun test

# Step 2: If tests pass
bun run format

# Step 3: Commit with 'test:' prefix
git commit -m "test: add validation tests for game editor"
```

---

## Code Workflow

**For**: Source code changes (src/, components, stores, utils, etc.)

**Required before claiming completion:**

### Step 1: Requirements Check

- [ ] Task requirements met?
- [ ] Edge cases handled?
- [ ] No regressions introduced?

### Step 2: Format & Lint

```bash
bun run format
bun run lint
```

- [ ] All errors fixed
- [ ] Warnings addressed (or user waived)

### Step 3: Type Check

```bash
bun run check
```

- [ ] Zero TypeScript errors
- [ ] No `@ts-ignore` without comment explaining why

### Step 4: Debug Cleanup

Remove from your changes:

- [ ] `console.log()`, `console.error()`, `console.warn()`
- [ ] `$inspect()` statements (Svelte 5)
- [ ] `debugger;` statements
- [ ] Temporary test code
- [ ] TODO/FIXME (unless user requested)

### Step 5: Comment Review

- [ ] Remove obvious comments (`// increment counter`)
- [ ] Keep: complex algorithm explanations, business rules, non-obvious workarounds

### Step 6: Tests

```bash
bun test
```

- [ ] All tests pass
- [ ] New tests written for new functionality
- [ ] Tests written **BEFORE** implementation (TDD)
- [ ] No `.skip` or `.only` left in tests
- [ ] Test covers both success and error cases
- [ ] No `any` types in test code

**If tests were already failing before your changes:** State this clearly to user.

**Test-First Verification:**

```
I followed test-first development:
- ✓ Test written before implementation
- ✓ Test initially failed (RED)
- ✓ Implementation makes test pass (GREEN)
- ✓ Full suite passes (REGRESSION)
```

### Step 7: Final Statement

Before generating commit message, state:

```
I have completed the code workflow:
- ✓ Requirements verified
- ✓ Test-first development followed (test written before implementation)
- ✓ Formatting and linting passed
- ✓ TypeScript check passed (0 errors)
- ✓ Strict mode compliance verified (no any types)
- ✓ Debug code removed
- ✓ Comments reviewed
- ✓ All tests passing (including new tests)
- ✓ No regressions introduced

Ready to commit.
```

---

## Code Standards

### Svelte 5 Runes (Required)

✓ **Correct:**

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
	$effect(() => {
		console.log(count);
	});
</script>
```

✗ **Wrong (Old Svelte):**

```svelte
<script>
	let count = 0; // Not reactive in Svelte 5
	$: doubled = count * 2; // Use $derived instead
	onMount(() => {}); // Use $effect instead
</script>
```

### TypeScript (STRICT MODE)

- **STRICT MODE ENABLED** - `strict: true` in tsconfig.json
- **NO `any` TYPES** - Zero tolerance. Use `unknown` with type guards instead
- **NO `@ts-ignore`** - Use `@ts-expect-error` with detailed explanation if absolutely necessary
- **NO TYPE ASSERTIONS** - Avoid `as Type`. Fix types at the source
- Use type guards for runtime checks
- Explicit return types on all public methods
- No implicit any in catch blocks - properly type errors

### Import Order

```typescript
// 1. External libraries
import { writable } from 'svelte/store';

// 2. Internal absolute imports
import { db } from '$lib/db';
import GameCard from '$lib/components/GameCard.svelte';

// 3. Relative imports
import { formatDate } from './utils';

// 4. Styles
import './styles.css';
```

---

## Conventional Commits

Format: `<type>[optional scope]: <description>`

| Type       | Use For            | Example                                  |
| ---------- | ------------------ | ---------------------------------------- |
| `feat`     | New features       | `feat(auth): add login modal`            |
| `fix`      | Bug fixes          | `fix(cart): correct total calculation`   |
| `docs`     | Documentation      | `docs: update API examples`              |
| `style`    | Code formatting    | `style: format with prettier`            |
| `refactor` | Code restructuring | `refactor(utils): simplify date helpers` |
| `perf`     | Performance        | `perf(list): optimize rendering`         |
| `test`     | Tests              | `test(auth): add login tests`            |
| `chore`    | Maintenance        | `chore: update eslint config`            |
| `ci`       | CI/CD              | `ci: add deploy workflow`                |
| `build`    | Dependencies       | `build: upgrade to TypeScript 5.9`       |

**Rules:**

- Use imperative mood: "add feature" not "added feature"
- No period at end
- Keep under 72 characters

---

## When Things Go Wrong

### If lint/type check fails:

1. Fix the errors
2. Re-run the check
3. Don't disable rules without asking user

### If tests fail:

1. Check if they were failing before your change
2. If your change broke them: fix it
3. If pre-existing: tell user, don't block commit

### If you're stuck:

1. Clearly state the problem
2. Explain what you tried
3. Ask for guidance
4. **Don't** keep guessing

### If user says "skip [check]":

1. Confirm in writing: "I'll skip the tests as requested"
2. Note it in your completion statement
3. Proceed with remaining steps

---

## Quick Checklist

**Before starting:**

- [ ] Read docs/project.md
- [ ] Understand what type of change this is
- [ ] Clarify ambiguous requirements

**While coding:**

- [ ] Use Svelte 5 Runes
- [ ] Follow TypeScript strict mode
- [ ] Work in small verified steps

**Before committing:**

- [ ] Run the appropriate workflow
- [ ] Use conventional commit format
- [ ] Get user approval

---

**Last Updated**: 12 February 2026
