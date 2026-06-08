const prisma = require('../db');
const { logAction } = require('../utils/audit');

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            batch: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            batch: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
};

// Create Order (Checkout with FEFO logic)
const createOrder = async (req, res) => {
  const { customerPhone, customerName, customerEmail, customerAddress, items } = req.body;

  if (!customerPhone || !customerName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer phone, name, and items are required' });
  }

  try {
    // Perform order checkout in a transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get or Create Customer
      let customer = await tx.customer.findUnique({
        where: { phone: customerPhone }
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: customerAddress
          }
        });
      } else if (customerAddress || customerEmail) {
        // Update customer profile with latest details
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: customerName,
            email: customerEmail || customer.email,
            address: customerAddress || customer.address
          }
        });
      }

      // Generate Order Number
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}${mm}${dd}`;

      // Count orders today
      const dateStart = new Date(now.setHours(0, 0, 0, 0));
      const dateEnd = new Date(now.setHours(23, 59, 59, 999));
      const todayOrderCount = await tx.order.count({
        where: {
          createdAt: { gte: dateStart, lte: dateEnd }
        }
      });
      const seq = String(todayOrderCount + 1).padStart(3, '0');
      const orderNumber = `SS-${dateStr}-${seq}`;

      let totalAmount = 0;
      const orderItemsToCreate = [];
      const stockLogsToCreate = [];

      // 2. Process each requested product using FEFO
      for (const item of items) {
        const { productId, quantity } = item;
        const requestedQty = parseInt(quantity);

        if (!productId || isNaN(requestedQty) || requestedQty <= 0) {
          throw new Error('Invalid product ID or quantity');
        }

        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }

        // Query active batches with stock for this product, ordered by expiry date (FEFO)
        const activeBatches = await tx.batch.findMany({
          where: {
            productId,
            currentStock: { gt: 0 },
            status: 'ACTIVE'
          },
          orderBy: { expiryDate: 'asc' }
        });

        const availableStock = activeBatches.reduce((sum, b) => sum + b.currentStock, 0);
        if (availableStock < requestedQty) {
          throw new Error(`Insufficient stock for product '${product.name}'. Requested: ${requestedQty}, Available: ${availableStock}`);
        }

        // Allocate stock from batches sequentially (FEFO)
        let remainingToAllocate = requestedQty;

        for (const batch of activeBatches) {
          if (remainingToAllocate <= 0) break;

          const batchStock = batch.currentStock;
          const allocatedFromBatch = Math.min(batchStock, remainingToAllocate);

          // Update batch stock in DB
          const newStock = batchStock - allocatedFromBatch;
          await tx.batch.update({
            where: { id: batch.id },
            data: {
              currentStock: newStock,
              status: newStock === 0 ? 'EXHAUSTED' : batch.status
            }
          });

          // Track items to insert
          orderItemsToCreate.push({
            productId,
            batchId: batch.id,
            quantity: allocatedFromBatch,
            price: product.price
          });

          // Stock Log
          stockLogsToCreate.push({
            batchId: batch.id,
            productId,
            type: 'STOCK_OUT',
            quantity: -allocatedFromBatch,
            notes: `Allocated for Order ${orderNumber}`,
            userId: req.user.id
          });

          totalAmount += allocatedFromBatch * product.price;
          remainingToAllocate -= allocatedFromBatch;
        }
      }

      // 3. Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: 'CONFIRMED',
          totalAmount,
          items: {
            create: orderItemsToCreate
          }
        },
        include: {
          items: true
        }
      });

      // 4. Create Stock Logs
      for (const log of stockLogsToCreate) {
        await tx.stockLog.create({ data: log });
      }

      return order;
    });

    // Post-Transaction: Check for low-stock products and fire simulated notifications
    for (const item of items) {
      const { productId } = item;
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          batches: { where: { status: 'ACTIVE' } }
        }
      });

      const totalStock = product.batches.reduce((sum, b) => sum + b.currentStock, 0);
      if (totalStock <= product.thresholdStock) {
        const msg = `Low stock alert! '${product.name}' is currently at ${totalStock} units, which is below the threshold of ${product.thresholdStock}.`;
        await prisma.notification.create({
          data: {
            type: 'LOW_STOCK',
            message: msg,
            channel: 'EMAIL',
            status: 'PENDING'
          }
        });
        console.log(`[Simulated Low Stock Notification Sent]: ${msg}`);
      }
    }

    // Write audit log
    await logAction(req.user.id, 'CREATE_ORDER', 'Order', result.id, null, result);

    res.status(201).json({ message: 'Order created successfully', order: result });
  } catch (error) {
    console.error('Order Checkout Error:', error);
    res.status(400).json({ error: error.message || 'Checkout failed due to system error.' });
  }
};

// Update Order Status (including Cancel & stock restoration)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const oldOrder = await tx.order.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!oldOrder) {
        throw new Error('Order not found');
      }

      // Check if order is already cancelled
      if (oldOrder.status === 'CANCELLED') {
        throw new Error('Cannot change status of an already cancelled order.');
      }

      // Handle Order Cancellation (Restoring Stock)
      if (status === 'CANCELLED') {
        for (const item of oldOrder.items) {
          const batch = await tx.batch.findUnique({ where: { id: item.batchId } });
          if (batch) {
            // Restore batch stock
            const newStock = batch.currentStock + item.quantity;
            await tx.batch.update({
              where: { id: batch.id },
              data: {
                currentStock: newStock,
                status: batch.status === 'EXHAUSTED' ? 'ACTIVE' : batch.status
              }
            });

            // Log Stock Restoration
            await tx.stockLog.create({
              data: {
                batchId: batch.id,
                productId: item.productId,
                type: 'STOCK_IN',
                quantity: item.quantity,
                notes: `Stock restored from cancelled Order ${oldOrder.orderNumber}`,
                userId: req.user.id
              }
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status },
        include: { customer: true }
      });

      // Write Notification
      const msg = `Order ${updated.orderNumber} status changed to ${status}.`;
      await tx.notification.create({
        data: {
          type: 'ORDER_UPDATE',
          message: msg,
          channel: 'SMS',
          status: 'PENDING'
        }
      });

      return { oldOrder, updated };
    });

    await logAction(req.user.id, 'UPDATE_ORDER_STATUS', 'Order', id, result.oldOrder, result.updated);

    res.status(200).json(result.updated);
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(400).json({ error: error.message || 'Failed to update order status' });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
