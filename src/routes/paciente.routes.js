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
  '/ayuda',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.ayuda
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
  '/mis-citas/:id_cita/editar',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.showEditarCita
);

router.post(
  '/mis-citas/:id_cita/editar',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.updateCita
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

router.get(
  '/mis-citas/:id_cita/resumen',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.resumenCita
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
  '/antecedentes',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.showAntecedentes
);

router.post(
  '/antecedentes',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.updateAntecedentes
);

router.get(
  '/historial/:id_consulta',
  isAuthenticated,
  allowRoles('paciente'),
  pacienteController.detalleHistorial
);

module.exports = router;
