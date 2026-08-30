'use client';

// Three variants of the shared place/move/rotate interaction, switchable with ?variant=, on the existing planner route.

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Hand,
  MousePointer2,
  RotateCw,
  Search,
  X,
} from 'lucide-react';

import { RoomCanvas } from '@/components/room-canvas';
import { Button } from '@/components/ui/button';
import { CATALOGUE, type PlacedItem, type Room, type Rotation } from '@/lib/planner';

export type PrototypeVariant = 'A' | 'B' | 'C';

const variants: { key: PrototypeVariant; name: string }[] = [
  { key: 'A', name: 'Canvas first' },
  { key: 'B', name: 'Precision inspector' },
  { key: 'C', name: 'Guided placement' },
];

const previewItems: PlacedItem[] = [
  { itemId: 'prototype-armchair', catalogueItemId: 'armchair', xMm: 2100, yMm: 2800, rotationDeg: 0, locked: false },
  { itemId: 'prototype-table', catalogueItemId: 'side-square', xMm: 3650, yMm: 1800, rotationDeg: 0, locked: false },
];

function getVariantFromLocation(): PrototypeVariant | null {
  if (process.env.NODE_ENV === 'production') return null;
  const value = new URLSearchParams(window.location.search).get('variant')?.toUpperCase();
  return value === 'A' || value === 'B' || value === 'C' ? value : null;
}

