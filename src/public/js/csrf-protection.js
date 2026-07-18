(function () {
  const meta = document.querySelector('meta[name="csrf-token"]');
  const token = meta && meta.getAttribute('content');

  if (!token) return;

  function ensureToken(form) {
    if (!form || String(form.method || 'get').toLowerCase() !== 'post') return;

    let input = form.querySelector('input[name="_csrf"]');
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_csrf';
      form.prepend(input);
    }

    input.value = token;
  }

  document.querySelectorAll('form').forEach(ensureToken);
  document.addEventListener('submit', event => ensureToken(event.target), true);
})();
