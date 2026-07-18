(function () {
  'use strict';

  const DRAFT_PREFIX = 'citasIhcFormDraft:';
  const SENSITIVE_TYPES = new Set(['password', 'file', 'hidden']);
  const loadingMessages = {
    post: 'Procesando solicitud...',
    get: 'Cargando resultados...',
    login: 'Verificando datos...',
    filter: 'Aplicando filtros...',
    save: 'Guardando información...',
    delete: 'Procesando acción...',
    cancel: 'Cancelando solicitud...'
  };
  const initialFormSnapshots = new WeakMap();

  function normalizeMethod(form) {
    return String(form.getAttribute('method') || 'GET').toLowerCase();
  }

  function getFormKey(form) {
    const action = form.getAttribute('action') || window.location.pathname;
    const method = normalizeMethod(form);
    return `${DRAFT_PREFIX}${method}:${action}:${window.location.pathname}`;
  }

  function isDraftableField(field) {
    if (!field.name || field.disabled) return false;
    const type = String(field.type || '').toLowerCase();
    if (SENSITIVE_TYPES.has(type)) return false;
    if (field.matches('[data-no-draft]')) return false;
    return field.matches('input, textarea, select');
  }

  function collectFormDraft(form) {
    const draft = {};

    Array.from(form.elements).forEach(field => {
      if (!isDraftableField(field)) return;

      if (field.type === 'checkbox') {
        if (!draft[field.name]) draft[field.name] = [];
        if (field.checked) draft[field.name].push(field.value);
        return;
      }

      if (field.type === 'radio') {
        if (field.checked) draft[field.name] = field.value;
        return;
      }

      draft[field.name] = field.value;
    });

    return draft;
  }

  function isUnsavedTrackableField(field) {
    if (!field.name || field.disabled) return false;
    const type = String(field.type || '').toLowerCase();
    if (type === 'file' || type === 'hidden') return false;
    return field.matches('input, textarea, select');
  }

  function collectUnsavedSnapshot(form) {
    const snapshot = {};

    Array.from(form.elements).forEach(field => {
      if (!isUnsavedTrackableField(field)) return;

      if (field.type === 'checkbox') {
        if (!snapshot[field.name]) snapshot[field.name] = [];
        if (field.checked) snapshot[field.name].push(field.value);
        return;
      }

      if (field.type === 'radio') {
        if (field.checked) snapshot[field.name] = field.value;
        return;
      }

      if (String(field.type || '').toLowerCase() === 'password') {
        snapshot[field.name] = field.value.length > 0;
        return;
      }

      snapshot[field.name] = field.value;
    });

    return snapshot;
  }

  function formHasUserEditableFields(form) {
    return Array.from(form.elements).some(isUnsavedTrackableField);
  }

  function isTrackedForm(form) {
    if (!(form instanceof HTMLFormElement)) return false;
    if (form.matches('.logout-form')) return false;
    if (form.dataset.trackUnsaved === 'false') return false;
    if (normalizeMethod(form) !== 'post') return false;
    return formHasUserEditableFields(form);
  }

  function formSnapshot(form) {
    return JSON.stringify(collectUnsavedSnapshot(form));
  }

  function saveFormDraft(form) {
    if (form.dataset.preserveDraft === 'false') return;
    if (!form.querySelector('input, textarea, select')) return;

    try {
      sessionStorage.setItem(getFormKey(form), JSON.stringify(collectFormDraft(form)));
    } catch (error) {
      // Si el navegador bloquea sessionStorage, el sistema sigue funcionando sin romper la interacción.
    }
  }

  function captureVisibleFieldErrors(form) {
    return Array.from(form.querySelectorAll('.field-message[data-for].is-visible'))
      .map(message => {
        const field = form.querySelector(`#${CSS.escape(message.dataset.for)}`);
        if (!field) return null;

        return {
          field,
          message,
          text: message.textContent,
          fieldError: field.classList.contains('field-error'),
          ariaInvalid: field.getAttribute('aria-invalid')
        };
      })
      .filter(Boolean);
  }

  function restoreVisibleFieldErrors(errors) {
    errors.forEach(error => {
      error.message.textContent = error.text;
      error.message.classList.add('is-visible');
      error.field.classList.toggle('field-error', error.fieldError);

      if (error.ariaInvalid === null) error.field.removeAttribute('aria-invalid');
      else error.field.setAttribute('aria-invalid', error.ariaInvalid);
    });
  }

  function restoreFormDraft(form) {
    const hasVisibleError = document.querySelector('.alert-error');
    if (!hasVisibleError || form.dataset.preserveDraft === 'false') return;

    let draft = null;

    try {
      draft = JSON.parse(sessionStorage.getItem(getFormKey(form)) || 'null');
    } catch (error) {
      draft = null;
    }

    if (!draft || typeof draft !== 'object') return;

    const preservedErrors = captureVisibleFieldErrors(form);

    Array.from(form.elements).forEach(field => {
      if (!isDraftableField(field)) return;
      if (!Object.prototype.hasOwnProperty.call(draft, field.name)) return;

      const value = draft[field.name];

      if (field.type === 'checkbox') {
        field.checked = Array.isArray(value) && value.includes(field.value);
        field.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      if (field.type === 'radio') {
        field.checked = value === field.value;
        field.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });

    restoreVisibleFieldErrors(preservedErrors);
  }

  function ensureLoadingLayer() {
    let layer = document.getElementById('globalLoadingLayer');

    if (layer) return layer;

    layer = document.createElement('div');
    layer.id = 'globalLoadingLayer';
    layer.className = 'global-loading-layer hidden';
    layer.setAttribute('role', 'status');
    layer.setAttribute('aria-live', 'polite');
    layer.innerHTML = `
      <div class="global-loading-card">
        <span class="global-loading-spinner" aria-hidden="true"></span>
        <strong>Procesando...</strong>
        <p>Por favor espera un momento.</p>
      </div>
    `;
    document.body.appendChild(layer);
    return layer;
  }

  function setButtonLoading(button, message) {
    if (!button || button.dataset.loadingApplied === '1') return;

    button.dataset.loadingApplied = '1';
    button.dataset.originalLabel = button.textContent.trim();
    button.disabled = true;
    button.classList.add('is-loading');
    button.setAttribute('aria-busy', 'true');

    const textSpan = Array.from(button.querySelectorAll('span')).find(span => !span.classList.contains('visually-hidden'));

    if (textSpan) {
      textSpan.textContent = message;
      return;
    }

    if (!button.classList.contains('icon-action')) {
      button.textContent = message;
    }
  }

  function inferLoadingMessage(form) {
    const text = `${form.textContent || ''} ${form.action || ''} ${window.location.pathname}`.toLowerCase();
    const method = normalizeMethod(form);

    if (text.includes('iniciar sesión') || text.includes('iniciar sesion') || text.includes('login')) return loadingMessages.login;
    if (text.includes('filtrar') || method === 'get') return loadingMessages.filter;
    if (text.includes('guardar') || text.includes('registrar') || text.includes('actualizar') || text.includes('confirmar')) return loadingMessages.save;
    if (text.includes('eliminar') || text.includes('desactivar')) return loadingMessages.delete;
    if (text.includes('cancelar')) return loadingMessages.cancel;

    return method === 'get' ? loadingMessages.get : loadingMessages.post;
  }

  function showPageLoading(message) {
    const layer = ensureLoadingLayer();
    const title = layer.querySelector('strong');
    const description = layer.querySelector('p');

    if (title) title.textContent = message || 'Procesando...';
    if (description) description.textContent = 'No cierres ni recargues la página mientras termina la acción.';

    layer.classList.remove('hidden');
    document.body.classList.add('is-page-loading');
  }

  window.showPageLoading = showPageLoading;
  window.saveCurrentFormDraft = saveFormDraft;

  function genericFieldMessage(field) {
    if (field.validity.valueMissing) return 'Este campo es obligatorio.';
    if (field.validity.typeMismatch) return 'Revisa el formato ingresado.';
    if (field.validity.patternMismatch) return 'El formato ingresado no es válido.';
    if (field.validity.tooShort) return `Ingresa al menos ${field.minLength} caracteres.`;
    if (field.validity.rangeUnderflow) return field.type === 'date'
      ? `Selecciona una fecha desde el ${formatDateForUser(field.min)}.`
      : `El valor mínimo permitido es ${field.min}.`;
    if (field.validity.rangeOverflow) return field.type === 'date'
      ? `Selecciona una fecha hasta el ${formatDateForUser(field.max)}.`
      : `El valor máximo permitido es ${field.max}.`;
    return '';
  }

  function formatDateForUser(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function ensureFieldMessage(form, field) {
    if (!field.id) return null;
    let target = form.querySelector(`.field-message[data-for="${field.id}"]`);
    if (target) return target;

    const group = field.closest('.form-group');
    if (!group) return null;
    target = document.createElement('small');
    target.className = 'field-message';
    target.dataset.for = field.id;
    group.appendChild(target);
    return target;
  }

  function validateGenericField(form, field) {
    if (field.disabled || field.type === 'hidden' || field.dataset.validate) return field.checkValidity();
    const message = genericFieldMessage(field);
    const target = ensureFieldMessage(form, field);
    field.classList.toggle('field-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');

    if (target) {
      target.textContent = message;
      target.classList.toggle('is-visible', Boolean(message));
    }

    return !message;
  }

  function prepareProgressiveSubmit(form) {
    if (normalizeMethod(form) !== 'post' || form.matches('.logout-form') || form.dataset.progressiveSubmit === 'false') return;
    const submitButtons = Array.from(form.querySelectorAll('button[type="submit"], input[type="submit"]'));
    if (!submitButtons.length) return;
    const requiredFields = Array.from(form.querySelectorAll('[required]'));
    const requiredCheckboxName = form.dataset.requiredCheckboxName || '';
    const requiredCheckboxes = requiredCheckboxName
      ? Array.from(form.querySelectorAll(`input[type="checkbox"][name="${requiredCheckboxName}"]`))
      : [];

    submitButtons.forEach(button => {
      button.dataset.enabledTitle = button.getAttribute('title') || '';
    });

    const updateState = () => {
      const fieldsComplete = requiredFields.every(field => field.disabled || field.checkValidity());
      const checkboxGroupComplete = requiredCheckboxes.length === 0
        || requiredCheckboxes.some(field => !field.disabled && field.checked);
      const complete = fieldsComplete && checkboxGroupComplete;
      const hasVisibleErrors = Boolean(form.querySelector('.field-error'));
      const enabled = complete && !hasVisibleErrors;

      submitButtons.forEach(button => {
        button.disabled = !enabled;
        button.setAttribute('aria-disabled', enabled ? 'false' : 'true');
        if (!enabled) {
          button.removeAttribute('title');
        } else {
          if (button.dataset.enabledTitle) button.title = button.dataset.enabledTitle;
          else button.removeAttribute('title');
        }
      });
    };

    requiredFields.forEach(field => {
      let touched = false;
      field.addEventListener('blur', () => {
        touched = true;
        validateGenericField(form, field);
        updateState();
      });
      field.addEventListener('input', () => {
        if (touched || field.classList.contains('field-error')) validateGenericField(form, field);
        window.setTimeout(updateState, 0);
      });
      field.addEventListener('change', () => {
        if (touched || field.classList.contains('field-error')) validateGenericField(form, field);
        window.setTimeout(updateState, 0);
      });
    });

    requiredCheckboxes.forEach(field => {
      field.addEventListener('change', () => window.setTimeout(updateState, 0));
    });

    form.addEventListener('submit', event => {
      const invalid = requiredFields.find(field => !field.disabled && !validateGenericField(form, field));
      if (invalid) {
        event.preventDefault();
        invalid.focus();
      }
      updateState();
    });

    window.setTimeout(updateState, 0);
  }

  function appendToken(value, token) {
    const tokens = String(value || '').split(/\s+/).filter(Boolean);
    if (!tokens.includes(token)) tokens.push(token);
    return tokens.join(' ');
  }

  function ensureFieldDescriptions(root = document) {
    root.querySelectorAll('.form-group').forEach((group, groupIndex) => {
      const controls = Array.from(group.querySelectorAll('input, select, textarea'));
      if (!controls.length) return;

      const helpIds = Array.from(group.querySelectorAll('.form-help')).map((help, helpIndex) => {
        if (!help.id) {
          const baseId = controls[0].id || controls[0].name || `field-${groupIndex}`;
          help.id = `${baseId}-help-${helpIndex + 1}`;
        }
        return help.id;
      });

      controls.forEach(control => {
        if (control.required) control.setAttribute('aria-required', 'true');
        if (!control.hasAttribute('aria-invalid')) control.setAttribute('aria-invalid', 'false');

        helpIds.forEach(id => {
          control.setAttribute('aria-describedby', appendToken(control.getAttribute('aria-describedby'), id));
        });
      });
    });

    root.querySelectorAll('.field-message[data-for]').forEach((message, index) => {
      const field = document.getElementById(message.dataset.for);
      if (!message.id) message.id = `${message.dataset.for || 'field'}-message-${index + 1}`;
      message.setAttribute('aria-live', 'polite');

      if (field) {
        field.setAttribute('aria-describedby', appendToken(field.getAttribute('aria-describedby'), message.id));
        if (!field.hasAttribute('aria-invalid')) field.setAttribute('aria-invalid', 'false');
      }
    });
  }

  function enhanceSystemMessages(root = document) {
    root.querySelectorAll('.alert-error').forEach(alert => {
      if (!alert.hasAttribute('role')) alert.setAttribute('role', 'alert');
    });

    root.querySelectorAll('.alert-success').forEach(alert => {
      if (!alert.hasAttribute('role')) alert.setAttribute('role', 'status');
      if (!alert.hasAttribute('aria-live')) alert.setAttribute('aria-live', 'polite');
    });
  }

  function enhanceTables(root = document) {
    root.querySelectorAll('table.data-table').forEach((table, index) => {
      if (!table.querySelector('caption')) {
        const title = document.querySelector('.dashboard-topbar h1, .auth-card h2, .module-header h2');
        const caption = document.createElement('caption');
        caption.className = 'visually-hidden';
        caption.textContent = title
          ? `Tabla de ${title.textContent.trim()}`
          : `Tabla de resultados ${index + 1}`;
        table.prepend(caption);
      }

      table.querySelectorAll('th a.sort-link').forEach(link => {
        if (!link.title) link.title = `Ordenar por ${link.textContent.replace(/[↑↓]/g, '').trim()}`;
      });
    });
  }

  function enhanceDisabledLinks(root = document) {
    root.querySelectorAll('a.disabled, .pagination-button.disabled').forEach(link => {
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
      link.addEventListener('click', event => event.preventDefault());
    });
  }

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
    )).filter(element => {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }

  function closeModal(modal) {
    const closeButton = modal.querySelector('.modal-close, [data-modal-close], .btn-light[id^="close"]');
    if (closeButton) {
      closeButton.click();
      return;
    }

    modal.classList.add('hidden');
  }

  function prepareAccessibleModal(modal) {
    const dialog = modal.matches('[role="dialog"]') ? modal : modal.querySelector('.confirm-modal, [role="dialog"]') || modal;
    const title = dialog.querySelector('h1, h2, h3, h4');
    const description = dialog.querySelector('p, .confirm-modal-note');

    if (!modal.hasAttribute('role')) modal.setAttribute('role', 'dialog');
    if (!modal.hasAttribute('aria-modal')) modal.setAttribute('aria-modal', 'true');
    if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');

    if (title) {
      if (!title.id) title.id = `${modal.id || 'modal'}-title`;
      if (!modal.hasAttribute('aria-labelledby')) modal.setAttribute('aria-labelledby', title.id);
    }

    if (description) {
      if (!description.id) description.id = `${modal.id || 'modal'}-description`;
      if (!modal.hasAttribute('aria-describedby')) modal.setAttribute('aria-describedby', description.id);
    }

    modal.addEventListener('keydown', event => {
      if (modal.classList.contains('hidden')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal(modal);
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(modal);
      if (!focusable.length) {
        event.preventDefault();
        modal.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const observer = new MutationObserver(() => {
      const isOpen = !modal.classList.contains('hidden');

      if (isOpen) {
        const activeElement = document.activeElement;
        modal.dataset.previousFocus = activeElement && activeElement.id && !modal.contains(activeElement)
          ? activeElement.id
          : '';
        window.setTimeout(() => {
          if (modal.contains(document.activeElement)) return;
          const focusable = getFocusableElements(modal);
          (focusable[0] || modal).focus();
        }, 0);
        return;
      }

      const previousFocus = modal.dataset.previousFocus ? document.getElementById(modal.dataset.previousFocus) : null;
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      modal.dataset.previousFocus = '';
    });

    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
  }

  function enhanceAccessibleStructure(root = document) {
    ensureFieldDescriptions(root);
    enhanceSystemMessages(root);
    enhanceTables(root);
    enhanceDisabledLinks(root);
    root.querySelectorAll('.modal-overlay').forEach(prepareAccessibleModal);
  }

  function openDatePickerFromArrow(event) {
    const field = event.target;
    if (!(field instanceof HTMLInputElement) || field.type !== 'date') return;
    if (field.disabled || field.readOnly || typeof field.showPicker !== 'function') return;
    if (event.button != null && event.button !== 0) return;
    if (field.dataset.datePickerOpening === '1') return;

    const rect = field.getBoundingClientRect();
    const arrowArea = Math.min(48, Math.max(38, rect.width * 0.25));
    const direction = window.getComputedStyle(field).direction;
    const isArrowClick = direction === 'rtl'
      ? event.clientX <= rect.left + arrowArea
      : event.clientX >= rect.right - arrowArea;

    if (!isArrowClick) return;

    event.preventDefault();
    field.focus({ preventScroll: true });

    try {
      field.dataset.datePickerOpening = '1';
      field.showPicker();
    } catch (error) {
      field.click();
    } finally {
      window.setTimeout(() => {
        delete field.dataset.datePickerOpening;
      }, 0);
    }
  }

  window.hasUnsavedCriticalChanges = function hasUnsavedCriticalChanges() {
    return Array.from(document.querySelectorAll('form')).some(form => {
      if (!isTrackedForm(form)) return false;
      const initialSnapshot = initialFormSnapshots.get(form);
      if (initialSnapshot == null) return false;
      return formSnapshot(form) !== initialSnapshot;
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    enhanceAccessibleStructure(document);

    document.querySelectorAll('form').forEach(form => {
      restoreFormDraft(form);

      if (isTrackedForm(form)) {
        initialFormSnapshots.set(form, formSnapshot(form));
      }

      form.addEventListener('input', () => saveFormDraft(form));
      form.addEventListener('change', () => saveFormDraft(form));
      prepareProgressiveSubmit(form);
    });
  });

  document.addEventListener('pointerdown', openDatePickerFromArrow, true);
  document.addEventListener('mousedown', openDatePickerFromArrow, true);
  document.addEventListener('click', openDatePickerFromArrow, true);

  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    saveFormDraft(form);

    window.setTimeout(() => {
      if (event.defaultPrevented) return;

      const message = inferLoadingMessage(form);
      const submitButton = event.submitter || form.querySelector('button[type="submit"], input[type="submit"]');
      setButtonLoading(submitButton, message.replace('...', ''));
      showPageLoading(message);
    }, 0);
  });
})();
