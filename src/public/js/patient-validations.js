window.PatientValidation = (() => {
  function messageFor(field) {
    if (field.disabled) return '';

    if (field.validity.valueMissing) {
      return 'Este campo es obligatorio.';
    }

    if (!field.required && !field.value.trim()) {
      return '';
    }

    if (field.type === 'date' && field.value) {
      const date = new Date(`${field.value}T00:00:00`);
      if (Number.isNaN(date.getTime())) {
        return 'Selecciona una fecha válida.';
      }
    }

    if (field.validity.patternMismatch) {
      return 'El formato ingresado no es válido.';
    }

    if (field.dataset.validate === 'search' && field.validity.patternMismatch) {
      return 'Usa solo letras, números, espacios y puntuación básica.';
    }

    if (field.dataset.validate === 'medical-text') {
      const min = Number(field.dataset.min || 5);

      if (field.value.trim().length < min) {
        return `Ingresa al menos ${min} caracteres.`;
      }

      if (field.validity.patternMismatch) {
        return 'Usa solo texto, números y puntuación básica.';
      }
    }

    if (field.validity.tooLong) {
      return 'El texto es demasiado largo.';
    }

    return '';
  }

  function messageElement(form, field) {
    return form.querySelector(`.field-message[data-for="${field.id}"]`);
  }

  function sanitize(field) {
    if (field.dataset.validate === 'search') {
      field.value = field.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,;:()/-]/g, '');
    }

    if (field.dataset.validate === 'medical-text') {
      field.value = field.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,;:()/-]/g, '');
    }
  }

  function validateField(field) {
    const form = field.form;
    if (!form) return true;

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

  document.querySelectorAll('.js-patient-validated-form').forEach(form => {
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));

    fields.forEach(field => {
      field.addEventListener('input', () => validateField(field));
      field.addEventListener('change', () => validateField(field));
    });

    form.addEventListener('submit', event => {
      const invalid = fields.find(field => !validateField(field));

      if (invalid) {
        event.preventDefault();
        invalid.focus();
      }
    });
  });

  return { validateField };
})();
