# ADR-002: Astro tool collection

**Status:** Accepted

## Context

beaver-tools is a growing collection of small, mostly client-side utilities. Most tools need no server, accounts, or shared backend. Astro is already used in a sibling project and produces fast static pages with minimal JavaScript.

## Decision

Use a single Astro application with static output.

- Shared shell, landing page and documentation-like pages are server-rendered at build time.
- Interactive tools are React islands mounted only where needed.
- A tool gets a stable route under `src/pages/` and an entry in `src/lib/tools.ts`.
- Domain logic lives in `src/lib/<tool>/` and stays framework-independent.
- Styling uses shared CSS tokens instead of a utility framework for now.

## Consequences

The site can be hosted on any static host (Cloudflare Pages, GitHub Pages, Netlify) without a runtime. Adding a server-dependent tool requires an explicit architectural decision rather than silently introducing a backend. Astro's file-based routing keeps each tool small and independently deployable within one build.
