const request = require('supertest');
const express = require('express');
const cors = require('cors');
const prisma = require('../src/db');

// Set up a mock Express app for testing routes
const app = express();
app.use(express.json());

// Routes
const authRoutes = require('../src/routes/authRoutes');
const productRoutes = require('../src/routes/productRoutes');
const batchRoutes = require('../src/routes/batchRoutes');
const orderRoutes = require('../src/routes/orderRoutes');
const customerRoutes = require('../src/routes/customerRoutes');
const analyticsRoutes = require('../src/routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);

describe('Sharadha Stores API Tests', () => {
  let token = '';

  beforeAll(async () => {
    // Make sure we have the seeded users and database synced
    const user = await prisma.user.findFirst({
      where: { email: 'admin@sharadhastores.com' }
    });

    if (user) {
      // Authenticate directly to get token
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@sharadhastores.com',
          password: 'admin123'
        });
      token = res.body.token;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET / health-check or auth routes', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@sharadhastores.com',
        password: 'admin123'
      });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('GET /api/products returns products list', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/analytics/dashboard returns executive KPIs', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.summary).toHaveProperty('totalProducts');
    expect(res.body.summary).toHaveProperty('revenue');
  });

  test('GET /api/analytics/ai-insights returns demand forecast and risks', async () => {
    const res = await request(app)
      .get('/api/analytics/ai-insights')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('demandForecast');
    expect(res.body).toHaveProperty('expiryRisk');
  });
});
