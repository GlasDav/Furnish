# Competition visual language prototype

Throwaway UI prototype for “Define the competition visual language and motion”.
All three directions use the approved A — Studio structure and the same
in-memory judge-demo state:

- `A` — Drafting Table: warm, editorial and tactile.
- `B` — Blueprint Signal: technical, precise and overtly agentic.
- `C` — Quiet Gallery: high-contrast, minimal and object-led.

Run from the repository root:

```powershell
python -m http.server 4189 --bind 127.0.0.1 --directory prototype/judge-workspace
```

Open `http://127.0.0.1:4189/?variant=A`.

Use the floating bar or Left/Right keys to switch direction. The Motion control
forces reduced motion; the page also honours `prefers-reduced-motion`.

Suggested sequence: agent furnishing → preview blocked state → clear it → move
sofa → preview warning → lock sofa → agent replan → compare → export. Clicking
the sofa shows its dimensions and lock state.
