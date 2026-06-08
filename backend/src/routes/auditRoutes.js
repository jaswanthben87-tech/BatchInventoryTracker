const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN'), auditController.getAuditLogs);

module.exports = router;
