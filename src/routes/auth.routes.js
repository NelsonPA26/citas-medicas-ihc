const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { isGuest } = require('../middlewares/auth.middleware');
const { loginRateLimiter, passwordRecoveryRateLimiter } = require('../middlewares/rate-limit.middleware');

router.get('/privacidad', authController.showPrivacy);
router.get('/login', isGuest, authController.showLogin);
router.post('/login', isGuest, loginRateLimiter, authController.login);

router.get('/register', isGuest, authController.showRegister);
router.post('/register', isGuest, authController.register);

router.get('/forgot-password', isGuest, authController.showForgotPassword);
router.post('/forgot-password', isGuest, passwordRecoveryRateLimiter, authController.forgotPassword);

router.get('/reset-password/:token', isGuest, authController.showResetPassword);
router.post('/reset-password/:token', isGuest, authController.resetPassword);

router.post('/logout', authController.logout);

module.exports = router;
