const bcrypt = require('bcrypt');
const db = require('../config/database');

const TEMPORARY_PASSWORD = 'UNT12345*';

exports.dashboard = async (req, res) => {
  try {
    const [[stats]] = await db.query(
      `
      SELECT
        (SELECT COUNT(*) FROM usuario) AS usuarios,
        (SELECT COUNT(*) FROM medico) AS medicos,
        (SELECT COUNT(*) FROM enfermera) AS enfermeras,
        (SELECT COUNT(*) FROM cita) AS citas,
        (SELECT COUNT(*) FROM cita WHERE estado = 'pendiente') AS citas_pendientes,
        (SELECT COUNT(*) FROM cita WHERE estado = 'completada') AS citas_completadas
      `
    );

    res.render('admin/dashboard', {
      title: 'Panel Administrativo',
      layout: 'layouts/dashboard',
      stats
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el panel administrativo.';
    return res.redirect('/login');
  }
};

const ROLES_PERMITIDOS = ['paciente', 'medico', 'enfermera', 'administrativo'];
const ESPECIALIDADES_MEDICAS = ['Medicina General', 'Odontología', 'Psicología'];

function normalizarEspecialidad(value) {
  const text = (value || '').trim();

  if (text.toLowerCase() === 'medicina general') return 'Medicina General';
  if (text.toLowerCase() === 'odontología' || text.toLowerCase() === 'odontologia') return 'Odontología';
  if (text.toLowerCase() === 'psicología' || text.toLowerCase() === 'psicologia') return 'Psicología';

  return text;
}
const TURNOS_PERMITIDOS = ['mañana', 'tarde', 'completo'];
const SEXOS_PERMITIDOS = ['Masculino', 'Femenino', 'Otro', 'No especifica'];

function dniValido(value) {
  return /^[0-9]{8}$/.test(value || '');
}
function telefonoValido(value) {
  return /^[0-9]{7,15}$/.test(value || '');
}
function limpiarTexto(value) {
  return (value || '').trim().replace(/\s{2,}/g, ' ');
}
function textoPersonaValido(value, min = 2, max = 80) {
  const text = (value || '').trim();

  if (text.length < min || text.length > max) return false;

  return /^[\p{L} .'-]+$/u.test(text);
}
function validarDatosPersonaBasicos(data) {
  const {
    nombres,
    apellido_paterno,
    apellido_materno,
    dni,
    correo,
    telefono,
    fecha_nacimiento,
    sexo
  } = data;

  if (!textoPersonaValido(nombres)) {
    return 'Ingresa nombres válidos.';
  }

  if (!textoPersonaValido(apellido_paterno)) {
    return 'Ingresa un apellido paterno válido.';
  }

  if (apellido_materno && !textoPersonaValido(apellido_materno, 2, 80)) {
    return 'Ingresa un apellido materno válido.';
  }

  if (!dniValido(dni)) {
    return 'El DNI debe tener 8 dígitos.';
  }

  if (!correoValido(correo)) {
    return 'Ingresa un correo válido.';
  }

  if (!telefonoValido(telefono)) {
    return 'El teléfono debe tener entre 7 y 15 dígitos.';
  }

if (!isFechaNacimientoValida(fecha_nacimiento)) {
  return 'La fecha de nacimiento debe ser anterior a la fecha actual.';
}

  if (!SEXOS_PERMITIDOS.includes(sexo)) {
    return 'Selecciona una opción válida en el campo sexo.';
  }

  return null;
}

function correoValido(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
}

function passwordFuerte(value) {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function textoBasicoValido(value, min = 2, max = 80) {
  const text = limpiarTexto(value);
  if (text.length < min || text.length > max) return false;
  return /^[\p{L}0-9 .,\-()]+$/u.test(text);
}

async function ensureRoleRecord(connection, idPersona, rol, body = {}) {
  if (rol === 'paciente') {
    await connection.query(
      `
      INSERT IGNORE INTO paciente (
        id_persona,
        contexto_universitario
      ) VALUES (?, 'Estudiante UNT')
      `,
      [idPersona]
    );

    return;
  }

  if (rol === 'medico') {
    const especialidad = normalizarEspecialidad(body.especialidad);
    const numeroColegiatura = limpiarTexto(body.numero_colegiatura).toUpperCase();
    const turno = body.turno_medico;

    const [medicoRows] = await connection.query(
      `
      SELECT id_medico, especialidad, numero_colegiatura, turno
      FROM medico
      WHERE id_persona = ?
      LIMIT 1
      `,
      [idPersona]
    );

    const medicoActual = medicoRows[0] || null;

    const fichaIncompleta =
      !medicoActual ||
      !medicoActual.especialidad ||
      !medicoActual.numero_colegiatura ||
      !medicoActual.turno;

    if (fichaIncompleta) {
      if (!ESPECIALIDADES_MEDICAS.includes(especialidad)) {
        throw new Error('Para asignar el rol Médico, selecciona una especialidad válida.');
      }

      if (!/^[A-Za-z0-9-]{3,30}$/.test(numeroColegiatura)) {
        throw new Error('Para asignar el rol Médico, registra un número de colegiatura válido.');
      }

      if (!TURNOS_PERMITIDOS.includes(turno)) {
        throw new Error('Para asignar el rol Médico, selecciona un turno válido.');
      }
    }

    if (numeroColegiatura) {
      const [duplicados] = await connection.query(
        `
        SELECT id_medico
        FROM medico
        WHERE numero_colegiatura = ?
        AND id_persona <> ?
        LIMIT 1
        `,
        [numeroColegiatura, idPersona]
      );

      if (duplicados.length > 0) {
        throw new Error('El número de colegiatura ya está registrado por otro médico.');
      }
    }

    if (medicoActual) {
      if (fichaIncompleta) {
        await connection.query(
          `
          UPDATE medico
          SET especialidad = ?,
              numero_colegiatura = ?,
              turno = ?
          WHERE id_medico = ?
          `,
          [especialidad, numeroColegiatura, turno, medicoActual.id_medico]
        );
      }
    } else {
      await connection.query(
        `
        INSERT INTO medico (
          id_persona,
          especialidad,
          numero_colegiatura,
          turno
        ) VALUES (?, ?, ?, ?)
        `,
        [idPersona, especialidad, numeroColegiatura, turno]
      );
    }

    return;
  }

  if (rol === 'enfermera') {
    const area = limpiarTexto(body.area);
    const turno = body.turno_enfermera;

    const [enfermeraRows] = await connection.query(
      `
      SELECT id_enfermera, area, turno
      FROM enfermera
      WHERE id_persona = ?
      LIMIT 1
      `,
      [idPersona]
    );

    const enfermeraActual = enfermeraRows[0] || null;

    const fichaIncompleta =
      !enfermeraActual ||
      !enfermeraActual.area ||
      !enfermeraActual.turno;

    if (fichaIncompleta) {
      if (!textoBasicoValido(area, 2, 80)) {
        throw new Error('Para asignar el rol Enfermera, registra un área válida.');
      }

      if (!TURNOS_PERMITIDOS.includes(turno)) {
        throw new Error('Para asignar el rol Enfermera, selecciona un turno válido.');
      }
    }

    if (enfermeraActual) {
      if (fichaIncompleta) {
        await connection.query(
          `
          UPDATE enfermera
          SET area = ?,
              turno = ?
          WHERE id_enfermera = ?
          `,
          [area, turno, enfermeraActual.id_enfermera]
        );
      }
    } else {
      await connection.query(
        `
        INSERT INTO enfermera (
          id_persona,
          area,
          turno
        ) VALUES (?, ?, ?)
        `,
        [idPersona, area, turno]
      );
    }

    return;
  }

  if (rol === 'administrativo') {
    const cargo = limpiarTexto(body.cargo || 'Administrativo');
    const anexo = limpiarTexto(body.anexo);

    if (!textoBasicoValido(cargo, 2, 80)) {
      throw new Error('Para asignar el rol Administrativo, registra un cargo válido.');
    }

    const [adminRows] = await connection.query(
      `
      SELECT id_administrativo
      FROM administrativo
      WHERE id_persona = ?
      LIMIT 1
      `,
      [idPersona]
    );

    if (adminRows.length > 0) {
      await connection.query(
        `
        UPDATE administrativo
        SET cargo = ?,
            anexo = ?
        WHERE id_persona = ?
        `,
        [cargo, anexo || null, idPersona]
      );
    } else {
      await connection.query(
        `
        INSERT INTO administrativo (
          id_persona,
          cargo,
          anexo
        ) VALUES (?, ?, ?)
        `,
        [idPersona, cargo, anexo || null]
      );
    }
  }
}

async function hasOtherActiveAdmin(connection, idUsuario) {
  const [[result]] = await connection.query(
    `
    SELECT COUNT(*) AS total
    FROM usuario
    WHERE rol = 'administrativo'
    AND activo = 1
    AND id_usuario <> ?
    `,
    [idUsuario]
  );

  return result.total > 0;
}

function getUsuariosRedirect(req) {
  const referer = req.get('Referrer') || '';
  const localPath = referer.replace(`${req.protocol}://${req.get('host')}`, '');

  return localPath.startsWith('/admin/usuarios') ? localPath : '/admin/usuarios';
}
async function obtenerResumenRegistrosUsuario(connection, idPersona) {
  const [[resumen]] = await connection.query(
    `
    SELECT
      (
        SELECT COUNT(*)
        FROM cita c
        INNER JOIN paciente p ON c.id_paciente = p.id_paciente
        WHERE p.id_persona = ?
      ) AS citas_paciente,

      (
        SELECT COUNT(*)
        FROM cita c
        INNER JOIN medico m ON c.id_medico = m.id_medico
        WHERE m.id_persona = ?
      ) AS citas_medico,

      (
        SELECT COUNT(*)
        FROM triaje t
        INNER JOIN enfermera e ON t.id_enfermera = e.id_enfermera
        WHERE e.id_persona = ?
      ) AS triajes_enfermera,

      (
        SELECT COUNT(*)
        FROM antecedente a
        INNER JOIN paciente p ON a.id_paciente = p.id_paciente
        WHERE p.id_persona = ?
      ) AS antecedentes
    `,
    [idPersona, idPersona, idPersona, idPersona]
  );

  const total =
    Number(resumen.citas_paciente || 0) +
    Number(resumen.citas_medico || 0) +
    Number(resumen.triajes_enfermera || 0) +
    Number(resumen.antecedentes || 0);

  return {
    ...resumen,
    total
  };
}
function toDateInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function isFechaNacimientoValida(value) {
  if (!value) return false;

  const fechaNacimiento = new Date(`${value}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return !Number.isNaN(fechaNacimiento.getTime()) && fechaNacimiento < hoy;
}

exports.usuarios = async (req, res) => {
  try {
    const { q, rol, estado } = req.query;

    const sortColumns = {
      usuario: 'p.apellido_paterno',
      dni: 'p.dni',
      correo: 'p.correo',
      telefono: 'p.telefono',
      rol: 'u.rol',
      estado: 'u.activo',
      fecha: 'u.fecha_creacion'
    };

    const sort = sortColumns[req.query.sort] ? req.query.sort : 'fecha';
    const direction = req.query.direction === 'asc' ? 'asc' : 'desc';
    const orderColumn = sortColumns[sort];
    const orderDirection = direction.toUpperCase();

    const limit = 6;
    const currentPage = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const conditions = [];
    const params = [];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          p.nombres LIKE ?
          OR p.apellido_paterno LIKE ?
          OR p.apellido_materno LIKE ?
          OR p.dni LIKE ?
          OR p.correo LIKE ?
          OR u.username LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search, search);
    }

    if (rol && rol !== '') {
      conditions.push(`u.rol = ?`);
      params.push(rol);
    }

    if (estado && estado !== '') {
      conditions.push(`u.activo = ?`);
      params.push(estado === 'activo' ? 1 : 0);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const [[totalRows]] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      ${whereClause}
      `,
      params
    );

    const totalUsuarios = Number(totalRows.total || 0);
    const totalPages = Math.max(Math.ceil(totalUsuarios / limit), 1);
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const safeOffset = (safeCurrentPage - 1) * limit;

    const [usuarios] = await db.query(
      `
      SELECT 
        u.id_usuario,
        u.username,
        u.rol,
        u.activo,
        u.fecha_creacion,

        p.id_persona,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.dni,
        p.correo,
        p.telefono,

        pac_rol.id_paciente,
        med_rol.id_medico,
        med_rol.especialidad AS medico_especialidad,
        med_rol.numero_colegiatura AS medico_colegiatura,
        med_rol.turno AS medico_turno,

        enf_rol.id_enfermera,
        enf_rol.area AS enfermera_area,
        enf_rol.turno AS enfermera_turno,

        adm_rol.id_administrativo,
        adm_rol.cargo AS administrativo_cargo,
        adm_rol.anexo AS administrativo_anexo,

        (
          SELECT COUNT(*)
          FROM cita c
          INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
          WHERE pac.id_persona = p.id_persona
        ) AS citas_paciente,

        (
          SELECT COUNT(*)
          FROM cita c
          INNER JOIN medico m ON c.id_medico = m.id_medico
          WHERE m.id_persona = p.id_persona
        ) AS citas_medico,

        (
          SELECT COUNT(*)
          FROM triaje t
          INNER JOIN enfermera e ON t.id_enfermera = e.id_enfermera
          WHERE e.id_persona = p.id_persona
        ) AS triajes_enfermera,

        (
          SELECT COUNT(*)
          FROM antecedente a
          INNER JOIN paciente pac ON a.id_paciente = pac.id_paciente
          WHERE pac.id_persona = p.id_persona
        ) AS antecedentes

      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      LEFT JOIN paciente pac_rol ON p.id_persona = pac_rol.id_persona
      LEFT JOIN medico med_rol ON p.id_persona = med_rol.id_persona
      LEFT JOIN enfermera enf_rol ON p.id_persona = enf_rol.id_persona
      LEFT JOIN administrativo adm_rol ON p.id_persona = adm_rol.id_persona
      ${whereClause}
      ORDER BY u.activo DESC, ${orderColumn} ${orderDirection}, u.fecha_creacion DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, safeOffset]
    );

    res.render('admin/usuarios', {
      title: 'Gestión de usuarios',
      layout: 'layouts/dashboard',
      usuarios,
      filters: {
        q: q || '',
        rol: rol || '',
        estado: estado || '',
        sort,
        direction
      },
      pagination: {
        total: totalUsuarios,
        page: safeCurrentPage,
        totalPages,
        limit,
        from: totalUsuarios === 0 ? 0 : safeOffset + 1,
        to: Math.min(safeOffset + usuarios.length, totalUsuarios)
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los usuarios.';
    return res.redirect('/admin/dashboard');
  }
};

exports.editarUsuario = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_usuario } = req.params;

    const {
      username,
      rol,
      password
    } = req.body;

    const correoAcceso = limpiarTexto(username).toLowerCase();

    if (!correoAcceso || !rol) {
      req.session.error = 'Completa el correo de acceso y el rol.';
      return res.redirect(getUsuariosRedirect(req));
    }

    if (!correoValido(correoAcceso)) {
      req.session.error = 'Ingresa un correo de acceso válido.';
      return res.redirect(getUsuariosRedirect(req));
    }

    if (!ROLES_PERMITIDOS.includes(rol)) {
      req.session.error = 'Selecciona un rol válido.';
      return res.redirect(getUsuariosRedirect(req));
    }

    if (password && password.trim() !== '' && !passwordFuerte(password)) {
      req.session.error = 'La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.';
      return res.redirect(getUsuariosRedirect(req));
    }

    await connection.beginTransaction();

    const [usuarioRows] = await connection.query(
      `
      SELECT 
        u.id_usuario,
        u.id_persona,
        u.rol,
        u.activo,
        p.correo
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      WHERE u.id_usuario = ?
      LIMIT 1
      `,
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      await connection.rollback();
      req.session.error = 'El usuario seleccionado no existe.';
      return res.redirect(getUsuariosRedirect(req));
    }

    const usuarioActual = usuarioRows[0];
    const isSelf = Number(id_usuario) === Number(req.session.user.id_usuario);

    let nuevoRol = rol;

    if (isSelf) {
      nuevoRol = usuarioActual.rol;
    }

    if (
      usuarioActual.rol === 'administrativo'
      && usuarioActual.activo === 1
      && nuevoRol !== 'administrativo'
      && !(await hasOtherActiveAdmin(connection, id_usuario))
    ) {
      await connection.rollback();
      req.session.error = 'Debe quedar al menos un administrador activo en el sistema.';
      return res.redirect(getUsuariosRedirect(req));
    }

    const [duplicados] = await connection.query(
      `
      SELECT 'usuario' AS origen
      FROM usuario
      WHERE username = ?
      AND id_usuario <> ?

      UNION

      SELECT 'persona' AS origen
      FROM persona
      WHERE correo = ?
      AND id_persona <> ?

      LIMIT 1
      `,
      [
        correoAcceso,
        id_usuario,
        correoAcceso,
        usuarioActual.id_persona
      ]
    );

    if (duplicados.length > 0) {
      await connection.rollback();
      req.session.error = 'El correo de acceso ya está registrado por otra cuenta.';
      return res.redirect(getUsuariosRedirect(req));
    }

    await ensureRoleRecord(connection, usuarioActual.id_persona, nuevoRol, req.body);

    await connection.query(
      `
      UPDATE persona
      SET correo = ?
      WHERE id_persona = ?
      `,
      [correoAcceso, usuarioActual.id_persona]
    );

    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);

      await connection.query(
        `
        UPDATE usuario
        SET username = ?,
            password_hash = ?,
            rol = ?,
            debe_cambiar_password = 1
        WHERE id_usuario = ?
        `,
        [correoAcceso, passwordHash, nuevoRol, id_usuario]
      );
    } else {
      await connection.query(
        `
        UPDATE usuario
        SET username = ?,
            rol = ?
        WHERE id_usuario = ?
        `,
        [correoAcceso, nuevoRol, id_usuario]
      );
    }

    await connection.commit();

    if (isSelf) {
      req.session.user.username = correoAcceso;
      req.session.user.correo = correoAcceso;
      req.session.user.rol = nuevoRol;
    }

    req.session.success = isSelf
      ? 'Tu acceso fue actualizado correctamente. Por seguridad, tu rol no fue modificado.'
      : 'Acceso y rol actualizados correctamente.';

    return res.redirect(getUsuariosRedirect(req));
  } catch (error) {
    await connection.rollback();
    console.error(error);

    req.session.error = error.message || 'Ocurrió un error al actualizar el usuario.';
    return res.redirect(getUsuariosRedirect(req));
  } finally {
    connection.release();
  }
};

exports.cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { accion } = req.body;

    if (!['activar', 'desactivar'].includes(accion)) {
      req.session.error = 'Acción no válida.';
      return res.redirect(getUsuariosRedirect(req));
    }

    if (Number(id_usuario) === Number(req.session.user.id_usuario)) {
      req.session.error = 'No puedes cambiar el estado de tu propia cuenta.';
      return res.redirect(getUsuariosRedirect(req));
    }

    const nuevoEstado = accion === 'activar' ? 1 : 0;

    const [usuarioRows] = await db.query(
      `
      SELECT id_usuario, rol, activo
      FROM usuario
      WHERE id_usuario = ?
      LIMIT 1
      `,
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      req.session.error = 'El usuario seleccionado no existe.';
      return res.redirect(getUsuariosRedirect(req));
    }

    await db.query(
      `
      UPDATE usuario
      SET activo = ?
      WHERE id_usuario = ?
      `,
      [nuevoEstado, id_usuario]
    );

    req.session.success =
      accion === 'activar'
        ? 'Usuario activado correctamente.'
        : 'Usuario desactivado correctamente.';

    return res.redirect(getUsuariosRedirect(req));
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al actualizar el estado del usuario.';
    return res.redirect(getUsuariosRedirect(req));
  }
};
exports.eliminarUsuario = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_usuario } = req.params;

    if (Number(id_usuario) === Number(req.session.user.id_usuario)) {
      req.session.error = 'No puedes eliminar tu propia cuenta.';
      return res.redirect(getUsuariosRedirect(req));
    }

    await connection.beginTransaction();

    const [usuarioRows] = await connection.query(
      `
      SELECT 
        u.id_usuario,
        u.id_persona,
        u.rol,
        u.activo,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      WHERE u.id_usuario = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      await connection.rollback();
      req.session.error = 'El usuario seleccionado no existe.';
      return res.redirect(getUsuariosRedirect(req));
    }

    const usuario = usuarioRows[0];

    if (
      usuario.rol === 'administrativo' &&
      usuario.activo === 1 &&
      !(await hasOtherActiveAdmin(connection, id_usuario))
    ) {
      await connection.rollback();
      req.session.error = 'No puedes eliminar al único administrador activo del sistema.';
      return res.redirect(getUsuariosRedirect(req));
    }

    const resumen = await obtenerResumenRegistrosUsuario(connection, usuario.id_persona);

    if (resumen.total > 0) {
      await connection.rollback();

      req.session.error =
        'No se puede eliminar este usuario porque tiene registros históricos asociados. Puedes desactivarlo para conservar la trazabilidad.';

      return res.redirect(getUsuariosRedirect(req));
    }

    await connection.query(
      `
      DELETE FROM persona
      WHERE id_persona = ?
      `,
      [usuario.id_persona]
    );

    await connection.commit();

    const nombreCompleto = `${usuario.nombres} ${usuario.apellido_paterno} ${usuario.apellido_materno || ''}`.trim();

    req.session.success = `Usuario ${nombreCompleto} eliminado correctamente.`;
    return res.redirect('/admin/usuarios');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    req.session.error = 'No se pudo eliminar el usuario.';
    return res.redirect(getUsuariosRedirect(req));
  } finally {
    connection.release();
  }
};
exports.medicos = async (req, res) => {
  try {
    const { q } = req.query;

    const conditions = [`u.rol = 'medico'`];
    const params = [];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          p.nombres LIKE ?
          OR p.apellido_paterno LIKE ?
          OR p.apellido_materno LIKE ?
          OR p.dni LIKE ?
          OR p.correo LIKE ?
          OR m.numero_colegiatura LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search, search);
    }

    const [medicos] = await db.query(
      `
      SELECT 
        m.id_medico,
        u.id_usuario,
        m.especialidad,
        m.numero_colegiatura,
        m.turno,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.dni,
        p.correo,
        p.telefono,
        u.username,
        u.activo,
        (
          SELECT COUNT(*)
          FROM cita c
          WHERE c.id_medico = m.id_medico
        ) AS registros_asociados
      FROM medico m
      INNER JOIN persona p ON m.id_persona = p.id_persona
      INNER JOIN usuario u ON p.id_persona = u.id_persona
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.activo DESC, p.apellido_paterno, p.nombres
      `,
      params
    );

    res.render('admin/medicos', {
      title: 'Gestión de médicos',
      layout: 'layouts/dashboard',
      medicos,
      filters: {
        q: q || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los médicos.';
    return res.redirect('/admin/dashboard');
  }
};

exports.showNuevoMedico = (req, res) => {
  res.render('admin/formulario-personal', {
    title: 'Registrar médico',
    layout: 'layouts/dashboard',
    old: {},
    formError: null
  });
};

exports.storeNuevoMedico = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
      especialidad,
      numero_colegiatura,
      turno
    } = req.body;

    const old = {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
      especialidad,
      numero_colegiatura,
      turno
    };

    if (
      !nombres ||
      !apellido_paterno ||
      !dni ||
      !correo ||
      !telefono ||
      !fecha_nacimiento ||
      !sexo ||
      !especialidad ||
      !numero_colegiatura ||
      !turno
    ) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'Completa todos los campos obligatorios.',
        old
      });
    }

    if (dni.length !== 8) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'El DNI debe tener 8 dígitos.',
        old
      });
    }

    const sexosPermitidos = ['Masculino', 'Femenino', 'Otro', 'No especifica'];
    const turnosPermitidos = ['mañana', 'tarde', 'completo'];
      const especialidadNormalizada = normalizarEspecialidad(especialidad);

    if (!ESPECIALIDADES_MEDICAS.includes(especialidadNormalizada)) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'Selecciona una especialidad médica válida.',
        old
      });
    }
    if (!sexosPermitidos.includes(sexo)) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'Selecciona una opción válida en el campo sexo.',
        old
      });
    }

    if (!turnosPermitidos.includes(turno)) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'Selecciona un turno válido.',
        old
      });
    }

    if (!isFechaNacimientoValida(fecha_nacimiento)) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'La fecha de nacimiento debe ser anterior a la fecha actual.',
        old
      });
    }

    const [existing] = await db.query(
      `
      SELECT p.id_persona
      FROM persona p
      LEFT JOIN medico m ON p.id_persona = m.id_persona
      WHERE p.dni = ?
      OR p.correo = ?
      OR m.numero_colegiatura = ?
      LIMIT 1
      `,
      [dni, correo, numero_colegiatura]
    );

    if (existing.length > 0) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'El DNI, correo o número de colegiatura ya está registrado.',
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
        fecha_nacimiento,
        sexo,
        correo,
        telefono,
        direccion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nombres,
        apellido_paterno,
        apellido_materno || null,
        dni,
        fecha_nacimiento,
        sexo,
        correo,
        telefono,
        direccion || null
      ]
    );

    const idPersona = personaResult.insertId;
    const passwordHash = await bcrypt.hash(TEMPORARY_PASSWORD, 10);

    await connection.query(
      `
      INSERT INTO usuario (
        id_persona,
        username,
        password_hash,
        rol,
        activo,
        debe_cambiar_password
      ) VALUES (?, ?, ?, 'medico', 1, 1)
      `,
      [idPersona, correo, passwordHash]
    );

    await connection.query(
      `
      INSERT INTO medico (
        id_persona,
        especialidad,
        numero_colegiatura,
        turno
      ) VALUES (?, ?, ?, ?)
      `,
      [idPersona, especialidadNormalizada, numero_colegiatura, turno]
    );

    await connection.commit();

    req.session.success = `Médico registrado correctamente. Contraseña temporal: ${TEMPORARY_PASSWORD}.`;
    return res.redirect('/admin/medicos');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.render('admin/formulario-personal', {
      title: 'Registrar médico',
      layout: 'layouts/dashboard',
      error: 'Ocurrió un error al registrar el médico.',
      hideGlobalError: true,
      old: req.body
    });
  } finally {
    connection.release();
  }
};

