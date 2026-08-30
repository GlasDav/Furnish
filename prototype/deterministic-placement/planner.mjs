const ROOM_WIDTH_MM = 6_000;
const ROOM_DEPTH_MM = 4_500;

export const preparedRoom = Object.freeze({
  widthMm: ROOM_WIDTH_MM,
  depthMm: ROOM_DEPTH_MM,
  entranceOpeningId: "entrance",
  balconyOpeningId: "balcony",
  openings: [
    {
      openingId: "entrance",
      type: "door",
      wall: "south",
      startMm: 600,
      endMm: 1_500,
      hinge: { xMm: 1_500, yMm: 4_500 },
      swing: "inward-left",
    },
    {
      openingId: "balcony",
      type: "slider",
      wall: "east",
      startMm: 450,
      endMm: 2_250,
    },
    {
      openingId: "window",
      type: "high-sill-window",
      wall: "north",
      startMm: 2_100,
      endMm: 4_500,
    },
  ],
  circulationRoute: {
    minimumWidthMm: 900,
    zones: [
      { zoneId: "south-leg", left: 600, top: 3_600, right: 6_000, bottom: 4_500 },
      { zoneId: "east-leg", left: 5_100, top: 450, right: 6_000, bottom: 4_500 },
    ],
  },
});

export const catalogue = Object.freeze({
  "sofa-standard": { widthMm: 2_100, depthMm: 900, solid: true, layoutVerified: true },
  armchair: { widthMm: 800, depthMm: 800, solid: true, layoutVerified: true },
  "coffee-rect": { widthMm: 1_200, depthMm: 600, solid: true, layoutVerified: true },
  "side-square": { widthMm: 500, depthMm: 500, solid: true, layoutVerified: true },
  "media-console": { widthMm: 1_500, depthMm: 450, solid: true, layoutVerified: true },
  "rug-large": { widthMm: 2_000, depthMm: 3_000, solid: false, layoutVerified: true },
  "floor-lamp": { widthMm: 400, depthMm: 400, solid: true, layoutVerified: true },
  plant: { widthMm: 500, depthMm: 500, solid: true, layoutVerified: true },
});

const conversationTemplate = [
  item("sofa-1", "sofa-standard", 3_150, 750, 0),
  item("armchair-1", "armchair", 2_200, 3_150, 180),
  item("armchair-2", "armchair", 4_100, 3_150, 180),
  item("coffee-1", "coffee-rect", 3_150, 2_000, 0),
  item("side-table-1", "side-square", 1_750, 750, 0),
  item("side-table-2", "side-square", 4_550, 750, 0),
  item("media-console-1", "media-console", 375, 2_100, 90),
  item("rug-1", "rug-large", 3_150, 2_200, 90),
  item("floor-lamp-1", "floor-lamp", 1_200, 1_250, 0),
  item("plant-1", "plant", 4_800, 1_400, 0),
];

const mediaTemplate = [
  item("sofa-1", "sofa-standard", 750, 2_250, 270),
  item("armchair-1", "armchair", 3_500, 900, 0),
  item("armchair-2", "armchair", 3_500, 3_200, 180),
  item("coffee-1", "coffee-rect", 2_300, 2_100, 0),
  item("side-table-1", "side-square", 1_450, 1_450, 0),
  item("side-table-2", "side-square", 1_450, 3_050, 0),
  item("media-console-1", "media-console", 4_775, 2_250, 90),
  item("rug-1", "rug-large", 2_850, 2_250, 90),
  item("floor-lamp-1", "floor-lamp", 2_200, 3_350, 0),
  item("plant-1", "plant", 4_600, 700, 0),
];

export const templates = Object.freeze({
  conversation: Object.freeze(conversationTemplate),
  media: Object.freeze(mediaTemplate),
});

const violationOrder = [
  "UNKNOWN_ITEM",
  "UNVERIFIED_ITEM",
  "UNSUPPORTED_ROTATION",
  "DUPLICATE_ITEM_ID",
  "LOCKED_ITEM_MISSING",
  "LOCKED_ITEM_CHANGED",
  "OUT_OF_BOUNDS",
  "ITEM_OVERLAP",
  "OPENING_CLEARANCE",
  "CIRCULATION_BLOCKED",
];

function item(itemId, catalogueItemId, xMm, yMm, rotationDeg, locked = false) {
  return { itemId, catalogueItemId, xMm, yMm, rotationDeg, locked };
}

