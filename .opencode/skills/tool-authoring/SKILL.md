---
name: tool-authoring
description: Add a new small tool to beaver-tools. Use when creating a tool page, its domain logic, registration, tests and documentation, or when deciding whether a tool needs persistence or a backend.
compatibility: opencode
metadata:
  project: beaver-tools
  workflow: feature
---

# Add a tool to beaver-tools

A tool is a small vertical slice, not a new platform.

## 1. Define the slice

Write down:

- the one concrete user task;
- the input and output;
- whether data must persist, and for how long;
- whether anything must leave the browser;
- the narrowest useful first version and explicit non-goals.

Default to local-first. A backend requires a decision record and a user-facing privacy note.

## 2. Choose the rendering mode

- Static content and simple forms: Astro page, minimal or no JavaScript.
- Stateful interactive UI: one React island.
- Browser-storage-dependent initial state: `client:only="react"` with a meaningful static fallback.

Avoid hydrating the whole page.

## 3. Create the files

```text
src/lib/<tool>/model.ts       # types and factories
src/lib/<tool>/storage.ts     # persistence + untrusted import normalization
src/lib/<tool>/format.ts      # pure formatting helpers
src/components/<tool>/...     # React island UI
src/pages/<route>.astro       # page composition
```

- Keep pure logic free of React and DOM APIs.
- Validate and bound imported data.
- Version persisted data.
- Use shared tokens and components from `src/styles/global.css` and `src/components/site/`.

## 4. Register and expose the tool

- Add an entry to `src/lib/tools.ts` with name, route, short description and status.
- Add the route page with a clear `<h1>`, intro and privacy note.
- Link back to the tool shelf.
- Update `README.md` if the tool is user-visible enough to document.

## 5. Test

- Unit tests for normalization, formatting, storage versioning and corrupted input.
- Playwright test for the primary journey, persistence/export, invalid input, and one narrow viewport.
- Keyboard check for custom controls.

## 6. Verify

Run:

```sh
npm run verify:web
```

Follow `verify` and `web-verify` for diagnosis. Do not commit generated reports, screenshots or private data.

## 7. Document decisions

Add a decision record only for durable tradeoffs (storage model, backend, external service, file format). Routine implementation belongs in code and tests.
