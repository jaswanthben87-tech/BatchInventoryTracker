import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Eye, User } from 'lucide-react';
import api from '../api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [activeJsonLog, setActiveJsonLog] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let url = '/audit-logs?limit=50';
      if (actionFilter) url += `&action=${actionFilter}`;
      if (entityFilter) url += `&entity=${entityFilter}`;
      
      const res = await api.get(url);
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, entityFilter]);

  const formatJson = (val) => {
    if (!val) return 'None';
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return val;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Audit Trails</h1>
        <p className="text-slate-500 text-sm mt-1">Immutable ledger recording user logins, product creations, batch updates, and order checkouts.</p>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="CREATE_PRODUCT">Create Product</option>
            <option value="UPDATE_PRODUCT">Update Product</option>
            <option value="CREATE_BATCH">Create Batch</option>
            <option value="UPDATE_BATCH">Update Batch</option>
            <option value="CREATE_ORDER">Create Order</option>
            <option value="UPDATE_ORDER_STATUS">Update Order Status</option>
          </select>
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all min-w-[180px]"
        >
          <option value="">All Entities</option>
          <option value="User">User</option>
          <option value="Product">Product</option>
          <option value="Batch">Batch</option>
          <option value="Order">Order</option>
          <option value="Category">Category</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <History className="w-12 h-12 text-slate-200" />
          <h3 className="font-bold text-slate-700">No Logs Recorded</h3>
          <p className="text-xs">All user actions will be cataloged in real-time as operations are performed.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target Entity</th>
                  <th className="px-6 py-4">Target ID</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-155">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-full flex-shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{log.user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{log.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 py-0.5 px-2 rounded-md font-bold text-[10px] uppercase font-mono tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{log.entity}</td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-[10px]">{log.entityId}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(log.previousValue || log.newValue) ? (
                        <button
                          onClick={() => setActiveJsonLog(log)}
                          className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white py-1 px-2.5 rounded-lg text-[10px] font-bold ml-auto transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Diff</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">No payload</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- PAYLOAD DIFF DIALOG --- */}
      {activeJsonLog && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl animate-in scale-in duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Payload state transition</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Action: {activeJsonLog.action}</p>
              </div>
              <button
                onClick={() => setActiveJsonLog(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1.5 px-3.5 rounded-xl text-xs"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Previous State</span>
                <pre className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-[10px] font-mono text-slate-600 overflow-x-auto max-h-96">
                  {formatJson(activeJsonLog.previousValue)}
                </pre>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New State</span>
                <pre className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-[10px] font-mono text-slate-700 overflow-x-auto max-h-96 font-semibold">
                  {formatJson(activeJsonLog.newValue)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
