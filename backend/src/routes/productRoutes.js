const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All product routes require token authentication
router.use(authenticateToken);

// Category routes
router.get('/categories', productController.getCategories);
router.post('/categories', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'), productController.createCategory);

// Product CRUD routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'), productController.createProduct);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER'), productController.updateProduct);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), productController.deleteProduct);

module.exports = router;
