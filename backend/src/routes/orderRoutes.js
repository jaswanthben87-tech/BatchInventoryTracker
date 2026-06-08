const express = require('express');
const router = Router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'DISPATCH_TEAM', 'CUSTOMER_SUPPORT'), orderController.createOrder);
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'DISPATCH_TEAM', 'CUSTOMER_SUPPORT'), orderController.updateOrderStatus);

module.exports = router;