exports.showEditarMedico = async (req, res) => {
  try {
    const { id_medico } = req.params;
    const [rows] = await db.query(
      `
      SELECT
        m.id_medico,
        m.especialidad,
        m.numero_colegiatura,
        m.turno,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.dni,
        DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
        p.sexo,
        p.correo,
        p.telefono,
        p.direccion
      FROM medico m
      INNER JOIN persona p ON m.id_persona = p.id_persona
      WHERE m.id_medico = ?
      LIMIT 1
      `,
      [id_medico]
    );

    if (rows.length === 0) {
      req.session.error = 'El médico seleccionado no existe.';
      return res.redirect('/admin/medicos');
    }

    return res.render('admin/formulario-personal', {
      title: 'Editar médico',
      layout: 'layouts/dashboard',
      modoEdicion: true,
      formAction: `/admin/medicos/${id_medico}/editar`,
      old: rows[0],
      formError: null
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el formulario de edicion.';
    return res.redirect('/admin/medicos');
  }
};

exports.updateMedico = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_medico } = req.params;
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
      especialidad,
      numero_colegiatura,
      turno
    } = req.body;
const errorPersona = validarDatosPersonaBasicos(req.body);

if (errorPersona) {
  return res.render('admin/formulario-personal', {
    title: 'Editar médico',
    layout: 'layouts/dashboard',
    modoEdicion: true,
    formAction: `/admin/medicos/${id_medico}/editar`,
    formError: errorPersona,
    old: req.body
  });
}

