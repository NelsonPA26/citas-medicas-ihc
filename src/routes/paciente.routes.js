const express = require('express');
const router = express.Router();

const pacienteController = require('../controllers/paciente.controller');

const { isAuthenticated } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.get(
  '/dashboard',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.dashboard
);

router.get(
  '/reservar-cita',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.showReservarCita
);

router.post(
  '/reservar-cita',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.storeReservarCita
);

router.get(
  '/horas-disponibles',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.getHorasDisponibles
);

router.get(
  '/mis-citas',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.misCitas
);

router.post(
  '/mis-citas/:id_cita/cancelar',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.cancelarCita
);

router.get(
  '/historial',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.historial
);

router.get(
  '/historial/:id_consulta',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.detalleHistorial
);

module.exports = router;