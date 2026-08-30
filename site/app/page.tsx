'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Boxes,
  Check,
  GalleryVerticalEnd,
  Lock,
  Move,
  MousePointer2,
  RotateCw,
  RotateCcw,
  Search,
  Trash2,
  Undo2,
  Unlock,
  X,
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
  validateCandidateLayout,
  type Opening,
  type PlacedItem,
  type PlannerResult,
  type Room,
  type Rotation,
  type Variant,
} from '@/lib/planner';

type Notice = { tone: 'success' | 'error' | 'info'; text: string } | null;
type PlacementDraft = { kind: 'add' | 'edit'; item: PlacedItem };

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
  onOpenChange,
  onPlace,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlace: (catalogueItemId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? CATALOGUE.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalized)) : CATALOGUE;
  }, [query]);

  const add = (catalogueItemId: string) => {
    onPlace(catalogueItemId);
    onOpenChange(false);
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
  onNotice,
}: {
  open: boolean;
  variants: Variant[];
  room: Room;
  revision: number;
  onOpenChange: (open: boolean) => void;
  onNotice: (notice: Notice) => void;
}) {
  const load = (variantId: string) => {
    const result = plannerService.loadVariant(revision, variantId);
    onNotice(result.ok ? { tone: 'success', text: `${result.variant.name} loaded into the Working Layout.` } : { tone: 'error', text: result.error.message });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
        ) : <p className="empty-dialog">No Variants yet. ChatGPT can preserve layouts while you work together.</p>}
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
  const [notice, setNotice] = useState<Notice>(null);
  const [placementDraft, setPlacementDraft] = useState<PlacementDraft | null>(null);
  const selectedItem = state.workingLayout.items.find((item) => item.itemId === selectedItemId);
  const selectedDefinition = selectedItem ? CATALOGUE.find((item) => item.catalogueItemId === selectedItem.catalogueItemId) : undefined;
  const currentVariant = state.variants.at(-1)?.name;
  const placementDefinition = placementDraft ? CATALOGUE.find((item) => item.catalogueItemId === placementDraft.item.catalogueItemId) : undefined;
  const placementItems = useMemo(() => {
    if (!placementDraft) return state.workingLayout.items;
    if (placementDraft.kind === 'add') return [...state.workingLayout.items, placementDraft.item];
    return state.workingLayout.items.map((item) => item.itemId === placementDraft.item.itemId ? placementDraft.item : item);
  }, [placementDraft, state.workingLayout.items]);
  const placementValidation = placementDraft ? validateCandidateLayout({
    revision: state.revision,
    room: state.room,
    candidateItems: placementItems,
    lockedItems: state.workingLayout.items.filter((item) => item.locked),
  }) : null;

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

  const beginCataloguePlacement = (catalogueItemId: string) => {
    setPlacementDraft({
      kind: 'add',
      item: {
        itemId: `placement-draft-${catalogueItemId}`,
        catalogueItemId,
        xMm: Math.round(state.room.widthMm / 2),
        yMm: Math.round(state.room.depthMm / 2),
        rotationDeg: 0,
        locked: false,
      },
    });
    setSelectedItemId(null);
  };

  const beginItemPlacement = (itemId: string) => {
    const item = state.workingLayout.items.find((entry) => entry.itemId === itemId);
    if (!item) return;
    if (item.locked) {
      setNotice({ tone: 'info', text: 'Unlock this item before moving or rotating it.' });
      return;
    }
    setPlacementDraft({ kind: 'edit', item: structuredClone(item) });
    setSelectedItemId(item.itemId);
  };

  const updatePlacementDraft = (patch: Partial<PlacedItem>) => {
    setPlacementDraft((current) => current ? { ...current, item: { ...current.item, ...patch } } : current);
  };

  const movePlacementDraft = (xDelta: number, yDelta: number) => {
    if (!placementDraft) return;
    updatePlacementDraft({
      xMm: Math.max(0, Math.min(state.room.widthMm, placementDraft.item.xMm + xDelta)),
      yMm: Math.max(0, Math.min(state.room.depthMm, placementDraft.item.yMm + yDelta)),
    });
  };

  const handleItemMove = (itemId: string, xMm: number, yMm: number, phase: 'start' | 'move' | 'end') => {
    if (phase === 'start') return;
    setPlacementDraft((current) => {
      if (current?.item.itemId === itemId) return { ...current, item: { ...current.item, xMm, yMm } };
      const item = state.workingLayout.items.find((entry) => entry.itemId === itemId);
      if (!item || item.locked) return current;
      return { kind: 'edit', item: { ...item, xMm, yMm } };
    });
  };

  const confirmPlacement = () => {
    if (!placementDraft || !placementValidation?.valid) {
      setNotice({ tone: 'error', text: placementValidation?.violations[0]?.message ?? 'Choose a valid position before continuing.' });
      return;
    }
    const placement = { xMm: placementDraft.item.xMm, yMm: placementDraft.item.yMm, rotationDeg: placementDraft.item.rotationDeg };
    const result = placementDraft.kind === 'add'
      ? plannerService.addCatalogueItem(state.revision, placementDraft.item.catalogueItemId, placement)
      : plannerService.updateItemPlacement(state.revision, placementDraft.item.itemId, placement);
    showResult(result, placementDraft.kind === 'add' ? 'Item placed in the Working Layout.' : 'Item position updated.');
    if (result.ok) {
      setSelectedItemId(result.item.itemId);
      setPlacementDraft(null);
    }
  };

  const connectionCopy = {
    checking: 'Checking Site tools',
    ready: 'Site tools active',
    manual: 'Manual mode',
    error: 'Site tools unavailable',
  }[webMcpStatus];
  const workspaceCopy = {
    checking: 'This planner will stay in sync as soon as Site tools are available.',
    ready: 'ChatGPT can read and update this planner through Site tools. Make changes here or ask for help in chat.',
    manual: 'Edit the Room and arrange furniture directly. Open this Site in ChatGPT to work together.',
    error: 'Keep planning here while Site tools reconnect. Your direct controls remain available.',
  }[webMcpStatus];

  return (
    <main className="planner-shell">
      <WebMcpRegistrar />
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="Furnish home"><span aria-hidden="true">F</span>Furnish</a>
        <div className="project-name"><strong>Prepared living room</strong><span>Shared planner · revision {state.revision}</span></div>
        <div className="topbar-actions">
          <span className={`connection-status status-${webMcpStatus}`}><i /> {connectionCopy}</span>
          <Button variant="outline" size="sm" onClick={exportLayout}>Export SVG</Button>
          <Button variant="outline" size="sm" disabled={!canUndo} onClick={() => showResult(plannerService.undo(state.revision), 'Last change undone.')}><Undo2 /> Undo</Button>
          <Button variant="outline" size="sm" onClick={() => { showResult(plannerService.resetDemo(state.revision), 'Prepared Room reset.'); setSelectedItemId(null); setPlacementDraft(null); }}><RotateCcw /> Reset</Button>
        </div>
      </header>

      <section id="workspace" className={`studio-grid ${placementDraft ? 'placement-active' : ''}`}>
        <nav className="tool-shelf" aria-label="Planner tools">
          <button className="active" type="button" onClick={() => setRoomOpen(true)}><Move /><span>Room</span></button>
          <button type="button" onClick={() => setCatalogueOpen(true)}><Boxes /><span>Catalogue</span><em>140</em></button>
          <button type="button" onClick={() => setVariantsOpen(true)}><GalleryVerticalEnd /><span>Variants</span><em>{state.variants.length}</em></button>
        </nav>

        <section className="canvas-card" aria-labelledby="room-title">
          <header className="canvas-heading">
            <div><span className="eyebrow">{placementDraft ? (placementDraft.kind === 'add' ? 'Place furniture' : 'Edit furniture') : 'Prepared Room'}</span><h1 id="room-title">{placementDefinition?.name ?? currentVariant ?? `${(state.room.widthMm / 1000).toFixed(1)} × ${(state.room.depthMm / 1000).toFixed(1)} m`}</h1></div>
            {placementDraft ? <ol className="placement-steps" aria-label="Placement progress"><li className="done"><span>1</span>Choose</li><li className="current"><span>2</span>Position</li><li><span>3</span>Confirm</li></ol> : <span className={`validity ${state.workingLayout.items.length ? (validation.valid ? 'valid' : 'blocked') : 'ready'}`}>{state.workingLayout.items.length ? (validation.valid ? '✓ Valid Layout' : '× Blocked') : 'Ready'}</span>}
          </header>
          <div className="room-wrap"><RoomCanvas room={state.room} items={placementItems} selectedItemId={placementDraft?.item.itemId ?? selectedItemId} onSelect={setSelectedItemId} onItemMove={handleItemMove} />{placementDraft && <div className="placement-hint"><MousePointer2 /><span><strong>Position the item</strong>Click and drag, or use the controls below</span></div>}</div>
          {placementDraft ? <footer className="placement-dock"><div className="placement-nudge"><button onClick={() => movePlacementDraft(0, -100)} aria-label="Move up"><ArrowUp /></button><button onClick={() => movePlacementDraft(-100, 0)} aria-label="Move left"><ArrowLeft /></button><span>100</span><button onClick={() => movePlacementDraft(100, 0)} aria-label="Move right"><ArrowRight /></button><button onClick={() => movePlacementDraft(0, 100)} aria-label="Move down"><ArrowDown /></button></div><button className="placement-rotate" onClick={() => updatePlacementDraft({ rotationDeg: ((placementDraft.item.rotationDeg + 90) % 360) as Rotation })}><RotateCw /><span>Rotate 90°</span><strong>{placementDraft.item.rotationDeg}°</strong></button><div className={`placement-status ${placementValidation?.valid ? 'valid' : 'blocked'}`}>{placementValidation?.valid ? <Check /> : <X />}<span><strong>{placementValidation?.valid ? 'Valid position' : 'Position blocked'}</strong>{placementValidation?.valid ? 'Ready to confirm' : placementValidation?.violations[0]?.message}</span></div><Button variant="outline" onClick={() => setPlacementDraft(null)}>Cancel</Button><Button disabled={!placementValidation?.valid} onClick={confirmPlacement}>{placementDraft.kind === 'add' ? 'Place item' : 'Apply move'}</Button></footer> : <footer className="canvas-legend"><span><i className="opening-key" /> Openings</span><span><i className="route-key" /> 900 mm Circulation Route</span><span>{selectedItem ? 'Drag unlocked furniture or use the inspector' : 'Select furniture to inspect it'}</span></footer>}
        </section>

        <aside className="inspector" aria-label="Planner inspector">
          <section className={`shared-card shared-${webMcpStatus}`}>
            <span className="eyebrow">Shared workspace</span>
            <h2>Plan together, live</h2>
            <p>{workspaceCopy}</p>
            <footer><span><i />{connectionCopy}</span><span>Revision {state.revision}</span></footer>
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
              </Button><Button variant="outline" size="sm" disabled={selectedItem.locked} onClick={() => beginItemPlacement(selectedItem.itemId)}><Move />Move / rotate</Button><Button variant="destructive" size="sm" disabled={selectedItem.locked} title={selectedItem.locked ? 'Unlock this item before removing it.' : 'Remove this item from the Working Layout'} onClick={removeSelectedItem}><Trash2 />Remove</Button></div></>
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
      <CatalogueDialog open={catalogueOpen} onOpenChange={setCatalogueOpen} onPlace={beginCataloguePlacement} />
      <VariantsDialog open={variantsOpen} variants={state.variants} room={state.room} revision={state.revision} onOpenChange={setVariantsOpen} onNotice={setNotice} />
    </main>
  );
}
