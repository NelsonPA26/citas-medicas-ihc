const express = require('express');
const router = express.Router();

const enfermeraController = require('../controllers/enfermera.controller');

const { isAuthenticated } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.get(
  '/dashboard',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.dashboard
);

router.get(
  '/ayuda',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.ayuda
);

router.get(
  '/triaje-pendiente',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.triajePendiente
);

router.get(
  '/triaje/:id_cita/registrar',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.showRegistrarTriaje
);

router.post(
  '/triaje/:id_cita/registrar',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.storeRegistrarTriaje
);

router.get(
  '/triajes/:id_cita/detalle',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.showDetalleTriaje
);

router.get(
  '/triajes/:id_cita/editar',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.showEditarTriaje
);

router.post(
  '/triajes/:id_cita/editar',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.updateTriaje
);

router.get(
  '/triajes',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.triajesRealizados
);

router.get(
  '/historial-triajes',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.historialTriajes
);

module.exports = router;
