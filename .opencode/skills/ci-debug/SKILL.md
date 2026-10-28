---
name: ci-debug
description: Diagnose and fix beaver-tools CI failures systematically. Use when GitHub Actions or a local equivalent fails, especially for Biome, Astro check, Node tests, static build or Playwright.
compatibility: opencode
metadata:
  project: beaver-tools
  workflow: ci
---

# Debug beaver-tools CI

The objective is to reproduce and remove the cause of a CI failure, not to push speculative fixes until GitHub turns green.

## 1. Read the failure first

- Read `AGENTS.md`.
- Identify the exact failing workflow job, step, command and first meaningful error.
- Inspect the relevant source/configuration and recent diff before editing.
- If GitHub tooling is available, inspect the failed run/logs directly.
- Do not assume the last edited file caused the failure.

Core checks correspond to:

```sh
npm run check
npm run typecheck
npm test
```

The browser path additionally uses:

```sh
npm run build
npm run test:e2e
```

## 2. Reproduce locally

Run the smallest command that reproduces the CI failure.

- Biome failure → `npm run check`
- Astro/TypeScript failure → `npm run typecheck`
- Node test failure → `npm test`
- static build failure → `npm run build`
- browser failure → `npm run test:e2e` (or one spec/test)

Match the repository's Node/npm setup. Use the Node version pinned by `.nvmrc` and npm with the committed lockfile.

If the failure cannot be reproduced, compare environment assumptions instead of guessing: Node version, clean install, browser availability, viewport, locale/timezone, generated/cached state.

## 3. Fix the root cause

- Make the smallest coherent fix that addresses the diagnosed cause.
- Do not disable lint/type rules to hide the failure.
- Do not weaken or delete tests merely because they fail.
- Do not add retries or sleeps to conceal deterministic bugs.
- Do not perform unrelated refactors or dependency upgrades.

For framework/library behavior that may be version-sensitive, use available current-documentation tooling such as Context7 or official documentation before relying on remembered APIs.

## 4. Prove the fix locally

First rerun the command that failed. Then run the full relevant validation set:

```sh
npm run verify
```

or, for browser-visible changes:

```sh
npm run verify:web
```

Do not use a new CI run as a substitute for locally runnable checks.

## 5. Improve the harness

Ask: could this class of failure have been caught before the PR?

If yes, prefer a small durable guardrail:

- regression test;
- Biome/TypeScript rule;
- npm validation script;
- CI step;
- concise `AGENTS.md` rule.

Only add a guardrail when it is general enough to prevent recurrence.

## 6. Report clearly

State:

- the actual root cause;
- why the fix addresses it;
- commands rerun and their results;
- any new regression test/guardrail;
- anything still unverified.

If the root cause is still unknown, say so. Do not describe a speculative change as a fix.
