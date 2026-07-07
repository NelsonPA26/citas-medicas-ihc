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
  '/ayuda',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.ayuda
);

router.get(
  '/usuarios',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.usuarios
);

router.post(
  '/usuarios/:id_usuario/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.editarUsuario
);

router.post(
  '/usuarios/:id_usuario/estado',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.cambiarEstadoUsuario
);
router.post(
  '/usuarios/:id_usuario/eliminar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.eliminarUsuario
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
  '/medicos/:id_medico/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.showEditarMedico
);

router.post(
  '/medicos/:id_medico/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.updateMedico
);

router.post(
  '/medicos/:id_medico/estado',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.cambiarEstadoMedico
);

router.post(
  '/medicos/:id_medico/eliminar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.eliminarMedico
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
  '/enfermeras/:id_enfermera/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.showEditarEnfermera
);

router.post(
  '/enfermeras/:id_enfermera/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.updateEnfermera
);

router.post(
  '/enfermeras/:id_enfermera/estado',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.cambiarEstadoEnfermera
);

router.post(
  '/enfermeras/:id_enfermera/eliminar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.eliminarEnfermera
);

router.get(
  '/citas',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.citas
);

router.get(
  '/citas/:id_cita/detalle',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.detalleCita
);

router.post(
  '/citas/:id_cita/cancelar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.cancelarCita
);

module.exports = router;
