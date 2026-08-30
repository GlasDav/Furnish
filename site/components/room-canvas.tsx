'use client';

import { useId, useRef, type PointerEvent as ReactPointerEvent } from 'react';

import {
  CATALOGUE,
  type Opening,
  type PlacedItem,
  type Room,
} from '@/lib/planner';
import { createFurnitureLabels } from '@/components/room-labels';

const catalogueById = new Map(CATALOGUE.map((item) => [item.catalogueItemId, item]));
const SCALE = 0.1;
const INSET = 20;

function OpeningMark({ opening, room }: { opening: Opening; room: Room }) {
  const start = INSET + opening.startMm * SCALE;
  const end = INSET + opening.endMm * SCALE;
  const eastX = INSET + room.widthMm * SCALE;
  const southY = INSET + room.depthMm * SCALE;
  const classes = `opening-mark opening-${opening.type}`;

  if (opening.wall === 'north') return <line className={classes} x1={start} y1={INSET} x2={end} y2={INSET} />;
  if (opening.wall === 'south') return <line className={classes} x1={start} y1={southY} x2={end} y2={southY} />;
  if (opening.wall === 'east') return <line className={classes} x1={eastX} y1={start} x2={eastX} y2={end} />;
  return <line className={classes} x1={INSET} y1={start} x2={INSET} y2={end} />;
}

