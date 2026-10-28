# ADR-001: Repository-local agent knowledge

**Status:** Accepted

## Context

Agent guidance needs to survive sessions and stay useful while the repository grows. A single large `AGENTS.md` or memory file easily becomes a second, stale source of truth and increases prompt load for every task.

## Decision

Treat versioned repository documentation as the source of truth for durable project knowledge.

- `AGENTS.md` is a concise entry point and set of non-negotiable working rules.
- Hierarchical `AGENTS.md` files provide local instructions close to relevant code.
- Topic documents hold current architecture, design, and testing knowledge.
- Decision records preserve important rationale.
- Complex long-running work may use versioned execution plans.
- `MEMORY.md` remains only as a small continuity pointer.
- Git history preserves superseded implementation detail and incident history.

## Consequences

Agents load detail progressively instead of receiving all project history by default. When a durable rule changes, update its authoritative document rather than copying it into multiple memory files.
