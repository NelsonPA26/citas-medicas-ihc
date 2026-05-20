function allowRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.session.error = 'Debes iniciar sesión para acceder al sistema.';
      return res.redirect('/login');
    }

    const rolUsuario = req.session.user.rol;

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).send(`
        <h1>Acceso denegado</h1>
        <p>No tienes permisos para acceder a esta sección.</p>
        <a href="/login">Volver</a>
      `);
    }

    next();
  };
}

module.exports = {
  allowRoles
};