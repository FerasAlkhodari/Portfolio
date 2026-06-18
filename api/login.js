// POST /api/login  { password }  -> sets a secure session cookie on success.
const {
  sendJson,
  readJsonBody,
  getAdminPassword,
  safeEqual,
  createSessionToken,
  setSessionCookie,
} = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return sendJson(res, 500, {
      error:
        'Admin password is not configured on the server. Set the ADMIN_PASSWORD environment variable in Vercel.',
    });
  }

  const body = await readJsonBody(req);
  const password = body && typeof body.password === 'string' ? body.password : '';

  if (!password || !safeEqual(password, adminPassword)) {
    return sendJson(res, 401, { error: 'Incorrect password.' });
  }

  setSessionCookie(res, createSessionToken());
  return sendJson(res, 200, { ok: true });
};
