const db = require('../config/database');

async function isAuthenticated(req, res, next) {
  try {
    if (!req.session || !req.session.user) {
      req.session.error = 'Debes iniciar sesión para acceder al sistema.';
      return res.redirect('/login');
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id_usuario,
        u.id_persona,
        u.username,
        u.rol,
        u.activo,
        p.nombres,
        p.apellido_paterno,
        p.correo
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      WHERE u.id_usuario = ?
      LIMIT 1
      `,
      [req.session.user.id_usuario]
    );

    if (rows.length === 0 || rows[0].activo !== 1) {
      return req.session.destroy(() => {
        res.redirect('/login');
      });
    }

    req.session.user = {
      id_usuario: rows[0].id_usuario,
      id_persona: rows[0].id_persona,
      username: rows[0].username,
      rol: rows[0].rol,
      nombres: rows[0].nombres,
      apellido_paterno: rows[0].apellido_paterno,
      correo: rows[0].correo
    };

    return next();
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo validar la sesión.';
    return res.redirect('/login');
  }
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