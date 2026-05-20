function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  req.session.error = 'Debes iniciar sesión para acceder al sistema.';
  return res.redirect('/login');
}

function isGuest(req, res, next) {
  if (!req.session || !req.session.user) {
    return next();
  }

  const rol = req.session.user.rol;

  const routes = {
    paciente: '/paciente/dashboard',
    medico: '/medico/dashboard',
    enfermera: '/enfermera/dashboard',
    administrativo: '/admin/dashboard'
  };

  return res.redirect(routes[rol] || '/login');
}

module.exports = {
  isAuthenticated,
  isGuest
};