const prisma = require('../db');

// Fetch Dashboard Metrics (Executive KPIs)
const getDashboardMetrics = async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    
    // Count active batches (ACTIVE status and stock > 0)
    const totalActiveBatches = await prisma.batch.count({
      where: { status: 'ACTIVE', currentStock: { gt: 0 } }
    });

    // Calculate inventory value: sum(batch.currentStock * product.price)
    const batches = await prisma.batch.findMany({
      where: { currentStock: { gt: 0 } },
      include: { product: true }
    });
    const totalInventoryValue = batches.reduce((sum, b) => sum + (b.currentStock * b.product.price), 0);

    // Active orders (processing, packed, dispatched, etc.)
    const activeOrders = await prisma.order.count({
      where: {
        status: { in: ['CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED'] }
      }
    });

    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    });

    // Total sales revenue from non-cancelled orders
    const completedOrders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' }
      }
    });
    const revenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Low stock product count (where total active stock <= thresholdStock)
    const products = await prisma.product.findMany({
      include: { batches: { where: { status: 'ACTIVE' } } }
    });
    let lowStockCount = 0;
    products.forEach(p => {
      const stock = p.batches.reduce((sum, b) => sum + b.currentStock, 0);
      if (stock <= p.thresholdStock) lowStockCount++;
    });

    // Near Expiry alerts (expiring within 30 days, status active, stock > 0)
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const nearExpiryCount = await prisma.batch.count({
      where: {
        status: 'ACTIVE',
        currentStock: { gt: 0 },
        expiryDate: {
          gt: now,
          lte: thirtyDaysLater
        }
      }
    });

    // Expired batches with remaining stock
    const expiredCount = await prisma.batch.count({
      where: {
        status: 'EXPIRED',
        currentStock: { gt: 0 }
      }
    });

    // Customer count
    const totalCustomers = await prisma.customer.count();

    // Sales charts (Revenue grouped by day, last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: fourteenDaysAgo },
        status: { not: 'CANCELLED' }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Map recent orders into date labels
    const salesTimeline = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      salesTimeline[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    recentOrders.forEach(o => {
      const dateStr = o.createdAt.toISOString().split('T')[0];
      if (salesTimeline[dateStr]) {
        salesTimeline[dateStr].revenue += o.totalAmount;
        salesTimeline[dateStr].orders += 1;
      }
    });

    const chartData = Object.values(salesTimeline).reverse();

    // Top Selling Products
    const orderItems = await prisma.orderItem.findMany({
      where: { order: { status: { not: 'CANCELLED' } } },
      include: { product: true }
    });

    const productSales = {};
    orderItems.forEach(item => {
      const sku = item.product.sku;
      if (!productSales[sku]) {
        productSales[sku] = { name: item.product.name, quantity: 0, sales: 0 };
      }
      productSales[sku].quantity += item.quantity;
      productSales[sku].sales += item.quantity * item.price;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.status(200).json({
      summary: {
        totalProducts,
        totalActiveBatches,
        totalInventoryValue,
        activeOrders,
        pendingOrders,
        revenue,
        lowStockCount,
        nearExpiryCount,
        expiredCount,
        totalCustomers
      },
      chartData,
      topProducts
    });
  } catch (error) {
    console.error('Fetch Dashboard Metrics Error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard metrics' });
  }
};

// Fetch Advanced Expiry / Wastage Report (including financial loss)
const getWastageReport = async (req, res) => {
  try {
    const expiredBatches = await prisma.batch.findMany({
      where: { status: 'EXPIRED' },
      include: { product: true }
    });

    const wastageDetails = expiredBatches.map(b => {
      const financialLoss = b.currentStock * b.product.price;
      return {
        batchId: b.id,
        productName: b.product.name,
        expiredStock: b.currentStock,
        price: b.product.price,
        financialLoss,
        expiryDate: b.expiryDate
      };
    });

    const totalLoss = wastageDetails.reduce((sum, w) => sum + w.financialLoss, 0);
    const totalWastedQuantity = wastageDetails.reduce((sum, w) => sum + w.expiredStock, 0);

    res.status(200).json({
      totalWastedQuantity,
      totalLoss,
      wastageDetails
    });
  } catch (error) {
    res.status(500).json({ error: 'Wastage report generation failed' });
  }
};

