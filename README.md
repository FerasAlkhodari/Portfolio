# Feras Alkhodari — Portfolio

A personal portfolio website for **Feras Alkhodari**, a Software Engineer. It's a single‑page, responsive site with light/dark themes, animated effects, a certificates gallery with a modal viewer, and a contact form. It is deployed via **GitHub Pages**.

---

## Tech Stack

| Area | Technology |
|---|---|
| Markup / Styling | Plain **HTML5** + **CSS3** (`styles.css`, ~38 KB, hand‑written) |
| Scripting | Vanilla **JavaScript** (no framework runtime required for the core site) |
| Build / Dev server | **Vite 4** |
| Icons | Font Awesome 6.4 (loaded via CDN) |
| Optional / installed libs | `three`, `gsap` (3D background), `aos`, `swiper`, `react` + `react-dom`, `tailwindcss` |
| PWA | `service-worker.js` (offline caching) |

> **Note on dependencies:** `package.json` lists React, Tailwind, Swiper, and AOS, but the live site (`index.html`) is built with plain HTML/CSS/JS. Only `three` + `gsap` are actually imported (by `js/background.js`, which is currently **not** wired into `index.html`). The React/Tailwind deps appear to be scaffolding that isn't used yet. Treat them as optional until integrated.

---

## Project Structure

```
Portfolio/
├── index.html              # The entire page: nav, hero, about, skills,
│                           #   projects, certificates, contact, experience
├── styles.css              # All styling (theme variables, layout, animations, modal)
├── script.js               # Core interactivity (loaded by index.html)
├── service-worker.js       # PWA offline cache (CACHE_NAME = 'portfolio-v1')
│
├── js/
│   ├── particles.js        # ParticleNetwork canvas effect (loaded by index.html)
│   ├── background.js        # Three.js + GSAP 3D background (module; NOT yet wired in)
│   └── components/
│       └── ProjectCard.js  # Standalone component (not referenced by index.html)
│
├── images/
│   ├── hero-bg.svg
│   ├── pattern.svg
│   └── certificates/       # Certificate scans shown in the modal viewer
│       ├── AD183-7.0.jpg
│       ├── RH124-9.0.jpg
│       ├── WebCource.jpg
│       └── FlutterCourse.jpg
│
├── package.json            # Scripts + dependencies
├── vite.config.js          # Dev server on port 3000, build output to dist/
├── jsconfig.json           # Path alias @/* -> ./*, ES2020
└── .gitignore              # node_modules, .DS_Store, *.log
```

---

## What's in `script.js`

The main behavior file (loaded directly by `index.html`):

- **Typewriter effect** — rotates through "Backend Developer.", "Software Engineer.", "Tech Enthusiast." in the hero.
- **Mobile menu toggle** — hamburger open/close, close on outside click or link click.
- **Theme switcher** — light/dark toggle, persisted in `localStorage` (`theme` key); defaults to light.
- **Navbar scroll behavior** — hides on scroll down, shows on scroll up, adds shadow/`scrolled` class.
- **Certificate modal** — `viewCertificate()`, `closeCertificateModal()`, `openCertificateInNewTab()`; handles images, PDFs, and HTML; closes on Escape / outside click.
- **Contact form** — `sendEmail()` opens the user's mail client via a `mailto:` link (no backend).

`js/particles.js` adds an animated particle‑network canvas background.

---

## Page Sections (in `index.html`)

`Home (hero)` → `About` → `Skills` → `Projects` → `Certificates` → `Contact` → `Experience` → `Skills bars`

Featured projects link out to: **SymptomsEaseAI** and **ERP Lite**.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (for the Vite dev server / build)

### Install
```bash
npm install
```

### Run locally (dev server)
```bash
npm start          # vite dev server -> http://localhost:3000
```

> Because the site is plain HTML/CSS/JS, you can also just open `index.html` directly in a browser, or serve the folder with any static server (e.g. `npx serve`). Vite is only needed if you start using the ES‑module imports (e.g. `js/background.js`).

### Build for production
```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

---

## Available npm Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Vite dev server (port 3000) |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

---

## Deployment

The site is published with **GitHub Pages** (the most recent commit was "Force GitHub Pages refresh"). Since it's a static site, Pages can serve the repo root directly, or you can deploy the `dist/` folder produced by `npm run build`.

A `service-worker.js` provides basic offline caching. If you change cached assets, bump `CACHE_NAME` (currently `portfolio-v1`) so browsers fetch the new versions.

---

## How to Work on This Project

- **Edit content** (text, projects, certificates, skills): edit `index.html` directly — everything is inline.
- **Edit styling**: `styles.css` holds all styles, including theme variables and the certificate modal.
- **Edit behavior**: `script.js` for core interactivity; `js/particles.js` for the background effect.
- **Add a certificate**: drop the image in `images/certificates/`, add a `.certificate-card` block in `index.html`, and point its `onclick="viewCertificate('images/certificates/<file>')"` at the new file.
- **Add a project**: copy a `.project-card` block in the Projects section of `index.html` and update the title, description, tech tags, and link.

### Cleanup opportunities (optional)
- Remove `console.log` calls in `script.js` (mobile menu handler) before publishing.
- Decide whether to use or remove the unused deps (React, Tailwind, Swiper, AOS) and the unwired files (`js/background.js`, `js/components/ProjectCard.js`). Removing them shrinks `node_modules` and avoids confusion.
- Comments in `script.js` mix Arabic and English — fine to leave, but worth normalizing if others contribute.

---

## Contact

- **Email:** ferasalkhodari51@gmail.com
- **GitHub:** [FerasAlhkodari](https://github.com/FerasAlhkodari)
- **LinkedIn:** [feras-alkhodari](https://www.linkedin.com/in/feras-alkhodari-9b8598298/)

---

© 2025 Feras Alkhodari. All rights reserved.
