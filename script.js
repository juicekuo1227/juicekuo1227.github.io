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

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
  });

  // 供測試存取
  window.__tingmusic = { buildMailto: buildMailto, isValidEmail: isValidEmail };
})();
