import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Loader2, ChevronRight, Search, Package, Filter, AlertCircle, Calendar, 
  User, MapPin, Phone, ArrowDown, ArrowUp, ShoppingCart, Check, X, Truck, Clock 
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Helper function to auto-generate a tracking number
const generateTrackingNumber = () => {
  return 'TN-' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updateStatus, setUpdateStatus] = useState({ id: null, status: '', loading: false });
  // trackingInfo state holds carrier info only since tracking number is auto-generated
  const [trackingInfo, setTrackingInfo] = useState({ id: null, carrierSlug: '', loading: false });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  const carriers = [
    { slug: 'usps', name: 'USPS' },
    { slug: 'ups', name: 'UPS' },
    { slug: 'fedex', name: 'FedEx' },
    { slug: 'dhl', name: 'DHL' },
    { slug: 'ontrac', name: 'OnTrac' },
    { slug: 'amazon', name: 'Amazon Logistics' },
    { slug: 'other', name: 'Other' },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5001/api/orders/vendor", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedOrders = response.data.orders || [];
      // Set default status to "processing" if not provided
      const processedOrders = fetchedOrders.map(order => ({
        ...order,
        order_status: order.order_status ? order.order_status : 'processing',
        tracking_number: order.tracking_number || '', // may be empty
        carrier_slug: order.carrier_slug || ''
      }));
      
      setOrders(processedOrders);
      
      // Count orders whose status is "processing" (case-insensitive)
      const pendingCount = processedOrders.filter(order =>
        (order.order_status || 'processing').toLowerCase() === 'processing'
      ).length;
      
      const totalRevenue = processedOrders.reduce((sum, order) =>
        sum + (parseFloat(order.total_price) || 0), 0
      );
      
      setStats({
        totalOrders: processedOrders.length,
        pendingOrders: pendingCount,
        totalRevenue: totalRevenue.toFixed(2)
      });      
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdateStatus({ id: orderId, status: newStatus, loading: true });
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, order_status: newStatus } : order
      );
      setOrders(updatedOrders);
  
      // Recalculate "processing" orders count (case-insensitive)
      const pendingCount = updatedOrders.filter(order =>
        (order.order_status || 'processing').toLowerCase() === 'processing'
      ).length;
  
      setStats(prev => ({
        ...prev,
        pendingOrders: pendingCount
      }));
    } catch (err) {
      console.error(err);
      setError(`Failed to update order status to ${newStatus}`);
    } finally {
      setUpdateStatus({ id: null, status: "", loading: false });
    }
  };
  
  const handleTrackingUpdate = async (orderId) => {
    // Find the order by ID
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Use existing tracking number if available; otherwise, auto-generate one.
    const trackingNumber = order.tracking_number || generateTrackingNumber();

    if (!trackingInfo.carrierSlug) {
      setError("Carrier is required");
      return;
    }
    
    setTrackingInfo(prev => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/orders/${orderId}/tracking`,
        { 
          tracking_number: trackingNumber,
          carrier_slug: trackingInfo.carrierSlug
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedOrders = orders.map(o =>
        o.id === orderId ? { 
          ...o, 
          tracking_number: trackingNumber,
          carrier_slug: trackingInfo.carrierSlug
        } : o
      );
      setOrders(updatedOrders);
      
      // Auto-update status to "Ready" when tracking info is added
      if (order.order_status.toLowerCase() === 'processing') {
        handleStatusUpdate(orderId, 'Ready');
      }
      
      setError('');
    } catch (err) {
      console.error(err);
      setError("Failed to update tracking information");
    } finally {
      setTrackingInfo({ id: null, carrierSlug: '', loading: false });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Update status colors for the new workflow
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'out for delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update icons for the new workflow
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'ready':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'out for delivery':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getCarrierName = (carrierSlug) => {
    const carrier = carriers.find(c => c.slug === carrierSlug);
    return carrier ? carrier.name : 'Unknown Carrier';
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch =
        (order.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         order.tracking_number?.includes(searchTerm) ||
         String(order.id).includes(searchTerm));
      
      const matchesStatus = statusFilter ? order.order_status === statusFilter : true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // First, if one order is in processing/ready and the other isn’t, sort it on top.
      const isAProcessing = ['processing', 'ready'].includes(a.order_status.toLowerCase());
      const isBProcessing = ['processing', 'ready'].includes(b.order_status.toLowerCase());
      if (isAProcessing && !isBProcessing) return -1;
      if (isBProcessing && !isAProcessing) return 1;
  
      // Then sort based on the selected sort field
      if (sortBy === "date") {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortBy === "price") {
        const priceA = parseFloat(a.total_price || 0);
        const priceB = parseFloat(b.total_price || 0);
        return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8 mt-[100px]">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
            <div className="text-sm text-gray-500 mt-1 flex items-center">
              <Link to="/vendor/dashboard" className="hover:text-blue-600">Dashboard</Link>
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="font-medium text-blue-600">Orders</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Processing Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">Rs {stats.totalRevenue}</p>
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

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, product, tracking number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[160px]"
                >
                  <option value="">All Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Ready">Ready</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button 
                onClick={() => toggleSort('date')}
                className={`px-4 py-2 border rounded-lg flex items-center ${
                  sortBy === 'date' ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Date
                {sortBy === 'date' && (
                  sortOrder === 'asc' ? 
                    <ArrowUp className="w-4 h-4 ml-1" /> : 
                    <ArrowDown className="w-4 h-4 ml-1" />
                )}
              </button>
              <button 
                onClick={() => toggleSort('price')}
                className={`px-4 py-2 border rounded-lg flex items-center ${
                  sortBy === 'price' ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Amount
                {sortBy === 'price' && (
                  sortOrder === 'asc' ? 
                    <ArrowUp className="w-4 h-4 ml-1" /> : 
                    <ArrowDown className="w-4 h-4 ml-1" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300" />
            <h3 className="text-xl font-semibold mt-4 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter 
                ? "Try adjusting your search or filter criteria" 
                : "You haven't received any orders yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                    <React.Fragment key={order.id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button 
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="mr-2 text-gray-500 focus:outline-none"
                            >
                              {expandedOrder === order.id ? (
                                <ChevronRight className="w-4 h-4 transform rotate-90" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Order #{order.id}</div>
                              <div className="text-sm text-gray-500">{order.title || order.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.buyerName}</div>
                          <div className="text-sm text-gray-500">{order.buyerEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)} <span className="ml-1">
                              {order.order_status ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1) : 'Processing'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Rs {parseFloat(order.total_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {updateStatus.loading && updateStatus.id === order.id ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : (
                            <select
                              value={order.order_status ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1) : 'Processing'}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className="border border-gray-300 rounded-md p-1 text-sm"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Ready">Ready</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          )}
                        </td>
                      </tr>
                      {expandedOrder === order.id && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            {/* Expanded Order Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
                                  <User className="w-4 h-4 mr-1" /> Buyer: <p className="text-sm text-gray-600 ml-1">{ order.buyerName}</p>
                                </h4>
                                <p className="text-sm text-gray-600 flex items-center">
                                   {order.buyerEmail}
                                </p>
                                {order.buyerPhone && (
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <Phone className="w-4 h-4 mr-1" /> {order.buyerPhone}
                                  </p>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" /> Shipping Address:
                                </h4>
                                <p className="text-sm text-gray-600 mt-2">{order.shipping_address || 'N/A'}</p>
                              </div>
                              <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <Truck className="w-4 h-4 mr-1" /> Shipping Information:
                              </h4>
                              {order.tracking_number ? (
                                <div className="">
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Tracking Number:</span> {order.tracking_number}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Carrier:</span> {getCarrierName(order.carrier_slug)}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic mb-3">No tracking information added yet.</p>
                              )}
                              </div>
                            </div>
                            
                            {/* Tracking Information Section */}
                            <div className="mt-4 p-0">
                              {/* Tracking Information Form */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                  <input
                                    type="text"
                                    placeholder="Tracking Number"
                                    // Use order's tracking number if available; otherwise auto-generate one.
                                    value={
                                      order.tracking_number || generateTrackingNumber()
                                    }
                                    readOnly
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md bg-gray-100"
                                  />
                                </div>
                                <div>
                                  <select
                                    value={trackingInfo.id === order.id ? trackingInfo.carrierSlug : (order.carrier_slug || '')}
                                    onChange={(e) => setTrackingInfo(prev => ({ 
                                      ...prev, 
                                      id: order.id, 
                                      carrierSlug: e.target.value 
                                    }))}
                                    className="w-full p-2 h-full text-sm border border-gray-300 rounded-md"
                                  >
                                    <option value="">Select Carrier</option>
                                    {carriers.map(carrier => (
                                      <option key={carrier.slug} value={carrier.slug}>
                                        {carrier.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <button
                                    onClick={() => handleTrackingUpdate(order.id)}
                                    disabled={trackingInfo.loading}
                                    className="w-full p-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-center items-center"
                                  >
                                    {trackingInfo.loading && trackingInfo.id === order.id ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <>
                                        <Truck className="w-4 h-4 mr-1" />
                                        {order.tracking_number ? 'Update Tracking' : 'Add Tracking'}
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {order.items && order.items.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Items:</h4>
                                <ul className="divide-y divide-gray-200">
                                  {order.items.map(item => (
                                    <li key={item.id} className="py-2 flex justify-between">
                                      <span className="text-sm text-gray-600">
                                        {item.name} (x{item.quantity})
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        Rs {parseFloat(item.price).toFixed(2)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VendorOrders;
