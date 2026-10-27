---
name: verify
description: Verify a beaver-tools implementation before it is considered complete or ready for a pull request. Use after code changes, before committing or opening/updating a PR, or whenever asked whether a change is done, safe, or CI-ready.
compatibility: opencode
metadata:
  project: beaver-tools
  workflow: validation
---

# Verify beaver-tools changes

Use this skill to prove that a change is ready, not merely to make it look correct.

## 1. Establish the scope

- Read `AGENTS.md`.
- Inspect `git status --short` and the relevant diff.
- Identify which files and behaviors changed.
- Check for accidental generated files, debug code, secrets, unrelated edits, or dependency/lockfile changes.
- Do not modify unrelated user changes.

## 2. Run the canonical verification

For ordinary code changes run:

```sh
npm run verify
```

For browser-visible changes (rendering, routing, styling, layout, focus, accessibility, interaction or print output), load `web-verify` and run its canonical `npm run verify:web` gate instead. It already includes core verification; do not run duplicate full gates without a reason.

Follow `docs/testing.md` and `tests/AGENTS.md`. Do not weaken checks to obtain a pass. If a gate fails, reproduce the smallest relevant failure, fix the cause and rerun the full required gate.

## 3. Confirm coverage and scope

- Add or update tests for behavioral changes and bug fixes when practical; prefer a regression test that fails without the fix.
- Consider affected empty, invalid-input, error, persisted, unsaved and narrow-viewport states.
- If a browser test is impractical, report the gap explicitly.

## 4. Independent acceptance testing when useful

For behavior-heavy features, bug fixes and UI changes, the coordinating agent should use the `tester` subagent after developer verification and before final review, following `docs/testing.md#independent-tester-agent`. Skip this extra role for documentation-only or trivial non-behavioral changes. Subagents that cannot delegate return the handoff to the coordinator instead.

Include acceptance criteria, the exact revision/worktree, relevant scenarios, commands/results and known gaps. Reuse credible evidence for unchanged code instead of blindly repeating full suites. The tester checks behavior and reports findings without edits; the developer owns fixes, regression tests and rerunning the canonical gate. A reviewer still independently reviews the code.

## 5. Inspect the final diff

After fixes and validation:

```sh
git status --short
git diff
```

Also inspect staged changes if anything is staged.

Confirm:

- only intended files changed;
- no credentials, tokens, private data, machine paths or debug artifacts are present;
- documentation and project context are still accurate;
- no unexplained lockfile or dependency changes exist.

## 6. Report evidence

Summarize:

- what was verified;
- every validation command actually run and its result;
- any targeted browser checks performed;
- tests added or changed;
- anything that could not be verified and why.

Never report an unrun command as passing. If a required check fails or cannot be run, describe the work as incomplete or partially verified rather than done.
