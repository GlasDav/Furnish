import assert from 'node:assert/strict';
import test from 'node:test';

import { CATALOGUE, PREPARED_TEMPLATES } from '../lib/planner.ts';

void test('Room plans expose a readable label for every placed item', async () => {
  const labelModule = await import('../components/room-labels.ts').catch(() => null);

  assert.ok(labelModule, 'Room-plan label rendering is missing');

  const labels = labelModule.createFurnitureLabels(PREPARED_TEMPLATES.media, CATALOGUE, true);

  assert.equal(labels.length, PREPARED_TEMPLATES.media.length);
  assert.deepEqual(labels.find((label) => label.itemId === 'sofa-1')?.lines, ['Standard sofa']);
  assert.ok((labels.find((label) => label.itemId === 'side-table-1')?.lines.length ?? 0) > 1);

  for (const [index, label] of labels.entries()) {
    const bounds = {
      left: label.x - label.width / 2,
      right: label.x + label.width / 2,
      top: label.y - label.height / 2,
      bottom: label.y + label.height / 2,
    };

    for (const other of labels.slice(index + 1)) {
      const overlaps = bounds.left < other.x + other.width / 2
        && bounds.right > other.x - other.width / 2
        && bounds.top < other.y + other.height / 2
        && bounds.bottom > other.y - other.height / 2;
      assert.equal(overlaps, false, `${label.name} overlaps ${other.name}`);
    }
  }
});
