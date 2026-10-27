# Architecture

## Product direction

beaver-tools is a personal collection of small, focused web tools for everyday use. The landing page is a workshop shelf: each tool solves one concrete task without accounts, tracking, or unnecessary ceremony.

The current scope is the repository foundation and a simple static landing page. No tool is implemented yet. Concrete tools require a separate request; do not implement a product feature merely because it was mentioned as future context.

## Stack

- Astro 7 (static output)
- React 19 islands for interactive tools
- TypeScript (strict)
- Plain CSS with shared design tokens
- Playwright for browser regression tests
- Node's built-in test runner for pure logic

## Boundaries

- `src/pages/` owns routes and composes layouts/tools.
- `src/layouts/` and `src/components/site/` own the shared shell.
- `src/components/<tool>/` owns interactive tool UI.
- `src/lib/<tool>/` owns the tool's data model, validation, formatting and persistence. Pure functions must be testable without a DOM.
- `src/lib/tools.ts` is the user-visible tool registry. It drives the landing page and is the source of truth for tool names, routes and status.
- `public/` contains static assets only.

## Data and privacy

- Future tools should be local-first. The current landing page collects no input and uses no browser storage.
- Imported JSON is untrusted input: validate, normalize and bound it before rendering or persisting.
- No analytics, third-party fonts, tracking pixels, or remote persistence.
- A tool that genuinely needs a backend requires a documented decision in `docs/decisions/`, a privacy note in the UI, and an explicit data-flow boundary.

## Rendering

- Astro pages are static by default.
- Interactive tools use a single React island (`client:only="react"`) when their initial state depends on browser storage, with a meaningful static fallback.
- Avoid hydrating the entire page. Shared navigation and content stay server-rendered.

## Open decisions

Evaluate only when a concrete tool requires them:

- persistence and import/export formats, only when a concrete tool requires them;
- deployment target and custom domain;
- internationalization if tools need more than German UI.