function clone(value) {
  return structuredClone(value);
}

function footprint(placedItem) {
  const definition = catalogue[placedItem.catalogueItemId];
  if (!definition) return null;
  const quarterTurn = placedItem.rotationDeg === 90 || placedItem.rotationDeg === 270;
  const widthMm = quarterTurn ? definition.depthMm : definition.widthMm;
  const depthMm = quarterTurn ? definition.widthMm : definition.depthMm;

  return {
    left: placedItem.xMm - widthMm / 2,
    right: placedItem.xMm + widthMm / 2,
    top: placedItem.yMm - depthMm / 2,
    bottom: placedItem.yMm + depthMm / 2,
  };
}

function intersectsWithArea(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function intersectsEntranceSwing(rect) {
  const swingBounds = { left: 600, top: 3_600, right: 1_500, bottom: 4_500 };
  if (!intersectsWithArea(rect, swingBounds)) return false;

  const nearestX = Math.max(rect.left, Math.min(1_500, rect.right));
  const nearestY = Math.max(rect.top, Math.min(4_500, rect.bottom));
  const dx = 1_500 - nearestX;
  const dy = 4_500 - nearestY;
  return dx * dx + dy * dy < 900 * 900;
}

function sameLockedItem(expected, actual) {
  return (
    expected.itemId === actual.itemId &&
    expected.catalogueItemId === actual.catalogueItemId &&
    expected.xMm === actual.xMm &&
    expected.yMm === actual.yMm &&
    expected.rotationDeg === actual.rotationDeg &&
    actual.locked === true
  );
}

function violation(code, message, details = {}) {
  return { code, message, ...details };
}

function stableViolations(violations) {
  return violations.sort((a, b) => {
    const codeDifference = violationOrder.indexOf(a.code) - violationOrder.indexOf(b.code);
    if (codeDifference !== 0) return codeDifference;
    return JSON.stringify(a).localeCompare(JSON.stringify(b));
  });
}

function check(checkId, violations, evidence) {
  return {
    checkId,
    passed: violations.length === 0,
    violationCount: violations.length,
    evidence,
  };
}

export function validateCandidateLayout({
  revision,
  room = preparedRoom,
  candidateItems,
  lockedItems = [],
}) {
  const catalogueViolations = [];
  const rotationViolations = [];
  const identityViolations = [];
  const lockViolations = [];
  const containmentViolations = [];
  const overlapViolations = [];
  const openingViolations = [];
  const circulationViolations = [];
  const seenIds = new Set();

  for (const placedItem of candidateItems) {
    const definition = catalogue[placedItem.catalogueItemId];
    if (!definition) {
      catalogueViolations.push(
        violation("UNKNOWN_ITEM", `Unknown catalogue item ${placedItem.catalogueItemId}.`, {
          itemIds: [placedItem.itemId],
        }),
      );
      continue;
    }
    if (!definition.layoutVerified) {
      catalogueViolations.push(
        violation("UNVERIFIED_ITEM", `${placedItem.itemId} is not Layout-Verified.`, {
          itemIds: [placedItem.itemId],
        }),
      );
    }
    if (![0, 90, 180, 270].includes(placedItem.rotationDeg)) {
      rotationViolations.push(
        violation("UNSUPPORTED_ROTATION", `${placedItem.itemId} must use a quarter-turn rotation.`, {
          itemIds: [placedItem.itemId],
        }),
      );
    }
    if (seenIds.has(placedItem.itemId)) {
      identityViolations.push(
        violation("DUPLICATE_ITEM_ID", `${placedItem.itemId} occurs more than once.`, {
          itemIds: [placedItem.itemId],
        }),
      );
    }
    seenIds.add(placedItem.itemId);
  }

  for (const lockedItem of lockedItems) {
    const actual = candidateItems.find(({ itemId }) => itemId === lockedItem.itemId);
    if (!actual) {
      lockViolations.push(
        violation("LOCKED_ITEM_MISSING", `${lockedItem.itemId} cannot be removed.`, {
          itemIds: [lockedItem.itemId],
        }),
      );
    } else if (!sameLockedItem(lockedItem, actual)) {
      lockViolations.push(
        violation("LOCKED_ITEM_CHANGED", `${lockedItem.itemId} must keep its catalogue item, pose, and lock.`, {
          itemIds: [lockedItem.itemId],
          expected: lockedItem,
          actual,
        }),
      );
    }
  }

  const measurableItems = candidateItems.filter((placedItem) => footprint(placedItem));
  for (const placedItem of measurableItems) {
    const rect = footprint(placedItem);
    if (rect.left < 0 || rect.top < 0 || rect.right > room.widthMm || rect.bottom > room.depthMm) {
      containmentViolations.push(
        violation("OUT_OF_BOUNDS", `${placedItem.itemId} must remain inside the Room.`, {
          itemIds: [placedItem.itemId],
          footprint: rect,
        }),
      );
    }
  }

  const solidItems = measurableItems.filter(
    (placedItem) => catalogue[placedItem.catalogueItemId].solid,
  );
  for (let leftIndex = 0; leftIndex < solidItems.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < solidItems.length; rightIndex += 1) {
      const leftItem = solidItems[leftIndex];
      const rightItem = solidItems[rightIndex];
      if (intersectsWithArea(footprint(leftItem), footprint(rightItem))) {
        const itemIds = [leftItem.itemId, rightItem.itemId].sort();
        overlapViolations.push(
          violation("ITEM_OVERLAP", `${itemIds.join(" and ")} overlap.`, { itemIds }),
        );
      }
    }
  }

  for (const placedItem of solidItems) {
    const rect = footprint(placedItem);
    if (intersectsEntranceSwing(rect)) {
      openingViolations.push(
        violation("OPENING_CLEARANCE", `${placedItem.itemId} enters the entrance Door Swing.`, {
          itemIds: [placedItem.itemId],
          openingIds: [room.entranceOpeningId],
        }),
      );
    }
    for (const zone of room.circulationRoute.zones) {
      if (intersectsWithArea(rect, zone)) {
        circulationViolations.push(
          violation("CIRCULATION_BLOCKED", `${placedItem.itemId} blocks the 900 mm ${zone.zoneId}.`, {
            itemIds: [placedItem.itemId],
            routeZoneIds: [zone.zoneId],
          }),
        );
      }
    }
  }

  const groups = [
    ["catalogue", catalogueViolations, { checkedItemCount: candidateItems.length }],
    ["rotation", rotationViolations, { supportedRotations: [0, 90, 180, 270] }],
    ["identity", identityViolations, { uniqueItemCount: seenIds.size }],
    ["locks", lockViolations, { lockedItemIds: lockedItems.map(({ itemId }) => itemId) }],
    ["containment", containmentViolations, { room: { widthMm: room.widthMm, depthMm: room.depthMm } }],
    ["solid-separation", overlapViolations, { solidItemCount: solidItems.length }],
    ["opening-clearance", openingViolations, { openingIds: room.openings.map(({ openingId }) => openingId) }],
    ["circulation", circulationViolations, {
      minimumWidthMm: room.circulationRoute.minimumWidthMm,
      routeZoneIds: room.circulationRoute.zones.map(({ zoneId }) => zoneId),
    }],
  ];
  const violations = stableViolations(groups.flatMap(([, entries]) => entries));

  return {
    ok: true,
    revision,
    valid: violations.length === 0,
    candidateFingerprint: fingerprint(candidateItems),
    checks: groups.map(([checkId, entries, evidence]) => check(checkId, entries, evidence)),
    violations,
  };
}