const especialidadNormalizada = normalizarEspecialidad(especialidad);

if (!ESPECIALIDADES_MEDICAS.includes(especialidadNormalizada)) {
  return res.render('admin/formulario-personal', {
    title: 'Editar médico',
    layout: 'layouts/dashboard',
    modoEdicion: true,
    formAction: `/admin/medicos/${id_medico}/editar`,
    formError: 'Selecciona una especialidad médica válida.',
    old: req.body
  });
}

if (!/^[A-Za-z0-9-]{3,30}$/.test(numero_colegiatura || '')) {
  return res.render('admin/formulario-personal', {
    title: 'Editar médico',
    layout: 'layouts/dashboard',
    modoEdicion: true,
    formAction: `/admin/medicos/${id_medico}/editar`,
    formError: 'Ingresa un número de colegiatura válido.',
    old: req.body
  });
}

if (!TURNOS_PERMITIDOS.includes(turno)) {
  return res.render('admin/formulario-personal', {
    title: 'Editar médico',
    layout: 'layouts/dashboard',
    modoEdicion: true,
    formAction: `/admin/medicos/${id_medico}/editar`,
    formError: 'Selecciona un turno válido.',
    old: req.body
  });
}


await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT m.id_medico, m.id_persona
      FROM medico m
      WHERE m.id_medico = ?
      LIMIT 1
      `,
      [id_medico]
    );

    if (rows.length === 0) {
      await connection.rollback();
      req.session.error = 'El médico seleccionado no existe.';
      return res.redirect('/admin/medicos');
    }

    const idPersona = rows[0].id_persona;

    const [duplicados] = await connection.query(
      `
      SELECT 'persona' AS origen
      FROM persona
      WHERE (dni = ? OR correo = ?)
      AND id_persona <> ?

      UNION

      SELECT 'usuario' AS origen
      FROM usuario
      WHERE username = ?
      AND id_persona <> ?

      UNION

      SELECT 'colegiatura' AS origen
      FROM medico
      WHERE numero_colegiatura = ?
      AND id_medico <> ?

      LIMIT 1
      `,
      [dni, correo, idPersona, correo, idPersona, numero_colegiatura, id_medico]
    );

    if (duplicados.length > 0) {
      await connection.rollback();
      return res.render('admin/formulario-personal', {
        title: 'Editar médico',
        layout: 'layouts/dashboard',
        modoEdicion: true,
        formAction: `/admin/medicos/${id_medico}/editar`,
        formError: 'El DNI, correo o número de colegiatura ya está registrado.',
        old: req.body
      });
    }

    await connection.query(
      `
      UPDATE persona
      SET nombres = ?,
          apellido_paterno = ?,
          apellido_materno = ?,
          dni = ?,
          fecha_nacimiento = ?,
          sexo = ?,
          correo = ?,
          telefono = ?,
          direccion = ?
      WHERE id_persona = ?
      `,
      [
        nombres,
        apellido_paterno,
        apellido_materno || null,
        dni,
        fecha_nacimiento,
        sexo,
        correo,
        telefono,
        direccion || null,
        idPersona
      ]
    );

    await connection.query(
      `
      UPDATE usuario
      SET username = ?
      WHERE id_persona = ?
      `,
      [correo, idPersona]
    );

    await connection.query(
      `
      UPDATE medico
      SET especialidad = ?,
          numero_colegiatura = ?,
          turno = ?
      WHERE id_medico = ?
      `,
      [especialidadNormalizada, numero_colegiatura, turno, id_medico]
    );
    await connection.commit();

    req.session.success = 'Medico actualizado correctamente.';
    return res.redirect('/admin/medicos');
  } catch (error) {
    await connection.rollback();
    console.error(error);
    req.session.error = 'Ocurrió un error al actualizar el médico.';
    return res.redirect('/admin/medicos');
  } finally {
    connection.release();
  }
};

exports.enfermeras = async (req, res) => {
  try {
    const { q } = req.query;

    const conditions = [`u.rol = 'enfermera'`];
    const params = [];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          p.nombres LIKE ?
          OR p.apellido_paterno LIKE ?
          OR p.apellido_materno LIKE ?
          OR p.dni LIKE ?
          OR p.correo LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search);
    }

    const [enfermeras] = await db.query(
      `
      SELECT 
        e.id_enfermera,
        u.id_usuario,
        e.area,
        e.turno,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.dni,
        p.correo,
        p.telefono,
        u.username,
        u.activo,
        (
          SELECT COUNT(*)
          FROM triaje t
          WHERE t.id_enfermera = e.id_enfermera
        ) AS registros_asociados
      FROM enfermera e
      INNER JOIN persona p ON e.id_persona = p.id_persona
      INNER JOIN usuario u ON p.id_persona = u.id_persona
      WHERE ${conditions.join(' AND ')}
      ORDER BY u.activo DESC, p.apellido_paterno, p.nombres
      `,
      params
    );

    res.render('admin/enfermeras', {
      title: 'Gestión de enfermeras',
      layout: 'layouts/dashboard',
      enfermeras,
      filters: {
        q: q || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar las enfermeras.';
    return res.redirect('/admin/dashboard');
  }
};

exports.showNuevaEnfermera = (req, res) => {
  res.render('admin/formulario-personal', {
    title: 'Registrar enfermera',
    layout: 'layouts/dashboard',
    old: {},
    formError: null
  });
};

exports.storeNuevaEnfermera = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
      area,
      turno
    } = req.body;

    const old = {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
      area,
      turno
    };

    if (
      !nombres ||
      !apellido_paterno ||
      !dni ||
      !correo ||
      !telefono ||
      !fecha_nacimiento ||
      !sexo ||
      !area ||
      !turno
    ) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'Completa todos los campos obligatorios.',
        old
      });
    }

    if (dni.length !== 8) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'El DNI debe tener 8 dígitos.',
        old
      });
    }

    const sexosPermitidos = ['Masculino', 'Femenino', 'Otro', 'No especifica'];
    const turnosPermitidos = ['mañana', 'tarde', 'completo'];

    if (!sexosPermitidos.includes(sexo)) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'Selecciona una opción válida en el campo sexo.',
        old
      });
    }

    if (!turnosPermitidos.includes(turno)) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'Selecciona un turno válido.',
        old
      });
    }

    if (!isFechaNacimientoValida(fecha_nacimiento)) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'La fecha de nacimiento debe ser anterior a la fecha actual.',
        old
      });
    }

    const [existing] = await db.query(
      `
      SELECT p.id_persona
      FROM persona p
      WHERE p.dni = ?
      OR p.correo = ?
      LIMIT 1
      `,
      [dni, correo]
    );

    if (existing.length > 0) {
      return res.render('admin/formulario-personal', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'El DNI o correo ya está registrado.',
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
        fecha_nacimiento,
        sexo,
        correo,
        telefono,
        direccion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nombres,
        apellido_paterno,
        apellido_materno || null,
        dni,
        fecha_nacimiento,
        sexo,
        correo,
        telefono,
        direccion || null
      ]
    );

    const idPersona = personaResult.insertId;
    const passwordHash = await bcrypt.hash(TEMPORARY_PASSWORD, 10);

    await connection.query(
      `
      INSERT INTO usuario (
        id_persona,
        username,
        password_hash,
        rol,
        activo,
        debe_cambiar_password
      ) VALUES (?, ?, ?, 'enfermera', 1, 1)
      `,
      [idPersona, correo, passwordHash]
    );

    await connection.query(
      `
      INSERT INTO enfermera (
        id_persona,
        area,
        turno
      ) VALUES (?, ?, ?)
      `,
      [idPersona, area, turno]
    );

    await connection.commit();

    req.session.success = `Enfermera registrada correctamente. Contraseña temporal: ${TEMPORARY_PASSWORD}.`;
    return res.redirect('/admin/enfermeras');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.render('admin/formulario-personal', {
      title: 'Registrar enfermera',
      layout: 'layouts/dashboard',
      formError: 'Ocurrió un error al registrar la enfermera.',
      old: req.body
    });
  } finally {
    connection.release();
  }
};

exports.showEditarEnfermera = async (req, res) => {
  try {
    const { id_enfermera } = req.params;
    const [rows] = await db.query(
      `
      SELECT
        e.id_enfermera,
        e.area,
        e.turno,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.dni,
        DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
        p.sexo,
        p.correo,
        p.telefono,
        p.direccion
      FROM enfermera e
      INNER JOIN persona p ON e.id_persona = p.id_persona
      WHERE e.id_enfermera = ?
      LIMIT 1
      `,
      [id_enfermera]
    );

    if (rows.length === 0) {
      req.session.error = 'La enfermera seleccionada no existe.';
      return res.redirect('/admin/enfermeras');
    }

    return res.render('admin/formulario-personal', {
      title: 'Editar enfermera',
      layout: 'layouts/dashboard',
      modoEdicion: true,
      formAction: `/admin/enfermeras/${id_enfermera}/editar`,
      old: rows[0],
      formError: null
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el formulario de edicion.';
    return res.redirect('/admin/enfermeras');
  }
};

exports.updateEnfermera = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_enfermera } = req.params;
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      correo,
      telefono,
      fecha_nacimiento,
      sexo,
      direccion,
      area,
      turno
    } = req.body;
    const errorPersona = validarDatosPersonaBasicos(req.body);

if (errorPersona) {
  return res.render('admin/formulario-personal', {
    title: 'Editar enfermera',
    layout: 'layouts/dashboard',
    modoEdicion: true,
    formAction: `/admin/enfermeras/${id_enfermera}/editar`,
    formError: errorPersona,
    old: req.body
  });
}

if (!textoBasicoValido(area, 2, 80)) {
  return res.render('admin/formulario-personal', {
    title: 'Editar enfermera',
    layout: 'layouts/dashboard',
    modoEdicion: true,
    formAction: `/admin/enfermeras/${id_enfermera}/editar`,
    formError: 'Ingresa un área válida.',
    old: req.body
  });
}

if (!TURNOS_PERMITIDOS.includes(turno)) {
  return res.render('admin/formulario-personal', {
    title: 'Editar enfermera',
    layout: 'layouts/dashboard',
    modoEdicion: true,
    formAction: `/admin/enfermeras/${id_enfermera}/editar`,
    formError: 'Selecciona un turno válido.',
    old: req.body
  });
}
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT e.id_enfermera, e.id_persona
      FROM enfermera e
      WHERE e.id_enfermera = ?
      LIMIT 1
      `,
      [id_enfermera]
    );

    if (rows.length === 0) {
      await connection.rollback();
      req.session.error = 'La enfermera seleccionada no existe.';
      return res.redirect('/admin/enfermeras');
    }

    const idPersona = rows[0].id_persona;

    const [duplicados] = await connection.query(
      `
      SELECT 'persona' AS origen
      FROM persona
      WHERE (dni = ? OR correo = ?)
      AND id_persona <> ?

      UNION

      SELECT 'usuario' AS origen
      FROM usuario
      WHERE username = ?
      AND id_persona <> ?

      LIMIT 1
      `,
      [dni, correo, idPersona, correo, idPersona]
    );

    if (duplicados.length > 0) {
      await connection.rollback();
      return res.render('admin/formulario-personal', {
        title: 'Editar enfermera',
        layout: 'layouts/dashboard',
        modoEdicion: true,
        formAction: `/admin/enfermeras/${id_enfermera}/editar`,
        formError: 'El DNI o correo ya está registrado.',
        old: req.body
      });
    }

    await connection.query(
      `
      UPDATE persona
      SET nombres = ?,
          apellido_paterno = ?,
          apellido_materno = ?,
          dni = ?,
          fecha_nacimiento = ?,
          sexo = ?,
          correo = ?,
          telefono = ?,
          direccion = ?
      WHERE id_persona = ?
      `,
      [
        nombres,
        apellido_paterno,
        apellido_materno || null,
        dni,
        fecha_nacimiento,
        sexo,
        correo,
        telefono,
        direccion || null,
        idPersona
      ]
    );

    await connection.query(
      `
      UPDATE usuario
      SET username = ?
      WHERE id_persona = ?
      `,
      [correo, idPersona]
    );

    await connection.query(
      `
      UPDATE enfermera
      SET area = ?,
          turno = ?
      WHERE id_enfermera = ?
      `,
      [area, turno, id_enfermera]
    );

    await connection.commit();

    req.session.success = 'Enfermera actualizada correctamente.';
    return res.redirect('/admin/enfermeras');
  } catch (error) {
    await connection.rollback();
    console.error(error);
    req.session.error = 'Ocurrió un error al actualizar la enfermera.';
    return res.redirect('/admin/enfermeras');
  } finally {
    connection.release();
  }
};

