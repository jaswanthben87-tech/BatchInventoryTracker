const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', customerController.getCustomers);
router.get('/phone', customerController.getCustomerByPhone);
router.get('/:id', customerController.getCustomerById);

module.exports = router;
