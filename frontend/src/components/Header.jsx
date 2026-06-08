import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Package, Calendar } from 'lucide-react';
import api from '../api';

const Header = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch Expiration and Stock Alerts
  const fetchAlerts = async () => {
    try {
      const res = await api.get('/batches/expiry-status');
      const { expired, nearExpiry7, nearExpiry15 } = res.data;
      
      const newAlerts = [];

      // Add expired alerts
      expired.forEach(b => {
        newAlerts.push({
          id: `expired-${b.id}`,
          type: 'error',
          icon: AlertTriangle,
          title: 'Batch Expired!',
          message: `${b.product.name} (Batch: ${b.id}) has expired. Stock remaining: ${b.currentStock}.`
        });
      });

      // Add 7-day warnings
      nearExpiry7.forEach(b => {
        newAlerts.push({
          id: `expiry-7-${b.id}`,
          type: 'warning',
          icon: Calendar,
          title: 'Expiring in <7 Days',
          message: `${b.product.name} (Batch: ${b.id}) expires in ${b.daysRemaining} days.`
        });
      });

      // Add 15-day warnings
      nearExpiry15.forEach(b => {
        newAlerts.push({
          id: `expiry-15-${b.id}`,
          type: 'warning',
          icon: Calendar,
          title: 'Expiring in <15 Days',
          message: `${b.product.name} (Batch: ${b.id}) expires in ${b.daysRemaining} days.`
        });
      });

      // Also get low-stock products
      const prodRes = await api.get('/products');
      const lowStock = prodRes.data.filter(p => p.totalStock <= p.thresholdStock);
      lowStock.forEach(p => {
        newAlerts.push({
          id: `lowstock-${p.id}`,
          type: 'info',
          icon: Package,
          title: 'Low Stock Alert',
          message: `${p.name} stock level is ${p.totalStock} (Threshold: ${p.thresholdStock}).`
        });
      });

      setNotifications(newAlerts);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll alerts every 3 minutes
    const interval = setInterval(fetchAlerts, 180000);
    return () => clearInterval(interval);
  }, []);

  // Handle outside clicks to close notifications dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-8 flex items-center justify-between shadow-sm sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Operational Console</h2>
        <p className="text-xs text-slate-400">Sharadha Stores Management System</p>
      </div>

      <div className="flex items-center space-x-6">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2.5 rounded-full hover:bg-slate-50 transition-colors duration-200 border border-slate-100 shadow-sm text-slate-500 hover:text-slate-700 relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-amber-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center animate-bounce shadow-md">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Dropdown Popover */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Active Notifications</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {notifications.length} Alerts
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                    <Bell className="w-8 h-8 text-slate-200" />
                    <p>All operations normal. No active alerts.</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon = n.icon;
                    let typeClass = 'bg-blue-50 text-blue-600';
                    if (n.type === 'error') typeClass = 'bg-red-50 text-red-600';
                    if (n.type === 'warning') typeClass = 'bg-amber-50 text-amber-600';

                    return (
                      <div
                        key={n.id}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors duration-150 flex items-start space-x-3 cursor-pointer border-b border-slate-50/60 last:border-b-0"
                      >
                        <div className={`p-2 rounded-xl ${typeClass} flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
