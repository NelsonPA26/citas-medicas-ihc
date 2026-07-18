const bcrypt = require('bcrypt');
const db = require('../config/database');

const TEMPORARY_PASSWORD = 'UNT12345*';

exports.dashboard = async (req, res) => {
  try {
    const rolesVisibles = rolesGestionables(req);

    if (rolesVisibles.length === 0) {
      req.session.error = 'Tu cuenta administrativa no tiene un área operativa válida. Comunícate con el administrador principal.';
      return res.redirect('/perfil');
    }

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

    const recentUsersConditions = esAdministradorPrincipal(req)
      ? ''
      : `WHERE u.rol IN (${rolesVisibles.map(() => '?').join(', ')})`;
    const [recentUsers] = await db.query(
      `
      SELECT
        u.id_usuario,
        u.rol,
        u.fecha_creacion,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      ${recentUsersConditions}
      ORDER BY u.fecha_creacion DESC, u.id_usuario DESC
      LIMIT 7
      `,
      esAdministradorPrincipal(req) ? [] : rolesVisibles
    );

    res.render('admin/dashboard', {
      title: 'Panel Administrativo',
      layout: 'layouts/dashboard',
      stats,
      recentUsers,
      ...datosAlcanceAdministrativo(req)
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el panel administrativo. Actualiza la página o vuelve a iniciar sesión si el problema continúa.';
    return res.redirect('/login');
  }
};

exports.ayuda = (req, res) => {
  const returnUrl = typeof req.query.returnTo === 'string'
    && (req.query.returnTo === '/perfil' || req.query.returnTo.startsWith('/admin/'))
    ? req.query.returnTo
    : '/admin/dashboard';

  res.render('admin/ayuda', {
    title: 'Ayuda administrativa',
    layout: 'layouts/dashboard',
    returnUrl
  });
};

const ROLES_PERMITIDOS = ['paciente', 'medico', 'enfermera', 'administrativo'];
const ESPECIALIDADES_MEDICAS = ['Medicina General', 'Odontología', 'Psicología'];
const CARGOS_ADMINISTRATIVOS = ['Admisión', 'Gestión de usuarios'];
const CATALOGO_ACADEMICO_UNT = Object.freeze({
  'Ciencias Agropecuarias': ['Agronomía', 'Zootecnia', 'Ingeniería Agrícola', 'Ingeniería Agroindustrial'],
  'Ciencias Biológicas': ['Ciencias Biológicas', 'Biología Pesquera', 'Microbiología y Parasitología'],
  'Ciencias Económicas': ['Administración', 'Contabilidad y Finanzas', 'Economía'],
  'Ciencias Físicas y Matemáticas': ['Estadística', 'Física', 'Informática', 'Matemáticas'],
  'Ciencias Sociales': ['Antropología', 'Arqueología', 'Historia', 'Trabajo Social', 'Turismo'],
  'Derecho y Ciencias Políticas': ['Derecho', 'Ciencias Políticas y Gobernabilidad'],
  'Educación y Ciencias de la Comunicación': ['Educación Inicial', 'Educación Primaria', 'Educación Secundaria', 'Ciencias de la Comunicación'],
  'Enfermería': ['Enfermería'],
  'Estomatología': ['Estomatología'],
  'Farmacia y Bioquímica': ['Farmacia y Bioquímica'],
  'Ingeniería': ['Arquitectura y Urbanismo', 'Ingeniería Civil', 'Ingeniería de Materiales', 'Ingeniería de Minas', 'Ingeniería de Sistemas', 'Ingeniería Industrial', 'Ingeniería Mecánica', 'Ingeniería Mecatrónica', 'Ingeniería Metalúrgica'],
  'Ingeniería Química': ['Ingeniería Ambiental', 'Ingeniería Química'],
  'Medicina': ['Medicina']
});
const CONTEXTOS_UNIVERSITARIOS = ['Estudiante regular', 'Internado', 'Egresante', 'Estudiante UNT'];

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
  return /^[0-9]{9}$/.test(value || '');
}
function limpiarTexto(value) {
  return (value || '').trim().replace(/\s{2,}/g, ' ');
}
function textoPersonaValido(value, min = 2, max = 80) {
  const text = (value || '').trim();

  if (text.length < min || text.length > max) return false;

  return /^[\p{L} ]+$/u.test(text);
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
    return 'El teléfono debe tener exactamente 9 dígitos.';
  }

if (!isFechaNacimientoValida(fecha_nacimiento)) {
  return 'La fecha de nacimiento no puede ser de hoy, futura ni del año actual.';
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

function esAdministradorPrincipal(req) {
  return req.session
    && req.session.user
    && req.session.user.rol === 'administrativo'
    && req.session.user.nivel_acceso_administrativo === 'principal';
}

function areaAdministrativa(req) {
  return req.session
    && req.session.user
    && req.session.user.area_administrativa
    ? req.session.user.area_administrativa
    : '';
}

function esAdministrativoAdmision(req) {
  return !esAdministradorPrincipal(req) && areaAdministrativa(req) === 'Admisión';
}

function esAdministrativoGestionUsuarios(req) {
  return !esAdministradorPrincipal(req) && areaAdministrativa(req) === 'Gestión de usuarios';
}

function rolesGestionables(req) {
  if (esAdministradorPrincipal(req)) return ROLES_PERMITIDOS;
  if (esAdministrativoGestionUsuarios(req)) return ['paciente', 'medico', 'enfermera'];
  if (esAdministrativoAdmision(req)) return ['paciente'];
  return [];
}

function puedeGestionarRol(req, rol) {
  return rolesGestionables(req).includes(rol);
}

function puedeGestionarCitas(req) {
  return esAdministradorPrincipal(req) || esAdministrativoAdmision(req);
}

function datosAlcanceAdministrativo(req) {
  return {
    isPrincipalAdministrador: esAdministradorPrincipal(req),
    areaAdministrativa: areaAdministrativa(req),
    rolesDisponibles: rolesGestionables(req),
    esAdministrativoAdmision: esAdministrativoAdmision(req),
    esAdministrativoGestionUsuarios: esAdministrativoGestionUsuarios(req),
    puedeGestionarCitas: puedeGestionarCitas(req)
  };
}

async function ensureRoleRecord(connection, idPersona, rol, body = {}) {
  if (rol === 'paciente') {
    const codigoEstudiante = limpiarTexto(body.codigo_estudiante);
    const escuela = limpiarTexto(body.escuela);
    const facultad = limpiarTexto(body.facultad);
    const contextoUniversitario = limpiarTexto(body.contexto_universitario || 'Estudiante UNT');

    if (!/^[0-9]{10}$/.test(codigoEstudiante)) {
      throw new Error('Para asignar el rol Paciente, el codigo de estudiante debe tener exactamente 10 digitos.');
    }

    if (!Object.prototype.hasOwnProperty.call(CATALOGO_ACADEMICO_UNT, facultad)) {
      throw new Error('Para asignar el rol Paciente, selecciona una facultad valida de la UNT.');
    }

    if (!CATALOGO_ACADEMICO_UNT[facultad].includes(escuela)) {
      throw new Error('La escuela profesional seleccionada no corresponde a la facultad elegida.');
    }

    if (!CONTEXTOS_UNIVERSITARIOS.includes(contextoUniversitario)) {
      throw new Error('Para asignar el rol Paciente, selecciona un contexto universitario valido.');
    }

    const [pacienteRows] = await connection.query(
      `
      SELECT id_paciente
      FROM paciente
      WHERE id_persona = ?
      LIMIT 1
      `,
      [idPersona]
    );

    if (pacienteRows.length > 0) {
      await connection.query(
        `
        UPDATE paciente
        SET codigo_estudiante = ?,
            escuela = ?,
            facultad = ?,
            contexto_universitario = ?
        WHERE id_persona = ?
        `,
        [codigoEstudiante, escuela, facultad, contextoUniversitario, idPersona]
      );
    } else {
      await connection.query(
        `
        INSERT INTO paciente (
          id_persona,
          codigo_estudiante,
          escuela,
          facultad,
          contexto_universitario
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [idPersona, codigoEstudiante, escuela, facultad, contextoUniversitario]
      );
    }

    return;
  }

  if (rol === 'medico') {
    const especialidad = normalizarEspecialidad(body.especialidad);
    const numeroColegiatura = limpiarTexto(body.numero_colegiatura).replace(/\D/g, '');
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

    if (!ESPECIALIDADES_MEDICAS.includes(especialidad)) {
      throw new Error('Para asignar el rol Médico, selecciona una especialidad válida.');
    }

    if (!/^[0-9]{3,10}$/.test(numeroColegiatura)) {
      throw new Error('Para asignar el rol Médico, registra un número de colegiatura válido.');
    }

    if (!TURNOS_PERMITIDOS.includes(turno)) {
      throw new Error('Para asignar el rol Médico, selecciona un turno válido.');
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
    const area = 'Triaje';
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

    if (!TURNOS_PERMITIDOS.includes(turno)) {
      throw new Error('Para asignar el rol Enfermera, selecciona un turno válido.');
    }

    if (enfermeraActual) {
      await connection.query(
        `
        UPDATE enfermera
        SET area = ?,
            turno = ?
        WHERE id_enfermera = ?
        `,
        [area, turno, enfermeraActual.id_enfermera]
      );
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
    const cargo = limpiarTexto(body.cargo);

    if (!CARGOS_ADMINISTRATIVOS.includes(cargo)) {
      throw new Error('Para asignar el rol Administrativo, selecciona un área administrativa válida.');
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
        SET cargo = ?
        WHERE id_persona = ?
        `,
        [cargo, idPersona]
      );
    } else {
      await connection.query(
        `
        INSERT INTO administrativo (
          id_persona,
          cargo
        ) VALUES (?, ?)
        `,
        [idPersona, cargo]
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

  return !Number.isNaN(fechaNacimiento.getTime())
    && fechaNacimiento < hoy
    && fechaNacimiento.getFullYear() < hoy.getFullYear();
}


async function obtenerUsuarioGestion(idUsuario) {
  const [rows] = await db.query(
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
      DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
      p.sexo,
      p.correo,
      p.telefono,
      p.direccion,

      pac_rol.id_paciente,
      pac_rol.codigo_estudiante AS paciente_codigo_estudiante,
      pac_rol.escuela AS paciente_escuela,
      pac_rol.facultad AS paciente_facultad,
      pac_rol.contexto_universitario AS paciente_contexto_universitario,
      med_rol.id_medico,
      med_rol.especialidad AS medico_especialidad,
      med_rol.numero_colegiatura AS medico_colegiatura,
      med_rol.turno AS medico_turno,

      enf_rol.id_enfermera,
      enf_rol.area AS enfermera_area,
      enf_rol.turno AS enfermera_turno,

      adm_rol.id_administrativo,
      adm_rol.cargo AS administrativo_cargo,
      adm_rol.nivel_acceso AS administrativo_nivel_acceso
    FROM usuario u
    INNER JOIN persona p ON u.id_persona = p.id_persona
    LEFT JOIN paciente pac_rol ON p.id_persona = pac_rol.id_persona
    LEFT JOIN medico med_rol ON p.id_persona = med_rol.id_persona
    LEFT JOIN enfermera enf_rol ON p.id_persona = enf_rol.id_persona
    LEFT JOIN administrativo adm_rol ON p.id_persona = adm_rol.id_persona
    WHERE u.id_usuario = ?
    LIMIT 1
    `,
    [idUsuario]
  );

  return rows[0] || null;
}

function usuarioVacio(rol = 'paciente') {
  return {
    id_usuario: null,
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    dni: '',
    fecha_nacimiento: '',
    sexo: '',
    correo: '',
    telefono: '',
    direccion: '',
    username: '',
    rol,
    id_paciente: null,
    paciente_codigo_estudiante: '',
    paciente_escuela: '',
    paciente_facultad: '',
    paciente_contexto_universitario: 'Estudiante UNT',
    id_medico: null,
    medico_especialidad: '',
    medico_colegiatura: '',
    medico_turno: '',
    id_enfermera: null,
    enfermera_area: '',
    enfermera_turno: '',
    id_administrativo: null,
    administrativo_cargo: '',
    administrativo_nivel_acceso: ''
  };
}


exports.nuevoUsuario = (req, res) => {
  const rolesDisponibles = rolesGestionables(req);
  const puedeGestionarAdministrativos = esAdministradorPrincipal(req);

  if (rolesDisponibles.length === 0) {
    req.session.error = 'No tienes permisos para registrar usuarios con tu área administrativa.';
    return res.redirect('/admin/dashboard');
  }

  const rolSolicitado = ROLES_PERMITIDOS.includes(req.query.rol) ? req.query.rol : 'paciente';
  const rolInicial = rolesDisponibles.includes(rolSolicitado)
    ? rolSolicitado
    : rolesDisponibles[0];
  const backUrl = req.query.returnTo === 'dashboard' ? '/admin/dashboard' : '/admin/usuarios';

  res.render('admin/usuario-form', {
    title: esAdministrativoAdmision(req) ? 'Registrar paciente' : 'Registrar usuario',
    layout: 'layouts/dashboard',
    modo: 'crear',
    actionUrl: '/admin/usuarios/nuevo',
    backUrl,
    usuario: usuarioVacio(rolInicial),
    isSelf: false,
    isPrincipalAdministrador: puedeGestionarAdministrativos,
    catalogoAcademico: CATALOGO_ACADEMICO_UNT,
    ...datosAlcanceAdministrativo(req)
  });
};

exports.formEditarUsuario = async (req, res) => {
  try {
    const usuario = await obtenerUsuarioGestion(req.params.id_usuario);
    const backUrl = req.query.returnTo === 'dashboard' ? '/admin/dashboard' : '/admin/usuarios';

    if (!usuario) {
      req.session.error = 'El usuario seleccionado no existe o ya fue modificado. Actualiza la lista e inténtalo nuevamente.';
      return res.redirect('/admin/usuarios');
    }

    if (!puedeGestionarRol(req, usuario.rol)) {
      req.session.error = 'No tienes permisos para editar esta cuenta con tu área administrativa.';
      return res.redirect('/admin/usuarios');
    }

    res.render('admin/usuario-form', {
      title: 'Editar usuario',
      layout: 'layouts/dashboard',
      modo: 'editar',
      actionUrl: `/admin/usuarios/${usuario.id_usuario}/editar`,
      backUrl,
      usuario,
      isSelf: Number(usuario.id_usuario) === Number(req.session.user.id_usuario),
      isPrincipalAdministrador: esAdministradorPrincipal(req),
      catalogoAcademico: CATALOGO_ACADEMICO_UNT,
      ...datosAlcanceAdministrativo(req)
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo abrir el formulario de edición. Vuelve a la lista e inténtalo nuevamente.';
    return res.redirect('/admin/usuarios');
  }
};

exports.usuarios = async (req, res) => {
  try {
    const rolesDisponibles = rolesGestionables(req);

    if (rolesDisponibles.length === 0) {
      req.session.error = 'No tienes permisos para gestionar usuarios con tu área administrativa.';
      return res.redirect('/admin/dashboard');
    }

    const { q, estado } = req.query;
    const rolSolicitado = req.query.rol || '';
    const rol = rolesDisponibles.includes(rolSolicitado)
      ? rolSolicitado
      : (rolesDisponibles.length === 1 ? rolesDisponibles[0] : '');

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

    const limit = 4;
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
    } else if (!esAdministradorPrincipal(req)) {
      conditions.push(`u.rol IN (${rolesDisponibles.map(() => '?').join(', ')})`);
      params.push(...rolesDisponibles);
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
        DATE_FORMAT(p.fecha_nacimiento, '%Y-%m-%d') AS fecha_nacimiento,
        p.sexo,
        p.correo,
        p.telefono,
        p.direccion,

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
        adm_rol.nivel_acceso AS administrativo_nivel_acceso,

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
      },
      ...datosAlcanceAdministrativo(req)
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los usuarios. Actualiza la página o intenta nuevamente en unos segundos.';
    return res.redirect('/admin/dashboard');
  }
};

exports.storeUsuario = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      fecha_nacimiento,
      sexo,
      telefono,
      direccion,
      username,
      rol,
      password
    } = req.body;

    const correoAcceso = limpiarTexto(username).toLowerCase();
    const dniLimpio = limpiarTexto(dni).replace(/\D/g, '');
    const telefonoLimpio = limpiarTexto(telefono).replace(/\D/g, '');

    const errorPersona = validarDatosPersonaBasicos({
      nombres,
      apellido_paterno,
      apellido_materno,
      dni: dniLimpio,
      correo: correoAcceso,
      telefono: telefonoLimpio,
      fecha_nacimiento,
      sexo
    });

    if (errorPersona) {
      req.session.error = errorPersona;
      return res.redirect('/admin/usuarios/nuevo');
    }

    if (!ROLES_PERMITIDOS.includes(rol)) {
      req.session.error = 'Selecciona un rol valido.';
      return res.redirect('/admin/usuarios/nuevo');
    }

    if (!puedeGestionarRol(req, rol)) {
      req.session.error = 'No tienes permisos para registrar ese tipo de cuenta con tu área administrativa.';
      return res.redirect('/admin/usuarios/nuevo');
    }

    if (password && password.trim() !== '' && !passwordFuerte(password)) {
      req.session.error = 'La contrasena debe tener minimo 8 caracteres, mayuscula, minuscula, numero y simbolo.';
      return res.redirect('/admin/usuarios/nuevo');
    }

    await connection.beginTransaction();

    const [duplicados] = await connection.query(
      `
      SELECT 'usuario' AS origen
      FROM usuario
      WHERE username = ?

      UNION

      SELECT 'persona_correo' AS origen
      FROM persona
      WHERE correo = ?

      UNION

      SELECT 'persona_dni' AS origen
      FROM persona
      WHERE dni = ?

      LIMIT 1
      `,
      [correoAcceso, correoAcceso, dniLimpio]
    );

    if (duplicados.length > 0) {
      await connection.rollback();
      req.session.error = 'El DNI o correo ya esta registrado por otra cuenta.';
      return res.redirect('/admin/usuarios/nuevo');
    }

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
        limpiarTexto(nombres),
        limpiarTexto(apellido_paterno),
        apellido_materno ? limpiarTexto(apellido_materno) : null,
        dniLimpio,
        fecha_nacimiento,
        sexo,
        correoAcceso,
        telefonoLimpio,
        direccion ? limpiarTexto(direccion) : null
      ]
    );

    const idPersona = personaResult.insertId;
    const passwordPlano = password && password.trim() !== '' ? password.trim() : TEMPORARY_PASSWORD;
    const passwordHash = await bcrypt.hash(passwordPlano, 10);

    await ensureRoleRecord(connection, idPersona, rol, req.body);

    await connection.query(
      `
      INSERT INTO usuario (
        id_persona,
        username,
        password_hash,
        rol,
        activo,
        debe_cambiar_password
      ) VALUES (?, ?, ?, ?, 1, 1)
      `,
      [idPersona, correoAcceso, passwordHash, rol]
    );

    await connection.commit();

    req.session.success = password && password.trim() !== ''
      ? 'Usuario registrado correctamente.'
      : `Usuario registrado correctamente. Contrasena temporal: ${TEMPORARY_PASSWORD}.`;

    return res.redirect('/admin/usuarios');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    req.session.error = error.message || 'No se pudo registrar el usuario. Revisa los datos ingresados e inténtalo nuevamente.';
    return res.redirect('/admin/usuarios/nuevo');
  } finally {
    connection.release();
  }
};

exports.editarUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  const connection = await db.getConnection();

  try {

    const {
      nombres,
      apellido_paterno,
      apellido_materno,
      dni,
      fecha_nacimiento,
      sexo,
      telefono,
      direccion,
      username,
      rol,
      password
    } = req.body;

    const correoAcceso = limpiarTexto(username).toLowerCase();
    const dniLimpio = limpiarTexto(dni).replace(/\D/g, '');
    const telefonoLimpio = limpiarTexto(telefono).replace(/\D/g, '');

    if (!correoAcceso || !rol) {
      req.session.error = 'Completa el correo de acceso y el rol.';
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
    }

    if (!correoValido(correoAcceso)) {
      req.session.error = 'Ingresa un correo de acceso válido.';
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
    }

    if (!ROLES_PERMITIDOS.includes(rol)) {
      req.session.error = 'Selecciona un rol válido.';
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
    }

    if (password && password.trim() !== '' && !passwordFuerte(password)) {
      req.session.error = 'La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.';
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
    }

    const errorPersonaEdicion = validarDatosPersonaBasicos({
      nombres,
      apellido_paterno,
      apellido_materno,
      dni: dniLimpio,
      correo: correoAcceso,
      telefono: telefonoLimpio,
      fecha_nacimiento,
      sexo
    });

    if (errorPersonaEdicion) {
      req.session.error = errorPersonaEdicion;
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
    }

    await connection.beginTransaction();

    const [usuarioRows] = await connection.query(
      `
      SELECT 
        u.id_usuario,
        u.id_persona,
        u.rol,
        u.activo,
        adm.nivel_acceso AS nivel_acceso_administrativo,
        p.correo
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      LEFT JOIN administrativo adm ON adm.id_persona = u.id_persona
      WHERE u.id_usuario = ?
      LIMIT 1
      `,
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      await connection.rollback();
      req.session.error = 'El usuario seleccionado no existe o ya fue modificado. Actualiza la lista e inténtalo nuevamente.';
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
    }

    const usuarioActual = usuarioRows[0];
    const isSelf = Number(id_usuario) === Number(req.session.user.id_usuario);

    let nuevoRol = rol;

    if (isSelf) {
      nuevoRol = usuarioActual.rol;
    }

    if (!puedeGestionarRol(req, usuarioActual.rol) || !puedeGestionarRol(req, nuevoRol)) {
      await connection.rollback();
      req.session.error = 'No tienes permisos para modificar esta cuenta o cambiarla a ese rol.';
      return res.redirect('/admin/usuarios');
    }

    if (
      usuarioActual.rol === 'administrativo'
      && usuarioActual.activo === 1
      && nuevoRol !== 'administrativo'
      && !(await hasOtherActiveAdmin(connection, id_usuario))
    ) {
      await connection.rollback();
      req.session.error = 'Debe quedar al menos un administrador activo en el sistema.';
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
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

      UNION

      SELECT 'dni' AS origen
      FROM persona
      WHERE dni = ?
      AND id_persona <> ?

      LIMIT 1
      `,
      [
        correoAcceso,
        id_usuario,
        correoAcceso,
        usuarioActual.id_persona,
        dniLimpio,
        usuarioActual.id_persona
      ]
    );

    if (duplicados.length > 0) {
      await connection.rollback();
      req.session.error = 'El DNI o correo de acceso ya esta registrado por otra cuenta.';
      return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
    }

    await ensureRoleRecord(connection, usuarioActual.id_persona, nuevoRol, req.body);

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
        limpiarTexto(nombres),
        limpiarTexto(apellido_paterno),
        apellido_materno ? limpiarTexto(apellido_materno) : null,
        dniLimpio,
        fecha_nacimiento,
        sexo,
        correoAcceso,
        telefonoLimpio,
        direccion ? limpiarTexto(direccion) : null,
        usuarioActual.id_persona
      ]
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

    return res.redirect('/admin/usuarios');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    req.session.error = error.message || 'No se pudo actualizar el usuario. Revisa los datos ingresados e inténtalo nuevamente.';
    return res.redirect(`/admin/usuarios/${id_usuario}/editar`);
  } finally {
    connection.release();
  }
};

exports.cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { accion } = req.body;

    if (!['activar', 'desactivar'].includes(accion)) {
      req.session.error = 'La acción solicitada no es válida. Vuelve a la pantalla anterior e inténtalo nuevamente.';
      return res.redirect(getUsuariosRedirect(req));
    }

    if (Number(id_usuario) === Number(req.session.user.id_usuario)) {
      req.session.error = 'No puedes cambiar el estado de tu propia cuenta.';
      return res.redirect(getUsuariosRedirect(req));
    }

    const nuevoEstado = accion === 'activar' ? 1 : 0;

    const [usuarioRows] = await db.query(
      `
      SELECT u.id_usuario, u.rol, u.activo
      FROM usuario u
      WHERE id_usuario = ?
      LIMIT 1
      `,
      [id_usuario]
    );

    if (usuarioRows.length === 0) {
      req.session.error = 'El usuario seleccionado no existe o ya fue modificado. Actualiza la lista e inténtalo nuevamente.';
      return res.redirect(getUsuariosRedirect(req));
    }

    if (!puedeGestionarRol(req, usuarioRows[0].rol)) {
      req.session.error = 'No tienes permisos para cambiar el estado de esta cuenta.';
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
    req.session.error = 'No se pudo actualizar el estado del usuario. Intenta nuevamente en unos segundos.';
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
      req.session.error = 'El usuario seleccionado no existe o ya fue modificado. Actualiza la lista e inténtalo nuevamente.';
      return res.redirect(getUsuariosRedirect(req));
    }

    const usuario = usuarioRows[0];

    if (!puedeGestionarRol(req, usuario.rol)) {
      await connection.rollback();
      req.session.error = 'No tienes permisos para eliminar esta cuenta.';
      return res.redirect(getUsuariosRedirect(req));
    }

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

    req.session.error = 'No se pudo eliminar el usuario. Verifica si tiene registros asociados o intenta nuevamente.';
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
    req.session.error = 'No se pudieron cargar los médicos. Actualiza la página o intenta nuevamente en unos segundos.';
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
      error: 'No se pudo registrar el médico. Revisa los datos ingresados e inténtalo nuevamente.',
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
    req.session.error = 'No se pudo abrir el formulario de edición. Vuelve a la lista e inténtalo nuevamente.';
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
    req.session.error = 'No se pudo actualizar el médico. Revisa los datos ingresados e inténtalo nuevamente.';
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
    req.session.error = 'No se pudieron cargar las enfermeras. Actualiza la página o intenta nuevamente en unos segundos.';
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
      formError: 'No se pudo registrar la enfermera. Revisa los datos ingresados e inténtalo nuevamente.',
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
    req.session.error = 'No se pudo abrir el formulario de edición. Vuelve a la lista e inténtalo nuevamente.';
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
    req.session.error = 'No se pudo actualizar la enfermera. Revisa los datos ingresados e inténtalo nuevamente.';
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
      req.session.error = 'La acción solicitada no es válida. Vuelve a la pantalla anterior e inténtalo nuevamente.';
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
    req.session.error = 'No se pudo actualizar el estado del médico. Intenta nuevamente en unos segundos.';
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
    req.session.error = 'No se pudo eliminar el médico. Verifica si tiene citas asociadas o intenta nuevamente.';
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
      req.session.error = 'La acción solicitada no es válida. Vuelve a la pantalla anterior e inténtalo nuevamente.';
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
    req.session.error = 'No se pudo actualizar el estado de la enfermera. Intenta nuevamente en unos segundos.';
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
    req.session.error = 'No se pudo eliminar la enfermera. Verifica si tiene triajes asociados o intenta nuevamente.';
    return res.redirect('/admin/enfermeras');
  } finally {
    connection.release();
  }
};

exports.citas = async (req, res) => {
  try {
    if (!puedeGestionarCitas(req)) {
      req.session.error = 'Tu área administrativa no tiene acceso a la gestión de citas.';
      return res.redirect('/admin/dashboard');
    }

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
    req.session.error = 'No se pudieron cargar las citas. Actualiza la página o intenta nuevamente en unos segundos.';
    return res.redirect('/admin/dashboard');
  }
};

exports.detalleCita = async (req, res) => {
  try {
    if (!puedeGestionarCitas(req)) {
      req.session.error = 'Tu área administrativa no tiene acceso al detalle de citas.';
      return res.redirect('/admin/dashboard');
    }

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
      req.session.error = 'La cita seleccionada no existe o ya fue modificada. Actualiza la lista e inténtalo nuevamente.';
      return res.redirect('/admin/citas');
    }

    return res.render('admin/detalle-cita', {
      title: 'Detalle de cita',
      layout: 'layouts/dashboard',
      cita: rows[0]
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el detalle de la cita. Vuelve a la lista e inténtalo nuevamente.';
    return res.redirect('/admin/citas');
  }
};

exports.cancelarCita = async (req, res) => {
  try {
    if (!puedeGestionarCitas(req)) {
      req.session.error = 'Tu área administrativa no tiene permisos para cancelar citas.';
      return res.redirect('/admin/dashboard');
    }

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
      req.session.error = 'La cita seleccionada no existe o ya fue modificada. Actualiza la lista e inténtalo nuevamente.';
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
    req.session.error = 'No se pudo cancelar la cita. Verifica que siga en un estado cancelable e inténtalo nuevamente.';
    return res.redirect('/admin/citas');
  }
};
