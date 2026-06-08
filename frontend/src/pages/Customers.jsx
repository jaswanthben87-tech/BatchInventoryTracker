import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, ShoppingBag, MapPin, Phone, Mail, Award } from 'lucide-react';
import api from '../api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCustomerDetails, setActiveCustomerDetails] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const viewCustomerProfile = async (id) => {
    try {
      const res = await api.get(`/customers/${id}`);
      setActiveCustomerDetails(res.data);
    } catch (err) {
      alert('Failed to load profile details');
    }
  };

  const filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.phone.includes(searchQuery);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer CRM</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor customer purchase histories, spending metrics, and contact information.</p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Customer Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <Users className="w-12 h-12 text-slate-200" />
          <h3 className="font-bold text-slate-700">No Customers Found</h3>
          <p className="text-xs font-medium">Customer profiles are automatically created when checkout orders are processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((c) => {
            const isVip = c.totalSpend > 2000;
            return (
              <div 
                key={c.id} 
                onClick={() => viewCustomerProfile(c.id)}
                className="glass-panel p-5 cursor-pointer hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md group relative overflow-hidden"
              >
                {isVip && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider py-1 px-3 rounded-bl-xl flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>VIP Customer</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-800 text-base group-hover:text-amber-600 transition-colors">
                    {c.name}
                  </h3>
                  <div className="space-y-1 text-slate-400 text-xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orders</p>
                    <p className="text-sm font-extrabold text-slate-700 mt-0.5">{c.orderCount}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Spend</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">₹{c.totalSpend.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- CUSTOMER PROFILE SLIDE-OVER DETAIL DIALOG --- */}
      {activeCustomerDetails && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-white h-screen w-full max-w-lg p-6 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col justify-between">
            <div className="space-y-6 overflow-y-auto flex-1 pb-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900">Customer Profile & History</h3>
                <button
                  onClick={() => setActiveCustomerDetails(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-3.5 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>

              {/* General customer details card */}
              <div className="bg-slate-900 text-slate-300 p-5 rounded-3xl space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
                <h4 className="font-extrabold text-white text-lg">{activeCustomerDetails.name}</h4>
                <div className="space-y-1.5 text-xs text-slate-400 font-semibold font-mono">
                  <p>Phone: {activeCustomerDetails.phone}</p>
                  {activeCustomerDetails.email && <p>Email: {activeCustomerDetails.email}</p>}
                  <p className="not-italic leading-relaxed font-sans text-slate-400">Address: {activeCustomerDetails.address}</p>
                </div>
              </div>

              {/* Purchase statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Purchase Value</p>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    ₹{activeCustomerDetails.orders?.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2) || 0}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orders Completed</p>
                  <p className="text-lg font-black text-slate-800 mt-1">
                    {activeCustomerDetails.orders?.length || 0}
                  </p>
                </div>
              </div>

              {/* Order items history list */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Chronological Purchase Logs</span>
                </h4>

                <div className="space-y-3">
                  {activeCustomerDetails.orders?.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No order history found.</p>
                  ) : (
                    activeCustomerDetails.orders?.map(order => (
                      <div key={order.id} className="border border-slate-100 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                          <span className="text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>

                        <div className="space-y-1">
                          {order.items?.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>{item.product?.name} x {item.quantity}</span>
                              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-slate-50 pt-2 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Order Total:</span>
                          <span className="font-extrabold text-slate-800">₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
