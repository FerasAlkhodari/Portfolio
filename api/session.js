// GET /api/session  -> { authenticated: boolean }  (used by the admin page on load).
const { sendJson, getSession, storageReady, getAdminPassword } = require('./_lib');

module.exports = async function handler(req, res) {
  const session = getSession(req);
  return sendJson(res, 200, {
    authenticated: Boolean(session),
    // Surfaced so the admin UI can warn if the server is half-configured.
    passwordConfigured: Boolean(getAdminPassword()),
    storageConfigured: storageReady(),
  });
};
