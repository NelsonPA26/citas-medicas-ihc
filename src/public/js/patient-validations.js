window.PatientValidation = (() => {
  const SEARCH_PATTERN = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 .,;:()/-]+$/;
  const SEARCH_INVALID_MIXED_TOKEN = /(?=\S*[A-Za-zÁÉÍÓÚáéíóúÑñ])(?=\S*\d)[A-Za-zÁÉÍÓÚáéíóúÑñ0-9]{4,}/;

  function normalizeSpaces(value) {
    return value.replace(/\s{2,}/g, ' ');
  }

  function visibleNumericTokensFor(field) {
    const scope = field.closest('.module-card') || document;
    const rows = Array.from(scope.querySelectorAll('.data-table tbody tr'));

    return rows.flatMap(row => (row.textContent || '').match(/\b\d{6,9}\b/g) || []);
  }

  function normalizeSearchComparable(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function visibleSearchEntriesFor(field) {
    const scope = field.closest('.module-card') || document;
    const rows = Array.from(scope.querySelectorAll('.data-table tbody tr'));

    return rows
      .map(row => normalizeSearchComparable(row.textContent || ''))
      .filter(Boolean);
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

  function isValidSearchValue(value, field) {
    const text = normalizeSpaces(String(value || '').trim());
    if (!text) return true;
    if (!SEARCH_PATTERN.test(text)) return false;
    if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ0-9]/.test(text)) return false;
    if (/^\d+$/.test(text)) return numericSearchLooksPossible(text, field);

    return text
      .split(/\s+/)
      .every(token => !SEARCH_INVALID_MIXED_TOKEN.test(token))
      && textSearchLooksPossible(text, field);
  }

  function formatDateForUser(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function messageFor(field) {
    if (field.disabled) return '';

    if (field.validity.valueMissing) {
      return 'Este campo es obligatorio.';
    }

    if (!field.required && !field.value.trim()) {
      return '';
    }

    if (field.dataset.validate === 'search' && !isValidSearchValue(field.value, field)) {
      return 'Ingresa datos válidos para buscar.';
    }

    if (field.type === 'date' && field.value) {
      const date = new Date(`${field.value}T00:00:00`);
      if (Number.isNaN(date.getTime())) {
        return 'Selecciona una fecha válida.';
      }
    }

    if (field.type === 'date' && field.value && field.validity.rangeUnderflow && field.min) {
      return `Selecciona una fecha desde el ${formatDateForUser(field.min)}.`;
    }

    if (field.type === 'date' && field.value && field.validity.rangeOverflow && field.max) {
      return `Selecciona una fecha hasta el ${formatDateForUser(field.max)}.`;
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
      field.value = normalizeSpaces(field.value);
      return;
    }

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
