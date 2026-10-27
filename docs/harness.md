# Agent harness

## Adapted from AniOshi

This repository reuses the workflow, not AniOshi's application architecture:

| Reused | Adaptation |
| --- | --- |
| `AGENTS.md` and topic documentation | Static, local-first tools instead of a cross-platform AniList client |
| Developer, researcher, designer, tester, reviewer roles | Astro/React, browser privacy, accessibility and printing |
| Verify/fix loop | `verify` for core, `verify:web` for the built site and Playwright |
| Worktree guard and regression tests | Project identity changed; original checkout remains read-only to editing tools |
| Skills | General verification, web verification, CI diagnosis, UI review, tool authoring |
| CI | Small core + browser workflow; no native exports, devices or AniList fixtures |

Not copied: Expo/native tooling, AniList integration and credentials, Sakura Ink design, application-specific tests, historical plans, or personal environment files.

## Everyday workflow

1. Describe the desired user outcome and constraints.
2. Work on a fresh task branch in a linked worktree from current `origin/main`.
3. Load only relevant context and skills. Research/design specialists are optional, not a required ceremony.
4. Implement a focused slice and add regression coverage.
5. Run the canonical verification and fix the root cause of failures.
6. For behavior-heavy/UI work, obtain independent tester evidence. Review the diff before delivery.
7. Deliver through an unmerged PR, synchronize with current main, and release the clean task worktree.

The primary agent coordinates and owns the result. Subagents do not delegate further.

## Guard boundaries

The plugin checks OpenCode `edit` permission events against the current session location, Git branch and canonical paths. It rejects edits in the primary checkout, on main/master or detached HEAD, outside the task worktree, through escaping symlinks, and inside Git administration or nested repositories.

This is an editing-tool guardrail, **not an operating-system sandbox**: shell commands can write files and are not blocked by the plugin. Agents still follow the repository rules and normal permission checks. Never treat the guard as authorization to execute unsafe shell commands.

## Optional current-library documentation

`opencode.json` configures Context7 with an environment substitution, never a committed key. Set `CONTEXT7_API_KEY` in the environment used by OpenCode if needed. The application's install, build and tests do not depend on this service. Do not put secrets into public client environment variables.
