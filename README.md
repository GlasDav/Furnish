# Furnish

Furnish is a shared human-agent room planner built for the WebMCP Challenge.

- [Live Site](https://furnish-agent-room-planner.davidglasser2.chatgpt.site)
- [Judge guide and prompts](docs/JUDGE_GUIDE.md)
- [Architecture and WebMCP](docs/ARCHITECTURE.md)
- [Submission package](docs/SUBMISSION.md)

The Prepared Room is a 6.0 × 4.5 metre living room. ChatGPT creates a Conversation Variant; the user moves and locks the sofa; ChatGPT replans a Media Variant without changing that Locked Item. Both Variants remain available for comparison and SVG export.

## Three-minute flow

1. Create the Conversation Variant.
2. Move the sofa to the west wall.
3. Lock the sofa.
4. Create the Media Variant around the Locked Item.
5. Compare the preserved Variants.
6. Export the chosen Working Layout as SVG.

The page also exposes buttons for the same flow, so it remains usable when WebMCP tools are unavailable.

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```powershell
cd site
npm ci
npm test
npm run lint
npm run build
npm run dev
```

Open the local URL printed by the development server. No account, API key, database, or environment file is required.

## What is included

- A revisioned Planner State shared by the page and five WebMCP tools.
- Atomic validation for containment, overlap, openings, circulation, and Locked Items.
- Two deterministic layouts using 16 Layout-Verified catalogue items.
- A browsable 140-model catalogue derived from Kenney's CC0 Furniture Kit.
- Five focused tests covering the judge flow and hard geometry/state failures.

## Licence and notices

Furnish source code is available under the [MIT Licence](LICENSE). Third-party attribution is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
