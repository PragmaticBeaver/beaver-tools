# Bootstrap: harness and first tool

## Agreed scope

- Astro + React + TypeScript, static output, npm and Node 24.
- German UI and English repository documentation.
- Adapt AniOshi's agents, skills, worktree guard, documentation structure and validation; omit AniList, Expo, native targets and its visual identity.
- First useful slice: a local-first CV editor with preview, JSON transfer and browser printing. No accounts or backend.

## Acceptance criteria

1. A clean `npm ci` creates a runnable development/build environment.
2. The tool shelf links to `/lebenslauf`; static pages remain usable without JavaScript.
3. CV sections can be edited, added and removed; preview and reload reflect changes.
4. Import/export round-trips versioned data; malformed or unsupported input cannot silently replace a CV.
5. Reset/sample replacement requires confirmation. Storage failures are disclosed.
6. Narrow screens, keyboard interaction and print visibility are covered by browser tests.
7. Core checks, build and browser tests pass via `npm run verify:web`; independent acceptance testing follows.
8. Delivery through a PR without merging; release the task worktree.

## Progress

- Harness/configuration and architecture/decision/testing docs created.
- Dependencies installed with lockfile; initial audit reports no vulnerabilities.
- Domain/import/storage, harness-frontmatter and worktree-guard unit tests: 23 passed.
- Focused independent review of harness/domain completed; Markdown formatting compatibility and mailto encoding findings fixed and re-reviewed.
- UI, all CV sections, local photo processing, import/export and A4 print CSS implemented.
- Clean `npm ci`: passed; audit reports zero vulnerabilities. npm notes an unapproved optional macOS `fsevents` install script; no additional approval was needed for build/tests.
- After the clean install, `E2E_PORT=4322 npm run verify:web`: passed (23 unit tests, 7 browser tests, production build, zero Astro diagnostics). Four advisory Biome warnings concern accessibility-related reduced-motion `!important` overrides.
- Independent tester: 10 additional scenarios passed, including all collection controls, boundary-length round trips, blocked storage, invalid imports/photos, stale async import cancellation, no-JavaScript fallback, narrow/desktop layout and PDF generation. No bugs found.
- Final independent code review: no blocking findings or actionable defects. Prior harness/domain review findings resolved.
- Delivery: task branch `feat/harness-cv-generator`; PR remains unmerged for user review.

## Follow-up coverage

The independent tester's additional probes were read-only acceptance checks. Useful future permanent regressions include boundary-length round trips, every collection's reorder/removal, invalid-photo preservation and pending-import/reset cancellation.

## Verification boundaries

- Chromium is the initial automated browser target; Safari/Firefox and subjective printed-PDF quality remain separate checks.
- No ATS parser compatibility certification; output uses real text and a simple document layout.
- No native builds, accounts, external persistence or deployment configured.
