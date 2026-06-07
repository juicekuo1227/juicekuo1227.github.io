// 聽聽音樂 — 互動腳本：漢堡選單、平滑捲動、mailto 聯絡表單
(function () {
  'use strict';

  function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // 點導覽連結後收合選單
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // 由表單欄位組出 mailto: 連結
  function buildMailto(name, email, message) {
    var subject = '音樂課程詢問 - ' + name;
    var body =
      '姓名：' + name + '\n' +
      '回信信箱：' + email + '\n\n' +
      '我想要學習：\n' + (message || '（未填寫）');
    return 'mailto:juicekuo@gmail.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    var errorEl = document.getElementById('form-error');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();

      var error = '';
      if (!name) error = '請填寫姓名';
      else if (!email) error = '請填寫電子信箱';
      else if (!isValidEmail(email)) error = '電子信箱格式不正確';

      if (error) {
        if (errorEl) { errorEl.textContent = error; errorEl.hidden = false; }
        return;
      }
      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

      window.location.href = buildMailto(name, email, message);
    });
  }

  // 相片牆燈箱：點縮圖 → 全螢幕遮罩大圖 + 左右換頁
  function initLightbox() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var box = document.getElementById('lightbox');
    if (!items.length || !box) return;

    var imgEl = box.querySelector('.lightbox-img');
    var captionEl = box.querySelector('.lightbox-caption');
    var btnPrev = box.querySelector('.lightbox-prev');
    var btnNext = box.querySelector('.lightbox-next');
    var btnClose = box.querySelector('.lightbox-close');
    var current = 0;

    // 每張圖：用 href 取大圖、img alt 當說明
    var slides = items.map(function (a) {
      var img = a.querySelector('img');
      return { src: a.getAttribute('href') || (img && img.getAttribute('src')), caption: (img && img.getAttribute('alt')) || '' };
    });

    function show(index) {
      current = (index + slides.length) % slides.length;
      var slide = slides[current];
      imgEl.setAttribute('src', slide.src);
      imgEl.setAttribute('alt', slide.caption);
      captionEl.textContent = slide.caption;
    }

    function open(index) {
      show(index);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      imgEl.setAttribute('src', '');
    }

    items.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        open(i);
      });
    });

    btnPrev.addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    btnNext.addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
    btnClose.addEventListener('click', close);

    // 點遮罩空白處關閉（點圖片或按鈕不關）
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox-stage')) close();
    });

    // 鍵盤：Esc 關閉、左右換頁
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // 導覽列高亮：目前捲到哪個區塊就標記對應連結
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var sel = a.getAttribute('href');
      var section = document.querySelector(sel);
      if (section) { map[section.id] = a; sections.push(section); }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var active = map[entry.target.id];
        if (!active) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        active.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
    initLightbox();
    initScrollSpy();
  });

  // 供測試存取
  window.__tingmusic = { buildMailto: buildMailto, isValidEmail: isValidEmail };
})();
