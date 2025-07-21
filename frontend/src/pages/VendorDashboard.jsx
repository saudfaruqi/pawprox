import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Loader2, User, Mail, Phone, MapPin, Tag, AlertCircle, Calendar, 
  DollarSign, Package, ShoppingCart, ChevronRight, Store, Truck, Clock 
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VendorDashboard = () => {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State to control profile edit modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    business_name: '',
    services: '',
    description: ''
  });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const token = localStorage.getItem("token"); 
        
        // Fetch vendor profile
        const profileResponse = await axios.get("https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVendorInfo(profileResponse.data); 
        
        // Fetch recent orders
        const ordersResponse = await axios.get("https://pawprox-6dd216fb1ef5.herokuapp.com/api/orders/vendor?limit=5", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orders = ordersResponse.data.orders || []; 
        setRecentOrders(orders);
        
        // Fetch products count
        const productsResponse = await axios.get("https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/products", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Assumes backend returns { products: [...] }
        const products = productsResponse.data.products || [];
        
        // Calculate stats
        const pendingOrdersCount = orders.filter(order =>
          (order.order_status || 'processing').toLowerCase() === 'processing'
        ).length;        
        const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);

        setSalesStats({
          totalSales: totalSales.toFixed(2),
          pendingOrders: pendingOrdersCount,
          totalProducts: products.length
        });

      } catch (err) {
        console.error(err);
        setError("Failed to load vendor information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorData();
  }, []);

  const getStatusColor = (status) => {
    const normalizedStatus = (status || "processing").toLowerCase();
    switch (normalizedStatus) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-indigo-100 text-indigo-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "out for delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Open the modal and pre-fill the form with current vendor info
  const openEditModal = () => {
    if (vendorInfo) {
      setProfileFormData({
        business_name: vendorInfo.business_name || '',
        services: vendorInfo.services || '',
        description: vendorInfo.description || ''
      });
      setShowProfileModal(true);
    }
  };

  // Handle changes in modal form fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateSuccess('');
    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.put("https://pawprox-6dd216fb1ef5.herokuapp.com/api/vendor/profile/edit", profileFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpdateSuccess("Profile updated successfully!");
      // Update the displayed vendor info with new details
      setVendorInfo(prev => ({ ...prev, ...profileFormData }));
      // Close modal after a short delay
      setTimeout(() => {
        setShowProfileModal(false);
        setUpdateSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setUpdateError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center p-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 mt-[80px]">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Vendor Dashboard</h1>
          <div className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="font-medium text-blue-600">Dashboard</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold">Rs {salesStats.totalSales}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Processing Orders</p>
              <p className="text-2xl font-bold">{salesStats.pendingOrders}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-2xl font-bold">{salesStats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Business Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden lg:col-span-1">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Store className="w-5 h-5 mr-2" />
                Business Profile
              </h2>
              <button 
                onClick={openEditModal} 
                className="text-sm text-white underline"
              >
                Edit
              </button>
            </div>
            <div className="p-6">
              {vendorInfo ? (
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800">
                      {vendorInfo.business_name || 'Your Business'}
                    </h3>
                    <div className="mt-1 inline-flex">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        vendorInfo.approval_status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : vendorInfo.approval_status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {vendorInfo.approval_status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{vendorInfo.contact_name || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{vendorInfo.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{vendorInfo.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        <span>{vendorInfo.location || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Business Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-start text-sm">
                        <Tag className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Services Offered</p>
                          <p className="text-gray-600">{vendorInfo.services || 'Not specified'}</p>
                        </div>
                      </div>
                      {vendorInfo.description && (
                        <div className="flex items-start text-sm">
                          <div className="w-4 h-4 mr-3" />
                          <div>
                            <p className="font-medium">About</p>
                            <p className="text-gray-600">{vendorInfo.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No business information found</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders and Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => window.location.assign("/vendor/products")}
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="bg-blue-100 p-3 rounded-full mr-3">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Manage Products</p>
                    <p className="text-sm text-gray-600">{salesStats.totalProducts} products</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>
                <button 
                  onClick={() => window.location.assign("/vendor/orders")}
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="bg-green-100 p-3 rounded-full mr-3">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">View Orders</p>
                    <p className="text-sm text-gray-600">{salesStats.pendingOrders} pending</p>
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Recent Orders
                </h2>
                <button 
                  onClick={() => window.location.assign("/vendor/orders")}
                  className="text-sm hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                            {order.image ? ( 
                              <img 
                                src={`https://pawprox-6dd216fb1ef5.herokuapp.com/${order.image}`} 
                                alt={order.title} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium">{order.title}</h3>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(order.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-4 text-right">
                            <p className="font-bold">Rs {parseFloat(order.total_price || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Qty: {order.quantity || 1}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.order_status)}`}>
                            {order.order_status || 'Processing'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ShoppingCart className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No recent orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center border-b px-4 py-3">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="text-gray-600 hover:text-gray-800"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="px-4 py-6">
              {updateError && (
                <div className="mb-4 text-red-600 text-sm">{updateError}</div>
              )}
              {updateSuccess && (
                <div className="mb-4 text-green-600 text-sm">{updateSuccess}</div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Business Name</label>
                <input 
                  type="text" 
                  name="business_name" 
                  value={profileFormData.business_name} 
                  onChange={handleProfileChange} 
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Services Offered</label>
                <input 
                  type="text" 
                  name="services" 
                  value={profileFormData.services} 
                  onChange={handleProfileChange} 
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">About</label>
                <textarea 
                  name="description" 
                  value={profileFormData.description} 
                  onChange={handleProfileChange} 
                  className="w-full border px-3 py-2 rounded" 
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowProfileModal(false)} 
                  className="mr-3 px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default VendorDashboard;
