/* Rishab Mohandoss — portfolio
   Scroll reveals + counters. Functional motion only. */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Navbar: scrolled border + mobile toggle ── */
  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');

  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ── Counters ── */
  function setFinal(el) {
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    el.textContent = parseFloat(el.dataset.target).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) + (el.dataset.suffix || '');
  }

  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';

    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1500;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      el.textContent = (target * eased).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setFinal(el);
      }
    }
    requestAnimationFrame(step);
  }

  function inViewport(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-target]'));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    counters.forEach(setFinal);
  } else {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    counters.forEach(function (el) {
      // Already on screen at load: animate now, don't wait for a scroll event.
      if (inViewport(el)) {
        animateCounter(el);
      } else {
        counterObserver.observe(el);
      }
    });

    // Safety net: if anything slipped through, show final values on full load.
    window.addEventListener('load', function () {
      setTimeout(function () {
        counters.forEach(function (el) {
          if (!el.dataset.done && inViewport(el)) animateCounter(el);
        });
      }, 400);
    });
  }

  /* ── Scroll reveals (fade + 12px slide, 400ms, no stagger) ── */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    reveals.forEach(function (el) {
      // Content visible at load shouldn't wait to fade in.
      if (inViewport(el)) {
        el.classList.add('is-visible');
      } else {
        revealObserver.observe(el);
      }
    });
  }
})();
