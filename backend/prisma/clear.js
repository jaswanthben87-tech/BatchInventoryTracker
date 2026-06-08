const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database to empty state...');

  // Delete all transactional and operational data
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

  console.log('Cleared all tables.');

  // Re-create the standard system users so we can log in
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

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  console.log('User accounts re-initialized successfully.');
  console.log('Database is now empty of all products, batches, and orders.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
