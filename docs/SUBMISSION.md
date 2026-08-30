# Submission package

## Links

- Live app: https://furnish-agent-room-planner.davidglasser2.chatgpt.site
- Public source: https://github.com/GlasDav/Furnish
- Demo video: add the public YouTube URL before submission

## Devpost description

### Why this fits WebMCP

Room planning is a shared spatial task. The user contributes taste and immovable choices; the agent reads structured room state, checks constraints, and proposes a complete layout. WebMCP lets both act on one visible workspace instead of passing screenshots and coordinates through chat.

### How it improves the experience

The agent can read exact dimensions and openings, validate a complete candidate, and commit a visible Variant. The user can then move and lock the sofa directly. The agent replans the remaining furniture around that decision without silently overriding it.

### What is newly possible

Furnish combines human direct manipulation with atomic agent actions, immutable comparison points, revision checks, spatial validation, and export. The shared page makes agency and provenance visible: human and agent actions appear in one activity trail and affect the same Planner State.

### How WebMCP is implemented

The top-level React registrar calls `document.modelContext.registerTool(...)` for five structured tools. Manual controls and tools call one TypeScript Planner Service. Writes require the current revision and pass the same validation and Locked Item rules before state changes.

## Submission checklist

### Ready

- [x] Public live URL opens without an account or credentials.
- [x] Six-step judge flow completes in under three minutes.
- [x] Public repository contains source, run instructions, architecture, WebMCP details, prompts, licence, and notices.
- [x] WebMCP implementation is visible in `site/components/web-mcp-registrar.tsx`.
- [x] Focused tests, lint, and production build pass.
- [x] English testing instructions identify the expected result.

### Before the deadline

- [ ] Record a narrated video at about 2:45–2:50; keep it strictly under three minutes.
- [ ] Upload the video publicly to YouTube and add its URL above.
- [ ] Create the Devpost entry with the live app, public repository, video, and four description sections.
- [ ] Confirm entrant and team details satisfy the official rules.
- [ ] Submit before 3 September 2026 at 1:00 pm PDT / 4 September at 6:00 am AEST.

### After submission

- [ ] Keep the app free and publicly accessible through 21 September 2026 at 5:00 pm PT.
- [ ] Freeze the submitted repository, deployment, and Devpost entry during judging; continue later work in a separate fork if needed.
