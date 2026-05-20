const db = require('../config/database');

async function obtenerMedicoPorPersona(idPersona) {
  const [rows] = await db.query(
    `
    SELECT id_medico
    FROM medico
    WHERE id_persona = ?
    LIMIT 1
    `,
    [idPersona]
  );

  return rows[0] || null;
}

exports.dashboard = async (req, res) => {
  try {
    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró el perfil del médico.';
      return res.redirect('/login');
    }

    const [[stats]] = await db.query(
      `
      SELECT
        SUM(CASE WHEN c.estado = 'triaje_registrado' THEN 1 ELSE 0 END) AS listas_atencion,
        SUM(CASE WHEN con.borrador = 1 THEN 1 ELSE 0 END) AS borradores,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) AS completadas,
        COUNT(DISTINCT CASE WHEN c.estado = 'completada' THEN c.id_paciente END) AS pacientes_atendidos
      FROM cita c
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE c.id_medico = ?
      `,
      [medico.id_medico]
    );

    res.render('medico/dashboard', {
      title: 'Panel del Médico',
      layout: 'layouts/dashboard',
      stats
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el panel del médico.';
    return res.redirect('/login');
  }
};

exports.citasDelDia = async (req, res) => {
  try {
    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró el perfil del médico.';
      return res.redirect('/medico/dashboard');
    }

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

        con.id_consulta,
        con.borrador
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE c.id_medico = ?
      AND (
        c.estado = 'triaje_registrado'
        OR con.borrador = 1
      )
      ORDER BY c.fecha ASC, c.hora ASC
      `,
      [medico.id_medico]
    );

    res.render('medico/citas', {
      title: 'Citas del día',
      layout: 'layouts/dashboard',
      citas
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar las citas del médico.';
    return res.redirect('/medico/dashboard');
  }
};

exports.showAtenderCita = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró el perfil del médico.';
      return res.redirect('/medico/dashboard');
    }

    const [rows] = await db.query(
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
        per_paciente.sexo AS paciente_sexo,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,

        t.temperatura,
        t.presion_arterial,
        t.frecuencia_cardiaca,
        t.saturacion,
        t.sintomas,
        t.observaciones AS triaje_observaciones,
        t.fecha_registro AS triaje_fecha,

        con.id_consulta,
        con.diagnostico,
        con.tratamiento,
        con.recomendaciones,
        con.observaciones AS consulta_observaciones,
        con.privada,
        con.borrador
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN triaje t ON c.id_cita = t.id_cita
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE c.id_cita = ?
      AND c.id_medico = ?
      AND (
        c.estado = 'triaje_registrado'
        OR con.borrador = 1
      )
      LIMIT 1
      `,
      [id_cita, medico.id_medico]
    );

    if (rows.length === 0) {
      req.session.error = 'La cita no está disponible para atención médica.';
      return res.redirect('/medico/citas');
    }

    res.render('medico/atender-cita', {
      title: 'Atender cita',
      layout: 'layouts/dashboard',
      cita: rows[0]
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar la cita seleccionada.';
    return res.redirect('/medico/citas');
  }
};

exports.storeAtenderCita = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id_cita } = req.params;

    const {
      diagnostico,
      tratamiento,
      recomendaciones,
      observaciones,
      privada,
      accion
    } = req.body;

    if (!diagnostico || !tratamiento) {
      req.session.error = 'El diagnóstico y tratamiento son obligatorios.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    if (!accion || !['borrador', 'confirmar'].includes(accion)) {
      req.session.error = 'Selecciona una acción válida para guardar la consulta.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró el perfil del médico.';
      return res.redirect('/medico/dashboard');
    }

    await connection.beginTransaction();

    const [citaRows] = await connection.query(
      `
      SELECT c.id_cita, c.estado, c.id_medico, t.id_triaje
      FROM cita c
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.id_cita = ?
      AND c.id_medico = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id_cita, medico.id_medico]
    );

    if (citaRows.length === 0) {
      await connection.rollback();
      req.session.error = 'La cita seleccionada no existe o no te pertenece.';
      return res.redirect('/medico/citas');
    }

    if (!citaRows[0].id_triaje) {
      await connection.rollback();
      req.session.error = 'No puedes atender una cita sin triaje registrado.';
      return res.redirect('/medico/citas');
    }

    if (citaRows[0].estado === 'completada') {
      await connection.rollback();
      req.session.error = 'Esta cita ya fue completada.';
      return res.redirect('/medico/citas');
    }

    const borrador = accion === 'borrador' ? 1 : 0;
    const esPrivada = privada ? 1 : 0;

    const [consultaRows] = await connection.query(
      `
      SELECT id_consulta
      FROM consulta
      WHERE id_cita = ?
      LIMIT 1
      `,
      [id_cita]
    );

    if (consultaRows.length > 0) {
      await connection.query(
        `
        UPDATE consulta
        SET 
          diagnostico = ?,
          tratamiento = ?,
          recomendaciones = ?,
          observaciones = ?,
          privada = ?,
          borrador = ?
        WHERE id_cita = ?
        `,
        [
          diagnostico,
          tratamiento,
          recomendaciones || null,
          observaciones || null,
          esPrivada,
          borrador,
          id_cita
        ]
      );
    } else {
      await connection.query(
        `
        INSERT INTO consulta (
          id_cita,
          diagnostico,
          tratamiento,
          recomendaciones,
          observaciones,
          privada,
          borrador
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          id_cita,
          diagnostico,
          tratamiento,
          recomendaciones || null,
          observaciones || null,
          esPrivada,
          borrador
        ]
      );
    }

    if (accion === 'confirmar') {
      await connection.query(
        `
        UPDATE cita
        SET estado = 'completada'
        WHERE id_cita = ?
        `,
        [id_cita]
      );
    }

    await connection.commit();

    if (accion === 'borrador') {
      req.session.success = 'Consulta guardada como borrador.';
      return res.redirect('/medico/citas');
    }

    req.session.success = 'Consulta confirmada correctamente.';
    return res.redirect('/medico/citas');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    req.session.error = 'Ocurrió un error al registrar la consulta.';
    return res.redirect(`/medico/citas/${req.params.id_cita}/atender`);
  } finally {
    connection.release();
  }
};

