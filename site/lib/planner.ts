export type Rotation = 0 | 90 | 180 | 270;
export type LayoutIntent = 'conversation' | 'media';
export type Actor = 'human' | 'agent' | 'system';

export type Opening = {
  openingId: string;
  type: 'door' | 'slider' | 'window';
  wall: 'north' | 'east' | 'south' | 'west';
  startMm: number;
  endMm: number;
  hingeSide?: 'left' | 'right';
  swing?: 'inward' | 'outward';
};

export type Room = {
  widthMm: number;
  depthMm: number;
  openings: Opening[];
  entranceOpeningId: string;
  balconyOpeningId: string;
};

export type PlacedItem = {
  itemId: string;
  catalogueItemId: string;
  xMm: number;
  yMm: number;
  rotationDeg: Rotation;
  locked: boolean;
};

export type Variant = {
  variantId: string;
  name: string;
  intent: LayoutIntent;
  createdAtRevision: number;
  items: PlacedItem[];
};

export type PlannerState = {
  schemaVersion: 1;
  revision: number;
  catalogueVersion: string;
  room: Room;
  workingLayout: { items: PlacedItem[] };
  variants: Variant[];
};

export type CatalogueItem = {
  catalogueItemId: string;
  sourceModel: string;
  name: string;
  category: string;
  widthMm: number;
  depthMm: number;
  solid: boolean;
  layoutVerified: boolean;
  footprintProvisional: boolean;
};

export type Violation = {
  code: string;
  message: string;
  itemIds?: string[];
  openingIds?: string[];
  routeZoneIds?: string[];
};

export type ValidationCheck = {
  checkId: string;
  passed: boolean;
  violationCount: number;
  evidence: Record<string, unknown>;
};

export type ValidationResult = {
  ok: true;
  revision: number;
  valid: boolean;
  candidateFingerprint: string;
  checks: ValidationCheck[];
  violations: Violation[];
};

export type ActivityEntry = {
  actor: Actor;
  action: string;
  revision: number;
  at: string;
};

export type WebMcpStatus = 'checking' | 'ready' | 'manual' | 'error';

export type PlannerSnapshot = {
  state: PlannerState;
  validation: ValidationResult;
  activity: ActivityEntry[];
  canUndo: boolean;
  webMcpStatus: WebMcpStatus;
};

export type PlannerError = {
  code: string;
  message: string;
  violations?: Violation[];
};

export type PlannerFailure = { ok: false; revision: number; error: PlannerError };

export type PlannerResult<T extends Record<string, unknown> = Record<string, never>> =
  | ({ ok: true; revision: number } & T)
  | PlannerFailure;

export const CATALOGUE_SOURCE = {
  name: 'Kenney Furniture Kit',
  url: 'https://kenney.nl/assets/furniture-kit',
  license: 'Creative Commons CC0 1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  fileCount: 140,
  released: 2018,
} as const;

const KENNEY_MODEL_IDS = [
  'bathroomCabinet', 'bathroomCabinetDrawer', 'bathroomMirror', 'bathroomSink',
  'bathroomSinkSquare', 'bathtub', 'bear', 'bedBunk', 'bedDouble', 'bedSingle',
  'bench', 'benchCushion', 'benchCushionLow', 'bookcaseClosed', 'bookcaseClosedDoors',
  'bookcaseClosedWide', 'bookcaseOpen', 'bookcaseOpenLow', 'books', 'cabinetBed',
  'cabinetBedDrawer', 'cabinetBedDrawerTable', 'cabinetTelevision',
  'cabinetTelevisionDoors', 'cardboardBoxClosed', 'cardboardBoxOpen', 'ceilingFan',
  'chair', 'chairCushion', 'chairDesk', 'chairModernCushion', 'chairModernFrameCushion',
  'chairRounded', 'coatRack', 'coatRackStanding', 'computerKeyboard', 'computerMouse',
  'computerScreen', 'desk', 'deskCorner', 'doorway', 'doorwayFront', 'doorwayOpen',
  'dryer', 'floorCorner', 'floorCornerRound', 'floorFull', 'floorHalf', 'hoodLarge',
  'hoodModern', 'kitchenBar', 'kitchenBarEnd', 'kitchenBlender', 'kitchenCabinet',
  'kitchenCabinetCornerInner', 'kitchenCabinetCornerRound', 'kitchenCabinetDrawer',
  'kitchenCabinetUpper', 'kitchenCabinetUpperCorner', 'kitchenCabinetUpperDouble',
  'kitchenCabinetUpperLow', 'kitchenCoffeeMachine', 'kitchenFridge',
  'kitchenFridgeBuiltIn', 'kitchenFridgeLarge', 'kitchenFridgeSmall',
  'kitchenMicrowave', 'kitchenSink', 'kitchenStove', 'kitchenStoveElectric',
  'lampRoundFloor', 'lampRoundTable', 'lampSquareCeiling', 'lampSquareFloor',
  'lampSquareTable', 'lampWall', 'laptop', 'loungeChair', 'loungeChairRelax',
  'loungeDesignChair', 'loungeDesignSofa', 'loungeDesignSofaCorner', 'loungeSofa',
  'loungeSofaCorner', 'loungeSofaLong', 'loungeSofaOttoman', 'paneling', 'pillow',
  'pillowBlue', 'pillowBlueLong', 'pillowLong', 'plantSmall1', 'plantSmall2',
  'plantSmall3', 'pottedPlant', 'radio', 'rugDoormat', 'rugRectangle', 'rugRound',
  'rugRounded', 'rugSquare', 'shower', 'showerRound', 'sideTable', 'sideTableDrawers',
  'speaker', 'speakerSmall', 'stairs', 'stairsCorner', 'stairsOpen', 'stairsOpenSingle',
  'stoolBar', 'stoolBarSquare', 'table', 'tableCloth', 'tableCoffee',
  'tableCoffeeGlass', 'tableCoffeeGlassSquare', 'tableCoffeeSquare', 'tableCross',
  'tableCrossCloth', 'tableGlass', 'tableRound', 'televisionAntenna',
  'televisionModern', 'televisionVintage', 'toaster', 'toilet', 'toiletSquare',
  'trashcan', 'wall', 'wallCorner', 'wallCornerRond', 'wallDoorway', 'wallDoorwayWide',
  'wallHalf', 'wallWindow', 'wallWindowSlide', 'washer', 'washerDryerStacked',
] as const;

