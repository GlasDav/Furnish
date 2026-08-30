import assert from 'node:assert/strict';
import test from 'node:test';

import { CATALOGUE, PREPARED_TEMPLATES } from '../lib/planner.ts';

void test('Room plans expose a readable label for every placed item', async () => {
  const labelModule = await import('../components/room-labels.ts').catch(() => null);

  assert.ok(labelModule, 'Room-plan label rendering is missing');

  const labels = labelModule.createFurnitureLabels(PREPARED_TEMPLATES.media, CATALOGUE);

  assert.equal(labels.length, PREPARED_TEMPLATES.media.length);
  assert.deepEqual(labels.find((label) => label.itemId === 'sofa-1'), {
    itemId: 'sofa-1',
    name: 'Standard sofa',
    x: 95,
    y: 245,
  });
});
