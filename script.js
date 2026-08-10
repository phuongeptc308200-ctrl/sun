/* ---------- auto-resize embedded map iframes to their real content height ---------- */
window.addEventListener('message', function (e) {
  var data = e.data || {};
  if (!data.spaMap || !data.height) return;
  // sanity clamp: never let a stray/looping report blow up the iframe height
  var h = Math.max(400, Math.min(2200, Math.round(data.height)));
  var selector = 'iframe[data-map="' + data.spaMap + '"]';
  var iframe = document.querySelector(selector);
  if (iframe) { iframe.style.height = h + 'px'; }
});

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- initialize inline map documents ---------- */
  document.querySelectorAll('iframe[data-template]').forEach(function (iframe) {
    var template = document.getElementById(iframe.getAttribute('data-template'));
    if (template) iframe.srcdoc = template.innerHTML;
  });

  /* ---------- header scroll state ---------- */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');
  function onScroll() {
    if (window.scrollY > 40) { header.classList.add('scrolled'); } else { header.classList.remove('scrolled'); }
    if (window.scrollY > 700) { toTop.classList.add('show'); } else { toTop.classList.remove('show'); }
  }
  window.addEventListener('scroll', onScroll);
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');
  if (navToggle) {
    navToggle.addEventListener('click', function () { mainNav.classList.toggle('open'); });
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mainNav.classList.remove('open'); });
    });
  }

  /* ---------- active nav link on scroll ---------- */
  var navLinks = document.querySelectorAll('nav.main-nav a[href^="#"]');
  var sections = Array.prototype.map.call(navLinks, function (a) {
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  function setActiveLink() {
    var pos = window.scrollY + 140;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', setActiveLink);
  setActiveLink();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { io.observe(el); });

  /* ---------- generic tab switcher (used by bnd-tabs and map-tabs) ---------- */
  function initTabs(tabSelector, tabBtnClass, panelClass) {
    var bars = document.querySelectorAll(tabSelector);
    bars.forEach(function (bar) {
      var btns = bar.querySelectorAll('.' + tabBtnClass);
      btns.forEach(function (btn, idx) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-target');
          var panelWrap = document.querySelector(btn.getAttribute('data-panel-wrap'));
          btns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          // bo góc trên-trái của panel khi tab đang mở không phải tab đầu tiên
          panelWrap.setAttribute('data-active', String(idx));
          panelWrap.querySelectorAll('.' + panelClass).forEach(function (p) {
            p.classList.toggle('active', p.id === target);
          });
        });
      });
    });
  }
  initTabs('.bnd-tabs', 'bnd-tab', 'bnd-panel');
  initTabs('.map-tabs-bar', 'map-tab', 'map-panel');

  /* ---------- ask the now-visible map iframe to re-report its height ---------- */
  document.querySelectorAll('.map-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      [0, 60, 200, 500].forEach(function (t) {
        setTimeout(function () {
          document.querySelectorAll('.map-panel.active iframe').forEach(function (f) {
            if (f.contentWindow) f.contentWindow.postMessage({ requestHeight: true }, '*');
          });
        }, t);
      });
    });
  });

  /* ---------- timeline: year filter + active node ---------- */
  var tlItems = document.querySelectorAll('.tl-item');
  var tlFilters = document.querySelectorAll('.tl-filter');
  tlFilters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tlFilters.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var year = btn.getAttribute('data-year');
      tlItems.forEach(function (item) {
        var y = item.getAttribute('data-year');
        item.classList.toggle('dim', year !== 'all' && y !== year);
      });
    });
  });
  tlItems.forEach(function (item) {
    item.addEventListener('click', function () {
      tlItems.forEach(function (i) { i.classList.remove('active'); });
      item.classList.add('active');
    });
  });

  var tlIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); }
    });
  }, { threshold: 0.3 });
  tlItems.forEach(function (el) { tlIO.observe(el); });

});
