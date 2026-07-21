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
function normalizarTextoClinico(value) {
  const text = (value || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim().replace(/\s{2,}/g, ' '))
    .filter(Boolean)
    .join('\n');

  return text || null;
}

function textoClinicoValido(value, min = 5, max = 800) {
  if (!value) return true;
  if (value.length < min || value.length > max) return false;
  return /^[\p{L}0-9 .,;:()/%+\-\n]+$/u.test(value);
}

function limpiarFiltroTexto(value, maxLength = 80) {
  return String(value || '')
    .trim()
    .replace(/\s{2,}/g, ' ')
    .replace(/[^\p{L}0-9 .,;:()/-]/gu, '')
    .slice(0, maxLength);
}

function fechaFiltroValida(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

exports.buscarMedicamentos = async (req, res) => {
  try {
    const query = limpiarFiltroTexto(req.query.q, 60);

    if (!query) return res.json([]);

    const [medicamentos] = await db.query(
      `
      SELECT id_medicamento, nombre
      FROM medicamento_catalogo
      WHERE activo = 1
        AND nombre LIKE ?
      ORDER BY nombre ASC
      LIMIT 8
      `,
      [`${query}%`]
    );

    return res.json(medicamentos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudieron cargar los medicamentos.' });
  }
};

exports.presentacionesMedicamento = async (req, res) => {
  try {
    const idMedicamento = Number(req.params.id_medicamento);
    if (!Number.isInteger(idMedicamento) || idMedicamento < 1) {
      return res.status(400).json({ message: 'Medicamento no válido.' });
    }

    const [presentaciones] = await db.query(
      `
      SELECT id_presentacion, presentacion, dosis_habitual, unidad_dosis
      FROM medicamento_presentacion
      WHERE id_medicamento = ?
        AND activo = 1
      ORDER BY presentacion ASC, id_presentacion ASC
      `,
      [idMedicamento]
    );

    return res.json(presentaciones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudieron cargar las presentaciones.' });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró tu perfil médico. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/login');
    }

    const [[stats]] = await db.query(
      `
      SELECT
        SUM(CASE WHEN c.estado IN ('triaje_registrado', 'en_consulta') THEN 1 ELSE 0 END) AS listas_atencion,
        SUM(CASE WHEN c.estado = 'en_consulta' AND con.borrador = 1 THEN 1 ELSE 0 END) AS borradores,
        SUM(CASE WHEN c.estado = 'completada' THEN 1 ELSE 0 END) AS completadas,
        COUNT(DISTINCT CASE WHEN c.estado = 'completada' THEN c.id_paciente END) AS pacientes_atendidos
      FROM cita c
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE c.id_medico = ?
      `,
      [medico.id_medico]
    );

    const [proximasCitas] = await db.query(
      `
      SELECT
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.estado,
        p.nombres AS paciente_nombres,
        p.apellido_paterno AS paciente_apellido_paterno,
        p.dni AS paciente_dni
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona p ON pac.id_persona = p.id_persona
      WHERE c.id_medico = ?
        AND c.estado IN ('triaje_registrado', 'en_consulta')
      ORDER BY
        CASE WHEN c.fecha >= CURDATE() THEN 0 ELSE 1 END,
        c.fecha ASC,
        c.hora ASC
      LIMIT 4
      `,
      [medico.id_medico]
    );

    res.render('medico/dashboard', {
      title: 'Panel del Médico',
      layout: 'layouts/dashboard',
      stats,
      proximasCitas
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el panel médico. Actualiza la página o vuelve a iniciar sesión si continúa el problema.';
    return res.redirect('/login');
  }
};

exports.ayuda = (req, res) => {
  const returnUrl = typeof req.query.returnTo === 'string'
    && (req.query.returnTo === '/perfil' || req.query.returnTo.startsWith('/medico/'))
    ? req.query.returnTo
    : '/medico/dashboard';

  res.render('medico/ayuda', {
    title: 'Ayuda del médico',
    layout: 'layouts/dashboard',
    returnUrl
  });
};

exports.citasDelDia = async (req, res) => {
  try {
    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró tu perfil médico. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/medico/dashboard');
    }

    const estadoValido = ['triaje_registrado', 'en_consulta'].includes(req.query.estado)
      ? req.query.estado
      : '';
    const filters = {
      q: limpiarFiltroTexto(req.query.q, 100),
      fecha: fechaFiltroValida(req.query.fecha) ? req.query.fecha : '',
      estado: estadoValido
    };

    const where = [
      'c.id_medico = ?',
      "c.estado IN ('triaje_registrado', 'en_consulta')",
      '(con.id_consulta IS NULL OR con.borrador = 1)'
    ];
    const params = [medico.id_medico];

    if (filters.q) {
      const search = `%${filters.q}%`;
      where.push(`(
        CONCAT_WS(' ', per_paciente.nombres, per_paciente.apellido_paterno, per_paciente.apellido_materno) LIKE ?
        OR per_paciente.dni LIKE ?
        OR c.motivo LIKE ?
      )`);
      params.push(search, search, search);
    }

    if (filters.fecha) {
      where.push('c.fecha = ?');
      params.push(filters.fecha);
    }

    if (filters.estado === 'en_consulta') {
      where.push("(c.estado = 'en_consulta' OR con.borrador = 1)");
    } else if (filters.estado === 'triaje_registrado') {
      where.push("c.estado = 'triaje_registrado' AND (con.id_consulta IS NULL OR con.borrador IS NULL OR con.borrador = 0)");
    }

    const [citas] = await db.query(
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

        t.id_triaje,

        con.id_consulta,
        con.borrador
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN triaje t ON c.id_cita = t.id_cita
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE ${where.join(' AND ')}
      ORDER BY
        CASE WHEN c.estado = 'en_consulta' OR con.borrador = 1 THEN 0 ELSE 1 END ASC,
        c.fecha ASC,
        c.hora ASC
      `,
      params
    );

    res.render('medico/citas', {
      title: 'Citas por atender',
      layout: 'layouts/dashboard',
      citas,
      filters,
      hasActiveFilters: Boolean(filters.q || filters.fecha || filters.estado)
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar tus citas. Actualiza la página o intenta nuevamente en unos segundos.';
    return res.redirect('/medico/dashboard');
  }
};

exports.showAtenderCita = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró tu perfil médico. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/medico/dashboard');
    }

    const [rows] = await db.query(
      `
      SELECT 
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.sintomas AS sintomas_paciente,
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

        ant.alergias,
        ant.enfermedades_previas,
        ant.medicacion_actual,
        ant.cirugias,
        ant.antecedentes_familiares,
        ant.observaciones AS antecedentes_observaciones,

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
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE c.id_cita = ?
      AND c.id_medico = ?
      AND c.estado IN ('triaje_registrado', 'en_consulta')
      AND (con.id_consulta IS NULL OR con.borrador = 1)
      LIMIT 1
      `,
      [id_cita, medico.id_medico]
    );

    if (rows.length === 0) {
      req.session.error = 'La cita no está disponible para atención médica. Puede estar cancelada, completada o aún pendiente de triaje.';
      return res.redirect('/medico/citas');
    }

    const backUrl = req.query.returnTo === 'dashboard' ? '/medico/dashboard' : '/medico/citas';

    res.render('medico/atender-cita', {
      title: 'Atender cita',
      layout: 'layouts/dashboard',
      cita: rows[0],
      backUrl
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar la cita seleccionada. Vuelve a Citas por atender e inténtalo nuevamente.';
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

    if (!accion || !['borrador', 'confirmar'].includes(accion)) {
      req.session.error = 'Selecciona una acción válida para guardar la consulta.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    const diagnosticoLimpio = normalizarTextoClinico(diagnostico);
    const tratamientoLimpio = normalizarTextoClinico(tratamiento);
    const recomendacionesLimpias = normalizarTextoClinico(recomendaciones);
    const observacionesLimpias = normalizarTextoClinico(observaciones);

    if (accion === 'confirmar' && (!diagnosticoLimpio || !tratamientoLimpio)) {
      req.session.error = 'Para confirmar la consulta, el diagnóstico y el tratamiento/receta son obligatorios.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    if (!textoClinicoValido(diagnosticoLimpio, 5, 255)) {
      req.session.error = 'El diagnóstico debe tener entre 5 y 255 caracteres y usar puntuación básica.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    if (!textoClinicoValido(tratamientoLimpio, 5, 800)) {
      req.session.error = 'El tratamiento/receta debe tener entre 5 y 800 caracteres y usar puntuación básica.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    if (!textoClinicoValido(recomendacionesLimpias, 5, 800)) {
      req.session.error = 'Las recomendaciones deben tener entre 5 y 800 caracteres y usar puntuación básica.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    if (!textoClinicoValido(observacionesLimpias, 5, 800)) {
      req.session.error = 'Las observaciones deben tener entre 5 y 800 caracteres y usar puntuación básica.';
      return res.redirect(`/medico/citas/${id_cita}/atender`);
    }

    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró tu perfil médico. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/medico/dashboard');
    }

    await connection.beginTransaction();

    const [citaRows] = await connection.query(
      `
      SELECT
        c.id_cita,
        c.estado,
        c.id_medico,
        t.id_triaje,
        con.id_consulta,
        con.borrador
      FROM cita c
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      LEFT JOIN consulta con ON c.id_cita = con.id_cita
      WHERE c.id_cita = ?
      AND c.id_medico = ?
      LIMIT 1
      FOR UPDATE
      `,
      [id_cita, medico.id_medico]
    );

    if (citaRows.length === 0) {
      await connection.rollback();
      req.session.error = 'La cita seleccionada no existe o no pertenece a tu cuenta. Actualiza la lista e inténtalo nuevamente.';
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

    if (citaRows[0].estado === 'cancelada') {
      await connection.rollback();
      req.session.error = 'No puedes atender una cita cancelada.';
      return res.redirect('/medico/citas');
    }

    if (!['triaje_registrado', 'en_consulta'].includes(citaRows[0].estado)) {
      await connection.rollback();
      req.session.error = 'La cita no está en un estado válido para atención médica.';
      return res.redirect('/medico/citas');
    }

    if (citaRows[0].id_consulta && Number(citaRows[0].borrador) === 0) {
      await connection.rollback();
      req.session.error = 'Esta consulta ya fue finalizada y no puede modificarse.';
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
          diagnosticoLimpio,
          tratamientoLimpio,
          recomendacionesLimpias,
          observacionesLimpias,
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
          diagnosticoLimpio,
          tratamientoLimpio,
          recomendacionesLimpias,
          observacionesLimpias,
          esPrivada,
          borrador
        ]
      );
    }

    await connection.query(
      `
      UPDATE cita
      SET estado = ?
      WHERE id_cita = ?
      `,
      [accion === 'confirmar' ? 'completada' : 'en_consulta', id_cita]
    );

    await connection.commit();

    if (accion === 'borrador') {
      req.session.success = 'Consulta guardada en progreso.';
      return res.redirect('/medico/citas');
    }

    req.session.success = 'Consulta confirmada correctamente.';
    return res.redirect('/medico/citas');
  } catch (error) {
    await connection.rollback();
    console.error(error);

    req.session.error = 'No se pudo registrar la consulta. Revisa diagnóstico, tratamiento y acción seleccionada antes de intentarlo nuevamente.';
    return res.redirect(`/medico/citas/${req.params.id_cita}/atender`);
  } finally {
    connection.release();
  }
};

exports.pacientes = async (req, res) => {
  try {
    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró tu perfil médico. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/medico/dashboard');
    }

    const q = (req.query.q || '').trim().replace(/\s{2,}/g, ' ');

    const conditions = ['c.id_medico = ?'];
    const params = [medico.id_medico];

    if (q !== '') {
      conditions.push(`
        (
          CONCAT_WS(' ', per.nombres, per.apellido_paterno, per.apellido_materno) LIKE ?
          OR per.dni LIKE ?
        )
      `);

      const search = `%${q}%`;
      params.push(search, search);
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
        MAX(CASE WHEN c.estado = 'completada' THEN c.fecha END) AS ultima_atencion,
        (
          SELECT cita_ultima.motivo
          FROM cita cita_ultima
          INNER JOIN consulta consulta_ultima ON consulta_ultima.id_cita = cita_ultima.id_cita
          WHERE cita_ultima.id_paciente = pac.id_paciente
          AND cita_ultima.id_medico = ?
          AND cita_ultima.estado = 'completada'
          AND consulta_ultima.borrador = 0
          ORDER BY cita_ultima.fecha DESC, cita_ultima.hora DESC
          LIMIT 1
        ) AS ultimo_motivo
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
      ORDER BY
        CASE WHEN ultima_atencion IS NULL THEN 1 ELSE 0 END ASC,
        ultima_atencion DESC,
        per.apellido_paterno ASC,
        per.nombres ASC
      `,
      [medico.id_medico, ...params]
    );

    return res.render('medico/pacientes', {
      title: 'Pacientes',
      layout: 'layouts/dashboard',
      pacientes,
      filters: {
        q
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los pacientes. Actualiza la página o intenta nuevamente en unos segundos.';
    return res.redirect('/medico/dashboard');
  }
};


exports.historialPaciente = async (req, res) => {
  try {
    const { id_paciente } = req.params;

    const medico = await obtenerMedicoPorPersona(req.session.user.id_persona);

    if (!medico) {
      req.session.error = 'No se encontró tu perfil médico. Vuelve a iniciar sesión o solicita apoyo a administración.';
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
      AND EXISTS (
        SELECT 1
        FROM cita c_relacionada
        WHERE c_relacionada.id_paciente = pac.id_paciente
        AND c_relacionada.id_medico = ?
      )
      LIMIT 1
      `,
      [id_paciente, medico.id_medico]
    );

    if (pacienteRows.length === 0) {
      req.session.error = 'El paciente seleccionado no existe o no está relacionado con tus citas.';
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

    const consultaSolicitada = String(req.query.consulta || '').trim();
    const consultaSeleccionada = consultas.find(consulta => String(consulta.id_consulta) === consultaSolicitada);

    if (consultaSolicitada && !consultaSeleccionada) {
      req.session.error = 'La consulta seleccionada no pertenece al historial disponible para este paciente.';
      return res.redirect(`/medico/pacientes/${id_paciente}/historial`);
    }

    res.render('medico/historial-paciente', {
      title: 'Historial del paciente',
      layout: 'layouts/dashboard',
      paciente: pacienteRows[0],
      consultas,
      consultaSeleccionada: consultaSeleccionada || consultas[0] || null,
      returnUrl: '/medico/pacientes'
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el historial del paciente. Vuelve a la lista e inténtalo nuevamente.';
    return res.redirect('/medico/pacientes');
  }
};

exports.detalleConsultaPaciente = async (req, res) => {
  const { id_paciente, id_consulta } = req.params;
  return res.redirect(`/medico/pacientes/${id_paciente}/historial?consulta=${id_consulta}`);
};
