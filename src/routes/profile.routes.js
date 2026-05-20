const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.get(
  '/perfil',
  isAuthenticated,
  profileController.showProfile
);

router.post(
  '/perfil/actualizar',
  isAuthenticated,
  profileController.updateProfile
);

router.post(
  '/perfil/cambiar-password',
  isAuthenticated,
  profileController.changePassword
);

module.exports = router;