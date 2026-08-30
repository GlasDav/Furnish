import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

void test('RoomCanvas exposes pointer-driven furniture movement', async () => {
  const source = await readFile(new URL('../components/room-canvas.tsx', import.meta.url), 'utf8');

  assert.match(source, /onItemMove/);
  assert.match(source, /setPointerCapture/);
  assert.match(source, /releasePointerCapture/);
});

void test('the planner uses one guided placement mode for add, move, and rotate', async () => {
  const source = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

  assert.match(source, /placementDraft/);
  assert.match(source, /beginCataloguePlacement/);
  assert.match(source, /beginItemPlacement/);
  assert.match(source, /confirmPlacement/);
  assert.match(source, /Rotate 90°/);
  assert.match(source, /Place item|Apply move/);
});

void test('entering guided placement keeps the canvas geometry stable during a drag', async () => {
  const source = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /\.studio-grid\.placement-active\s*\{[^}]*grid-template-columns/);
  assert.doesNotMatch(source, /\.placement-active \.inspector\s*\{[^}]*display:\s*none/);
});
