(function () {
  'use strict';

  const CONTAINER_SELECTOR = [
    '.clinical-panel',
    '.triaje-summary',
    '.consulta-detail-section',
    '.summary-box'
  ].join(',');

  const ITEM_SELECTOR = [
    '.patient-summary > div:not(.clinical-note-list)',
    '.triaje-summary-grid > div',
    '.consulta-detail-grid > div',
    '.clinical-note-item',
    '.summary-row'
  ].join(',');

  const headingRules = [
    [['antecedente'], 'bi-journal-medical', 'primary'],
    [['triaje'], 'bi-activity', 'warning'],
    [['consulta'], 'bi-clipboard2-pulse', 'clinical'],
    [['atencion'], 'bi-stethoscope', 'clinical'],
    [['cita'], 'bi-calendar-check', 'primary'],
    [['paciente', 'resumen'], 'bi-person-vcard', 'primary'],
    [['usuario'], 'bi-person-gear', 'primary'],
    [['datos'], 'bi-card-checklist', 'neutral'],
    [['historial'], 'bi-clock-history', 'primary']
  ];

  const fieldIconsByLabel = {
    paciente: ['bi-person', 'primary'],
    usuario: ['bi-person', 'primary'],
    nombre: ['bi-person', 'primary'],
    dni: ['bi-card-text', 'primary'],
    documento: ['bi-card-text', 'primary'],
    edad: ['bi-hourglass-split', 'neutral'],
    sexo: ['bi-gender-ambiguous', 'neutral'],
    correo: ['bi-envelope', 'neutral'],
    telefono: ['bi-telephone', 'neutral'],
    direccion: ['bi-geo-alt', 'neutral'],
    fecha: ['bi-calendar3', 'primary'],
    hora: ['bi-clock', 'primary'],
    'fecha y hora': ['bi-calendar-event', 'primary'],
    'fecha de registro': ['bi-calendar3', 'primary'],
    'fecha de triaje': ['bi-calendar3', 'primary'],
    registro: ['bi-journal-check', 'neutral'],
    estado: ['bi-check2-circle', 'success'],
    'estado de registro': ['bi-check2-circle', 'success'],
    medico: ['bi-stethoscope', 'clinical'],
    doctor: ['bi-stethoscope', 'clinical'],
    especialidad: ['bi-hospital', 'clinical'],
    motivo: ['bi-chat-left-text', 'neutral'],
    'motivo de consulta': ['bi-chat-left-text', 'neutral'],
    sintomas: ['bi-heart-pulse', 'clinical'],
    'sintomas declarados': ['bi-heart-pulse', 'clinical'],
    'sintomas declarados por el paciente': ['bi-heart-pulse', 'clinical'],
    'sintomas iniciales declarados por el paciente': ['bi-heart-pulse', 'clinical'],
    'sintomas verificados': ['bi-heart-pulse', 'clinical'],
    'sintomas verificados por enfermeria (principal para atencion)': ['bi-heart-pulse', 'clinical'],
    alergias: ['bi-shield-exclamation', 'danger'],
    'enfermedades previas': ['bi-heart-pulse', 'clinical'],
    'medicacion actual': ['bi-capsule', 'clinical'],
    medicacion: ['bi-capsule', 'clinical'],
    cirugias: ['bi-bandaid', 'clinical'],
    'antecedentes familiares': ['bi-people', 'neutral'],
    observaciones: ['bi-chat-left-text', 'neutral'],
    'observaciones de enfermeria': ['bi-chat-left-text', 'neutral'],
    'observaciones medicas': ['bi-chat-left-text', 'neutral'],
    temperatura: ['bi-thermometer-half', 'warning'],
    'presion arterial': ['bi-activity', 'warning'],
    'frecuencia cardiaca': ['bi-heart-pulse', 'clinical'],
    'saturacion o2': ['bi-lungs', 'clinical'],
    diagnostico: ['bi-clipboard2-pulse', 'clinical'],
    tratamiento: ['bi-capsule-pill', 'clinical'],
    recomendaciones: ['bi-clipboard-check', 'success']
  };

  const fallbackFieldRules = [
    [['paciente', 'usuario', 'nombre'], 'bi-person', 'primary'],
    [['dni', 'documento'], 'bi-card-text', 'primary'],
    [['edad', 'sexo', 'correo', 'telefono', 'direccion'], 'bi-info-circle', 'neutral'],
    [['fecha', 'hora', 'registro'], 'bi-calendar3', 'primary'],
    [['estado'], 'bi-check2-circle', 'success'],
    [['medico', 'doctor', 'especialidad'], 'bi-stethoscope', 'clinical'],
    [['motivo', 'observacion'], 'bi-chat-left-text', 'neutral'],
    [['sintoma', 'enfermedad', 'frecuencia'], 'bi-heart-pulse', 'clinical'],
    [['alergia'], 'bi-shield-exclamation', 'danger'],
    [['medicacion', 'medicamento'], 'bi-capsule', 'clinical'],
    [['cirugia'], 'bi-bandaid', 'clinical'],
    [['familiar'], 'bi-people', 'neutral'],
    [['temperatura', 'presion'], 'bi-activity', 'warning'],
    [['saturacion', 'o2'], 'bi-lungs', 'clinical'],
    [['diagnostico'], 'bi-clipboard2-pulse', 'clinical'],
    [['tratamiento'], 'bi-capsule-pill', 'clinical'],
    [['recomendacion'], 'bi-clipboard-check', 'success']
  ];

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function matchRule(value, rules, fallback) {
    const text = normalize(value);
    const rule = rules.find(([keywords]) => keywords.some(keyword => text.includes(normalize(keyword))));
    return rule ? { icon: rule[1], tone: rule[2] || 'primary' } : fallback;
  }

  function getFieldIcon(label) {
    const exact = fieldIconsByLabel[normalize(label)];
    if (exact) return { icon: exact[0], tone: exact[1] };
    return matchRule(label, fallbackFieldRules, { icon: 'bi-info-circle', tone: 'neutral' });
  }

  function createIcon(iconData) {
    const icon = document.createElement('i');
    icon.className = `bi ${iconData.icon} clinical-info-icon`;
    icon.dataset.clinicalTone = iconData.tone || 'primary';
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  }

  function decorateHeading(heading) {
    if (!heading || heading.querySelector('.bi')) return;
    const iconData = matchRule(heading.textContent, headingRules, { icon: 'bi-info-circle', tone: 'primary' });
    heading.insertBefore(createIcon(iconData), heading.firstChild);
  }

  function getItemLabel(item) {
    const label = item.querySelector('span');
    if (label) return label.textContent;
    const text = item.textContent || '';
    return text.split(':')[0] || text;
  }

  function decorateItem(item) {
    if (!item || item.querySelector(':scope > .clinical-info-icon')) return;
    if (!item.querySelector('span') || !item.querySelector('strong')) return;

    item.classList.add('clinical-info-item');
    item.insertBefore(createIcon(getFieldIcon(getItemLabel(item))), item.firstChild);
  }

  function decorateClinicalInfo(root = document) {
    root.querySelectorAll(CONTAINER_SELECTOR).forEach(container => {
    if (container.matches('.consulta-detail-section')) {
      if (!container.querySelector('.consulta-detail-grid')) return;
      container.classList.add('clinical-detail-panelized');
    }

    container.querySelectorAll(':scope > h3').forEach(decorateHeading);
    container.querySelectorAll(ITEM_SELECTOR).forEach(item => {
      if (container.contains(item)) decorateItem(item);
    });

    if (container.matches('.patient-summary') && container.querySelector(':scope > .clinical-info-item')) {
      container.classList.add('clinical-two-column');
    }
    });
  }

  decorateClinicalInfo();

  const observer = new MutationObserver(mutations => {
    const shouldDecorate = mutations.some(mutation => (
      Array.from(mutation.addedNodes).some(node => (
        node.nodeType === Node.ELEMENT_NODE
        && (
          node.matches?.(CONTAINER_SELECTOR)
          || node.querySelector?.(CONTAINER_SELECTOR)
          || node.matches?.(ITEM_SELECTOR)
          || node.querySelector?.(ITEM_SELECTOR)
        )
      ))
    ));

    if (shouldDecorate) decorateClinicalInfo();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}());
