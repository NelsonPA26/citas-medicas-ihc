document.querySelectorAll('.js-admin-person-form').forEach(form => {
  const summary = form.querySelector('.js-form-message');
  const fields = Array.from(form.querySelectorAll('input, select'));
  const requiredFields = Array.from(form.querySelectorAll('[required]'));
  const fechaNacimiento = form.querySelector('#fecha_nacimiento');

  if (fechaNacimiento) {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    fechaNacimiento.max = ayer.toISOString().split('T')[0];
  }

  const messages = {
    valueMissing: 'Este campo es obligatorio.',
    patternMismatch: 'El formato ingresado no es válido.',
    tooShort: 'Ingresa más caracteres.',
    tooLong: 'El valor ingresado es demasiado largo.',
    typeMismatch: 'Ingresa un valor con formato válido.'
  };

  function getMessage(field) {
    if (field.dataset.validate === 'letters' && field.validity.patternMismatch) {
      return 'Ingresa solo letras y espacios.';
    }

    if (field.id === 'dni' && field.validity.patternMismatch) {
      return 'El DNI debe tener exactamente 8 dígitos.';
    }

    if (field.id === 'telefono' && field.validity.patternMismatch) {
      return 'Ingresa solo dígitos, entre 7 y 15 números.';
    }

    if (field.id === 'correo' && field.validity.typeMismatch) {
      return 'Ingresa un correo válido.';
    }

    if (field.id === 'correo' && field.value.split('@').length !== 2) {
      return 'El correo debe tener un solo arroba.';
    }

    if (field.dataset.validate === 'code' && field.validity.patternMismatch) {
      return 'Usa solo letras, números y guion.';
    }

    if (field.id === 'fecha_nacimiento' && field.value) {
      const fecha = new Date(`${field.value}T00:00:00`);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fecha >= hoy) {
        return 'La fecha de nacimiento debe ser anterior a la fecha actual.';
      }
    }

    const validityKey = Object.keys(messages).find(key => field.validity[key]);
    return validityKey ? messages[validityKey] : '';
  }

  function getMessageElement(field) {
    return form.querySelector(`.field-message[data-for="${field.id}"]`);
  }

  function setFieldError(field, message) {
    const messageElement = getMessageElement(field);
    field.classList.toggle('field-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (messageElement) {
      messageElement.textContent = message;
      messageElement.classList.toggle('is-visible', Boolean(message));
    }
  }

  function validateField(field) {
    const message = getMessage(field);
    setFieldError(field, message);
    return !message;
  }

  function clearSummary() {
    summary.textContent = '';
    summary.classList.add('hidden');
  }

  fields.forEach(field => {
    field.addEventListener('input', () => {
      clearSummary();

      if (field.dataset.validate === 'digits') {
        field.value = field.value.replace(/\D/g, '');
      }

      if (field.dataset.validate === 'letters') {
        field.value = field.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
      }

      if (field.dataset.validate === 'code') {
        field.value = field.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
      }

      if (field.dataset.validate === 'email') {
        const [firstPart, ...rest] = field.value.replace(/\s/g, '').split('@');
        field.value = rest.length > 0 ? `${firstPart}@${rest.join('').replace(/@/g, '')}` : firstPart;
      }

      validateField(field);
    });

    field.addEventListener('change', () => {
      clearSummary();
      validateField(field);
    });
  });

  form.addEventListener('submit', event => {
    const invalidField = requiredFields.find(field => !validateField(field))
      || fields.find(field => !validateField(field));

    if (invalidField) {
      event.preventDefault();
      summary.textContent = 'Revisa los campos marcados antes de continuar.';
      summary.classList.remove('hidden');

      if (!invalidField.readOnly) {
        invalidField.focus();
      }
    }
  });
});
