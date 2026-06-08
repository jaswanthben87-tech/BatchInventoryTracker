import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Gift, DollarSign, Download, RefreshCw, BarChart2 } from 'lucide-react';
import api from '../api';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [wastage, setWastage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [insightRes, wasteRes] = await Promise.all([
        api.get('/analytics/ai-insights'),
        api.get('/analytics/wastage')
      ]);
      setInsights(insightRes.data);
      setWastage(wasteRes.data);
    } catch (err) {
      console.error('Failed to load AI analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CSV Exporter for Reports
  const exportToCSV = (data, filename, headers) => {
    setExporting(true);
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\n";

      data.forEach(row => {
        const rowStr = Object.values(row).map(val => {
          const formatted = typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
          return formatted;
        }).join(",");
        csvContent += rowStr + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportForecast = () => {
    if (!insights?.demandForecast) return;
    const data = insights.demandForecast.map(f => ({
      SKU: f.sku,
      Product: f.productName,
      CurrentStock: f.currentStock,
      LastMonthSales: f.salesLastMonth,
      ProjectedDemand: f.projected30DayDemand,
      NeedsReplenishment: f.requiresReplenishment ? 'YES' : 'NO',
      RecommendedBatchSize: f.recommendedBatchQty
    }));
    exportToCSV(data, "Sharadha_Stores_Demand_Forecast.csv", ["SKU", "Product Name", "Current Active Stock", "Last Month Sales", "Projected 30-Day Demand", "Needs Replenishment", "Recommended Batch Qty"]);
  };

  const handleExportWastage = () => {
    if (!wastage?.wastageDetails) return;
    const data = wastage.wastageDetails.map(w => ({
      BatchID: w.batchId,
      Product: w.productName,
      ExpiredStock: w.expiredStock,
      UnitPrice: w.price,
      FinancialLoss: w.financialLoss,
      ExpiryDate: new Date(w.expiryDate).toLocaleDateString('en-IN')
    }));
    exportToCSV(data, "Sharadha_Stores_Wastage_Report.csv", ["Batch ID", "Product Name", "Expired Stock Quantity", "Unit Price (₹)", "Financial Loss (₹)", "Expiry Date"]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-amber-500" />
            <span>AI intelligence & Reports</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Leverage dynamic math models to predict stock lifecycles, forecast demand, and mitigate financial loss.
          </p>
        </div>
      </div>

      {/* Demand Forecasting Section */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="font-extrabold text-slate-800 text-base">Demand Forecasting & Smart Replenishment</h3>
          </div>
          <button
            onClick={handleExportForecast}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Forecast (CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">SKU</th>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Current Stock</th>
                <th className="px-5 py-3.5">Sales (Last 30d)</th>
                <th className="px-5 py-3.5">Projected Demand</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Suggested Production</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {insights?.demandForecast?.map((f) => (
                <tr key={f.productId} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-mono text-slate-500">{f.sku}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">{f.productName}</td>
                  <td className="px-5 py-3.5">{f.currentStock} units</td>
                  <td className="px-5 py-3.5">{f.salesLastMonth} sold</td>
                  <td className="px-5 py-3.5 font-semibold text-indigo-600">{f.projected30DayDemand} units</td>
                  <td className="px-5 py-3.5">
                    {f.requiresReplenishment ? (
                      <span className="bg-amber-50 text-amber-600 py-0.5 px-2 rounded-md font-bold uppercase text-[9px] tracking-wider">
                        Replenish Stock
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-600 py-0.5 px-2 rounded-md font-bold uppercase text-[9px] tracking-wider">
                        Sufficient Stock
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right font-extrabold text-slate-800">
                    {f.requiresReplenishment ? `${f.recommendedBatchQty} units` : '0 (Stable)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry Risk Predictor */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-slate-800 text-base">Expiry Risk Predictions</h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {insights?.expiryRisk?.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active batches are currently flagged with expiration risks.
              </div>
            ) : (
              insights?.expiryRisk?.map((r) => {
                const isHigh = r.riskLevel === 'HIGH';
                return (
                  <div key={r.batchId} className="border border-slate-100 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-200 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{r.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Batch: {r.batchId}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded ${isHigh ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                        {r.riskLevel} Risk
                      </span>
                    </div>

                    <div className="border-t border-slate-50 pt-2 mt-3 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">Expiring In</p>
                        <p className="font-bold text-slate-700 mt-0.5">{r.daysToExpiry} Days</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400">Potential Waste</p>
                        <p className="font-bold text-slate-700 mt-0.5">{r.potentialWastedQty} units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400">Estimated Loss</p>
                        <p className="font-extrabold text-red-500 mt-0.5">₹{r.financialLossRisk.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Promo and Bundle Builder */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Gift className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-slate-800 text-base">Bundling & Promo Recommendations</h3>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {insights?.promoRecommendations?.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No promotions suggested. Stock velocity matches expiry parameters.
              </div>
            ) : (
              insights?.promoRecommendations?.map((p) => (
                <div key={p.batchId} className="bg-amber-50/20 border border-amber-100/60 p-4 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-extrabold text-slate-800">{p.productName}</h4>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200/50 py-0.5 px-1.5 rounded uppercase font-mono">
                      {p.daysToExpiry} Days Left
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    <span className="font-bold text-amber-600">Suggested Action: </span>
                    {p.suggestedAction}
                  </p>

                  <p className="text-[10px] text-slate-400 leading-relaxed italic">{p.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Wastage and Loss Report */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-slate-800 text-base">Wastage & Financial Loss Analysis</h3>
          </div>

          <div className="flex space-x-3">
            <div className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg flex items-center space-x-1.5">
              <span>Financial Loss:</span>
              <span className="font-bold text-red-500">₹{wastage?.totalLoss?.toLocaleString('en-IN') || 0}</span>
            </div>
            
            <button
              onClick={handleExportWastage}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report (CSV)</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">Batch ID</th>
                <th className="px-5 py-3.5">Product Name</th>
                <th className="px-5 py-3.5">Expired Stock Quantity</th>
                <th className="px-5 py-3.5">Unit Price</th>
                <th className="px-5 py-3.5">Financial Loss</th>
                <th className="px-5 py-3.5 text-right">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {wastage?.wastageDetails?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-normal">
                    Excellent! Zero expired batches. No financial losses registered.
                  </td>
                </tr>
              ) : (
                wastage?.wastageDetails?.map((w) => (
                  <tr key={w.batchId} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 font-mono text-slate-500">{w.batchId}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{w.productName}</td>
                    <td className="px-5 py-3.5 text-red-500 font-semibold">{w.expiredStock} packets</td>
                    <td className="px-5 py-3.5">₹{w.price.toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-extrabold text-red-600">₹{w.financialLoss.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-slate-400">
                      {new Date(w.expiryDate).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Insights;
