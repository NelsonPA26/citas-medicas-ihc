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

router.get(
  '/usuarios/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.nuevoUsuario
);

router.post(
  '/usuarios/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.storeUsuario
);

router.get(
  '/usuarios/:id_usuario/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  adminController.formEditarUsuario
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
  (req, res) => res.redirect('/admin/usuarios?rol=medico')
);

router.get(
  '/medicos/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=medico')
);

router.post(
  '/medicos/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=medico')
);

router.get(
  '/medicos/:id_medico/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=medico')
);

router.post(
  '/medicos/:id_medico/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=medico')
);

router.post(
  '/medicos/:id_medico/estado',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=medico')
);

router.post(
  '/medicos/:id_medico/eliminar',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=medico')
);

router.get(
  '/enfermeras',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=enfermera')
);

router.get(
  '/enfermeras/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=enfermera')
);

router.post(
  '/enfermeras/nuevo',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=enfermera')
);

router.get(
  '/enfermeras/:id_enfermera/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=enfermera')
);

router.post(
  '/enfermeras/:id_enfermera/editar',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=enfermera')
);

router.post(
  '/enfermeras/:id_enfermera/estado',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=enfermera')
);

router.post(
  '/enfermeras/:id_enfermera/eliminar',
  isAuthenticated,
  allowRoles('administrativo'),
  (req, res) => res.redirect('/admin/usuarios?rol=enfermera')
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