type VerifiedOverride = Omit<CatalogueItem, 'sourceModel' | 'footprintProvisional'>;

const VERIFIED_OVERRIDES: Record<string, VerifiedOverride> = {
  loungeSofa: verified('sofa-loveseat', 'Loveseat', 'Sofas', 1500, 850),
  loungeDesignSofa: verified('sofa-standard', 'Standard sofa', 'Sofas', 2100, 900),
  loungeSofaLong: verified('sofa-long', 'Long sofa', 'Sofas', 2400, 950),
  chairCushion: verified('armchair', 'Armchair', 'Chairs', 800, 800),
  loungeChair: verified('lounge-chair', 'Lounge chair', 'Chairs', 900, 900),
  sideTable: verified('side-round', 'Round side table', 'Tables', 450, 450),
  sideTableDrawers: verified('side-square', 'Square side table', 'Tables', 500, 500),
  tableCoffee: verified('coffee-rect', 'Rectangular coffee table', 'Tables', 1200, 600),
  tableCoffeeSquare: verified('coffee-square', 'Square coffee table', 'Tables', 900, 900),
  loungeSofaOttoman: verified('ottoman', 'Ottoman', 'Seating', 700, 700),
  cabinetTelevision: verified('media-console', 'Media console', 'Storage', 1500, 450),
  bookcaseOpen: verified('bookcase', 'Open bookcase', 'Storage', 800, 300),
  rugRectangle: verified('rug-medium', 'Medium rug', 'Rugs', 1600, 2300, false),
  rugRounded: verified('rug-large', 'Large rug', 'Rugs', 2000, 3000, false),
  lampRoundFloor: verified('floor-lamp', 'Floor lamp', 'Decor', 400, 400),
  pottedPlant: verified('plant', 'Potted plant', 'Decor', 500, 500),
};

function verified(
  catalogueItemId: string,
  name: string,
  category: string,
  widthMm: number,
  depthMm: number,
  solid = true,
): VerifiedOverride {
  return { catalogueItemId, name, category, widthMm, depthMm, solid, layoutVerified: true };
}

function humanize(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}

function inferCategory(model: string) {
  if (/sofa|chair|bench|stool|ottoman/i.test(model)) return 'Seating';
  if (/table|desk/i.test(model)) return 'Tables';
  if (/bed|pillow/i.test(model)) return 'Bedroom';
  if (/bath|shower|toilet|sink/i.test(model)) return 'Bathroom';
  if (/kitchen|fridge|stove|hood|toaster/i.test(model)) return 'Kitchen';
  if (/cabinet|bookcase|box/i.test(model)) return 'Storage';
  if (/lamp|plant|bear|radio|speaker|television|computer|laptop/i.test(model)) return 'Decor';
  if (/rug/i.test(model)) return 'Rugs';
  return 'Architecture';
}

export const CATALOGUE: CatalogueItem[] = KENNEY_MODEL_IDS.map((sourceModel) => {
  const override = VERIFIED_OVERRIDES[sourceModel];
  if (override) return { ...override, sourceModel, footprintProvisional: false };
  return {
    catalogueItemId: `kenney-${sourceModel}`,
    sourceModel,
    name: humanize(sourceModel),
    category: inferCategory(sourceModel),
    widthMm: 600,
    depthMm: 600,
    solid: !/rug|floor|wall|doorway|paneling/i.test(sourceModel),
    layoutVerified: false,
    footprintProvisional: true,
  };
});