exports.pacientes = async (req, res) => {
  try {
    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró el perfil del médico.';
      return res.redirect('/medico/dashboard');
    }

    const { q, sexo } = req.query;

    const conditions = ['c.id_medico = ?'];
    const params = [medico.id_medico];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          per.nombres LIKE ?
          OR per.apellido_paterno LIKE ?
          OR per.apellido_materno LIKE ?
          OR per.dni LIKE ?
          OR per.correo LIKE ?
          OR per.telefono LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search, search);
    }

    if (sexo && sexo !== '') {
      conditions.push('per.sexo = ?');
      params.push(sexo);
    }

    const [pacientes] = await db.query(
      `
      SELECT
        pac.id_paciente,
        per.id_persona,
        per.nombres,
        per.apellido_paterno,
        per.apellido_materno,
        per.dni,
        per.correo,
        per.telefono,
        per.sexo,
        TIMESTAMPDIFF(YEAR, per.fecha_nacimiento, CURDATE()) AS edad,
        COUNT(c.id_cita) AS total_citas,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) AS consultas_completadas,
        MAX(c.fecha) AS ultima_atencion
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per ON pac.id_persona = per.id_persona
      WHERE ${conditions.join(' AND ')}
      GROUP BY
        pac.id_paciente,
        per.id_persona,
        per.nombres,
        per.apellido_paterno,
        per.apellido_materno,
        per.dni,
        per.correo,
        per.telefono,
        per.sexo,
        per.fecha_nacimiento
      ORDER BY ultima_atencion DESC
      `,
      params
    );

    res.render('medico/pacientes', {
      title: 'Pacientes',
      layout: 'layouts/dashboard',
      pacientes,
      filters: {
        q: q || '',
        sexo: sexo || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los pacientes.';
    return res.redirect('/medico/dashboard');
  }
};


exports.historialPaciente = async (req, res) => {
  try {
    const { id_paciente } = req.params;

    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró el perfil del médico.';
      return res.redirect('/medico/dashboard');
    }

    const [pacienteRows] = await db.query(
      `
      SELECT
        pac.id_paciente,
        per.nombres,
        per.apellido_paterno,
        per.apellido_materno,
        per.dni,
        per.correo,
        per.telefono,
        per.sexo,
        TIMESTAMPDIFF(YEAR, per.fecha_nacimiento, CURDATE()) AS edad,
        ant.alergias,
        ant.enfermedades_previas,
        ant.medicacion_actual,
        ant.cirugias,
        ant.antecedentes_familiares,
        ant.observaciones AS antecedentes_observaciones
      FROM paciente pac
      INNER JOIN persona per ON pac.id_persona = per.id_persona
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      WHERE pac.id_paciente = ?
      LIMIT 1
      `,
      [id_paciente]
    );

    if (pacienteRows.length === 0) {
      req.session.error = 'El paciente seleccionado no existe.';
      return res.redirect('/medico/pacientes');
    }

    const [consultas] = await db.query(
      `
      SELECT
        con.id_consulta,
        con.diagnostico,
        con.tratamiento,
        con.recomendaciones,
        con.observaciones,
        con.privada,
        con.fecha_creacion,

        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.estado,

        t.temperatura,
        t.presion_arterial,
        t.frecuencia_cardiaca,
        t.saturacion,
        t.sintomas,
        t.observaciones AS triaje_observaciones
      FROM consulta con
      INNER JOIN cita c ON con.id_cita = c.id_cita
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.id_paciente = ?
      AND c.id_medico = ?
      AND c.estado = 'completada'
      AND con.borrador = 0
      ORDER BY c.fecha DESC, c.hora DESC
      `,
      [id_paciente, medico.id_medico]
    );

    res.render('medico/historial-paciente', {
      title: 'Historial del paciente',
      layout: 'layouts/dashboard',
      paciente: pacienteRows[0],
      consultas
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el historial del paciente.';
    return res.redirect('/medico/pacientes');
  }
};