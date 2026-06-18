// POST /api/logout  -> clears the session cookie.
const { sendJson, clearSessionCookie } = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }
  clearSessionCookie(res);
  return sendJson(res, 200, { ok: true });
};
