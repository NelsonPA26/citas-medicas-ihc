const bcrypt = require('bcrypt');
const db = require('../config/database');

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

exports.usuarios = async (req, res) => {
  try {
    const { q, rol, estado } = req.query;

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
        p.telefono
      FROM usuario u
      INNER JOIN persona p ON u.id_persona = p.id_persona
      ${whereClause}
      ORDER BY u.fecha_creacion DESC
      `,
      params
    );

    res.render('admin/usuarios', {
      title: 'Gestión de usuarios',
      layout: 'layouts/dashboard',
      usuarios,
      filters: {
        q: q || '',
        rol: rol || '',
        estado: estado || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los usuarios.';
    return res.redirect('/admin/dashboard');
  }
};

exports.cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { accion } = req.body;

    if (!['activar', 'desactivar'].includes(accion)) {
      req.session.error = 'Acción no válida.';
      return res.redirect('/admin/usuarios');
    }

    if (Number(id_usuario) === Number(req.session.user.id_usuario)) {
      req.session.error = 'No puedes cambiar el estado de tu propia cuenta.';
      return res.redirect('/admin/usuarios');
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
      return res.redirect('/admin/usuarios');
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

    return res.redirect('/admin/usuarios');
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al actualizar el estado del usuario.';
    return res.redirect('/admin/usuarios');
  }
};

exports.medicos = async (req, res) => {
  try {
    const [medicos] = await db.query(
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
        p.correo,
        p.telefono,
        u.username,
        u.activo
      FROM medico m
      INNER JOIN persona p ON m.id_persona = p.id_persona
      INNER JOIN usuario u ON p.id_persona = u.id_persona
      ORDER BY p.apellido_paterno, p.nombres
      `
    );

    res.render('admin/medicos', {
      title: 'Gestión de médicos',
      layout: 'layouts/dashboard',
      medicos
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los médicos.';
    return res.redirect('/admin/dashboard');
  }
};

exports.showNuevoMedico = (req, res) => {
  res.render('admin/nuevo-medico', {
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
      return res.render('admin/nuevo-medico', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'Completa todos los campos obligatorios.',
        old
      });
    }

    if (dni.length !== 8) {
      return res.render('admin/nuevo-medico', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'El DNI debe tener 8 dígitos.',
        old
      });
    }

    const sexosPermitidos = ['Masculino', 'Femenino', 'Otro', 'No especifica'];
    const turnosPermitidos = ['mañana', 'tarde', 'completo'];

    if (!sexosPermitidos.includes(sexo)) {
      return res.render('admin/nuevo-medico', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'Selecciona una opción válida en el campo sexo.',
        old
      });
    }

    if (!turnosPermitidos.includes(turno)) {
      return res.render('admin/nuevo-medico', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'Selecciona un turno válido.',
        old
      });
    }

    const fechaNacimiento = new Date(`${fecha_nacimiento}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaNacimiento > hoy) {
      return res.render('admin/nuevo-medico', {
        title: 'Registrar médico',
        layout: 'layouts/dashboard',
        formError: 'La fecha de nacimiento no puede ser futura.',
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
      return res.render('admin/nuevo-medico', {
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
    const passwordHash = await bcrypt.hash('123456', 10);

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
      [idPersona, especialidad, numero_colegiatura, turno]
    );

    await connection.commit();

    req.session.success = 'Médico registrado correctamente. Contraseña temporal: 123456.';
    return res.redirect('/admin/medicos');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.render('admin/nuevo-medico', {
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

exports.enfermeras = async (req, res) => {
  try {
    const [enfermeras] = await db.query(
      `
      SELECT 
        e.id_enfermera,
        e.area,
        e.turno,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno,
        p.dni,
        p.correo,
        p.telefono,
        u.username,
        u.activo
      FROM enfermera e
      INNER JOIN persona p ON e.id_persona = p.id_persona
      INNER JOIN usuario u ON p.id_persona = u.id_persona
      ORDER BY p.apellido_paterno, p.nombres
      `
    );

    res.render('admin/enfermeras', {
      title: 'Gestión de enfermeras',
      layout: 'layouts/dashboard',
      enfermeras
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar las enfermeras.';
    return res.redirect('/admin/dashboard');
  }
};

exports.showNuevaEnfermera = (req, res) => {
  res.render('admin/nueva-enfermera', {
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
      return res.render('admin/nueva-enfermera', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'Completa todos los campos obligatorios.',
        old
      });
    }

    if (dni.length !== 8) {
      return res.render('admin/nueva-enfermera', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'El DNI debe tener 8 dígitos.',
        old
      });
    }

    const sexosPermitidos = ['Masculino', 'Femenino', 'Otro', 'No especifica'];
    const turnosPermitidos = ['mañana', 'tarde', 'completo'];

    if (!sexosPermitidos.includes(sexo)) {
      return res.render('admin/nueva-enfermera', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'Selecciona una opción válida en el campo sexo.',
        old
      });
    }

    if (!turnosPermitidos.includes(turno)) {
      return res.render('admin/nueva-enfermera', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'Selecciona un turno válido.',
        old
      });
    }

    const fechaNacimiento = new Date(`${fecha_nacimiento}T00:00:00`);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaNacimiento > hoy) {
      return res.render('admin/nueva-enfermera', {
        title: 'Registrar enfermera',
        layout: 'layouts/dashboard',
        formError: 'La fecha de nacimiento no puede ser futura.',
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
      return res.render('admin/nueva-enfermera', {
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
    const passwordHash = await bcrypt.hash('123456', 10);

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

    req.session.success = 'Enfermera registrada correctamente. Contraseña temporal: 123456.';
    return res.redirect('/admin/enfermeras');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.render('admin/nueva-enfermera', {
      title: 'Registrar enfermera',
      layout: 'layouts/dashboard',
      formError: 'Ocurrió un error al registrar la enfermera.',
      old: req.body
    });
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
      ORDER BY c.fecha DESC, c.hora DESC
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