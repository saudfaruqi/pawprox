


import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Pre-populated shipping details for Karachi, Pakistan
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    email: "",
    shippingAddress: "",
    area: "",
    zipCode: "",
    city: "Karachi",
    state: "Sindh",
    country: "Pakistan",
    saveInfo: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Detailed list of Karachi areas
  const karachiAreas = [
    "Clifton",
    "Defence Housing Authority (DHA)",
    "Gulshan-e-Iqbal",
    "Gulistan-e-Johar",
    "North Nazimabad",
    "Orangi Town",
    "Korangi",
    "Landhi",
    "Saddar",
    "Malir",
    "Gulshan-e-Maymar",
    "Baldia Town",
    "Kemari",
    "SITE Town",
    "Lyari",
    "Shah Faisal Town",
    "North Karachi",
    "Central Karachi",
    "South Karachi"
  ];

  // Calculate order subtotal from cartItems
  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  // State for shipping cost and tax (to be fetched from backend)
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);

  // Calculate final total using backend values
  const finalTotal = totalPrice + shippingCost + tax;

  // Fetch shipping and tax values from backend whenever totalPrice changes
// In your Checkout component's useEffect (or similar)
useEffect(() => {
  const fetchShippingTax = async () => {
    try {
      const response = await axios.post(
        `https://pawprox-6dd216fb1ef5.herokuapp.com/api/shipping-tax`, 
        { orderItems: cartItems.map(item => ({ productId: item.id, quantity: item.quantity })) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setShippingCost(parseFloat(response.data.shippingCost));
      setTax(parseFloat(response.data.tax));
    } catch (error) {
      console.error("Error fetching shipping and tax:", error);
    }
  };

  fetchShippingTax();
}, [cartItems]);


  // Utility functions for card formatting and validation remain unchanged…
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const validateCardNumber = (number) => /^[\d\s]{16,19}$/.test(number);
  const validateExpiry = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [month, year] = expiry.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    if (expMonth < 1 || expMonth > 12) return false;
    return expYear > currentYear || (expYear === currentYear && expMonth >= currentMonth);
  };
  const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateZipCode = (zipCode) => /^\d{5}(-\d{4})?$/.test(zipCode);

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setPaymentInfo({ ...paymentInfo, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e) => {
    const formattedValue = formatExpiry(e.target.value);
    setPaymentInfo({ ...paymentInfo, expiry: formattedValue });
  };

  const detectCardType = (number) => {
    const clean = number.replace(/\s+/g, "");
    if (/^4/.test(clean)) return "visa";
    if (/^5[1-5]/.test(clean)) return "mastercard";
    if (/^3[47]/.test(clean)) return "amex";
    if (/^6(?:011|5)/.test(clean)) return "discover";
    return null;
  };

  const cardType = detectCardType(paymentInfo.cardNumber);

  const handleShippingFormSubmit = (e) => {
    e.preventDefault();
    if (!paymentInfo.name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!validateEmail(paymentInfo.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!paymentInfo.shippingAddress.trim()) {
      setError("Please enter your street address");
      return;
    }
    if (!paymentInfo.area) {
      setError("Please select your area in Karachi");
      return;
    }
    if (!validateZipCode(paymentInfo.zipCode)) {
      setError("Please enter a valid ZIP code");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!validateCardNumber(paymentInfo.cardNumber)) {
      setError("Please enter a valid card number");
      return;
    }
    if (!validateExpiry(paymentInfo.expiry)) {
      setError("Please enter a valid future expiry date (MM/YY)");
      return;
    }
    if (!validateCVV(paymentInfo.cvv)) {
      setError("Please enter a valid CVV");
      return;
    }
    setLoading(true);
    setError(null);
  
    try {
      if (paymentInfo.saveInfo) {
        const shippingInfo = {
          name: paymentInfo.name,
          email: paymentInfo.email,
          shippingAddress: paymentInfo.shippingAddress,
          area: paymentInfo.area,
          zipCode: paymentInfo.zipCode,
          city: paymentInfo.city,
          state: paymentInfo.state,
          country: paymentInfo.country
        };
        localStorage.setItem("shippingInfo", JSON.stringify(shippingInfo));
      }
  
      const fullShippingAddress = `${paymentInfo.shippingAddress}, ${paymentInfo.area}, ${paymentInfo.city}, ${paymentInfo.state}, ${paymentInfo.country}`;
  
      const response = await axios.post(
        "https://pawprox-6dd216fb1ef5.herokuapp.com/api/orders",    
        {
          orderItems: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          paymentDetails: {
            totalPrice: finalTotal,
            subtotal: totalPrice,
            tax,
            shippingCost,
            cardNumber: paymentInfo.cardNumber,
            expiry: paymentInfo.expiry,
            cvv: paymentInfo.cvv,
            name: paymentInfo.name,
            email: paymentInfo.email,
            shippingAddress: fullShippingAddress,
            zipCode: paymentInfo.zipCode,
            saveInfo: paymentInfo.saveInfo
          }
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
  
      if (response.data.orderId) {
        setSuccess(true);
        clearCart();
        setTimeout(() => {
          navigate("/order-history", {
            state: {
              orderId: response.data.orderId,
              orderDetails: {
                items: cartItems,
                subtotal: totalPrice,
                tax,
                shippingCost,
                total: finalTotal
              }
            }
          });
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message;
      if (errorMsg && errorMsg.includes("Insufficient stock")) {
        setError("Limited stock available. Please choose a quantity that is equal to or less than the available stock.");
      } else {
        setError(errorMsg || "Payment failed. Please try again.");
      }
    }
    setLoading(false);
  };
  

  useEffect(() => {
    const savedInfo = localStorage.getItem("shippingInfo");
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setPaymentInfo((prev) => ({
          ...prev,
          ...parsed,
          saveInfo: true
        }));
      } catch (err) {
        console.error("Error parsing saved shipping info", err);
      }
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="w-20 h-20 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your order has been placed and is being processed.</p>
          <div className="animate-pulse mb-6 flex justify-center">
            <div className="bg-gray-200 rounded-full h-2 w-32"></div>
          </div>
          <p className="text-sm text-gray-500">Redirecting to your order confirmation...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium mb-4 text-gray-800">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Discover our products and start shopping!</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium shadow-md hover:shadow-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Checkout</h1>
        <div className="flex flex-col items-between w-[60%]">
          <div className="flex items-center mb-6">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white'}`}>1</div>
            <div className={`h-1 w-28 ${step === 1 ? 'bg-gray-300' : 'bg-green-500'}`}></div>
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
          </div>
          <div className="flex text-sm text-gray-600 space-x-20">
            <span className={step >= 1 ? 'font-medium text-indigo-600' : ''}>Shipping</span>
            <span className={step >= 2 ? 'font-medium text-indigo-600' : ''}>Payment</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 pb-2 border-b">Shipping Information</h2>
              <form onSubmit={handleShippingFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={paymentInfo.name}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={paymentInfo.email}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Street Address</label>
                  <input
                    type="text"
                    value={paymentInfo.shippingAddress}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, shippingAddress: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Select Area</label>
                  <select
                    value={paymentInfo.area}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, area: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">-- Select an area in Karachi --</option>
                    {karachiAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={paymentInfo.zipCode}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, zipCode: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={`${paymentInfo.city}, ${paymentInfo.state}, ${paymentInfo.country}`}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={paymentInfo.saveInfo}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, saveInfo: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700 text-sm">Save this information for next time</span>
                  </label>
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          )}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 pb-2 border-b">Payment Information</h2>
              <form onSubmit={handlePayment}>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-10"
                      placeholder="0000 0000 0000 0000"
                      maxLength="19"
                      required
                    />
                    {cardType ? (
                      <span className="absolute right-3 top-3 text-gray-400">
                        {cardType === "visa" && "Visa"}
                        {cardType === "mastercard" && "Mastercard"}
                        {cardType === "amex" && "American Express"}
                        {cardType === "discover" && "Discover"}
                      </span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={paymentInfo.expiry}
                      onChange={handleExpiryChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Security Code (CVV)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        maxLength="4"
                        required
                      />
                      <span className="absolute right-3 top-3 text-gray-400 text-sm cursor-help" title="3 or 4 digit security code on the back of your card">?</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <p className="text-sm text-gray-600 mb-2">Shipping Address:</p>
                  <p className="text-gray-900 font-medium">{paymentInfo.name}</p>
                  <p className="text-gray-700">{paymentInfo.shippingAddress}, {paymentInfo.area}</p>
                  <p className="text-gray-700">{paymentInfo.city}, {paymentInfo.state}, {paymentInfo.country}</p>
                  <p className="text-gray-700">ZIP: {paymentInfo.zipCode}</p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-indigo-600 text-sm font-medium mt-2 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay Rs ${finalTotal.toFixed(2)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>
            <div className="max-h-80 overflow-y-auto mb-4 pr-2">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      {item.image && (
                        <div className="relative">
                          <img 
                            src={item.image?.startsWith("data:") ? item.image : `https://pawprox-6dd216fb1ef5.herokuapp.com/${item.image}`}
                            alt={item.title}
                            className="h-16 w-16 object-cover rounded mr-4"
                          />
                          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                      )}
                      <div className="truncate max-w-[120px]">
                        <h3 className="text-gray-800 font-medium text-sm truncate">{item.title}</h3>
                        <p className="text-gray-500 text-xs">
                          Rs {parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-700">Rs {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping</span>
                <span className="text-gray-700">Rs {shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tax</span>
                <span className="text-gray-700">Rs {tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">Rs {finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
