# API Documentation

The Sharadha Stores Centralized Platform exposes a RESTful JSON API. All routes (except auth) require a `Bearer <token>` JWT header.

---

## 1. Authentication & Authorization

### `POST /api/auth/register`
Creates a new user profile. (Admin/Super Admin only once set up, or initial user setup).
* **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@sharadhastores.com",
    "password": "SecurePassword123",
    "role": "INVENTORY_MANAGER"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@sharadhastores.com", "role": "INVENTORY_MANAGER" }
  }
  ```

### `POST /api/auth/login`
Logs in a user and returns a access token.
* **Body**:
  ```json
  {
    "email": "jane@sharadhastores.com",
    "password": "SecurePassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@sharadhastores.com", "role": "INVENTORY_MANAGER" }
  }
  ```

---

## 2. Product Management

### `GET /api/products`
Retrieves all products.
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "name": "Murukku Special",
      "sku": "MRK-SPL",
      "description": "Crispy homemade rice murukku",
      "price": 120.00,
      "shelfLifeDays": 45,
      "thresholdStock": 50,
      "imageUrl": "https://res.cloudinary.com/...",
      "category": { "name": "Savories" }
    }
  ]
  ```

### `POST /api/products`
Creates a new product (Admin, Super Admin, Inventory Manager).
* **Body**:
  ```json
  {
    "name": "Murukku Special",
    "sku": "MRK-SPL",
    "description": "Crispy homemade rice murukku",
    "price": 120.00,
    "shelfLifeDays": 45,
    "thresholdStock": 50,
    "categoryId": "uuid"
  }
  ```

---

## 3. Batch Inventory Management

### `POST /api/batches`
Records a newly manufactured batch (Admin, Production Manager).
* **Body**:
  ```json
  {
    "productId": "uuid",
    "mfgDate": "2026-06-08T00:00:00Z",
    "quantityProduced": 100,
    "packagingCount": 100
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Batch created successfully",
    "batch": {
      "id": "MRK-SPL-20260608-01",
      "productId": "uuid",
      "mfgDate": "2026-06-08T00:00:00Z",
      "expiryDate": "2026-07-23T00:00:00Z",
      "quantityProduced": 100,
      "currentStock": 100,
      "status": "ACTIVE"
    }
  }
  ```

---

## 4. Order Management (FEFO Auto-Deduction)

### `POST /api/orders`
Creates and confirms a customer order, automatically allocating stock using FEFO logic.
* **Body**:
  ```json
  {
    "customerPhone": "9876543210",
    "customerName": "Ramesh Kumar",
    "customerEmail": "ramesh@example.com",
    "customerAddress": "No 12, Main Street, Chennai",
    "items": [
      {
        "productId": "uuid",
        "quantity": 15
      }
    ]
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Order placed successfully",
    "order": {
      "id": "uuid",
      "orderNumber": "SS-20260608-01",
      "status": "CONFIRMED",
      "totalAmount": 1800.00,
      "items": [
        {
          "productId": "uuid",
          "batchId": "MRK-SPL-20260608-01",
          "quantity": 15,
          "price": 120.00
        }
      ]
    }
  }
  ```

### `PATCH /api/orders/:id/status`
Updates order state (Dispatch Team, Customer Support, Admin).
* **Body**:
  ```json
  {
    "status": "DISPATCHED"
  }
  ```

---

## 5. Expiry & Wastage Tracking

### `GET /api/batches/expiry-status`
Returns expired and near-expiry batches.
* **Response (200 OK)**:
  ```json
  {
    "expired": [
      { "id": "MRK-SPL-20260401-01", "product": "Murukku Special", "expiryDate": "2026-05-16", "currentStock": 5 }
    ],
    "nearExpiry30": [
      { "id": "MRK-SPL-20260515-01", "product": "Murukku Special", "expiryDate": "2026-06-29", "currentStock": 45 }
    ]
  }
  ```

---

## 6. AI Intelligence & Analytics

### `GET /api/analytics/dashboard`
Fetches high-level executive KPIs.
* **Response (200 OK)**:
  ```json
  {
    "totalProducts": 14,
    "totalActiveBatches": 28,
    "totalInventoryValue": 84320.00,
    "activeOrders": 5,
    "revenue": 145000.00,
    "lowStockCount": 3,
    "nearExpiryCount": 4,
    "expiredCount": 1
  }
  ```

### `GET /api/analytics/ai-insights`
Calculates AI mathematical demand forecasts and wastage predictions.
* **Response (200 OK)**:
  ```json
  {
    "forecast": [
      { "productId": "uuid", "productName": "Murukku Special", "nextMonthForecast": 125, "recommendedProduction": 45 }
    ],
    "expiryRisk": [
      { "batchId": "MRK-SPL-20260515-01", "productName": "Murukku Special", "riskLevel": "MEDIUM", "potentialWastageQuantity": 15 }
    ]
  }
  ```

---

## 7. Audit Trail

### `GET /api/audit-logs`
Queries chronological change tracking logs. (Admin, Super Admin only).
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "user": { "name": "Jane Doe", "email": "jane@sharadhastores.com" },
      "action": "UPDATE_BATCH_STOCK",
      "entity": "Batch",
      "entityId": "MRK-SPL-20260515-01",
      "previousValue": "{\"currentStock\": 20}",
      "newValue": "{\"currentStock\": 15}",
      "createdAt": "2026-06-08T09:45:00Z"
    }
  ]
  ```