exports.cambiarEstadoMedico = async (req, res) => {
  try {
    const { id_medico } = req.params;
    const { accion } = req.body;
    if (!['activar', 'desactivar'].includes(accion)) {
      req.session.error = 'Acción no válida.';
      return res.redirect('/admin/medicos');
    }
    const activo = accion === 'activar' ? 1 : 0;

    await db.query(
      `
      UPDATE usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      INNER JOIN medico m ON p.id_persona = m.id_persona
      SET u.activo = ?
      WHERE m.id_medico = ?
      `,
      [activo, id_medico]
    );

    req.session.success = activo ? 'Medico activado correctamente.' : 'Medico desactivado correctamente.';
    return res.redirect('/admin/medicos');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo actualizar el estado del médico.';
    return res.redirect('/admin/medicos');
  }
};
async function obtenerRolDisponible(connection, idPersona) {
  const [[roles]] = await connection.query(
    `
    SELECT
      EXISTS(SELECT 1 FROM administrativo WHERE id_persona = ?) AS es_administrativo,
      EXISTS(SELECT 1 FROM medico WHERE id_persona = ?) AS es_medico,
      EXISTS(SELECT 1 FROM enfermera WHERE id_persona = ?) AS es_enfermera,
      EXISTS(SELECT 1 FROM paciente WHERE id_persona = ?) AS es_paciente
    `,
    [idPersona, idPersona, idPersona, idPersona]
  );

  if (roles.es_administrativo) return 'administrativo';
  if (roles.es_medico) return 'medico';
  if (roles.es_enfermera) return 'enfermera';
  if (roles.es_paciente) return 'paciente';

  return null;
}
exports.eliminarMedico = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_medico } = req.params;

    await connection.beginTransaction();

    const [medicoRows] = await connection.query(
      `
      SELECT 
        m.id_medico,
        m.id_persona,
        u.id_usuario,
        u.rol
      FROM medico m
      LEFT JOIN usuario u ON m.id_persona = u.id_persona
      WHERE m.id_medico = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id_medico]
    );

    if (medicoRows.length === 0) {
      await connection.rollback();
      req.session.error = 'El médico seleccionado no existe.';
      return res.redirect('/admin/medicos');
    }

    const medico = medicoRows[0];

    const [[citas]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM cita
      WHERE id_medico = ?
      `,
      [id_medico]
    );

    if (Number(citas.total) > 0) {
      await connection.rollback();
      req.session.error = 'No se puede eliminar este médico porque tiene citas asociadas. Puedes desactivarlo para conservar la trazabilidad.';
      return res.redirect('/admin/medicos');
    }

    await connection.query(
      `
      DELETE FROM medico
      WHERE id_medico = ?
      `,
      [id_medico]
    );

    const nuevoRol = await obtenerRolDisponible(connection, medico.id_persona);

    if (nuevoRol) {
      if (medico.rol === 'medico') {
        await connection.query(
          `
          UPDATE usuario
          SET rol = ?
          WHERE id_persona = ?
          `,
          [nuevoRol, medico.id_persona]
        );
      }

      await connection.commit();

      req.session.success = 'Ficha médica eliminada correctamente. La persona conserva su cuenta porque tiene otro rol asociado.';
      return res.redirect('/admin/medicos');
    }

    await connection.query(
      `
      DELETE FROM usuario
      WHERE id_persona = ?
      `,
      [medico.id_persona]
    );

    await connection.query(
      `
      DELETE FROM persona
      WHERE id_persona = ?
      `,
      [medico.id_persona]
    );

    await connection.commit();

    req.session.success = 'Médico, usuario y datos personales eliminados correctamente.';
    return res.redirect('/admin/medicos');
  } catch (error) {
    await connection.rollback();
    console.error(error);
    req.session.error = 'No se pudo eliminar el médico.';
    return res.redirect('/admin/medicos');
  } finally {
    connection.release();
  }
};

