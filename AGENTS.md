# AI Agent Instructions (AGENTS.MD)

**🔴 CRITICAL - READ FIRST**: This document provides **MANDATORY, NON-NEGOTIABLE instructions** for any AI agent or assistant contributing to this project. **You MUST read, understand, and adhere to every rule at all times.** Failure to follow these instructions will result in:

- ❌ Rejected contributions
- ❌ Reverted commits
- ❌ Task incomplete status
- ❌ Escalation to human review

**This is not optional. This is not guidance. This is law.**

---

## Table of Contents

1. [Executive Summary & Mandatory Rules](#executive-summary--mandatory-rules)
2. [Guiding Principles & Behavior](#guiding-principles--behavior)
3. [Code Generation Rules](#code-generation-rules)
4. [✋ MANDATORY: Pre-Commit Workflow (8-STEP CHECKLIST)](#-mandatory-pre-commit-workflow-8-step-checklist)
5. [Conventional Commit Message Generation](#conventional-commit-message-generation)
6. [Context7 MCP Instructions](#context7-mcp-instructions)
7. [GitHub MCP Instructions](#github-mcp-instructions)
8. [Testing Requirements](#testing-requirements)
9. [Error Handling & Recovery](#error-handling--recovery)

---

## Executive Summary & Mandatory Rules

### The Non-Negotiable Rules

**RULE #1: ALWAYS Ask Before Coding (When Unclear)**

If requirements are ambiguous, you MUST ask clarifying questions BEFORE writing any code. No exceptions.

**RULE #2: ALWAYS Work Iteratively with Verification**

You MUST work in small steps and verify each step completes successfully before moving to the next. Do not make sweeping changes.

**RULE #3: NEVER Skip the Pre-Commit Workflow**

The 8-step Pre-Commit Workflow (see below) is MANDATORY before EVERY commit, subtask completion, or status report. You must complete ALL 8 steps, in order, with zero shortcuts.

**RULE #4: NEVER Change files under the /static folder**

Files under the /static folder are inputs that cannot be changed. The code needs to be able to work with these files as they are.

**RULE #5: ALWAYS respect the Core Technology Stack defined in the /docs/project.md**
The /docs/project.md defines the Technology Stack and project Constrains that needs to be followed.

**RULE #6: ALWAYS delete unecessary files that were created to support an action**

Files created to help you do some action like a text file or an md file with a todo list need to be deleted after no longer useful and NEVER be commited.

### Enforcement Mechanism

**Before you do ANY of the following, you MUST complete the entire Pre-Commit Workflow:**

- [ ] Report a task as complete
- [ ] Say "ready to commit"
- [ ] Generate a commit message
- [ ] Ask for approval to commit
- [ ] Claim all requirements are met
- [ ] Mark task or subtask as complete
- [ ] Ask the user if you can move to the next subtask

**If you attempt any of the above without completing the workflow, your response is invalid and must be restarted.**

---

## Guiding Principles & Behavior

### 1. Ask First, Code Second (MANDATORY)

**WHEN**: If a task is ambiguous, requirements are unclear, or you are unsure about the best implementation.

**ACTION**: You MUST ask clarifying questions before writing any code. Do not make assumptions about:

- User intent or desired outcomes
- API design decisions
- UI/UX preferences
- Data structure choices
- Performance vs. simplicity trade-offs

**EXAMPLE**: "I understand you want to add user authentication. Should I implement OAuth 2.0, JWT tokens, or session-based auth? What providers do you want to support?"

**VIOLATION**: Writing code first and asking questions later is a critical failure.

### 2. Best Practices (MANDATORY)

**REQUIREMENT**: Always apply expert-level best practices for the tech stack used and modern web development.

**INCLUDES**:

- Writing clean, modular, and performant code
- Following DRY (Don't Repeat Yourself) principles
- Implementing proper error handling
- Writing self-documenting code with meaningful variable/function names
- Following the project's existing patterns and conventions
- Using TypeScript types effectively (avoid `any` unless absolutely necessary)
- Implementing proper security practices (input validation, sanitization, etc.)

**VERIFICATION**: Before every commit, ask yourself: "Does this code represent best practices for this tech stack?"

### 3. Work Iteratively (MANDATORY)

**REQUIREMENT**: Agents must work in small, verifiable steps.

**PROCESS**:

1. Make a focused change (single feature or bug fix)
2. Run the project's test command
3. If tests fail, utilize Debug Mode to investigate
4. Fix issues before proceeding to the next change
5. Repeat

**VIOLATION**: Making sweeping changes across multiple files without verification stops you from proceeding.

### 4. Confirm Major Changes (MANDATORY)

**TRIGGER**: Any task involving:

- Multi-file changes (more than 3 files)
- Breaking API changes
- Database schema modifications
- Dependency upgrades (major versions)
- Architecture refactoring

**ACTION**: The agent must pause and ask the user for explicit confirmation before applying changes.

**FORMAT**: "This change will modify [X files/systems]. Here's what will change: [brief summary]. Shall I proceed?"

**VIOLATION**: Proceeding without confirmation is a failure.

### 5. Tool Gating (MANDATORY)

**REQUIREMENT**: Agents must respect all required tool approvals.

**PROHIBITION**: Do not attempt to bypass or ignore permissions warnings from the Roo Code client or any other development tool. If a tool requires approval, request it explicitly.

### 6. Terminal Operations

All file system operations should be done assuming a bash shell.

---

## Code Generation Rules

**SCOPE**: These rules apply while you are actively writing or modifying code.

### 1. No New Comments (UNLESS REQUESTED)

**RULE**: Do not generate new comments (e.g., `// This function does...`) unless you are explicitly and specifically instructed to add them.

**RATIONALE**: Code should be self-documenting through clear naming and structure.

**EXCEPTIONS**: You may add comments for:

- Complex algorithms that are not self-evident
- Business logic that requires domain knowledge
- TODO markers when explicitly requested
- Temporary debugging notes (must be removed before commit)

### 2. Preserve Existing Comments (MANDATORY)

**RULE**: Do not remove existing comments during the development process unless explicitly instructed to.

**NOTE**: Comment cleanup is part of the Pre-Commit Workflow Step 4.

### 3. Svelte 5 Runes (PROJECT-SPECIFIC)

**REQUIREMENT**: All Svelte components MUST use Runes syntax exclusively.

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
	let count = 0; // ❌ NOT REACTIVE IN SVELTE 5
	$: doubled = count * 2; // ❌ Use $derived instead
	onMount(() => {}); // ❌ Use $effect instead
</script>
```

**VIOLATION**: Using old Svelte patterns will be detected during linting and will fail Step 5 of the Pre-Commit Workflow.

### 4. TypeScript Strictness (MANDATORY)

**REQUIREMENT**: All TypeScript code must satisfy strict mode.

**PROHIBITED**:

- Using `any` type without explicit justification in a comment
- Using `@ts-ignore` or `@ts-expect-error` without explanation in a comment
- Loose type casting with `as` without validation

**PREFERRED**:

- Explicit type definitions
- Type guards for runtime checks
- Proper generic constraints

**VERIFICATION**: The TypeScript compiler (`bun run check`) will fail if strictness is violated. This will fail Step 2 of the Pre-Commit Workflow.

### 5. Import Organization

**REQUIREMENT**: Organize imports in the following order:

1. External dependencies (e.g., React, Svelte)
2. Internal absolute imports (e.g., `@/components`, `@/lib`)
3. Relative imports (e.g., `./utils`, `../types`)
4. Style imports (e.g., `.css`, `.scss`)

**USE**: Blank lines to separate groups.

**VERIFICATION**: ESLint will validate this. Violations will fail Step 5 of the Pre-Commit Workflow.

---

## ✋ MANDATORY: Pre-Commit Workflow (8-STEP CHECKLIST)

**🔴 CRITICAL - DO NOT SKIP ANY STEPS**

This workflow MUST be completed in full before:

- Reporting a task complete
- Generating a commit message
- Asking for commit approval
- Ask user for moving to the next subtask

### Workflow Execution

#### ✓ Step 1: Review Task Requirements

**ACTIONS**:

- [ ] Re-read the original task or subtask description
- [ ] Verify ALL requirements are implemented
- [ ] Check for edge cases that should be handled
- [ ] Confirm no functionality was accidentally broken
- [ ] Verify your changes align with the project's architecture

**VERIFICATION QUESTIONS**:

- Are all acceptance criteria met?
- Did I introduce any regressions?
- Is the implementation complete or partial?

**FAILURE CONSEQUENCE**: If any requirement is not met, STOP. Do not proceed to Step 2. Implement missing requirements first, then restart the workflow.

---

#### ✓ Step 2: TypeScript Type Checking

**COMMAND**:

```bash
bun run check
# or
bunx tsc --noEmit
```

**ACTIONS**:

- [ ] Run the TypeScript compiler
- [ ] Fix ALL type errors without exception
- [ ] Ensure code is 100% free of type errors
- [ ] Do not use `@ts-ignore` or `@ts-expect-error` as shortcuts

**VERIFICATION QUESTIONS**:

- Are there ANY TypeScript errors remaining?
- Are all types properly defined?
- Are generics properly constrained?

**FAILURE CONSEQUENCE**: If ANY type errors remain, STOP. Do not proceed to Step 3. Fix all type errors, then restart from Step 2.

---

#### ✓ Step 3: Linting Validation

**COMMANDS**:

```bash
bun run lint
# or
bunx eslint . --fix
```

**ACTIONS**:

- [ ] Run ESLint
- [ ] Fix all reported errors
- [ ] Address all warnings (unless explicitly waived by the user)
- [ ] Re-run to confirm all issues are resolved
- [ ] Do not disable ESLint rules without justification

**VERIFICATION QUESTIONS**:

- Are there ANY ESLint errors remaining?
- Are there ANY ESLint warnings remaining (unless waived)?
- Does the output show "0 errors, 0 warnings"?

**FAILURE CONSEQUENCE**: If ANY errors or warnings remain (unless waived), STOP. Do not proceed to Step 4. Fix all linting issues, then restart from Step 3.

---

#### ✓ Step 4: Debugging Cleanup (MANDATORY)

**ACTIONS**:

- [ ] Search for and remove ALL `console.log()` statements
- [ ] Search for and remove ALL `console.error()`, `console.warn()` (unless production-necessary)
- [ ] Search for and remove ALL `$inspect()` statements (Svelte)
- [ ] Remove any `debugger;` statements
- [ ] Remove any temporary test code
- [ ] Remove any TODO or FIXME comments (unless explicitly requested)

**COMMAND SUGGESTIONS**:

```bash
# Search for debugging statements
grep -r "console\.log\|console\.error\|console\.warn" src/
grep -r "\$inspect" src/
grep -r "debugger;" src/
grep -rn "TODO\|FIXME" src/ | grep -v "required" | grep -v "critical"
```

**VERIFICATION QUESTIONS**:

- Are there ANY console statements remaining?
- Are there ANY $inspect statements remaining?
- Are there ANY debugger statements remaining?
- Are there any temporary comments remaining?

**FAILURE CONSEQUENCE**: If any debugging code remains, STOP. Do not proceed to Step 5. Remove all debugging code, then restart from Step 4.

---

#### ✓ Step 5: Comment Cleanup

**ACTIONS**:

- [ ] Review all comments in modified files
- [ ] Remove trivial or obvious comments (e.g., `// end of function`, `// loop through array`)
- [ ] Remove comments like `// constructor`, `// increment counter`, etc.
- [ ] **RETAIN** comments that explain:
  - Complex logic or non-obvious algorithms
  - Business rules not self-evident from code
  - Non-obvious workarounds or fixes
  - Important architectural decisions
  - Performance optimizations with reasoning

**EXAMPLES OF WHAT TO REMOVE**:

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

**EXAMPLES OF WHAT TO KEEP**:

```typescript
// ✓ Keep explanatory comments
function calculateTotal(items) {
	// Using reduce for better performance with large datasets
	// Based on profiling results showing 30% improvement over loops
	return items.reduce((sum, item) => {
		// Apply bulk discount only for orders over 100 units per business rule BR-2024-03
		const discount = items.length > 100 ? 0.1 : 0;
		return sum + item.price * (1 - discount);
	}, 0);
}
```

**VERIFICATION QUESTIONS**:

- Do all remaining comments explain "why" rather than "what"?
- Would the code still be clear without these comments?
- Are there any comments that just repeat the code?

**FAILURE CONSEQUENCE**: If unnecessary comments remain, STOP. Do not proceed to Step 6. Remove unnecessary comments, then restart from Step 5.

---

#### ✓ Step 6: Code Formatting

**COMMAND**:

```bash
bun run format
# or
bunx prettier --write .
```

**ACTIONS**:

- [ ] Run Prettier to ensure consistent formatting
- [ ] Review formatting changes to confirm they're correct
- [ ] Do not manually override Prettier's decisions
- [ ] Verify no unexpected formatting changes occurred

**VERIFICATION QUESTIONS**:

- Does Prettier report any files changed?
- Are the formatting changes appropriate?
- Is the code now consistently formatted?

**FAILURE CONSEQUENCE**: If formatting is inconsistent, STOP. Do not proceed to Step 7. Re-run Prettier and resolve any conflicts, then restart from Step 6.

---

#### ✓ Step 7: Test Execution

**COMMAND**:

```bash
bun test
# or appropriate test runner
```

**ACTIONS**:

- [ ] Run the full test suite
- [ ] Confirm ALL tests pass
- [ ] If tests fail, debug using error messages
- [ ] Verify no tests were accidentally disabled or skipped
- [ ] Write new tests for new functionality if required
- [ ] Verify test coverage has not decreased

**VERIFICATION QUESTIONS**:

- Do ALL tests pass with a green checkmark?
- Are there any skipped tests (`.skip`, `.only`, etc.)?
- Has test coverage decreased compared to before?
- Are there any flaky or intermittent failures?

**FAILURE CONSEQUENCE**: If ANY tests fail, STOP immediately. Do not proceed to Step 8. Debug and fix the failing tests, then restart from Step 7.

---

#### ✓ Step 7.5: Live Site Verification (MANDATORY IF SUPPORTED)

**⚠️ MANDATORY FOR TOOLS WITH BROWSER/RUNTIME CAPABILITIES**

**PURPOSE**: Beyond unit tests and linting, the actual website must be verified to run without console errors, build failures, or runtime issues. Errors caught by type checkers and linters may not reveal runtime problems that only appear when the application is running.

**PREREQUISITE**: Your tool must have the capability to:

- Start a development server
- Launch a browser or headless browser instance
- Navigate to pages
- Capture console output (logs, errors, warnings)
- Capture HTTP responses
- Take screenshots or verify visual rendering

**If your tool does NOT have these capabilities, skip to Step 8.**

**ACTIONS**:

- [ ] Start the development server (e.g., `bun run dev` or equivalent)
- [ ] Launch a browser or browser automation instance
- [ ] Navigate to all pages and user flows affected by your changes
- [ ] Monitor console output and capture all messages
- [ ] Monitor network requests and capture any failed requests
- [ ] Verify visual rendering is correct (no layout shifts, missing elements, or broken styling)
- [ ] Interact with all modified UI components to verify functionality
- [ ] Document any console output (errors, warnings, or network issues)

**VERIFICATION QUESTIONS**:

- Are there ANY JavaScript console errors?
- Are there ANY unhandled promise rejections?
- Are there ANY failed HTTP requests (4xx or 5xx status codes)?
- Are there ANY network timeouts or connection errors?
- Does the site render correctly without visual artifacts or layout shifts?
- Do all interactive elements respond to user input as expected?
- Are there any console warnings that indicate potential issues?
- Are there any missing or broken assets?

**FAILURE CONSEQUENCE**: If ANY of the following are found, STOP immediately. Do not proceed to Step 8:

- JavaScript errors in the console
- Unhandled promise rejections
- Failed HTTP requests (4xx/5xx)
- Broken visual rendering
- Non-functional interactive elements
- Network timeouts or connection errors

Fix all runtime issues and restart from Step 7.5.

---

#### ✓ Step 8: Final Verification & Commit Message Generation

**🔴 YOU CANNOT PROCEED PAST THIS POINT WITHOUT COMPLETING STEPS 1-7**

**REQUIRED CONFIRMATION STATEMENT**:

Before generating a commit message, you MUST state this exact confirmation (copy-paste, no paraphrasing):

> I have successfully completed the entire pre-commit workflow:
>
> - ✓ Step 1: Task requirements verified and met
> - ✓ Step 2: TypeScript compiler passing (0 errors)
> - ✓ Step 3: ESLint passing (0 errors, 0 warnings)
> - ✓ Step 4: All debugging code removed
> - ✓ Step 5: All unnecessary comments removed
> - ✓ Step 6: Prettier formatting applied
> - ✓ Step 7: All tests passing
> - ✓ Step 7.5: Live site verification completed (no console errors, no network failures, visual rendering correct)
>
> **The code is ready for commit.**

**ONLY AFTER** providing this exact confirmation:

1. Stage all changed files
2. Generate a Conventional Commit message (see section below)
3. Prompt the user to review and approve the commit message
4. Ask: "Shall I proceed with this commit?"
5. After succesful commit you can mark the task as completed

**CRITICAL**: Do not attempt to commit without the user's explicit approval.

---

## Conventional Commit Message Generation

**SPECIFICATION**: When asked to generate a commit message, you MUST follow the Conventional Commits v1.0.0 specification (https://www.conventionalcommits.org/en/v1.0.0/).

**CONTENT**: The commit message and body MUST explain the most important changes being committed, not just the last one.

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

**PURPOSE**: The Context7 MCP is crucial for accessing the latest, version-specific documentation for external libraries. Agents MUST prioritize this tool to prevent hallucinations and outdated code.

### Usage Instructions

#### 1. For New Knowledge (MANDATORY)

**WHEN**: Adding a new dependency or working with a known library (e.g., Next.js, Stripe SDK, React, etc.)

**ACTION**: Agents MUST invoke the context7 tool before writing implementation code.

**VIOLATION**: Writing code without consulting context7 for external libraries may result in outdated or incorrect implementations.

#### 2. Version Accuracy (MANDATORY)

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

#### 1. Task Context (MANDATORY)

**WHEN**: Before beginning any feature or bug fix.

**ACTION**: Agents MUST use the github tool to fetch the relevant Issue or Pull Request (using `pr` or `issue` tools).

**WHY**: This ensures work aligns with the official request and any comments or updates.

**CHECKLIST**:

- [ ] Read the full issue/PR description
- [ ] Review all comments for context
- [ ] Note any acceptance criteria
- [ ] Check for linked issues or dependencies

#### 2. Commit Message Format (MANDATORY)

**REQUIREMENT**: All commit messages MUST strictly follow the Conventional Commits specification.

**FORMAT**: `<type>[optional scope]: <description>`

**EXAMPLES**:

- `feat: add user login`
- `fix(cart): correct item total calculation`
- `chore: update eslint config`

**ACTION**: Agents should verify format before proposing a commit.

#### 3. Pre-Merge Status Check (MANDATORY)

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

**PRINCIPLE**: All code changes MUST be accompanied by appropriate tests unless explicitly waived by the user.

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

## Appendix: Quick Reference Checklist

### Before Starting a Task

- [ ] Have I read all requirements clearly?
- [ ] Are there any ambiguities I need to clarify?
- [ ] Should I ask questions before coding?

### While Coding

- [ ] Am I following project-specific patterns?
- [ ] Am I writing clean, typed code?
- [ ] Am I working iteratively with verification?
- [ ] Am I adding new comments unnecessarily?
- [ ] Am I preserving existing comments?

### Before Claiming Work is Done

- [ ] Have I completed ALL 8 steps of the Pre-Commit Workflow?
- [ ] Can I provide the exact confirmation statement?
- [ ] Have I generated a valid Conventional Commit message?
- [ ] Have I asked for explicit user approval?

---

**Last Updated**: 2 November 2025  
**Status**: MANDATORY - All agents must comply
