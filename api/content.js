// /api/content
//   GET  -> public; returns the saved content (or the seed default).
//   POST -> admin only; saves new content to Blob storage.
const {
  sendJson,
  readJsonBody,
  requireAdmin,
  storageReady,
  readContentBlob,
  writeContentBlob,
} = require('./_lib');
const seed = require('./_seed');

// Hard cap so a runaway payload (e.g. huge embedded images) can't be stored.
const MAX_CONTENT_BYTES = 4 * 1024 * 1024; // 4 MB

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    let content = null;
    try {
      content = await readContentBlob();
    } catch (err) {
      // If storage read fails for any reason, fall back to the seed so the
      // public site never breaks.
      content = null;
    }
    const isFresh = req.query && (req.query.fresh === '1' || req.query.fresh === 'true');
    const headers = isFresh
      ? { 'Cache-Control': 'no-store, max-age=0' }
      : { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' };
    return sendJson(res, 200, content || seed, headers);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    if (!requireAdmin(req, res)) return;

    if (!storageReady()) {
      return sendJson(res, 503, {
        error:
          'Storage is not configured. Create a Vercel Blob store and the BLOB_READ_WRITE_TOKEN will be added automatically. (See the deploy guide.)',
      });
    }

    const body = await readJsonBody(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendJson(res, 400, { error: 'Invalid content payload.' });
    }

    const serialized = JSON.stringify(body);
    if (Buffer.byteLength(serialized, 'utf8') > MAX_CONTENT_BYTES) {
      return sendJson(res, 413, {
        error:
          'Content is too large to save. Try smaller / fewer embedded images, or host large images via the upload button (which stores them separately).',
      });
    }

    try {
      // Always stamp the version so old data can be migrated later if needed.
      body.version = body.version || seed.version || 1;
      await writeContentBlob(body);
      return sendJson(res, 200, { ok: true });
    } catch (err) {
      return sendJson(res, 500, {
        error: 'Failed to save content.',
        detail: String((err && err.message) || err),
      });
    }
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
};
