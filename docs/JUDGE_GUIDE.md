# Judge guide and prompts

The public Site needs no account, credentials, or setup. A fresh manual run was completed on 30 August 2026 in 47.9 seconds.

## Fastest assessment

Open the [live Site](https://furnish-agent-room-planner.davidglasser2.chatgpt.site) and follow the highlighted action in the right inspector:

1. Select **Create Conversation Variant**.
2. Select **Move sofa west**.
3. Select **Lock sofa**.
4. Select **Create Media Variant**.
5. Select **Compare Variants**, inspect both preserved layouts, then close the comparison.
6. Select **Export SVG**.

Expected result: the revision advances from 1 to 5; both layouts are valid; the Media Variant keeps the west-wall sofa locked; the comparison shows two Variants; export confirms `Media Variant exported as SVG`.

Use **Reset** before another run.

## WebMCP prompts

These prompts exercise the same workflow through the page tools.

### 1. Furnish for conversation

> Read the Furnish Planner State. Create a complete valid conversation layout using only Layout-Verified Items, validate it, and save it as “Conversation Variant”.

### 2. Preserve the user's decision

Move the sofa west and lock it with the page controls, then prompt:

> Read the latest Furnish Planner State. Create a valid media layout without moving, rotating, removing, or unlocking any Locked Item. Validate it and save it as “Media Variant”.

### 3. Export

> Read the latest Furnish Planner State and export the current Working Layout as SVG.

The agent should read again before every write and use the current revision. `STALE_REVISION`, `LOCKED_ITEM_CHANGED`, and geometry violations are expected guardrails, not retryable mutations.
