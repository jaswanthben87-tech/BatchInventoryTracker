const prisma = require('../db');
const { logAction } = require('../utils/audit');

// --- Product CRUD ---

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        batches: {
          select: {
            currentStock: true
          }
        }
      }
    });

    // Calculate total stock from active/expired batches for convenience
    const productsWithStock = products.map(p => {
      const totalStock = p.batches.reduce((sum, b) => sum + b.currentStock, 0);
      return {
        ...p,
        totalStock
      };
    });

    res.status(200).json(productsWithStock);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, sku, description, price, shelfLifeDays, thresholdStock, imageUrl, categoryId } = req.body;

    if (!name || !sku || !price || !shelfLifeDays || !thresholdStock || !categoryId) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku: sku.toUpperCase(),
        description,
        price: parseFloat(price),
        shelfLifeDays: parseInt(shelfLifeDays),
        thresholdStock: parseInt(thresholdStock),
        imageUrl,
        categoryId
      }
    });

    await logAction(req.user.id, 'CREATE_PRODUCT', 'Product', product.id, null, product);

    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price, shelfLifeDays, thresholdStock, imageUrl, categoryId } = req.body;

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (!oldProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (sku && sku !== oldProduct.sku) {
      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name || oldProduct.name,
        sku: sku ? sku.toUpperCase() : oldProduct.sku,
        description: description !== undefined ? description : oldProduct.description,
        price: price !== undefined ? parseFloat(price) : oldProduct.price,
        shelfLifeDays: shelfLifeDays !== undefined ? parseInt(shelfLifeDays) : oldProduct.shelfLifeDays,
        thresholdStock: thresholdStock !== undefined ? parseInt(thresholdStock) : oldProduct.thresholdStock,
        imageUrl: imageUrl !== undefined ? imageUrl : oldProduct.imageUrl,
        categoryId: categoryId || oldProduct.categoryId
      }
    });

    await logAction(req.user.id, 'UPDATE_PRODUCT', 'Product', id, oldProduct, updated);

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (!oldProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has batches
    const batchCount = await prisma.batch.count({ where: { productId: id } });
    if (batchCount > 0) {
      return res.status(400).json({ error: 'Cannot delete product with active or archive production batches.' });
    }

    await prisma.product.delete({ where: { id } });

    await logAction(req.user.id, 'DELETE_PRODUCT', 'Product', id, oldProduct, null);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// --- Category Endpoints ---

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.category.create({
      data: { name, description }
    });

    await logAction(req.user.id, 'CREATE_CATEGORY', 'Category', category.id, null, category);

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory
};
