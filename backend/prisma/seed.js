const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.stockLog.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.batch.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data.');

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const managerPassword = await bcrypt.hash('manager123', salt);
  const staffPassword = await bcrypt.hash('staff123', salt);

  const users = [
    { name: 'Super Admin User', email: 'superadmin@sharadhastores.com', passwordHash: adminPassword, role: 'SUPER_ADMIN' },
    { name: 'Sharadha Admin', email: 'admin@sharadhastores.com', passwordHash: adminPassword, role: 'ADMIN' },
    { name: 'Inventory Manager', email: 'inv@sharadhastores.com', passwordHash: managerPassword, role: 'INVENTORY_MANAGER' },
    { name: 'Production Manager', email: 'prod@sharadhastores.com', passwordHash: managerPassword, role: 'PRODUCTION_MANAGER' },
    { name: 'Dispatch Staff', email: 'dispatch@sharadhastores.com', passwordHash: staffPassword, role: 'DISPATCH_TEAM' },
    { name: 'Customer Support', email: 'support@sharadhastores.com', passwordHash: staffPassword, role: 'CUSTOMER_SUPPORT' },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.create({ data: u });
    createdUsers.push(user);
  }
  console.log(`Created ${createdUsers.length} users.`);

  // 3. Create Categories
  const categoriesData = [
    { name: 'Savories', description: 'Crispy and salty snacks' },
    { name: 'Sweets', description: 'Traditional homemade sweets' },
    { name: 'Pickles', description: 'Spicy and tangy homemade pickles' },
    { name: 'Podis & Masalas', description: 'Freshly ground spice powders' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.name] = created;
  }
  console.log('Created categories.');

  // 4. Create Products
  const productsData = [
    { name: 'Special Rice Murukku', sku: 'MRK-RCE', description: 'Crispy special rice flour murukku', price: 120.0, shelfLifeDays: 45, thresholdStock: 50, categoryId: categories['Savories'].id },
    { name: 'Traditional Adhirasam', sku: 'ADR-TRD', description: 'Sweet jaggery and rice flour deep fried pastry', price: 150.0, shelfLifeDays: 15, thresholdStock: 30, categoryId: categories['Sweets'].id },
    { name: 'Spicy Mango Pickle', sku: 'PKL-MGO', description: 'Spicy homemade mango pickle in sesame oil', price: 90.0, shelfLifeDays: 180, thresholdStock: 20, categoryId: categories['Pickles'].id },
    { name: 'Idli Milagai Podi', sku: 'PDI-IDL', description: 'Flavorful lentil and dry chili powder for idli/dosa', price: 110.0, shelfLifeDays: 90, thresholdStock: 25, categoryId: categories['Podis & Masalas'].id },
    { name: 'Butter Seedai', sku: 'SDI-BTR', description: 'Crunchy butter balls snack', price: 130.0, shelfLifeDays: 40, thresholdStock: 40, categoryId: categories['Savories'].id },
    { name: 'Ladoo Special', sku: 'LDO-SPL', description: 'Delicious traditional besan ladoos with ghee', price: 160.0, shelfLifeDays: 20, thresholdStock: 35, categoryId: categories['Sweets'].id },
  ];

  const products = {};
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    products[prod.sku] = created;
  }
  console.log('Created products.');

  // 5. Create Batches
  const now = new Date();
  
  // Helper to add/subtract days
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const batchesData = [
    // 1. Special Rice Murukku (shelfLifeDays: 45)
    // Active batch
    {
      id: 'MRK-RCE-20260601-01',
      productId: products['MRK-RCE'].id,
      mfgDate: new Date('2026-06-01T00:00:00Z'),
      expiryDate: addDays(new Date('2026-06-01T00:00:00Z'), 45),
      quantityProduced: 100,
      packagingCount: 10,
      currentStock: 85,
      status: 'ACTIVE',
    },
    // Near expiry batch (expires in 5 days)
    {
      id: 'MRK-RCE-20260429-01',
      productId: products['MRK-RCE'].id,
      mfgDate: new Date('2026-04-29T00:00:00Z'),
      expiryDate: addDays(new Date('2026-04-29T00:00:00Z'), 45), // Expires 2026-06-13 (which is in 5 days since now is June 8, 2026)
      quantityProduced: 80,
      packagingCount: 8,
      currentStock: 12,
      status: 'ACTIVE',
    },
    // Expired batch
    {
      id: 'MRK-RCE-20260401-01',
      productId: products['MRK-RCE'].id,
      mfgDate: new Date('2026-04-01T00:00:00Z'),
      expiryDate: addDays(new Date('2026-04-01T00:00:00Z'), 45), // Expired 2026-05-16
      quantityProduced: 120,
      packagingCount: 12,
      currentStock: 15,
      status: 'EXPIRED',
    },

    // 2. Traditional Adhirasam (shelfLifeDays: 15)
    // Active batch
    {
      id: 'ADR-TRD-20260605-01',
      productId: products['ADR-TRD'].id,
      mfgDate: new Date('2026-06-05T00:00:00Z'),
      expiryDate: addDays(new Date('2026-06-05T00:00:00Z'), 15), // Expires June 20
      quantityProduced: 60,
      packagingCount: 6,
      currentStock: 48,
      status: 'ACTIVE',
    },
    // Near expiry batch (expires in 1 day)
    {
      id: 'ADR-TRD-20260525-01',
      productId: products['ADR-TRD'].id,
      mfgDate: new Date('2026-05-25T00:00:00Z'),
      expiryDate: addDays(new Date('2026-05-25T00:00:00Z'), 15), // Expired/expires June 9
      quantityProduced: 50,
      packagingCount: 5,
      currentStock: 5,
      status: 'ACTIVE',
    },

    // 3. Spicy Mango Pickle (shelfLifeDays: 180)
    // Active batch
    {
      id: 'PKL-MGO-20260501-01',
      productId: products['PKL-MGO'].id,
      mfgDate: new Date('2026-05-01T00:00:00Z'),
      expiryDate: addDays(new Date('2026-05-01T00:00:00Z'), 180), // Expires Oct 28
      quantityProduced: 150,
      packagingCount: 15,
      currentStock: 140,
      status: 'ACTIVE',
    },

    // 4. Idli Milagai Podi (shelfLifeDays: 90)
    // Low stock product overall (total stock: 10, threshold: 25)
    {
      id: 'PDI-IDL-20260410-01',
      productId: products['PDI-IDL'].id,
      mfgDate: new Date('2026-04-10T00:00:00Z'),
      expiryDate: addDays(new Date('2026-04-10T00:00:00Z'), 90), // Expires July 9
      quantityProduced: 50,
      packagingCount: 5,
      currentStock: 10,
      status: 'ACTIVE',
    },
  ];

  for (const b of batchesData) {
    await prisma.batch.create({ data: b });
  }
  console.log('Created batches.');

  // 6. Create Customers
  const customersData = [
    { name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@example.com', address: 'No 12, Main Street, Chennai, TN' },
    { name: 'Priya Sundar', phone: '9123456789', email: 'priya@example.com', address: 'Apartment 4B, Green Glen Layout, Bangalore, KA' },
    { name: 'Karthik Raja', phone: '9988776655', email: 'karthik@example.com', address: 'Plot 45, VOC Nagar, Coimbatore, TN' },
  ];

  const customers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    customers.push(cust);
  }
  console.log('Created customers.');

  // 7. Create Orders & Order Items
  // Order 1: Ramesh, completed
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'SS-20260602-01',
      customerId: customers[0].id,
      status: 'DELIVERED',
      totalAmount: 12 * 120.0 + 12 * 150.0, // 12 murukku, 12 adhirasam
      createdAt: new Date('2026-06-02T11:00:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: products['MRK-RCE'].id,
      batchId: 'MRK-RCE-20260601-01',
      quantity: 12,
      price: 120.0,
      createdAt: new Date('2026-06-02T11:00:00Z'),
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: products['ADR-TRD'].id,
      batchId: 'ADR-TRD-20260605-01',
      quantity: 12,
      price: 150.0,
      createdAt: new Date('2026-06-02T11:00:00Z'),
    },
  });

  // Order 2: Priya, pending
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'SS-20260608-01',
      customerId: customers[1].id,
      status: 'PENDING',
      totalAmount: 3 * 120.0 + 10 * 90.0, // 3 murukku, 10 mango pickles
      createdAt: new Date('2026-06-08T08:30:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products['MRK-RCE'].id,
      batchId: 'MRK-RCE-20260601-01',
      quantity: 3,
      price: 120.0,
      createdAt: new Date('2026-06-08T08:30:00Z'),
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products['PKL-MGO'].id,
      batchId: 'PKL-MGO-20260501-01',
      quantity: 10,
      price: 90.0,
      createdAt: new Date('2026-06-08T08:30:00Z'),
    },
  });

  console.log('Created orders and line items.');

  // 8. Create Stock Logs
  const inventoryStaff = createdUsers.find(u => u.role === 'INVENTORY_MANAGER');
  await prisma.stockLog.create({
    data: {
      batchId: 'MRK-RCE-20260601-01',
      productId: products['MRK-RCE'].id,
      type: 'STOCK_IN',
      quantity: 100,
      notes: 'Initial production run',
      userId: inventoryStaff.id,
      createdAt: new Date('2026-06-01T08:00:00Z'),
    },
  });
  await prisma.stockLog.create({
    data: {
      batchId: 'MRK-RCE-20260601-01',
      productId: products['MRK-RCE'].id,
      type: 'STOCK_OUT',
      quantity: -12,
      notes: 'Allocated for Order SS-20260602-01',
      userId: inventoryStaff.id,
      createdAt: new Date('2026-06-02T11:00:00Z'),
    },
  });
  await prisma.stockLog.create({
    data: {
      batchId: 'MRK-RCE-20260601-01',
      productId: products['MRK-RCE'].id,
      type: 'STOCK_OUT',
      quantity: -3,
      notes: 'Allocated for Order SS-20260608-01',
      userId: inventoryStaff.id,
      createdAt: new Date('2026-06-08T08:30:00Z'),
    },
  });
  console.log('Created stock logs.');

  // 9. Create Notifications
  const notificationsData = [
    { type: 'LOW_STOCK', message: 'Product Idli Milagai Podi stock (10) has fallen below threshold of 25.', channel: 'EMAIL', status: 'PENDING' },
    { type: 'NEAR_EXPIRY', message: 'Batch ADR-TRD-20260525-01 (Traditional Adhirasam) is expiring tomorrow! Remaining stock: 5.', channel: 'WHATSAPP', status: 'SENT' },
    { type: 'ORDER_UPDATE', message: 'Order SS-20260602-01 has been marked as DELIVERED.', channel: 'SMS', status: 'SENT' },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }
  console.log('Created notifications.');

  // 10. Create Audit Logs
  const adminUser = createdUsers.find(u => u.role === 'ADMIN');
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'CREATE_PRODUCT',
      entity: 'Product',
      entityId: products['MRK-RCE'].id,
      newValue: JSON.stringify(products['MRK-RCE']),
      createdAt: new Date('2026-06-01T07:30:00Z'),
    },
  });

  console.log('Created audit logs.');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
