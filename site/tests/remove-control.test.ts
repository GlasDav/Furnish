import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

void test('Selection inspector offers removal for the selected furniture item', async () => {
  const pageSource = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

  assert.match(pageSource, /plannerService\.removeItem\(state\.revision, selectedItem\.itemId\)/);
  assert.match(pageSource, />Remove</);
});
