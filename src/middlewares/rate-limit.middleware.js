function createRateLimiter({ windowMs, maxRequests, message }) {
  const attempts = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const current = attempts.get(key);

    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxRequests) {
      if (req.session) req.session.error = message;
      return res.redirect(req.path === '/forgot-password' ? '/forgot-password' : '/login');
    }

    current.count += 1;
    attempts.set(key, current);
    return next();
  };
}

module.exports = {
  loginRateLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 12,
    message: 'Se alcanzaron demasiados intentos desde esta conexion. Espera unos minutos antes de volver a intentarlo.'
  }),
  passwordRecoveryRateLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Se alcanzaron demasiadas solicitudes de recuperacion. Espera unos minutos antes de volver a intentarlo.'
  })
};
