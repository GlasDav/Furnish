import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pageSource = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');

void test('the planner has no scripted agent-turn workflow', () => {
  assert.doesNotMatch(pageSource, /Agent turn/);
  assert.doesNotMatch(pageSource, /Create Conversation Variant/);
  assert.doesNotMatch(pageSource, /Judge workflow progress/);
});

void test('the planner presents passive shared-workspace guidance and direct export', () => {
  assert.match(pageSource, /Shared workspace/);
  assert.match(pageSource, /ChatGPT can read and update this planner through Site tools/);
  assert.match(pageSource, />Export SVG</);
});
