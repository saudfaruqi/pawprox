import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ShoppingBag,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Truck,
  X,
  Calendar,
  Package,
  ArrowLeft,
  ArrowRight,
  Sliders,
} from "lucide-react";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const ordersPerPage = 5;
  const [isLoading, setIsLoading] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(response.data.orders);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Unable to load your orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, filterStatus]);

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(
        () => setNotification({ message: "", type: "" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getStatusColor = (status) => {
    switch ((status || "processing").toLowerCase()) {
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
  

  const statusIcon = (status) => {
    switch ((status || "processing").toLowerCase()) {
      case "processing":
        return <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>;
      case "ready":
        return <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>;
      case "shipped":
        return <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>;
      case "out for delivery":
        return <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>;
      case "delivered":
        return <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>;
      case "cancelled":
        return <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>;
      default:
        return <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>;
    }
  };
  

  const filterOrders = (ordersToFilter) => {
    let filtered = ordersToFilter;
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (order) =>
          (order.order_status || "pending").toLowerCase() ===
          filterStatus.toLowerCase()
      );
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          String(order.id).includes(query) ||
          (order.shipping_address &&
            order.shipping_address.toLowerCase().includes(query)) ||
          (order.items &&
            order.items.some((item) =>
              item.product_name.toLowerCase().includes(query)
            ))
      );
    }
    return filtered;
  };

  const sortOrders = (ordersToSort) => {
    switch (sortBy) {
      case "date-asc":
        return [...ordersToSort].sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      case "date-desc":
        return [...ordersToSort].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
      case "price-asc":
        return [...ordersToSort].sort(
          (a, b) => Number(a.total_price) - Number(b.total_price)
        );
      case "price-desc":
        return [...ordersToSort].sort(
          (a, b) => Number(b.total_price) - Number(a.total_price)
        );
      case "status":
        return [...ordersToSort].sort((a, b) => {
          const statusA = (a.order_status || "pending").toLowerCase();
          const statusB = (b.order_status || "pending").toLowerCase();
          return statusA.localeCompare(statusB);
        });
      default:
        return ordersToSort;
    }
  };

  const displayedOrders = useMemo(
    () => sortOrders(filterOrders(orders)),
    [orders, sortBy, filterStatus, searchQuery]
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = displayedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(displayedOrders.length / ordersPerPage);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleReorder = async (order) => {
    setIsLoading((prev) => ({ ...prev, [order.id]: "reorder" }));
    try {
      const response = await axios.post(
        `http://localhost:5001/api/orders/${order.id}/reorder`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      console.log("Re-order response:", response.data);
      setNotification({
        message:
          "Order re-created successfully! Check your cart to complete checkout.",
        type: "success",
      });
      fetchOrders();
    } catch (err) {
      console.error("Reorder failed:", err.response?.data || err.message);
      setNotification({
        message: "Failed to re-order. Please try again later.",
        type: "error",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const handleDownloadInvoice = async (order) => {
    setIsLoading((prev) => ({ ...prev, [order.id]: "invoice" }));
    try {
      const response = await axios.get(
        `http://localhost:5001/api/orders/${order.id}/invoice`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([response.data], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${order.id}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setNotification({
        message: "Invoice downloaded successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Invoice download failed:", err);
      setNotification({
        message: "Failed to download invoice. Please try again later.",
        type: "error",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const handleTrackOrder = async (order) => {
    setIsLoading((prev) => ({ ...prev, [order.id]: "track" }));
    try {
      const response = await axios.get(
        `http://localhost:5001/api/orders/${order.id}/track`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const { tracking } = response.data;
      // Build a URL to a tracking details page.
      // Here, we assume you have a tracking page at /tracking that accepts these query parameters.
      const trackingPageUrl = `http://localhost:3000/tracking?orderId=${tracking.orderId}&trackingNumber=${tracking.trackingNumber}&carrier=${tracking.carrier}&status=${tracking.status}&estimatedDelivery=${tracking.estimatedDelivery}`;
      window.open(trackingPageUrl, "_blank");
      setNotification({
        message: "Tracking information opened in a new tab.",
        type: "success",
      });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Unable to track order at this time. Please try again later.";
      setNotification({
        message: errMsg,
        type: "error",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };
  

  // Updated cancel order: call backend endpoint to update status to "cancelled"
  const handleCancelOrder = async (order) => {
    if (window.confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
      setIsLoading((prev) => ({ ...prev, [order.id]: "cancel" }));
      try {
        const response = await axios.put(
          `http://localhost:5001/api/orders/${order.id}/status`,
          { status: "cancelled" },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        console.log("Cancel order response:", response.data);
        setNotification({
          message: `Order #${order.id} has been cancelled successfully`,
          type: "success",
        });
        fetchOrders();
      } catch (err) {
        console.error("Cancel order failed:", err.response?.data || err.message);
        setNotification({
          message: "Unable to cancel order at this time. Please try again later.",
          type: "error",
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, [order.id]: false }));
      }
    }
  };

  const renderOrderStatusBadge = (status) => {
    return (
      <div
        className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(
          status
        )}`}
      >
        {statusIcon(status)}
        <span>
          {status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : "Processing"}
        </span>
      </div>
    );
  };

  const clearFilters = () => {
    setSortBy("date-desc");
    setFilterStatus("all");
    setSearchQuery("");
  };

  // Only allow cancellation for pending or processing orders
  const canBeCancelled = (status) => {
    return ["pending", "processing"].includes(
      (status || "pending").toLowerCase()
    );
  };

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-[90vh] pt-[120px] pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <ShoppingBag className="mr-2 text-indigo-600" size={28} />
                  Order History
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage your previous orders
                </p>
              </div>
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Sliders size={16} className="mr-2" />
                Filters {isFiltersOpen ? "▲" : "▼"}
              </button>
            </div>

            {/* Notification */}
            {notification.message && (
              <div
                className={`mt-4 p-4 rounded-md flex items-center justify-between ${
                  notification.type === "error"
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                }`}
              >
                <span className="flex items-center">
                  {notification.type === "error" ? (
                    <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  ) : (
                    <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                      <svg
                        className="h-4 w-4 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414L10 14.414l-3.707-3.707a1 1 0 00-1.414 1.414l4.414 4.414a1 1 0 001.414 0l7-7a1 1 0 00-1.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                  {notification.message}
                </span>
                <button
                  onClick={() => setNotification({ message: "", type: "" })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Filters */}
            {isFiltersOpen && (
              <div className="mt-5 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="sort-by"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Sort By
                    </label>
                    <select
                      id="sort-by"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="price-desc">Highest Price</option>
                      <option value="price-asc">Lowest Price</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="filter-status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Filter by Status
                    </label>
                    <select
                      id="filter-status"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                    <option value="all">All Statuses</option>
                    <option value="processing">Processing</option>
                    <option value="ready">Ready</option>
                    <option value="shipped">Shipped</option>
                    <option value="out for delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="search-query"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Search
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="search-query"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      {searchQuery && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order list */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white shadow-sm rounded-lg p-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-gray-600">Loading your orders...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg flex items-center">
                <AlertCircle className="mr-3 h-6 w-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-medium">Error loading orders</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : displayedOrders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "You haven't placed any orders yet."}
                </p>
                {(searchQuery || filterStatus !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              displayedOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* Order header */}
                  <div
                    className={`p-4 cursor-pointer border-l-4 ${
                      order.order_status === "cancelled"
                        ? "border-red-500"
                        : order.order_status === "delivered" ||
                          order.order_status === "completed"
                        ? "border-emerald-500"
                        : order.order_status === "shipped"
                        ? "border-indigo-500"
                        : order.order_status === "processing"
                        ? "border-blue-500"
                        : "border-amber-500"
                    }`}
                    onClick={() =>
                      setSelectedOrder(selectedOrder === order.id ? null : order.id)
                    }
                  >
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div>
                        <div className="flex items-center flex-wrap">
                          <h2 className="text-lg font-bold text-gray-900 mr-3">
                            Order {index + 1 + indexOfFirstOrder}
                          </h2>
                          {renderOrderStatusBadge(order.order_status)}
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar size={15} className="mr-1 text-gray-400" />
                            {formatDate(order.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Package size={15} className="mr-1 text-gray-400" />
                            {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center">
                            Rs {Number(order.total_price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 self-end">
                        {selectedOrder === order.id ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order details */}
                  {selectedOrder === order.id && (
                    <div className="border-t border-gray-200">
                      {/* Order items table */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-base font-medium text-gray-900">Order Items</h3>
                      </div>
                      <div className="overflow-x-auto">
                        {order.items && order.items.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Image
                                </th>
                                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Product
                                </th>
                                <th className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Quantity
                                </th>
                                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {order.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <img
                                      src={
                                        item.product_image?.startsWith("data:")
                                          ? item.product_image
                                          : `http://localhost:5001/${item.product_image}`
                                      }
                                      alt={item.product_name}
                                      className="h-12 w-12 object-cover rounded-md"
                                    />
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.product_name}
                                    </div>
                                    {item.variant && (
                                      <div className="text-xs text-gray-500">
                                        {item.variant}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                    {item.quantity}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                    Rs {Number(item.price).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                    Rs {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr>
                                <td
                                  colSpan="4"
                                  className="px-4 py-3 text-right text-sm font-medium text-gray-500"
                                >
                                  Subtotal
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                                  Rs {Number(order.total_price - (order.shipping_cost || 0)).toFixed(2)}
                                </td>
                              </tr>
                              {order.shipping_cost && (
                                <tr className="bg-gray-50">
                                  <td
                                    colSpan="4"
                                    className="px-4 py-2 text-right text-sm font-medium text-gray-500"
                                  >
                                    Shipping
                                  </td>
                                  <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                    Rs {Number(order.shipping_cost).toFixed(2)}
                                  </td>
                                </tr>
                              )}
                              <tr className="bg-gray-50">
                                <td
                                  colSpan="4"
                                  className="px-4 py-3 text-right text-sm font-bold text-gray-900"
                                >
                                  Total
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                                  Rs {Number(order.total_price).toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        ) : (
                          <div className="p-4 italic text-gray-500 text-center">
                            No item details available
                          </div>
                        )}
                      </div>

                      {/* Order details and actions */}
                      <div className="p-4 sm:p-6 bg-white border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-500">Order Details</h4>
                            {order.shipping_address && (
                              <div className="flex">
                                <div className="flex-shrink-0 mt-1">
                                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div className="ml-3 text-sm text-gray-700">
                                  <p className="font-medium">Shipping Address</p>
                                  <p>{order.shipping_address}</p>
                                </div>
                              </div>
                            )}
                            {order.payment_method && (
                              <div className="flex">
                                <div className="flex-shrink-0 mt-1">
                                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                </div>
                                <div className="ml-3 text-sm text-gray-700">
                                  <p className="font-medium">Payment Method</p>
                                  <p>{order.payment_method}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-500">Tracking & Shipping</h4>
                            {order.shipping_method && (
                              <div className="flex">
                                <div className="flex-shrink-0 mt-1">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-3 text-sm text-gray-700">
                                  <p className="font-medium">Shipping Method</p>
                                  <p>{order.shipping_method}</p>
                                </div>
                              </div>
                            )}
                            {order.tracking_number && (
                              <div className="flex">
                                <div className="flex-shrink-0 mt-1">
                                  <Truck className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-3 text-sm text-gray-700">
                                  <p className="font-medium">Tracking Number</p>
                                  <p>{order.tracking_number}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2 justify-end">
                          {canBeCancelled(order.order_status) && (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              disabled={isLoading[order.id] === "cancel"}
                              className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading[order.id] === "cancel"
                                ? "Cancelling..."
                                : "Cancel Order"}
                            </button>
                          )}
                          <button
                            onClick={() => handleTrackOrder(order)}
                            disabled={isLoading[order.id] === "track"}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {isLoading[order.id] === "track" ? (
                              <>Tracking...</>
                            ) : (
                              <>
                                <Truck size={16} className="mr-2" />
                                Track Order
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReorder(order)}
                            disabled={isLoading[order.id] === "reorder"}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {isLoading[order.id] === "reorder" ? (
                              <>Re-ordering...</>
                            ) : (
                              <>
                                <RefreshCw size={16} className="mr-2" />
                                Re-order
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            disabled={isLoading[order.id] === "invoice"}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {isLoading[order.id] === "invoice" ? (
                              <>Downloading...</>
                            ) : (
                              <>
                                <Download size={16} className="mr-2" />
                                Download Invoice
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderHistory;
