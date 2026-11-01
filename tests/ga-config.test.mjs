import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/ga-config.js', import.meta.url), 'utf8');

function run({ search = '', hostname = 'tingyumusic.com', stored = null } = {}) {
  const store = new Map();
  if (stored !== null) store.set('tt_internal', stored);
  const dataLayer = [];
  const appended = [];
  const document = {
    head: { appendChild(el) { appended.push(el); } },
    createElement() { return { async: false, src: '' }; }
  };
  const window = { dataLayer, location: { search, hostname }, document };
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); },
    removeItem(key) { store.delete(key); }
  };
  vm.runInNewContext(source, { window, document, localStorage, URLSearchParams, Date });
  return { dataLayer, appended, store };
}

function configCall(dataLayer) {
  return [...dataLayer].find(entry => entry[0] === 'config');
}

test('?internal=1 remembers the visit and marks production traffic internal', () => {
  const { dataLayer, appended, store } = run({ search: '?internal=1' });

  assert.equal(store.get('tt_internal'), '1');
  assert.equal(appended.length, 1);
  assert.match(appended[0].src, /G-JE1G1W4X4V/);
  assert.equal(configCall(dataLayer)[1], 'G-JE1G1W4X4V');
  assert.equal(configCall(dataLayer)[2].traffic_type, 'internal');
});

test('?internal=0 clears the flag and stops sending traffic_type', () => {
  const { dataLayer, store } = run({ search: '?internal=0', stored: '1' });

  assert.equal(store.has('tt_internal'), false);
  assert.equal(configCall(dataLayer)[2].traffic_type, undefined);
});

test('a remembered flag still marks later production visits', () => {
  const { dataLayer } = run({ search: '', stored: '1' });

  assert.equal(configCall(dataLayer)[2].traffic_type, 'internal');
});

test('the flag is stored on localhost but gtag is not loaded', () => {
  const { dataLayer, appended, store } = run({ search: '?internal=1', hostname: '127.0.0.1' });

  assert.equal(store.get('tt_internal'), '1');
  assert.equal(appended.length, 0);
  assert.equal(dataLayer.length, 0);
});
