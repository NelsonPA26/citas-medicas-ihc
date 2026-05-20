function allowRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.session.error = 'Debes iniciar sesión para acceder al sistema.';
      return res.redirect('/login');
    }

    const rolUsuario = req.session.user.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      req.session.error = 'No tienes permisos para acceder a esta sección.';
      return res.redirect('/login');
    }

    next();
  };
}

module.exports = {
  allowRoles
};