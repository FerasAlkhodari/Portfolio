/* Portfolio Admin — content editor.
 * Talks to /api/session, /api/login, /api/logout, /api/content, /api/upload.
 * Everything here is the admin UI only; it never affects the public site design.
 */
(function () {
  'use strict';

  let content = null;
  let dirty = false;
  let lastSession = null;

  // ---------------------------------------------------------------------------
  // tiny DOM helper
  // ---------------------------------------------------------------------------
  function appendChildren(el, children) {
    children.flat().forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(
        typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c
      );
    });
  }
  function h(tag, props) {
    const el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        const v = props[k];
        if (v == null) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style') el.setAttribute('style', v);
        else if (k.indexOf('on') === 0 && typeof v === 'function')
          el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'value') el.value = v;
        else el.setAttribute(k, v);
      });
    }
    appendChildren(el, Array.prototype.slice.call(arguments, 2));
    return el;
  }
  function frag() {
    const f = document.createDocumentFragment();
    appendChildren(f, Array.prototype.slice.call(arguments));
    return f;
  }
  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  function byId(id) {
    return document.getElementById(id);
  }
  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  // ---------------------------------------------------------------------------
  // status / toast
  // ---------------------------------------------------------------------------
  function setDirty(d) {
    dirty = d;
    const s = byId('status');
    if (!s) return;
    if (d) {
      s.textContent = 'Unsaved changes';
      s.className = 'status dirty';
    } else {
      s.textContent = 'Saved ✓';
      s.className = 'status saved';
    }
  }
  function markDirty() {
    setDirty(true);
  }
  function setStatus(text, cls) {
    const s = byId('status');
    if (s) {
      s.textContent = text;
      s.className = 'status' + (cls ? ' ' + cls : '');
    }
  }
  let toastTimer;
  function toast(msg, isErr) {
    const t = byId('toast');
    t.textContent = msg;
    t.className = 'toast show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.className = 'toast' + (isErr ? ' err' : '');
    }, 4000);
  }

  // ---------------------------------------------------------------------------
  // field builders
  // ---------------------------------------------------------------------------
  function field(labelText, inputEl, hint) {
    return h(
      'div',
      { class: 'field' },
      labelText ? h('label', {}, labelText) : null,
      inputEl,
      hint ? h('div', { class: 'hint' }, hint) : null
    );
  }
  function subLabel(text) {
    return h(
      'div',
      { style: 'font-size:0.82rem;color:var(--a-muted);font-weight:600;margin:0.7rem 0 0.45rem;' },
      text
    );
  }
  function textField(labelText, value, onChange, opts) {
    opts = opts || {};
    const inp = h('input', {
      type: opts.type || 'text',
      value: value == null ? '' : value,
      placeholder: opts.placeholder || '',
    });
    inp.addEventListener('input', function () {
      onChange(inp.value);
      markDirty();
    });
    return field(labelText, inp, opts.hint);
  }
  function textareaField(labelText, value, onChange, hint) {
    const ta = h('textarea', {});
    ta.value = value == null ? '' : value;
    ta.addEventListener('input', function () {
      onChange(ta.value);
      markDirty();
    });
    return field(labelText, ta, hint);
  }
  function numberField(labelText, value, onChange) {
    const inp = h('input', { type: 'number', min: '0', max: '100', value: value == null ? '' : value });
    function commit(reflect) {
      const n = Math.max(0, Math.min(100, Number(inp.value) || 0));
      if (reflect) inp.value = n; // sync the visible box to the clamped value on blur
      onChange(n);
      markDirty();
    }
    inp.addEventListener('input', function () { commit(false); });
    inp.addEventListener('change', function () { commit(true); });
    return field(labelText, inp);
  }
  function iconField(labelText, value, onChange) {
    const i = h('i', { class: value || '' });
    const prev = h('span', { class: 'icon-prev' }, i);
    const inp = h('input', { type: 'text', value: value == null ? '' : value, placeholder: 'e.g. fab fa-react' });
    inp.addEventListener('input', function () {
      onChange(inp.value);
      i.className = inp.value;
      markDirty();
    });
    return field(
      labelText,
      h('div', { class: 'icon-field' }, prev, inp),
      'FontAwesome class — browse at fontawesome.com/icons'
    );
  }
  // ---- bilingual {en, ar} field -------------------------------------------
  function arDefault(en) {
    return en && window.PORTFOLIO_AR && window.PORTFOLIO_AR[en] ? window.PORTFOLIO_AR[en] : '';
  }
  function biVal(v) {
    var en, ar;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      en = strv(v.en);
      ar = strv(v.ar);
    } else {
      en = strv(v);
      ar = '';
    }
    // Pre-fill Arabic from the shared dictionary so the admin shows the SAME
    // Arabic the site displays — the editor and the frontend never disagree.
    if (!ar) ar = arDefault(en);
    return { en: en, ar: ar };
  }
  function strv(v) {
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  }
  function biTag(en) {
    return en ? 'EN' : 'ع';
  }
  // v is a {en, ar} object (mutated in place by reference)
  function biInputs(v, multiline) {
    function col(lang) {
      const el = multiline
        ? h('textarea', { dir: lang === 'ar' ? 'rtl' : 'ltr' })
        : h('input', { type: 'text', dir: lang === 'ar' ? 'rtl' : 'ltr' });
      el.value = v[lang] == null ? '' : v[lang];
      el.addEventListener('input', function () {
        v[lang] = el.value;
        markDirty();
      });
      return h('div', { class: 'bi-col' }, h('span', { class: 'bi-tag' }, biTag(lang === 'en')), el);
    }
    return h('div', { class: 'bi' }, col('en'), col('ar'));
  }
  function biField(labelText, obj, key, multiline) {
    if (!(obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key]))) obj[key] = biVal(obj[key]);
    return field(labelText, biInputs(obj[key], multiline), 'Arabic (ع) is optional — leave blank to use the built-in Arabic / English.');
  }
  // returns the English side of a bilingual value (for list item titles)
  function enOf(v) {
    return (v && typeof v === 'object' ? v.en : v) || '';
  }

  function row() {
    const r = h('div', { class: 'row' });
    appendChildren(r, Array.prototype.slice.call(arguments));
    return r;
  }
  function iconBtn(faClass, title, onclick) {
    return h('button', { type: 'button', class: 'btn icon small', title: title, onclick: onclick }, h('i', { class: 'fas ' + faClass }));
  }

  // chips editor for arrays of short strings
  function stringList(array, placeholder) {
    const chips = h('div', { class: 'chips' });
    const input = h('input', { type: 'text', placeholder: placeholder || 'Add…' });
    function renderChips() {
      clear(chips);
      array.forEach(function (s, i) {
        chips.appendChild(
          h(
            'span',
            { class: 'chip' },
            document.createTextNode(s),
            h(
              'button',
              {
                type: 'button',
                title: 'Remove',
                onclick: function () {
                  array.splice(i, 1);
                  markDirty();
                  renderChips();
                },
              },
              '×'
            )
          )
        );
      });
    }
    function add() {
      const v = input.value.trim();
      if (v) {
        array.push(v);
        input.value = '';
        markDirty();
        renderChips();
      }
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        add();
      }
    });
    renderChips();
    return h(
      'div',
      {},
      chips,
      h('div', { class: 'chip-add' }, input, h('button', { type: 'button', class: 'btn small', onclick: add }, 'Add'))
    );
  }

  // textarea editor for arrays of longer strings (one per line)
  function linesField(labelText, array, hint) {
    const ta = h('textarea', { placeholder: 'One item per line' });
    ta.value = arr(array).join('\n');
    ta.addEventListener('input', function () {
      const lines = ta.value.split('\n').map(function (s) {
        return s.trim();
      }).filter(Boolean);
      array.length = 0;
      lines.forEach(function (l) {
        array.push(l);
      });
      markDirty();
    });
    return field(labelText, ta, hint || 'One bullet point per line');
  }

  // image picker: upload (auto-resized) or paste a URL
  function imageField(getValue, setValue, labelText) {
    const preview = h('div', { class: 'preview' });
    const urlInput = h('input', { type: 'text', value: getValue() || '', placeholder: 'https://… or use Upload →' });
    const fileInput = h('input', { type: 'file', accept: 'image/*,application/pdf', style: 'display:none' });
    const status = h('div', { class: 'uploading' });

    function setPreview(url) {
      clear(preview);
      if (!url) {
        preview.appendChild(h('span', {}, 'No image'));
        return;
      }
      if (/\.pdf($|\?)/i.test(url)) {
        preview.appendChild(h('span', {}, 'PDF file'));
        return;
      }
      const im = h('img');
      im.onerror = function () {
        clear(preview);
        preview.appendChild(h('span', {}, 'No preview'));
      };
      im.src = url;
      preview.appendChild(im);
    }

    urlInput.addEventListener('input', function () {
      const v = urlInput.value.trim();
      setValue(v);
      setPreview(v);
      markDirty();
    });

    fileInput.addEventListener('change', async function () {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      status.textContent = 'Uploading…';
      try {
        const dataUrl = await compressImage(f);
        const url = await uploadImage(dataUrl, f.name);
        urlInput.value = url;
        setValue(url);
        setPreview(url);
        markDirty();
        status.textContent = '';
        toast('Image uploaded');
      } catch (err) {
        status.textContent = 'Upload failed: ' + err.message;
        toast('Upload failed: ' + err.message, true);
      }
      fileInput.value = '';
    });

    setPreview(getValue());
    const controls = h(
      'div',
      { class: 'controls' },
      urlInput,
      h(
        'div',
        { class: 'toolbar', style: 'margin-top:.5rem' },
        h('button', { type: 'button', class: 'btn small', onclick: function () { fileInput.click(); } }, h('i', { class: 'fas fa-upload' }), ' Upload'),
        h('button', { type: 'button', class: 'btn small danger', onclick: function () { urlInput.value = ''; setValue(''); setPreview(''); markDirty(); } }, 'Clear')
      ),
      status,
      fileInput
    );
    const widget = h('div', { class: 'imgwidget' }, preview, controls);
    return labelText ? field(labelText, widget) : widget;
  }

  // generic editor for arrays of objects
  function objectList(array, opts) {
    const wrap = h('div', {});
    function render() {
      clear(wrap);
      array.forEach(function (item, i) {
        const head = h(
          'div',
          { class: 'item-head' },
          h('span', { class: 'item-title' }, opts.itemTitle ? opts.itemTitle(item, i) || '—' : '#' + (i + 1)),
          h(
            'div',
            { class: 'item-actions' },
            iconBtn('fa-arrow-up', 'Move up', function () {
              if (i > 0) {
                const t = array[i - 1];
                array[i - 1] = array[i];
                array[i] = t;
                markDirty();
                render();
              }
            }),
            iconBtn('fa-arrow-down', 'Move down', function () {
              if (i < array.length - 1) {
                const t = array[i + 1];
                array[i + 1] = array[i];
                array[i] = t;
                markDirty();
                render();
              }
            }),
            h(
              'button',
              {
                type: 'button',
                class: 'btn danger small',
                title: 'Delete',
                onclick: function () {
                  array.splice(i, 1);
                  markDirty();
                  render();
                },
              },
              h('i', { class: 'fas fa-trash' })
            )
          )
        );
        wrap.appendChild(h('div', { class: 'item' }, head, opts.renderBody(item, i)));
      });
      wrap.appendChild(
        h(
          'div',
          { class: 'add-row' },
          h(
            'button',
            {
              type: 'button',
              class: 'btn small',
              onclick: function () {
                array.push(opts.makeNew());
                markDirty();
                render();
              },
            },
            h('i', { class: 'fas fa-plus' }),
            ' ' + (opts.addLabel || 'Add')
          )
        )
      );
    }
    render();
    return wrap;
  }

  function panel(title, faIcon, bodyNode, collapsed) {
    const head = h(
      'div',
      { class: 'panel-head' },
      h('i', { class: 'fas ' + faIcon, style: 'color:#64ffda;' }),
      h('h2', {}, title),
      h('i', { class: 'fas fa-chevron-down chev' })
    );
    const p = h('div', { class: 'panel' + (collapsed ? ' collapsed' : '') }, head, h('div', { class: 'panel-body' }, bodyNode));
    head.addEventListener('click', function () {
      p.classList.toggle('collapsed');
    });
    return p;
  }

  // ---------------------------------------------------------------------------
  // panels
  // ---------------------------------------------------------------------------
  function renderPanels() {
    const root = byId('panels');
    clear(root);

    root.appendChild(
      panel(
        'Site & Hero',
        'fa-house',
        frag(
          textField('Brand name (navbar logo)', content.brand, function (v) { content.brand = v; }),
          textField('Browser tab title', content.pageTitle, function (v) { content.pageTitle = v; }),
          biField('Hero heading', content.hero, 'title'),
          subLabel('Rotating roles (typewriter effect)'),
          objectList(content.hero.roles, {
            addLabel: 'Add role',
            itemTitle: function (r) { return enOf(r); },
            makeNew: function () { return { en: '', ar: '' }; },
            renderBody: function (r) { return biInputs(r, false); },
          })
        )
      )
    );

    root.appendChild(
      panel('About', 'fa-user', biField('About text', content.about, 'text', true))
    );

    root.appendChild(
      panel(
        'Resume / CV',
        'fa-file-lines',
        frag(
          biField('Section heading', content.cv, 'heading'),
          biField('Title', content.cv, 'title'),
          biField('Description', content.cv, 'description', true),
          imageField(function () { return content.cv.url; }, function (v) { content.cv.url = v; }, 'CV file (PDF) — upload a new one or paste a URL')
        )
      )
    );

    root.appendChild(
      panel(
        'Skills (icon grid)',
        'fa-layer-group',
        objectList(content.skills, {
          addLabel: 'Add category',
          itemTitle: function (c) { return enOf(c.title); },
          makeNew: function () { return { title: { en: 'New Category', ar: '' }, items: [] }; },
          renderBody: function (cat) {
            return frag(
              biField('Category title', cat, 'title'),
              subLabel('Skills in this category'),
              objectList(cat.items, {
                addLabel: 'Add skill',
                itemTitle: function (it) { return it.name; },
                makeNew: function () { return { icon: 'fas fa-star', name: 'New skill' }; },
                renderBody: function (it) {
                  return row(
                    iconField('Icon', it.icon, function (v) { it.icon = v; }),
                    textField('Name', it.name, function (v) { it.name = v; })
                  );
                },
              })
            );
          },
        })
      )
    );

    root.appendChild(
      panel(
        'Projects',
        'fa-diagram-project',
        objectList(content.projects, {
          addLabel: 'Add project',
          itemTitle: function (p) { return enOf(p.title); },
          makeNew: function () { return { title: { en: 'New Project', ar: '' }, description: { en: '', ar: '' }, image: '', widgets: [], tech: [], links: [] }; },
          renderBody: function (p) {
            return frag(
              biField('Title', p, 'title'),
              biField('Description', p, 'description', true),
              imageField(function () { return p.image; }, function (v) { p.image = v; }, 'Banner image (top of the card)'),
              subLabel('Tech tags'),
              stringList(p.tech, 'e.g. Python'),
              subLabel('Links / buttons'),
              objectList(p.links, {
                addLabel: 'Add link',
                itemTitle: function (l) { return enOf(l.label); },
                makeNew: function () { return { label: { en: 'View Project', ar: '' }, url: '', icon: '' }; },
                renderBody: function (l) {
                  return frag(
                    biField('Button label', l, 'label'),
                    row(
                      textField('URL', l.url, function (v) { l.url = v; }),
                      iconField('Icon (optional)', l.icon, function (v) { l.icon = v; })
                    )
                  );
                },
              }),
              subLabel('Widgets (small thumbnails shown before the tags)'),
              objectList(p.widgets, {
                addLabel: 'Add widget',
                itemTitle: function (w) { return enOf(w.label) || 'Widget'; },
                makeNew: function () { return { image: '', url: '', label: { en: '', ar: '' }, icon: '' }; },
                renderBody: function (w) {
                  return frag(
                    imageField(function () { return w.image; }, function (v) { w.image = v; }, 'Widget image'),
                    textField('Link URL (optional)', w.url, function (v) { w.url = v; }),
                    biField('Label / tooltip', w, 'label'),
                    h('div', { class: 'hint' }, 'With a URL, clicking opens the link. Image only → clicking enlarges it.')
                  );
                },
              })
            );
          },
        })
      )
    );

    root.appendChild(
      panel(
        'Certificates',
        'fa-certificate',
        objectList(content.certificates, {
          addLabel: 'Add certificate',
          itemTitle: function (c) { return enOf(c.title); },
          makeNew: function () { return { icon: 'fas fa-certificate', title: { en: 'New Certificate', ar: '' }, issuer: { en: '', ar: '' }, date: '', description: { en: '', ar: '' }, skills: [], image: '' }; },
          renderBody: function (c) {
            return frag(
              row(
                iconField('Icon', c.icon, function (v) { c.icon = v; }),
                textField('Date', c.date, function (v) { c.date = v; })
              ),
              biField('Title', c, 'title'),
              biField('Issuer', c, 'issuer'),
              biField('Description', c, 'description', true),
              subLabel('Skills'),
              stringList(c.skills, 'e.g. Linux'),
              imageField(function () { return c.image; }, function (v) { c.image = v; }, 'Certificate image / PDF (opens in the viewer)')
            );
          },
        })
      )
    );

    root.appendChild(
      panel(
        'Experience & Education',
        'fa-timeline',
        objectList(content.experience, {
          addLabel: 'Add entry',
          itemTitle: function (e) { return enOf(e.title); },
          makeNew: function () { return { title: { en: 'New Role', ar: '' }, date: { en: '', ar: '' }, details: [] }; },
          renderBody: function (e) {
            return frag(
              biField('Title', e, 'title'),
              biField('Date', e, 'date'),
              subLabel('Details (bullet points)'),
              objectList(e.details, {
                addLabel: 'Add bullet',
                itemTitle: function (d) { return enOf(d); },
                makeNew: function () { return { en: '', ar: '' }; },
                renderBody: function (d) { return biInputs(d, true); },
              })
            );
          },
        })
      )
    );

    root.appendChild(
      panel(
        'Skill Bars',
        'fa-chart-simple',
        objectList(content.skillBars, {
          addLabel: 'Add category',
          itemTitle: function (c) { return enOf(c.title); },
          makeNew: function () { return { title: { en: 'New Category', ar: '' }, bars: [] }; },
          renderBody: function (cat) {
            return frag(
              biField('Category title', cat, 'title'),
              subLabel('Bars'),
              objectList(cat.bars, {
                addLabel: 'Add bar',
                itemTitle: function (b) { return b.label; },
                makeNew: function () { return { label: 'Skill', value: 70 }; },
                renderBody: function (b) {
                  return row(
                    textField('Label', b.label, function (v) { b.label = v; }),
                    numberField('Percent (0–100)', b.value, function (v) { b.value = v; })
                  );
                },
              })
            );
          },
        })
      )
    );

    root.appendChild(
      panel(
        'Contact',
        'fa-envelope',
        frag(
          biField('Heading', content.contact, 'heading'),
          biField('Intro text', content.contact, 'intro', true),
          textField('Email', content.contact.email, function (v) { content.contact.email = v; }, { type: 'email' }),
          biField('Location text', content.contact, 'location'),
          subLabel('Social links'),
          objectList(content.contact.social, {
            addLabel: 'Add social link',
            itemTitle: function (s) { return s.title; },
            makeNew: function () { return { icon: 'fab fa-github', url: '', title: '' }; },
            renderBody: function (s) {
              return frag(
                row(
                  iconField('Icon', s.icon, function (v) { s.icon = v; }),
                  textField('Title', s.title, function (v) { s.title = v; })
                ),
                textField('URL', s.url, function (v) { s.url = v; })
              );
            },
          })
        )
      )
    );

    root.appendChild(
      panel('Footer', 'fa-shoe-prints', biField('Footer text', content.footer, 'text'))
    );
  }

  // ---------------------------------------------------------------------------
  // normalize loaded content so every expected field exists
  // ---------------------------------------------------------------------------
  function obj(v) {
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  }
  function str(v) {
    return typeof v === 'string' ? v : v == null ? '' : String(v);
  }
  function strArr(v) {
    return arr(v).map(str);
  }
  function normalize(c) {
    c = obj(c);
    c.brand = c.brand || 'Feras Alkhodari';
    c.pageTitle = str(c.pageTitle) || c.brand;
    c.hero = obj(c.hero);
    c.hero.title = biVal(c.hero.title);
    c.hero.roles = arr(c.hero.roles).map(biVal);
    c.about = obj(c.about);
    c.about.text = biVal(c.about.text);
    c.cv = obj(c.cv);
    c.cv.heading = biVal(c.cv.heading);
    if (!c.cv.heading.en) c.cv.heading.en = 'Resume / CV';
    c.cv.title = biVal(c.cv.title);
    c.cv.description = biVal(c.cv.description);
    c.cv.url = str(c.cv.url);
    // Skills (icon grid) — category title is bilingual; item names stay technical
    c.skills = arr(c.skills).map(function (s) {
      s = obj(s);
      return {
        title: biVal(s.title),
        items: arr(s.items).map(function (it) {
          it = obj(it);
          return { icon: str(it.icon), name: str(it.name) };
        }),
      };
    });
    c.projects = arr(c.projects).map(function (p) {
      p = obj(p);
      return {
        title: biVal(p.title),
        description: biVal(p.description),
        image: str(p.image),
        tech: strArr(p.tech),
        links: arr(p.links).map(function (l) {
          l = obj(l);
          return { label: biVal(l.label), url: str(l.url), icon: str(l.icon) };
        }),
        widgets: arr(p.widgets).map(function (w) {
          w = obj(w);
          return { image: str(w.image), url: str(w.url), label: biVal(w.label), icon: str(w.icon) };
        }),
      };
    });
    c.certificates = arr(c.certificates).map(function (x) {
      x = obj(x);
      return {
        icon: str(x.icon),
        title: biVal(x.title),
        issuer: biVal(x.issuer),
        date: str(x.date),
        description: biVal(x.description),
        skills: strArr(x.skills),
        image: str(x.image),
      };
    });
    c.experience = arr(c.experience).map(function (e) {
      e = obj(e);
      return { title: biVal(e.title), date: biVal(e.date), details: arr(e.details).map(biVal) };
    });
    c.skillBars = arr(c.skillBars).map(function (cat) {
      cat = obj(cat);
      return {
        title: biVal(cat.title),
        bars: arr(cat.bars).map(function (b) {
          b = obj(b);
          return { label: str(b.label), value: Math.max(0, Math.min(100, Number(b.value) || 0)) };
        }),
      };
    });
    c.contact = obj(c.contact);
    c.contact.heading = biVal(c.contact.heading);
    c.contact.intro = biVal(c.contact.intro);
    c.contact.email = str(c.contact.email);
    c.contact.location = biVal(c.contact.location);
    c.contact.social = arr(c.contact.social).map(function (s) {
      s = obj(s);
      return { icon: str(s.icon), url: str(s.url), title: str(s.title) };
    });
    c.footer = obj(c.footer);
    c.footer.text = biVal(c.footer.text);
    return c;
  }

  // ---------------------------------------------------------------------------
  // image compression (keep uploads small + under the request limit)
  // ---------------------------------------------------------------------------
  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error('Could not read file')); };
      r.readAsDataURL(file);
    });
  }
  function loadImg(src) {
    return new Promise(function (resolve, reject) {
      const im = new Image();
      im.onload = function () { resolve(im); };
      im.onerror = function () { reject(new Error('Could not load image')); };
      im.src = src;
    });
  }
  async function compressImage(file, maxDim, quality) {
    maxDim = maxDim || 1600;
    quality = quality || 0.85;
    // Don't rasterize vector / pdf / animated formats — send as-is.
    if (file.type === 'image/svg+xml' || file.type === 'application/pdf' || file.type === 'image/gif') {
      return fileToDataUrl(file);
    }
    const dataUrl = await fileToDataUrl(file);
    let img;
    try {
      img = await loadImg(dataUrl);
    } catch (e) {
      return dataUrl;
    }
    let w = img.naturalWidth || img.width;
    let hgt = img.naturalHeight || img.height;
    if (w > maxDim || hgt > maxDim) {
      const scale = Math.min(maxDim / w, maxDim / hgt);
      w = Math.round(w * scale);
      hgt = Math.round(hgt * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = hgt;
    canvas.getContext('2d').drawImage(img, 0, 0, w, hgt);
    const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    try {
      return canvas.toDataURL(outType, quality);
    } catch (e) {
      return dataUrl;
    }
  }

  // ---------------------------------------------------------------------------
  // API calls
  // ---------------------------------------------------------------------------
  async function uploadImage(dataUrl, filename) {
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: dataUrl, filename: filename }),
    });
    const data = await res.json().catch(function () { return {}; });
    if (res.status === 401) {
      showLogin();
      throw new Error('Session expired — please log in again');
    }
    if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
    return data.url;
  }

  async function save() {
    setStatus('Saving…');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const data = await res.json().catch(function () { return {}; });
      if (res.status === 401) {
        toast('Session expired — please log in again', true);
        showLogin();
        return;
      }
      if (!res.ok) {
        setStatus('Error', 'error');
        toast(data.error || 'Save failed', true);
        return;
      }
      setDirty(false);
      toast('Saved & published! Live on your site within ~10–30s.');
    } catch (err) {
      setStatus('Error', 'error');
      toast('Network error: ' + err.message, true);
    }
  }

  // ---------------------------------------------------------------------------
  // views
  // ---------------------------------------------------------------------------
  function showLogin() {
    byId('editor-view').classList.add('hidden');
    byId('login-view').classList.remove('hidden');
    byId('password').focus();
  }
  function showEditor() {
    byId('login-view').classList.add('hidden');
    byId('editor-view').classList.remove('hidden');
  }

  function renderWarnings(session) {
    const w = byId('warnings');
    clear(w);
    if (session && session.passwordConfigured === false) {
      w.appendChild(
        h('div', { class: 'notice' }, 'ADMIN_PASSWORD is not set on the server, so login is disabled. Set it in your Vercel project settings, then redeploy.')
      );
    }
    if (session && session.storageConfigured === false) {
      w.appendChild(
        h('div', { class: 'notice' }, "Storage isn't configured yet, so saving will fail. Create a Vercel Blob store (see the deploy guide) — the BLOB_READ_WRITE_TOKEN is added automatically.")
      );
    }
  }

  async function loadContentIntoEditor() {
    const res = await fetch('/api/content?fresh=1', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    const data = await res.json().catch(function () { return {}; });
    content = normalize(data);
    renderPanels();
    setDirty(false);
  }

  async function enterEditor() {
    showEditor();
    renderWarnings(lastSession);
    await loadContentIntoEditor();
  }

  // ---------------------------------------------------------------------------
  // backup / import
  // ---------------------------------------------------------------------------
  function exportBackup() {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-content-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function importBackup(file) {
    if (dirty && !window.confirm('Importing will replace your current unsaved edits. Continue?')) return;
    const r = new FileReader();
    r.onload = function () {
      try {
        const data = JSON.parse(r.result);
        content = normalize(data);
        renderPanels();
        markDirty();
        toast('Imported — review, then Save & Publish');
      } catch (e) {
        toast('That file is not valid JSON', true);
      }
    };
    r.readAsText(file);
  }

  // ---------------------------------------------------------------------------
  // wiring
  // ---------------------------------------------------------------------------
  function wire() {
    byId('login-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = byId('login-btn');
      const errEl = byId('login-error');
      errEl.textContent = '';
      btn.disabled = true;
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: byId('password').value }),
        });
        const data = await res.json().catch(function () { return {}; });
        if (!res.ok) {
          errEl.textContent = data.error || 'Login failed';
          btn.disabled = false;
          return;
        }
        byId('password').value = '';
        // refresh session info (storage/password warnings)
        lastSession = await fetch('/api/session', { credentials: 'same-origin' })
          .then(function (r) { return r.json(); })
          .catch(function () { return null; });
        await enterEditor();
      } catch (err) {
        errEl.textContent = 'Network error: ' + err.message;
      }
      btn.disabled = false;
    });

    byId('save-btn').addEventListener('click', save);
    byId('save-btn-2').addEventListener('click', save);

    byId('logout-btn').addEventListener('click', async function () {
      if (dirty && !window.confirm('You have unsaved changes that will be lost. Log out anyway?')) return;
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(function () {});
      dirty = false;
      showLogin();
    });

    byId('export-btn').addEventListener('click', exportBackup);
    byId('import-btn').addEventListener('click', function () { byId('import-file').click(); });
    byId('import-file').addEventListener('change', function () {
      const f = this.files && this.files[0];
      if (f) importBackup(f);
      this.value = '';
    });

    window.addEventListener('beforeunload', function (e) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Ctrl/Cmd+S to save
    window.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !byId('editor-view').classList.contains('hidden')) {
        e.preventDefault();
        save();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // boot
  // ---------------------------------------------------------------------------
  async function boot() {
    wire();
    try {
      lastSession = await fetch('/api/session', { credentials: 'same-origin' }).then(function (r) { return r.json(); });
    } catch (e) {
      lastSession = null;
    }
    if (lastSession && lastSession.authenticated) {
      await enterEditor();
    } else {
      showLogin();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
