# beaver-tools

A growing collection of small, local-first web tools for everyday use.

The first tool is a **German CV generator**: edit a structured CV, keep it in your browser, export/import JSON, and print a clean A4 PDF through the browser. Personal data never leaves the device.

## Tools

| Tool | Route | Status |
| --- | --- | --- |
| Lebenslauf-Generator | `/lebenslauf` | available |

## Stack

- [Astro](https://astro.build/) static output
- React islands for interactive tools
- TypeScript (strict)
- Plain CSS with shared Workshop design tokens
- Playwright for browser regression tests
- Node's built-in test runner for pure logic

## Development

Requirements: Node 24.21.0 (see `.nvmrc`) and npm.

```sh
nvm install
nvm use
npm ci
npm run dev
```

Open the URL printed by Astro (usually `http://localhost:4321`).

### Verification

```sh
npm run verify       # Biome, Astro type check, unit tests
npm run verify:web   # core checks, static build, Playwright
```

First-time browser setup:

```sh
npx playwright install chromium
```

### Build

```sh
npm run build
npm run preview
```

The static output is written to `dist/`. Deploy it to any static host. No server, database, environment variables or secrets are required.

## Adding a tool

1. Keep domain logic in `src/lib/<tool>/` and UI in `src/components/<tool>/`.
2. Add the route under `src/pages/`.
3. Register the tool in `src/lib/tools.ts`.
4. Add unit and Playwright coverage.
5. Run `npm run verify:web`.

See `.opencode/skills/tool-authoring/SKILL.md` for the full checklist and `docs/architecture.md` for boundaries.

## Privacy

beaver-tools has no backend, analytics or tracking. CV data is stored in the browser's `localStorage` and only leaves the device when you explicitly export a JSON file or print/save a PDF.

Browser storage is not an encrypted vault or a backup: other users of the same browser profile can access it, and clearing site data removes it. Export a JSON backup before clearing browser data or changing devices. Keep personal CV exports outside this repository.

The first browser visit requires downloading the site. Local-first does not yet mean an installable/offline-cached PWA; no service worker is configured.

For PDF output, choose A4 and disable browser headers/footers in the print dialog. The document uses selectable text; automated ATS compatibility and identical pagination across browsers are not guaranteed.

## Agent workflow

The repository ships its agent harness: `AGENTS.md`, topic documentation under `docs/`, role agents under `.opencode/agents/`, skills under `.opencode/skills/`, and a worktree guard plugin. See `AGENTS.md` for required validation and delivery rules.

See [Harness](docs/harness.md) for the AniOshi transfer scope, daily workflow and guard limitations.

## License

GPL-3.0. See `LICENSE`.
