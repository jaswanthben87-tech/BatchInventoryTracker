const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const prisma = require('../db');

// Smart registration: open if zero users exist, otherwise requires ADMIN/SUPER_ADMIN
const checkInitialSetupOrAdmin = async (req, res, next) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      // Allow initial setup registration
      return next();
    }
    // Otherwise, require JWT and ADMIN role
    return authenticateToken(req, res, () => {
      authorizeRoles('SUPER_ADMIN', 'ADMIN')(req, res, next);
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user setup status' });
  }
};

router.post('/register', checkInitialSetupOrAdmin, authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);

module.exports = router;
