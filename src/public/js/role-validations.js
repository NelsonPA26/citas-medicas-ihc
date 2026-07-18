window.RoleValidation = (() => {
  const TEXT_PATTERN = /^[\p{L}0-9 .,;:()\/\-\n]+$/u;
  const SEARCH_PATTERN = /^[\p{L}0-9 .,;:()\/-]+$/u;
  const ADDRESS_PATTERN = /^[\p{L}0-9 .,#;:()\/-]+$/u;
  const PERSONAL_NAME_PATTERN = /^[\p{L} ]+$/u;
  const SEARCH_INVALID_MIXED_TOKEN = /(?=\S*[\p{L}])(?=\S*\d)[\p{L}0-9]{4,}/u;

  function normalizeSpaces(value) {
    return value.replace(/\s{2,}/g, ' ');
  }

  function visibleNumericTokensFor(field) {
    const scope = field.closest('.module-card') || document;
    const rows = Array.from(scope.querySelectorAll('.data-table tbody tr'));

    return rows.flatMap(row => (row.textContent || '').match(/\b\d{6,9}\b/g) || []);
  }

  function visibleSearchEntriesFor(field) {
    const scope = field.closest('.module-card') || document;
    const rows = Array.from(scope.querySelectorAll('.data-table tbody tr'));

    return rows
      .map(row => normalizeSearchComparable(row.textContent || ''))
      .filter(Boolean);
  }

  function normalizeSearchComparable(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function numericSearchLooksPossible(value, field) {
    if (value.length > 8) return false;

    const tokens = visibleNumericTokensFor(field);
    if (tokens.length === 0) return true;

    return tokens.some(token => token.startsWith(value));
  }

  function textSearchLooksPossible(value, field) {
    const entries = visibleSearchEntriesFor(field);
    if (entries.length === 0) return true;

    const normalized = normalizeSearchComparable(value);
    const queryTokens = normalized.split(/\s+/).filter(Boolean);
    if (queryTokens.length === 0) return false;

    return entries.some(entry => {
      const entryTokens = entry.split(/\s+/);

      return entry.includes(normalized)
        || queryTokens.every(queryToken => entryTokens.some(entryToken => entryToken.startsWith(queryToken)));
    });
  }


  function keepPersonalName(value) {
    return normalizeSpaces(value.replace(/[^\p{L} ]/gu, ''));
  }

  function keepOneDecimal(value) {
    const clean = value.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : clean;
  }

  function hasPossibleNumberPrefix(prefix, min, max, maxDigits) {
    if (!prefix) return true;
    if (prefix.length > maxDigits) return false;

    const start = Number(prefix);
    if (Number.isNaN(start)) return false;

    for (let finalLength = prefix.length; finalLength <= maxDigits; finalLength += 1) {
      const remaining = finalLength - prefix.length;
      const lowest = start * (10 ** remaining);
      const highest = lowest + (10 ** remaining) - 1;

      if (highest >= min && lowest <= max) return true;
    }

    return false;
  }

  function constrainIntegerRange(value, min, max, maxDigits) {
    let digits = value.replace(/\D/g, '').slice(0, maxDigits);

    while (digits && !hasPossibleNumberPrefix(digits, min, max, maxDigits)) {
      digits = digits.slice(0, -1);
    }

    return digits;
  }

  function constrainTemperature(value) {
    const clean = keepOneDecimal(value).slice(0, 4);
    if (!clean) return '';
    if (!/^[34]/.test(clean)) return '';

    const hasDot = clean.includes('.');
    const [rawInteger = '', rawDecimal = ''] = clean.split('.');
    let integer = rawInteger.slice(0, 2);

    if (integer.length === 2) {
      const whole = Number(integer);
      if (whole < 35 || whole > 43) integer = integer.slice(0, 1);
    }

    if (!hasDot || integer.length < 2) return integer;

    let decimal = rawDecimal.replace(/\D/g, '').slice(0, 1);
    if (integer === '43' && decimal && decimal !== '0') decimal = '';

    return `${integer}.${decimal}`;
  }

  function constrainBloodPressure(value) {
    const clean = value.replace(/[^0-9/]/g, '').replace(/\/{2,}/g, '/');
    const [rawSystolic = '', ...rest] = clean.split('/');
    const hasSlash = clean.includes('/');
    const rawDiastolic = rest.join('');
    const systolic = constrainIntegerRange(rawSystolic, 50, 260, 3);

    if (!systolic) return '';
    if (!hasSlash) return systolic;

    const diastolic = constrainIntegerRange(rawDiastolic, 30, 150, 3);
    return `${systolic}/${diastolic}`;
  }

  function isValidSearchValue(value, field) {
    const text = normalizeSpaces(String(value || '').trim());
    if (!text) return true;
    if (!SEARCH_PATTERN.test(text)) return false;
    if (!/[\p{L}0-9]/u.test(text)) return false;
    if (/^\d+$/.test(text)) return numericSearchLooksPossible(text, field);

    return text
      .split(/\s+/)
      .every(token => !SEARCH_INVALID_MIXED_TOKEN.test(token))
      && textSearchLooksPossible(text, field);
  }

  function keepOneAt(value) {
    const clean = value.replace(/\s/g, '');
    const [local = '', ...domains] = clean.split('@');
    return domains.length ? `${local}@${domains.join('').replace(/@/g, '')}` : local;
  }

  function formatPhone(value) {
    return value
      .replace(/\D/g, '')
      .slice(0, 9)
      .replace(/(\d{3})(?=\d)/g, '$1 ')
      .trim();
  }

  function maxBirthDateISO() {
    const today = new Date();
    return `${today.getFullYear() - 1}-12-31`;
  }

  function sanitize(field) {
    const type = field.dataset.validate;

    if (type === 'search') {
      field.value = normalizeSpaces(field.value);
    }

    if (type === 'clinical-text') {
      field.value = normalizeSpaces(field.value.replace(/[^\p{L}0-9 .,;:()\/\-\n]/gu, ''));
    }

    if (type === 'personal-name') {
      field.value = keepPersonalName(field.value);
    }

    if (type === 'digits' || type === 'dni') {
      const maxLength = type === 'dni' ? 8 : Number(field.dataset.maxLength || field.maxLength || 0);
      const min = field.min === '' ? null : Number(field.min);
      const max = field.max === '' ? null : Number(field.max);

      if (field.dataset.vital && min !== null && max !== null) {
        field.value = constrainIntegerRange(field.value, min, max, maxLength || 3);
      } else {
        const digits = field.value.replace(/\D/g, '');
        field.value = maxLength > 0 ? digits.slice(0, maxLength) : digits;
      }
    }

    if (type === 'phone-pe') {
      field.value = formatPhone(field.value);
    }

    if (type === 'decimal') {
      field.value = field.dataset.vital === 'temperature'
        ? constrainTemperature(field.value)
        : keepOneDecimal(field.value);
    }

    if (type === 'blood-pressure') {
      field.value = constrainBloodPressure(field.value);
    }

    if (type === 'email') {
      field.value = keepOneAt(field.value);
    }

    if (type === 'address') {
      field.value = normalizeSpaces(field.value.replace(/[^\p{L}0-9 .,#;:()\/-]/gu, ''));
    }
  }

  function rangeMessage(field, value) {
    const min = field.min === '' ? null : Number(field.min);
    const max = field.max === '' ? null : Number(field.max);

    if (min !== null && value < min) return `El valor mínimo permitido es ${min}.`;
    if (max !== null && value > max) return `El valor máximo permitido es ${max}.`;
    return '';
  }

  function messageFor(field) {
    const type = field.dataset.validate;
    const value = field.value.trim();

    if (field.disabled) return '';
    if (field.required && !value && type === 'decimal' && field.dataset.vital === 'temperature') {
      return 'Ingresa una temperatura entre 35 y 43 °C.';
    }
    if (field.required && !value && type === 'blood-pressure') {
      return 'Ingresa la presión arterial con formato 120/80.';
    }
    if (field.required && !value && type === 'digits' && field.dataset.vital) {
      const min = field.min === '' ? '' : field.min;
      const max = field.max === '' ? '' : field.max;
      if (field.dataset.vital === 'heart-rate') return `Ingresa una frecuencia cardíaca entre ${min} y ${max}.`;
      if (field.dataset.vital === 'oxygen-saturation') return `Ingresa una saturación O2 entre ${min} y ${max}.`;
    }
    if (field.required && !value && type === 'birth-date') {
      return 'Completa la fecha de nacimiento.';
    }
    if (field.required && !value) return 'Este campo es obligatorio.';
    if (!field.required && !value) return '';

    if (type === 'search' && !isValidSearchValue(value, field)) {
      return 'Ingresa datos válidos para buscar.';
    }

    if (type === 'clinical-text') {
      const min = Number(field.dataset.min || field.minLength || 5);
      if (value.length < min) return `Ingresa al menos ${min} caracteres.`;
      if (!TEXT_PATTERN.test(value)) return 'Usa solo texto, números y puntuación básica.';
    }

    if (type === 'personal-name') {
      const min = Number(field.dataset.min || field.minLength || 2);
      if (value.length < min) return `Ingresa al menos ${min} letras.`;
      if (!PERSONAL_NAME_PATTERN.test(value)) return 'Ingresa solo letras y espacios.';
    }

    if (type === 'dni') {
      if (!/^\d{8}$/.test(value)) return 'El DNI debe tener exactamente 8 números.';
    }

    if (type === 'digits') {
      const min = field.dataset.minLength || (field.minLength > 0 ? field.minLength : '');
      const max = field.dataset.maxLength || (field.maxLength > 0 ? field.maxLength : '');
      const exact = field.dataset.exactLength;
      if (!/^\d+$/.test(value)) return 'Solo se permiten números.';
      if (exact && value.length !== Number(exact)) return `Debe tener exactamente ${exact} dígitos.`;
      if (min && value.length < Number(min)) return `Debe tener al menos ${min} dígitos.`;
      if (max && value.length > Number(max)) return `Debe tener como máximo ${max} dígitos.`;
      const numericMessage = rangeMessage(field, Number(value));
      if (numericMessage) return numericMessage;
    }

    if (type === 'phone-pe') {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 9) return 'El teléfono debe tener exactamente 9 números.';
      if (!/^\d{3} \d{3} \d{3}$/.test(value)) return 'Usa el formato 987 654 321.';
    }

    if (type === 'decimal') {
      const decimalPattern = field.dataset.vital === 'temperature'
        ? /^\d{2}(\.\d)?$/
        : /^\d+(\.\d{1,2})?$/;
      if (!decimalPattern.test(value)) return 'Ingresa un número válido.';
      const numericMessage = rangeMessage(field, Number(value));
      if (numericMessage) return numericMessage;
    }

    if (type === 'blood-pressure') {
      const match = value.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!match) return 'Usa el formato 120/80.';
      const systolic = Number(match[1]);
      const diastolic = Number(match[2]);
      const systolicMin = Number(field.dataset.systolicMin || 50);
      const systolicMax = Number(field.dataset.systolicMax || 260);
      const diastolicMin = Number(field.dataset.diastolicMin || 30);
      const diastolicMax = Number(field.dataset.diastolicMax || 150);
      if (systolic < systolicMin || systolic > systolicMax || diastolic < diastolicMin || diastolic > diastolicMax) {
        return 'La presión arterial ingresada no parece válida.';
      }
    }

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Ingresa un correo válido con un solo @.';
    }

    if (type === 'date') {
      const date = new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) return 'Selecciona una fecha válida.';
    }

    if (type === 'date-not-future') {
      const date = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(date.getTime())) return 'Selecciona una fecha válida.';
      if (date >= today) return 'La fecha debe ser anterior a la fecha actual.';
    }

    if (type === 'birth-date') {
      const date = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(date.getTime())) return 'Selecciona una fecha válida.';
      if (date >= today || date.getFullYear() === today.getFullYear()) {
        return 'La fecha de nacimiento no puede ser de hoy, futura ni del año actual.';
      }
    }

    if (type === 'address' && !ADDRESS_PATTERN.test(value)) {
      return 'Usa letras, números y puntuación básica para la dirección.';
    }

    if (type === 'password' && field.minLength > 0 && value.length < field.minLength) {
      return `Debe tener al menos ${field.minLength} caracteres.`;
    }

    if (type === 'strong-password') {
      if (value.length < 8) return 'Debe tener al menos 8 caracteres.';
      if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula.';
      if (!/[a-z]/.test(value)) return 'Debe incluir al menos una minúscula.';
      if (!/\d/.test(value)) return 'Debe incluir al menos un número.';
      if (!/[^A-Za-z0-9]/.test(value)) return 'Debe incluir al menos un símbolo.';
    }

    if (type === 'password-confirm') {
      const source = document.getElementById(field.dataset.match || '');
      if (source && value !== source.value) return 'La confirmación no coincide.';
    }

    if (field.validity.typeMismatch) return 'El formato ingresado no es válido.';
    if (field.validity.tooLong) return 'El texto es demasiado largo.';

    return '';
  }

  function messageElement(form, field) {
    return form.querySelector(`.field-message[data-for="${field.id}"]`);
  }

  function validateField(field) {
    const form = field.form;
    if (!form || field.type === 'hidden') return true;

    sanitize(field);
    const message = messageFor(field);
    const target = messageElement(form, field);

    field.classList.toggle('field-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (target) {
      target.textContent = message;
      target.classList.toggle('is-visible', Boolean(message));
    }

    return !message;
  }

  function validateForm(form) {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const invalid = fields.find(field => !validateField(field));

    if (invalid) {
      invalid.focus();
      return false;
    }

    return true;
  }

  document.querySelectorAll('.js-role-validated-form').forEach(form => {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));

    form.querySelectorAll('[data-validate="birth-date"]').forEach(field => {
      field.max = maxBirthDateISO();
    });

    fields.forEach(field => {
      sanitize(field);
      field.addEventListener('input', () => validateField(field));
      field.addEventListener('change', () => validateField(field));
      field.addEventListener('blur', () => validateField(field));
    });

    form.addEventListener('submit', event => {
      if (!validateForm(form)) event.preventDefault();
    });
  });

  return { validateField, validateForm };
})();