export function planPreparedVariant({ state, intent }) {
  const template = templates[intent];
  if (!template) {
    return {
      ok: false,
      revision: state.revision,
      error: { code: "UNSUPPORTED_INTENT", message: `No prepared template for ${intent}.` },
    };
  }

  const lockedItems = state.workingLayout.items.filter(({ locked }) => locked);
  const lockedById = new Map(lockedItems.map((placedItem) => [placedItem.itemId, placedItem]));
  const trace = [];
  const candidateItems = template.map((templateItem, index) => {
    const lockedItem = lockedById.get(templateItem.itemId);
    trace.push({
      order: index + 1,
      itemId: templateItem.itemId,
      source: lockedItem ? "locked-working-layout" : `${intent}-template`,
    });
    return clone(lockedItem ?? templateItem);
  });

  for (const lockedItem of lockedItems) {
    if (!candidateItems.some(({ itemId }) => itemId === lockedItem.itemId)) {
      candidateItems.push(clone(lockedItem));
      trace.push({
        order: trace.length + 1,
        itemId: lockedItem.itemId,
        source: "locked-working-layout",
      });
    }
  }

  const validation = validateCandidateLayout({
    revision: state.revision,
    room: state.room,
    candidateItems,
    lockedItems,
  });

  if (!validation.valid) {
    return {
      ok: false,
      revision: state.revision,
      error: {
        code: "NO_VALID_PREPARED_TEMPLATE",
        message: `The ${intent} template conflicts with the current hard constraints.`,
        violations: validation.violations,
      },
      placement: { strategy: "ordered-template-with-locked-overlay", trace },
      validation,
    };
  }

  return {
    ok: true,
    revision: state.revision,
    intent,
    items: candidateItems,
    placement: { strategy: "ordered-template-with-locked-overlay", trace },
    validation,
  };
}

