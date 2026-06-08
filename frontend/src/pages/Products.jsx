import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal, Package, Tag, Layers, RefreshCw } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modals / Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product Form Input State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [shelfLifeDays, setShelfLifeDays] = useState('');
  const [thresholdStock, setThresholdStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setDescription('');
    setPrice('');
    setShelfLifeDays('');
    setThresholdStock('');
    setCategoryId(categories[0]?.id || '');
    setError('');
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setShelfLifeDays(product.shelfLifeDays.toString());
    setThresholdStock(product.thresholdStock.toString());
    setCategoryId(product.categoryId);
    setError('');
    setShowProductModal(true);
  };

  // Handle Product Save
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      sku,
      description,
      price: parseFloat(price),
      shelfLifeDays: parseInt(shelfLifeDays),
      thresholdStock: parseInt(thresholdStock),
      categoryId
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    }
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product');
    }
  };

  // Handle Category Creation
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      await api.post('/products/categories', {
        name: newCatName,
        description: newCatDesc
      });
      setNewCatName('');
      setNewCatDesc('');
      setShowCategoryModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create category');
    }
  };

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track product pricing, categories, and safety stock threshold parameters.</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold border border-slate-200"
          >
            <Tag className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-bold shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Searching & Filtering Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-3">
          <SlidersHorizontal className="w-4.5 h-4.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all min-w-[180px]"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <Package className="w-12 h-12 text-slate-200" />
          <h3 className="font-bold text-slate-700">No Products Found</h3>
          <p className="text-xs">Try adjusting your search filters or add a new product to get started.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-55 border-b border-slate-100 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Shelf Life</th>
                  <th className="px-6 py-4">Total Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((p) => {
                  const isLowStock = p.totalStock <= p.thresholdStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors duration-150 text-slate-700">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {p.name}
                        {p.description && (
                          <span className="block font-normal text-xs text-slate-400 mt-0.5">{p.description}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-xs text-slate-500">{p.sku}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 py-1 px-2.5 rounded-lg text-xs font-medium">
                          {p.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{p.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-500">{p.shelfLifeDays} Days</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-extrabold ${isLowStock ? 'text-red-500' : 'text-slate-800'}`}>
                            {p.totalStock}
                          </span>
                          {isLowStock && (
                            <span className="bg-red-50 text-red-500 text-[10px] py-0.5 px-1.5 rounded-md font-bold uppercase tracking-wider">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">
              {editingProduct ? 'Edit Product Parameters' : 'Create New Product'}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-xs py-2 px-3 rounded-xl mb-4 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Special Rice Murukku"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProduct}
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. MRK-RCE"
                    className="w-full bg-slate-50 border border-slate-200 disabled:opacity-60 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter ingredients or flavor descriptions..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Shelf Life (Days)</label>
                  <input
                    type="number"
                    required
                    value={shelfLifeDays}
                    onChange={(e) => setShelfLifeDays(e.target.value)}
                    placeholder="45"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Threshold Stock</label>
                  <input
                    type="number"
                    required
                    value={thresholdStock}
                    onChange={(e) => setThresholdStock(e.target.value)}
                    placeholder="50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Add Product Category</h3>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Sweets"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Category description..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-4 rounded-xl text-sm transition-all"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
