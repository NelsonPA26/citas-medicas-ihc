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

const SINTOMAS_FRECUENTES = [
  'Fiebre',
  'Malestar general',
  'Cansancio',
  'Dolor muscular',
  'Tos',
  'Dolor de garganta',
  'Congestión nasal',
  'Dificultad para respirar',
  'Dolor abdominal',
  'Náuseas',
  'Vómitos',
  'Diarrea',
  'Ansiedad',
  'Insomnio',
  'Otro'
];

function textoClinicoValido(value, obligatorio = false) {
  const text = (value || '').trim();

  if (!obligatorio && text === '') return true;
  if (obligatorio && text.length < 5) return false;

  return /^[\p{L}0-9 .,;:()/%+-]+$/u.test(text);
}

function detalleValido(value) {
  const text = (value || '').trim();

  if (!text) return true;
  if (text.length > 200) return false;
  if (!/^[\p{L}0-9 .,;:()/%+-]+$/u.test(text)) return false;

  return !/^([\p{L}])\1{2,}$/iu.test(text);
}

function normalizarSintomas(sintomas, sintomasOtro = '') {
  if (!sintomas) return null;

  const seleccionados = Array.isArray(sintomas) ? sintomas : [sintomas];

  const validos = seleccionados
    .filter(sintoma => SINTOMAS_FRECUENTES.includes(sintoma) && sintoma !== 'Otro')
    .slice(0, 8);

  if (seleccionados.includes('Otro')) {
    const detalle = (sintomasOtro || '').trim().replace(/,/g, ';');

    if (textoClinicoValido(detalle, true)) {
      validos.push(`Otro: ${detalle}`);
    } else {
      validos.push('Otro síntoma');
    }
  }

  return validos.length > 0 ? validos.join(', ') : null;
}

function incluyeSintomaOtro(sintomas) {
  const seleccionados = Array.isArray(sintomas) ? sintomas : [sintomas].filter(Boolean);
  return seleccionados.includes('Otro');
}

function normalizarLista(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function unirOpciones(opciones) {
  return normalizarLista(opciones).join(', ');
}

function construirAntecedente({ estado, opciones, detalle, etiquetaNo, etiquetaNoSabe, etiquetaSi }) {
  if (estado === 'no') return etiquetaNo;
  if (estado === 'no_sabe') return etiquetaNoSabe;

  const partes = [];
  const opcionesTexto = unirOpciones(opciones);
  const detalleTexto = (detalle || '').trim();

  if (opcionesTexto) partes.push(`${etiquetaSi}: ${opcionesTexto}`);
  if (detalleTexto) partes.push(`Detalle: ${detalleTexto}`);

  return partes.length > 0 ? partes.join('. ') : null;
}

function construirMedicacion(body) {
  const estado = body.medicacion_estado;
  if (estado === 'no') return 'No consume medicación actualmente.';
  if (estado === 'no_sabe') return 'No sabe o no recuerda la medicación actual.';

  const medicamento = (body.medicamento_nombre || '').trim();
  const dosis = (body.medicamento_dosis || '').trim();
  const frecuencia = (body.medicamento_frecuencia || '').trim();
  const motivo = (body.medicamento_motivo || '').trim();
  const desde = (body.medicamento_desde || '').trim();
  const detalle = (body.medicacion_detalle || '').trim();
  const partes = [];

  if (medicamento) partes.push(`Medicamento: ${medicamento}`);
  if (dosis) partes.push(`Dosis: ${dosis}`);
  if (frecuencia) partes.push(`Frecuencia: ${frecuencia}`);
  if (motivo) partes.push(`Motivo: ${motivo}`);
  if (desde) partes.push(`Desde: ${desde}`);
  if (detalle) partes.push(`Detalle adicional: ${detalle}`);

  return partes.length > 0 ? partes.join('. ') : null;
}

function esFechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha || ''))) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaSeleccionada = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(fechaSeleccionada.getTime())) return false;

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

