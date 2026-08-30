# Sites and WebMCP delivery path

**Checked:** 30 August 2026  
**Decision:** Build the MVP as a client-heavy ChatGPT Site, register imperative WebMCP tools from the top-level document, and verify them in the latest ChatGPT desktop app's built-in browser using GPT-5.6 Sol or Terra.

## Exact constraints

### ChatGPT Sites hosting

- Sites is a public beta. It can turn a compatible local project into a hosted app, but plan limits can block creation, storage additions, or continued public access for a high-usage Site. Every deployed Sites URL is production; saving a version and deploying it are separate steps. [OpenAI Sites documentation](https://learn.chatgpt.com/docs/sites#understand-projects-versions-and-deployments)
- A new Site is owner/admin-only. A competition link must be changed to **Anyone on the internet**, which is available only when public publishing is enabled for the account/workspace. A public Site can be opened without ChatGPT workspace access. [OpenAI Sites access documentation](https://learn.chatgpt.com/docs/sites#control-access-and-secrets)
- Sites hosting is managed from ChatGPT web or desktop, not a standalone Codex CLI or IDE management view. Codex CLI can still edit and test the local project. [OpenAI Sites documentation](https://learn.chatgpt.com/docs/sites)
- The supported runtime accepts HTTP, HTTPS, and WebSockets, but not raw inbound or outbound TCP. Some frameworks, private networks, databases, background services, and hosting patterns are unsupported. [OpenAI Sites limits](https://learn.chatgpt.com/docs/sites#understand-limits-and-unsupported-uses)
- `.openai/hosting.json` is the local-to-hosted project link and storage-binding manifest. It may start without `project_id`; Sites adds the ID after provisioning. Do not put secrets there. [OpenAI Sites project documentation](https://learn.chatgpt.com/docs/sites#understand-projects-versions-and-deployments)
- This MVP needs no hosted database, authentication, or server-side model API. Keep room state, variants, and sample data client-side for the shortest path. D1, R2, and auth are unnecessary unless scope changes to cross-device persistence, durable uploads, or identity.

### Current local Sites toolchain

The installed Sites plugin is `0.1.46`. Its pinned initializer is [`@openai/create-sites@0.3.0`](https://www.npmjs.com/package/@openai/create-sites/v/0.3.0), which was also the current npm release when checked.

Read-only inspection of `--help`, `--list-add-ons --json`, and the published package showed:

- Node `>=22.13.0`.
- A Vinext/React/Vite/Cloudflare Workers-compatible ESM starter using `@openai/sites-vite-plugin`.
- Optional add-ons: `d1`, `r2`, `auth`, and `shadcn`; the installed Sites build workflow requires `shadcn` for a new Site.
- Build output is produced by `vinext build`; Sites owns deployment and real D1/R2 provisioning.

For this project, scaffold with `shadcn` only. Avoid trying to host the proposed SvelteKit/OpenPlan3D baseline unchanged: first prove it can emit the Sites-compatible worker artifacts, or use the supported Vinext starter and port only the demo-critical planner behavior.

### WebMCP registration and availability

- ChatGPT Site tools are available in the **built-in browser in the ChatGPT desktop app** to ChatGPT Work and Codex. Use the latest desktop app and GPT-5.6 Sol or GPT-5.6 Terra. GPT-5.6 Luna has WebMCP disabled. Site tools are unavailable in Enterprise and Edu workspaces, and availability still depends on rollout. [OpenAI Site tools documentation](https://learn.chatgpt.com/docs/webmcp)
- ChatGPT currently discovers only imperative JavaScript tools registered in the **top-level page**. It does not discover declarative form tools or tools registered in any iframe, including same-origin iframes. [OpenAI Site tools limitations](https://learn.chatgpt.com/docs/webmcp#limitations)
- Use the current producer API: feature-detect `document.modelContext?.registerTool`, then call `await document.modelContext.registerTool(...)`. Do not use the older `navigator.modelContext` or removed `provideContext()` pattern. The current draft places `modelContext` on `Document`. [WebMCP draft API](https://webmachinelearning.github.io/webmcp/#api)
- Registration requires a secure, fully active, origin-keyed document allowed by the `tools` Permissions Policy. Tool names must be unique in that document, 1-128 characters, and use only ASCII letters/digits, `_`, `-`, or `.`; names and descriptions cannot be empty, and input schemas must serialize. [WebMCP `registerTool` algorithm](https://webmachinelearning.github.io/webmcp/#dom-modelcontext-registertool)
- In React/Vinext, registration must run in browser code after hydration, not during server rendering. Put one client-side registrar at the app shell/page level. Use one `AbortController` per mounted registration set and abort it on unmount so hot reloads or remounts do not leave duplicate names. Abort-signal unregistration is part of the current imperative API. [Chrome imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api#unregister-tools)
- Tool handlers must call the same room-planning service as manual UI actions. Keep inputs narrow, state side effects clearly, validate authorization and inputs, and return enough state to verify the result. Preserve the normal UI when WebMCP is absent. [OpenAI implementation guidance](https://learn.chatgpt.com/docs/webmcp#add-webmcp-to-your-website)
- Browser-agent tool discovery is page-scoped: closing or navigating away can make tools unavailable. The agent can inspect the page after a call, so a write tool must synchronously commit the shared store mutation before resolving and should return the new revision and changed IDs. [OpenAI browser behavior](https://learn.chatgpt.com/docs/webmcp#how-it-works-in-the-browser)

## Recommended registration shape

Use a single top-level client registrar and stable service methods. The important lifecycle is illustrated below; the actual tool definitions can be generated from the P0 registry.

```ts
"use client";

import { useEffect } from "react";
import { roomPlanningService } from "@/lib/planning/roomPlanningService";

export function WebMcpRegistrar() {
  useEffect(() => {
    if (typeof document.modelContext?.registerTool !== "function") return;

    const controller = new AbortController();

    void document.modelContext.registerTool(
      {
        name: "get_room_state",
        description: "Read the current room, placements, locks, constraints, variant, validation, and revision. Does not modify the layout.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: async () => roomPlanningService.getAgentState(),
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, []);

  return null;
}
```

Production code should catch and surface registration failures in the connection-status indicator. Keep the registrar mounted for the whole workspace route.

## Shortest reliable verification path

Do this before implementing the full P0 tool list:

1. Implement and deploy one real read tool, `get_room_state`, plus one real write tool that uses the shared service, preferably `place_furniture_batch` limited to one known sample item for the smoke test.
2. Make the write visibly update four things before it resolves: the canvas, revision, activity message, and validation summary. Return `{status, revision, changedObjectIds, validation}`.
3. Open the exact deployed URL in the latest ChatGPT desktop app's built-in browser. Use GPT-5.6 Sol or Terra and confirm **Settings > Browser > Permissions > Enable site tools** is on. [OpenAI availability and controls](https://learn.chatgpt.com/docs/webmcp#security-and-user-controls)
4. Select **Site tools** in the address bar, then **Available site tools**. Confirm both tool names and their read/write classification. This is the deterministic discovery check; do not rely only on whether the model happens to choose a tool. [OpenAI discovery UI](https://learn.chatgpt.com/docs/webmcp#how-it-works-in-the-browser)
5. Ask: “Use `get_room_state`, then place the sample armchair at the supplied test position, then read the room state again.” Approve any browser safety check.
6. Confirm the object appears on the canvas, the activity message appears, the revision increases once, validation updates, and the second read returns the new object and revision.
7. Open **Site tools > Recently used > Sources** and confirm the read/write/read call sequence and results. Reload once and repeat discovery to catch hydration or duplicate-registration bugs. [OpenAI recent activity UI](https://learn.chatgpt.com/docs/webmcp#how-it-works-in-the-browser)

Only after this two-tool vertical slice passes should the team expand to all P0 tools. Chrome 149+ with the WebMCP origin trial/testing flag and the Model Context Tool Inspector can help inspect schemas locally, but it is a secondary developer check, not proof that ChatGPT's supported subset works. [Chrome WebMCP developer guide](https://developer.chrome.com/docs/ai/webmcp)

## Build-blocking caveats

There is no architecture blocker for the client-only MVP. The live demonstration is blocked, however, if the tester uses GPT-5.6 Luna, an Enterprise/Edu workspace, an account without the WebMCP rollout, or a desktop app with Site tools disabled. A public competition URL is also blocked if the owner's account/workspace cannot enable **Anyone on the internet**. Prove those account-level conditions with the two-tool deployed smoke test before spending time on the full planner.