export function createPreparedState(items = []) {
  return {
    schemaVersion: 1,
    revision: 7,
    catalogueVersion: "prototype-verified-1",
    room: clone(preparedRoom),
    workingLayout: { items: clone(items) },
    variants: [],
  };
}

export function conversationState() {
  return createPreparedState(templates.conversation);
}

export function movedAndLockedSofaState() {
  const items = clone(templates.conversation);
  const sofa = items.find(({ itemId }) => itemId === "sofa-1");
  Object.assign(sofa, {
    xMm: 750,
    yMm: 2_250,
    rotationDeg: 270,
    locked: true,
  });
  return createPreparedState(items);
}

export function runAcceptanceProbes() {
  const emptyState = createPreparedState();
  const conversation = planPreparedVariant({ state: emptyState, intent: "conversation" });

  const mediaState = movedAndLockedSofaState();
  const media = planPreparedVariant({ state: mediaState, intent: "media" });

  const overlapItems = clone(templates.conversation);
  Object.assign(overlapItems.find(({ itemId }) => itemId === "plant-1"), {
    xMm: 3_150,
    yMm: 2_000,
  });
  const overlap = validateCandidateLayout({
    revision: emptyState.revision,
    candidateItems: overlapItems,
  });

  const outOfBoundsItems = clone(templates.conversation);
  Object.assign(outOfBoundsItems.find(({ itemId }) => itemId === "plant-1"), {
    xMm: 5_900,
    yMm: 1_400,
  });
  const outOfBounds = validateCandidateLayout({
    revision: emptyState.revision,
    candidateItems: outOfBoundsItems,
  });

  const changedLockItems = clone(templates.media);
  Object.assign(changedLockItems.find(({ itemId }) => itemId === "sofa-1"), {
    xMm: 800,
    locked: true,
  });
  const lockedItemChanged = validateCandidateLayout({
    revision: mediaState.revision,
    candidateItems: changedLockItems,
    lockedItems: mediaState.workingLayout.items.filter(({ locked }) => locked),
  });

  const blockedRouteItems = clone(templates.conversation);
  Object.assign(blockedRouteItems.find(({ itemId }) => itemId === "plant-1"), {
    xMm: 5_550,
    yMm: 3_000,
  });
  const circulationBlocked = validateCandidateLayout({
    revision: emptyState.revision,
    candidateItems: blockedRouteItems,
  });

  const probes = {
    conversation: summarizeProbe(conversation, true),
    mediaWithLockedSofa: summarizeProbe(media, true),
    overlapRejected: summarizeProbe(overlap, false, "ITEM_OVERLAP"),
    outOfBoundsRejected: summarizeProbe(outOfBounds, false, "OUT_OF_BOUNDS"),
    lockedItemChangeRejected: summarizeProbe(lockedItemChanged, false, "LOCKED_ITEM_CHANGED"),
    circulationBlockedRejected: summarizeProbe(circulationBlocked, false, "CIRCULATION_BLOCKED"),
  };

  return {
    passed: Object.values(probes).every(({ passed }) => passed),
    approach: "ordered intent templates + Locked Item overlay + atomic deterministic validation",
    probes,
  };
}

function summarizeProbe(result, expectedValid, expectedCode) {
  const validation = result.validation ?? result;
  const actualValid = result.ok === false ? false : validation.valid;
  const violationCodes = validation.violations?.map(({ code }) => code) ?? [];
  return {
    passed: actualValid === expectedValid && (!expectedCode || violationCodes.includes(expectedCode)),
    expectedValid,
    actualValid,
    expectedCode: expectedCode ?? null,
    violationCodes,
    candidateFingerprint: validation.candidateFingerprint ?? null,
  };
}

function fingerprint(items) {
  const source = JSON.stringify(items);
  let hash = 2_166_136_261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
