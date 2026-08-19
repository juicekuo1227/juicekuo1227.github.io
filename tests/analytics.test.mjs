import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const scriptPath = new URL('../assets/analytics.js', import.meta.url);

function loadAnalytics({ home = true } = {}) {
  let source;
  try {
    source = readFileSync(scriptPath, 'utf8');
  } catch {
    assert.fail('assets/analytics.js must exist');
  }

  const events = [];
  const documentListeners = {};
  const windowListeners = {};
  const faqListeners = {};
  const faq = {
    open: false,
    addEventListener(type, handler) { faqListeners[type] = handler; },
    querySelector(selector) {
      return selector === '.qt' ? { textContent: '教室在哪裡？' } : null;
    }
  };
  const document = {
    documentElement: {
      scrollHeight: 400,
      hasAttribute(name) { return home && name === 'data-home-analytics'; }
    },
    body: { scrollHeight: 400 },
    addEventListener(type, handler) { documentListeners[type] = handler; },
    querySelectorAll(selector) { return selector === '.faq-item' && home ? [faq] : []; }
  };
  const window = {
    document,
    innerHeight: 100,
    scrollY: 0,
    gtag(command, name, params) { events.push({ command, name, params }); },
    addEventListener(type, handler) { windowListeners[type] = handler; },
    requestAnimationFrame(handler) { handler(); }
  };

  vm.runInNewContext(source, { window, document, Math, Set, setTimeout });

  function click(attrs, { footer = false } = {}) {
    const anchor = {
      getAttribute(name) { return attrs[name] ?? null; },
      closest(selector) { return selector === 'footer' && footer ? {} : null; }
    };
    documentListeners.click({ target: { closest: selector => selector === 'a' ? anchor : null } });
  }

  return { events, faq, faqListeners, window, windowListeners, click };
}

function named(events, name) {
  return events
    .filter(event => event.name === name)
    .map(event => JSON.parse(JSON.stringify(event)));
}

test('only situation links emit select_situation', () => {
  const page = loadAnalytics();

  page.click({ 'data-cta': 'map', href: 'https://maps.example' });
  page.click({
    'data-situation': 'adult',
    'data-situation-target': 'read',
    href: 'blog/article.html'
  });

  assert.deepEqual(named(page.events, 'select_situation'), [{
    command: 'event',
    name: 'select_situation',
    params: { situation: 'adult', target: 'read' }
  }]);
});

test('generate_lead uses the CTA that led to the real Line click', () => {
  const page = loadAnalytics();

  page.click({ 'data-lead-source': 'hero', href: '#contact' });
  page.click({ href: 'https://line.me/example' });
  page.click({ href: 'https://line.me/example' }, { footer: true });

  assert.deepEqual(named(page.events, 'generate_lead'), [
    { command: 'event', name: 'generate_lead', params: { method: 'line', link_location: 'hero' } },
    { command: 'event', name: 'generate_lead', params: { method: 'line', link_location: 'footer' } }
  ]);
});

test('opening an FAQ attributes a later contact Line click to faq', () => {
  const page = loadAnalytics();

  page.faq.open = true;
  page.faqListeners.toggle();
  page.click({ href: 'https://line.me/example' });

  assert.deepEqual(named(page.events, 'faq_open'), [{
    command: 'event',
    name: 'faq_open',
    params: { question: '教室在哪裡？' }
  }]);
  assert.equal(named(page.events, 'generate_lead')[0].params.link_location, 'faq');
});

test('scroll_depth emits each 25 percent threshold once', () => {
  const page = loadAnalytics({ home: false });

  page.window.scrollY = 100;
  page.windowListeners.scroll();
  page.window.scrollY = 300;
  page.windowListeners.scroll();
  page.windowListeners.scroll();

  assert.deepEqual(named(page.events, 'scroll_depth').map(event => event.params.percent_scrolled), [
    25, 50, 75, 100
  ]);
});