async function existeMedicoActivo(idMedico) {
  const [rows] = await db.query(
    `
    SELECT m.id_medico
    FROM medico m
    INNER JOIN persona p ON m.id_persona = p.id_persona
    INNER JOIN usuario u ON p.id_persona = u.id_persona
    WHERE m.id_medico = ?
    AND u.activo = 1
    LIMIT 1
    `,
    [idMedico]
  );

  return rows.length > 0;
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
      AND c.estado IN ('pendiente', 'triaje_registrado', 'en_consulta')
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

exports.ayuda = (req, res) => {
  res.render('paciente/ayuda', {
    title: 'Ayuda del paciente',
    layout: 'layouts/dashboard'
  });
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
      especialidades,
      sintomasFrecuentes: SINTOMAS_FRECUENTES,
      modoEdicion: false,
      cita: null,
      actionUrl: '/paciente/reservar-cita'
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el formulario de reserva.';
    res.redirect('/paciente/dashboard');
  }
};

exports.getHorasDisponibles = async (req, res) => {
  try {
    const { id_medico, fecha, id_cita } = req.query;

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

    if (!(await existeMedicoActivo(id_medico))) {
      return res.json({
        ok: false,
        mensaje: 'El médico seleccionado no está disponible.'
      });
    }

    const params = [id_medico, fecha];
    let excludeCurrent = '';

    if (id_cita) {
      excludeCurrent = 'AND id_cita <> ?';
      params.push(id_cita);
    }

    const [ocupadas] = await db.query(
      `
      SELECT TIME_FORMAT(hora, '%H:%i:%s') AS hora
      FROM cita
      WHERE id_medico = ?
      AND fecha = ?
      ${excludeCurrent}
      `,
      params
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
    const { id_medico, fecha, hora, motivo, sintomas, sintomas_otro } = req.body;
    const sintomasNormalizados = normalizarSintomas(sintomas, sintomas_otro);

    if (!id_medico || !fecha || !hora || !motivo) {
      req.session.error = 'Completa todos los datos para reservar la cita.';
      return res.redirect('/paciente/reservar-cita');
    }

    if (!textoClinicoValido(motivo, true)) {
      req.session.error = 'Ingresa un motivo válido con al menos 5 caracteres.';
      return res.redirect('/paciente/reservar-cita');
    }

    if (incluyeSintomaOtro(sintomas) && !textoClinicoValido(sintomas_otro, true)) {
      req.session.error = 'Describe el otro síntoma con al menos 5 caracteres.';
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

    if (!(await existeMedicoActivo(id_medico))) {
      req.session.error = 'El médico seleccionado no está disponible.';
      return res.redirect('/paciente/reservar-cita');
    }

    const [ocupada] = await db.query(
      `
      SELECT id_cita
      FROM cita
      WHERE id_medico = ?
      AND fecha = ?
      AND hora = ?
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
        sintomas,
        motivo,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente')
      `,
      [paciente.id_paciente, id_medico, fecha, hora, sintomasNormalizados, motivo]
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

exports.showEditarCita = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const [citaRows] = await db.query(
      `
      SELECT
        c.id_cita,
        c.id_medico,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
        TIME_FORMAT(c.hora, '%H:%i:%s') AS hora,
        c.sintomas,
        c.motivo,
        c.estado,
        m.especialidad
      FROM cita c
      INNER JOIN medico m ON c.id_medico = m.id_medico
      WHERE c.id_cita = ?
      AND c.id_paciente = ?
      LIMIT 1
      `,
      [id_cita, paciente.id_paciente]
    );

    if (citaRows.length === 0) {
      req.session.error = 'La cita seleccionada no existe o no te pertenece.';
      return res.redirect('/paciente/mis-citas');
    }

    if (citaRows[0].estado !== 'pendiente') {
      req.session.error = 'Solo puedes editar reservas que aún están pendientes de triaje.';
      return res.redirect('/paciente/mis-citas');
    }

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
      title: 'Editando reserva cita',
      layout: 'layouts/dashboard',
      medicos,
      especialidades,
      sintomasFrecuentes: SINTOMAS_FRECUENTES,
      modoEdicion: true,
      cita: citaRows[0],
      actionUrl: `/paciente/mis-citas/${id_cita}/editar`
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar la reserva seleccionada.';
    return res.redirect('/paciente/mis-citas');
  }
};

exports.updateCita = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const { id_medico, fecha, hora, motivo, sintomas, sintomas_otro } = req.body;
    const sintomasNormalizados = normalizarSintomas(sintomas, sintomas_otro);

    if (!id_medico || !fecha || !hora || !motivo) {
      req.session.error = 'Completa todos los datos para actualizar la reserva.';
      return res.redirect(`/paciente/mis-citas/${id_cita}/editar`);
    }

    if (!textoClinicoValido(motivo, true)) {
      req.session.error = 'Ingresa un motivo válido con al menos 5 caracteres.';
      return res.redirect(`/paciente/mis-citas/${id_cita}/editar`);
    }

    if (incluyeSintomaOtro(sintomas) && !textoClinicoValido(sintomas_otro, true)) {
      req.session.error = 'Describe el otro síntoma con al menos 5 caracteres.';
      return res.redirect(`/paciente/mis-citas/${id_cita}/editar`);
    }

    if (!esFechaValida(fecha)) {
      req.session.error = 'La fecha seleccionada no es válida. Debe ser de lunes a viernes y no puede ser pasada.';
      return res.redirect(`/paciente/mis-citas/${id_cita}/editar`);
    }

    if (!HORAS_ATENCION.includes(hora)) {
      req.session.error = 'La hora seleccionada no está dentro del horario de atención.';
      return res.redirect(`/paciente/mis-citas/${id_cita}/editar`);
    }

    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const [citaRows] = await db.query(
      `
      SELECT id_cita, estado
      FROM cita
      WHERE id_cita = ?
      AND id_paciente = ?
      LIMIT 1
      `,
      [id_cita, paciente.id_paciente]
    );

    if (citaRows.length === 0) {
      req.session.error = 'La cita seleccionada no existe o no te pertenece.';
      return res.redirect('/paciente/mis-citas');
    }

    if (citaRows[0].estado !== 'pendiente') {
      req.session.error = 'Solo puedes editar reservas pendientes de triaje.';
      return res.redirect('/paciente/mis-citas');
    }

    if (!(await existeMedicoActivo(id_medico))) {
      req.session.error = 'El médico seleccionado no está disponible.';
      return res.redirect(`/paciente/mis-citas/${id_cita}/editar`);
    }

    const [ocupada] = await db.query(
      `
      SELECT id_cita
      FROM cita
      WHERE id_medico = ?
      AND fecha = ?
      AND hora = ?
      AND id_cita <> ?
      LIMIT 1
      `,
      [id_medico, fecha, hora, id_cita]
    );

    if (ocupada.length > 0) {
      req.session.error = 'La hora seleccionada ya fue reservada. Elige otra hora.';
      return res.redirect(`/paciente/mis-citas/${id_cita}/editar`);
    }

    await db.query(
      `
      UPDATE cita
      SET id_medico = ?,
          fecha = ?,
          hora = ?,
          sintomas = ?,
          motivo = ?
      WHERE id_cita = ?
      AND id_paciente = ?
      AND estado = 'pendiente'
      `,
      [id_medico, fecha, hora, sintomasNormalizados, motivo, id_cita, paciente.id_paciente]
    );

    req.session.success = 'Reserva actualizada correctamente.';
    return res.redirect('/paciente/mis-citas');
  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      req.session.error = 'La hora seleccionada ya fue reservada. Elige otra hora.';
      return res.redirect(`/paciente/mis-citas/${req.params.id_cita}/editar`);
    }

    req.session.error = 'Ocurrió un error al actualizar la reserva.';
    return res.redirect(`/paciente/mis-citas/${req.params.id_cita}/editar`);
  }
};

