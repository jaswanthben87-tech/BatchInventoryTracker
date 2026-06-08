const prisma = require('../db');
const { logAction } = require('../utils/audit');

// Get all batches
const getBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      include: { product: true },
      orderBy: { expiryDate: 'asc' }
    });
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve batches' });
  }
};

// Create a new batch
const createBatch = async (req, res) => {
  try {
    const { productId, mfgDate, quantityProduced, packagingCount } = req.body;

    if (!productId || !mfgDate || !quantityProduced || !packagingCount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const mfgDateObj = new Date(mfgDate);
    // Calculate expiryDate
    const expiryDateObj = new Date(mfgDateObj);
    expiryDateObj.setDate(expiryDateObj.getDate() + product.shelfLifeDays);

    // Format Date for Batch ID: YYYYMMDD
    const yyyy = mfgDateObj.getFullYear();
    const mm = String(mfgDateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(mfgDateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    // Calculate sequence code for this SKU on this date
    const dateStart = new Date(mfgDateObj.setHours(0, 0, 0, 0));
    const dateEnd = new Date(mfgDateObj.setHours(23, 59, 59, 999));

    const countOnDate = await prisma.batch.count({
      where: {
        productId,
        mfgDate: {
          gte: dateStart,
          lte: dateEnd
        }
      }
    });
    const seq = String(countOnDate + 1).padStart(2, '0');
    const batchId = `${product.sku}-${dateStr}-${seq}`;

    // Create Batch
    const batch = await prisma.batch.create({
      data: {
        id: batchId,
        productId,
        mfgDate: new Date(mfgDate),
        expiryDate: expiryDateObj,
        quantityProduced: parseInt(quantityProduced),
        packagingCount: parseInt(packagingCount),
        currentStock: parseInt(quantityProduced),
        status: 'ACTIVE'
      }
    });

    // Create stock entry log
    const stockLog = await prisma.stockLog.create({
      data: {
        batchId: batch.id,
        productId: product.id,
        type: 'STOCK_IN',
        quantity: parseInt(quantityProduced),
        notes: `Production run recorded. Quantity: ${quantityProduced}. Expiry Date: ${expiryDateObj.toISOString().split('T')[0]}`,
        userId: req.user.id
      }
    });

    // Track Audit Log
    await logAction(req.user.id, 'CREATE_BATCH', 'Batch', batch.id, null, batch);

    // Check if stock is low for other reasons
    res.status(201).json({ batch, stockLog });
  } catch (error) {
    console.error('Create Batch Error:', error);
    res.status(500).json({ error: 'Failed to create production batch' });
  }
};

// Update Batch (adjust stock or change status)
const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStock, status, notes } = req.body;

    const oldBatch = await prisma.batch.findUnique({ where: { id } });
    if (!oldBatch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const updatedData = {};
    if (currentStock !== undefined) updatedData.currentStock = parseInt(currentStock);
    if (status !== undefined) updatedData.status = status;

    const updated = await prisma.batch.update({
      where: { id },
      data: updatedData
    });

    // Log stock adjustment if currentStock was changed
    if (currentStock !== undefined && parseInt(currentStock) !== oldBatch.currentStock) {
      const diff = parseInt(currentStock) - oldBatch.currentStock;
      const type = diff > 0 ? 'ADJUSTMENT' : 'WASTAGE';
      await prisma.stockLog.create({
        data: {
          batchId: id,
          productId: oldBatch.productId,
          type,
          quantity: diff,
          notes: notes || `Manual stock adjustment from ${oldBatch.currentStock} to ${currentStock}.`,
          userId: req.user.id
        }
      });
    }

    await logAction(req.user.id, 'UPDATE_BATCH', 'Batch', id, oldBatch, updated);

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Batch Error:', error);
    res.status(500).json({ error: 'Failed to update batch' });
  }
};

// Expiry Alert Engine Endpoint
const getExpiryStatus = async (req, res) => {
  try {
    const now = new Date();
    const nowTime = now.getTime();

    // Fetch all active batches that still have stock
    const activeBatches = await prisma.batch.findMany({
      where: {
        currentStock: { gt: 0 },
        status: 'ACTIVE'
      },
      include: { product: true }
    });

    const expired = [];
    const nearExpiry7 = [];
    const nearExpiry15 = [];
    const nearExpiry30 = [];

    for (const batch of activeBatches) {
      const expiryTime = new Date(batch.expiryDate).getTime();
      const diffTime = expiryTime - nowTime;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        expired.push({ ...batch, daysRemaining: diffDays });
        // Automatically mark status as EXPIRED in db
        await prisma.batch.update({
          where: { id: batch.id },
          data: { status: 'EXPIRED' }
        });
      } else if (diffDays <= 7) {
        nearExpiry7.push({ ...batch, daysRemaining: diffDays });
      } else if (diffDays <= 15) {
        nearExpiry15.push({ ...batch, daysRemaining: diffDays });
      } else if (diffDays <= 30) {
        nearExpiry30.push({ ...batch, daysRemaining: diffDays });
      }
    }

    // Include already marked expired batches
    const previouslyExpired = await prisma.batch.findMany({
      where: { status: 'EXPIRED', currentStock: { gt: 0 } },
      include: { product: true }
    });

    // Merge expired lists
    const allExpired = [...expired, ...previouslyExpired].filter(
      (v, i, a) => a.findIndex(t => t.id === v.id) === i
    );

    res.status(200).json({
      expired: allExpired,
      nearExpiry7,
      nearExpiry15,
      nearExpiry30
    });
  } catch (error) {
    console.error('Expiry Check Error:', error);
    res.status(500).json({ error: 'Failed to fetch expiry status' });
  }
};

module.exports = {
  getBatches,
  createBatch,
  updateBatch,
  getExpiryStatus
};
