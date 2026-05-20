const db = require('../config/database');

const HORAS_ATENCION = [
  '09:00:00',
  '09:30:00',
  '10:00:00',
  '10:30:00',
  '11:00:00',
  '11:30:00',
  '12:00:00',
  '12:30:00',
  '13:00:00',
  '13:30:00',
  '14:00:00',
  '14:30:00',
  '15:00:00',
  '15:30:00',
  '16:00:00',
  '16:30:00',
  '17:00:00'
];

function esFechaValida(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaSeleccionada = new Date(`${fecha}T00:00:00`);
  const dia = fechaSeleccionada.getDay();

  if (fechaSeleccionada < hoy) return false;

  // 0 = domingo, 6 = sábado
  if (dia === 0 || dia === 6) return false;

  return true;
}

async function obtenerPacientePorPersona(idPersona) {
  const [rows] = await db.query(
    `
    SELECT id_paciente
    FROM paciente
    WHERE id_persona = ?
    LIMIT 1
    `,
    [idPersona]
  );

  return rows[0] || null;
}

exports.dashboard = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/login');
    }

    const [[proximaCita]] = await db.query(
      `
      SELECT 
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.estado,
        m.especialidad,
        p.nombres AS medico_nombres,
        p.apellido_paterno AS medico_apellido_paterno
      FROM cita c
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona p ON m.id_persona = p.id_persona
      WHERE c.id_paciente = ?
      AND c.estado IN ('pendiente', 'triaje_registrado')
      AND c.fecha >= CURDATE()
      ORDER BY c.fecha ASC, c.hora ASC
      LIMIT 1
      `,
      [paciente.id_paciente]
    );

    const [[stats]] = await db.query(
      `
      SELECT
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) AS pendientes,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) AS completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) AS canceladas
      FROM cita
      WHERE id_paciente = ?
      `,
      [paciente.id_paciente]
    );

    res.render('paciente/dashboard', {
      title: 'Panel del Paciente',
      layout: 'layouts/dashboard',
      proximaCita,
      stats
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el panel del paciente.';
    return res.redirect('/login');
  }
};

exports.showReservarCita = async (req, res) => {
  try {
    const [medicos] = await db.query(
      `
      SELECT 
        m.id_medico,
        m.especialidad,
        m.numero_colegiatura,
        p.nombres,
        p.apellido_paterno,
        p.apellido_materno
      FROM medico m
      INNER JOIN persona p ON m.id_persona = p.id_persona
      INNER JOIN usuario u ON p.id_persona = u.id_persona
      WHERE u.activo = 1
      ORDER BY m.especialidad, p.apellido_paterno, p.nombres
      `
    );

    const especialidades = [...new Set(medicos.map(m => m.especialidad))];

    res.render('paciente/reservar-cita', {
      title: 'Reservar cita',
      layout: 'layouts/dashboard',
      medicos,
      especialidades
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el formulario de reserva.';
    res.redirect('/paciente/dashboard');
  }
};

exports.getHorasDisponibles = async (req, res) => {
  try {
    const { id_medico, fecha } = req.query;

    if (!id_medico || !fecha) {
      return res.json({
        ok: false,
        mensaje: 'Selecciona un médico y una fecha.'
      });
    }

    if (!esFechaValida(fecha)) {
      return res.json({
        ok: false,
        mensaje: 'Selecciona una fecha válida de lunes a viernes.'
      });
    }

    const [ocupadas] = await db.query(
      `
      SELECT TIME_FORMAT(hora, '%H:%i:%s') AS hora
      FROM cita
      WHERE id_medico = ?
      AND fecha = ?
      AND estado <> 'cancelada'
      `,
      [id_medico, fecha]
    );

    const horasOcupadas = ocupadas.map(item => item.hora);
    const horasDisponibles = HORAS_ATENCION.filter(hora => !horasOcupadas.includes(hora));

    res.json({
      ok: true,
      horas: horasDisponibles
    });
  } catch (error) {
    console.error(error);
    res.json({
      ok: false,
      mensaje: 'No se pudieron cargar las horas disponibles.'
    });
  }
};

exports.storeReservarCita = async (req, res) => {
  try {
    const { id_medico, fecha, hora, motivo } = req.body;

    if (!id_medico || !fecha || !hora || !motivo) {
      req.session.error = 'Completa todos los datos para reservar la cita.';
      return res.redirect('/paciente/reservar-cita');
    }

    if (!esFechaValida(fecha)) {
      req.session.error = 'La fecha seleccionada no es válida. Debe ser de lunes a viernes y no puede ser pasada.';
      return res.redirect('/paciente/reservar-cita');
    }

    if (!HORAS_ATENCION.includes(hora)) {
      req.session.error = 'La hora seleccionada no está dentro del horario de atención.';
      return res.redirect('/paciente/reservar-cita');
    }

    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const [existeMedico] = await db.query(
      `
      SELECT id_medico
      FROM medico
      WHERE id_medico = ?
      LIMIT 1
      `,
      [id_medico]
    );

    if (existeMedico.length === 0) {
      req.session.error = 'El médico seleccionado no existe.';
      return res.redirect('/paciente/reservar-cita');
    }

    const [ocupada] = await db.query(
      `
      SELECT id_cita
      FROM cita
      WHERE id_medico = ?
      AND fecha = ?
      AND hora = ?
      AND estado <> 'cancelada'
      LIMIT 1
      `,
      [id_medico, fecha, hora]
    );

    if (ocupada.length > 0) {
      req.session.error = 'La hora seleccionada ya fue reservada. Elige otra hora.';
      return res.redirect('/paciente/reservar-cita');
    }

    await db.query(
      `
      INSERT INTO cita (
        id_paciente,
        id_medico,
        fecha,
        hora,
        motivo,
        estado
      ) VALUES (?, ?, ?, ?, ?, 'pendiente')
      `,
      [paciente.id_paciente, id_medico, fecha, hora, motivo]
    );

    req.session.success = 'Cita reservada correctamente.';
    return res.redirect('/paciente/dashboard');
  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      req.session.error = 'La hora seleccionada ya fue reservada. Elige otra hora.';
      return res.redirect('/paciente/reservar-cita');
    }

    req.session.error = 'Ocurrió un error al reservar la cita.';
    return res.redirect('/paciente/reservar-cita');
  }
};

exports.misCitas = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const { q, estado, fecha } = req.query;

    const conditions = ['c.id_paciente = ?'];
    const params = [paciente.id_paciente];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          c.motivo LIKE ?
          OR p.nombres LIKE ?
          OR p.apellido_paterno LIKE ?
          OR p.apellido_materno LIKE ?
          OR m.especialidad LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search);
    }

    if (estado && estado !== '') {
      conditions.push('c.estado = ?');
      params.push(estado);
    }

    if (fecha && fecha !== '') {
      conditions.push('c.fecha = ?');
      params.push(fecha);
    }

    const [citas] = await db.query(
      `
      SELECT 
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.estado,
        c.fecha_creacion,
        m.especialidad,
        p.nombres AS medico_nombres,
        p.apellido_paterno AS medico_apellido_paterno,
        p.apellido_materno AS medico_apellido_materno
      FROM cita c
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona p ON m.id_persona = p.id_persona
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.fecha DESC, c.hora DESC
      `,
      params
    );

    res.render('paciente/mis-citas', {
      title: 'Mis citas',
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
    req.session.error = 'No se pudieron cargar tus citas.';
    res.redirect('/paciente/dashboard');
  }
};

