# Architecture and WebMCP

Furnish is a client-heavy React/Vinext app hosted on ChatGPT Sites. It has no server database, account system, or external API.

## Module map

- `site/lib/planner.ts` owns the domain types, catalogue, prepared layouts, validation, Planner State, undo history, and SVG export.
- `site/components/web-mcp-registrar.tsx` registers the five WebMCP tools once at the top-level page.
- `site/app/page.tsx` renders the workspace and sends manual actions through the same Planner Service.
- `site/components/room-canvas.tsx` renders the current Room and Working Layout as SVG.
- `site/tests/planner.test.ts` checks the judge flow, geometry, revisions, locks, and undo.

## Shared state

The Planner State contains one Room, one mutable Working Layout, immutable Variants, and a monotonic revision. Every successful change creates a complete undo snapshot and increments the revision.

All writes require `expectedRevision`. A stale caller receives `STALE_REVISION`. Candidate layouts are committed only after one atomic validation pass covering:

- known Layout-Verified Items;
- supported rotations and unique item identities;
- preservation of Locked Items;
- room containment and solid-item separation;
- opening and door-swing clearance; and
- a 900 mm Circulation Route.

Failed writes do not change Planner State.

## WebMCP

`WebMcpRegistrar` reads `document.modelContext` in a client effect and registers:

| Tool | Effect |
| --- | --- |
| `read_planner_state` | Reads the Room, Working Layout, Variants, verified catalogue, validation, and revision. |
| `validate_candidate_layout` | Checks a complete candidate without changing state. |
| `commit_variant` | Validates, replaces the Working Layout, and preserves a named Variant. |
| `undo_last_change` | Restores the previous complete state at a higher revision. |
| `export_working_layout` | Returns the current layout as SVG without changing state. |

Tool schemas reject extra fields. Read-only tools are annotated with `readOnlyHint`. Each tool calls the same Planner Service used by the manual interface, so agent and human changes are immediately visible on the same page.

If `document.modelContext.registerTool` is unavailable, registration stops and the interface reports manual mode. The six-step button workflow remains available.
