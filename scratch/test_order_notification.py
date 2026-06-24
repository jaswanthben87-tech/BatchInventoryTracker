import requests
import json

base_url = "http://127.0.0.1:5002"

try:
    print("Fetching products to find a valid product configuration...")
    p_res = requests.get(f"{base_url}/api/products")
    if not p_res.ok:
        print(f"Failed to fetch products: {p_res.text}")
        exit(1)
        
    products = p_res.json()
    if not products:
        print("No products found in database.")
        exit(1)
        
    # Choose the first product and its first price configuration
    prod = products[0]
    prices = prod.get('prices', [])
    if not prices:
        print(f"Product {prod['name']} has no prices.")
        exit(1)
        
    price = prices[0]
    product_id = prod['product_id']
    price_id = price['price_id']
    
    print(f"Using Product: {prod['name']} (ID: {product_id}), Price Configuration: {price['quantity_description']} @ Rs. {price['price']} (ID: {price_id})")
    
    # Place a COD order
    order_payload = {
        "customer_id": 1,
        "name": "Jane Doe",
        "contact": "janedoe@example.com",
        "message": "123 Elm Street",
        "payment_method": "COD",
        "purchase_type": "standard",
        "items": [
            {
                "product_id": product_id,
                "price_id": price_id,
                "quantity": 1
            }
        ]
    }
    
    print("Placing order via /api/orders/process...")
    o_res = requests.post(f"{base_url}/api/orders/process", json=order_payload)
    if not o_res.ok:
        print(f"Failed to place order: {o_res.text}")
        exit(1)
        
    order_data = o_res.json()
    print(f"Order placed successfully! Order ID: {order_data['order_id']}")
    
    # Check if notification was created
    print("Fetching admin notifications from /api/admin/notifications...")
    n_res = requests.get(f"{base_url}/api/admin/notifications")
    if not n_res.ok:
        print(f"Failed to fetch admin notifications: {n_res.text}")
        exit(1)
        
    notifications = n_res.json()
    print(f"Retrieved {len(notifications)} notifications. Recent notifications:")
    
    found = False
    for n in notifications:
        print(n)
        if n['order_id'] == order_data['order_id']:
            print(f"\nSUCCESS: Persistent notification found for Order #{n['order_id']}!")
            print(f"Customer Name: {n['customer_name']}")
            print(f"Order Amount: Rs. {n['total_amount']}")
            print(f"Order Date: {n['order_date']}")
            print(f"Is Read status: {n['is_read']}")
            found = True
            break
            
    if not found:
        print("\nFAILURE: Notification for the newly placed order was not found.")
        
except Exception as e:
    print(f"Error during test: {e}")
