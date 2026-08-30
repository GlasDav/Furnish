import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CATALOGUE,
  PlannerService,
  PREPARED_ROOM,
  PREPARED_TEMPLATES,
  VERIFIED_CATALOGUE,
  validateCandidateLayout,
} from '../lib/planner.ts';

void test('catalogue exposes all 140 Kenney models and exactly 16 Layout-Verified items', () => {
  assert.equal(CATALOGUE.length, 140);
  assert.equal(VERIFIED_CATALOGUE.length, 16);
  assert.equal(new Set(CATALOGUE.map((item) => item.sourceModel)).size, 140);
});

void test('judge workflow preserves the moved and Locked sofa across two valid Variants', () => {
  const service = new PlannerService();

  const conversation = service.commitPreparedVariant('conversation');
  assert.equal(conversation.ok, true);
  assert.equal(conversation.revision, 2);

  const moved = service.moveSofaToMediaPose(2);
  assert.equal(moved.ok, true);
  assert.deepEqual(moved.ok && moved.removedItemIds, ['media-console-1', 'floor-lamp-1']);

  const locked = service.setItemLock(3, 'sofa-1', true);
  assert.equal(locked.ok, true);

  const media = service.commitPreparedVariant('media');
  assert.equal(media.ok, true);
  assert.equal(media.revision, 5);

  const snapshot = service.getSnapshot();
  assert.equal(snapshot.validation.valid, true);
  assert.equal(snapshot.state.variants.length, 2);
  const sofa = snapshot.state.workingLayout.items.find((item) => item.itemId === 'sofa-1');
  assert.deepEqual(sofa, {
    itemId: 'sofa-1',
    catalogueItemId: 'sofa-standard',
    xMm: 750,
    yMm: 2250,
    rotationDeg: 270,
    locked: true,
  });

  const exported = service.exportWorkingLayout(5);
  assert.equal(exported.ok, true);
  assert.match(exported.ok ? exported.svg : '', /data-item-id="sofa-1"/);
  assert.equal(service.getSnapshot().state.revision, 5);
});

void test('validator rejects overlap, out of bounds, route blocking, and Locked Item changes', () => {
  const overlap = structuredClone(PREPARED_TEMPLATES.conversation);
  Object.assign(overlap.find((item) => item.itemId === 'plant-1')!, { xMm: 3150, yMm: 2000 });
  const overlapResult = validateCandidateLayout({ revision: 1, room: PREPARED_ROOM, candidateItems: overlap, requireVerified: true });
  assert.equal(overlapResult.valid, false);
  assert.ok(overlapResult.violations.some((entry) => entry.code === 'ITEM_OVERLAP'));

  const outOfBounds = structuredClone(PREPARED_TEMPLATES.conversation);
  Object.assign(outOfBounds.find((item) => item.itemId === 'plant-1')!, { xMm: 5900 });
  const boundsResult = validateCandidateLayout({ revision: 1, room: PREPARED_ROOM, candidateItems: outOfBounds, requireVerified: true });
  assert.ok(boundsResult.violations.some((entry) => entry.code === 'OUT_OF_BOUNDS'));

  const routeBlocked = structuredClone(PREPARED_TEMPLATES.conversation);
  Object.assign(routeBlocked.find((item) => item.itemId === 'plant-1')!, { xMm: 5550, yMm: 3000 });
  const routeResult = validateCandidateLayout({ revision: 1, room: PREPARED_ROOM, candidateItems: routeBlocked, requireVerified: true });
  assert.ok(routeResult.violations.some((entry) => entry.code === 'CIRCULATION_BLOCKED'));

  const lockedSofa = structuredClone(PREPARED_TEMPLATES.media.find((item) => item.itemId === 'sofa-1')!);
  const changedLock = structuredClone(PREPARED_TEMPLATES.media);
  Object.assign(changedLock.find((item) => item.itemId === 'sofa-1')!, { xMm: 800 });
  const lockResult = validateCandidateLayout({ revision: 1, room: PREPARED_ROOM, candidateItems: changedLock, lockedItems: [lockedSofa], requireVerified: true });
  assert.ok(lockResult.violations.some((entry) => entry.code === 'LOCKED_ITEM_CHANGED'));
});

void test('stale writes and invalid Locked Item commits leave state unchanged', () => {
  const service = new PlannerService();
  assert.equal(service.commitPreparedVariant('conversation').ok, true);

  const stale = service.setItemLock(1, 'sofa-1', true);
  assert.equal(stale.ok, false);
  assert.equal(stale.ok ? '' : stale.error.code, 'STALE_REVISION');
  assert.equal(service.getSnapshot().state.revision, 2);

  assert.equal(service.moveSofaToMediaPose(2).ok, true);
  assert.equal(service.setItemLock(3, 'sofa-1', true).ok, true);
  const changedMedia = structuredClone(PREPARED_TEMPLATES.media);
  Object.assign(changedMedia.find((item) => item.itemId === 'sofa-1')!, { xMm: 800 });
  const rejected = service.commitVariant({
    expectedRevision: 4,
    variantId: 'changed-media',
    name: 'Changed Media',
    intent: 'media',
    items: changedMedia,
  });
  assert.equal(rejected.ok, false);
  assert.equal(rejected.ok ? '' : rejected.error.code, 'INVALID_LAYOUT');
  assert.equal(service.getSnapshot().state.revision, 4);
});

void test('undo restores the complete previous state at a higher revision', () => {
  const service = new PlannerService();
  assert.equal(service.commitPreparedVariant('conversation').ok, true);
  const undone = service.undo(2);
  assert.equal(undone.ok, true);
  assert.equal(undone.revision, 3);
  assert.equal(service.getSnapshot().state.workingLayout.items.length, 0);
  assert.equal(service.getSnapshot().state.variants.length, 0);
});

void test('removing an unlocked item updates the Working Layout and undo restores it', () => {
  const service = new PlannerService();
  assert.equal(service.commitPreparedVariant('conversation').ok, true);

  const removed = service.removeItem(2, 'armchair-1');
  assert.equal(removed.ok, true);
  assert.equal(removed.revision, 3);
  assert.equal(service.getSnapshot().state.workingLayout.items.some((item) => item.itemId === 'armchair-1'), false);
  assert.equal(service.getSnapshot().state.variants[0]?.items.some((item) => item.itemId === 'armchair-1'), true);
  assert.equal(service.getSnapshot().activity[0]?.action, 'Removed Armchair');

  const undone = service.undo(3);
  assert.equal(undone.ok, true);
  assert.equal(service.getSnapshot().state.workingLayout.items.some((item) => item.itemId === 'armchair-1'), true);
});

void test('removing a Locked Item is rejected without changing state', () => {
  const service = new PlannerService();
  assert.equal(service.commitPreparedVariant('conversation').ok, true);
  assert.equal(service.setItemLock(2, 'sofa-1', true).ok, true);

  const removed = service.removeItem(3, 'sofa-1');
  assert.equal(removed.ok, false);
  assert.equal(removed.error?.code, 'LOCKED_ITEM_CHANGED');
  assert.equal(service.getSnapshot().state.revision, 3);
  assert.equal(service.getSnapshot().state.workingLayout.items.some((item) => item.itemId === 'sofa-1'), true);
});
