# Furnish

Furnish is a shared human-agent room planner built for a three-minute ChatGPT Sites demonstration.

**Live Site:** [furnish-agent-room-planner.davidglasser2.chatgpt.site](https://furnish-agent-room-planner.davidglasser2.chatgpt.site)

The Prepared Room is a 6.0 × 4.5 metre living room. ChatGPT can create a Conversation Variant, the user can move and lock the sofa, and ChatGPT can then create a Media Variant without changing that Locked Item. Both Variants remain available for comparison and SVG export.

## Demo flow

1. Create the Conversation Variant.
2. Move the sofa to the west wall.
3. Lock the sofa.
4. Create the Media Variant around the Locked Item.
5. Compare the two preserved Variants.
6. Export the chosen Working Layout as SVG.

Manual controls and five WebMCP tools call the same revisioned Planner Service. Every write is stale-revision gated and atomically validated for room containment, solid-item overlap, opening clearance, the 900 mm Circulation Route, and Locked Items.

## Local development

```powershell
cd site
npm install
npm run dev
```

Focused checks:

```powershell
npm test
npm run build
```

## WebMCP tools

- `read_planner_state`
- `validate_candidate_layout`
- `commit_variant`
- `undo_last_change`
- `export_working_layout`

The planner remains fully usable when Site tools are unavailable.

## Catalogue provenance

The catalogue lists all 140 source models from the [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit), released under [Creative Commons CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Sixteen items have verified planner dimensions and footprints for deterministic agent layouts; the rest are available for manual browsing and placement with clearly marked provisional footprints.
