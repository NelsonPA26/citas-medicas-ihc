const db = require('../config/database');

async function obtenerEnfermeraPorPersona(idPersona) {
  const [rows] = await db.query(
    `
    SELECT id_enfermera
    FROM enfermera
    WHERE id_persona = ?
    LIMIT 1
    `,
    [idPersona]
  );

  return rows[0] || null;
}

exports.dashboard = async (req, res) => {
  try {
    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró el perfil de enfermería.';
      return res.redirect('/login');
    }

    const [[stats]] = await db.query(
      `
      SELECT
        (SELECT COUNT(*) FROM cita WHERE estado = 'pendiente') AS triajes_pendientes,
        (SELECT COUNT(*) FROM triaje WHERE id_enfermera = ?) AS triajes_realizados,
        (SELECT COUNT(*) FROM triaje WHERE id_enfermera = ? AND DATE(fecha_registro) = CURDATE()) AS triajes_hoy,
        (SELECT COUNT(*) FROM cita WHERE estado = 'triaje_registrado') AS citas_con_triaje
      `,
      [enfermera.id_enfermera, enfermera.id_enfermera]
    );

    res.render('enfermera/dashboard', {
      title: 'Panel de Enfermería',
      layout: 'layouts/dashboard',
      stats
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el panel de enfermería.';
    return res.redirect('/login');
  }
};

exports.triajePendiente = async (req, res) => {
  try {
    const [citas] = await db.query(
      `
      SELECT 
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.estado,

        pac.id_paciente,
        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,

        med.id_medico,
        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.estado = 'pendiente'
      AND t.id_triaje IS NULL
      ORDER BY c.fecha ASC, c.hora ASC
      `
    );

    res.render('enfermera/triaje-pendiente', {
      title: 'Triaje pendiente',
      layout: 'layouts/dashboard',
      citas
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar las citas pendientes de triaje.';
    return res.redirect('/enfermera/dashboard');
  }
};

exports.showRegistrarTriaje = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const [rows] = await db.query(
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
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,
        per_paciente.sexo AS paciente_sexo,

        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.id_cita = ?
      AND c.estado = 'pendiente'
      AND t.id_triaje IS NULL
      LIMIT 1
      `,
      [id_cita]
    );

    if (rows.length === 0) {
      req.session.error = 'La cita no está disponible para registrar triaje.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    res.render('enfermera/registrar-triaje', {
      title: 'Registrar triaje',
      layout: 'layouts/dashboard',
      cita: rows[0]
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el formulario de triaje.';
    return res.redirect('/enfermera/triaje-pendiente');
  }
};

exports.storeRegistrarTriaje = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_cita } = req.params;

    const {
      temperatura,
      presion_arterial,
      frecuencia_cardiaca,
      saturacion,
      sintomas,
      observaciones
    } = req.body;

    if (!temperatura || !presion_arterial || !frecuencia_cardiaca || !saturacion || !sintomas) {
      req.session.error = 'Completa los campos obligatorios del triaje.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    const temp = Number(temperatura);
    const fc = Number(frecuencia_cardiaca);
    const sat = Number(saturacion);

    if (temp < 30 || temp > 45) {
      req.session.error = 'La temperatura ingresada no parece válida.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (fc < 30 || fc > 220) {
      req.session.error = 'La frecuencia cardiaca ingresada no parece válida.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (sat < 50 || sat > 100) {
      req.session.error = 'La saturación debe estar entre 50 y 100.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró el perfil de enfermería.';
      return res.redirect('/enfermera/dashboard');
    }

    await connection.beginTransaction();

    const [citaRows] = await connection.query(
      `
      SELECT id_cita, estado
      FROM cita
      WHERE id_cita = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id_cita]
    );

    if (citaRows.length === 0) {
      await connection.rollback();
      req.session.error = 'La cita seleccionada no existe.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    if (citaRows[0].estado !== 'pendiente') {
      await connection.rollback();
      req.session.error = 'Esta cita ya no está pendiente de triaje.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    const [triajeExistente] = await connection.query(
      `
      SELECT id_triaje
      FROM triaje
      WHERE id_cita = ?
      LIMIT 1
      `,
      [id_cita]
    );

    if (triajeExistente.length > 0) {
      await connection.rollback();
      req.session.error = 'Esta cita ya tiene triaje registrado.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    await connection.query(
      `
      INSERT INTO triaje (
        id_cita,
        id_enfermera,
        temperatura,
        presion_arterial,
        frecuencia_cardiaca,
        saturacion,
        sintomas,
        observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id_cita,
        enfermera.id_enfermera,
        temperatura,
        presion_arterial,
        frecuencia_cardiaca,
        saturacion,
        sintomas,
        observaciones || null
      ]
    );

    await connection.query(
      `
      UPDATE cita
      SET estado = 'triaje_registrado'
      WHERE id_cita = ?
      `,
      [id_cita]
    );

    await connection.commit();

    req.session.success = 'Triaje registrado correctamente.';
    return res.redirect('/enfermera/triaje-pendiente');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      req.session.error = 'Esta cita ya tiene triaje registrado.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    req.session.error = 'Ocurrió un error al registrar el triaje.';
    return res.redirect('/enfermera/triaje-pendiente');
  } finally {
    connection.release();
  }
};

exports.triajesRealizados = async (req, res) => {
  try {
    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró el perfil de enfermería.';
      return res.redirect('/enfermera/dashboard');
    }

    const { q, fecha, estado } = req.query;

    const conditions = ['t.id_enfermera = ?'];
    const params = [enfermera.id_enfermera];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          per_paciente.nombres LIKE ?
          OR per_paciente.apellido_paterno LIKE ?
          OR per_paciente.apellido_materno LIKE ?
          OR per_paciente.dni LIKE ?
          OR per_medico.nombres LIKE ?
          OR per_medico.apellido_paterno LIKE ?
          OR c.motivo LIKE ?
          OR t.sintomas LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search, search, search, search);
    }

    if (fecha && fecha !== '') {
      conditions.push('DATE(t.fecha_registro) = ?');
      params.push(fecha);
    }

    if (estado && estado !== '') {
      conditions.push('c.estado = ?');
      params.push(estado);
    }

    const [triajes] = await db.query(
      `
      SELECT
        t.id_triaje,
        t.temperatura,
        t.presion_arterial,
        t.frecuencia_cardiaca,
        t.saturacion,
        t.sintomas,
        t.observaciones,
        t.fecha_registro,

        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.estado,

        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,

        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno
      FROM triaje t
      INNER JOIN cita c ON t.id_cita = c.id_cita
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.fecha_registro DESC
      `,
      params
    );

    res.render('enfermera/triajes', {
      title: 'Triajes realizados',
      layout: 'layouts/dashboard',
      triajes,
      filters: {
        q: q || '',
        fecha: fecha || '',
        estado: estado || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los triajes realizados.';
    return res.redirect('/enfermera/dashboard');
  }
};