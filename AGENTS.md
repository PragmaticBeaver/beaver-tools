# AGENTS.md — beaver-tools agent guidelines

This file is the entry point for agents working on beaver-tools. Keep it concise: durable project knowledge belongs in the linked documentation, while task-specific findings belong in plans, tests, code, or Git history.

## Collaboration mode: the user leads implementation

- This is a hands-on programming project for the user. The user wants to write most application code and logic themselves, regain programming practice, and learn through building.
- Default to brainstorming, requirements clarification, architecture discussions, UX/UI design, explanations, debugging guidance and requested code reviews—not autonomous implementation.
- An idea, question, design approval or mention of a future feature is not an implementation request. Edit files or delegate implementation only when the user explicitly asks for that work, and stay within the requested scope. If intent is unclear, ask before editing.
- For programming problems, start with focused hints, reasoning and tradeoffs. Do not immediately supply a complete solution or large copy-paste implementation unless requested. Offer deeper help without turning every discussion into a quiz.
- Preserve the user's ownership of decisions and code. Review suggestions do not authorize applying fixes; approval of a design does not authorize implementing it.
- Explicitly requested repository setup, documentation edits or other assistance remain allowed within their stated scope. Delegation and delivery rules below apply only to authorized work; they must not turn a discussion into a coding workflow.

## Before changing code

1. Read this file, the relevant README sections, and the nearest directory-specific `AGENTS.md` for files you will touch.
2. Inspect the existing implementation and tests before introducing a new pattern.
3. Load only the relevant project knowledge:
   - Architecture and product boundaries: `docs/architecture.md`
   - UI, accessibility and print rules: `docs/design-system.md`
   - Validation and test conventions: `docs/testing.md`
   - Durable decisions and rationale: `docs/decisions/`
   - Active complex execution plans: `docs/plans/active/`
4. Read `MEMORY.md` only as a pointer to repository knowledge; it is not a second source of truth.
5. Keep changes focused. Never commit secrets, private personal data, or machine-specific configuration.

## Product constraints

- beaver-tools is a collection of small, everyday web tools. Optimize for a working, understandable vertical slice per tool rather than a large platform.
- Astro + React + TypeScript produces a static site. Interactive tools are React islands; pages without interaction stay server-rendered and JavaScript-light.
- Tools are local-first by default. Personal input stays in the browser unless a tool's documented purpose requires a backend. Never add analytics, tracking, or remote persistence without an explicit decision and user-facing privacy note.
- A tool owns its domain logic under `src/lib/<tool>/` and its UI under `src/components/<tool>/`. Keep pure logic testable without a browser.
- Prefer existing dependencies and project patterns; do not perform unrelated refactors or upgrades.
- Use the Node version pinned by `.nvmrc`, npm, and the committed `package-lock.json`. Use `npm ci` for clean installs.

## Adding or changing a tool

- Register user-visible tools in `src/lib/tools.ts`; the landing page and tool metadata come from this list.
- Keep each tool reachable at a stable route under `src/pages/`.
- Reuse the shared layout, tokens and controls before adding a new visual pattern.
- Follow the `tool-authoring` skill for the full checklist.

## Required validation

For normal changes run:

```sh
npm run verify
```

This runs Biome checks, Astro/TypeScript validation, and unit tests.

For changes affecting rendering, routing, layout, styling, focus, browser interaction, or print output run:

```sh
npm run verify:web
```

This includes core verification, a static production build, and the Playwright browser suite. Load the `web-verify` skill for browser setup and diagnosis.

If a required check cannot run, state exactly which check was skipped and why. Never report an unrun check as passing.

## Context and agent handoffs

- Load only task-relevant documentation and skills. Do not forward entire research transcripts or unrelated project files to the next agent.
- For cross-role handoffs, summarize relevant files/sources, key findings, agreed decisions and acceptance criteria, risks, and open questions. Link to detailed evidence instead of duplicating it.
- For behavior-heavy features, bug fixes and UI changes, use the `tester` subagent for independent acceptance testing after developer verification and before final review; skip it for documentation-only or trivial non-behavioral changes. Follow `docs/testing.md#independent-tester-agent`.
- The developer still owns tests, fixes, and required verification.

## Delegation and visibility

- Prefer direct execution by the primary agent for small, well-scoped changes, familiar patterns, documentation, and routine fixes. Subagents are optional specialists, not a mandatory workflow. Never delegate solely because agents are available.
- Delegate only when a distinct skill, independent investigation, or genuinely separable work materially improves the outcome. For medium tasks, prefer at most one specialist; for complex or high-risk tasks, involve only the roles justified by the work.
- Researcher: invoke for unresolved API, architecture, security, or unfamiliar technical questions. Designer: invoke for meaningful UX decisions, not routine reuse of components. Tester: retain independent testing for behavior-heavy features, bug fixes, and UI changes.
- Before delegating, identify the specific unanswered question or deliverable and avoid redoing work already established in the current session.
- Before each delegation, tell the user the agent's name and concrete task in a short, user-visible message.
- Run subagents in parallel only for independent tasks. Sequence dependent work and pass concise relevant findings between roles.
- The primary agent owns coordination, integration, and the final response. Subagents must not delegate further.