export const VERIFIED_CATALOGUE = CATALOGUE.filter((item) => item.layoutVerified);
const CATALOGUE_BY_ID = new Map(CATALOGUE.map((item) => [item.catalogueItemId, item]));

export const PREPARED_ROOM: Room = {
  widthMm: 6000,
  depthMm: 4500,
  entranceOpeningId: 'entrance',
  balconyOpeningId: 'balcony',
  openings: [
    { openingId: 'entrance', type: 'door', wall: 'south', startMm: 600, endMm: 1500, hingeSide: 'right', swing: 'inward' },
    { openingId: 'balcony', type: 'slider', wall: 'east', startMm: 450, endMm: 2250 },
    { openingId: 'window', type: 'window', wall: 'north', startMm: 2100, endMm: 4500 },
  ],
};

function placed(
  itemId: string,
  catalogueItemId: string,
  xMm: number,
  yMm: number,
  rotationDeg: Rotation,
  locked = false,
): PlacedItem {
  return { itemId, catalogueItemId, xMm, yMm, rotationDeg, locked };
}

export const PREPARED_TEMPLATES: Record<LayoutIntent, PlacedItem[]> = {
  conversation: [
    placed('sofa-1', 'sofa-standard', 3150, 750, 0),
    placed('armchair-1', 'armchair', 2200, 3150, 180),
    placed('armchair-2', 'armchair', 4100, 3150, 180),
    placed('coffee-1', 'coffee-rect', 3150, 2000, 0),
    placed('side-table-1', 'side-square', 1750, 750, 0),
    placed('side-table-2', 'side-square', 4550, 750, 0),
    placed('media-console-1', 'media-console', 375, 2100, 90),
    placed('rug-1', 'rug-large', 3150, 2200, 90),
    placed('floor-lamp-1', 'floor-lamp', 1200, 1250, 0),
    placed('plant-1', 'plant', 4800, 1400, 0),
  ],
  media: [
    placed('sofa-1', 'sofa-standard', 750, 2250, 270, true),
    placed('armchair-1', 'armchair', 3500, 900, 0),
    placed('armchair-2', 'armchair', 3500, 3200, 180),
    placed('coffee-1', 'coffee-rect', 2300, 2100, 0),
    placed('side-table-1', 'side-square', 1450, 1450, 0),
    placed('side-table-2', 'side-square', 1450, 3050, 0),
    placed('media-console-1', 'media-console', 4775, 2250, 90),
    placed('rug-1', 'rug-large', 2850, 2250, 90),
    placed('floor-lamp-1', 'floor-lamp', 2200, 3350, 0),
    placed('plant-1', 'plant', 4600, 700, 0),
  ],
};

type Rect = { left: number; top: number; right: number; bottom: number };

function clone<T>(value: T): T {
  return structuredClone(value);
}

function footprint(item: PlacedItem): Rect | null {
  const definition = CATALOGUE_BY_ID.get(item.catalogueItemId);
  if (!definition) return null;
  const quarterTurn = item.rotationDeg === 90 || item.rotationDeg === 270;
  const widthMm = quarterTurn ? definition.depthMm : definition.widthMm;
  const depthMm = quarterTurn ? definition.widthMm : definition.depthMm;
  return {
    left: item.xMm - widthMm / 2,
    right: item.xMm + widthMm / 2,
    top: item.yMm - depthMm / 2,
    bottom: item.yMm + depthMm / 2,
  };
}

