import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const homepage = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the first-contact explainer stays hidden until it is approved', () => {
  const openingTag = homepage.match(/<div\s+class="wrap first-step"[^>]*>/)?.[0] || '';

  assert.match(openingTag, /\shidden(?:\s|>|=)/);
});
