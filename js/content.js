/**
 * Public content hydrator (bilingual EN/AR aware).
 *
 * Fetches your saved content from /api/content and renders it into the EXISTING
 * page sections. Each translatable field can be a plain string OR a bilingual
 * object { en, ar }. When Arabic is active, pick() returns the explicit Arabic
 * if present, otherwise falls back to the baked translation dictionary (js/i18n.js),
 * otherwise the English. Re-renders when the language toggles.
 *
 * If the backend is unreachable, it does nothing and the static HTML stays — so
 * the site never breaks.
 */
(function () {
  'use strict';

  let lastContent = null;

  // ---- escaping helpers ----------------------------------------------------
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function safeUrl(value) {
    const v = String(value == null ? '' : value).trim();
    if (!v) return '';
    if (/^\s*javascript:/i.test(v) || /^\s*data:text\/html/i.test(v)) return '';
    return v;
  }
  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  // ---- language helpers ----------------------------------------------------
  function langIsAr() {
    return !!(window.PORTFOLIO_I18N && typeof window.PORTFOLIO_I18N.lang === 'function'
      ? window.PORTFOLIO_I18N.lang() === 'ar'
      : false);
  }
  function tr(s) {
    return window.PORTFOLIO_I18N && typeof window.PORTFOLIO_I18N.tr === 'function'
      ? window.PORTFOLIO_I18N.tr(s)
      : s;
  }
  // Returns the right-language text for a field that may be a string or {en, ar}.
  function pick(field) {
    if (field && typeof field === 'object' && !Array.isArray(field) && ('en' in field || 'ar' in field)) {
      if (langIsAr()) return field.ar ? field.ar : tr(field.en || '');
      return field.en || '';
    }
    const s = field == null ? '' : String(field);
    return langIsAr() ? tr(s) : s;
  }
  // expose for script.js (typewriter roles)
  window.PORTFOLIO_PICK = pick;

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null && value !== '') el.textContent = value;
  }
  function setHtml(selector, html) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
    return el;
  }

  // ---- section renderers ---------------------------------------------------
  function renderSkills(skills) {
    return arr(skills)
      .map(function (cat) {
        const items = arr(cat.items)
          .map(function (it) {
            return (
              '<div class="skill-item"><i class="' +
              esc(it.icon) +
              '"></i><span>' +
              esc(pick(it.name)) +
              '</span></div>'
            );
          })
          .join('');
        return (
          '<div class="skill-category"><h3>' +
          esc(pick(cat.title)) +
          '</h3><div class="skill-items">' +
          items +
          '</div></div>'
        );
      })
      .join('');
  }

  function renderProjectWidgets(widgets) {
    const list = arr(widgets);
    if (!list.length) return '';
    const html = list
      .map(function (w) {
        const url = safeUrl(w.url);
        const img = safeUrl(w.image);
        const label = esc(pick(w.label) || '');
        if (img && url) {
          return (
            '<a class="project-widget" href="' +
            esc(url) +
            '" target="_blank" rel="noopener" title="' +
            label +
            '"><img src="' +
            esc(img) +
            '" alt="' +
            label +
            '" loading="lazy"></a>'
          );
        }
        if (img) {
          return (
            '<button type="button" class="project-widget" data-img="' +
            esc(img) +
            '" title="' +
            label +
            '"><img src="' +
            esc(img) +
            '" alt="' +
            label +
            '" loading="lazy"></button>'
          );
        }
        if (url) {
          const icon = w.icon ? '<i class="' + esc(w.icon) + '"></i> ' : '';
          return (
            '<a class="project-widget project-widget--text" href="' +
            esc(url) +
            '" target="_blank" rel="noopener">' +
            icon +
            (label || esc(url)) +
            '</a>'
          );
        }
        return '';
      })
      .join('');
    return '<div class="project-widgets">' + html + '</div>';
  }

  function renderProjects(projects) {
    return arr(projects)
      .map(function (p) {
        const title = esc(pick(p.title));
        const image = safeUrl(p.image);
        const banner = image
          ? '<div class="project-image"><img src="' + esc(image) + '" alt="' + title + '" loading="lazy"></div>'
          : '';
        const tech = arr(p.tech)
          .map(function (t) {
            return '<span>' + esc(t) + '</span>';
          })
          .join('');
        const links = arr(p.links)
          .map(function (l) {
            const url = safeUrl(l.url);
            if (!url) return '';
            const icon = l.icon ? '<i class="' + esc(l.icon) + '"></i> ' : '';
            const label = pick(l.label) || (langIsAr() ? tr('View Project') : 'View Project');
            return '<a href="' + esc(url) + '" target="_blank" class="btn">' + icon + esc(label) + '</a>';
          })
          .join('');
        return (
          '<div class="project-card">' +
          banner +
          '<div class="project-content"><h3>' +
          title +
          '</h3><p>' +
          esc(pick(p.description)) +
          '</p>' +
          renderProjectWidgets(p.widgets) +
          '<div class="project-tech">' +
          tech +
          '</div><div class="project-links">' +
          links +
          '</div></div></div>'
        );
      })
      .join('');
  }

  function renderCertificates(certs) {
    return arr(certs)
      .map(function (c) {
        const skills = arr(c.skills)
          .map(function (s) {
            return '<span>' + esc(s) + '</span>';
          })
          .join('');
        const image = safeUrl(c.image);
        const btnLabel = langIsAr() ? tr('View Certificate') : 'View Certificate';
        const btn = image
          ? '<button class="certificate-btn" data-cert="' +
            esc(image) +
            '"><span>' + esc(btnLabel) + '</span><i class="fas fa-external-link-alt"></i></button>'
          : '';
        return (
          '<div class="certificate-card"><div class="certificate-icon"><i class="' +
          esc(c.icon) +
          '"></i></div><div class="certificate-content"><h3>' +
          esc(pick(c.title)) +
          '</h3><p class="certificate-issuer">' +
          esc(pick(c.issuer)) +
          '</p><p class="certificate-date">' +
          esc(pick(c.date)) +
          '</p><p class="certificate-description">' +
          esc(pick(c.description)) +
          '</p><div class="certificate-skills">' +
          skills +
          '</div>' +
          btn +
          '</div></div>'
        );
      })
      .join('');
  }

  function renderExperience(items) {
    return arr(items)
      .map(function (e) {
        const details = arr(e.details)
          .map(function (d) {
            return '<li>' + esc(pick(d)) + '</li>';
          })
          .join('');
        return (
          '<div class="timeline-item"><div class="timeline-content"><h3>' +
          esc(pick(e.title)) +
          '</h3><p class="timeline-date">' +
          esc(pick(e.date)) +
          '</p><ul class="timeline-details">' +
          details +
          '</ul></div></div>'
        );
      })
      .join('');
  }

  function renderSkillBars(cats) {
    return arr(cats)
      .map(function (cat) {
        const bars = arr(cat.bars)
          .map(function (b) {
            let v = Number(b.value);
            if (!isFinite(v)) v = 0;
            v = Math.max(0, Math.min(100, v));
            return (
              '<div class="skill-bar"><span class="skill-label">' +
              esc(b.label) +
              '</span><div class="bar"><div class="progress" style="width: ' +
              v +
              '%"></div></div></div>'
            );
          })
          .join('');
        return (
          '<div class="skill-category"><h3>' +
          esc(pick(cat.title)) +
          '</h3><div class="skill-bars">' +
          bars +
          '</div></div>'
        );
      })
      .join('');
  }

  function renderContactInfo(contact) {
    const email = String(contact.email || '');
    return (
      '<h3>' +
      esc(pick(contact.heading)) +
      '</h3><p>' +
      esc(pick(contact.intro)) +
      '</p><div class="contact-details"><div class="contact-item"><i class="fas fa-envelope"></i><a href="mailto:' +
      esc(email) +
      '">' +
      esc(email) +
      '</a></div><div class="contact-item"><i class="fas fa-map-marker-alt"></i><span>' +
      esc(pick(contact.location)) +
      '</span></div></div>'
    );
  }

  function renderSocial(social) {
    return arr(social)
      .map(function (s) {
        const url = safeUrl(s.url);
        if (!url) return '';
        return (
          '<a href="' +
          esc(url) +
          '" target="_blank" title="' +
          esc(s.title) +
          '"><i class="' +
          esc(s.icon) +
          '"></i></a>'
        );
      })
      .join('');
  }

  function renderCv(cv) {
    const url = safeUrl(cv.url);
    const viewLabel = langIsAr() ? tr('View CV') : 'View CV';
    const dlLabel = langIsAr() ? tr('Download') : 'Download';
    const viewBtn = url
      ? '<button class="btn primary" data-cv="' +
        esc(url) +
        '"><span>' + esc(viewLabel) + '</span> <i class="fas fa-external-link-alt"></i></button>'
      : '';
    const dlBtn = url
      ? '<a class="btn" href="' +
        esc(url) +
        '" download target="_blank" rel="noopener"><span>' + esc(dlLabel) + '</span> <i class="fas fa-download"></i></a>'
      : '';
    return (
      '<div class="cv-card"><div class="cv-icon"><i class="fas fa-file-lines"></i></div>' +
      '<div class="cv-info"><h3>' +
      esc(pick(cv.title)) +
      '</h3><p>' +
      esc(pick(cv.description)) +
      '</p><div class="cv-actions">' +
      viewBtn +
      dlBtn +
      '</div></div></div>'
    );
  }

  // ---- apply ---------------------------------------------------------------
  function applyContent(content) {
    if (!content || typeof content !== 'object') return;
    lastContent = content;
    window.PORTFOLIO_CONTENT = content;

    try {
      if (content.brand) setText('.navbar .logo', content.brand);
      if (content.pageTitle) document.title = pick(content.pageTitle);
    } catch (e) {}

    try {
      if (content.hero && content.hero.title) setText('.hero-content h1', pick(content.hero.title));
    } catch (e) {}

    try {
      if (content.about && content.about.text != null) {
        setHtml('#about .about-text', '<p>' + esc(pick(content.about.text)) + '</p>');
      }
    } catch (e) {}

    try {
      if (content.skills) setHtml('#skills .skills-container', renderSkills(content.skills));
    } catch (e) {}

    try {
      if (content.projects) setHtml('#projects .project-grid', renderProjects(content.projects));
    } catch (e) {}

    try {
      if (content.certificates) {
        const el = setHtml('#certificates .certificates-container', renderCertificates(content.certificates));
        if (el) {
          el.querySelectorAll('.certificate-btn[data-cert]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (typeof window.viewCertificate === 'function') window.viewCertificate(btn.getAttribute('data-cert'));
            });
          });
        }
      }
    } catch (e) {}

    try {
      if (content.experience) setHtml('#experience .timeline', renderExperience(content.experience));
    } catch (e) {}

    try {
      if (content.skillBars) setHtml('#testimonials .skills-grid', renderSkillBars(content.skillBars));
    } catch (e) {}

    try {
      if (content.contact) {
        setHtml('#contact .contact-info', renderContactInfo(content.contact));
        setHtml('#contact .social-links', renderSocial(content.contact.social));
      }
    } catch (e) {}

    try {
      if (content.cv) {
        if (content.cv.heading) setText('#cv h2', pick(content.cv.heading));
        const el = setHtml('#cv .cv-content', renderCv(content.cv));
        if (el) {
          el.querySelectorAll('[data-cv]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (typeof window.viewCertificate === 'function') window.viewCertificate(btn.getAttribute('data-cv'));
            });
          });
        }
      }
    } catch (e) {}

    try {
      if (content.footer && content.footer.text) setText('footer p', pick(content.footer.text));
    } catch (e) {}

    try {
      document.querySelectorAll('.project-widget[data-img]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (typeof window.viewCertificate === 'function') window.viewCertificate(btn.getAttribute('data-img'));
        });
      });
    } catch (e) {}

    // Let i18n.js re-apply the static-chrome translation after our render.
    try {
      document.dispatchEvent(new CustomEvent('portfolio:rendered'));
    } catch (e) {}
  }

  // Re-render content in the new language when the toggle is clicked.
  document.addEventListener('portfolio:langchange', function () {
    if (lastContent) applyContent(lastContent);
  });

  function load() {
    fetch('/api/content', { headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (content) {
        if (content) applyContent(content);
      })
      .catch(function () {
        /* offline / no backend -> keep the static HTML as-is */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