exports.misCitas = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const { q, fecha } = req.query;

    const conditions = ['c.id_paciente = ?', "c.estado <> 'completada'"];
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
        c.sintomas,
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
      ORDER BY
        CASE
          WHEN c.estado = 'pendiente' THEN 0
          WHEN c.estado IN ('triaje_registrado', 'en_consulta') THEN 1
          WHEN c.estado = 'cancelada' THEN 2
          ELSE 3
        END ASC,
        c.fecha DESC,
        c.hora DESC
      `,
      params
    );

    res.render('paciente/mis-citas', {
      title: 'Mis citas',
      layout: 'layouts/dashboard',
      citas,
      filters: {
        q: q || '',
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

exports.resumenCita = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
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
        c.fecha_creacion,

        m.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,
        per_medico.apellido_materno AS medico_apellido_materno,

        t.id_triaje,
        t.temperatura,
        t.presion_arterial,
        t.frecuencia_cardiaca,
        t.saturacion,
        t.sintomas AS sintomas_triaje,
        t.observaciones AS triaje_observaciones,
        t.fecha_registro AS triaje_fecha_registro
      FROM cita c
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona per_medico ON m.id_persona = per_medico.id_persona
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.id_cita = ?
      AND c.id_paciente = ?
      AND c.estado <> 'completada'
      LIMIT 1
      `,
      [id_cita, paciente.id_paciente]
    );

    if (rows.length === 0) {
      req.session.error = 'La cita seleccionada no existe o ya se encuentra en historial.';
      return res.redirect('/paciente/mis-citas');
    }

    return res.render('paciente/resumen-cita', {
      title: 'Resumen de cita',
      layout: 'layouts/dashboard',
      cita: rows[0]
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el resumen de la cita.';
    return res.redirect('/paciente/mis-citas');
  }
};

