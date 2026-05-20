const express = require('express');
const router = express.Router();

const medicoController = require('../controllers/medico.controller');

const { isAuthenticated } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.get(
  '/dashboard',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.dashboard
);

router.get(
  '/citas',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.citasDelDia
);

router.get(
  '/citas/:id_cita/atender',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.showAtenderCita
);

router.post(
  '/citas/:id_cita/atender',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.storeAtenderCita
);

router.get(
  '/pacientes',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.pacientes
);

router.get(
  '/pacientes/:id_paciente/historial',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.historialPaciente
);

module.exports = router;