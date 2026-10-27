# Test conventions

- Unit tests live in `tests/*.test.mjs` and import TypeScript source directly. Keep them browser-free.
- Browser tests live in `tests/e2e/*.spec.ts` and use the shared Playwright configuration.
- Tests must be deterministic. Clear `localStorage` before a test that depends on a fresh tool state.
- Prefer user-visible assertions (roles, labels, text, selected state) over CSS classes or implementation details.
- Every browser test starts from the built site (`npm run build` then `npm run test:e2e`), not the dev server.
- Do not commit `playwright-report/`, `test-results/`, traces, or screenshots.
- Add a regression test that fails without the fix for behavior bugs.
- Do not make tests depend on private personal data, real accounts, or external network access.

## Adding a tool

At minimum cover:

1. the page loads with an accessible heading and primary control;
2. the main create/edit/save journey;
3. persistence or export/import if the tool stores data;
4. one narrow-viewport check if the layout changes responsively;
5. a keyboard check for the primary action when custom controls are involved.