function intersects(a: Rect, b: Rect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function circulationZones(room: Room) {
  return [
    { zoneId: 'south-leg', left: 600, top: Math.max(0, room.depthMm - 900), right: room.widthMm, bottom: room.depthMm },
    { zoneId: 'east-leg', left: Math.max(0, room.widthMm - 900), top: 450, right: room.widthMm, bottom: room.depthMm },
  ];
}

function intersectsEntranceSwing(rect: Rect, room: Room) {
  const entrance = room.openings.find((opening) => opening.openingId === room.entranceOpeningId);
  if (!entrance || entrance.type !== 'door' || entrance.swing !== 'inward' || entrance.wall !== 'south') return false;
  const radius = entrance.endMm - entrance.startMm;
  const hingeX = entrance.hingeSide === 'left' ? entrance.startMm : entrance.endMm;
  const hingeY = room.depthMm;
  const bounds = { left: Math.min(entrance.startMm, hingeX), top: hingeY - radius, right: Math.max(entrance.endMm, hingeX), bottom: hingeY };
  if (!intersects(rect, bounds)) return false;
  const nearestX = Math.max(rect.left, Math.min(hingeX, rect.right));
  const nearestY = Math.max(rect.top, Math.min(hingeY, rect.bottom));
  const dx = hingeX - nearestX;
  const dy = hingeY - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

function sameLockedItem(expected: PlacedItem, actual: PlacedItem) {
  return expected.itemId === actual.itemId
    && expected.catalogueItemId === actual.catalogueItemId
    && expected.xMm === actual.xMm
    && expected.yMm === actual.yMm
    && expected.rotationDeg === actual.rotationDeg
    && actual.locked;
}

const VIOLATION_ORDER = [
  'UNKNOWN_ITEM', 'UNVERIFIED_ITEM', 'UNSUPPORTED_ROTATION', 'DUPLICATE_ITEM_ID',
  'LOCKED_ITEM_MISSING', 'LOCKED_ITEM_CHANGED', 'OUT_OF_BOUNDS', 'ITEM_OVERLAP',
  'OPENING_CLEARANCE', 'CIRCULATION_BLOCKED',
];

function stableViolations(entries: Violation[]) {
  return entries.sort((a, b) => {
    const codeDifference = VIOLATION_ORDER.indexOf(a.code) - VIOLATION_ORDER.indexOf(b.code);
    return codeDifference || JSON.stringify(a).localeCompare(JSON.stringify(b));
  });
}

export function validateCandidateLayout({
  revision,
  room,
  candidateItems,
  lockedItems = [],
  requireVerified = false,
}: {
  revision: number;
  room: Room;
  candidateItems: PlacedItem[];
  lockedItems?: PlacedItem[];
  requireVerified?: boolean;
}): ValidationResult {
  const groups: Array<[string, Violation[], Record<string, unknown>]> = [];
  const catalogueViolations: Violation[] = [];
  const rotationViolations: Violation[] = [];
  const identityViolations: Violation[] = [];
  const lockViolations: Violation[] = [];
  const containmentViolations: Violation[] = [];
  const overlapViolations: Violation[] = [];
  const openingViolations: Violation[] = [];
  const circulationViolations: Violation[] = [];
  const seenIds = new Set<string>();

  for (const item of candidateItems) {
    const definition = CATALOGUE_BY_ID.get(item.catalogueItemId);
    if (!definition) catalogueViolations.push({ code: 'UNKNOWN_ITEM', message: `Unknown catalogue item ${item.catalogueItemId}.`, itemIds: [item.itemId] });
    else if (requireVerified && !definition.layoutVerified) catalogueViolations.push({ code: 'UNVERIFIED_ITEM', message: `${item.itemId} is not Layout-Verified.`, itemIds: [item.itemId] });
    if (![0, 90, 180, 270].includes(item.rotationDeg)) rotationViolations.push({ code: 'UNSUPPORTED_ROTATION', message: `${item.itemId} must use a quarter-turn rotation.`, itemIds: [item.itemId] });
    if (seenIds.has(item.itemId)) identityViolations.push({ code: 'DUPLICATE_ITEM_ID', message: `${item.itemId} occurs more than once.`, itemIds: [item.itemId] });
    seenIds.add(item.itemId);
  }

  for (const lockedItem of lockedItems) {
    const actual = candidateItems.find((item) => item.itemId === lockedItem.itemId);
    if (!actual) lockViolations.push({ code: 'LOCKED_ITEM_MISSING', message: `${lockedItem.itemId} cannot be removed.`, itemIds: [lockedItem.itemId] });
    else if (!sameLockedItem(lockedItem, actual)) lockViolations.push({ code: 'LOCKED_ITEM_CHANGED', message: `${lockedItem.itemId} must keep its catalogue item, pose, and lock.`, itemIds: [lockedItem.itemId] });
  }

  const measurableItems = candidateItems.filter((item) => footprint(item));
  for (const item of measurableItems) {
    const rect = footprint(item)!;
    if (rect.left < 0 || rect.top < 0 || rect.right > room.widthMm || rect.bottom > room.depthMm) {
      containmentViolations.push({ code: 'OUT_OF_BOUNDS', message: `${item.itemId} must remain inside the Room.`, itemIds: [item.itemId] });
    }
  }

  const solidItems = measurableItems.filter((item) => CATALOGUE_BY_ID.get(item.catalogueItemId)?.solid);
  for (let leftIndex = 0; leftIndex < solidItems.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < solidItems.length; rightIndex += 1) {
      const leftItem = solidItems[leftIndex];
      const rightItem = solidItems[rightIndex];
      if (intersects(footprint(leftItem)!, footprint(rightItem)!)) {
        const itemIds = [leftItem.itemId, rightItem.itemId].sort();
        overlapViolations.push({ code: 'ITEM_OVERLAP', message: `${itemIds.join(' and ')} overlap.`, itemIds });
      }
    }
  }

  for (const item of solidItems) {
    const rect = footprint(item)!;
    if (intersectsEntranceSwing(rect, room)) openingViolations.push({ code: 'OPENING_CLEARANCE', message: `${item.itemId} enters the entrance Door Swing.`, itemIds: [item.itemId], openingIds: [room.entranceOpeningId] });
    for (const zone of circulationZones(room)) {
      if (intersects(rect, zone)) circulationViolations.push({ code: 'CIRCULATION_BLOCKED', message: `${item.itemId} blocks the 900 mm ${zone.zoneId}.`, itemIds: [item.itemId], routeZoneIds: [zone.zoneId] });
    }
  }

  groups.push(
    ['catalogue', catalogueViolations, { checkedItemCount: candidateItems.length, requireVerified }],
    ['rotation', rotationViolations, { supportedRotations: [0, 90, 180, 270] }],
    ['identity', identityViolations, { uniqueItemCount: seenIds.size }],
    ['locks', lockViolations, { lockedItemIds: lockedItems.map((item) => item.itemId) }],
    ['containment', containmentViolations, { room: { widthMm: room.widthMm, depthMm: room.depthMm } }],
    ['solid-separation', overlapViolations, { solidItemCount: solidItems.length }],
    ['opening-clearance', openingViolations, { openingIds: room.openings.map((opening) => opening.openingId) }],
    ['circulation', circulationViolations, { minimumWidthMm: 900, routeZoneIds: ['south-leg', 'east-leg'] }],
  );
  const violations = stableViolations(groups.flatMap(([, entries]) => entries));
  return {
    ok: true,
    revision,
    valid: violations.length === 0,
    candidateFingerprint: fingerprint(candidateItems),
    checks: groups.map(([checkId, entries, evidence]) => ({ checkId, passed: entries.length === 0, violationCount: entries.length, evidence })),
    violations,
  };
}

export function createPreparedState(revision = 1): PlannerState {
  return {
    schemaVersion: 1,
    revision,
    catalogueVersion: 'kenney-furniture-kit-1.0+verified-1',
    room: clone(PREPARED_ROOM),
    workingLayout: { items: [] },
    variants: [],
  };
}

export function planPreparedVariant(state: PlannerState, intent: LayoutIntent): PlannerResult<{ items: PlacedItem[]; validation: ValidationResult }> {
  const lockedItems = state.workingLayout.items.filter((item) => item.locked);
  const lockedById = new Map(lockedItems.map((item) => [item.itemId, item]));
  const candidateItems = PREPARED_TEMPLATES[intent].map((templateItem) => clone(lockedById.get(templateItem.itemId) ?? templateItem));
  for (const lockedItem of lockedItems) {
    if (!candidateItems.some((item) => item.itemId === lockedItem.itemId)) candidateItems.push(clone(lockedItem));
  }
  const validation = validateCandidateLayout({ revision: state.revision, room: state.room, candidateItems, lockedItems, requireVerified: true });
  if (!validation.valid) {
    return { ok: false, revision: state.revision, error: { code: 'NO_VALID_PREPARED_TEMPLATE', message: `The ${intent} template conflicts with the current hard constraints.`, violations: validation.violations } };
  }
  return { ok: true, revision: state.revision, items: candidateItems, validation };
}

function fingerprint(items: PlacedItem[]) {
  const source = JSON.stringify(items);
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function buildExportSvg(state: PlannerState) {
  const scale = 0.1;
  const width = state.room.widthMm * scale;
  const height = state.room.depthMm * scale;
  const items = state.workingLayout.items.map((item) => {
    const rect = footprint(item);
    if (!rect) return '';
    const definition = CATALOGUE_BY_ID.get(item.catalogueItemId)!;
    const fill = definition.solid ? '#e5dfcf' : '#7657ff18';
    return `<g data-item-id="${item.itemId}"><rect x="${rect.left * scale}" y="${rect.top * scale}" width="${(rect.right - rect.left) * scale}" height="${(rect.bottom - rect.top) * scale}" rx="6" fill="${fill}" stroke="#292925"/><text x="${item.xMm * scale}" y="${item.yMm * scale}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="9">${definition.name}</text></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width + 40}" height="${height + 40}" viewBox="-20 -20 ${width + 40} ${height + 40}"><rect width="${width}" height="${height}" fill="#fffdf7" stroke="#1d1d1a" stroke-width="6"/>${items}</svg>`;
}

export class PlannerService {
  private state = createPreparedState();
  private history: PlannerState[] = [];
  private listeners = new Set<() => void>();
  private activity: ActivityEntry[] = [
    { actor: 'system', action: 'Prepared Room is ready', revision: 1, at: 'now' },
    { actor: 'agent', action: 'ChatGPT can read the Room', revision: 1, at: 'now' },
  ];
  private webMcpStatus: WebMcpStatus = 'checking';
  private snapshot = this.makeSnapshot();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.snapshot;
  getServerSnapshot = () => this.snapshot;

  private makeSnapshot(): PlannerSnapshot {
    return {
      state: clone(this.state),
      validation: validateCandidateLayout({ revision: this.state.revision, room: this.state.room, candidateItems: this.state.workingLayout.items }),
      activity: clone(this.activity),
      canUndo: this.history.length > 0,
      webMcpStatus: this.webMcpStatus,
    };
  }

  private publish() {
    this.snapshot = this.makeSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  private stale(expectedRevision: number): PlannerFailure | null {
    if (expectedRevision === this.state.revision) return null;
    return { ok: false, revision: this.state.revision, error: { code: 'STALE_REVISION', message: `Expected revision ${expectedRevision}, current revision is ${this.state.revision}.` } };
  }

  private commit(next: PlannerState, actor: Actor, action: string) {
    this.history.push(clone(this.state));
    next.revision = this.state.revision + 1;
    this.state = next;
    this.activity.unshift({ actor, action, revision: next.revision, at: 'now' });
    this.activity = this.activity.slice(0, 6);
    this.publish();
    return next.revision;
  }

  setWebMcpStatus(status: WebMcpStatus) {
    if (this.webMcpStatus === status) return;
    this.webMcpStatus = status;
    this.publish();
  }

  readPlannerState() {
    return {
      ok: true as const,
      revision: this.state.revision,
      state: clone(this.state),
      layoutVerifiedCatalogue: clone(VERIFIED_CATALOGUE),
      catalogueCount: CATALOGUE.length,
      validation: validateCandidateLayout({ revision: this.state.revision, room: this.state.room, candidateItems: this.state.workingLayout.items }),
      canUndo: this.history.length > 0,
      supportedIntents: ['conversation', 'media'] as LayoutIntent[],
      supportedRotations: [0, 90, 180, 270] as Rotation[],
    };
  }

  validateCandidate(expectedRevision: number, items: PlacedItem[]): PlannerResult<{ valid: boolean; checks: ValidationCheck[]; violations: Violation[]; candidateFingerprint: string }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const validation = validateCandidateLayout({ revision: this.state.revision, room: this.state.room, candidateItems: items, lockedItems: this.state.workingLayout.items.filter((item) => item.locked), requireVerified: true });
    return { ok: true, revision: this.state.revision, valid: validation.valid, checks: validation.checks, violations: validation.violations, candidateFingerprint: validation.candidateFingerprint };
  }

  commitVariant(input: { expectedRevision: number; variantId: string; name: string; intent: LayoutIntent; items: PlacedItem[] }, actor: Actor = 'agent'): PlannerResult<{ variant: Variant; validation: ValidationResult }> {
    const stale = this.stale(input.expectedRevision);
    if (stale) return stale;
    if (this.state.variants.some((variant) => variant.variantId === input.variantId || variant.name.toLowerCase() === input.name.toLowerCase())) {
      return { ok: false, revision: this.state.revision, error: { code: 'DUPLICATE_VARIANT', message: 'Variant IDs and names must be unique.' } };
    }
    const validation = validateCandidateLayout({ revision: this.state.revision, room: this.state.room, candidateItems: input.items, lockedItems: this.state.workingLayout.items.filter((item) => item.locked), requireVerified: true });
    if (!validation.valid) return { ok: false, revision: this.state.revision, error: { code: 'INVALID_LAYOUT', message: 'The candidate layout is invalid.', violations: validation.violations } };
    const variant: Variant = { variantId: input.variantId, name: input.name, intent: input.intent, createdAtRevision: this.state.revision + 1, items: clone(input.items) };
    const next = clone(this.state);
    next.workingLayout.items = clone(input.items);
    next.variants.push(variant);
    const revision = this.commit(next, actor, `Created ${input.name}`);
    return { ok: true, revision, variant: clone(variant), validation: { ...validation, revision } };
  }

  commitPreparedVariant(intent: LayoutIntent, actor: Actor = 'agent'): PlannerResult<{ variant: Variant; validation: ValidationResult }> {
    const plan = planPreparedVariant(this.state, intent);
    if (!plan.ok) return plan;
    return this.commitVariant({ expectedRevision: this.state.revision, variantId: `${intent}-${this.state.revision + 1}`, name: intent === 'conversation' ? 'Conversation Variant' : 'Media Variant', intent, items: plan.items }, actor);
  }

  moveSofaToMediaPose(expectedRevision: number): PlannerResult<{ changedItemIds: string[]; removedItemIds: string[] }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const sofa = this.state.workingLayout.items.find((item) => item.itemId === 'sofa-1');
    if (!sofa) return { ok: false, revision: this.state.revision, error: { code: 'ITEM_NOT_FOUND', message: 'The standard sofa is not in the Working Layout.' } };
    if (sofa.locked) return { ok: false, revision: this.state.revision, error: { code: 'LOCKED_ITEM_CHANGED', message: 'Unlock the sofa before moving it.' } };
    const removedItemIds = ['media-console-1', 'floor-lamp-1'];
    const items = this.state.workingLayout.items
      .filter((item) => !removedItemIds.includes(item.itemId))
      .map((item) => item.itemId === sofa.itemId ? { ...item, xMm: 750, yMm: 2250, rotationDeg: 270 as Rotation } : item);
    const validation = validateCandidateLayout({ revision: this.state.revision, room: this.state.room, candidateItems: items });
    if (!validation.valid) return { ok: false, revision: this.state.revision, error: { code: 'INVALID_LAYOUT', message: 'The sofa cannot be moved there while keeping a Valid Layout.', violations: validation.violations } };
    const next = clone(this.state);
    next.workingLayout.items = items;
    const revision = this.commit(next, 'human', 'Moved the sofa west and cleared two unlocked items');
    return { ok: true, revision, changedItemIds: [sofa.itemId], removedItemIds };
  }

  setItemLock(expectedRevision: number, itemId: string, locked: boolean, actor: Actor = 'human'): PlannerResult<{ item: PlacedItem }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const item = this.state.workingLayout.items.find((entry) => entry.itemId === itemId);
    if (!item) return { ok: false, revision: this.state.revision, error: { code: 'ITEM_NOT_FOUND', message: `${itemId} is not in the Working Layout.` } };
    const next = clone(this.state);
    const nextItem = next.workingLayout.items.find((entry) => entry.itemId === itemId)!;
    nextItem.locked = locked;
    const revision = this.commit(next, actor, `${locked ? 'Locked' : 'Unlocked'} ${CATALOGUE_BY_ID.get(item.catalogueItemId)?.name ?? itemId}`);
    return { ok: true, revision, item: clone(nextItem) };
  }

  removeItem(expectedRevision: number, itemId: string, actor: Actor = 'human'): PlannerResult<{ removedItemId: string }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const item = this.state.workingLayout.items.find((entry) => entry.itemId === itemId);
    if (!item) return { ok: false, revision: this.state.revision, error: { code: 'ITEM_NOT_FOUND', message: `${itemId} is not in the Working Layout.` } };
    if (item.locked) return { ok: false, revision: this.state.revision, error: { code: 'LOCKED_ITEM_CHANGED', message: 'Unlock the item before removing it.' } };
    const items = this.state.workingLayout.items.filter((entry) => entry.itemId !== itemId);
    const validation = validateCandidateLayout({
      revision: this.state.revision,
      room: this.state.room,
      candidateItems: items,
      lockedItems: this.state.workingLayout.items.filter((entry) => entry.locked),
    });
    if (!validation.valid) return { ok: false, revision: this.state.revision, error: { code: 'INVALID_LAYOUT', message: 'Removing that item would invalidate the Working Layout.', violations: validation.violations } };
    const next = clone(this.state);
    next.workingLayout.items = clone(items);
    const revision = this.commit(next, actor, `Removed ${CATALOGUE_BY_ID.get(item.catalogueItemId)?.name ?? itemId}`);
    return { ok: true, revision, removedItemId: itemId };
  }

  addCatalogueItem(expectedRevision: number, catalogueItemId: string): PlannerResult<{ item: PlacedItem }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const definition = CATALOGUE_BY_ID.get(catalogueItemId);
    if (!definition) return { ok: false, revision: this.state.revision, error: { code: 'UNKNOWN_ITEM', message: `Unknown catalogue item ${catalogueItemId}.` } };
    const item: PlacedItem = { itemId: `manual-${Date.now()}`, catalogueItemId, xMm: Math.round(this.state.room.widthMm / 2), yMm: Math.round(this.state.room.depthMm / 2), rotationDeg: 0, locked: false };
    const items = [...clone(this.state.workingLayout.items), item];
    const validation = validateCandidateLayout({ revision: this.state.revision, room: this.state.room, candidateItems: items });
    if (!validation.valid) return { ok: false, revision: this.state.revision, error: { code: 'NO_VALID_DEFAULT_POSITION', message: 'The centre placement is blocked. Clear space before adding this item.', violations: validation.violations } };
    const next = clone(this.state);
    next.workingLayout.items = items;
    const revision = this.commit(next, 'human', `Added ${definition.name}`);
    return { ok: true, revision, item };
  }

  updateRoom(expectedRevision: number, widthMm: number, depthMm: number): PlannerResult<{ room: Room }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    if (widthMm < 2500 || widthMm > 12000 || depthMm < 2500 || depthMm > 12000) return { ok: false, revision: this.state.revision, error: { code: 'ROOM_SIZE_OUT_OF_RANGE', message: 'Room dimensions must be between 2.5 and 12 metres.' } };
    const next = clone(this.state);
    next.room.widthMm = widthMm;
    next.room.depthMm = depthMm;
    const validation = validateCandidateLayout({ revision: this.state.revision, room: next.room, candidateItems: next.workingLayout.items });
    if (!validation.valid) return { ok: false, revision: this.state.revision, error: { code: 'INVALID_LAYOUT', message: 'That Room size would invalidate the Working Layout.', violations: validation.violations } };
    const revision = this.commit(next, 'human', `Resized the Room to ${(widthMm / 1000).toFixed(1)} × ${(depthMm / 1000).toFixed(1)} m`);
    return { ok: true, revision, room: clone(next.room) };
  }

  updateOpenings(expectedRevision: number, openings: Opening[]): PlannerResult<{ room: Room }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const ids = new Set(openings.map((opening) => opening.openingId));
    if (ids.size !== openings.length) return { ok: false, revision: this.state.revision, error: { code: 'DUPLICATE_OPENING_ID', message: 'Opening IDs must be unique.' } };
    if (!ids.has(this.state.room.entranceOpeningId) || !ids.has(this.state.room.balconyOpeningId)) return { ok: false, revision: this.state.revision, error: { code: 'REQUIRED_OPENING_MISSING', message: 'The designated entrance and balcony openings must remain.' } };
    for (const opening of openings) {
      const wallLength = opening.wall === 'north' || opening.wall === 'south' ? this.state.room.widthMm : this.state.room.depthMm;
      if (opening.startMm < 0 || opening.endMm <= opening.startMm || opening.endMm > wallLength) return { ok: false, revision: this.state.revision, error: { code: 'OPENING_OUT_OF_RANGE', message: `${opening.openingId} must fit on its selected wall.` } };
    }
    const next = clone(this.state);
    next.room.openings = clone(openings);
    const validation = validateCandidateLayout({ revision: this.state.revision, room: next.room, candidateItems: next.workingLayout.items });
    if (!validation.valid) return { ok: false, revision: this.state.revision, error: { code: 'INVALID_LAYOUT', message: 'Those openings would invalidate the Working Layout.', violations: validation.violations } };
    const revision = this.commit(next, 'human', 'Updated the Room openings');
    return { ok: true, revision, room: clone(next.room) };
  }

  configureRoom(expectedRevision: number, room: Room): PlannerResult<{ room: Room }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    if (room.widthMm < 2500 || room.widthMm > 12000 || room.depthMm < 2500 || room.depthMm > 12000) return { ok: false, revision: this.state.revision, error: { code: 'ROOM_SIZE_OUT_OF_RANGE', message: 'Room dimensions must be between 2.5 and 12 metres.' } };
    const ids = new Set(room.openings.map((opening) => opening.openingId));
    if (ids.size !== room.openings.length) return { ok: false, revision: this.state.revision, error: { code: 'DUPLICATE_OPENING_ID', message: 'Opening IDs must be unique.' } };
    if (!ids.has(room.entranceOpeningId) || !ids.has(room.balconyOpeningId)) return { ok: false, revision: this.state.revision, error: { code: 'REQUIRED_OPENING_MISSING', message: 'The designated entrance and balcony openings must remain.' } };
    for (const opening of room.openings) {
      const wallLength = opening.wall === 'north' || opening.wall === 'south' ? room.widthMm : room.depthMm;
      if (opening.startMm < 0 || opening.endMm <= opening.startMm || opening.endMm > wallLength) return { ok: false, revision: this.state.revision, error: { code: 'OPENING_OUT_OF_RANGE', message: `${opening.openingId} must fit on its selected wall.` } };
    }
    const next = clone(this.state);
    next.room = clone(room);
    const validation = validateCandidateLayout({ revision: this.state.revision, room: next.room, candidateItems: next.workingLayout.items });
    if (!validation.valid) return { ok: false, revision: this.state.revision, error: { code: 'INVALID_LAYOUT', message: 'That Room configuration would invalidate the Working Layout.', violations: validation.violations } };
    const revision = this.commit(next, 'human', `Updated the Room to ${(room.widthMm / 1000).toFixed(1)} × ${(room.depthMm / 1000).toFixed(1)} m`);
    return { ok: true, revision, room: clone(next.room) };
  }

  loadVariant(expectedRevision: number, variantId: string): PlannerResult<{ variant: Variant }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const variant = this.state.variants.find((entry) => entry.variantId === variantId);
    if (!variant) return { ok: false, revision: this.state.revision, error: { code: 'VARIANT_NOT_FOUND', message: `${variantId} does not exist.` } };
    const next = clone(this.state);
    next.workingLayout.items = clone(variant.items);
    const revision = this.commit(next, 'human', `Loaded ${variant.name}`);
    return { ok: true, revision, variant: clone(variant) };
  }

  undo(expectedRevision: number): PlannerResult<{ state: PlannerState }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const previous = this.history.pop();
    if (!previous) return { ok: false, revision: this.state.revision, error: { code: 'NOTHING_TO_UNDO', message: 'There is no successful change to undo.' } };
    previous.revision = this.state.revision + 1;
    this.state = previous;
    this.activity.unshift({ actor: 'human', action: 'Undid the last change', revision: previous.revision, at: 'now' });
    this.activity = this.activity.slice(0, 6);
    this.publish();
    return { ok: true, revision: previous.revision, state: clone(previous) };
  }

  exportWorkingLayout(expectedRevision: number): PlannerResult<{ filename: string; mimeType: 'image/svg+xml'; svg: string }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    return { ok: true, revision: this.state.revision, filename: 'furnish-working-layout.svg', mimeType: 'image/svg+xml', svg: buildExportSvg(this.state) };
  }

  resetDemo(expectedRevision: number): PlannerResult<{ state: PlannerState }> {
    const stale = this.stale(expectedRevision);
    if (stale) return stale;
    const next = createPreparedState(this.state.revision);
    const revision = this.commit(next, 'human', 'Reset the Prepared Room');
    return { ok: true, revision, state: clone(this.state) };
  }
}

export const plannerService = new PlannerService();
