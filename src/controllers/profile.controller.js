const bcrypt = require('bcrypt');
const db = require('../config/database');

function getDashboardByRole(rol) {
  const routes = {
    paciente: '/paciente/dashboard',
    medico: '/medico/dashboard',
    enfermera: '/enfermera/dashboard',
    administrativo: '/admin/dashboard'
  };

  return routes[rol] || '/login';
}

async function getProfileByUser(user) {
  const [personaRows] = await db.query(
    `
    SELECT 
      p.id_persona,
      p.nombres,
      p.apellido_paterno,
      p.apellido_materno,
      p.dni,
      DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
      p.sexo,
      p.correo,
      p.telefono,
      p.direccion,
      u.id_usuario,
      u.username,
      u.rol,
      u.activo
    FROM usuario u
    INNER JOIN persona p ON u.id_persona = p.id_persona
    WHERE u.id_usuario = ?
    LIMIT 1
    `,
    [user.id_usuario]
  );

  if (personaRows.length === 0) return null;

  const profile = personaRows[0];
  let extra = null;

  if (profile.rol === 'paciente') {
    const [rows] = await db.query(
      `
      SELECT 
        codigo_estudiante,
        escuela,
        facultad,
        contexto_universitario
      FROM paciente
      WHERE id_persona = ?
      LIMIT 1
      `,
      [profile.id_persona]
    );

    extra = rows[0] || null;
  }

  if (profile.rol === 'medico') {
    const [rows] = await db.query(
      `
      SELECT 
        especialidad,
        numero_colegiatura,
        turno
      FROM medico
      WHERE id_persona = ?
      LIMIT 1
      `,
      [profile.id_persona]
    );

    extra = rows[0] || null;
  }

  if (profile.rol === 'enfermera') {
    const [rows] = await db.query(
      `
      SELECT 
        area,
        turno
      FROM enfermera
      WHERE id_persona = ?
      LIMIT 1
      `,
      [profile.id_persona]
    );

    extra = rows[0] || null;
  }

  if (profile.rol === 'administrativo') {
    const [rows] = await db.query(
      `
      SELECT 
        cargo,
        anexo
      FROM administrativo
      WHERE id_persona = ?
      LIMIT 1
      `,
      [profile.id_persona]
    );

    extra = rows[0] || null;
  }

  return { profile, extra };
}

exports.showProfile = async (req, res) => {
  try {
    const data = await getProfileByUser(req.session.user);

    if (!data) {
      req.session.error = 'No se encontró la información de tu perfil.';
      return res.redirect(getDashboardByRole(req.session.user.rol));
    }

    res.render('profile/index', {
      title: 'Mi perfil',
      layout: 'layouts/dashboard',
      profile: data.profile,
      extra: data.extra
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar tu perfil.';
    return res.redirect(getDashboardByRole(req.session.user.rol));
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const {
      correo,
      telefono,
      direccion,
      fecha_nacimiento,
      sexo
    } = req.body;

    if (!correo || !telefono || !fecha_nacimiento || !sexo) {
      req.session.error = 'El correo, teléfono, fecha de nacimiento y sexo son obligatorios.';
      return res.redirect('/perfil');
    }

    const sexosPermitidos = ['Masculino', 'Femenino', 'Otro', 'No especifica'];

    if (!sexosPermitidos.includes(sexo)) {
      req.session.error = 'Selecciona una opción válida en el campo sexo.';
      return res.redirect('/perfil');
    }

    const fechaNacimiento = new Date(`${fecha_nacimiento}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaNacimiento > hoy) {
      req.session.error = 'La fecha de nacimiento no puede ser futura.';
      return res.redirect('/perfil');
    }

    const [existing] = await db.query(
      `
      SELECT id_persona
      FROM persona
      WHERE correo = ?
      AND id_persona <> ?
      LIMIT 1
      `,
      [correo, req.session.user.id_persona]
    );

    if (existing.length > 0) {
      req.session.error = 'El correo ingresado ya está registrado por otro usuario.';
      return res.redirect('/perfil');
    }

    await db.query(
      `
      UPDATE persona
      SET 
        correo = ?,
        telefono = ?,
        direccion = ?,
        fecha_nacimiento = ?,
        sexo = ?
      WHERE id_persona = ?
      `,
      [
        correo,
        telefono,
        direccion || null,
        fecha_nacimiento,
        sexo,
        req.session.user.id_persona
      ]
    );

    req.session.user.correo = correo;

    req.session.success = 'Perfil actualizado correctamente.';
    return res.redirect('/perfil');
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al actualizar tu perfil.';
    return res.redirect('/perfil');
  }
};


exports.changePassword = async (req, res) => {
  try {
    const {
      current_password,
      new_password,
      confirm_password
    } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      req.session.error = 'Completa todos los campos para cambiar tu contraseña.';
      return res.redirect('/perfil');
    }

    if (new_password.length < 6) {
      req.session.error = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return res.redirect('/perfil');
    }

    if (new_password !== confirm_password) {
      req.session.error = 'La nueva contraseña y su confirmación no coinciden.';
      return res.redirect('/perfil');
    }

    const [rows] = await db.query(
      `
      SELECT password_hash
      FROM usuario
      WHERE id_usuario = ?
      LIMIT 1
      `,
      [req.session.user.id_usuario]
    );

    if (rows.length === 0) {
      req.session.error = 'No se encontró el usuario.';
      return res.redirect('/perfil');
    }

    const passwordOk = await bcrypt.compare(current_password, rows[0].password_hash);

    if (!passwordOk) {
      req.session.error = 'La contraseña actual no es correcta.';
      return res.redirect('/perfil');
    }

    const samePassword = await bcrypt.compare(new_password, rows[0].password_hash);

    if (samePassword) {
      req.session.error = 'La nueva contraseña debe ser diferente a la contraseña actual.';
      return res.redirect('/perfil');
    }

    const newHash = await bcrypt.hash(new_password, 10);

    await db.query(
      `
      UPDATE usuario
      SET 
        password_hash = ?,
        debe_cambiar_password = 0
      WHERE id_usuario = ?
      `,
      [newHash, req.session.user.id_usuario]
    );

    req.session.success = 'Contraseña actualizada correctamente.';
    return res.redirect('/perfil');
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al cambiar la contraseña.';
    return res.redirect('/perfil');
  }
};