(() => {
  const LETTERS_PATTERN = /^[\p{L} ]+$/u;

  function normalizeSpaces(value) {
    return value.replace(/\s{2,}/g, ' ').trimStart();
  }

  function keepPersonalName(value) {
    return normalizeSpaces(value.replace(/[^\p{L} ]/gu, ''));
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

  function keepOneAt(value) {
    const clean = value.replace(/\s/g, '');
    const [local = '', ...domains] = clean.split('@');
    return domains.length ? `${local}@${domains.join('').replace(/@/g, '')}` : local;
  }

  function sanitize(field) {
    const type = field.dataset.validate;

    if (type === 'personal-name') {
      field.value = keepPersonalName(field.value);
    }

    if (type === 'dni') {
      field.value = field.value.replace(/\D/g, '').slice(0, 8);
    }

    if (type === 'phone-pe') {
      field.value = formatPhone(field.value);
    }

    if (type === 'email') {
      field.value = keepOneAt(field.value);
    }

    if (type === 'login-identifier') {
      field.value = keepOneAt(field.value);
    }
  }

  function messageFor(field) {
    const type = field.dataset.validate;
    const value = field.value.trim();

    if (field.required && !value) return 'Este campo es obligatorio.';
    if (!field.required && !value) return '';

    if (type === 'personal-name') {
      if (value.length < 2) return 'Ingresa al menos 2 letras.';
      if (!LETTERS_PATTERN.test(value)) return 'Ingresa solo letras y espacios.';
    }

    if (type === 'dni') {
      if (!/^\d{8}$/.test(value)) return 'El DNI debe tener exactamente 8 números.';
    }

    if (type === 'phone-pe') {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 9) return 'El teléfono debe tener exactamente 9 números.';
      if (!/^\d{3} \d{3} \d{3}$/.test(value)) return 'Usa el formato 987 654 321.';
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

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Ingresa un correo válido con un solo @.';
    }

    if (type === 'login-identifier' && /\s/.test(value)) {
      return 'El usuario o correo no debe contener espacios.';
    }

    if (type === 'strong-password') {
      if (value.length < 8) return 'Debe tener al menos 8 caracteres.';
      if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una mayúscula.';
      if (!/[a-z]/.test(value)) return 'Debe incluir al menos una minúscula.';
      if (!/\d/.test(value)) return 'Debe incluir al menos un número.';
      if (!/[^A-Za-z0-9]/.test(value)) return 'Debe incluir al menos un símbolo.';
    }

    if (type === 'password-confirm') {
      const source = document.getElementById(field.dataset.match || 'password');
      if (source && value !== source.value) return 'Las contraseñas no coinciden.';
    }

    if (field.validity.typeMismatch) return 'El formato ingresado no es válido.';
    if (field.validity.tooLong) return 'El texto es demasiado largo.';
    if (field.validity.tooShort) return 'Ingresa más caracteres.';

    return '';
  }

  function messageElement(form, field) {
    return form.querySelector(`.field-message[data-for="${field.id}"]`);
  }

  function passwordScore(value) {
    return [
      value.length >= 8,
      /[A-Z]/.test(value),
      /[a-z]/.test(value),
      /\d/.test(value),
      /[^A-Za-z0-9]/.test(value)
    ].filter(Boolean).length;
  }

  function updatePasswordStrength(field) {
    if (!field || !field.id || field.dataset.validate !== 'strong-password') return;
    const form = field.form;
    if (!form) return;

    const strengthBox = form.querySelector(`.password-strength[data-password-strength-for="${field.id}"]`);
    if (!strengthBox) return;

    const score = passwordScore(field.value);
    const labels = ['sin evaluar', 'muy d\u00e9bil', 'd\u00e9bil', 'media', 'buena', 'fuerte'];
    const state = score >= 5 ? 'strong' : score >= 4 ? 'good' : score >= 3 ? 'medium' : 'weak';
    const label = field.value ? labels[score] : labels[0];

    strengthBox.dataset.strength = field.value ? state : 'empty';
    strengthBox.querySelector('p').textContent = `Seguridad: ${label}`;
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

    updatePasswordStrength(field);

    return !message;
  }

  function prepareForm(form) {
    form.querySelectorAll('[data-validate="birth-date"]').forEach(field => {
      field.max = maxBirthDateISO();
    });

    form.querySelectorAll('[data-validate]').forEach(field => {
      sanitize(field);
      updatePasswordStrength(field);
      field.addEventListener('input', () => validateField(field));
      field.addEventListener('change', () => validateField(field));
    });

    form.addEventListener('submit', event => {
      const fields = Array.from(form.querySelectorAll('input, select, textarea'));
      const invalid = fields.find(field => !validateField(field));

      if (invalid) {
        event.preventDefault();
        invalid.focus();
      }
    });
  }

  document.querySelectorAll('.js-auth-validated-form').forEach(prepareForm);
})();
