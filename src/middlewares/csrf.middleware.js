const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function tokensMatch(left, right) {
  if (!left || !right) return false;

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length
    && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getSafeReturnPath(req) {
  const referer = req.get('referer');
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!referer) return '/login';

  try {
    const source = new URL(referer);
    const application = new URL(appUrl);

    if (source.origin !== application.origin) return '/login';
    return `${source.pathname}${source.search}`;
  } catch (error) {
    return '/login';
  }
}

function provideCsrfToken(req, res, next) {
  if (!req.session) return next(new Error('La sesion es necesaria para proteger la solicitud.'));

  if (!req.session.csrfToken) req.session.csrfToken = createToken();
  res.locals.csrfToken = req.session.csrfToken;
  return next();
}

function verifyCsrfToken(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const received = req.get('x-csrf-token') || (req.body && req.body._csrf);
  const expected = req.session && req.session.csrfToken;

  if (tokensMatch(received, expected)) return next();

  if (req.accepts(['json', 'html']) === 'json') {
    return res.status(403).json({ error: 'La solicitud no pudo verificarse. Actualiza la pagina e intentalo nuevamente.' });
  }

  if (req.session) {
    req.session.error = 'La solicitud no pudo verificarse. Actualiza la pagina e intentalo nuevamente.';
  }

  return res.redirect(getSafeReturnPath(req));
}

module.exports = {
  provideCsrfToken,
  verifyCsrfToken
};
