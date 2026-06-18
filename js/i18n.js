/**
 * EN / AR internationalization layer for the public site.
 *
 * - Adds an EN/AR toggle (button #lang-toggle).
 * - When Arabic is active: sets <html dir="rtl" lang="ar"> and translates every
 *   known English string to Arabic (dictionary in js/translations.js). Technical
 *   terms stay English because they are not in the dictionary.
 * - English is the default. Choice is saved in localStorage ("lang").
 * - Works on the static chrome AND content rendered by js/content.js (re-applies
 *   on "portfolio:rendered"). Original English is kept in data-en* attributes so
 *   switching back to English is lossless.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'lang';
  var AR = window.PORTFOLIO_AR || {};
  var ATTRS = ['placeholder', 'title', 'aria-label'];

  function skip(el) {
    return (
      el.classList.contains('dynamic-text') ||
      el.classList.contains('logo') ||
      el.hasAttribute('data-no-i18n') ||
      el.tagName === 'SCRIPT' ||
      el.tagName === 'STYLE'
    );
  }

  function currentLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function translateText(el, lang) {
    if (el.children.length !== 0) return; // leaf only
    if (lang === 'ar') {
      var key = el.hasAttribute('data-en') ? el.getAttribute('data-en') : el.textContent.trim();
      if (AR[key] != null) {
        if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.textContent.trim());
        el.textContent = AR[key];
      }
    } else if (el.hasAttribute('data-en')) {
      el.textContent = el.getAttribute('data-en');
      el.removeAttribute('data-en');
    }
  }

  function translateAttrs(el, lang) {
    ATTRS.forEach(function (attr) {
      var store = 'data-en-' + attr;
      if (lang === 'ar') {
        var key = el.hasAttribute(store) ? el.getAttribute(store) : el.getAttribute(attr);
        if (key != null && AR[key] != null) {
          if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(attr));
          el.setAttribute(attr, AR[key]);
        }
      } else if (el.hasAttribute(store)) {
        el.setAttribute(attr, el.getAttribute(store));
        el.removeAttribute(store);
      }
    });
  }

  function walk(lang) {
    var els = document.querySelectorAll('body *');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (skip(el)) continue;
      translateAttrs(el, lang);
      translateText(el, lang);
    }
  }

  function applyDir(lang) {
    var html = document.documentElement;
    if (lang === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      html.classList.add('lang-ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
      html.classList.remove('lang-ar');
    }
  }

  function updateToggle(lang) {
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'ar' ? 'EN' : 'ع';
      btn.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    }
  }

  function apply(lang) {
    applyDir(lang);
    walk(lang);
    updateToggle(lang);
  }

  function setLanguage(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    apply(lang);
    document.dispatchEvent(new CustomEvent('portfolio:langchange', { detail: { lang: lang } }));
  }

  // Exposed so content.js / script.js can resolve the active language.
  window.PORTFOLIO_I18N = {
    lang: currentLang,
    tr: function (s) {
      return currentLang() === 'ar' && AR[s] != null ? AR[s] : s;
    },
  };

  function init() {
    apply(currentLang());

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        setLanguage(currentLang() === 'ar' ? 'en' : 'ar');
      });
    }

    document.addEventListener('portfolio:rendered', function () {
      apply(currentLang());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
