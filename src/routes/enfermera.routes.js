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
  '/triajes',
  isAuthenticated,
  allowRoles('enfermera'),
  enfermeraController.triajesRealizados
);

module.exports = router;