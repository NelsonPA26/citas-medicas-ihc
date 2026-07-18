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

const SINTOMAS_TRIAJE = [
  'Fiebre',
  'Malestar general',
  'Cansancio',
  'Dolor muscular',
  'Tos',
  'Dolor de garganta',
  'Congestión nasal',
  'Dificultad respiratoria',
  'Dolor abdominal',
  'Náuseas',
  'Vómitos',
  'Diarrea',
  'Dolor de cabeza',
  'Mareos',
  'Ansiedad',
  'Otro'
];

function normalizarSintomasTriaje(sintomas, sintomasOtro = '') {
  if (!sintomas) return '';

  const seleccionados = Array.isArray(sintomas) ? sintomas : [sintomas];
  const validos = seleccionados
    .filter(sintoma => SINTOMAS_TRIAJE.includes(sintoma) && sintoma !== 'Otro')
    .slice(0, 10);

  if (seleccionados.includes('Otro')) {
    const detalle = (sintomasOtro || '').trim().replace(/,/g, ';');
    if (textoTriajeValido(detalle, true, 120)) {
      validos.push(`Otro: ${detalle}`);
    }
  }

  return validos.join(', ');
}

function incluyeSintomaOtroTriaje(sintomas) {
  const seleccionados = Array.isArray(sintomas) ? sintomas : [sintomas].filter(Boolean);
  return seleccionados.includes('Otro');
}

