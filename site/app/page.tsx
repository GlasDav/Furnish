'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  Archive,
  Boxes,
  Check,
  Download,
  GalleryVerticalEnd,
  Lock,
  Move,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  Unlock,
} from 'lucide-react';

import { RoomCanvas } from '@/components/room-canvas';
import { WebMcpRegistrar } from '@/components/web-mcp-registrar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  CATALOGUE,
  CATALOGUE_SOURCE,
  plannerService,
  type Opening,
  type PlannerResult,
  type Room,
  type Variant,
} from '@/lib/planner';

type FlowStep = 'furnish' | 'move' | 'lock' | 'replan' | 'compare' | 'export';
type Notice = { tone: 'success' | 'error' | 'info'; text: string } | null;

const flowLabels = ['Furnish', 'Move', 'Lock', 'Replan', 'Compare', 'Export'];

function deriveFlowStep(variants: Variant[], sofa: { xMm: number; yMm: number; locked: boolean } | undefined, hasCompared: boolean): FlowStep {
  if (!variants.length) return 'furnish';
  if (variants.length === 1 && sofa && (sofa.xMm !== 750 || sofa.yMm !== 2250)) return 'move';
  if (variants.length === 1 && sofa && !sofa.locked) return 'lock';
  if (variants.length === 1) return 'replan';
  if (!hasCompared) return 'compare';
  return 'export';
}

function stepCopy(step: FlowStep) {
  return {
    furnish: { turn: 'Agent turn', title: 'Furnish for conversation', button: 'Create Conversation Variant' },
    move: { turn: 'Your turn', title: 'Move the sofa to the west wall', button: 'Move sofa west' },
    lock: { turn: 'Your turn', title: 'Lock the sofa in place', button: 'Lock sofa' },
    replan: { turn: 'Agent turn', title: 'Replan around the Locked Item', button: 'Create Media Variant' },
    compare: { turn: 'Your turn', title: 'Compare preserved Variants', button: 'Compare Variants' },
    export: { turn: 'Your turn', title: 'Export the chosen layout', button: 'Export SVG' },
  }[step];
}

