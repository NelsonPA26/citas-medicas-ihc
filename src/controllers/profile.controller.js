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
      u.activo,
      u.debe_cambiar_password,
      DATE_FORMAT(u.fecha_creacion, '%Y-%m-%d') AS fecha_creacion
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
      req.session.error = 'No se encontró la información de tu perfil. Vuelve a ingresar o solicita apoyo a administración.';
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
    req.session.error = 'No se pudo cargar tu perfil. Actualiza la página o vuelve a iniciar sesión si el problema continúa.';
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

    const correoLimpio = (correo || '').trim().toLowerCase();
    const telefonoLimpio = (telefono || '').trim().replace(/\s/g, '');
    const direccionLimpia = (direccion || '').trim().replace(/\s{2,}/g, ' ');

    if (!correoLimpio || !telefonoLimpio || !fecha_nacimiento || !sexo) {
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

    if (
      Number.isNaN(fechaNacimiento.getTime())
      || fechaNacimiento >= hoy
      || fechaNacimiento.getFullYear() === hoy.getFullYear()
    ) {
      req.session.error = 'La fecha de nacimiento no puede ser de hoy, futura ni del año actual.';
      return res.redirect('/perfil');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      req.session.error = 'Ingresa un correo electrónico válido.';
      return res.redirect('/perfil');
    }

    if (!/^\d{9}$/.test(telefonoLimpio)) {
      req.session.error = 'El teléfono debe tener exactamente 9 dígitos.';
      return res.redirect('/perfil');
    }

    const [existing] = await db.query(
      `
      SELECT 'persona' AS origen
      FROM persona
      WHERE correo = ?
      AND id_persona <> ?

      UNION

      SELECT 'usuario' AS origen
      FROM usuario
      WHERE username = ?
      AND id_usuario <> ?

      LIMIT 1
      `,
      [
        correoLimpio,
        req.session.user.id_persona,
        correoLimpio,
        req.session.user.id_usuario
      ]
    );

    if (existing.length > 0) {
      req.session.error = 'El correo ingresado ya está registrado por otro usuario.';
      return res.redirect('/perfil');
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query(
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
          correoLimpio,
          telefonoLimpio,
          direccionLimpia || null,
          fecha_nacimiento,
          sexo,
          req.session.user.id_persona
        ]
      );

      await connection.query(
        `
        UPDATE usuario
        SET username = ?
        WHERE id_usuario = ?
        `,
        [correoLimpio, req.session.user.id_usuario]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    req.session.user.correo = correoLimpio;
    req.session.user.username = correoLimpio;

    req.session.success = 'Perfil actualizado correctamente.';
    return res.redirect('/perfil');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo actualizar tu perfil. Revisa correo, teléfono, fecha de nacimiento y sexo antes de intentarlo nuevamente.';
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

    if (
      new_password.length < 8 ||
      !/[A-Z]/.test(new_password) ||
      !/[a-z]/.test(new_password) ||
      !/\d/.test(new_password) ||
      !/[^A-Za-z0-9]/.test(new_password)
    ) {
      req.session.error = 'La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.';
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
    req.session.error = 'No se pudo cambiar la contraseña. Verifica la contraseña actual y que la nueva cumpla los requisitos.';
    return res.redirect('/perfil');
  }
};
