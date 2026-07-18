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
  '/ayuda',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.ayuda
);

router.get(
  '/api/medicamentos',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.buscarMedicamentos
);

router.get(
  '/api/medicamentos/:id_medicamento/presentaciones',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.presentacionesMedicamento
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

router.get(
  '/pacientes/:id_paciente/historial/:id_consulta',
  isAuthenticated,
  allowRoles('medico'),
  medicoController.detalleConsultaPaciente
);

module.exports = router;
