const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const db = require('./config/database');
const MySqlSessionStore = require('./config/mysql-session-store');
const { provideCsrfToken, verifyCsrfToken } = require('./middlewares/csrf.middleware');

const authRoutes = require('./routes/auth.routes');

const pacienteRoutes = require('./routes/paciente.routes');
const medicoRoutes = require('./routes/medico.routes');
const enfermeraRoutes = require('./routes/enfermera.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();
const sessionMaxAge = 30 * 60 * 1000;
const sessionStore = new MySqlSessionStore(db, { ttlMs: sessionMaxAge });

const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET debe configurarse con al menos 32 caracteres antes de iniciar la aplicacion.');
}

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

function dashboardByRole(rol) {
  const routes = {
    paciente: '/paciente/dashboard',
    medico: '/medico/dashboard',
    enfermera: '/enfermera/dashboard',
    administrativo: '/admin/dashboard'
  };

  return routes[rol] || '/login';
}

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Layouts
app.use(expressLayouts);
app.set('layout', 'layouts/auth');

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Sesiones
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'bienestar.sid',
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionMaxAge
    }
  })
);

app.use(provideCsrfToken);
app.use(verifyCsrfToken);

// Variables globales para las vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;

  res.locals.error = req.session.error || null;
  res.locals.errorField = req.session.errorField || null;
  res.locals.oldLoginIdentifier = req.session.oldLoginIdentifier || '';
  res.locals.success = req.session.success || null;

  res.locals.currentPath = req.path;
  res.locals.returnToDashboard = req.query.returnTo === 'dashboard';
  res.locals.dashboardReturnUrl = res.locals.user ? dashboardByRole(res.locals.user.rol) : '/login';

  delete req.session.error;
  delete req.session.errorField;
  delete req.session.oldLoginIdentifier;
  delete req.session.success;

  next();
});

// Rutas
app.use('/', authRoutes);
app.use('/paciente', pacienteRoutes);
app.use('/medico', medicoRoutes);
app.use('/enfermera', enfermeraRoutes);
app.use('/admin', adminRoutes);
app.use('/', profileRoutes);

// Ruta inicial
app.get('/', (req, res) => {
  res.redirect('/login');
});

// No se expone un endpoint de diagnostico de base de datos al cliente.
app.all('/test-db', (req, res) => res.status(404).end());

app.use((req, res) => {
  const backUrl = req.session && req.session.user
    ? dashboardByRole(req.session.user.rol)
    : '/login';

  res.status(404).render('errors/404', {
    title: 'Página no encontrada',
    layout: req.session && req.session.user ? 'layouts/dashboard' : 'layouts/auth',
    backUrl
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  const backUrl = req.session && req.session.user
    ? dashboardByRole(req.session.user.rol)
    : '/login';

  res.status(500).render('errors/500', {
    title: 'Error del sistema',
    layout: req.session && req.session.user ? 'layouts/dashboard' : 'layouts/auth',
    backUrl
  });
});

async function startServer() {
  await sessionStore.init();

  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('No se pudo inicializar el almacenamiento de sesiones.', error);
  process.exit(1);
});
