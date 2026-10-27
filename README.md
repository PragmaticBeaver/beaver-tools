# beaver-tools

A future collection of small, local-first web tools for everyday use.

## Current scope

Repository foundation and a simple German landing page only. No individual tool, editor, persistence or export functionality is implemented yet. Product features require a separate request.

## Stack

- Astro static output
- React integration ready for future interactive islands (unused by the current static pages)
- Strict TypeScript, Tailwind CSS 4 and shared CSS tokens
- Biome, Node unit tests and Playwright browser tests
- GitHub Actions for core and browser verification

## Development

Use Node 24.21.0 (see `.nvmrc`) and npm:

```sh
nvm install
nvm use
npm ci
npm run dev
```

Astro prints the local URL, normally `http://localhost:4321`.

### Tailwind CSS

Tailwind 4 is integrated through `@tailwindcss/vite`. Use utility classes directly in Astro's `class` or React's `className`, for example `flex gap-4 md:gap-6`. Classes under `src/` are detected automatically; no `tailwind.config.js` is needed.

`src/styles/global.css` loads Tailwind and the existing styles from `src/styles/site.css`. Existing styles live in the `components` cascade layer so Tailwind utilities can override them. Preflight (Tailwind's CSS reset) is intentionally omitted to preserve the current browser/base styles. The existing width wrapper is named `site-container` to avoid a collision with Tailwind's `container` utility.

Keep class names complete, such as `text-red-600` rather than dynamically constructing `text-${color}-600`, so the build can detect them. This setup adds no client-side JavaScript.

## Verification and build

```sh
npx playwright install chromium   # first-time browser setup
npm run verify                   # Biome, Astro check, unit tests
npm run verify:web               # core checks, production build, browser tests
npm run build                    # static output in dist/
npm run preview
```

If the browser-test port is occupied, use `E2E_PORT=4322 npm run verify:web`. The test harness owns its preview process and does not reuse another server.

No backend, secrets or environment variables are required to install, build or test the site. No analytics, tracking or browser storage is used.

## Agent workflow

The adapted AniOshi harness includes `AGENTS.md`, repository knowledge under `docs/`, specialized agents and skills under `.opencode/`, a worktree guard and canonical verification commands.

Read [Harness](docs/harness.md) for transfer scope and guard limitations, and [Architecture](docs/architecture.md) for project boundaries. Context7 is optional and reads its key from `CONTEXT7_API_KEY` in OpenCode's environment, not from committed credentials.

## Future tools

`src/lib/tools.ts` is intentionally empty. Register tools only when their implementation is requested. The `tool-authoring` skill describes the workflow without prescribing a particular first tool.

## License

GPL-3.0. See `LICENSE`.