exports.cambiarEstadoEnfermera = async (req, res) => {
  try {
    const { id_enfermera } = req.params;
    const { accion } = req.body;
    if (!['activar', 'desactivar'].includes(accion)) {
      req.session.error = 'Acción no válida.';
      return res.redirect('/admin/enfermeras');
    }
    const activo = accion === 'activar' ? 1 : 0;

    await db.query(
      `
      UPDATE usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      INNER JOIN enfermera e ON p.id_persona = e.id_persona
      SET u.activo = ?
      WHERE e.id_enfermera = ?
      `,
      [activo, id_enfermera]
    );

    req.session.success = activo ? 'Enfermera activada correctamente.' : 'Enfermera desactivada correctamente.';
    return res.redirect('/admin/enfermeras');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo actualizar el estado de la enfermera.';
    return res.redirect('/admin/enfermeras');
  }
};

exports.eliminarEnfermera = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_enfermera } = req.params;

    await connection.beginTransaction();

    const [enfermeraRows] = await connection.query(
      `
      SELECT 
        e.id_enfermera,
        e.id_persona,
        u.id_usuario,
        u.rol
      FROM enfermera e
      LEFT JOIN usuario u ON e.id_persona = u.id_persona
      WHERE e.id_enfermera = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id_enfermera]
    );

    if (enfermeraRows.length === 0) {
      await connection.rollback();
      req.session.error = 'La enfermera seleccionada no existe.';
      return res.redirect('/admin/enfermeras');
    }

    const enfermera = enfermeraRows[0];

    const [[triajes]] = await connection.query(
      `
      SELECT COUNT(*) AS total
      FROM triaje
      WHERE id_enfermera = ?
      `,
      [id_enfermera]
    );

    if (Number(triajes.total) > 0) {
      await connection.rollback();
      req.session.error = 'No se puede eliminar esta enfermera porque tiene triajes asociados. Puedes desactivarla para conservar la trazabilidad.';
      return res.redirect('/admin/enfermeras');
    }

    await connection.query(
      `
      DELETE FROM enfermera
      WHERE id_enfermera = ?
      `,
      [id_enfermera]
    );

    const nuevoRol = await obtenerRolDisponible(connection, enfermera.id_persona);

    if (nuevoRol) {
      if (enfermera.rol === 'enfermera') {
        await connection.query(
          `
          UPDATE usuario
          SET rol = ?
          WHERE id_persona = ?
          `,
          [nuevoRol, enfermera.id_persona]
        );
      }

      await connection.commit();

      req.session.success = 'Ficha de enfermería eliminada correctamente. La persona conserva su cuenta porque tiene otro rol asociado.';
      return res.redirect('/admin/enfermeras');
    }

    await connection.query(
      `
      DELETE FROM usuario
      WHERE id_persona = ?
      `,
      [enfermera.id_persona]
    );

    await connection.query(
      `
      DELETE FROM persona
      WHERE id_persona = ?
      `,
      [enfermera.id_persona]
    );

    await connection.commit();

    req.session.success = 'Enfermera, usuario y datos personales eliminados correctamente.';
    return res.redirect('/admin/enfermeras');
  } catch (error) {
    await connection.rollback();
    console.error(error);
    req.session.error = 'No se pudo eliminar la enfermera.';
    return res.redirect('/admin/enfermeras');
  } finally {
    connection.release();
  }
};

exports.citas = async (req, res) => {
  try {
    const { q, estado, fecha } = req.query;

    const conditions = [];
    const params = [];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          per_paciente.nombres LIKE ?
          OR per_paciente.apellido_paterno LIKE ?
          OR per_paciente.apellido_materno LIKE ?
          OR per_paciente.dni LIKE ?
          OR per_medico.nombres LIKE ?
          OR per_medico.apellido_paterno LIKE ?
          OR per_medico.apellido_materno LIKE ?
          OR c.motivo LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search, search, search, search);
    }

    if (estado && estado !== '') {
      conditions.push(`c.estado = ?`);
      params.push(estado);
    }

    if (fecha && fecha !== '') {
      conditions.push(`c.fecha = ?`);
      params.push(fecha);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const [citas] = await db.query(
      `
      SELECT 
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.sintomas,
        c.estado,

        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,

        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,
        per_medico.apellido_materno AS medico_apellido_materno,
        m.especialidad,

        t.id_triaje,
        con.id_consulta,
        con.borrador
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona per_medico ON m.id_persona = per_medico.id_persona
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      ${whereClause}
      ORDER BY
      CASE c.estado
        WHEN 'pendiente' THEN 1
        WHEN 'triaje_registrado' THEN 2
        WHEN 'en_consulta' THEN 3
        WHEN 'completada' THEN 4
        WHEN 'cancelada' THEN 5
        ELSE 6
      END ASC,
      c.fecha DESC,
      c.hora DESC
      `,
      params
    );

    res.render('admin/citas', {
      title: 'Citas generales',
      layout: 'layouts/dashboard',
      citas,
      filters: {
        q: q || '',
        estado: estado || '',
        fecha: fecha || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar las citas.';
    return res.redirect('/admin/dashboard');
  }
};

exports.detalleCita = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.sintomas AS sintomas_paciente,
        c.estado,

        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,
        per_paciente.sexo AS paciente_sexo,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,

        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,
        per_medico.apellido_materno AS medico_apellido_materno,
        m.especialidad,

        ant.alergias,
        ant.enfermedades_previas,
        ant.medicacion_actual,
        ant.cirugias,
        ant.antecedentes_familiares,
        ant.observaciones AS antecedentes_observaciones,

        t.id_triaje,
        t.temperatura,
        t.presion_arterial,
        t.frecuencia_cardiaca,
        t.saturacion,
        t.sintomas AS sintomas_triaje,
        t.observaciones AS triaje_observaciones,
        t.fecha_registro AS triaje_fecha_registro,

        per_enfermera.nombres AS enfermera_nombres,
        per_enfermera.apellido_paterno AS enfermera_apellido_paterno,

        con.id_consulta,
        con.diagnostico,
        con.tratamiento,
        con.recomendaciones,
        con.observaciones AS consulta_observaciones,
        con.borrador,
        con.fecha_creacion AS consulta_fecha_registro
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona per_medico ON m.id_persona = per_medico.id_persona
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      LEFT JOIN enfermera enf ON t.id_enfermera = enf.id_enfermera
      LEFT JOIN persona per_enfermera ON enf.id_persona = per_enfermera.id_persona
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE c.id_cita = ?
      LIMIT 1
      `,
      [id_cita]
    );

    if (rows.length === 0) {
      req.session.error = 'La cita seleccionada no existe.';
      return res.redirect('/admin/citas');
    }

    return res.render('admin/detalle-cita', {
      title: 'Detalle de cita',
      layout: 'layouts/dashboard',
      cita: rows[0]
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el detalle de la cita.';
    return res.redirect('/admin/citas');
  }
};

exports.cancelarCita = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const [rows] = await db.query(
      `
      SELECT id_cita, estado
      FROM cita
      WHERE id_cita = ?
      LIMIT 1
      `,
      [id_cita]
    );

    if (rows.length === 0) {
      req.session.error = 'La cita seleccionada no existe.';
      return res.redirect('/admin/citas');
    }

    const cita = rows[0];

    if (!['pendiente', 'triaje_registrado'].includes(cita.estado)) {
      req.session.error = 'Solo se pueden cancelar citas pendientes o con triaje registrado antes de la atención médica.';
      return res.redirect('/admin/citas');
    }

    await db.query(
      `
      UPDATE cita
      SET estado = 'cancelada'
      WHERE id_cita = ?
      `,
      [id_cita]
    );

    req.session.success = 'Cita cancelada correctamente.';
    return res.redirect('/admin/citas');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cancelar la cita.';
    return res.redirect('/admin/citas');
  }
};