// AI Intelligence Layer (Predictive Algorithms)
const getAIInsights = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        batches: true,
        orderItems: {
          include: { order: true }
        }
      }
    });

    const now = new Date();
    const insights = {
      demandForecast: [],
      expiryRisk: [],
      promoRecommendations: []
    };

    // Calculate date ranges for sales velocity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const prod of products) {
      // 1. Calculate sales velocity: total units sold in the last 30 days
      const last30DaysSales = prod.orderItems
        .filter(item => item.order.status !== 'CANCELLED' && new Date(item.order.createdAt) >= thirtyDaysAgo)
        .reduce((sum, item) => sum + item.quantity, 0);

      const dailyVelocity = last30DaysSales / 30; // units per day
      const projected30DayDemand = Math.max(Math.ceil(dailyVelocity * 30), 10); // Floor forecast to at least 10 units for safety

      // Current total active stock
      const activeStock = prod.batches
        .filter(b => b.status === 'ACTIVE')
        .reduce((sum, b) => sum + b.currentStock, 0);

      // 2. Demand Forecasting & Replenishment
      const shortFall = projected30DayDemand - activeStock;
      const requiresReplenishment = shortFall > 0;
      
      insights.demandForecast.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        currentStock: activeStock,
        salesLastMonth: last30DaysSales,
        projected30DayDemand,
        requiresReplenishment,
        recommendedBatchQty: requiresReplenishment ? shortFall + prod.thresholdStock : 0
      });

      // 3. Expiry Risk Prediction for active batches
      const activeProductBatches = prod.batches.filter(b => b.status === 'ACTIVE' && b.currentStock > 0);

      for (const batch of activeProductBatches) {
        const daysToExpiry = Math.ceil((new Date(batch.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysToExpiry <= 0) continue; // Skip already expired

        // Run math: how long will current stock last at current sales velocity?
        let riskLevel = 'LOW';
        let riskFactor = 0; // expected waste percentage

        if (dailyVelocity === 0) {
          // No sales velocity at all - extreme risk of expiring if shelf life is short
          riskLevel = daysToExpiry < 30 ? 'HIGH' : 'MEDIUM';
          riskFactor = 1.0;
        } else {
          const daysStockWillLast = batch.currentStock / dailyVelocity;
          const excessDays = daysStockWillLast - daysToExpiry;

          if (excessDays > 0) {
            riskLevel = daysToExpiry < 15 ? 'HIGH' : 'MEDIUM';
            // Estimate wastage: velocity * excessDays
            riskFactor = Math.min((excessDays / daysStockWillLast), 1.0);
          }
        }

        const potentialWastedQty = Math.ceil(batch.currentStock * riskFactor);
        const financialLossRisk = potentialWastedQty * prod.price;

        if (riskLevel === 'HIGH' || riskLevel === 'MEDIUM') {
          insights.expiryRisk.push({
            batchId: batch.id,
            productName: prod.name,
            currentStock: batch.currentStock,
            daysToExpiry,
            riskLevel,
            potentialWastedQty,
            financialLossRisk
          });

          // 4. Promo recommendations for High/Medium risk batches
          if (daysToExpiry <= 20) {
            insights.promoRecommendations.push({
              batchId: batch.id,
              productName: prod.name,
              currentStock: batch.currentStock,
              daysToExpiry,
              suggestedAction: daysToExpiry <= 7 
                ? 'Bundle Offer: Buy 1 Get 1 Free' 
                : 'Flash Sale: 20% discount coupon for repeat customers',
              reason: `Batch ${batch.id} expires in ${daysToExpiry} days with ${batch.currentStock} units remaining.`
            });
          }
        }
      }
    }

    res.status(200).json(insights);
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ error: 'Failed to generate AI insights' });
  }
};

module.exports = {
  getDashboardMetrics,
  getWastageReport,
  getAIInsights
};
