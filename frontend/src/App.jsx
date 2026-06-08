import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Batches from './pages/Batches';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Insights from './pages/Insights';
import AuditLogs from './pages/AuditLogs';

// Protected Route Guard
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Main Admin Layout
const AppLayout = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const allRoles = ['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PRODUCTION_MANAGER', 'DISPATCH_TEAM', 'CUSTOMER_SUPPORT'];

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout Routes */}
      <Route element={<ProtectedRoute allowedRoles={allRoles} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER']} />}>
            <Route path="/products" element={<Products />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'INVENTORY_MANAGER', 'PRODUCTION_MANAGER']} />}>
            <Route path="/batches" element={<Batches />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'DISPATCH_TEAM', 'CUSTOMER_SUPPORT']} />}>
            <Route path="/orders" element={<Orders />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT']} />}>
            <Route path="/customers" element={<Customers />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
            <Route path="/insights" element={<Insights />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
