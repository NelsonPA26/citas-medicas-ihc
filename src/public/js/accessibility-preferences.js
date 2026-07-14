(function () {
  'use strict';

  const SCALE_KEY = 'citasIhcVisualScale:v2';
  const CONTRAST_KEY = 'citasIhcHighContrast:v2';
  const allowedScales = new Set(['normal', 'large', 'xlarge']);
  const scaleLabels = {
    normal: 'Normal',
    large: 'Grande',
    xlarge: 'Muy grande'
  };

  function getStoredScale() {
    try {
      const value = localStorage.getItem(SCALE_KEY);
      return allowedScales.has(value) ? value : 'normal';
    } catch (error) {
      return 'normal';
    }
  }

  function getStoredContrast() {
    try {
      return localStorage.getItem(CONTRAST_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // La preferencia es una mejora progresiva; la interfaz sigue funcionando sin almacenamiento local.
    }
  }

  function announce(message) {
    const status = document.getElementById('accessibilityStatus');
    if (status) status.textContent = message;
  }

  function applyScale(scale, shouldAnnounce) {
    const normalizedScale = allowedScales.has(scale) ? scale : 'normal';
    document.documentElement.dataset.visualScale = normalizedScale;
    savePreference(SCALE_KEY, normalizedScale);

    document.querySelectorAll('button[data-visual-scale]').forEach(button => {
      const pressed = button.dataset.visualScale === normalizedScale;
      button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });

    const visualScaleLabel = document.getElementById('visualScaleLabel');
    if (visualScaleLabel) visualScaleLabel.textContent = scaleLabels[normalizedScale];

    if (shouldAnnounce) {
      const messages = {
        normal: 'Tamaño de texto normal aplicado.',
        large: 'Texto grande aplicado.',
        xlarge: 'Texto muy grande aplicado.'
      };
      announce(messages[normalizedScale]);
    }
  }

  function applyContrast(enabled, shouldAnnounce) {
    document.documentElement.dataset.visualContrast = enabled ? 'high' : 'standard';
    savePreference(CONTRAST_KEY, String(enabled));

    document.querySelectorAll('button[data-visual-contrast]').forEach(button => {
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      button.setAttribute('aria-checked', enabled ? 'true' : 'false');
    });

    if (shouldAnnounce) {
      announce(enabled ? 'Modo de alto contraste activado.' : 'Modo de alto contraste desactivado.');
    }
  }

  document.documentElement.dataset.visualScale = getStoredScale();
  document.documentElement.dataset.visualContrast = getStoredContrast() ? 'high' : 'standard';

  document.addEventListener('DOMContentLoaded', () => {
    applyScale(getStoredScale(), false);
    applyContrast(getStoredContrast(), false);

    document.querySelectorAll('button[data-visual-scale]').forEach(button => {
      button.addEventListener('click', event => {
        if (event.button !== 0) return;
        applyScale(button.dataset.visualScale, true);
      });
    });

    document.querySelectorAll('button[data-visual-contrast]').forEach(button => {
      button.addEventListener('click', event => {
        if (event.button !== 0) return;
        applyContrast(document.documentElement.dataset.visualContrast !== 'high', true);
      });
    });
  });
})();
