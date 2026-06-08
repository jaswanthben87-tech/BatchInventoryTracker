import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  History,
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Check if role is allowed to view
  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(user.role);
  };

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PRODUCTION_MANAGER', 'DISPATCH_TEAM', 'CUSTOMER_SUPPORT']
    },
    {
      to: '/products',
      label: 'Products Catalog',
      icon: ShoppingBag,
      roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER']
    },
    {
      to: '/batches',
      label: 'Production Batches',
      icon: Layers,
      roles: ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PRODUCTION_MANAGER']
    },
    {
      to: '/orders',
      label: 'Orders & Dispatch',
      icon: ShoppingCart,
      roles: ['SUPER_ADMIN', 'ADMIN', 'DISPATCH_TEAM', 'CUSTOMER_SUPPORT']
    },
    {
      to: '/customers',
      label: 'Customers CRM',
      icon: Users,
      roles: ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT']
    },
    {
      to: '/insights',
      label: 'Reports & AI Insights',
      icon: Sparkles,
      roles: ['SUPER_ADMIN', 'ADMIN']
    },
    {
      to: '/audit-logs',
      label: 'Audit Trail Logs',
      icon: History,
      roles: ['SUPER_ADMIN', 'ADMIN']
    }
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shadow-xl">
      <div className="p-6">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30">
            SS
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight">Sharadha Stores</h1>
            <span className="text-xs text-amber-500 font-semibold tracking-wider uppercase">Operations Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (!hasAccess(item.roles)) return null;

            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase border border-slate-700 shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate uppercase font-bold tracking-wider">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
