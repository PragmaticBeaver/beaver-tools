---
name: web-verify
description: Verifies browser-visible beaver-tools changes with the production Astro build and the repository's Playwright suite.
---

# beaver-tools web verification

Use this skill when a change can affect rendering, routing, layout, focus, styling, accessibility, interaction or print output.

## Canonical gate

Run:

```sh
npm run verify:web
```

This is the final web verification gate. It runs core checks, builds the static site, then executes the Playwright suite against `astro preview`.

If Chromium is missing, install the required browser once:

```sh
npx playwright install chromium
```

Do not substitute a different browser framework or create a second web harness unless the task explicitly requires it.

## What the harness provides

- `playwright.config.ts` starts its own `astro preview` on `127.0.0.1:4321`. An occupied port fails explicitly rather than testing another checkout.
- `tests/e2e/` contains browser tests with a fresh context and cleared `localStorage` where needed.
- The built `dist/` output is tested, not the dev server.
- Reports and traces are written to `playwright-report/` and `test-results/`; both stay ignored.

If the default port is occupied, leave the other process alone and run `E2E_PORT=4322 npm run verify:web` on a free port. The override applies only to the test-owned preview server and its browser base URL.

Astro 7 automatically backgrounds previews in agent environments. The harness explicitly sets `ASTRO_PREVIEW_BACKGROUND=0` and passes `--ignore-lock` so Playwright owns and cleans up its foreground process without reusing or stopping a personal preview.

Prefer extending the owning spec over writing an ad-hoc runner. During diagnosis, run one spec or test:

```sh
npm run build
npx playwright test tests/e2e/home.spec.ts
npx playwright test -g "landing"
```

A focused pass never replaces the full `npm run verify:web` gate.

## Verify → diagnose → fix → verify

1. Read the first actionable failure and identify whether it came from core verification, the Astro build, browser launch, application behavior or an assertion.
2. Reproduce only the smallest relevant command.
3. Inspect the failing assertion and relevant route/component. Prefer deterministic role/label/text assertions over CSS selectors.
4. Fix the root cause. Do not add fixed sleeps, forced clicks, retries or weaker assertions merely to obtain a pass.
5. Rerun the focused failing command.
6. Rerun `npm run verify:web` from the beginning.

Repeat until the gate passes or an external/environmental blocker remains.

## Print and layout diagnosis

- Print behavior is verified through CSS visibility and, where practical, `page.emulateMedia({ media: 'print' })`.
- Use `page.screenshot()` manually for diagnosis; do not commit screenshots.
- Check at least a narrow viewport (390px) and desktop when a layout is responsive.
- Automated geometry checks are evidence for reachability; screenshots alone are not proof of correctness.

## Adding regression coverage

When fixing a browser-visible bug, add a focused assertion that fails without the fix.

Keep tests deterministic:

- clear `localStorage` before tests that need a fresh state;
- use accessible roles and labels;
- wait for meaningful state rather than fixed sleeps;
- avoid external network access;
- never hide interception failures with forced clicks.

Follow `tests/AGENTS.md`.

## Report

At completion state:

- whether `npm run verify:web` passed;
- any focused commands used during diagnosis;
- what browser behavior was verified;
- any remaining visual or environmental verification gap.