export function usePrototypeVariant() {
  const [variant, setVariant] = useState<PrototypeVariant | null>(null);
  useEffect(() => {
    const update = () => setVariant(getVariantFromLocation());
    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return variant;
}

function usePrototypeItems(room: Room) {
  const [items, setItems] = useState<PlacedItem[]>(previewItems);
  const [selectedItemId, setSelectedItemId] = useState(previewItems[1].itemId);
  const selectedItem = items.find((item) => item.itemId === selectedItemId) ?? items[0];
  const selectedDefinition = CATALOGUE.find((item) => item.catalogueItemId === selectedItem?.catalogueItemId);

  const updateSelected = (patch: Partial<PlacedItem>) => {
    if (!selectedItem) return;
    setItems((current) => current.map((item) => item.itemId === selectedItem.itemId ? { ...item, ...patch } : item));
  };

  const nudge = (xDelta: number, yDelta: number) => {
    if (!selectedItem || selectedItem.locked) return;
    updateSelected({
      xMm: Math.max(250, Math.min(room.widthMm - 250, selectedItem.xMm + xDelta)),
      yMm: Math.max(250, Math.min(room.depthMm - 250, selectedItem.yMm + yDelta)),
    });
  };

  const rotate = () => {
    if (!selectedItem || selectedItem.locked) return;
    updateSelected({ rotationDeg: ((selectedItem.rotationDeg + 90) % 360) as Rotation });
  };

  const addCandidate = () => {
    const candidate: PlacedItem = {
      itemId: `prototype-new-${Date.now()}`,
      catalogueItemId: 'side-round',
      xMm: Math.round(room.widthMm / 2),
      yMm: Math.round(room.depthMm / 2),
      rotationDeg: 0,
      locked: false,
    };
    setItems((current) => [...current.filter((item) => !item.itemId.startsWith('prototype-new-')), candidate]);
    setSelectedItemId(candidate.itemId);
  };

  return { items, selectedItem, selectedDefinition, selectedItemId, setSelectedItemId, updateSelected, nudge, rotate, addCandidate };
}

function StateReadout({ item }: { item: PlacedItem | undefined }) {
  if (!item) return null;
  return <code className="prototype-state">draft · x {item.xMm} · y {item.yMm} · {item.rotationDeg}° · valid</code>;
}

function NudgePad({ onNudge }: { onNudge: (x: number, y: number) => void }) {
  return (
    <div className="nudge-pad" aria-label="Move selected item">
      <button onClick={() => onNudge(0, -100)} aria-label="Move up"><ArrowUp /></button>
      <button onClick={() => onNudge(-100, 0)} aria-label="Move left"><ArrowLeft /></button>
      <span>100</span>
      <button onClick={() => onNudge(100, 0)} aria-label="Move right"><ArrowRight /></button>
      <button onClick={() => onNudge(0, 100)} aria-label="Move down"><ArrowDown /></button>
    </div>
  );
}

function CanvasFirst({ room }: { room: Room }) {
  const model = usePrototypeItems(room);
  return (
    <section className="placement-prototype canvas-first">
      <aside className="prototype-catalogue">
        <span className="eyebrow">Furniture Catalogue</span>
        <label><Search /><input placeholder="Search" /></label>
        <button className="catalogue-choice" onClick={model.addCandidate}><span>○</span><strong>Round side table</strong><small>Click to place</small></button>
        <button className="catalogue-choice"><span>▭</span><strong>Armchair</strong><small>Already placed</small></button>
      </aside>
      <article className="prototype-room-stage">
        <header><div><span className="eyebrow">Working Layout</span><h1>Place directly on the Room</h1></div><span className="prototype-valid"><Check /> Valid position</span></header>
        <div className="prototype-canvas-wrap">
          <RoomCanvas room={room} items={model.items} selectedItemId={model.selectedItemId} onSelect={model.setSelectedItemId} />
          <div className="canvas-direct-toolbar">
            <Hand /><span>Drag to move</span><button onClick={model.rotate}><RotateCw /> Rotate 90°</button><button><X /> Cancel</button><Button size="sm"><Check /> Place</Button>
          </div>
        </div>
        <StateReadout item={model.selectedItem} />
      </article>
      <aside className="prototype-mini-inspector">
        <span className="eyebrow">Selection</span>
        <h2>{model.selectedDefinition?.name}</h2>
        <p>Direct manipulation stays primary. Precise movement is available as a fallback.</p>
        <NudgePad onNudge={model.nudge} />
        <Button variant="outline" onClick={model.rotate}><RotateCw /> Rotate 90°</Button>
      </aside>
    </section>
  );
}

function PrecisionInspector({ room }: { room: Room }) {
  const model = usePrototypeItems(room);
  return (
    <section className="placement-prototype precision-inspector">
      <article className="prototype-room-stage">
        <header><div><span className="eyebrow">Working Layout</span><h1>Position with exact controls</h1></div><button className="add-from-catalogue" onClick={model.addCandidate}>+ Add furniture</button></header>
        <div className="prototype-canvas-wrap"><RoomCanvas room={room} items={model.items} selectedItemId={model.selectedItemId} onSelect={model.setSelectedItemId} /></div>
        <StateReadout item={model.selectedItem} />
      </article>
      <aside className="precision-panel">
        <div className="precision-heading"><span><Crosshair /></span><div><span className="eyebrow">Placement inspector</span><h2>{model.selectedDefinition?.name}</h2></div></div>
        <p>Set the candidate before committing it to the Working Layout.</p>
        <label>X position <strong>{model.selectedItem?.xMm} mm</strong><input type="range" min="250" max={room.widthMm - 250} step="50" value={model.selectedItem?.xMm ?? 0} onChange={(event) => model.updateSelected({ xMm: Number(event.target.value) })} /></label>
        <label>Y position <strong>{model.selectedItem?.yMm} mm</strong><input type="range" min="250" max={room.depthMm - 250} step="50" value={model.selectedItem?.yMm ?? 0} onChange={(event) => model.updateSelected({ yMm: Number(event.target.value) })} /></label>
        <div className="rotation-options"><span>Rotation</span>{([0, 90, 180, 270] as Rotation[]).map((rotation) => <button className={model.selectedItem?.rotationDeg === rotation ? 'active' : ''} key={rotation} onClick={() => model.updateSelected({ rotationDeg: rotation })}>{rotation}°</button>)}</div>
        <div className="precision-validation"><Check /><div><strong>Valid position</strong><span>No overlap, bounds or route conflicts</span></div></div>
        <div className="precision-actions"><Button variant="outline">Cancel</Button><Button>Apply placement</Button></div>
      </aside>
    </section>
  );
}

function GuidedPlacement({ room }: { room: Room }) {
  const model = usePrototypeItems(room);
  const [step, setStep] = useState<1 | 2 | 3>(2);
  return (
    <section className="placement-prototype guided-placement">
      <header className="guided-header">
        <div><span className="eyebrow">Place furniture</span><h1>Round side table</h1></div>
        <ol><li className={step >= 1 ? 'done' : ''}><span>1</span>Choose</li><li className={step >= 2 ? 'active' : ''}><span>2</span>Position</li><li className={step >= 3 ? 'done' : ''}><span>3</span>Confirm</li></ol>
        <button><X /> Exit placement</button>
      </header>
      <article className="guided-stage">
        <div className="prototype-canvas-wrap"><RoomCanvas room={room} items={model.items} selectedItemId={model.selectedItemId} onSelect={model.setSelectedItemId} /></div>
        <div className="guided-hint"><MousePointer2 /><span><strong>Position the item</strong>Drag on the Room or use the controls below</span></div>
      </article>
      <footer className="guided-dock">
        <NudgePad onNudge={model.nudge} />
        <button onClick={model.rotate}><RotateCw /><span>Rotate</span><strong>{model.selectedItem?.rotationDeg}°</strong></button>
        <div className="dock-validation"><Check /><span><strong>Valid position</strong>Ready to place</span></div>
        <StateReadout item={model.selectedItem} />
        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => setStep(3)}>Place item</Button>
      </footer>
    </section>
  );
}

function PrototypeSwitcher({ current }: { current: PrototypeVariant }) {
  const currentIndex = variants.findIndex((variant) => variant.key === current);
  const change = (direction: -1 | 1) => {
    const next = variants[(currentIndex + direction + variants.length) % variants.length];
    const url = new URL(window.location.href);
    url.searchParams.set('variant', next.key);
    window.history.replaceState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.matches('input, textarea, [contenteditable]')) return;
      if (event.key === 'ArrowLeft') change(-1);
      if (event.key === 'ArrowRight') change(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <nav className="prototype-switcher" aria-label="Prototype variant switcher">
      <button onClick={() => change(-1)} aria-label="Previous variant"><ChevronLeft /></button>
      <span><small>Prototype</small>{current} — {variants[currentIndex].name}</span>
      <button onClick={() => change(1)} aria-label="Next variant"><ChevronRight /></button>
    </nav>
  );
}

export function PlacementPrototype({ room, variant }: { room: Room; variant: PrototypeVariant }) {
  const content = useMemo(() => {
    if (variant === 'A') return <CanvasFirst room={room} />;
    if (variant === 'B') return <PrecisionInspector room={room} />;
    return <GuidedPlacement room={room} />;
  }, [room, variant]);

  return <>{content}<PrototypeSwitcher current={variant} /></>;
}
