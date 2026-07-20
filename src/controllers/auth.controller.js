const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/database');
const { sendPasswordResetEmail } = require('../services/smtp-mail.service');

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 10;
const LOGIN_AUTH_ERROR = 'Correo o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente.';

function redirectByRole(rol) {
  const routes = {
    paciente: '/paciente/dashboard',
    medico: '/medico/dashboard',
    enfermera: '/enfermera/dashboard',
    administrativo: '/admin/dashboard'
  };

  return routes[rol] || '/login';
}

function passwordFuerte(value) {
  return (
    typeof value === 'string' &&
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function limpiarTexto(value) {
  return (value || '').trim().replace(/\s{2,}/g, ' ');
}

function textoPersonaValido(value, min = 2, max = 80) {
  const text = limpiarTexto(value);
  if (text.length < min || text.length > max) return false;
  return /^[\p{L} ]+$/u.test(text);
}

function mensajeTextoPersona(value, fieldLabel) {
  const text = limpiarTexto(value);
  if (text.length < 2) return 'Revisa este dato. Parece estar incompleto.';
  return `Escribe ${fieldLabel} usando solo letras y espacios.`;
}

function dniValido(value) {
  return /^[0-9]{8}$/.test(value || '');
}

function telefonoValido(value) {
  return /^[0-9]{9}$/.test(value || '');
}

function correoValido(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function conservarCorreoLogin(req, value) {
  req.session.oldLoginIdentifier = (value || '').trim().toLowerCase();
}

exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Iniciar Sesión'
  });
};

exports.showPrivacy = (req, res) => {
  res.render('auth/privacy', {
    title: 'Privacidad y tratamiento de datos'
  });
};

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(error => {
      if (error) reject(error);
      else resolve();
    });
  });
}

