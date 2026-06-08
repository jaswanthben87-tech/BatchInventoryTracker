const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', batchController.getBatches);
router.get('/expiry-status', batchController.getExpiryStatus);

router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'), batchController.createBatch);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PRODUCTION_MANAGER'), batchController.updateBatch);

module.exports = router;