function RoomEditor({
  open,
  room,
  revision,
  onOpenChange,
  onNotice,
}: {
  open: boolean;
  room: Room;
  revision: number;
  onOpenChange: (open: boolean) => void;
  onNotice: (notice: Notice) => void;
}) {
  const [draft, setDraft] = useState<Room>(() => structuredClone(room));

  const syncOpen = (nextOpen: boolean) => {
    if (nextOpen) setDraft(structuredClone(room));
    onOpenChange(nextOpen);
  };

  const updateOpening = (openingId: string, patch: Partial<Opening>) => {
    setDraft((current) => ({
      ...current,
      openings: current.openings.map((opening) => opening.openingId === openingId ? { ...opening, ...patch } : opening),
    }));
  };

  const save = () => {
    const result = plannerService.configureRoom(revision, draft);
    if (!result.ok) {
      onNotice({ tone: 'error', text: result.error.message });
      return;
    }
    onNotice({ tone: 'success', text: 'Room dimensions and openings updated.' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={syncOpen}>
      <DialogContent className="room-dialog">
        <DialogHeader>
          <DialogTitle>Edit the Room</DialogTitle>
          <DialogDescription>Use millimetres. The Working Layout must remain valid.</DialogDescription>
        </DialogHeader>
        <div className="dimension-fields">
          <label htmlFor="room-width"><span>Width</span><Input id="room-width" type="number" min={2500} max={12000} step={100} value={draft.widthMm} onChange={(event) => setDraft({ ...draft, widthMm: Number(event.target.value) })} /></label>
          <label htmlFor="room-depth"><span>Depth</span><Input id="room-depth" type="number" min={2500} max={12000} step={100} value={draft.depthMm} onChange={(event) => setDraft({ ...draft, depthMm: Number(event.target.value) })} /></label>
        </div>
        <section className="openings-editor">
          <header><div><span className="eyebrow">Openings</span><strong>Wall, type and offset</strong></div><Button variant="outline" size="sm" onClick={() => setDraft((current) => ({ ...current, openings: [...current.openings, { openingId: `window-${current.openings.length + 1}`, type: 'window', wall: 'north', startMm: 200, endMm: 1000 }] }))}>Add window</Button></header>
          {draft.openings.map((opening) => {
            const protectedOpening = opening.openingId === draft.entranceOpeningId || opening.openingId === draft.balconyOpeningId;
            return (
              <article className="opening-row" key={opening.openingId}>
                <strong>{opening.openingId}</strong>
                <NativeSelect value={opening.type} onChange={(event) => updateOpening(opening.openingId, { type: event.target.value as Opening['type'] })}>
                  <NativeSelectOption value="door">Door</NativeSelectOption>
                  <NativeSelectOption value="slider">Slider</NativeSelectOption>
                  <NativeSelectOption value="window">Window</NativeSelectOption>
                </NativeSelect>
                <NativeSelect value={opening.wall} onChange={(event) => updateOpening(opening.openingId, { wall: event.target.value as Opening['wall'] })}>
                  <NativeSelectOption value="north">North</NativeSelectOption>
                  <NativeSelectOption value="east">East</NativeSelectOption>
                  <NativeSelectOption value="south">South</NativeSelectOption>
                  <NativeSelectOption value="west">West</NativeSelectOption>
                </NativeSelect>
                <Input aria-label={`${opening.openingId} start offset`} type="number" value={opening.startMm} onChange={(event) => updateOpening(opening.openingId, { startMm: Number(event.target.value) })} />
                <Input aria-label={`${opening.openingId} end offset`} type="number" value={opening.endMm} onChange={(event) => updateOpening(opening.openingId, { endMm: Number(event.target.value) })} />
                <Button variant="ghost" size="sm" disabled={protectedOpening} onClick={() => setDraft((current) => ({ ...current, openings: current.openings.filter((entry) => entry.openingId !== opening.openingId) }))}>Remove</Button>
              </article>
            );
          })}
        </section>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save Room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CatalogueDialog({
  open,
  revision,
  onOpenChange,
  onNotice,
}: {
  open: boolean;
  revision: number;
  onOpenChange: (open: boolean) => void;
  onNotice: (notice: Notice) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? CATALOGUE.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalized)) : CATALOGUE;
  }, [query]);

  const add = (catalogueItemId: string) => {
    const result = plannerService.addCatalogueItem(revision, catalogueItemId);
    onNotice(result.ok
      ? { tone: 'success', text: 'Item added to the centre of the Room.' }
      : { tone: 'error', text: result.error.message });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="catalogue-dialog">
        <DialogHeader>
          <DialogTitle>Furniture Catalogue</DialogTitle>
          <DialogDescription>
            All {CATALOGUE_SOURCE.fileCount} models from the <a href={CATALOGUE_SOURCE.url} target="_blank" rel="noreferrer">Kenney Furniture Kit</a>, under <a href={CATALOGUE_SOURCE.licenseUrl} target="_blank" rel="noreferrer">CC0</a>. Agent layouts use the 16 verified items. <a href="/catalogue-manifest" target="_blank" rel="noreferrer">Source manifest</a>.
          </DialogDescription>
        </DialogHeader>
        <label className="catalogue-search" htmlFor="catalogue-search"><Search aria-hidden="true" /><Input id="catalogue-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search all furniture" /></label>
        <div className="catalogue-grid">
          {filtered.map((item) => (
            <article key={item.catalogueItemId}>
              <div className={`catalogue-symbol category-${item.category.toLowerCase()}`}><Archive aria-hidden="true" /></div>
              <div><strong>{item.name}</strong><span>{item.category}</span></div>
              <p>{item.layoutVerified ? `${(item.widthMm / 1000).toFixed(2)} × ${(item.depthMm / 1000).toFixed(2)} m` : 'Manual only · provisional footprint'}</p>
              <Button variant={item.layoutVerified ? 'default' : 'outline'} size="sm" onClick={() => add(item.catalogueItemId)}>Add</Button>
              {item.layoutVerified && <em>Layout-Verified</em>}
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VariantsDialog({
  open,
  variants,
  room,
  revision,
  onOpenChange,
  onCompared,
  onNotice,
}: {
  open: boolean;
  variants: Variant[];
  room: Room;
  revision: number;
  onOpenChange: (open: boolean) => void;
  onCompared: () => void;
  onNotice: (notice: Notice) => void;
}) {
  const load = (variantId: string) => {
    const result = plannerService.loadVariant(revision, variantId);
    onNotice(result.ok ? { tone: 'success', text: `${result.variant.name} loaded into the Working Layout.` } : { tone: 'error', text: result.error.message });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { onOpenChange(nextOpen); if (nextOpen && variants.length > 1) onCompared(); }}>
      <DialogContent className="variants-dialog">
        <DialogHeader>
          <DialogTitle>Compare preserved Variants</DialogTitle>
          <DialogDescription>Comparison is read-only. Loading copies a Variant into the mutable Working Layout.</DialogDescription>
        </DialogHeader>
        {variants.length ? (
          <div className="variant-grid">
            {variants.map((variant, index) => (
              <article key={variant.variantId} className={index === variants.length - 1 ? 'current' : ''}>
                <RoomCanvas room={room} items={variant.items} compact label={variant.name} />
                <header><div><strong>{variant.name}</strong><span>{variant.intent === 'conversation' ? 'Face-to-face seating' : 'Media-facing with Locked Item'}</span></div>{index === variants.length - 1 && <em>Current</em>}</header>
                <Button variant="outline" size="sm" onClick={() => load(variant.variantId)}>Load Variant</Button>
              </article>
            ))}
          </div>
        ) : <p className="empty-dialog">No Variants yet. Ask ChatGPT to furnish the Prepared Room first.</p>}
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const snapshot = useSyncExternalStore(plannerService.subscribe, plannerService.getSnapshot, plannerService.getServerSnapshot);
  const { state, validation, activity, canUndo, webMcpStatus } = snapshot;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const selectedItem = state.workingLayout.items.find((item) => item.itemId === selectedItemId);
  const selectedDefinition = selectedItem ? CATALOGUE.find((item) => item.catalogueItemId === selectedItem.catalogueItemId) : undefined;
  const sofa = state.workingLayout.items.find((item) => item.itemId === 'sofa-1');
  const step = deriveFlowStep(state.variants, sofa, hasCompared);
  const copy = stepCopy(step);
  const completedSteps = flowLabels.findIndex((label) => label.toLowerCase() === step);
  const currentVariant = state.variants.at(-1)?.name;

  const showResult = (result: PlannerResult<Record<string, unknown>>, successText: string) => {
    setNotice(result.ok ? { tone: 'success', text: successText } : { tone: 'error', text: result.error.message });
    window.setTimeout(() => setNotice(null), 3600);
  };

  const exportLayout = () => {
    const result = plannerService.exportWorkingLayout(state.revision);
    if (!result.ok) {
      showResult(result, '');
      return;
    }
    const url = URL.createObjectURL(new Blob([result.svg], { type: result.mimeType }));
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ tone: 'success', text: `${currentVariant ?? 'Working Layout'} exported as SVG.` });
  };

  const removeSelectedItem = () => {
    if (!selectedItem) return;
    const result = plannerService.removeItem(state.revision, selectedItem.itemId);
    showResult(result, 'Item removed from the Working Layout.');
    if (result.ok) setSelectedItemId(null);
  };

  const runPrimaryAction = () => {
    if (step === 'furnish') return showResult(plannerService.commitPreparedVariant('conversation'), 'Conversation Variant created.');
    if (step === 'move') return showResult(plannerService.moveSofaToMediaPose(state.revision), 'Sofa moved; two unlocked conflicting items were cleared.');
    if (step === 'lock') return showResult(plannerService.setItemLock(state.revision, 'sofa-1', true), 'Sofa locked in place.');
    if (step === 'replan') return showResult(plannerService.commitPreparedVariant('media'), 'Media Variant created around the Locked Item.');
    if (step === 'compare') {
      setVariantsOpen(true);
      setHasCompared(true);
      return;
    }
    exportLayout();
  };

  const connectionCopy = {
    checking: 'Checking Site tools',
    ready: 'Site tools active',
    manual: 'Manual mode',
    error: 'Site tools unavailable',
  }[webMcpStatus];

  return (
    <main className="planner-shell">
      <WebMcpRegistrar />
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="Furnish home"><span aria-hidden="true">F</span>Furnish</a>
        <div className="project-name"><strong>Prepared living room</strong><span>Shared planner · revision {state.revision}</span></div>
        <div className="topbar-actions">
          <span className={`connection-status status-${webMcpStatus}`}><i /> {connectionCopy}</span>
          <Button variant="outline" size="sm" disabled={!canUndo} onClick={() => showResult(plannerService.undo(state.revision), 'Last change undone.')}><Undo2 /> Undo</Button>
          <Button variant="outline" size="sm" onClick={() => { showResult(plannerService.resetDemo(state.revision), 'Prepared Room reset.'); setHasCompared(false); setSelectedItemId(null); }}><RotateCcw /> Reset</Button>
        </div>
      </header>

      <section id="workspace" className="studio-grid">
        <nav className="tool-shelf" aria-label="Planner tools">
          <button className="active" type="button" onClick={() => setRoomOpen(true)}><Move /><span>Room</span></button>
          <button type="button" onClick={() => setCatalogueOpen(true)}><Boxes /><span>Catalogue</span><em>140</em></button>
          <button type="button" onClick={() => setVariantsOpen(true)}><GalleryVerticalEnd /><span>Variants</span><em>{state.variants.length}</em></button>
        </nav>

        <section className="canvas-card" aria-labelledby="room-title">
          <header className="canvas-heading">
            <div><span className="eyebrow">Prepared Room</span><h1 id="room-title">{currentVariant ?? `${(state.room.widthMm / 1000).toFixed(1)} × ${(state.room.depthMm / 1000).toFixed(1)} m`}</h1></div>
            <span className={`validity ${state.workingLayout.items.length ? (validation.valid ? 'valid' : 'blocked') : 'ready'}`}>{state.workingLayout.items.length ? (validation.valid ? '✓ Valid Layout' : '× Blocked') : 'Ready'}</span>
          </header>
          <div className="room-wrap"><RoomCanvas room={state.room} items={state.workingLayout.items} selectedItemId={selectedItemId} onSelect={setSelectedItemId} /></div>
          <footer className="canvas-legend"><span><i className="opening-key" /> Openings</span><span><i className="route-key" /> 900 mm Circulation Route</span><span>{selectedItem ? 'Selected item shown in the inspector' : 'Select furniture to inspect it'}</span></footer>
        </section>

        <aside className="inspector" aria-label="Planner inspector">
          <section className="next-card">
            <span className={`turn-label ${copy.turn === 'Agent turn' ? 'agent' : 'human'}`}>{copy.turn}</span>
            <span className="eyebrow">Next action</span>
            <h2>{copy.title}</h2>
            <div className="flow-progress" aria-label="Judge workflow progress">
              {flowLabels.map((label, index) => <span key={label} className={index < completedSteps ? 'done' : index === completedSteps ? 'current' : ''} title={label}>{index < completedSteps ? <Check /> : index + 1}</span>)}
            </div>
            <Button className="primary-action" size="lg" onClick={runPrimaryAction}>
              {step === 'furnish' || step === 'replan' ? <Sparkles /> : step === 'move' ? <Move /> : step === 'lock' ? <Lock /> : step === 'compare' ? <GalleryVerticalEnd /> : <Download />}
              {copy.button}
            </Button>
          </section>

          <section className={`validation-card ${state.workingLayout.items.length ? (validation.valid ? 'valid' : 'blocked') : 'ready'}`}>
            <span className="validation-mark">{state.workingLayout.items.length ? (validation.valid ? '✓' : '!') : '·'}</span>
            <div><span className="eyebrow">Validation</span><strong>{state.workingLayout.items.length ? (validation.valid ? 'Valid Layout' : validation.violations[0]?.code) : 'Room readable'}</strong><p>{state.workingLayout.items.length ? (validation.valid ? 'Bounds, openings, circulation and locks pass.' : validation.violations[0]?.message) : 'Bounds and openings are available to ChatGPT.'}</p></div>
          </section>

          <section className="selection-card">
            <span className="eyebrow">Selection</span>
            {selectedItem && selectedDefinition ? (
              <><h3>{selectedDefinition.name}{selectedItem.locked && <em>Locked</em>}</h3><dl><div><dt>Size</dt><dd>{(selectedDefinition.widthMm / 1000).toFixed(1)} × {(selectedDefinition.depthMm / 1000).toFixed(1)} m</dd></div><div><dt>Position</dt><dd>{selectedItem.xMm}, {selectedItem.yMm} mm</dd></div><div><dt>Rotation</dt><dd>{selectedItem.rotationDeg}°</dd></div></dl><div className="selection-actions"><Button variant="outline" size="sm" onClick={() => showResult(plannerService.setItemLock(state.revision, selectedItem.itemId, !selectedItem.locked), selectedItem.locked ? 'Item unlocked.' : 'Item locked.')}>
                {selectedItem.locked ? <Unlock /> : <Lock />}{selectedItem.locked ? 'Unlock' : 'Lock'}
              </Button><Button variant="destructive" size="sm" disabled={selectedItem.locked} title={selectedItem.locked ? 'Unlock this item before removing it.' : 'Remove this item from the Working Layout'} onClick={removeSelectedItem}><Trash2 />Remove</Button></div></>
            ) : <p>Select an item to see its dimensions, position and lock state.</p>}
          </section>

          <section className="activity-card">
            <header><span className="eyebrow">Shared activity</span><span>Live</span></header>
            <ul>{activity.slice(0, 4).map((entry, index) => <li className={index === 0 ? 'latest' : ''} key={`${entry.revision}-${entry.action}`}><b className={`actor-${entry.actor}`}>{entry.actor === 'agent' ? 'AG' : entry.actor === 'human' ? 'YOU' : 'SYS'}</b><span>{entry.action}</span><time>{index === 0 ? 'now' : `${index}m`}</time></li>)}</ul>
          </section>
        </aside>
      </section>

      {notice && <output className={`notice notice-${notice.tone}`} aria-live="polite">{notice.tone === 'success' && <Check />}{notice.text}</output>}
      <RoomEditor open={roomOpen} room={state.room} revision={state.revision} onOpenChange={setRoomOpen} onNotice={setNotice} />
      <CatalogueDialog open={catalogueOpen} revision={state.revision} onOpenChange={setCatalogueOpen} onNotice={setNotice} />
      <VariantsDialog open={variantsOpen} variants={state.variants} room={state.room} revision={state.revision} onOpenChange={setVariantsOpen} onCompared={() => setHasCompared(true)} onNotice={setNotice} />
    </main>
  );
}
