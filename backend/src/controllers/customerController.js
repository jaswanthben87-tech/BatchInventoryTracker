const prisma = require('../db');

// Get all customers with basic statistics (order counts)
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    });

    const customersWithStats = customers.map(c => {
      const orderCount = c.orders.length;
      const totalSpend = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrderDate = orderCount > 0 
        ? c.orders.reduce((max, o) => o.createdAt > max ? o.createdAt : max, c.orders[0].createdAt)
        : null;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        orderCount,
        totalSpend,
        lastOrderDate,
        createdAt: c.createdAt
      };
    });

    res.status(200).json(customersWithStats);
  } catch (error) {
    console.error('Fetch Customers Error:', error);
    res.status(500).json({ error: 'Failed to retrieve customers' });
  }
};

// Get single customer details with order history
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve customer profile' });
  }
};

// Find customer by phone (used for quick checkout retrieval)
const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number parameter required' });
    }

    const customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Query failed' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  getCustomerByPhone
};
