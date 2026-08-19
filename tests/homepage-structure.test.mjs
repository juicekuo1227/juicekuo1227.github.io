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
  assert.match(homepage, /點擊展開 <span id="award-count"><\/span>完整紀錄/);
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
  assert.match(homepage, /recitalPhotos:\s*\[11,2,3,4,5,6,7,8,9,10\]/);
  assert.match(homepage, /i===0\?' closing':''/);
  assert.match(homepage, /\.gallery \.cell\.closing\{grid-column:1\/-1\}/);
  assert.match(homepage, /\.gallery \.cell\.closing img\{aspect-ratio:auto\}/);
});

test('recital gallery renders valid thumbnail paths and a landscape closing source', () => {
  const recitalPhotos = JSON.parse(homepage.match(/recitalPhotos:\s*(\[[^\]]+\])/)?.[1] || '[]');
  const renderer = homepage.match(/document\.getElementById\('gallery'\)\.innerHTML=[\s\S]*?\.join\(''\);/)?.[0] || '';
  const gallery = { innerHTML: '' };
  const document = { getElementById: id => id === 'gallery' ? gallery : null };

  new Function('document', 'S', 'pad2', renderer)(
    document,
    { recitalPhotos },
    number => String(number).padStart(2, '0'),
  );

  const sources = [...gallery.innerHTML.matchAll(/<img src="([^"]+)"/g)].map(match => match[1]);
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
    'assets/thumb-10.jpg',
  ]);
});