exports.cancelarCita = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const [cita] = await db.query(
      `
      SELECT id_cita, estado
      FROM cita
      WHERE id_cita = ?
      AND id_paciente = ?
      LIMIT 1
      `,
      [id_cita, paciente.id_paciente]
    );

    if (cita.length === 0) {
      req.session.error = 'La cita seleccionada no existe o no te pertenece.';
      return res.redirect('/paciente/mis-citas');
    }

    if (cita[0].estado !== 'pendiente') {
      req.session.error = 'Solo puedes cancelar citas que estén pendientes.';
      return res.redirect('/paciente/mis-citas');
    }

    await db.query(
      `
      UPDATE cita
      SET estado = 'cancelada'
      WHERE id_cita = ?
      AND id_paciente = ?
      `,
      [id_cita, paciente.id_paciente]
    );

    req.session.success = 'La cita fue cancelada correctamente.';
    return res.redirect('/paciente/mis-citas');
  } catch (error) {
    console.error(error);
    req.session.error = 'Ocurrió un error al cancelar la cita.';
    return res.redirect('/paciente/mis-citas');
  }
};


exports.historial = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const { q, fecha } = req.query;

    const conditions = [
      'c.id_paciente = ?',
      "c.estado = 'completada'",
      'con.borrador = 0'
    ];

    const params = [paciente.id_paciente];

    if (q && q.trim() !== '') {
      conditions.push(`
        (
          c.motivo LIKE ?
          OR con.diagnostico LIKE ?
          OR con.tratamiento LIKE ?
          OR con.recomendaciones LIKE ?
          OR m.especialidad LIKE ?
          OR per_medico.nombres LIKE ?
          OR per_medico.apellido_paterno LIKE ?
          OR per_medico.apellido_materno LIKE ?
        )
      `);

      const search = `%${q.trim()}%`;
      params.push(search, search, search, search, search, search, search, search);
    }

    if (fecha && fecha !== '') {
      conditions.push('c.fecha = ?');
      params.push(fecha);
    }

    const [consultas] = await db.query(
      `
      SELECT 
        con.id_consulta,
        con.diagnostico,
        con.tratamiento,
        con.recomendaciones,
        con.fecha_creacion,

        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        c.estado,

        m.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,
        per_medico.apellido_materno AS medico_apellido_materno
      FROM consulta con
      INNER JOIN cita c ON con.id_cita = c.id_cita
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona per_medico ON m.id_persona = per_medico.id_persona
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.fecha DESC, c.hora DESC
      `,
      params
    );

    res.render('paciente/historial', {
      title: 'Historial médico',
      layout: 'layouts/dashboard',
      consultas,
      filters: {
        q: q || '',
        fecha: fecha || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar tu historial médico.';
    return res.redirect('/paciente/dashboard');
  }
};

exports.detalleHistorial = async (req, res) => {
  try {
    const { id_consulta } = req.params;

    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const [rows] = await db.query(
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

        m.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,
        per_medico.apellido_materno AS medico_apellido_materno,

        t.temperatura,
        t.presion_arterial,
        t.frecuencia_cardiaca,
        t.saturacion,
        t.sintomas,
        t.observaciones AS triaje_observaciones
      FROM consulta con
      INNER JOIN cita c ON con.id_cita = c.id_cita
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona per_medico ON m.id_persona = per_medico.id_persona
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE con.id_consulta = ?
      AND c.id_paciente = ?
      AND c.estado = 'completada'
      AND con.borrador = 0
      LIMIT 1
      `,
      [id_consulta, paciente.id_paciente]
    );

    if (rows.length === 0) {
      req.session.error = 'La consulta seleccionada no existe o no está disponible.';
      return res.redirect('/paciente/historial');
    }

    res.render('paciente/detalle-historial', {
      title: 'Detalle de consulta',
      layout: 'layouts/dashboard',
      consulta: rows[0]
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el detalle de la consulta.';
    return res.redirect('/paciente/historial');
  }
};