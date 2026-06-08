import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, Search, User, Phone, MapPin, Trash2, Check, X, RefreshCw, Eye } from 'lucide-react';
import api from '../api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // checkout Panel states
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [cartItems, setCartItems] = useState([]); // [{productId, name, price, quantity, availableStock}]
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductQty, setSelectedProductQty] = useState('1');
  
  const [allocationPreview, setAllocationPreview] = useState([]); // FEFO preview descriptions
  const [checkoutError, setCheckoutError] = useState('');

  // View Details State
  const [activeDetailsOrder, setActiveDetailsOrder] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products')
      ]);
      setOrders(orderRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Customer Autocomplete by Phone
  const handlePhoneBlur = async () => {
    if (customerPhone.length >= 10) {
      try {
        const res = await api.get(`/customers/phone?phone=${customerPhone}`);
        if (res.data) {
          setCustomerName(res.data.name);
          setCustomerEmail(res.data.email || '');
          setCustomerAddress(res.data.address || '');
        }
      } catch (err) {
        // Customer not found, let user type details manually
      }
    }
  };

  const addToCart = () => {
    if (!selectedProductId) return;
    
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const qty = parseInt(selectedProductQty);
    if (isNaN(qty) || qty <= 0) return;

    // Check if product is already in cart
    const existingIndex = cartItems.findIndex(item => item.productId === selectedProductId);
    
    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += qty;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, {
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: qty,
        availableStock: prod.totalStock
      }]);
    }

    setSelectedProductId('');
    setSelectedProductQty('1');
  };

  const removeFromCart = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
  };

  // Generate FEFO Allocation Preview based on active batches locally
  useEffect(() => {
    const calculateFEFOPreview = async () => {
      if (cartItems.length === 0) {
        setAllocationPreview([]);
        return;
      }

      try {
        const batchRes = await api.get('/batches');
        const allBatches = batchRes.data;

        const previews = [];

        cartItems.forEach(item => {
          // Find batches for this product with status ACTIVE and stock > 0
          const prodBatches = allBatches
            .filter(b => b.productId === item.productId && b.status === 'ACTIVE' && b.currentStock > 0)
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

          let remaining = item.quantity;
          const allocations = [];

          for (const b of prodBatches) {
            if (remaining <= 0) break;
            const allocated = Math.min(b.currentStock, remaining);
            allocations.push(`* Allocate ${allocated} units from Batch ${b.id} (Expires: ${new Date(b.expiryDate).toLocaleDateString('en-IN')})`);
            remaining -= allocated;
          }

          if (remaining > 0) {
            allocations.push(`* [ALERT] Insufficient stock! Short by ${remaining} units.`);
          }

          previews.push({
            productName: item.name,
            allocations
          });
        });

        setAllocationPreview(previews);
      } catch (err) {
        console.error('Failed to compute allocation preview:', err);
      }
    };

    calculateFEFOPreview();
  }, [cartItems]);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    const itemsPayload = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    try {
      await api.post('/orders', {
        customerPhone,
        customerName,
        customerEmail,
        customerAddress,
        items: itemsPayload
      });
      
      // Reset states
      setCartItems([]);
      setCustomerPhone('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerAddress('');
      setShowCheckout(false);
      loadData();
    } catch (err) {
      setCheckoutError(err.response?.data?.error || 'Checkout failed');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-600';
      case 'CONFIRMED': return 'bg-indigo-50 text-indigo-600';
      case 'PROCESSING': return 'bg-blue-50 text-blue-600';
      case 'PACKED': return 'bg-purple-50 text-purple-600';
      case 'DISPATCHED': return 'bg-orange-50 text-orange-600';
      case 'DELIVERED': return 'bg-emerald-50 text-emerald-600';
      case 'CANCELLED': return 'bg-red-50 text-red-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Fulfillment Center</h1>
          <p className="text-slate-500 text-sm mt-1">Manage order lifecycles, checkout customer packages, and configure delivery tracking.</p>
        </div>

        <button
          onClick={() => {
            setCartItems([]);
            setCheckoutError('');
            setShowCheckout(true);
          }}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-bold shadow-lg shadow-amber-500/10 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Orders Directory Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <ShoppingCart className="w-12 h-12 text-slate-200" />
          <h3 className="font-bold text-slate-700">No Orders Placed</h3>
          <p className="text-xs">Create customer orders to trigger stock auto-deduction engines.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Order Code</th>
                  <th className="px-6 py-4">Customer Details</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors duration-150 text-slate-700">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{o.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{o.customer?.name}</span>
                        <span className="text-xs text-slate-400 font-mono mt-0.5">{o.customer?.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-6 py-4 font-bold">₹{o.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={o.status}
                        disabled={o.status === 'CANCELLED' || o.status === 'DELIVERED'}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`py-1 px-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider outline-none border-0 cursor-pointer ${getStatusClass(o.status)}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="PACKED">Packed</option>
                        <option value="DISPATCHED">Dispatched</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setActiveDetailsOrder(o)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ml-auto flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CREATE ORDER / CHECKOUT PANEL MODAL --- */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-6 shadow-2xl animate-in scale-in duration-200 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[90vh] overflow-y-auto">
            
            {/* Left side: Cart and allocations */}
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">Checkout Cart</h3>
              
              {/* Product selector */}
              <div className="flex space-x-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="">Select Product to Add</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.totalStock === 0}>
                      {p.name} (Stock: {p.totalStock})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={selectedProductQty}
                  onChange={(e) => setSelectedProductQty(e.target.value)}
                  className="w-16 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all text-center"
                />

                <button
                  type="button"
                  onClick={addToCart}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 rounded-xl text-sm"
                >
                  Add
                </button>
              </div>

              {/* Cart List */}
              {cartItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                  Checkout Cart is empty.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((item, index) => (
                    <div key={item.productId} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono font-bold text-slate-600">Qty: {item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="p-1 rounded text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FEFO Allocation Preview */}
              {allocationPreview.length > 0 && (
                <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl space-y-2.5">
                  <h4 className="text-xs font-extrabold text-white flex items-center space-x-1.5 uppercase tracking-wider">
                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                    <span>FEFO Stock Allocation Engine</span>
                  </h4>
                  <div className="space-y-2 text-[10px] font-mono leading-relaxed">
                    {allocationPreview.map((item, idx) => (
                      <div key={idx} className="border-b border-slate-800/80 last:border-b-0 pb-1.5 last:pb-0">
                        <p className="font-bold text-amber-500">{item.productName}:</p>
                        <div className="mt-1 space-y-0.5 pl-2">
                          {item.allocations.map((alloc, aid) => {
                            const isErr = alloc.includes('[ALERT]');
                            return (
                              <p key={aid} className={isErr ? 'text-red-400 font-bold' : 'text-slate-400'}>{alloc}</p>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Customer checkout form */}
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 mb-4">Customer Details</h3>
              
              {checkoutError && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs py-2 px-3 rounded-xl mb-4 font-semibold">
                  {checkoutError}
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onBlur={handlePhoneBlur}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210 (Tab out to autocomplete)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Customer Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <textarea
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Enter full shipping address..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Total Price</p>
                    <p className="text-xl font-black text-slate-800">₹{cartTotal.toFixed(2)}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={cartItems.length === 0}
                      className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
                    >
                      Complete Checkout
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW ORDER DETAILS DIALOG --- */}
      {activeDetailsOrder && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl animate-in scale-in duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">Order details</h3>
              <button
                onClick={() => setActiveDetailsOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer summary */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Details</h4>
                <p className="text-sm font-bold text-slate-800">{activeDetailsOrder.customer?.name}</p>
                <p className="text-xs text-slate-500 font-mono">Phone: {activeDetailsOrder.customer?.phone}</p>
                {activeDetailsOrder.customer?.email && (
                  <p className="text-xs text-slate-500">Email: {activeDetailsOrder.customer?.email}</p>
                )}
                <p className="text-xs text-slate-500 leading-relaxed">Address: {activeDetailsOrder.customer?.address}</p>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchased Line Items</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {activeDetailsOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                      <div>
                        <p className="font-bold text-slate-800">{item.product?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Batch: {item.batchId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">{item.quantity} units</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                  <p className="text-lg font-black text-slate-800">₹{activeDetailsOrder.totalAmount.toFixed(2)}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                  <span className={`inline-block py-1 px-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider mt-1 ${getStatusClass(activeDetailsOrder.status)}`}>
                    {activeDetailsOrder.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
