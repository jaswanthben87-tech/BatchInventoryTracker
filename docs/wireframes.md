# User Interface Wireframes

This document details the visual layouts and UX structures for the primary platform interfaces.

---

## 1. Main Dashboard View
```
+----------------------------------------------------------------------------------------------------------------+
|  SHARADHA STORES ERP                                                    [Notifications (3)]  [User Role: Admin] |
+----------------------------------------------------------------------------------------------------------------+
|  [Sidebar]               |  EXECUTIVE KPIS                                                                    |
|  - Dashboard (Active)    |  +-------------------+ +-------------------+ +-------------------+ +--------------+ |
|  - Products Catalog      |  | Total Products: 14| | Active Batches: 28| | Pending Orders: 5 | | Revenue: $8K | |
|  - Batch Manager         |  +-------------------+ +-------------------+ +-------------------+ +--------------+ |
|  - Expiry / FEFO Monitor |                                                                                     |
|  - Order Fulfillment     |  INVENTORY CRITICAL ALERTS                                                          |
|  - CRM Customers         |  +--------------------------------------------------------------------------------+ |
|  - Reports & AI Forecast |  | [WARN] 3 Batches of "Murukku Special" expiring within 15 days! (Total 45 units)  | |
|  - System Audit Logs     |  | [LOW]  "Banana Chips Special" stock level is 12 (Threshold: 30)                  | |
|                          |  +--------------------------------------------------------------------------------+ |
|                          |                                                                                     |
|                          |  RECENT SALES TRENDS                                                                |
|                          |  +--------------------------------------------------------------------------------+ |
|                          |  |                                                                                | |
|                          |  |     [Line Chart: Revenue over Time / Daily Orders Trend]                       | |
|                          |  |                                                                                | |
|                          |  +--------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------------------+
```

---

## 2. Batch Production Logger Dialog
This screen is used by the Production Manager to record batch operations and auto-calculate expiry.
```
+------------------------------------------------------------------------------------+
|  MANUFACTURE NEW BATCH                                                            |
+------------------------------------------------------------------------------------+
|                                                                                    |
|  Product Name:        [ Select Product: Special Ribbon Pakoda (Shelf life: 30 days) v ] |
|                                                                                    |
|  Quantity Produced:   [ 150 ] packets                                              |
|                                                                                    |
|  Packaging Box Count: [ 15 ] boxes (10 packets/box)                                |
|                                                                                    |
|  Manufacturing Date:  [ 2026-06-08 ] (Default: Today)                              |
|                                                                                    |
|  Calculated Expiry:   [ 2026-07-08 ] (Auto-computed using product shelf life)      |
|                                                                                    |
|  Created Batch ID:    RPK-SPL-20260608-01 (Auto-generated format)                  |
|                                                                                    |
|  [ Cancel ]                                                  [ Save Production ]   |
+------------------------------------------------------------------------------------+
```

---

## 3. Order Checkout & FEFO Stock Allocation Interface
```
+------------------------------------------------------------------------------------+
|  CREATE NEW CUSTOMER ORDER                                                         |
+------------------------------------------------------------------------------------+
|                                                                                    |
|  CUSTOMER DETAILS                                                                  |
|  Phone: [ 9876543210 ] (Auto-fetches details for returning customer)               |
|  Name:  [ Ramesh Kumar      ]   Email: [ ramesh@example.com      ]                 |
|  Addr:  [ No 12, Main Street, Chennai                                             ] |
|                                                                                    |
|  ORDER ITEMS                                                                       |
|  +-----------------------------+--------------+-----------+----------------------+ |
|  | Product                     | Available    | Quantity  | Action               | |
|  +-----------------------------+--------------+-----------+----------------------+ |
|  | Murukku Special             | 145 packets  | [ 15 ]    | [ Remove ]           | |
|  | Butter Seedai Special       | 60 packets   | [ 20 ]    | [ Remove ]           | |
|  +-----------------------------+--------------+-----------+----------------------+ |
|  [ + Add Line Item ]                                                               |
|                                                                                    |
|  STOCK ALLOCATION DETAIL (FEFO Engine preview)                                      |
|  - "Murukku Special" will allocate:                                                |
|     * 10 units from Batch MRK-SPL-20260515-01 (Expires in 7 days)                  |
|     * 5 units from Batch MRK-SPL-20260601-01 (Expires in 23 days)                  |
|                                                                                    |
|  [ Cancel Order ]                                            [ Complete Checkout ] |
+------------------------------------------------------------------------------------+
```
