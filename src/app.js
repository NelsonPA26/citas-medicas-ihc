const express = require('express');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');

const pacienteRoutes = require('./routes/paciente.routes');
const medicoRoutes = require('./routes/medico.routes');
const enfermeraRoutes = require('./routes/enfermera.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();

const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

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
    secret: process.env.SESSION_SECRET || 'clave_temporal',
    resave: false,
    saveUninitialized: false
  })
);

// Variables globales para las vistas
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;

  res.locals.error = req.session.error || null;
  res.locals.errorField = req.session.errorField || null;
  res.locals.success = req.session.success || null;

  res.locals.currentPath = req.path;

  delete req.session.error;
  delete req.session.errorField;
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

// Prueba de conexión
app.get('/test-db', async (req, res) => {
  try {
    const db = require('./config/database');
    const [rows] = await db.query('SELECT 1 + 1 AS resultado');

    res.json({
      ok: true,
      mensaje: 'Conexión a MySQL exitosa',
      resultado: rows[0].resultado
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al conectar con MySQL',
      error: error.message
    });
  }
});

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

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
