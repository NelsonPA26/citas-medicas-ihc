const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src', 'public', 'img', 'action-metaphors');

const palette = {
  ink: '#17233f',
  line: '#6b7892',
  pale: '#eef6ff',
  blue: '#0d6efd',
  teal: '#14b8a6',
  green: '#19a65a',
  orange: '#f59e0b',
  red: '#ef4444',
  gray: '#64748b',
  violet: '#6366f1',
  white: '#ffffff',
  skin: '#f8d7bd',
  coat: '#f8fafc',
  nurse: '#dbeafe',
  scrub: '#35c8c2',
  shirt: '#9bdcff',
  hair: '#0f365f',
  patient: '#d1fae5',
  folder: '#60a5fa',
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeSvg(relativePath, svg) {
  const fullPath = path.join(root, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, svg, 'utf8');
}

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="skinGrad" x1="18" y1="10" x2="43" y2="55" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffd6a8"/>
      <stop offset="1" stop-color="#ffb36f"/>
    </linearGradient>
    <linearGradient id="hairGrad" x1="18" y1="6" x2="42" y2="33" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#244b73"/>
      <stop offset="1" stop-color="#0b2d52"/>
    </linearGradient>
    <linearGradient id="scrubGrad" x1="13" y1="32" x2="48" y2="58" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#52d7d1"/>
      <stop offset="1" stop-color="#1aa6a1"/>
    </linearGradient>
    <linearGradient id="shirtGrad" x1="13" y1="32" x2="48" y2="58" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#bae9ff"/>
      <stop offset="1" stop-color="#7cc9f5"/>
    </linearGradient>
  </defs>
  ${body}
</svg>
`;
}

const objects = {
  cita: `
  <rect x="7" y="10" width="43" height="43" rx="7" fill="${palette.pale}" stroke="${palette.ink}" stroke-width="2.4"/>
  <path d="M7 22h43" stroke="${palette.ink}" stroke-width="2.4"/>
  <path d="M18 7v8M39 7v8" stroke="${palette.blue}" stroke-width="4" stroke-linecap="round"/>
  <rect x="15" y="29" width="7" height="7" rx="1.8" fill="#bfdbfe"/>
  <rect x="26" y="29" width="7" height="7" rx="1.8" fill="#bfdbfe"/>
  <rect x="37" y="29" width="7" height="7" rx="1.8" fill="#bfdbfe"/>
  <rect x="15" y="41" width="7" height="7" rx="1.8" fill="#bfdbfe"/>
  <rect x="26" y="41" width="7" height="7" rx="1.8" fill="#bfdbfe"/>`,
  medico: `
  <path d="M17 17c0-10 8-15 19-11 5 2 8 7 8 14-5-5-16-4-25 0z" fill="url(#hairGrad)" stroke="${palette.ink}" stroke-width="2.2" stroke-linejoin="round"/>
  <circle cx="29" cy="19" r="10" fill="url(#skinGrad)" stroke="${palette.ink}" stroke-width="2.4"/>
  <path d="M19 18c5 4 17 4 22-2" fill="none" stroke="${palette.ink}" stroke-width="2.3" stroke-linecap="round"/>
  <path d="M12 56c1-15 8-24 17-24s16 9 17 24" fill="${palette.coat}" stroke="${palette.ink}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M21 35l8 11 8-11" fill="#bfe7ff" stroke="${palette.ink}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M26 43l3-3 3 3-3 12z" fill="#07599c" stroke="${palette.ink}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M21 37l-5 13M37 37l5 13" stroke="${palette.ink}" stroke-width="2" stroke-linecap="round"/>
  <path d="M18 39c-5 5-4 13 1 15M40 39c5 5 4 13-1 15" stroke="#07599c" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="19" cy="54" r="2.6" fill="#07599c" stroke="${palette.white}" stroke-width="1"/>
  <circle cx="40" cy="54" r="3.2" fill="#bfe7ff" stroke="#07599c" stroke-width="2"/>`,
  enfermera: `
  <path d="M17 20c0-10 7-15 18-12 7 2 11 8 10 18l-4 11c-3-7-19-7-23 0z" fill="#3a2a21" stroke="${palette.ink}" stroke-width="2.2" stroke-linejoin="round"/>
  <circle cx="43" cy="34" r="8" fill="#3a2a21" stroke="${palette.ink}" stroke-width="2.2"/>
  <path d="M17 10c5-7 20-7 25 0l-3 9c-6-3-14-3-20 0z" fill="${palette.white}" stroke="${palette.ink}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M29 8v8M25 12h8" stroke="${palette.teal}" stroke-width="2.7" stroke-linecap="round"/>
  <circle cx="29" cy="24" r="10.5" fill="url(#skinGrad)" stroke="${palette.ink}" stroke-width="2.4"/>
  <path d="M18 23c8-2 15-6 20-14 2 6 6 10 10 13" fill="none" stroke="${palette.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 56c1.5-14 8-22 17-22s15.5 8 17 22" fill="url(#scrubGrad)" stroke="${palette.ink}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M21 37l8 12 8-12" fill="${palette.white}" stroke="${palette.ink}" stroke-width="1.8" stroke-linejoin="round"/>
  <rect x="35" y="48" width="9" height="5" rx="1.4" fill="${palette.white}" stroke="${palette.ink}" stroke-width="1.6"/>`,
  paciente: `
  <path d="M17 17c0-10 8-15 19-11 6 2 9 7 8 17-4-5-17-5-25 0z" fill="url(#hairGrad)" stroke="${palette.ink}" stroke-width="2.3" stroke-linejoin="round"/>
  <circle cx="29" cy="22" r="10.5" fill="url(#skinGrad)" stroke="${palette.ink}" stroke-width="2.4"/>
  <path d="M17 21c8-1 15-4 21-11" fill="none" stroke="${palette.ink}" stroke-width="2.3" stroke-linecap="round"/>
  <path d="M12 56c1.5-14 8-22 17-22s15.5 8 17 22" fill="url(#shirtGrad)" stroke="${palette.ink}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M35 49c-5-4-8-7-8-12 0-5 6-7 9-2 3-5 10-3 10 3 0 5-4 8-11 13z" fill="#ef3349" stroke="${palette.ink}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M29 42h5l2-6 4 12 3-6h5" fill="none" stroke="${palette.white}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  usuario: `
  <circle cx="29" cy="15" r="8" fill="${palette.blue}" stroke="${palette.ink}" stroke-width="2.2"/>
  <circle cx="14" cy="25" r="6.5" fill="${palette.white}" stroke="${palette.ink}" stroke-width="2.2"/>
  <circle cx="44" cy="25" r="6.5" fill="${palette.white}" stroke="${palette.ink}" stroke-width="2.2"/>
  <path d="M8 54c1-10 7-17 15-17 3 0 6 1 8 3 2-2 5-3 8-3 8 0 14 7 15 17" fill="#eef6ff" stroke="${palette.ink}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M16 54c1-13 6-21 13-21s12 8 13 21" fill="#bfdbfe" stroke="${palette.ink}" stroke-width="2.2" stroke-linejoin="round"/>`,
  triaje: `
  <rect x="13" y="8" width="34" height="47" rx="6" fill="${palette.white}" stroke="${palette.ink}" stroke-width="2.4"/>
  <path d="M22 7h16l2 7H20z" fill="#dbeafe" stroke="${palette.ink}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M21 25l3 3 6-7M21 36l3 3 6-7M21 47l3 3 6-7" stroke="${palette.blue}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M34 26h7M34 37h7M34 48h7" stroke="${palette.line}" stroke-width="2.2" stroke-linecap="round"/>`,
  historial: `
  <path d="M7 21h17l5 5h26v24a6 6 0 0 1-6 6H13a6 6 0 0 1-6-6z" fill="${palette.folder}" stroke="${palette.ink}" stroke-width="2.3" stroke-linejoin="round"/>
  <rect x="15" y="11" width="36" height="34" rx="5" fill="${palette.white}" stroke="${palette.ink}" stroke-width="2.3"/>
  <circle cx="30" cy="24" r="4.6" fill="#bfdbfe" stroke="${palette.ink}" stroke-width="1.8"/>
  <path d="M22 36h20M22 42h15" stroke="${palette.line}" stroke-width="2.2" stroke-linecap="round"/>`,
  perfil: `
  <circle cx="29" cy="17" r="9" fill="${palette.white}" stroke="${palette.ink}" stroke-width="2.3"/>
  <path d="M13 54c2-14 8-22 16-22s14 8 16 22" fill="#e0f2fe" stroke="${palette.ink}" stroke-width="2.3" stroke-linejoin="round"/>
  <path d="M21 40h16" stroke="${palette.blue}" stroke-width="2.3" stroke-linecap="round"/>`,
};

const overlays = {
  registrar: circle(palette.green, plus()),
  activar: circle(palette.green, power()),
  desactivar: circle(palette.gray, power()),
  buscar: circle(palette.blue, search()),
  ver: circle(palette.blue, search()),
  filtrar: circle(palette.orange, filter()),
  limpiar: circle(palette.gray, eraser()),
  editar: circle(palette.orange, pencil()),
  cancelar: circle(palette.red, cross()),
  eliminar: circle(palette.red, trash()),
  guardar: circle(palette.green, check()),
  confirmar: circle(palette.green, check()),
  atender: circle(palette.teal, medical()),
  continuar: circle(palette.blue, arrow()),
  seguridad: circle(palette.violet, lock()),
  volver: circle(palette.gray, back()),
  reservar: circle(palette.green, plus()),
};

function circle(fill, content) {
  return `<circle cx="48" cy="48" r="13" fill="${fill}" stroke="${palette.white}" stroke-width="3"/>
  ${content}`;
}

function plus() {
  return `<path d="M48 41v14M41 48h14" stroke="${palette.white}" stroke-width="3" stroke-linecap="round"/>`;
}

function search() {
  return `<circle cx="46" cy="46" r="5" fill="none" stroke="${palette.white}" stroke-width="3"/>
  <path d="M50 50l5 5" stroke="${palette.white}" stroke-width="3" stroke-linecap="round"/>`;
}

function filter() {
  return `<path d="M39 41h18l-7 8v6l-4 2v-8z" fill="${palette.white}" stroke="${palette.white}" stroke-width="1" stroke-linejoin="round"/>`;
}

function eraser() {
  return `<path d="M41 51l9-9 6 6-7 7h-8z" fill="none" stroke="${palette.white}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M39 56h18" stroke="${palette.white}" stroke-width="3" stroke-linecap="round"/>`;
}

function pencil() {
  return `<path d="M41 53l2-7 8-8 5 5-8 8z" fill="none" stroke="${palette.white}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M49 40l5 5" stroke="${palette.white}" stroke-width="3" stroke-linecap="round"/>`;
}

function cross() {
  return `<path d="M43 43l10 10M53 43L43 53" stroke="${palette.white}" stroke-width="3.4" stroke-linecap="round"/>`;
}

function trash() {
  return `<path d="M43 44h10M45 44l1 10h4l1-10M46 41h4" fill="none" stroke="${palette.white}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function check() {
  return `<path d="M42 48l4 5 9-10" fill="none" stroke="${palette.white}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function power() {
  return `<path d="M48 40v9" stroke="${palette.white}" stroke-width="3" stroke-linecap="round"/>
  <path d="M43 43a8 8 0 1 0 10 0" fill="none" stroke="${palette.white}" stroke-width="3" stroke-linecap="round"/>`;
}

function medical() {
  return `<path d="M48 41v14M41 48h14" stroke="${palette.white}" stroke-width="3" stroke-linecap="round"/>`;
}

function arrow() {
  return `<path d="M41 48h13M50 43l5 5-5 5" fill="none" stroke="${palette.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function lock() {
  return `<rect x="41" y="46" width="14" height="10" rx="2" fill="none" stroke="${palette.white}" stroke-width="2.6"/>
  <path d="M44 46v-3a4 4 0 0 1 8 0v3" fill="none" stroke="${palette.white}" stroke-width="2.6" stroke-linecap="round"/>`;
}

function back() {
  return `<path d="M53 42l-8 6 8 6M45 48h11" fill="none" stroke="${palette.white}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function make(object, action) {
  return svg(`${objects[object]}
  ${overlays[action]}`);
}

const assets = {
  'paciente/antecedentes': ['historial', ['guardar', 'cancelar', 'volver']],
};

for (const [folder, [object, actions]] of Object.entries(assets)) {
  for (const action of actions) {
    writeSvg(`${folder}/${action}.svg`, make(object, action));
  }
}

console.log('Action metaphor SVGs generated by role and object.');
