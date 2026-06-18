// POST /api/upload  (admin only)
//   Body: { filename: string, dataUrl: "data:image/...;base64,..." }
//   Stores the image in Vercel Blob and returns { url }.
const { sendJson, readJsonBody, requireAdmin, storageReady, putImageBlob } = require('./_lib');

const ALLOWED = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
};
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB decoded

function slugify(name) {
  return String(name || 'file')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;

  if (!storageReady()) {
    return sendJson(res, 503, {
      error:
        'Storage is not configured. Create a Vercel Blob store (BLOB_READ_WRITE_TOKEN). See the deploy guide.',
    });
  }

  const body = await readJsonBody(req);
  const dataUrl = body && typeof body.dataUrl === 'string' ? body.dataUrl : '';

  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) {
    return sendJson(res, 400, { error: 'Expected a base64 data URL.' });
  }
  const contentType = match[1].toLowerCase();
  const ext = ALLOWED[contentType];
  if (!ext) {
    return sendJson(res, 415, {
      error: `Unsupported file type "${contentType}". Allowed: PNG, JPG, WEBP, GIF, SVG, PDF.`,
    });
  }

  let buffer;
  try {
    buffer = Buffer.from(match[2], 'base64');
  } catch {
    return sendJson(res, 400, { error: 'Could not decode the file.' });
  }
  if (!buffer.length) {
    return sendJson(res, 400, { error: 'Empty file.' });
  }
  if (buffer.length > MAX_BYTES) {
    return sendJson(res, 413, {
      error: 'File is too large (max 4 MB). The admin page shrinks large images automatically — try again.',
    });
  }

  const pathname = `uploads/${slugify(body.filename)}.${ext}`;
  try {
    const result = await putImageBlob(pathname, buffer, contentType);
    return sendJson(res, 200, { url: result.url });
  } catch (err) {
    return sendJson(res, 500, {
      error: 'Upload failed.',
      detail: String((err && err.message) || err),
    });
  }
};
