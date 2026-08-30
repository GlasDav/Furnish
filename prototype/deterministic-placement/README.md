# Deterministic placement prototype

Run from the repository root:

```powershell
node prototype/deterministic-placement/cli.mjs
```

## Question

Can the competition demo use authored, intent-specific placement templates plus one atomic validator, instead of a general search solver, while still completing both prepared layouts, preserving the moved and Locked Item, rejecting overlap and out-of-bounds candidates, keeping the 900 mm entrance-to-balcony Circulation Route clear, and returning useful structured evidence?

This is a throwaway logic prototype for [Prove deterministic placement and validation](https://github.com/GlasDav/Furnish/issues/8). It is deliberately limited to the Prepared Room and the two agreed target Variants.

## Hypothesis

The smallest reliable approach is:

1. Keep one ordered placement template for each supported Layout Intent.
2. Overlay Locked Items from the current Working Layout without changing their identity or pose.
3. Validate the complete candidate atomically in a stable order.
4. For the Prepared Room, represent the agreed 900 mm L-shaped Circulation Route as two explicit clearance rectangles.
5. Return the candidate, placement trace, checks, and stable violations as structured data.

The planner never nudges or silently drops furniture. A template that conflicts with a Locked Item fails with evidence, leaving state unchanged.

## Controls

- `1`: complete the Conversation Variant.
- `2`: move and lock the sofa at the agreed pose, then complete the Media Variant.
- `o`: inject a solid-item overlap.
- `b`: move the plant out of bounds.
- `l`: change the Locked Item in a candidate.
- `r`: block the Circulation Route.
- `a`: show all acceptance probes.
- `q`: quit.

For a non-interactive evidence dump:

```powershell
node prototype/deterministic-placement/cli.mjs --acceptance
```

## Deliberate limits

- No free placement search, ranking optimiser, snapping, or general-room pathfinding.
- The templates only promise the prepared judging sequence.
- Revision gating and mutation are already fixed by the shared planner contract and are outside this geometry prototype.
- Rugs are non-solid: they must remain inside the Room but may overlap furniture and the Circulation Route.
- Touching footprint edges are allowed; positive-area intersections are not.
