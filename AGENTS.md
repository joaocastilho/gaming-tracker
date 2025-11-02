## AI Agent Instructions (AGENTS.MD)

**CRITICAL**: This document provides mandatory instructions for any AI agent or assistant contributing to this project. You MUST read, understand, and adhere to these rules at all times. Failure to follow these instructions may result in rejected contributions.

---

## Table of Contents

1. [Guiding Principles & Behavior](#guiding-principles--behavior)
2. [Code Generation Rules](#code-generation-rules)
3. [Task Completion & Pre-Commit Workflow](#task-completion--pre-commit-workflow)
4. [Commit Message Generation](#commit-message-generation)
5. [Context7 MCP Instructions](#context7-mcp-instructions)
6. [GitHub MCP Instructions](#github-mcp-instructions)
7. [Testing Requirements](#testing-requirements)
8. [Error Handling & Recovery](#error-handling--recovery)

---
## Summary: Quick Reference

### Before Starting Any Task

- [ ] Read and understand the full requirements
- [ ] Ask clarifying questions if needed
- [ ] Use context7 for library documentation

### While Coding

- [ ] Follow project-specific patterns (e.g., Svelte 5 Runes)
- [ ] Write clean, typed code
- [ ] Work iteratively with small changes
- [ ] No new comments unless requested
- [ ] Preserve existing comments

### Before Committing

- [ ] Complete the entire pre-commit workflow (8 steps)
- [ ] State confirmation that workflow is complete
- [ ] Generate proper Conventional Commit message and prompt the user for commit approval

### Always Remember

- **Ask first, code second**
- **Work in small, verifiable steps**
- **Respect tool gating and permissions**
- **Never bypass required approvals**
- **Never commit without user approval**

---

## Guiding Principles & Behavior

### 1. Ask First, Code Second

**WHEN**: If a task is ambiguous, requirements are unclear, or you are unsure about the best implementation.  
**ACTION**: You MUST ask clarifying questions before writing any code. Do not make assumptions about:

- User intent or desired outcomes
- API design decisions
- UI/UX preferences
- Data structure choices
- Performance vs. simplicity trade-offs

**EXAMPLE**: "I understand you want to add user authentication. Should I implement OAuth 2.0, JWT tokens, or session-based auth? What providers do you want to support?"

### 2. Best Practices

**REQUIREMENT**: Always apply expert-level best practices for the tech stack used and modern web development.  
**INCLUDES**:

- Writing clean, modular, and performant code
- Following DRY (Don't Repeat Yourself) principles
- Implementing proper error handling
- Writing self-documenting code with meaningful variable/function names
- Following the project's existing patterns and conventions
- Using TypeScript types effectively (avoid `any` unless absolutely necessary)
- Implementing proper security practices (input validation, sanitization, etc.)

### 3. Work Iteratively

**REQUIREMENT**: Agents must work in small, verifiable steps.  
**PROCESS**:

1. Make a focused change (single feature or bug fix)
2. Run the project's test command
3. If tests fail, utilize Debug Mode to investigate
4. Fix issues before proceeding to the next change
5. Repeat

**DO NOT**: Make sweeping changes across multiple files without verification steps.

### 4. Confirm Major Changes

**TRIGGER**: Any task involving:

- Multi-file changes (more than 3 files)
- Breaking API changes
- Database schema modifications
- Dependency upgrades (major versions)
- Architecture refactoring

**ACTION**: The agent must pause and ask the user for explicit confirmation before applying changes.  
**FORMAT**: "This change will modify [X files/systems]. Here's what will change: [brief summary]. Shall I proceed?"

### 5. Tool Gating

**REQUIREMENT**: Agents must respect all required tool approvals.  
**PROHIBITION**: Do not attempt to bypass or ignore permissions warnings from the Roo Code client or any other development tool.

### 6. Terminal operations

All file system operations should be done assuming a bash shell.

---

## Code Generation Rules

**SCOPE**: These rules apply while you are actively writing or modifying code.

### 1. No New Comments

**RULE**: Do not generate new comments (e.g., `// This function does...`) unless you are explicitly and specifically instructed to add them.  
**RATIONALE**: Code should be self-documenting through clear naming and structure.

**EXCEPTIONS**: You may add comments for:

- Complex algorithms that are not self-evident
- Business logic that requires domain knowledge
- TODO markers when explicitly requested
- Temporary debugging notes (must be removed before commit)

### 2. Preserve Existing Comments

**RULE**: Do not remove existing comments during the development process unless explicitly instructed to.  
**NOTE**: A separate cleanup step for unnecessary comments applies before task completion (see Pre-Commit Workflow).

### 3. Svelte 5 Runes (PROJECT-SPECIFIC)

**REQUIREMENT**: All Svelte components MUST use Runes syntax.

**CORRECT PATTERNS**:

```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

	$effect(() => {
		console.log(`Count is now ${count}`);
	});

	export let title; // Props
</script>
```

**PROHIBITED PATTERNS** (Svelte 3/4 syntax):

```svelte
<script>
	let count = 0; // ❌ Not reactive in Svelte 5
	$: doubled = count * 2; // ❌ Use $derived instead
	onMount(() => {}); // ❌ Use $effect instead (when appropriate)
</script>
```

**WHY**: This project uses Svelte 5, and older patterns will not work correctly.

### 4. TypeScript Strictness

**REQUIREMENT**: All TypeScript code must satisfy strict mode.  
**PROHIBITED**:

- Using `any` type without explicit justification
- Using `@ts-ignore` or `@ts-expect-error` without explanation
- Loose type casting with `as` without validation

**PREFERRED**:

- Explicit type definitions
- Type guards for runtime checks
- Proper generic constraints

### 5. Import Organization

**REQUIREMENT**: Organize imports in the following order:

1. External dependencies (e.g., React, Svelte)
2. Internal absolute imports (e.g., `@/components`, `@/lib`)
3. Relative imports (e.g., `./utils`, `../types`)
4. Style imports (e.g., `.css`, `.scss`)

**USE**: Blank lines to separate groups.

---

## Task or Subtask Completion & Pre-Commit Workflow (MANDATORY)

**CRITICAL**: Before you finalize a task or subtask, report completion, or generate a commit message, you MUST perform the following validation and cleanup steps in this exact order.

### Workflow Checklist

Complete each step and confirm before proceeding:

#### ✓ Step 1: Review Task or Subtask

- [ ] Review all generated and modified code
- [ ] Verify all requirements of the given task are fully met
- [ ] Confirm edge cases are handled
- [ ] Verify no functionality was accidentally broken

#### ✓ Step 2: Address Errors

- [ ] Run TypeScript compiler (`bun run check`)
- [ ] Ensure code is 100% free of type errors
- [ ] Run ESLint and address all errors
- [ ] Address all ESLint warnings (unless explicitly waived)
- [ ] Confirm no compilation errors exist
- [ ] Run the project (`bun run dev`) and load the website
- [ ] Ensure code is 100% free of running errors

**REQUIREMENT**: The code must be 100% free of type errors and lint violations.

#### ✓ Step 3: Remove Debugging

- [ ] Search for and remove ALL `console.log()` statements
- [ ] Search for and remove ALL `$inspect()` statements (Svelte)
- [ ] Remove any `debugger;` statements
- [ ] Remove any temporary test code or comments

**COMMAND SUGGESTIONS**:

```bash
# Search for debugging statements
grep -r "console.log" src/
grep -r "$inspect" src/
grep -r "debugger;" src/
```

#### ✓ Step 4: Comment Cleanup

- [ ] Remove any unnecessary or trivial comments
- [ ] Remove comments like `// end of function`, `// constructor`, etc.
- [ ] **RETAIN** comments that explain:
  - Complex logic or algorithms
  - Business rules not self-evident from code
  - Non-obvious workarounds or fixes
  - Important architectural decisions

**EXAMPLE OF WHAT TO REMOVE**:

```typescript
// ❌ Remove trivial comments
function calculateTotal(items) {
	// Loop through items
	for (const item of items) {
		// Add item price to total
		total += item.price;
	}
	// Return the total
	return total;
}
```

**EXAMPLE OF WHAT TO KEEP**:

```typescript
// ✓ Keep explanatory comments
function calculateTotal(items) {
	// Using reduce for better performance with large datasets
	// Based on profiling results showing 30% improvement over loops
	return items.reduce((sum, item) => {
		// Apply bulk discount only for orders over 100 units
		// per business rule BR-2024-03
		const discount = items.length > 100 ? 0.1 : 0;
		return sum + item.price * (1 - discount);
	}, 0);
}
```

#### ✓ Step 5: Run ESLint

```bash
bun run lint
# or
bunx eslint . --fix
```

- [ ] Fix all reported issues
- [ ] Re-run to confirm all issues resolved

#### ✓ Step 6: Run Prettier

```bash
bun run format
# or
bunx prettier --write .
```

- [ ] Ensure consistent code formatting
- [ ] Verify no unexpected formatting changes

#### ✓ Step 7: Run Tests

```bash
bun test
# or appropriate test command
```

- [ ] Confirm all tests pass
- [ ] If tests fail, debug and fix before proceeding
- [ ] Verify no tests were accidentally disabled

#### ✓ Step 8: Final Confirmation and Generate Commit message

**REQUIRED STATEMENT**: Before proceeding, you must state:

> "I have successfully completed the entire pre-commit workflow:
>
> - ✓ Task requirements verified
> - ✓ All TypeScript and ESLint errors addressed
> - ✓ Debugging statements removed
> - ✓ Comments cleaned up
> - ✓ ESLint run and issues fixed
> - ✓ Prettier run for formatting
> - ✓ All tests passing
>
> The code is ready for commit."

**ONLY AFTER**: Stage all changed files and generate a commit message and prompt the user to accept the commit

## Commit Message Generation

**SPECIFICATION**: When asked to generate a commit message, you MUST follow the Conventional Commits v1.0.0 specification (https://www.conventionalcommits.org/en/v1.0.0/).

**CONTENT**: The commit message and body needs to explain the most important changes being commited not just the last one.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Common Types

| Type       | Description                                             | Example                                           |
| ---------- | ------------------------------------------------------- | ------------------------------------------------- |
| `feat`     | A new feature                                           | `feat(auth): add login page`                      |
| `fix`      | A bug fix                                               | `fix(cart): correct item total calculation`       |
| `chore`    | Build process, tooling, or config changes               | `chore: update eslint config`                     |
| `docs`     | Documentation only changes                              | `docs: update AGENTS.md`                          |
| `style`    | Code style changes (whitespace, formatting, etc.)       | `style: format with prettier`                     |
| `refactor` | Code change that neither fixes a bug nor adds a feature | `refactor(api): simplify error handling`          |
| `perf`     | Performance improvement                                 | `perf(render): optimize list rendering`           |
| `test`     | Adding or correcting tests                              | `test(auth): add login validation tests`          |
| `build`    | Changes to build system or dependencies                 | `build: upgrade to Node 20`                       |
| `ci`       | CI/CD configuration changes                             | `ci: add automated testing workflow`              |
| `revert`   | Reverts a previous commit                               | `revert: revert "feat: add experimental feature"` |

### Additional Guidelines

**Description**:

- Use imperative mood: "add feature" not "added feature" or "adds feature"
- No capitalization of first letter
- No period at the end
- Limit to 50-72 characters

**Body** (optional but recommended for complex changes):

- Wrap at 72 characters
- Explain what and why, not how
- Separate from description with a blank line

### Examples

**Simple commit**:

```
feat(user): add profile avatar upload
```

**Commit with body**:

```
fix(api): prevent race condition in user update

The previous implementation allowed simultaneous updates to overwrite
each other. Added optimistic locking using version field to prevent
data loss.

Fixes #234
```

**Breaking change**:

```
feat(api): change authentication to use OAuth 2.0

BREAKING CHANGE: The authentication endpoint now requires OAuth 2.0
tokens instead of API keys. Users must update their integration code.

Migration guide: docs/migration/auth-v2.md
```

---

## Context7 MCP Instructions: Up-to-Date Knowledge

**PURPOSE**: The Context7 MCP is crucial for accessing the latest, version-specific documentation for external libraries. Agents must prioritize this tool to prevent hallucinations and outdated code.

### Usage Instructions

#### 1. For New Knowledge

**WHEN**: Adding a new dependency or working with a known library (e.g., Next.js, Stripe SDK, React, etc.)  
**ACTION**: Agents MUST invoke the context7 tool before writing implementation code.

#### 2. Version Accuracy

**REQUIREMENT**: Agents MUST include the library name and specific version in their prompt to context7.  
**CORRECT**: "use context7 for React v18 hooks and Suspense API"  
**INCORRECT**: "use context7 for React" (may fetch outdated documentation)

**WHY**: This prevents fetching documentation for older, incompatible versions.

#### 3. Refactoring & Upgrades

**WHEN**: Refactoring existing code or upgrading a dependency.  
**ACTION**: Use context7 to confirm:

- New API surfaces
- Deprecated features
- Breaking changes
- Migration paths

#### 4. Agent Command Format

**SYNTAX**: Include a directive in your prompt:

```
"Create a serverless function using the latest Next.js v14 App Router conventions. use context7"
```

**BEST PRACTICE**: Always specify the exact version number when known.

---

## GitHub MCP Instructions: Repository Management

**PURPOSE**: The GitHub MCP is used for tasks involving the repository's live status, such as checking issues, reviewing pull requests, and confirming Continuous Integration (CI) status.

### Usage Instructions

#### 1. Task Context

**WHEN**: Before beginning any feature or bug fix.  
**ACTION**: Agents MUST use the github tool to fetch the relevant Issue or Pull Request (using `pr` or `issue` tools).  
**WHY**: This ensures work aligns with the official request and any comments or updates.

**CHECKLIST**:

- [ ] Read the full issue/PR description
- [ ] Review all comments for context
- [ ] Note any acceptance criteria
- [ ] Check for linked issues or dependencies

#### 2. Commit Message Format

**REQUIREMENT**: All commit messages MUST strictly follow the Conventional Commits specification.  
**FORMAT**: `<type>[optional scope]: <description>`  
**EXAMPLES**:

- `feat: add user login`
- `fix(cart): correct item total calculation`
- `chore: update eslint config`

**ACTION**: Agents should verify format before proposing a commit.

#### 3. Pre-Merge Status Check

**WHEN**: Preparing a Pull Request.  
**ACTION**: The agent MUST use github to confirm:

- [ ] No merge conflicts exist
- [ ] CI/CD pipeline in `.github/workflows/` is passing
- [ ] All required status checks are green
- [ ] No blocking review comments remain unresolved

### Critical Constraint

**PROHIBITION**: Agents must NOT attempt to create or merge a Pull Request or Branch without explicit human approval.  
**SCOPE**: The github tool is strictly for reading and analyzing repository status to inform code changes.

---

## Testing Requirements

**PRINCIPLE**: All code changes must be accompanied by appropriate tests unless explicitly waived by the user.

### Testing Checklist

- [ ] Unit tests for new functions/methods
- [ ] Integration tests for API endpoints
- [ ] Component tests for UI changes
- [ ] Update existing tests if behavior changed
- [ ] Ensure test coverage doesn't decrease

### When to Write Tests

**ALWAYS**:

- New business logic
- Bug fixes (regression tests)
- API endpoints
- Utility functions

**CASE-BY-CASE**:

- UI components (based on complexity)
- Configuration files (if logic is involved)

**RARELY**:

- Simple type definitions
- Pure configuration (no logic)

### Test Naming Convention

```typescript
describe('ComponentName or functionName', () => {
	it('should [expected behavior] when [condition]', () => {
		// Test implementation
	});
});
```

**EXAMPLE**:

```typescript
describe('calculateDiscount', () => {
	it('should return 10% discount when order total exceeds $100', () => {
		expect(calculateDiscount(150)).toBe(15);
	});

	it('should return 0 discount when order total is below $100', () => {
		expect(calculateDiscount(50)).toBe(0);
	});
});
```

---

## Error Handling & Recovery

### When Errors Occur

**PROCESS**:

1. **Identify**: Clearly state what error occurred
2. **Analyze**: Explain why the error happened
3. **Fix**: Implement a solution
4. **Verify**: Run tests to confirm the fix
5. **Document**: If it's a common pitfall, note it

### Common Error Patterns

**TypeScript Errors**:

- Read the error message carefully
- Check for type mismatches
- Verify imports are correct
- Ensure types are exported properly

**ESLint Errors**:

- Fix errors before warnings
- Don't disable rules without justification
- Follow the project's ESLint configuration

**Test Failures**:

- Read the failure message completely
- Check for timing issues (async/await)
- Verify test data and mocks
- Ensure tests are isolated (no shared state)

### When Stuck

**ACTION**: If you encounter an error you cannot resolve after 2-3 attempts:

1. State the problem clearly
2. Explain what you've tried
3. Ask the user for guidance or additional context
4. Suggest alternative approaches if applicable

**DO NOT**: Continue making changes randomly hoping to fix the issue.

---