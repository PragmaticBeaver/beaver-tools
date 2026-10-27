# Testing and validation

## Canonical verification

For normal code changes, use the single core entry point:

```sh
npm run verify
```

It runs, in order:

```sh
npm run check
npm run typecheck
npm test
```

For changes affecting rendering, routing, layout, styling, focus, browser interaction, or print output, use:

```sh
npm run verify:web
```

It runs core verification first, then:

```sh
npm run build
npm run test:e2e
```

Use the smallest command that reproduces a failure while diagnosing it, but finish by rerunning the full required `verify` or `verify:web` entry point. Biome is the source of truth for formatting, linting and import organization. Fix root causes rather than weakening rules or tests.

## Verify/fix loop

Implementation is not complete merely because validation was attempted.

1. Implement the focused change.
2. Run the required canonical verification command.
3. If it fails, read the exact failure and reproduce the smallest relevant failing check when useful.
4. Fix the root cause without weakening unrelated tests or guardrails.
5. Rerun the focused failing check.
6. Rerun the canonical verification command from the beginning.
7. Repeat until it passes or a genuine external/environmental blocker prevents verification.

If blocked, report the exact command, failure and blocker. Never describe an unrun or failing check as passing.

## Test principles

- Add or update tests for behavioral changes and bug fixes when practical.
- Prefer a regression test that fails without a bug fix.
- Keep tests deterministic and independent of private data.
- Test pure domain logic with Node's test runner; test user-visible behavior with Playwright.
- Do not delete or weaken a test merely because new code fails it unless expected behavior intentionally changed.
- Follow `tests/AGENTS.md` for test-local rules.

## Unit tests

`npm test` runs `tests/*.test.mjs` with Node's built-in test runner and type stripping. Unit tests may import TypeScript modules directly. They must not require a browser, network, or a populated `localStorage`.

The current unit suite validates the harness and worktree guard. When tools are added, cover relevant:

- data normalization and untrusted import handling;
- pure domain transformations;
- storage versioning and corrupted-data recovery.

`tests/harness.test.mjs` also parses the actual agent/skill YAML frontmatter and checks role permission boundaries. Markdown formatting stays manual because the current Biome formatter does not preserve that frontmatter safely.

## Browser tests

`npm run test:e2e` starts the built site through `astro preview` and runs Playwright.

Use browser tests for:

- the primary user journey of a tool;
- persistence across reloads;
- import/export and reset behavior;
- responsive layout at a narrow and a desktop viewport;
- keyboard reachability and accessible names;
- print-mode visibility where practical.

Do not test implementation details or localStorage internals when a user-visible assertion is possible. A test may clear `localStorage` before each run to start from a known state.

First-time setup:

```sh
npx playwright install chromium
```

Generated reports and screenshots stay ignored: `playwright-report/`, `test-results/`.

## Independent tester agent

`.opencode/agents/tester.md` is a non-editing acceptance-testing role. Use it for behavior-heavy features, bug fixes and UI changes after developer verification and before final review. Skip it for documentation-only or trivial non-behavioral work. A typical flow is `developer → verify → tester → reviewer`; findings return to the developer for fixes, required verification and targeted tester retesting. Research/design remain optional upstream roles.

Role boundaries:

- **Developer:** implements behavior, adds/updates automated tests and owns the canonical verify/fix loop.
- **Tester:** independently translates acceptance criteria into observable scenarios, exercises relevant behavior and reports bugs or coverage gaps. Does not edit files or fix tests/product code.
- **Reviewer:** assesses correctness, architecture, maintainability and project conventions from the diff, using the tester's evidence without treating it as a substitute for code review.

Give the tester a concise handoff: acceptance criteria, branch/worktree and exact revision (plus any uncommitted changes), changed behavior, relevant test entry points, commands/results already run and known risks. Do not forward entire implementation transcripts.

Before final delivery the developing agent releases its task worktree so the branch is not checked out elsewhere and the user can test it locally; see [AGENTS.md](../AGENTS.md#release-the-task-worktree-after-delivery).

## CI failures

Read the exact failing job first, reproduce locally when possible, fix the root cause, rerun the failing command, then rerun the full relevant validation set. Do not use repeated speculative pushes as the development loop when the failure is locally reproducible.
