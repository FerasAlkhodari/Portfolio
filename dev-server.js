/*
 * Local development server (NOT used in production — Vercel runs /api as real
 * serverless functions). This lets you try the whole thing locally:
 *   - serves the static site (index.html) and the admin page (/admin)
 *   - runs the /api functions in-process
 *   - uses a filesystem storage fallback so login + edit + upload + save all work
 *     with NO Vercel Blob token needed.
 *
 * Run:  npm run dev      (or: node dev-server.js)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;

// --- load .env.local (simple KEY=VALUE parser) ---
(function loadEnv() {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) return;
  fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
      if (m && !line.trim().startsWith('#')) {
        let v = m[2];
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (process.env[m[1]] === undefined) process.env[m[1]] = v;
      }
    });
})();
// Ensure the local filesystem storage fallback is active (not "on Vercel").
delete process.env.VERCEL;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const apiHandlers = {
  '/api/session': './api/session.js',
  '/api/login': './api/login.js',
  '/api/logout': './api/logout.js',
  '/api/content': './api/content.js',
  '/api/upload': './api/upload.js',
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.setHeader('Content-Type', MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  let pathname = decodeURIComponent(u.pathname);

  // API routes -> in-process function handlers
  if (pathname.startsWith('/api/')) {
    const mod = apiHandlers[pathname];
    if (!mod) {
      res.statusCode = 404;
      return res.end('Unknown API route');
    }
    req.query = Object.fromEntries(u.searchParams.entries());
    const handler = require(mod);
    Promise.resolve(handler(req, res)).catch((e) => {
      res.statusCode = 500;
      res.end('Handler error: ' + e.message);
    });
    return;
  }

  // Locally uploaded images. The /local-uploads/<name> URL maps to the on-disk
  // ".local-uploads" folder (dotted so it stays git-ignored). basename() blocks traversal.
  if (pathname.startsWith('/local-uploads/')) {
    return serveFile(res, path.join(ROOT, '.local-uploads', path.basename(pathname)));
  }

  // Static site (with simple cleanUrls: /admin -> admin.html)
  if (pathname === '/') pathname = '/index.html';
  let filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }
  serveFile(res, filePath);
});

const PORTS = [Number(process.env.PORT) || 3000, 5050, 8080];
(function listen(i) {
  const port = PORTS[i];
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && i + 1 < PORTS.length) {
      listen(i + 1);
    } else {
      console.error(err.message);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    console.log('\n  Portfolio dev server running:');
    console.log(`    Site   ->  http://localhost:${port}/`);
    console.log(`    Admin  ->  http://localhost:${port}/admin   (password from .env.local)`);
    console.log(`    Storage:   ${process.env.BLOB_READ_WRITE_TOKEN ? 'Vercel Blob' : 'local filesystem fallback (.local-content.json)'}`);
    console.log('\n  Press Ctrl+C to stop.\n');
  });
})(0);
