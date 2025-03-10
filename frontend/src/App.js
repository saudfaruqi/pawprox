import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import PrivateRoute from "./PrivateRoute";
import { Link } from "react-router-dom";

// Public pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./components/auth/Login"));
const Logout = lazy(() => import("./components/auth/Logout"));
const Signup = lazy(() => import("./components/auth/Signup"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const BlogContent = lazy(() => import("./pages/BlogContent"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));

// Vendor pages
const VendorDashboard = lazy(() => import("./pages/VendorDashboard"));
const VendorProducts = lazy(() => import("./pages/VendorProducts"));
const VendorOrders = lazy(() => import("./pages/VendorOrders"));

// Other protected pages (user-specific)
const LostFound = lazy(() => import("./pages/LostFound"));
const Community = lazy(() => import("./pages/Community"));
const PetCareServices = lazy(() => import("./pages/PetCareServices"));
const MedicalFacilities = lazy(() => import("./pages/MedicalFacilities"));
const Cart = lazy(() => import("./pages/Cart"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const Messages = lazy(() => import("./pages/Messages"));
const Settings = lazy(() => import("./pages/Settings"));


// Unauthorized access page

const Unauthorized = () => {
  const activeRole = localStorage.getItem("activeRole") || "user";
  const returnUrl = activeRole === "vendor" ? "/vendor/dashboard" : "/";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Wrong Page</h1>
        <p className="text-gray-600 mb-6">
          It appears you've reached a page that isn’t available for your account type.
          Please refrain from repeatedly attempting to access this area. If you believe
          this is an error, contact support for assistance.
        </p>
        <Link
          to={returnUrl}
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};


function App() {
  // Determine the active role from localStorage
  const activeRole = localStorage.getItem("activeRole") || "user";

  return (
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          {/* For vendors, root "/" redirects to vendor dashboard */}
          <Route path="/" element={activeRole === "vendor" ? <Navigate to="/vendor/dashboard" replace /> : <Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/blog/:blogType" element={<BlogContent />} />
          <Route path="/product/:productId" element={<ProductDetails />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/settings" element={<Settings />} />

          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Vendor Protected Routes */}
          <Route element={<PrivateRoute role="vendor" />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<VendorProducts />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
          </Route>

          {/* User Protected Routes */}
          <Route element={<PrivateRoute role="user" />}>
            <Route path="/lostfound" element={<LostFound />} />
            <Route path="/community" element={<Community />} />
            <Route path="/petcare" element={<PetCareServices />} />
            <Route path="/medicalfacilities" element={<MedicalFacilities />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/messages" element={<Messages />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
