// Shared helpers for the serverless API (CommonJS — runs on Vercel Node runtime).
// Underscore-prefixed files in /api are NOT exposed as routes by Vercel.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const COOKIE_NAME = 'axon_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const CONTENT_BLOB_PATH = 'content.json';

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
function sendJson(res, status, body, extraHeaders) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  }
  res.end(JSON.stringify(body));
}

// Reads and JSON-parses the request body (Vercel usually pre-parses, but we
// handle the raw-stream case too so this works under `vercel dev` and plain Node).
async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// Secrets
// ---------------------------------------------------------------------------
function getSessionSecret() {
  // SESSION_SECRET signs the login cookie. If it is not set we fall back to the
  // admin password so logins still work out of the box — but a dedicated random
  // SESSION_SECRET is strongly recommended (see DEPLOY guide).
  const base = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  if (!base) return '';
  // Derive a dedicated, fixed-length signing key so the raw password is never
  // used directly as the HMAC key (keeps the password's role limited to auth).
  return crypto.createHmac('sha256', 'axon-portfolio-session-key-v1').update(base).digest('hex');
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

// Per-process random key used only to blind the constant-time comparison below.
const COMPARE_KEY = crypto.randomBytes(32);

// Constant-time comparison that leaks neither content nor length: both inputs are
// HMAC'd to a fixed-length digest first, so timing is independent of input length.
function safeEqual(a, b) {
  const ha = crypto.createHmac('sha256', COMPARE_KEY).update(String(a), 'utf8').digest();
  const hb = crypto.createHmac('sha256', COMPARE_KEY).update(String(b), 'utf8').digest();
  return crypto.timingSafeEqual(ha, hb);
}

// ---------------------------------------------------------------------------
// Session token  (compact HMAC-signed token: base64url(payload).base64url(sig))
// ---------------------------------------------------------------------------
function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

function signToken(payload, secret) {
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(crypto.createHmac('sha256', secret).update(body).digest());
  return `${body}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || !secret) return null;
  const dot = token.indexOf('.');
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = b64url(crypto.createHmac('sha256', secret).update(body).digest());
  if (!safeEqual(sig, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(b64urlDecode(body).toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || typeof payload.exp !== 'number' || payload.exp < nowSeconds()) return null;
  return payload;
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function createSessionToken() {
  const secret = getSessionSecret();
  return signToken({ role: 'admin', iat: nowSeconds(), exp: nowSeconds() + SESSION_TTL_SECONDS }, secret);
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------
// decodeURIComponent throws "URI malformed" on values containing a raw "%"
// (very common in 3rd-party cookies: _ga, A/B flags, "50%off", etc.). A single
// bad cookie must NEVER crash the function, so decode each value defensively and
// fall back to the raw string. Our own session cookie is base64url (no "%"), so
// it always round-trips correctly.
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      if (k) out[k] = safeDecode(v);
    }
  });
  return out;
}

function sessionCookie(value, maxAgeSeconds) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Secure',
    `Max-Age=${maxAgeSeconds}`,
  ];
  return parts.join('; ');
}

function setSessionCookie(res, value) {
  res.setHeader('Set-Cookie', sessionCookie(value, SESSION_TTL_SECONDS));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', sessionCookie('', 0));
}

// Returns the session payload if the request carries a valid admin cookie, else null.
// Never throws — a parsing problem just means "not authenticated".
function getSession(req) {
  try {
    const cookies = parseCookies(req);
    return verifyToken(cookies[COOKIE_NAME], getSessionSecret());
  } catch {
    return null;
  }
}

// Guard helper — returns true if authorized, otherwise writes a 401 and returns false.
function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Unauthorized. Please log in.' });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Blob storage (content + uploaded images)
// ---------------------------------------------------------------------------
function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// Local filesystem fallback — DEVELOPMENT ONLY. Never used on Vercel (the FS there
// is read-only), so production always requires a Blob store. This lets you fully
// try the admin page + saving + uploads locally with no Blob token.
function useLocalStore() {
  return !blobConfigured() && !process.env.VERCEL;
}
function storageReady() {
  return blobConfigured() || useLocalStore();
}
const LOCAL_CONTENT_FILE = path.join(process.cwd(), '.local-content.json');
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), '.local-uploads');
const LOCAL_UPLOAD_ROUTE = '/local-uploads';

async function readContentBlob() {
  if (blobConfigured()) {
    const { list } = require('@vercel/blob');
    const { blobs } = await list({ prefix: CONTENT_BLOB_PATH, limit: 100 });
    const match = blobs.find((b) => b.pathname === CONTENT_BLOB_PATH);
    if (!match) return null;
    // Cache-bust so we always read the freshest version after a save.
    const res = await fetch(`${match.url}?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  }
  if (useLocalStore() && fs.existsSync(LOCAL_CONTENT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_CONTENT_FILE, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
}

async function writeContentBlob(content) {
  if (blobConfigured()) {
    const { put } = require('@vercel/blob');
    return put(CONTENT_BLOB_PATH, JSON.stringify(content), {
      access: 'public',
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
  }
  fs.writeFileSync(LOCAL_CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8');
  return { url: 'file://' + LOCAL_CONTENT_FILE };
}

async function putImageBlob(pathname, buffer, contentType) {
  if (blobConfigured()) {
    const { put } = require('@vercel/blob');
    return put(pathname, buffer, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
      addRandomSuffix: true,
    });
  }
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  const ext = (pathname.split('.').pop() || 'bin').replace(/[^a-z0-9]/gi, '') || 'bin';
  const name = crypto.randomBytes(8).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, name), buffer);
  return { url: `${LOCAL_UPLOAD_ROUTE}/${name}` };
}

module.exports = {
  COOKIE_NAME,
  CONTENT_BLOB_PATH,
  sendJson,
  readJsonBody,
  getAdminPassword,
  safeEqual,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  requireAdmin,
  blobConfigured,
  storageReady,
  readContentBlob,
  writeContentBlob,
  putImageBlob,
};
