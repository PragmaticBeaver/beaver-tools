# Design system — Workshop

Workshop is beaver-tools' visual language: warm paper surfaces, dark ink, a single amber accent, and quiet utility. It should feel like a well-kept workbench, not a SaaS dashboard.

## Tokens

Defined in `src/styles/global.css`:

- `--paper`: warm off-white page background
- `--surface`: raised card and panel background
- `--ink`: primary text
- `--muted`: secondary text
- `--line`: borders and dividers
- `--accent`: amber primary action and focus color
- `--accent-soft`: pale amber highlight
- `--teal`: restrained secondary accent for status
- `--danger`: destructive actions only

Use tokens rather than one-off hex values. Add a token only when a new semantic role is genuinely needed.

## Layout

- Content width is capped at `1120px`; prose is capped at `68ch`.
- Shared page shell: compact brand header, main content, quiet footer.
- Cards use a 1px `--line` border, `10px` radius and no heavy shadows.
- Spacing follows a 4px rhythm; prefer `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `3rem`.
- Mobile-first; desktop split views collapse to a single column below `960px`.

## Typography

- System UI stack for interface text; a serif display stack only for large page headings.
- Body text at least `1rem` with `1.6` line height.
- Uppercase micro-labels are small, letter-spaced, and never the only signifier of meaning.
- Do not load remote fonts.

## Interaction

- Every interactive element is reachable by keyboard and has a visible `:focus-visible` ring.
- Icon-only controls require an accessible name and a tooltip/title.
- Buttons use verb-first German labels.
- Status messages use `role="status"` or `aria-live="polite"` and do not steal focus.
- Destructive actions require confirmation or an undo path.

## Accessibility

- Maintain WCAG AA contrast for text and controls.
- Never use color alone to convey state; pair it with text or an icon.
- Form controls always have a `<label>`; placeholders are not labels.
- Respect `prefers-reduced-motion` and avoid non-essential animation.
- Print output must remain readable without color.

## Print

- Use real, selectable text, not images of text.
- A4 page, 14mm margins, black text on white, no shadows or UI chrome.
- Hide navigation, editors and toolbars in `@media print`.
- Avoid page breaks inside entries; keep headings with their content.
- Links may be printed as text; do not rely on hover.

## Voice

German UI, concise and friendly. Prefer plain words over jargon ("Lebenslauf", not "Résumé-Asset"). Empty states explain the next action.
