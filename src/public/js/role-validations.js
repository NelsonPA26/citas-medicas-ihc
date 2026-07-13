window.RoleValidation = (() => {
  const TEXT_PATTERN = /^[\p{L}0-9 .,;:()\/\-\n]+$/u;
  const SEARCH_PATTERN = /^[\p{L}0-9 .,;:()\/-]+$/u;
  const ADDRESS_PATTERN = /^[\p{L}0-9 .,#;:()\/-]+$/u;
  const PERSONAL_NAME_PATTERN = /^[\p{L} ]+$/u;
  const NON_PERSONAL_NAME_PATTERN = /[^\p{L} ]/gu;

  function normalizeSpaces(value) {
    return value.replace(/\s{2,}/g, ' ');
  }

  function keepOneDecimal(value) {
    const clean = value.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    return parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('')}` : clean;
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
      field.value = normalizeSpaces(field.value.replace(/[^\p{L}0-9 .,;:()\/-]/gu, ''));
    }

    if (type === 'clinical-text') {
      field.value = normalizeSpaces(field.value.replace(/[^\p{L}0-9 .,;:()\/\-\n]/gu, ''));
    }

    if (type === 'personal-name') {
      field.value = normalizeSpaces(field.value.replace(NON_PERSONAL_NAME_PATTERN, ''));
    }

    if (type === 'digits' || type === 'dni') {
      const maxLength = type === 'dni' ? 8 : Number(field.dataset.maxLength || field.maxLength || 0);
      const digits = field.value.replace(/\D/g, '');
      field.value = maxLength > 0 ? digits.slice(0, maxLength) : digits;
    }

    if (type === 'phone-pe') {
      field.value = formatPhone(field.value);
    }

    if (type === 'decimal') {
      field.value = keepOneDecimal(field.value);
    }

    if (type === 'blood-pressure') {
      field.value = field.value.replace(/[^0-9/]/g, '').replace(/\/{2,}/g, '/');
      const parts = field.value.split('/');
      if (parts.length > 2) field.value = `${parts[0]}/${parts.slice(1).join('')}`;
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
    if (field.required && !value) return 'Este campo es obligatorio.';
    if (!field.required && !value) return '';

    if (type === 'search' && !SEARCH_PATTERN.test(value)) {
      return 'Usa solo letras, números, espacios y puntuación básica.';
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
      const min = field.minLength || field.dataset.minLength;
      const max = field.maxLength > 0 ? field.maxLength : field.dataset.maxLength;
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
      if (!/^\d+(\.\d{1,2})?$/.test(value)) return 'Ingresa un número válido.';
      const numericMessage = rangeMessage(field, Number(value));
      if (numericMessage) return numericMessage;
    }

    if (type === 'blood-pressure') {
      const match = value.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!match) return 'Usa el formato 120/80.';
      const systolic = Number(match[1]);
      const diastolic = Number(match[2]);
      if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
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
    });

    form.addEventListener('submit', event => {
      if (!validateForm(form)) event.preventDefault();
    });
  });

  return { validateField, validateForm };
})();