exports.showAntecedentes = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const [rows] = await db.query(
      `
      SELECT
        alergias,
        enfermedades_previas,
        medicacion_actual,
        cirugias,
        antecedentes_familiares,
        observaciones,
        fecha_actualizacion
      FROM antecedente
      WHERE id_paciente = ?
      LIMIT 1
      `,
      [paciente.id_paciente]
    );

    res.render('paciente/antecedentes', {
      title: 'Mis antecedentes médicos',
      layout: 'layouts/dashboard',
      antecedentes: rows[0] || {}
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar tus antecedentes médicos.';
    return res.redirect('/paciente/dashboard');
  }
};

exports.updateAntecedentes = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const estadosPermitidos = ['no', 'si', 'no_sabe'];
    const estados = [
      req.body.alergias_estado,
      req.body.enfermedades_estado,
      req.body.medicacion_estado,
      req.body.cirugias_estado,
      req.body.familiares_estado
    ];

    if (estados.some(estado => !estadosPermitidos.includes(estado))) {
      req.session.error = 'Selecciona una opción válida en cada sección de antecedentes.';
      return res.redirect('/paciente/antecedentes');
    }

    const detalles = [
      req.body.alergias_detalle,
      req.body.enfermedades_detalle,
      req.body.medicamento_nombre,
      req.body.medicamento_dosis,
      req.body.medicamento_frecuencia,
      req.body.medicamento_motivo,
      req.body.medicamento_desde,
      req.body.medicacion_detalle,
      req.body.cirugia_tipo,
      req.body.cirugia_observaciones,
      req.body.familiares_detalle,
      req.body.observaciones
    ];

    if (detalles.some(campo => !detalleValido(campo))) {
      req.session.error = 'Usa texto clínico válido y evita respuestas ambiguas como letras repetidas.';
      return res.redirect('/paciente/antecedentes');
    }

    if (req.body.cirugia_anio) {
      const anioCirugia = Number(String(req.body.cirugia_anio).trim());
      const anioActual = new Date().getFullYear();

      if (!Number.isInteger(anioCirugia) || anioCirugia < 1900 || anioCirugia > anioActual) {
        req.session.error = 'Ingresa un año de cirugía válido entre 1900 y el año actual.';
        return res.redirect('/paciente/antecedentes');
      }
    }

    if (req.body.cirugias_estado === 'si' && req.body.cirugia_anio && !req.body.cirugia_tipo) {
      req.session.error = 'Indica el tipo de cirugía cuando registres un año aproximado.';
      return res.redirect('/paciente/antecedentes');
    }

    const [antecedenteActualRows] = await db.query(
      `
      SELECT
        alergias,
        enfermedades_previas,
        medicacion_actual,
        cirugias,
        antecedentes_familiares
      FROM antecedente
      WHERE id_paciente = ?
      LIMIT 1
      `,
      [paciente.id_paciente]
    );
    const antecedenteActual = antecedenteActualRows[0] || {};

    let alergias = construirAntecedente({
      estado: req.body.alergias_estado,
      opciones: req.body.alergias_tipos,
      detalle: req.body.alergias_detalle,
      etiquetaNo: 'No refiere alergias conocidas.',
      etiquetaNoSabe: 'No sabe o no recuerda alergias conocidas.',
      etiquetaSi: 'Alergias referidas'
    });

    let enfermedades_previas = construirAntecedente({
      estado: req.body.enfermedades_estado,
      opciones: req.body.enfermedades_tipos,
      detalle: req.body.enfermedades_detalle,
      etiquetaNo: 'No refiere enfermedades previas.',
      etiquetaNoSabe: 'No sabe o no recuerda enfermedades previas.',
      etiquetaSi: 'Enfermedades previas referidas'
    });

    let medicacion_actual = construirMedicacion(req.body);

    let cirugias = construirAntecedente({
      estado: req.body.cirugias_estado,
      opciones: req.body.cirugia_tipo,
      detalle: [
        req.body.cirugia_anio ? `Año aproximado: ${req.body.cirugia_anio}` : '',
        req.body.cirugia_observaciones ? `Observaciones: ${req.body.cirugia_observaciones}` : ''
      ].filter(Boolean).join('. '),
      etiquetaNo: 'No refiere cirugias previas.',
      etiquetaNoSabe: 'No recuerda cirugias previas.',
      etiquetaSi: 'Cirugias referidas'
    });

    let antecedentes_familiares = construirAntecedente({
      estado: req.body.familiares_estado,
      opciones: [
        unirOpciones(req.body.familiares_tipos),
        unirOpciones(req.body.familiares_parentesco)
      ].filter(Boolean),
      detalle: req.body.familiares_detalle,
      etiquetaNo: 'No refiere antecedentes familiares relevantes.',
      etiquetaNoSabe: 'No sabe o no recuerda antecedentes familiares relevantes.',
      etiquetaSi: 'Antecedentes familiares referidos'
    });

    if (req.body.alergias_estado === 'si' && !alergias) alergias = antecedenteActual.alergias || null;
    if (req.body.enfermedades_estado === 'si' && !enfermedades_previas) enfermedades_previas = antecedenteActual.enfermedades_previas || null;
    if (req.body.medicacion_estado === 'si' && !medicacion_actual) medicacion_actual = antecedenteActual.medicacion_actual || null;
    if (req.body.cirugias_estado === 'si' && !cirugias) cirugias = antecedenteActual.cirugias || null;
    if (req.body.familiares_estado === 'si' && !antecedentes_familiares) antecedentes_familiares = antecedenteActual.antecedentes_familiares || null;

    const observaciones = (req.body.observaciones || '').trim() || null;

    if (
      (req.body.alergias_estado === 'si' && !alergias)
      || (req.body.enfermedades_estado === 'si' && !enfermedades_previas)
      || (req.body.medicacion_estado === 'si' && !medicacion_actual)
      || (req.body.cirugias_estado === 'si' && !cirugias)
      || (req.body.familiares_estado === 'si' && !antecedentes_familiares)
    ) {
      req.session.error = 'Completa el detalle o selecciona al menos una opción cuando marques que sí tienes antecedentes.';
      return res.redirect('/paciente/antecedentes');
    }

    await db.query(
      `
      INSERT INTO antecedente (
        id_paciente,
        alergias,
        enfermedades_previas,
        medicacion_actual,
        cirugias,
        antecedentes_familiares,
        observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        alergias = VALUES(alergias),
        enfermedades_previas = VALUES(enfermedades_previas),
        medicacion_actual = VALUES(medicacion_actual),
        cirugias = VALUES(cirugias),
        antecedentes_familiares = VALUES(antecedentes_familiares),
        observaciones = VALUES(observaciones)
      `,
      [
        paciente.id_paciente,
        alergias || null,
        enfermedades_previas || null,
        medicacion_actual || null,
        cirugias || null,
        antecedentes_familiares || null,
        observaciones || null
      ]
    );

    req.session.success = 'Antecedentes médicos actualizados correctamente.';
    return res.redirect('/paciente/antecedentes');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron actualizar tus antecedentes médicos.';
    return res.redirect('/paciente/antecedentes');
  }
};


exports.historial = async (req, res) => {
  try {
    const paciente = await obtenerPacientePorPersona(req.session.user.id_persona);

    if (!paciente) {
      req.session.error = 'No se encontró el perfil del paciente.';
      return res.redirect('/paciente/dashboard');
    }

    const { q, desde, hasta } = req.query;

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

    if (desde && desde !== '') {
      conditions.push('c.fecha >= ?');
      params.push(desde);
    }

    if (hasta && hasta !== '') {
      conditions.push('c.fecha <= ?');
      params.push(hasta);
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
        desde: desde || '',
        hasta: hasta || ''
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
