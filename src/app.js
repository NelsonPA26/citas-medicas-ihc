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
  res.locals.success = req.session.success || null;

  res.locals.currentPath = req.originalUrl;

  delete req.session.error;
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

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});