function ItemSymbol({
  item,
  selected,
  onSelect,
  onPointerDown,
}: {
  item: PlacedItem;
  selected: boolean;
  onSelect?: (itemId: string) => void;
  onPointerDown?: (itemId: string, event: ReactPointerEvent<SVGGElement>) => void;
}) {
  const definition = catalogueById.get(item.catalogueItemId);
  if (!definition) return null;
  const width = definition.widthMm * SCALE;
  const height = definition.depthMm * SCALE;
  const x = INSET + item.xMm * SCALE;
  const y = INSET + item.yMm * SCALE;
  const category = definition.category.toLowerCase();
  const isPlant = item.catalogueItemId === 'plant';

  return (
    <g
      className={`furniture-symbol furniture-${category} ${definition.solid ? '' : 'furniture-rug'} ${selected ? 'selected' : ''}`}
      data-item-id={item.itemId}
      transform={`translate(${x} ${y}) rotate(${item.rotationDeg})`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={`${definition.name}${item.locked ? ', locked' : ''}`}
      onClick={() => onSelect?.(item.itemId)}
      onPointerDown={(event) => onPointerDown?.(item.itemId, event)}
      onKeyDown={(event) => {
        if (onSelect && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect(item.itemId);
        }
      }}
    >
      {isPlant ? (
        <>
          <circle className="furniture-body" r={width / 2} />
          <path className="furniture-detail" d={`M0-${height * 0.32}V${height * 0.32}M-${width * 0.32} 0H${width * 0.32}M-${width * 0.24}-${height * 0.24}L${width * 0.24} ${height * 0.24}M${width * 0.24}-${height * 0.24}L-${width * 0.24} ${height * 0.24}`} />
        </>
      ) : (
        <>
          <rect
            className="furniture-body"
            x={-width / 2}
            y={-height / 2}
            width={width}
            height={height}
            rx={definition.solid ? Math.min(10, Math.min(width, height) * 0.12) : 10}
          />
          {definition.solid && (
            <path className="furniture-detail" d={`M${-width / 2 + Math.min(12, width * 0.16)} 0H${width / 2 - Math.min(12, width * 0.16)}`} />
          )}
        </>
      )}
      {item.locked && (
        <g className="lock-mark" transform={`translate(0 ${-height / 2 - 12})`}>
          <circle r="11" />
          <path d="M-4-1v-3a4 4 0 018 0v3M-6-1h12v8H-6z" />
        </g>
      )}
    </g>
  );
}

export function RoomCanvas({
  room,
  items,
  selectedItemId,
  onSelect,
  onItemMove,
  compact = false,
  label = 'Prepared living room plan',
}: {
  room: Room;
  items: PlacedItem[];
  selectedItemId?: string | null;
  onSelect?: (itemId: string) => void;
  onItemMove?: (itemId: string, xMm: number, yMm: number, phase: 'start' | 'move' | 'end') => void;
  compact?: boolean;
  label?: string;
}) {
  const generatedId = useId().replaceAll(':', '');
  const width = room.widthMm * SCALE;
  const height = room.depthMm * SCALE;
  const viewWidth = width + INSET * 2;
  const viewHeight = height + INSET * 2 + (compact ? 0 : 10);
  const sortedItems = [...items].sort((left, right) => Number(catalogueById.get(left.catalogueItemId)?.solid) - Number(catalogueById.get(right.catalogueItemId)?.solid));
  const furnitureLabels = createFurnitureLabels(sortedItems, CATALOGUE, compact);
  const dragRef = useRef<{ itemId: string; offsetX: number; offsetY: number; moved: boolean; xMm: number; yMm: number } | null>(null);

  const roomPoint = (svg: SVGSVGElement, clientX: number, clientY: number) => {
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const localPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    return { xMm: Math.round((localPoint.x - INSET) / SCALE), yMm: Math.round((localPoint.y - INSET) / SCALE) };
  };

  const startItemDrag = (itemId: string, event: ReactPointerEvent<SVGGElement>) => {
    const item = items.find((entry) => entry.itemId === itemId);
    const svg = event.currentTarget.ownerSVGElement;
    if (!item || item.locked || !onItemMove || !svg) return;
    const point = roomPoint(svg, event.clientX, event.clientY);
    dragRef.current = { itemId, offsetX: item.xMm - point.xMm, offsetY: item.yMm - point.yMm, moved: false, xMm: item.xMm, yMm: item.yMm };
    svg.setPointerCapture(event.pointerId);
    onSelect?.(itemId);
    onItemMove(itemId, item.xMm, item.yMm, 'start');
    event.preventDefault();
  };

  const moveItemDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || !onItemMove) return;
    const point = roomPoint(event.currentTarget, event.clientX, event.clientY);
    drag.xMm = point.xMm + drag.offsetX;
    drag.yMm = point.yMm + drag.offsetY;
    drag.moved = true;
    onItemMove(drag.itemId, drag.xMm, drag.yMm, 'move');
  };

  const endItemDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.moved) onItemMove?.(drag.itemId, drag.xMm, drag.yMm, 'end');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  return (
    <svg className={`room-canvas ${compact ? 'compact' : ''} ${onItemMove ? 'interactive' : ''}`} viewBox={`0 0 ${viewWidth} ${viewHeight}`} onPointerMove={moveItemDrag} onPointerUp={endItemDrag} onPointerCancel={endItemDrag}>
      <title>{label}</title>
      <defs>
        <pattern id={`grid-${generatedId}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" />
        </pattern>
      </defs>
      <rect className="room-paper" x={INSET} y={INSET} width={width} height={height} rx="4" />
      <rect className="room-grid" x={INSET} y={INSET} width={width} height={height} fill={`url(#grid-${generatedId})`} />
      <path
        className="circulation-route"
        d={`M${INSET + 600 * SCALE} ${INSET + (room.depthMm - 450) * SCALE}H${INSET + (room.widthMm - 450) * SCALE}V${INSET + 450 * SCALE}`}
      />
      <rect className="wall" x={INSET} y={INSET} width={width} height={height} rx="2" />
      {room.openings.map((opening) => <OpeningMark key={opening.openingId} opening={opening} room={room} />)}
      {sortedItems.length ? (
        <>
          {sortedItems.map((item) => (
            <ItemSymbol key={item.itemId} item={item} selected={selectedItemId === item.itemId} onSelect={onSelect} onPointerDown={startItemDrag} />
          ))}
          <g className="furniture-labels" aria-hidden="true">
            {furnitureLabels.map((itemLabel) => (
              <g className="furniture-label" key={itemLabel.itemId} transform={`translate(${itemLabel.x} ${itemLabel.y})`}>
                <rect x={-itemLabel.width / 2} y={-itemLabel.height / 2} width={itemLabel.width} height={itemLabel.height} rx="4" />
                <text fontSize={itemLabel.fontSize}>
                  {itemLabel.lines.map((line, index) => (
                    <tspan key={`${line}-${index}`} x="0" y={-(itemLabel.lines.length - 1) * itemLabel.lineHeight / 2 + itemLabel.fontSize * 0.34 + index * itemLabel.lineHeight}>{line}</tspan>
                  ))}
                </text>
              </g>
            ))}
          </g>
        </>
      ) : (
        <g className="empty-room">
          <circle cx={INSET + width / 2} cy={INSET + height * 0.44} r="30" />
          <path d={`M${INSET + width / 2} ${INSET + height * 0.44 - 14}V${INSET + height * 0.44 + 14}M${INSET + width / 2 - 14} ${INSET + height * 0.44}H${INSET + width / 2 + 14}`} />
          <text x={INSET + width / 2} y={INSET + height * 0.44 + 52}>Prepared Room is ready</text>
          {!compact && <text className="empty-room-sub" x={INSET + width / 2} y={INSET + height * 0.44 + 76}>ChatGPT can read its bounds and openings</text>}
        </g>
      )}
      {!compact && (
        <>
          <text className="dimension" x={INSET + width / 2} y={INSET + height + 20}>{(room.widthMm / 1000).toFixed(1)} m</text>
          <text className="dimension" transform={`translate(${INSET + width + 17} ${INSET + height / 2}) rotate(90)`}>{(room.depthMm / 1000).toFixed(1)} m</text>
        </>
      )}
    </svg>
  );
}
