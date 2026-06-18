/*
 * Minimal build step for Vercel.
 *
 * The site is plain static HTML/CSS/JS — there is nothing to compile. This script
 * just copies the static assets into a clean `dist/` folder so Vercel serves ONLY
 * those files (and never node_modules or source config). The serverless functions
 * in /api are deployed separately by Vercel and are not touched here.
 */
const fs = require('fs');
const path = require('path');

const OUT = 'dist';

// Static assets that make up the public site (+ the admin page).
const ASSETS = [
  'index.html',
  'admin.html',
  'styles.css',
  'script.js',
  'service-worker.js',
  'css',
  'js',
  'images',
  'files',
];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let copied = 0;
for (const item of ASSETS) {
  if (fs.existsSync(item)) {
    fs.cpSync(item, path.join(OUT, item), { recursive: true });
    copied += 1;
  }
}

console.log(`Static build complete: copied ${copied} asset(s) into ./${OUT}`);
