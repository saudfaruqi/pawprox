import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Loader2, Plus, Edit, Trash2, Tag, Box, DollarSign, Layout,
  AlertCircle, ChevronRight, Search, Info
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const VendorProducts = () => {
  // Extended form state with tax, shippingCost, and new fields: features and benefits
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    details: '',
    price: '',
    category: '',
    stock: '',
    sku: '',
    dimensions: '',
    weight: '',
    materials: '',
    tax: '',            // tax percentage or flat amount
    shippingCost: '',   // shipping cost in dollars
    features: '',       // new field: features
    benefits: ''        // new field: benefits
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    averagePrice: 0
  });
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [selectedDetailFiles, setSelectedDetailFiles] = useState([]);
  const [detailPreviewURLs, setDetailPreviewURLs] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedProducts = response.data.products;
      setProducts(fetchedProducts);
      const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))];
      setCategories(uniqueCategories);
      const totalPrice = fetchedProducts.reduce((sum, product) => sum + parseFloat(product.price), 0);
      const avgPrice = fetchedProducts.length > 0 ? (totalPrice / fetchedProducts.length).toFixed(2) : 0;
      setStats({
        totalProducts: fetchedProducts.length,
        totalCategories: uniqueCategories.length,
        averagePrice: avgPrice
      });
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => setPreviewURL(fileReader.result);
      fileReader.readAsDataURL(file);
    } else {
      setPreviewURL('');
    }
  };

  const handleDetailFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedDetailFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setDetailPreviewURLs(urls);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      details: '',
      price: '',
      category: '',
      stock: '',
      sku: '',
      dimensions: '',
      weight: '',
      materials: '',
      tax: '',
      shippingCost: '',
      features: '',      // Reset features
      benefits: ''       // Reset benefits
    });
    setSelectedFile(null);
    setPreviewURL('');
    setSelectedDetailFiles([]);
    setDetailPreviewURLs([]);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('details', formData.details);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      data.append('sku', formData.sku);
      data.append('dimensions', formData.dimensions);
      data.append('weight', formData.weight);
      data.append('materials', formData.materials);
      // Append new fields: tax, shippingCost, features, and benefits
      data.append('tax', formData.tax);
      data.append('shippingCost', formData.shippingCost);
      data.append('features', formData.features);
      data.append('benefits', formData.benefits);

      if (selectedFile) {
        data.append('image', selectedFile);
      }
      selectedDetailFiles.forEach(file => {
        data.append('detail_images', file);
      });
      
      const token = localStorage.getItem("token");
      let response;
      if (editingProduct) {
        response = await axios.put(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/products/${editingProduct.id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setSuccess("Product updated successfully");
      } else {
        response = await axios.post('https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/products', data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        setSuccess("Product created successfully");
      }
      resetForm();
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError(editingProduct ? "Failed to update product" : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      description: product.description,
      details: product.details || '',
      price: product.price,
      category: product.category,
      stock: product.stock || '',
      sku: product.sku || '',
      dimensions: product.dimensions || '',
      weight: product.weight || '',
      materials: product.materials || '',
      tax: product.tax || '',
      shippingCost: product.shipping_cost || '',
      features: product.features || '',    // Prepopulate features
      benefits: product.benefits || ''       // Prepopulate benefits
    });
    setEditingProduct(product);
    if (product.image) {
      setPreviewURL(`https://pawprox-6dd216fb1ef5.herokuapp.com/${product.image}`);
    } else {
      setPreviewURL('');
    }
    if (product.detail_images) {
      try {
        const detailImgs = JSON.parse(product.detail_images);
        setDetailPreviewURLs(detailImgs.map(img => `https://pawprox-6dd216fb1ef5.herokuapp.com/${img}`));
      } catch (e) {
        console.error("Error parsing detail images", e);
      }
    }
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const toggleProductDetails = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const formatDetails = (detailsText) => {
    if (!detailsText || detailsText === "No details available.") return [];
    const lines = detailsText.split(/\n|•/).filter(line => line.trim());
    if (lines.length <= 1) {
      return detailsText.split(/\.\s+/).filter(sentence => sentence.trim()).map(s => s + '.');
    }
    return lines;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? product.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 mt-[110px]">
        {/* Navigation and Summary */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
            <div className="text-sm text-gray-500 mt-1 flex items-center">
              <Link to="/vendor/dashboard" className="hover:text-blue-600">Dashboard</Link>
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="font-medium text-blue-600">Products</span>
            </div>
          </div>
          <button 
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="mt-4 sm:mt-0 flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" />Add Product</>}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Box className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold">{stats.totalCategories}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Price</p>
              <p className="text-2xl font-bold">Rs {stats.averagePrice}</p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Product Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6" encType="multipart/form-data">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Title, Price, Tax, Shipping, Category, Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Organic Coconut Oil"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs )</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                    <input
                      type="number"
                      name="tax"
                      value={formData.tax}
                      onChange={handleInputChange}
                      placeholder="e.g. 8"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost (Rs )</label>
                    <input
                      type="number"
                      name="shippingCost"
                      value={formData.shippingCost}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g. Skincare"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                      list="categories"
                    />
                    <datalist id="categories">
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  {/* New Fields: SKU, Dimensions, Weight, Materials */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="e.g. ABC123"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions</label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      placeholder="e.g. 10 x 5 x 2 inches"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="e.g. 2 lbs"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materials</label>
                    <input
                      type="text"
                      name="materials"
                      value={formData.materials}
                      onChange={handleInputChange}
                      placeholder="e.g. 100% Cotton"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  {/* New Fields: Features and Benefits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                    <textarea
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      placeholder="List the key features of your product..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                    <textarea
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleInputChange}
                      placeholder="List the benefits of your product..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your product in detail..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      rows="5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 items-center">
                      Product Details
                      <span className="ml-2 text-xs text-gray-500 italic">(Use bullet points or new lines for better formatting)</span>
                    </label>
                    <textarea
                      name="details"
                      value={formData.details}
                      onChange={handleInputChange}
                      placeholder="• Material: 100% Cotton&#10;• Dimensions: 10 x 5 inches&#10;• Weight: 2 lbs&#10;• Care: Machine wash cold"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="text-sm text-gray-600 w-full"
                      />
                      {previewURL && (
                        <div className="w-16 h-16 relative">
                          <img 
                            src={previewURL} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded border border-gray-300" 
                          />
                          <button 
                            type="button"
                            onClick={() => { setPreviewURL(''); setSelectedFile(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detail Images</label>
                    <input
                      type="file"
                      name="detail_images"
                      onChange={handleDetailFileChange}
                      accept="image/*"
                      multiple
                      className="text-sm text-gray-600 w-full"
                    />
                    {detailPreviewURLs.length > 0 && (
                      <div className="flex space-x-2 mt-2">
                        {detailPreviewURLs.map((url, idx) => (
                          <div key={idx} className="w-16 h-16 relative">
                            <img src={url} alt={`Detail preview ${idx}`} className="w-full h-full object-cover rounded border border-gray-300" />
                            <button 
                              type="button"
                              onClick={() => {
                                setDetailPreviewURLs(detailPreviewURLs.filter((_, i) => i !== idx));
                                setSelectedDetailFiles(selectedDetailFiles.filter((_, i) => i !== idx));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  type="button" 
                  onClick={() => { resetForm(); setShowForm(false); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((category, idx) => (
              <option key={idx} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {loading && !showForm && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {/* Product List */}
        {!loading && filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Layout className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="text-xl font-semibold mt-4 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterCategory 
                ? "Try adjusting your search or filter criteria" 
                : "Start by adding your first product"}
            </p>
            {!searchTerm && !filterCategory && (
              <button 
                onClick={() => { resetForm(); setShowForm(true); }}
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform hover:translate-y-[-2px]">
                {product.image ? (
                  <div className="relative h-48 bg-gray-200">
                    <img 
                      src={`https://pawprox-6dd216fb1ef5.herokuapp.com/${product.image}`} 
                      alt={product.title} 
                      className="w-full h-full object-cover" 
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        Low Stock: {product.stock}
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <Box className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.title}</h3>
                    <span className="text-lg font-bold text-blue-600">Rs {parseFloat(product.price).toFixed(2)}</span>
                  </div>
                  <div className="mb-3 flex items-center">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">Stock: {product.stock}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  {product.details && product.details !== "No details available." && (
                    <div className="mt-2">
                      <button 
                        onClick={() => toggleProductDetails(product.id)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        {expandedProduct === product.id ? "Hide Details" : "View Details"}
                      </button>
                      {expandedProduct === product.id && (
                        <div className="bg-gray-50 p-3 rounded-md mt-2 mb-3 text-sm">
                          <h4 className="font-medium text-gray-700 mb-2">Product Details:</h4>
                          <ul className="space-y-1">
                            {formatDetails(product.details).map((detail, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                          <ul className="mt-3 space-y-1 text-sm">
                            <li><strong>SKU:</strong> {product.sku}</li>
                            <li><strong>Dimensions:</strong> {product.dimensions}</li>
                            <li><strong>Weight:</strong> {product.weight}</li>
                            <li><strong>Materials:</strong> {product.materials}</li>
                            {product.tax && <li><strong>Tax:</strong> {product.tax}%</li>}
                            {product.shipping_cost && <li><strong>Shipping:</strong> Rs {product.shipping_cost}</li>}
                            {product.features && <li><strong>Features:</strong> {product.features}</li>}
                            {product.benefits && <li><strong>Benefits:</strong> {product.benefits}</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between mt-auto pt-4 border-t">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 flex items-center text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VendorProducts;