function textoTriajeValido(value, required = false, maxLength = 800) {
  const texto = String(value || '').trim();
  if (!texto) return !required;

  return texto.length >= 5
    && texto.length <= maxLength
    && /^[\p{L}0-9 .,;:()/-]+$/u.test(texto);
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

function presionValida(value) {
  const match = String(value || '').trim().match(/^(\d{2,3})\/(\d{2,3})$/);
  if (!match) return false;

  const sistolica = Number(match[1]);
  const diastolica = Number(match[2]);

  return sistolica >= 50
    && sistolica <= 260
    && diastolica >= 30
    && diastolica <= 150;
}

function temperaturaValida(value) {
  const text = String(value || '').trim();
  if (!/^\d{2}(\.\d)?$/.test(text)) return false;

  const temperatura = Number(text);
  return Number.isFinite(temperatura)
    && temperatura >= 35
    && temperatura <= 43;
}

function enteroVitalValido(value, min, max) {
  const text = String(value || '').trim();
  if (!/^\d{1,3}$/.test(text)) return false;

  const numero = Number(text);
  return Number.isInteger(numero)
    && numero >= min
    && numero <= max;
}

exports.dashboard = async (req, res) => {
  try {
    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró tu perfil de enfermería. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/login');
    }

    const [[stats]] = await db.query(
      `
      SELECT
        (SELECT COUNT(*) FROM cita WHERE estado = 'pendiente') AS triajes_pendientes,
        (
          SELECT COUNT(*)
          FROM triaje t
          INNER JOIN cita c ON t.id_cita = c.id_cita
          WHERE t.id_enfermera = ?
            AND c.estado IN ('triaje_registrado', 'en_consulta')
        ) AS triajes_realizados,
        (
          SELECT COUNT(*)
          FROM triaje t
          INNER JOIN cita c ON t.id_cita = c.id_cita
          WHERE t.id_enfermera = ?
            AND c.estado IN ('triaje_registrado', 'en_consulta')
            AND DATE(t.fecha_registro) = CURDATE()
        ) AS triajes_hoy,
        (
          SELECT COUNT(*)
          FROM triaje t
          INNER JOIN cita c ON t.id_cita = c.id_cita
          WHERE t.id_enfermera = ?
            AND c.estado = 'triaje_registrado'
        ) AS citas_con_triaje
      `,
      [enfermera.id_enfermera, enfermera.id_enfermera, enfermera.id_enfermera]
    );

    const [proximasCitas] = await db.query(
      `
      SELECT
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
        c.motivo,
        p.nombres AS paciente_nombres,
        p.apellido_paterno AS paciente_apellido_paterno,
        p.dni AS paciente_dni,
        pm.nombres AS medico_nombres,
        pm.apellido_paterno AS medico_apellido_paterno,
        m.especialidad
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona p ON pac.id_persona = p.id_persona
      INNER JOIN medico m ON c.id_medico = m.id_medico
      INNER JOIN persona pm ON m.id_persona = pm.id_persona
      WHERE c.estado = 'pendiente'
      ORDER BY
        CASE WHEN c.fecha >= CURDATE() THEN 0 ELSE 1 END,
        c.fecha ASC,
        c.hora ASC
      LIMIT 4
      `
    );

    res.render('enfermera/dashboard', {
      title: 'Panel de Enfermería',
      layout: 'layouts/dashboard',
      stats,
      proximasCitas
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el panel de enfermería. Actualiza la página o vuelve a iniciar sesión si continúa el problema.';
    return res.redirect('/login');
  }
};

exports.ayuda = (req, res) => {
  const returnUrl = typeof req.query.returnTo === 'string'
    && (req.query.returnTo === '/perfil' || req.query.returnTo.startsWith('/enfermera/'))
    ? req.query.returnTo
    : '/enfermera/dashboard';

  res.render('enfermera/ayuda', {
    title: 'Ayuda de enfermería',
    layout: 'layouts/dashboard',
    returnUrl
  });
};

exports.triajePendiente = async (req, res) => {
  try {
    const filters = {
      q: limpiarFiltroTexto(req.query.q, 100),
      fecha: fechaFiltroValida(req.query.fecha) ? req.query.fecha : ''
    };

    const where = [
      "c.estado = 'pendiente'",
      't.id_triaje IS NULL'
    ];
    const params = [];

    if (filters.q) {
      const search = `%${filters.q}%`;
      where.push(`(
        CONCAT_WS(' ', per_paciente.nombres, per_paciente.apellido_paterno, per_paciente.apellido_materno) LIKE ?
        OR per_paciente.dni LIKE ?
        OR CONCAT_WS(' ', per_medico.nombres, per_medico.apellido_paterno) LIKE ?
        OR med.especialidad LIKE ?
        OR c.motivo LIKE ?
      )`);
      params.push(search, search, search, search, search);
    }

    if (filters.fecha) {
      where.push('c.fecha = ?');
      params.push(filters.fecha);
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

        pac.id_paciente,
        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,

        med.id_medico,
        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,

        ant.alergias,
        ant.enfermedades_previas,
        ant.medicacion_actual,
        ant.cirugias,
        ant.antecedentes_familiares,
        ant.observaciones AS antecedentes_observaciones
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE ${where.join(' AND ')}
      ORDER BY c.fecha ASC, c.hora ASC
      `,
      params
    );

    res.render('enfermera/triaje-pendiente', {
      title: 'Triaje pendiente',
      layout: 'layouts/dashboard',
      citas,
      filters,
      hasActiveFilters: Boolean(filters.q || filters.fecha)
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar las citas pendientes de triaje. Actualiza la página o intenta nuevamente en unos segundos.';
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
        c.sintomas AS sintomas_paciente,
        c.estado,

        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,
        per_paciente.sexo AS paciente_sexo,

        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,

        ant.alergias,
        ant.enfermedades_previas,
        ant.medicacion_actual,
        ant.cirugias,
        ant.antecedentes_familiares,
        ant.observaciones AS antecedentes_observaciones
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      LEFT JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.id_cita = ?
      AND c.estado = 'pendiente'
      AND t.id_triaje IS NULL
      LIMIT 1
      `,
      [id_cita]
    );

    if (rows.length === 0) {
      req.session.error = 'La cita no está disponible para registrar triaje. Puede estar cancelada, ya atendida o con triaje registrado.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    const backUrl = req.query.returnTo === 'dashboard' ? '/enfermera/dashboard' : '/enfermera/triaje-pendiente';

    res.render('enfermera/registrar-triaje', {
      title: 'Registrar triaje',
      layout: 'layouts/dashboard',
      cita: rows[0],
      triaje: {},
      modoEdicion: false,
      sintomasTriaje: SINTOMAS_TRIAJE,
      actionUrl: `/enfermera/triaje/${id_cita}/registrar`,
      backUrl
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el formulario de triaje. Vuelve a Triaje pendiente e inténtalo nuevamente.';
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
      sintomas_otro,
      observaciones
    } = req.body;
    const sintomasNormalizados = normalizarSintomasTriaje(sintomas, sintomas_otro);
    const observacionesNormalizadas = String(observaciones || '').trim() || null;

    if (incluyeSintomaOtroTriaje(sintomas) && !textoTriajeValido(sintomas_otro, true, 120)) {
      req.session.error = 'Describe el otro síntoma verificado con al menos 5 caracteres.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (!temperatura || !presion_arterial || !frecuencia_cardiaca || !saturacion || !sintomasNormalizados) {
      req.session.error = 'Completa los campos obligatorios del triaje.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (!textoTriajeValido(observacionesNormalizadas, false, 800)) {
      req.session.error = 'Las observaciones deben tener entre 5 y 800 caracteres válidos.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (!temperaturaValida(temperatura)) {
      req.session.error = 'La temperatura ingresada no parece válida.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (!enteroVitalValido(frecuencia_cardiaca, 30, 220)) {
      req.session.error = 'La frecuencia cardiaca ingresada no parece válida.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (!presionValida(presion_arterial)) {
      req.session.error = 'La presión arterial debe tener formato 120/80.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    if (!enteroVitalValido(saturacion, 50, 100)) {
      req.session.error = 'La saturación debe estar entre 50 y 100.';
      return res.redirect(`/enfermera/triaje/${id_cita}/registrar`);
    }

    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró tu perfil de enfermería. Vuelve a iniciar sesión o solicita apoyo a administración.';
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
      req.session.error = 'La cita seleccionada no existe o ya fue modificada. Actualiza la lista e inténtalo nuevamente.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    if (citaRows[0].estado !== 'pendiente') {
      await connection.rollback();
      req.session.error = 'Esta cita ya no está pendiente de triaje. Actualiza la lista antes de continuar.';
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
      req.session.error = 'Esta cita ya tiene triaje registrado. Actualiza la lista para ver su estado actual.';
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
        sintomasNormalizados,
        observacionesNormalizadas
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
      req.session.error = 'Esta cita ya tiene triaje registrado. Actualiza la lista para ver su estado actual.';
      return res.redirect('/enfermera/triaje-pendiente');
    }

    req.session.error = 'No se pudo registrar el triaje. Revisa los signos vitales y síntomas antes de intentarlo nuevamente.';
    return res.redirect('/enfermera/triaje-pendiente');
  } finally {
    connection.release();
  }
};

exports.showEditarTriaje = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró tu perfil de enfermería. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/enfermera/dashboard');
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

        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,
        per_paciente.sexo AS paciente_sexo,

        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,
        per_medico.apellido_materno AS medico_apellido_materno,

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
        t.sintomas,
        t.observaciones
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      INNER JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.id_cita = ?
      AND t.id_enfermera = ?
      AND c.estado = 'triaje_registrado'
      LIMIT 1
      `,
      [id_cita, enfermera.id_enfermera]
    );

    if (rows.length === 0) {
      req.session.error = 'Solo puedes editar triajes que aún no pasaron a consulta médica.';
      return res.redirect('/enfermera/triajes');
    }

    res.render('enfermera/registrar-triaje', {
      title: 'Editar triaje',
      layout: 'layouts/dashboard',
      cita: rows[0],
      triaje: rows[0],
      modoEdicion: true,
      sintomasTriaje: SINTOMAS_TRIAJE,
      actionUrl: `/enfermera/triajes/${id_cita}/editar`
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el triaje seleccionado. Vuelve a Triajes activos e inténtalo nuevamente.';
    return res.redirect('/enfermera/triajes');
  }
};

exports.showDetalleTriaje = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const backUrl = req.query.returnTo === 'historial'
      ? '/enfermera/historial-triajes'
      : '/enfermera/triajes';
    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró tu perfil de enfermería. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/enfermera/dashboard');
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

        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,
        per_paciente.sexo AS paciente_sexo,

        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,
        per_medico.apellido_materno AS medico_apellido_materno,

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
        t.sintomas,
        t.observaciones
      FROM cita c
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      INNER JOIN triaje t ON c.id_cita = t.id_cita
      WHERE c.id_cita = ?
      AND t.id_enfermera = ?
      LIMIT 1
      `,
      [id_cita, enfermera.id_enfermera]
    );

    if (rows.length === 0) {
      req.session.error = 'No se encontro el triaje seleccionado.';
      return res.redirect('/enfermera/triajes');
    }

    return res.render('enfermera/registrar-triaje', {
      title: 'Detalle de triaje',
      layout: 'layouts/dashboard',
      cita: rows[0],
      triaje: rows[0],
      modoEdicion: false,
      modoDetalle: true,
      sintomasTriaje: SINTOMAS_TRIAJE,
      actionUrl: '#',
      backUrl
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el detalle del triaje. Vuelve a la lista e inténtalo nuevamente.';
    return res.redirect('/enfermera/triajes');
  }
};

exports.updateTriaje = async (req, res) => {
  try {
    const { id_cita } = req.params;
    const {
      temperatura,
      presion_arterial,
      frecuencia_cardiaca,
      saturacion,
      sintomas,
      sintomas_otro,
      observaciones
    } = req.body;
    const sintomasNormalizados = normalizarSintomasTriaje(sintomas, sintomas_otro);
    const observacionesNormalizadas = String(observaciones || '').trim() || null;

    if (incluyeSintomaOtroTriaje(sintomas) && !textoTriajeValido(sintomas_otro, true, 120)) {
      req.session.error = 'Describe el otro síntoma verificado con al menos 5 caracteres.';
      return res.redirect(`/enfermera/triajes/${id_cita}/editar`);
    }

    if (!temperatura || !presion_arterial || !frecuencia_cardiaca || !saturacion || !sintomasNormalizados) {
      req.session.error = 'Completa los campos obligatorios del triaje.';
      return res.redirect(`/enfermera/triajes/${id_cita}/editar`);
    }

    if (!textoTriajeValido(observacionesNormalizadas, false, 800)) {
      req.session.error = 'Las observaciones deben tener entre 5 y 800 caracteres válidos.';
      return res.redirect(`/enfermera/triajes/${id_cita}/editar`);
    }

    if (
      !temperaturaValida(temperatura)
      || !enteroVitalValido(frecuencia_cardiaca, 30, 220)
      || !enteroVitalValido(saturacion, 50, 100)
      || !presionValida(presion_arterial)
    ) {
      req.session.error = 'Revisa los rangos ingresados en los signos vitales.';
      return res.redirect(`/enfermera/triajes/${id_cita}/editar`);
    }

    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró tu perfil de enfermería. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/enfermera/dashboard');
    }

    const [result] = await db.query(
      `
      UPDATE triaje t
      INNER JOIN cita c ON t.id_cita = c.id_cita
      SET
        t.temperatura = ?,
        t.presion_arterial = ?,
        t.frecuencia_cardiaca = ?,
        t.saturacion = ?,
        t.sintomas = ?,
        t.observaciones = ?
      WHERE t.id_cita = ?
      AND t.id_enfermera = ?
      AND c.estado = 'triaje_registrado'
      `,
      [
        temperatura,
        presion_arterial,
        frecuencia_cardiaca,
        saturacion,
        sintomasNormalizados,
        observacionesNormalizadas,
        id_cita,
        enfermera.id_enfermera
      ]
    );

    if (result.affectedRows === 0) {
      req.session.error = 'No se pudo editar el triaje porque la cita ya pasó a consulta médica o no pertenece a tu atención. Actualiza la lista antes de continuar.';
      return res.redirect('/enfermera/triajes');
    }

    req.session.success = 'Triaje actualizado correctamente.';
    return res.redirect('/enfermera/triajes');
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo actualizar el triaje. Revisa los signos vitales y observaciones antes de intentarlo nuevamente.';
    return res.redirect(`/enfermera/triajes/${req.params.id_cita}/editar`);
  }
};

exports.triajesRealizados = async (req, res) => {
  try {
    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró tu perfil de enfermería. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/enfermera/dashboard');
    }

    const { q, desde, hasta, estado } = req.query;

    const conditions = ['t.id_enfermera = ?'];
    const params = [enfermera.id_enfermera];
    const estadosPermitidos = ['triaje_registrado', 'en_consulta'];

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

    if (desde && desde !== '') {
      conditions.push('DATE(t.fecha_registro) >= ?');
      params.push(desde);
    }

    if (hasta && hasta !== '') {
      conditions.push('DATE(t.fecha_registro) <= ?');
      params.push(hasta);
    }

    if (estado && estadosPermitidos.includes(estado)) {
      conditions.push('c.estado = ?');
      params.push(estado);
    } else {
      conditions.push("c.estado IN ('triaje_registrado', 'en_consulta')");
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
        c.sintomas AS sintomas_paciente,
        c.estado,

        per_paciente.nombres AS paciente_nombres,
        per_paciente.apellido_paterno AS paciente_apellido_paterno,
        per_paciente.apellido_materno AS paciente_apellido_materno,
        per_paciente.dni AS paciente_dni,
        per_paciente.sexo AS paciente_sexo,
        TIMESTAMPDIFF(YEAR, per_paciente.fecha_nacimiento, CURDATE()) AS paciente_edad,

        med.especialidad,
        per_medico.nombres AS medico_nombres,
        per_medico.apellido_paterno AS medico_apellido_paterno,

        per_enfermera.nombres AS enfermera_nombres,
        per_enfermera.apellido_paterno AS enfermera_apellido_paterno,

        ant.alergias,
        ant.enfermedades_previas,
        ant.medicacion_actual,
        ant.cirugias,
        ant.antecedentes_familiares,
        ant.observaciones AS antecedentes_observaciones
      FROM triaje t
      INNER JOIN cita c ON t.id_cita = c.id_cita
      INNER JOIN paciente pac ON c.id_paciente = pac.id_paciente
      INNER JOIN persona per_paciente ON pac.id_persona = per_paciente.id_persona
      INNER JOIN medico med ON c.id_medico = med.id_medico
      INNER JOIN persona per_medico ON med.id_persona = per_medico.id_persona
      INNER JOIN enfermera enf ON t.id_enfermera = enf.id_enfermera
      INNER JOIN persona per_enfermera ON enf.id_persona = per_enfermera.id_persona
      LEFT JOIN antecedente ant ON pac.id_paciente = ant.id_paciente
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.fecha_registro DESC
      `,
      params
    );

    res.render('enfermera/triajes', {
      title: 'Triajes activos',
      layout: 'layouts/dashboard',
      triajes,
      filters: {
        q: q || '',
        desde: desde || '',
        hasta: hasta || '',
        estado: estado || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudieron cargar los triajes activos. Actualiza la página o intenta nuevamente en unos segundos.';
    return res.redirect('/enfermera/dashboard');
  }
};

exports.historialTriajes = async (req, res) => {
  try {
    const enfermera = await obtenerEnfermeraPorPersona(req.session.user.id_persona);

    if (!enfermera) {
      req.session.error = 'No se encontró tu perfil de enfermería. Vuelve a iniciar sesión o solicita apoyo a administración.';
      return res.redirect('/enfermera/dashboard');
    }

    const { q, desde, hasta } = req.query;
    const conditions = ['t.id_enfermera = ?', "c.estado IN ('completada', 'cancelada')"];
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

    if (desde && desde !== '') {
      conditions.push('DATE(t.fecha_registro) >= ?');
      params.push(desde);
    }

    if (hasta && hasta !== '') {
      conditions.push('DATE(t.fecha_registro) <= ?');
      params.push(hasta);
    }

    const [triajes] = await db.query(
      `
      SELECT
        t.id_triaje,
        t.fecha_registro,
        c.id_cita,
        c.fecha,
        TIME_FORMAT(c.hora, '%H:%i') AS hora,
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
      ORDER BY
        CASE WHEN c.estado = 'cancelada' THEN 1 ELSE 0 END ASC,
        c.fecha DESC,
        c.hora DESC
      `,
      params
    );

    return res.render('enfermera/historial-triajes', {
      title: 'Historial de triajes',
      layout: 'layouts/dashboard',
      triajes,
      filters: {
        q: q || '',
        desde: desde || '',
        hasta: hasta || ''
      }
    });
  } catch (error) {
    console.error(error);
    req.session.error = 'No se pudo cargar el historial de triajes. Actualiza la página o intenta nuevamente en unos segundos.';
    return res.redirect('/enfermera/dashboard');
  }
};
