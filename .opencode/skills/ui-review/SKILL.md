---
name: ui-review
description: Review beaver-tools UI changes for Workshop consistency, responsive behavior, accessibility, interaction states and print output. Use for new or changed pages, components, forms, layouts or visual regressions.
compatibility: opencode
metadata:
  project: beaver-tools
  workflow: ui
---

# Review beaver-tools UI

Review the UI as a product surface, not only as markup that compiles.

## 1. Gather context

- Read `AGENTS.md` and `docs/design-system.md`.
- Read the relevant implementation and existing shared components before proposing a new pattern.
- Inspect the diff to understand exactly what changed.

## 2. Preserve Workshop

Workshop is warm paper, dark ink, one amber accent and quiet utility:

- generous whitespace, clear hierarchy, no decorative clutter;
- cards with thin borders and modest radii;
- system fonts, no remote font loading;
- restrained color; status is never conveyed by color alone;
- real, selectable text in print output.

Prefer existing tokens and shared components over one-off styling.

## 3. Review behavior, not screenshots alone

For affected flows inspect:

- empty, filled, invalid-input, error and persisted states;
- disabled and unsaved states;
- focus and keyboard behavior;
- accessible labels, roles, hit targets and readable contrast;
- long names, long lists and missing optional data;
- responsive behavior at narrow and desktop widths;
- print layout when the tool is printable.

Do not assume a happy-path screenshot proves the feature works.

## 4. Check responsive behavior

At minimum, verify relevant UI at:

- a narrow/mobile viewport (~390px);
- a desktop/web viewport (~1280px).

Use the existing Playwright suite:

```sh
npm run build
npm run test:e2e
```

Do not create a second browser harness. Do not claim native-app verification; beaver-tools has no native target.

## 5. Check framework-specific decisions

For Astro, React, browser APIs or version-sensitive behavior, consult current documentation through available tooling such as Context7 when behavior is uncertain.

Prefer existing project patterns before introducing a new dependency or browser workaround.

## 6. Produce actionable findings

Prioritize findings:

1. broken behavior or regression;
2. accessibility/usability problem;
3. responsive or print issue;
4. inconsistency with established beaver-tools patterns;
5. visual polish.

When asked to implement/fix the UI, address the findings and then run the `verify` workflow.

When asked only to review, do not modify files unless explicitly requested. Report what was actually inspected and distinguish automated verification from subjective visual judgment.
