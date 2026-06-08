import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Calendar, Package, AlertTriangle, Layers, RotateCcw, PenTool } from 'lucide-react';
import api from '../api';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [expirySummary, setExpirySummary] = useState(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  // Form Input States
  const [productId, setProductId] = useState('');
  const [mfgDate, setMfgDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantityProduced, setQuantityProduced] = useState('');
  const [packagingCount, setPackagingCount] = useState('');
  const [calculatedExpiry, setCalculatedExpiry] = useState('');
  const [error, setError] = useState('');

  // Edit Form Inputs
  const [editStock, setEditStock] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [batchRes, prodRes, expiryRes] = await Promise.all([
        api.get('/batches'),
        api.get('/products'),
        api.get('/batches/expiry-status')
      ]);
      setBatches(batchRes.data);
      setProducts(prodRes.data);
      setExpirySummary(expiryRes.data);
    } catch (err) {
      console.error('Failed to load batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update calculated expiry date dynamically when product or mfgDate changes
  useEffect(() => {
    if (productId && mfgDate) {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        const d = new Date(mfgDate);
        d.setDate(d.getDate() + prod.shelfLifeDays);
        setCalculatedExpiry(d.toISOString().split('T')[0]);
      }
    } else {
      setCalculatedExpiry('');
    }
  }, [productId, mfgDate, products]);

  const handleProductSelect = (e) => {
    const id = e.target.value;
    setProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      // Suggest realistic packaging box count: 1 box per 10 items
      setPackagingCount(Math.ceil(parseFloat(quantityProduced || 0) / 10).toString());
    }
  };

  const handleQtyChange = (e) => {
    const qty = e.target.value;
    setQuantityProduced(qty);
    // Suggest box count automatically (assuming box pack of 10)
    setPackagingCount(Math.ceil(parseFloat(qty || 0) / 10).toString());
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/batches', {
        productId,
        mfgDate,
        quantityProduced: parseInt(quantityProduced),
        packagingCount: parseInt(packagingCount)
      });
      setShowAddModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record production batch');
    }
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setEditStock(batch.currentStock.toString());
    setEditStatus(batch.status);
    setEditNotes('');
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.put(`/batches/${editingBatch.id}`, {
        currentStock: parseInt(editStock),
        status: editStatus,
        notes: editNotes
      });
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update batch');
    }
  };

  // Filter batches
  const filteredBatches = batches.filter(b => {
    const matchesProduct = selectedProductFilter ? b.productId === selectedProductFilter : true;
    const matchesStatus = selectedStatusFilter ? b.status === selectedStatusFilter : true;
    return matchesProduct && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Production Batch Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Track manufacturing logs, monitor product shelf-lives, and log daily batch runs.</p>
        </div>

        <button
          onClick={() => {
            setProductId(products[0]?.id || '');
            setQuantityProduced('');
            setPackagingCount('');
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-bold shadow-lg shadow-amber-500/10 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manufacture New Batch</span>
        </button>
      </div>

      {/* Expiry Alerts Grid Summary */}
      {!loading && expirySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50/40 border border-red-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Expired Batches</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{expirySummary.expired?.length || 0}</h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500/50" />
          </div>

          <div className="bg-orange-50/40 border border-orange-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wider">Expiring &lt;7 Days</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{expirySummary.nearExpiry7?.length || 0}</h3>
            </div>
            <Calendar className="w-8 h-8 text-orange-500/50" />
          </div>

          <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Expiring &lt;15 Days</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{expirySummary.nearExpiry15?.length || 0}</h3>
            </div>
            <Calendar className="w-8 h-8 text-amber-500/50" />
          </div>

          <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Expiring &lt;30 Days</p>
              <h3 className="text-xl font-extrabold text-slate-800 mt-1">{expirySummary.nearExpiry30?.length || 0}</h3>
            </div>
            <Calendar className="w-8 h-8 text-indigo-500/50" />
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-3 flex-1">
          <SlidersHorizontal className="w-4.5 h-4.5 text-slate-400" />
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all w-full"
          >
            <option value="">Filter by Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all min-w-[180px]"
        >
          <option value="">Filter by Status</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="EXHAUSTED">Exhausted</option>
          <option value="RECALLED">Recalled</option>
        </select>
      </div>

      {/* Batches Table List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <Layers className="w-12 h-12 text-slate-200" />
          <h3 className="font-bold text-slate-700">No Batches Recorded</h3>
          <p className="text-xs">Adjust your search parameters or log a new manufacturing batch.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Batch ID</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Mfg Date</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Stock (Qty/Boxes)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Adjustments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBatches.map((b) => {
                  const nowTime = new Date().getTime();
                  const expTime = new Date(b.expiryDate).getTime();
                  const diffDays = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
                  
                  let statusBadge = 'bg-emerald-50 text-emerald-600';
                  if (b.status === 'EXPIRED') statusBadge = 'bg-red-50 text-red-600';
                  if (b.status === 'EXHAUSTED') statusBadge = 'bg-slate-100 text-slate-500';
                  if (b.status === 'RECALLED') statusBadge = 'bg-amber-50 text-amber-600';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors duration-150 text-slate-700">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">{b.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{b.product?.name}</td>
                      <td className="px-6 py-4 text-xs">{new Date(b.mfgDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs">{new Date(b.expiryDate).toLocaleDateString('en-IN')}</span>
                          {b.status === 'ACTIVE' && diffDays <= 30 && diffDays > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 mt-0.5">
                              Expiring in {diffDays} days
                            </span>
                          )}
                          {b.status === 'ACTIVE' && diffDays <= 0 && (
                            <span className="text-[10px] font-bold text-red-500 mt-0.5">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800">{b.currentStock} / {b.quantityProduced}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{b.packagingCount} Boxes</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`py-1 px-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${statusBadge}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(b)}
                          className="flex items-center space-x-1.5 ml-auto bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MANUFACTURE NEW BATCH MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Log Manufactured Batch</h3>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-xs py-2 px-3 rounded-xl mb-4 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product</label>
                <select
                  value={productId}
                  onChange={handleProductSelect}
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                >
                  <option value="" disabled>Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Shelf Life: {p.shelfLifeDays} days)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Quantity Produced</label>
                  <input
                    type="number"
                    required
                    value={quantityProduced}
                    onChange={handleQtyChange}
                    placeholder="e.g. 100"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Packaging Boxes</label>
                  <input
                    type="number"
                    required
                    value={packagingCount}
                    onChange={(e) => setPackagingCount(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mfg Date</label>
                  <input
                    type="date"
                    required
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Auto-calculated Expiry</label>
                  <input
                    type="text"
                    disabled
                    value={calculatedExpiry || 'Select product first...'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
                >
                  Save Batch Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADJUST STOCK / EDIT BATCH MODAL --- */}
      {showEditModal && editingBatch && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">Adjust Batch Stock</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">Batch ID: {editingBatch.id}</p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-xs py-2 px-3 rounded-xl mb-4 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Stock</label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Batch Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="EXHAUSTED">Exhausted</option>
                    <option value="RECALLED">Recalled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Audit Note / Reason</label>
                <textarea
                  required
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Found 2 packets damaged, deducting stock."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
                >
                  Log Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;
