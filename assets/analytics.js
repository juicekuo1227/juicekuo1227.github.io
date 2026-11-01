(function(){
'use strict';

function send(name, params){
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

function pageContext(){
  var path = '/';
  if (window.location && typeof window.location.pathname === 'string' && window.location.pathname) {
    path = window.location.pathname;
  } else if (!document.documentElement.hasAttribute('data-home-analytics')) {
    path = '/blog/';
  }
  var isBlog = path.indexOf('/blog') !== -1;
  var slug = '';
  if (isBlog) {
    var parts = path.split('/').filter(Boolean);
    var last = parts.length ? parts[parts.length - 1] : 'index';
    slug = (last === 'blog' ? 'index' : last).replace(/\.html$/, '') || 'index';
  }
  return { page_type: isBlog ? 'blog' : 'home', page_path: path, from_slug: slug };
}

var home = document.documentElement.hasAttribute('data-home-analytics');
var leadSource = '';

document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('a');
  if (!a) return;

  var source = a.getAttribute('data-lead-source');
  if (source) leadSource = source;

  var situation = a.getAttribute('data-situation');
  if (situation) {
    var target = a.getAttribute('data-situation-target') || '';
    send('select_situation', { situation: situation, target: target });
    if (target === 'contact') leadSource = source || 'mid1';
  }

  var href = a.getAttribute('href') || '';
  var inFooter = !!a.closest('footer');
  var ctx = pageContext();
  if (href.indexOf('line.me') > -1) {
    var params = {
      method: 'line',
      link_location: inFooter ? 'footer' : (leadSource || (ctx.page_type === 'blog' ? 'blog' : 'contact')),
      page_type: ctx.page_type,
      page_path: ctx.page_path
    };
    if (ctx.from_slug) params.from_slug = ctx.from_slug;
    send('generate_lead', params);
  } else if (href.indexOf('instagram.com') > -1) {
    send('contact_click', {
      method: 'instagram',
      link_location: inFooter ? 'footer' : 'contact',
      page_type: ctx.page_type,
      page_path: ctx.page_path
    });
  }
});

if (home) {
  document.querySelectorAll('.faq-item').forEach(function(item){
    item.addEventListener('toggle', function(){
      if (!item.open) return;
      leadSource = 'faq';
      var question = item.querySelector('.qt');
      send('faq_open', { question: question ? question.textContent : '' });
    });
  });
}

(function(){
  var thresholds = [25, 50, 75, 100];
  var sent = new Set();
  var ticking = false;

  function measure(){
    ticking = false;
    var height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    if (!height) return;
    var percent = (window.scrollY + window.innerHeight) / height * 100;
    thresholds.forEach(function(threshold){
      if (percent >= threshold && !sent.has(threshold)) {
        sent.add(threshold);
        send('scroll_depth', { percent_scrolled: threshold });
      }
    });
  }

  function requestMeasure(){
    if (ticking) return;
    ticking = true;
    (window.requestAnimationFrame || function(callback){ setTimeout(callback, 0); })(measure);
  }

  window.addEventListener('scroll', requestMeasure, { passive: true });
  window.addEventListener('resize', requestMeasure);
  requestMeasure();
})();
})();
