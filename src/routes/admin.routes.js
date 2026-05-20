const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');

const { isAuthenticated } = require('../middlewares/auth.middleware');
const { allowRoles } = require('../middlewares/role.middleware');

router.get(
  '/dashboard',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.dashboard
);

router.get(
  '/usuarios',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.usuarios
);

router.post(
  '/usuarios/:id_usuario/estado',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.cambiarEstadoUsuario
);

router.get(
  '/medicos',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.medicos
);

router.get(
  '/medicos/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.showNuevoMedico
);

router.post(
  '/medicos/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.storeNuevoMedico
);

router.get(
  '/enfermeras',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.enfermeras
);

router.get(
  '/enfermeras/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.showNuevaEnfermera
);

router.post(
  '/enfermeras/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.storeNuevaEnfermera
);

router.get(
  '/citas',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.citas
);

module.exports = router;