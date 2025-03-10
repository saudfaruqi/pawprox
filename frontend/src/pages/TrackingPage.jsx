import React from "react";
import { Link, useLocation } from "react-router-dom";

const TrackingPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("orderId");
  const trackingNumber = params.get("trackingNumber");
  const carrier = params.get("carrier");
  const status = params.get("status");
  const estimatedDelivery = params.get("estimatedDelivery");

  // Updated progress stage mapping based on new statuses
  const getProgressStage = (currentStatus) => {
    if (!currentStatus) return 0;
    const s = currentStatus.toLowerCase();
    if (s === "processing") return 0;
    if (s === "ready") return 1;
    if (s === "shipped") return 2;
    if (s === "out for delivery") return 3;
    if (s === "delivered") return 4;
    return 0;
  };

  const progressStage = getProgressStage(status);

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Tracking Order #{orderId}</h1>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <span className="text-gray-500 text-sm">Tracking Number</span>
              <p className="text-lg font-semibold">{trackingNumber}</p>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-gray-500 text-sm">Carrier</span>
              <p className="text-lg font-semibold">{carrier}</p>
            </div>
          </div>
          
          {/* Shipping Progress Bar */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Shipping Progress</h2>
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  style={{ width: `${(progressStage / 4) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between">
                <div className={`text-center ${progressStage >= 0 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progressStage >= 0 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <span className="text-xs">Processing</span>
                </div>
                <div className={`text-center ${progressStage >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progressStage >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <span className="text-xs">Ready</span>
                </div>
                <div className={`text-center ${progressStage >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progressStage >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <span className="text-xs">Shipped</span>
                </div>
                <div className={`text-center ${progressStage >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progressStage >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <span className="text-xs">Out for Delivery</span>
                </div>
                <div className={`text-center ${progressStage >= 4 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${progressStage >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <span className="text-xs">Delivered</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status and Estimated Delivery */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between flex-wrap">
              <div className="w-full md:w-1/2 mb-4 md:mb-0">
                <span className="text-gray-500 text-sm">Current Status</span>
                <p className="text-xl font-bold text-blue-600">{status}</p>
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-gray-500 text-sm">Estimated Delivery</span>
                <p className="text-xl font-bold text-blue-600">{formatDate(estimatedDelivery)}</p>
              </div>
            </div>
          </div>
          
          {/* Tracking Updates */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tracking History</h2>
            
            {progressStage >= 0 && (
              <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5"></div>
                <p className="font-semibold">Order Processed</p>
                <p className="text-sm text-gray-500">Your order has been received and is being processed.</p>
              </div>
            )}
            
            {progressStage >= 1 && (
              <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5"></div>
                <p className="font-semibold">Ready</p>
                <p className="text-sm text-gray-500">Your order is now ready for shipping.</p>
              </div>
            )}
            
            {progressStage >= 2 && (
              <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5"></div>
                <p className="font-semibold">Shipped</p>
                <p className="text-sm text-gray-500">Your order has been picked up by {carrier}.</p>
              </div>
            )}
            
            {progressStage >= 3 && (
              <div className="border-l-2 border-blue-500 pl-4 pb-6 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5"></div>
                <p className="font-semibold">Out for Delivery</p>
                <p className="text-sm text-gray-500">Your package is out for delivery.</p>
              </div>
            )}
            
            {progressStage >= 4 && (
              <div className="border-l-2 border-blue-500 pl-4 relative">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-1.5"></div>
                <p className="font-semibold">Delivered</p>
                <p className="text-sm text-gray-500">Your package has been delivered.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Customer Support Section */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
          <p className="mb-4">If you have any questions about your order, please contact our customer support team.</p>
          <Link to="/contact">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
