import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const homepage = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('homepage sections follow the conversion order', () => {
  const sectionIds = [...homepage.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)]
    .map(match => match[1]);

  assert.deepEqual(sectionIds, ['top', 'courses', 'results', 'teacher', 'journal', 'faq', 'contact']);
});

test('navigation follows the visible homepage order', () => {
  const nav = homepage.match(/<div class="nav-links">([\s\S]*?)<\/div>/)?.[1] || '';
  const destinations = [...nav.matchAll(/href="([^"]+)"/g)].map(match => match[1]);

  assert.deepEqual(destinations, ['#courses', '#results', '#teacher', 'blog/', '#faq']);
});

test('situation heading addresses adults and parents', () => {
  assert.match(homepage, /<h2 class="sec-title">你 \/ 你的孩子是哪一種？<\/h2>/);
});

test('award disclosure has explicit mobile expand and collapse cues', () => {
  assert.match(homepage, /點擊展開 <span id="award-count">26 筆<\/span>完整紀錄/);
  assert.match(homepage, /收起完整紀錄/);
  assert.match(homepage, /@media\(max-width:600px\)\{[\s\S]*?\.aw-toggle\{[^}]*width:100%/);
});

test('video showcase background bleeds to the viewport while content stays wrapped', () => {
  const rule = homepage.match(/\.res-videos\{([^}]*)\}/)?.[1] || '';

  assert.match(rule, /border-radius:0/);
  assert.match(rule, /box-shadow:0 0 0 100vmax var\(--ink\)/);
  assert.match(rule, /clip-path:inset\(0 -100vmax\)/);
  assert.match(homepage, /<section class="results"[^>]*>[\s\S]*?<div class="wrap">[\s\S]*?<div class="res-videos"/);
});

test('video titles reserve two lines until cards switch to one column', () => {
  const titleRule = homepage.match(/\.vid \.t\{([^}]*)\}/)?.[1] || '';

  assert.match(titleRule, /line-height:1\.7/);
  assert.match(titleRule, /min-height:3\.4em/);
  assert.match(homepage, /@media\(max-width:430px\)\{[\s\S]*?\.vid \.t\{min-height:0\}/);
});

test('recital gallery opens with a wide photo followed by nine tiles', () => {
  const gallery = homepage.match(/<div class="gallery" id="gallery">([\s\S]*?)<\/div>/)?.[1] || '';
  const cells = [...gallery.matchAll(/<a class="([^"]+)"/g)].map(match => match[1]);

  assert.equal(cells.length, 10);
  assert.equal(cells[0], 'cell closing');
  assert.equal(cells.at(-1), 'cell closing');
  assert.match(homepage, /\.gallery \.cell\.closing\{grid-column:1\/-1\}/);
  assert.match(homepage, /\.gallery \.cell\.closing img\{aspect-ratio:auto\}/);
});

test('two-column recital gallery uses a full-width landscape final row', () => {
  const twoColumnCss = homepage.match(/@media\(max-width:860px\)\{([\s\S]*?)\n\}\n@media\(max-width:600px\)/)?.[1] || '';

  assert.match(twoColumnCss, /\.gallery \.cell:last-child\{grid-column:1\/-1\}/);
  assert.match(twoColumnCss, /\.gallery \.cell:last-child img\{aspect-ratio:auto\}/);
});

test('lesson copy, the trial offer, and contact links are in the HTML source', () => {
  const withoutScripts = homepage.replace(/<script\b[\s\S]*?<\/script>/g, '');

  assert.match(withoutScripts, /id="situation-beginner"/);
  assert.match(withoutScripts, /id="situation-adult"/);
  assert.match(withoutScripts, /目前第一堂體驗課免費/);
  assert.match(withoutScripts, /href="https:\/\/line\.me\/R\/ti\/p\/%40897rgmut"/);
  assert.match(withoutScripts, /香\* - 鋼琴四級榮獲優良/);
  assert.doesNotMatch(withoutScripts, /香奈/);
});

test('recital gallery renders valid thumbnail paths and landscape bookends', () => {
  const gallery = homepage.match(/<div class="gallery" id="gallery">([\s\S]*?)<\/div>/)?.[1] || '';
  const sources = [...gallery.matchAll(/<img src="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(sources, [
    'assets/gallery-11.jpg',
    'assets/thumb-02.jpg',
    'assets/thumb-03.jpg',
    'assets/thumb-04.jpg',
    'assets/thumb-05.jpg',
    'assets/thumb-06.jpg',
    'assets/thumb-07.jpg',
    'assets/thumb-08.jpg',
    'assets/thumb-09.jpg',
    'assets/gallery-10.jpg',
  ]);
});
