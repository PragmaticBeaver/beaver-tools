# ADR-003: Local-first CV generator with browser printing

**Status:** Accepted

## Context

A CV contains sensitive personal data. The first beaver-tools tool should be immediately useful without accounts, a database, or operational overhead. Users need to edit, keep, reuse, and export a CV.

## Decision

The CV generator is a client-only React island.

- Data is stored in `localStorage` under a versioned key.
- Users can export and import a versioned JSON document.
- PDF output uses the browser print dialog with dedicated A4 print CSS. No PDF library is added.
- Imported JSON is treated as untrusted input and normalized against the current schema.
- Optional photos are resized in the browser before storage; no upload occurs.
- There is no backend, analytics, or remote persistence.

## Consequences

Personal data never leaves the device, and the tool works offline after the static page is loaded. Browser print output varies slightly between browsers, but remains selectable text and ATS-friendly. `localStorage` has a small quota; a photo is bounded and resized, and a future multi-document library may require IndexedDB (see the open decisions in `docs/architecture.md`). Cross-device sync is intentionally out of scope; JSON export/import is the transfer mechanism.
