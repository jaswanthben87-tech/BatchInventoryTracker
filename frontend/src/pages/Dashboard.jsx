import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Layers, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setMetrics(res.data.summary);
        setChartData(res.data.chartData);
        setTopProducts(res.data.topProducts);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Products', value: metrics?.totalProducts || 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Batches', value: metrics?.totalActiveBatches || 0, icon: Layers, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Inventory Value', value: `₹${metrics?.totalInventoryValue?.toLocaleString('en-IN') || 0}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Revenue Generated', value: `₹${metrics?.revenue?.toLocaleString('en-IN') || 0}`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Orders', value: metrics?.activeOrders || 0, icon: ShoppingCart, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Customers', value: metrics?.totalCustomers || 0, icon: Users, color: 'text-pink-600 bg-pink-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time business performance, inventory velocity, and critical operational alerts.</p>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel p-5 flex flex-col justify-between glass-panel-hover">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Expiry & Stock Warning Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-800 text-base">Critical Action Required</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-red-100/60 rounded-xl text-red-600 font-extrabold text-lg">
                {metrics?.expiredCount || 0}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expired Batches</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Stock has exceeded expiry</p>
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-amber-100/60 rounded-xl text-amber-600 font-extrabold text-lg">
                {metrics?.nearExpiryCount || 0}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Near Expiry</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Expiring in &lt;30 days</p>
              </div>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl flex items-center space-x-4">
              <div className="p-3 bg-orange-100/60 rounded-xl text-orange-600 font-extrabold text-lg">
                {metrics?.lowStockCount || 0}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Products</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Below safe threshold limits</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-sm">Order Status Summary</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Queue</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-50 rounded-xl flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
              </div>
              <span className="text-lg font-black text-slate-800 mt-2">{metrics?.pendingOrders || 0}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-indigo-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Run</span>
              </div>
              <span className="text-lg font-black text-slate-800 mt-2">{metrics?.activeOrders || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue over time (Line Chart) */}
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Sales & Order Trends</h3>
            <p className="text-xs text-slate-400">Order volumes and revenue generated over the last 14 days.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#d97706" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#4f46e5" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9' }} 
                  labelStyle={{ fontWeight: 'bold', fontSize: 12 }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#d97706" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Order Count" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products (Bar Chart) */}
        <div className="glass-panel p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Best Selling Products</h3>
            <p className="text-xs text-slate-400">Top products ranked by sales turnover volume.</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#4f46e5" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="sales" name="Sales Turnover (₹)" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="quantity" name="Quantity Sold" fill="#d97706" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
