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

  function saveFormDraft(form) {
    if (form.dataset.preserveDraft === 'false') return;
    if (!form.querySelector('input, textarea, select')) return;

    try {
      sessionStorage.setItem(getFormKey(form), JSON.stringify(collectFormDraft(form)));
    } catch (error) {
      // Si el navegador bloquea sessionStorage, el sistema sigue funcionando sin romper la interacción.
    }
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

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
      restoreFormDraft(form);

      form.addEventListener('input', () => saveFormDraft(form));
      form.addEventListener('change', () => saveFormDraft(form));
    });
  });

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
