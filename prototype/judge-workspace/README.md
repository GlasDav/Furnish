# Judge workspace prototype

Throwaway UI prototype for issue 6. Three structural variants share the same
in-memory judge-demo state and are switchable with `?variant=A`, `B`, or `C`.

Run from the repository root:

```powershell
python -m http.server 4173 --directory prototype/judge-workspace
```

Open `http://localhost:4173/?variant=A`.

Suggested sequence: Ask agent → move sofa → lock sofa → replan → compare →
export. Clicking a placed sofa selects it; dragging it also advances the manual
move step.
