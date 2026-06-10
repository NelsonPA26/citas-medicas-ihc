const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/database');

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
exports.showLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Iniciar Sesión'
  });
};

exports.login = async (req, res) => {
  try {
    const { identificador, password } = req.body;

    if (!identificador || !password) {
      req.session.error = 'Ingresa tu usuario/correo y contraseña.';
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
        p.id_persona,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.correo
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      WHERE u.username = ? OR p.correo = ?
      LIMIT 1
      `,
      [identificador, identificador]
    );

    if (rows.length === 0) {
      req.session.error = 'Usuario o contraseña incorrectos.';
      return res.redirect('/login');
    }

    const user = rows[0];

    if (!user.activo) {
      req.session.error = 'Tu cuenta se encuentra desactivada. Comunícate con administración.';
      return res.redirect('/login');
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      req.session.error = 'Usuario o contraseña incorrectos.';
      return res.redirect('/login');
    }

    req.session.user = {
      id_usuario: user.id_usuario,
      id_persona: user.id_persona,
      username: user.username,
      rol: user.rol,
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

    req.session.error = 'Ocurrió un error al iniciar sesión.';
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
    } = req.body;

    const old = {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono
    };

    if (!nombres || !apellido_paterno || !dni || !correo || !telefono || !password || !confirm_password) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'Completa todos los campos obligatorios.',
        success: null,
        old
      });
    }

    if (dni.length !== 8) {
      return res.render('auth/register', {
        title: 'Crear Cuenta',
        error: 'El DNI debe tener 8 dígitos.',
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
        title: 'Registro',
        error: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.',
        old: req.body
      });
    }
    const [existing] = await db.query(
      `
      SELECT p.id_persona
      FROM persona p
      LEFT JOIN usuario u ON p.id_persona = u.id_persona
      WHERE p.dni = ? OR p.correo = ? OR u.username = ?
      `,
      [dni, correo, correo]
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
      [nombres, apellido_paterno, apellido_materno || null, dni, correo, telefono]
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
      [idPersona, correo, passwordHash]
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
      error: 'Ocurrió un error al crear la cuenta.',
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

    if (!identificador) {
      req.session.error = 'Ingresa tu correo o usuario para continuar.';
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
      WHERE u.username = ? OR p.correo = ?
      LIMIT 1
      `,
      [identificador, identificador]
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

    await db.query(
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

    console.log('========================================');
    console.log('ENLACE DE RECUPERACIÓN PARA PRUEBAS');
    console.log(`Usuario: ${user.username}`);
    console.log(resetUrl);
    console.log('Este enlace expira en 15 minutos.');
    console.log('========================================');

    req.session.success = 'Si la cuenta existe, se generaron instrucciones para restablecer la contraseña.';
    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al procesar la recuperación de contraseña.';
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
    req.session.error = 'No se pudo validar el enlace de recuperación.';
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
    req.session.error = 'Ocurrió un error al restablecer la contraseña.';
    return res.redirect('/forgot-password');
  }
};