## Efficient agent execution

- When implementation is explicitly requested, prefer the primary agent. Small, familiar, single-area tasks: zero subagent calls by default. Medium tasks: at most one specialist by default. Complex or high-risk tasks: use only specialists with a distinct, necessary deliverable.
- Before any delegation, state the specific question, expected output and why direct work is insufficient. Reuse relevant current-session findings.
- Prefer concise handoffs (goal, affected files, acceptance criteria, key decisions, evidence and unresolved risks). Never forward complete agent transcripts or duplicate repository documentation.
- Verification evidence is reusable only for the exact revision and relevant environment. Run the required final gate after changes, then let independent tester/reviewer inspect existing evidence and cover additional risks rather than repeating an unchanged full gate.
- Stop open-ended research once the task's uncertainty is resolved. When a loop is not converging, report the blocker and ask for a decision.
- Never sacrifice required tests, independent high-risk review, or security controls solely to reduce tokens.

## User-facing terminology and learning

- When the user describes a feature, interaction, architecture idea, or bug informally, name the relevant established software engineering, UX, or domain term in the user-facing response, with a brief plain-language explanation when helpful.
- Prefer precise, context-appropriate terminology; distinguish similar concepts when the distinction matters. Do not invent jargon or correct the user's wording unnecessarily.
- Keep explanations concise and natural, typically one sentence integrated into the response.

## Tests and UI

- Follow `tests/AGENTS.md` for test-specific rules.
- Add or update tests for behavioral changes and bug fixes when practical; prefer regression tests that fail without the fix.
- Do not weaken tests or rules merely to make CI green.
- Biome is the source of truth for formatting, linting, and import organization in TypeScript, JSON and CSS. Astro and Markdown files are formatted manually: current Biome analysis misidentifies Astro template usages and damages YAML frontmatter indentation. Astro check validates Astro files; harness tests validate agent permissions independently.
- Preserve keyboard access, visible focus, accessible names and print readability.

## CI failures

Read the exact failing job first, reproduce locally when possible, fix the root cause, rerun the failing command, then rerun the full relevant validation set. Do not use repeated speculative pushes as the development loop when the failure is locally reproducible.

## Git and pull requests

- All repository changes go through pull requests; never push directly to `main`.
- Use a dedicated task branch/worktree starting from latest `origin/main` unless the task depends on another branch.
- Prefer worktrees under the source workspace's `src/worktrees/<unique-project-task-name>` directory (outside repository checkouts). Do not disturb another agent's or the user's worktree.
- Commit and push the task branch, then open or update the PR.
- Before reusing or updating an existing PR/branch, verify that the PR is still open. Never add new work to a closed or merged PR; start a fresh branch from current `main` and open a new PR instead.
- After completing work on an open PR and before final delivery, fetch `origin` and merge the latest `origin/main` into the PR branch (do not rebase). Resolve conflicts, rerun the required validation, and push. If `origin/main` is already an ancestor, no merge commit is needed. This does not authorize merging the PR.
- Before delivery inspect the diff for unrelated files, generated artifacts, debug code, and secrets.
- Report which validation actually ran.
- Never merge a PR without explicit user authorization.

### Release the task worktree after delivery

The user tests delivered branches locally, so a finished task must not keep its branch checked out in an agent-owned worktree. Release the worktree after the final commit is pushed and the PR is open or updated, before the final response:

1. Confirm the worktree is clean and everything is committed and pushed (`git status --short` prints nothing).
2. Leave the worktree and run from another checkout: `git worktree unlock <path>` when it is locked, then `git worktree remove <path>` and `git worktree prune`. Never pass `--force`; if removal fails, stop and report the remaining changes instead of discarding them.
3. Verify that `git worktree list` no longer contains the path and that `git branch` does not mark the task branch with `+`.
4. Name the branch, PR link, final commit and checkout commands in the final response.

Keep the worktree only when the user explicitly asks to keep it for testing or follow-up work; state why and how to release it later. Never delete uncommitted work or another agent's or the user's worktree to satisfy this rule.

## Definition of done

A task is done only when requested behavior is implemented, appropriate tests/documentation are updated, required checks pass (or gaps are disclosed), and the final diff is scoped and safe.

## Improve the harness

Treat recurring agent mistakes as repository feedback. Prefer a deterministic guardrail in this order when practical:

1. test or verification script;
2. TypeScript/Biome/configuration rule;
3. CI check;
4. concise repository documentation or agent instruction.

Do not grow this file with detailed incident history. Put durable knowledge in the appropriate linked document and let Git history preserve obsolete implementation details.