exports.login = async (req, res) => {
  try {
    const { identificador, password } = req.body;

    const correoInstitucional = (identificador || '').trim().toLowerCase();

    if (!correoInstitucional || !password) {
      conservarCorreoLogin(req, correoInstitucional);
      req.session.error = 'Ingresa tu correo institucional y contraseña.';
      return res.redirect('/login');
    }

    if (!correoValido(correoInstitucional)) {
      conservarCorreoLogin(req, correoInstitucional);
      req.session.error = 'Ingresa un correo institucional válido.';
      req.session.errorField = 'identificador';
      return res.redirect('/login');
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id_usuario,
        u.username,
        u.password_hash,
        u.rol,
        u.activo,
        u.debe_cambiar_password,
        u.failed_attempts,
        u.locked_until,
        adm.nivel_acceso AS nivel_acceso_administrativo,
        adm.cargo AS area_administrativa,
        p.id_persona,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.correo
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      LEFT JOIN administrativo adm ON adm.id_persona = u.id_persona
      WHERE p.correo = ?
      LIMIT 1
      `,
      [correoInstitucional]
    );

    if (rows.length === 0) {
      conservarCorreoLogin(req, correoInstitucional);
      req.session.error = LOGIN_AUTH_ERROR;
      req.session.errorField = 'credentials';
      return res.redirect('/login');
    }

    const user = rows[0];

    if (!user.activo) {
      conservarCorreoLogin(req, correoInstitucional);
      req.session.error = LOGIN_AUTH_ERROR;
      req.session.errorField = 'credentials';
      return res.redirect('/login');
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      conservarCorreoLogin(req, correoInstitucional);
      req.session.error = LOGIN_AUTH_ERROR;
      req.session.errorField = 'credentials';
      return res.redirect('/login');
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      const failedAttempts = Number(user.failed_attempts || 0) + 1;

      if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        await db.query(
          `
          UPDATE usuario
          SET failed_attempts = ?,
              locked_until = DATE_ADD(NOW(), INTERVAL ${LOGIN_LOCK_MINUTES} MINUTE)
          WHERE id_usuario = ?
          `,
          [failedAttempts, user.id_usuario]
        );

        conservarCorreoLogin(req, correoInstitucional);
        req.session.error = LOGIN_AUTH_ERROR;
        req.session.errorField = 'credentials';
        return res.redirect('/login');
      }

      await db.query(
        `
        UPDATE usuario
        SET failed_attempts = ?
        WHERE id_usuario = ?
        `,
        [failedAttempts, user.id_usuario]
      );

      conservarCorreoLogin(req, correoInstitucional);
      req.session.error = LOGIN_AUTH_ERROR;
      req.session.errorField = 'credentials';
      return res.redirect('/login');
    }

    await db.query(
      `
      UPDATE usuario
      SET failed_attempts = 0,
          locked_until = NULL
      WHERE id_usuario = ?
      `,
      [user.id_usuario]
    );

    await regenerateSession(req);

    req.session.user = {
      id_usuario: user.id_usuario,
      id_persona: user.id_persona,
      username: user.username,
      rol: user.rol,
      nivel_acceso_administrativo: user.nivel_acceso_administrativo || null,
      area_administrativa: user.area_administrativa || null,
      nombres: user.nombres,
      apellido_paterno: user.apellido_paterno,
      correo: user.correo
    };

    if (user.debe_cambiar_password) {
      req.session.success = 'Por seguridad, cambia tu contraseña temporal desde esta sección.';
      return res.redirect('/perfil');
    }

    return res.redirect(redirectByRole(user.rol));
  } catch (error) {
    console.error(error);

    req.session.error = 'No se pudo iniciar sesión. Verifica tu conexión e inténtalo nuevamente.';
    return res.redirect('/login');
  }
};

exports.showRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Crear Cuenta',
    error: null,
    success: null,
    old: {}
  });
};

exports.register = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono,
      password,
      confirm_password,
      terms_accepted,
    } = req.body;

    const nombresLimpio = limpiarTexto(nombres);
    const apellidoPaternoLimpio = limpiarTexto(apellido_paterno);
    const apellidoMaternoLimpio = limpiarTexto(apellido_materno);
    const dniLimpio = limpiarTexto(dni);
    const correoLimpio = limpiarTexto(correo).toLowerCase();
    const telefonoLimpio = limpiarTexto(telefono).replace(/\s/g, '');
    const termsAccepted = terms_accepted === 'on' || terms_accepted === 'true' || terms_accepted === '1';

    const old = {
      nombres: nombresLimpio,
      apellido_paterno: apellidoPaternoLimpio,
      apellido_materno: apellidoMaternoLimpio,
      dni: dniLimpio,
      correo: correoLimpio,
      telefono: telefonoLimpio,
      terms_accepted: termsAccepted
    };

    if (!nombresLimpio || !apellidoPaternoLimpio || !dniLimpio || !correoLimpio || !telefonoLimpio || !password || !confirm_password) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Completa los campos obligatorios para continuar.',
        success: null,
        old
      });
    }

    if (!termsAccepted) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Acepta los términos y condiciones para crear tu cuenta.',
        success: null,
        old
      });
    }

    if (!textoPersonaValido(nombresLimpio)) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: mensajeTextoPersona(nombresLimpio, 'tu nombre'),
        success: null,
        old
      });
    }

    if (!textoPersonaValido(apellidoPaternoLimpio)) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: mensajeTextoPersona(apellidoPaternoLimpio, 'tu apellido paterno'),
        success: null,
        old
      });
    }

    if (apellidoMaternoLimpio && !textoPersonaValido(apellidoMaternoLimpio)) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: mensajeTextoPersona(apellidoMaternoLimpio, 'tu apellido materno'),
        success: null,
        old
      });
    }

    if (!dniValido(dniLimpio)) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Ingresa los 8 números de tu DNI.',
        success: null,
        old
      });
    }

    if (!correoValido(correoLimpio)) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Ingresa un correo válido, por ejemplo usuario@correo.com.',
        success: null,
        old
      });
    }

    if (!telefonoValido(telefonoLimpio)) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Ingresa un número de 9 dígitos.',
        success: null,
        old
      });
    }

    if (password !== confirm_password) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Las contraseñas no coinciden.',
        success: null,
        old 
      });
    }

    if (!passwordFuerte(password)) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Revisa la contraseña según las indicaciones mostradas.',
        success: null,
        old
      });
    }
    const [existing] = await db.query(
      `
      SELECT p.id_persona
      FROM persona p
      LEFT JOIN usuario u ON p.id_persona = u.id_persona
      WHERE p.dni = ? OR p.correo = ? OR u.username = ?
      `,
      [dniLimpio, correoLimpio, correoLimpio]
    );

    if (existing.length > 0) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'El DNI o correo ya se encuentra registrado.',
        success: null,
        old
      });
    }

    await connection.beginTransaction();

    const [personaResult] = await connection.query(
      `
      INSERT INTO persona (
        nombres,
        apellido_paterno,
        apellido_materno,
        dni,
        correo,
        telefono
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [nombresLimpio, apellidoPaternoLimpio, apellidoMaternoLimpio || null, dniLimpio, correoLimpio, telefonoLimpio]
    );

    const idPersona = personaResult.insertId;
    const passwordHash = await bcrypt.hash(password, 10);

    await connection.query(
      `
      INSERT INTO usuario (
        id_persona,
        username,
        password_hash,
        rol,
        activo,
        debe_cambiar_password
      ) VALUES (?, ?, ?, 'paciente', 1, 0)
      `,
      [idPersona, correoLimpio, passwordHash]
    );

    await connection.query(
      `
      INSERT INTO paciente (
        id_persona,
        contexto_universitario
      ) VALUES (?, ?)
      `,
      [idPersona, 'Estudiante UNT']
    );

    await connection.commit();

    req.session.success = 'Cuenta creada correctamente. Ahora puedes iniciar sesión.';
    return res.redirect('/login');
    
  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.render('auth/register', {
      title: 'Crear Cuenta',
      error: 'No se pudo crear la cuenta. Revisa los datos ingresados e inténtalo nuevamente.',
      success: null,
      old: req.body
    });
  } finally {
    connection.release();
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

exports.showForgotPassword = (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Recuperar contraseña'
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { identificador } = req.body;
    const correoInstitucional = (identificador || '').trim().toLowerCase();

    if (!correoInstitucional || !correoValido(correoInstitucional)) {
      req.session.error = 'Ingresa un correo institucional válido para continuar.';
      return res.redirect('/forgot-password');
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id_usuario,
        u.username,
        u.activo,
        p.correo,
        p.nombres
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      WHERE p.correo = ?
      LIMIT 1
      `,
      [correoInstitucional]
    );

    // Mensaje genérico para no revelar si el usuario existe o no
    if (rows.length === 0 || rows[0].activo !== 1) {
      req.session.success = 'Si la cuenta existe, se generaron instrucciones para restablecer la contraseña.';
      return res.redirect('/login');
    }

    const user = rows[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(resetToken);

    await db.query(
      `
      UPDATE password_reset_token
      SET used_at = NOW()
      WHERE id_usuario = ?
      AND used_at IS NULL
      `,
      [user.id_usuario]
    );

    const [tokenResult] = await db.query(
      `
      INSERT INTO password_reset_token (
        id_usuario,
        token_hash,
        expires_at
      ) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))
      `,
      [user.id_usuario, tokenHash]
    );

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.correo,
        name: user.nombres,
        resetUrl
      });
    } catch (mailError) {
      await db.query(
        'UPDATE password_reset_token SET used_at = NOW() WHERE id_token = ?',
        [tokenResult.insertId]
      );

      console.error('No se pudo enviar el correo de recuperación.', mailError.message);
      req.session.error = 'El servicio de recuperación no está disponible en este momento. Inténtalo más tarde.';
      return res.redirect('/forgot-password');
    }

    req.session.success = 'Si la cuenta existe, se generaron instrucciones para restablecer la contraseña.';
    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo procesar la recuperación. Verifica el dato ingresado e inténtalo nuevamente.';
    return res.redirect('/forgot-password');
  }
};

exports.showResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = hashToken(token);

    const [rows] = await db.query(
      `
      SELECT id_token
      FROM password_reset_token
      WHERE token_hash = ?
      AND used_at IS NULL
      AND expires_at > NOW()
      LIMIT 1
      `,
      [tokenHash]
    );

    if (rows.length === 0) {
      req.session.error = 'El enlace de recuperación no es válido o ha expirado.';
      return res.redirect('/forgot-password');
    }

    res.render('auth/reset-password', {
      title: 'Nueva contraseña',
      token
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo validar el enlace de recuperación. Solicita un nuevo enlace e inténtalo nuevamente.';
    return res.redirect('/forgot-password');
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { new_password, confirm_password } = req.body;

    if (!new_password || !confirm_password) {
      req.session.error = 'Completa ambos campos de contraseña.';
      return res.redirect(`/reset-password/${token}`);
    }

    if (!passwordFuerte(new_password)) {
      req.session.error = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.';
      return res.redirect(`/reset-password/${token}`);
    }

    if (new_password !== confirm_password) {
      req.session.error = 'Las contraseñas no coinciden.';
      return res.redirect(`/reset-password/${token}`);
    }

    const tokenHash = hashToken(token);

    const [rows] = await db.query(
      `
      SELECT 
        prt.id_token,
        prt.id_usuario,
        u.password_hash
      FROM password_reset_token prt
      INNER JOIN usuario u ON prt.id_usuario = u.id_usuario
      WHERE prt.token_hash = ?
      AND prt.used_at IS NULL
      AND prt.expires_at > NOW()
      LIMIT 1
      `,
      [tokenHash]
    );

    if (rows.length === 0) {
      req.session.error = 'El enlace de recuperación no es válido o ha expirado.';
      return res.redirect('/forgot-password');
    }

    const resetData = rows[0];

    const samePassword = await bcrypt.compare(new_password, resetData.password_hash);

    if (samePassword) {
      req.session.error = 'La nueva contraseña debe ser diferente a la contraseña actual.';
      return res.redirect(`/reset-password/${token}`);
    }

    const newHash = await bcrypt.hash(new_password, 10);

    await db.query(
      `
      UPDATE usuario
      SET password_hash = ?, debe_cambiar_password = 0
      WHERE id_usuario = ?
      `,
      [newHash, resetData.id_usuario]
    );

    await db.query(
      `
      UPDATE password_reset_token
      SET used_at = NOW()
      WHERE id_token = ?
      `,
      [resetData.id_token]
    );

    req.session.success = 'Contraseña restablecida correctamente. Ahora puedes iniciar sesión.';
    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo restablecer la contraseña. Solicita un nuevo enlace e inténtalo nuevamente.';
    return res.redirect('/forgot-password');
  }
};
