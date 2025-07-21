import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Plus,
  Minus,
  Info,
  Tag,
  Truck,
  Clock,
  ShieldCheck
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";
import { Transition } from '@headlessui/react';

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);


  const [userReview, setUserReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const { addToCart, isInCart, updateCartItemQuantity, cartItems } = useContext(CartContext);
  const navigate = useNavigate();



  // Retrieve user details from localStorage if logged in
  const user =
    isLoggedIn && localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;


  // Format price safely
  const formatPrice = (price) => {
    const numPrice = Number(price) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/marketplace/${productId}`);  
        const productData = response.data.item;
        setProduct(productData);
        
        setSelectedImage(
          productData.image?.startsWith("data:") 
            ? productData.image 
            : `https://pawprox-6dd216fb1ef5.herokuapp.com/${productData.image}`
        );

        // Check favorites
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(parseInt(productId)));

        fetchRecommendations(productData.category);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  // Set quantity from cart if product is already added
  useEffect(() => {
    if (product) {
      const existingItem = cartItems.find(item => item.id === product.id);
      if (existingItem) {
        setQuantity(existingItem.quantity);
      }
    }
  }, [product, cartItems]);

  // Fetch recommendations
  const fetchRecommendations = async (category) => {
    try {
      const response = await axios.get(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/marketplace?category=${category}`); 
      const items = response.data.items || response.data;
      const filteredRecommendations = items.filter(
        (item) => item.id !== parseInt(productId)
      ).slice(0, 4);
      setRecommendations(filteredRecommendations);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    }
  };

// Fetch reviews as soon as the product is loaded, not only when tab changes
useEffect(() => {
  if (product) {
    axios.get(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews?productId=${product.id}`) 
      .then(response => setReviews(response.data.reviews))
      .catch(err => console.error("Error fetching reviews", err));
  }
}, [product]);


  // Handle quantity change
  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (product) {
      if (isInCart(product.id)) {
        updateCartItemQuantity(product.id, quantity);
        showNotification("Cart updated successfully!");
      } else {
        addToCart({ ...product, quantity });
        showNotification("Product added to cart!");
      }
    }
  };

  // Toggle favorite
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const productIdInt = parseInt(productId);
    if (isFavorite) {
      const updatedFavorites = favorites.filter(id => id !== productIdInt);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      showNotification("Removed from favorites", "info");
    } else {
      favorites.push(productIdInt);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      showNotification("Added to favorites", "success");
    }
    setIsFavorite(!isFavorite);
  };

  // Share product
  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out this ${product.title} on our Pet Store!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard!", "info");
    }
  };


// Enhanced review submission handler with better error handling
const handleReviewSubmit = async (e) => {
  e.preventDefault();
  
  const token = localStorage.getItem("token");
  console.log("Token exists:", !!token);
  
  if (!token) {
    showNotification("Please login to submit a review", "error");
    return;
  }
  
  if (!reviewComment.trim()) {
    showNotification("Please enter a review comment", "error");
    return;
  }
  
  // Debug logging
  console.log("Submitting review with data:", {
    productId: product.id,
    rating: reviewRating,
    comment: reviewComment,
    editingReview: editingReview,
    productType: typeof product.id,
    ratingType: typeof reviewRating
  });
  
  try {
    const requestData = {
      productId: Number(product.id), // Ensure it's a number
      rating: Number(reviewRating),  // Ensure it's a number
      comment: reviewComment.trim()
    };
    
    console.log("Request data being sent:", requestData);
    console.log("Request URL:", editingReview ? 
      `https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews/${editingReview.id}` :  
      "https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews" 
    );
    
    let response;
    
    if (editingReview) {
      // Update existing review
      console.log("Updating review with ID:", editingReview.id);
      response = await axios.put(
        `https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews/${editingReview.id}`,
        {
          rating: Number(reviewRating),
          comment: reviewComment.trim() 
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      // Create new review
      console.log("Creating new review");
      response = await axios.post(
        "https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews",
        requestData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
    }
    
    console.log("Review submission response:", response.data);
    showNotification(editingReview ? "Review updated successfully!" : "Review submitted successfully!");
    
    // Refresh reviews and user review
    try {
      const { data } = await axios.get(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews?productId=${product.id}`);
      setReviews(data.reviews);
      await fetchUserReview();
    } catch (refreshError) {
      console.error("Error refreshing reviews:", refreshError);
      // Don't show an error for this, the main operation succeeded
    }
    
    // Reset form 
    setReviewComment("");
    setReviewRating(5);
    setIsReviewFormVisible(false);
    setIsEditFormVisible(false);
    setEditingReview(null);
    
  } catch (error) {
    console.error("Full error object:", error);
    console.error("Error response:", error.response);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    console.error("Error response headers:", error.response?.headers);
    
    let errorMsg = "Error processing review, please try again.";
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        errorMsg = "Please log in again to submit a review.";
        // Optionally redirect to login
        // navigate('/login');
      } else if (status === 400) {
        errorMsg = data.error || "Invalid review data. Please check your input.";
      } else if (status === 404) {
        errorMsg = editingReview ? "Review not found or you don't have permission to update it." : "Product not found.";
      } else if (status === 500) {
        errorMsg = "Server error. Please try again later.";
      } else {
        errorMsg = data.error || data.message || errorMsg;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMsg = "Unable to connect to server. Please check your internet connection.";
    } else {
      // Something else happened
      errorMsg = "An unexpected error occurred. Please try again.";
    }
    
    console.log("Showing error message:", errorMsg);
    showNotification(errorMsg, "error");
  }
};

// Enhanced delete review handler
const handleDeleteReview = async (reviewId) => {
  if (!window.confirm("Are you sure you want to delete this review?")) {
    return;
  }
  
  const token = localStorage.getItem("token");
  
  if (!token) {
    showNotification("Please log in to delete your review", "error");
    return;
  }
  
  if (!reviewId) {
    showNotification("Invalid review ID", "error");
    return;
  }
  
  try {
    console.log("Deleting review with ID:", reviewId);
    console.log("Using token:", !!token);
    
    const response = await axios.delete(
      `https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews/${reviewId}`,
      {
        headers: {  
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log("Delete response:", response.data);
    showNotification("Review deleted successfully!", "info");
    
    // Refresh reviews and user review
    try {
      const { data } = await axios.get(`https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews?productId=${product.id}`);
      setReviews(data.reviews);
      setUserReview(null);
    } catch (refreshError) {
      console.error("Error refreshing reviews after delete:", refreshError); 
      // The delete succeeded, so we can still show success
    }
    
  } catch (error) {
    console.error("Error deleting review:", error);
    console.error("Error response:", error.response);
    
    let errorMsg = "Error deleting review, please try again.";
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        errorMsg = "Please log in again to delete your review.";
      } else if (status === 404) {
        errorMsg = "Review not found or you don't have permission to delete it.";
      } else if (status === 400) {
        errorMsg = data.error || "Invalid request. Unable to delete review.";
      } else if (status === 500) {
        errorMsg = "Server error. Please try again later.";
      } else {
        errorMsg = data.error || data.message || errorMsg;
      }
    } else if (error.request) {
      errorMsg = "Unable to connect to server. Please check your internet connection.";
    } else {
      errorMsg = "An unexpected error occurred while deleting the review.";
    }
    
    showNotification(errorMsg, "error");
  }
};

// Enhanced fetch user review function
const fetchUserReview = async () => {
  if (!isLoggedIn || !product) return;
  
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found for fetching user review");
      return;
    }
    
    console.log("Fetching user review for product:", product.id);
    
    const response = await axios.get(
      `https://pawprox-6dd216fb1ef5.herokuapp.com/api/reviews/user/${product.id}`,
      { 
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log("User review response:", response.data);
    setUserReview(response.data.review);
  } catch (error) {
    if (error.response?.status === 404) {
      // User hasn't reviewed this product yet - this is normal
      console.log("No existing review found for user");
      setUserReview(null);
    } else {
      console.error("Error fetching user review:", error);
      // Don't show notification for this error as it's not critical
    }
  }
};


    // Handle edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
    setIsEditFormVisible(true);
    setIsReviewFormVisible(false);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingReview(null);
    setIsEditFormVisible(false);
    setReviewComment("");
    setReviewRating(5);
  };



  // Mock product images (in production these come from product data)
  const productImages = product
  ? [
      product.image?.startsWith("data:")
        ? product.image
        : `https://pawprox-6dd216fb1ef5.herokuapp.com/${product.image}`,
      ...(product.detail_images
        ? JSON.parse(product.detail_images).map((img) => `https://pawprox-6dd216fb1ef5.herokuapp.com/${img}`)
        : []) 
    ]
  : [];  

  const getProfilePicUrl = (pic) => {
    if (!pic) return null;
    return pic.startsWith('http') ? pic : `https://pawprox-6dd216fb1ef5.herokuapp.com/${pic}`;
  };


  // Calculate average rating from reviews
  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : Number(product?.rating) || 0;

  // Get rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center mt-[110px]">
          <div className="animate-pulse space-y-8 w-full max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 bg-gray-200 rounded-lg h-80"></div>
              <div className="md:w-1/2 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
            <div className="h-40 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center mt-[110px]">
          <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-lg text-center max-w-md">
            <p className="text-lg font-medium mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If product not found
  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex justify-center items-center mt-[110px]">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-8 rounded-lg text-center max-w-md">
            <p className="text-lg font-medium mb-4">Product not found</p>
            <Link to="/marketplace" className="bg-[#2E6166] text-white px-4 py-2 rounded-lg hover:bg-[#1a4e4b] transition duration-200">
              Back to Marketplace
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {/* Notification Toast */}
      <Transition
        show={notification.show}
        enter="transition ease-out duration-300"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className="fixed top-20 right-4 z-50"
      >
        <div className={`rounded-lg shadow-lg px-6 py-3 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 
          notification.type === 'info' ? 'bg-blue-500 text-white' : 
          'bg-green-500 text-white'
        }`}>
          {notification.message}
        </div>
      </Transition>

      <div className="min-h-screen bg-gray-50 pt-[110px] pb-12">
        <div className="container mx-auto px-4">
          {/* Back button and breadcrumbs */}
          <div className="mb-6 flex flex-wrap items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-[#2E6166] transition duration-200">
              <ArrowLeft size={18} className="mr-1" />
              <span>Back</span>
            </button>
            <div className="text-sm text-gray-500">
              <Link to="/" className="hover:text-[#2E6166]">Home</Link>
              <span className="mx-2">›</span>
              <Link to="/marketplace" className="hover:text-[#2E6166]">Marketplace</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-700">{product.title}</span>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="w-full h-[400px] object-contain bg-gray-100 p-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/400/400";
                    }}
                  />
                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                      {product.discount}% OFF
                    </div>
                  )}
                  {/* Zoom overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 cursor-zoom-in">
                    <span className="text-white bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Info size={20} />
                    </span>
                  </div>
                </div>
                {/* Thumbnail gallery */}
                <div className="flex justify-center mt-4 px-4 space-x-2 overflow-x-auto">
                  {productImages.map((img, index) => (
                    <button 
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        selectedImage === img ? 'border-[#2E6166]' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.title} thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/400/400";
                        }}
                      />
                    </button>
                  ))}
                </div>

              </div>

              <div className="md:w-1/2 p-6 md:p-8">
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                  {Number(product.stock) > 0 ? (
                    <span className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      In Stock
                    </span>
                  ) : (
                    <span className="ml-3 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {product.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={`${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                  <button 
                    onClick={() => {
                      setActiveTab("reviews");
                      setTimeout(() => {
                        document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="ml-2 text-sm text-[#2E6166] hover:underline"
                  >
                    See all reviews
                  </button>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-[#2E6166]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-3 text-lg text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.discount > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Save {formatPrice(product.originalPrice - product.price)} ({product.discount}%)
                    </p>
                  )}
                </div>

                {/* Short Description */}
                <p className="text-gray-600 mb-6">
                  {product.shortDescription || product.description || "No description available."}
                </p>

                {/* Product Highlights */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Highlights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <ShieldCheck size={16} className="mr-2 text-green-600" />
                      <span>Quality guaranteed with 30-day return policy</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <Truck size={16} className="mr-2 text-blue-600" />
                      <span>Fast shipping available</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <Tag size={16} className="mr-2 text-purple-600" />
                      <span>Best price guarantee</span>
                    </li>
                    {Number(product.stock) <= 5 && Number(product.stock) > 0 && (
                      <li className="flex items-center text-sm">
                        <Clock size={16} className="mr-2 text-red-600" />
                        <span>Limited stock available - only {product.stock} left!</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} className={quantity <= 1 ? "text-gray-300" : "text-gray-600"} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-16 h-10 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-[#2E6166]"
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      disabled={quantity >= 10}
                    >
                      <Plus size={16} className={quantity >= 10 ? "text-gray-300" : "text-gray-600"} />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={Number(product.stock) <= 0}
                    className={`flex-1 flex items-center justify-center rounded-lg px-6 py-3 font-medium ${
                      Number(product.stock) > 0
                        ? "bg-[#2E6166] text-white hover:bg-[#1a4e4b] transform hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    } transition duration-200`}
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    {isInCart(product.id) ? "Update Cart" : "Add to Cart"}
                  </button>
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-lg border ${
                      isFavorite
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "border-gray-300 text-gray-500 hover:border-[#2E6166] hover:text-[#2E6166]"
                    } transition duration-200 transform hover:scale-105`}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart size={20} className={isFavorite ? "fill-red-500" : ""} />
                  </button>
                  <button
                    onClick={shareProduct}
                    className="p-3 rounded-lg border border-gray-300 text-gray-500 hover:border-[#2E6166] hover:text-[#2E6166] transition duration-200 transform hover:scale-105"
                    aria-label="Share product"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="border-t border-gray-200 mt-4">
              <div className="flex border-b overflow-x-auto">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "description"
                      ? "border-b-2 border-[#2E6166] text-[#2E6166]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "details"
                      ? "border-b-2 border-[#2E6166] text-[#2E6166]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Details & Specs
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "reviews"
                      ? "border-b-2 border-[#2E6166] text-[#2E6166]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === "shipping"
                      ? "border-b-2 border-[#2E6166] text-[#2E6166]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Shipping & Returns
                </button>
              </div>

              <div className="p-6" id="tab-content">
              {activeTab === "description" && (
                <div className="text-gray-700 prose max-w-none">
                  <p>{product.description || "No detailed description available."}</p>
                  {/* Dynamic Features & Benefits */}
                  <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Features</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.features
                          ? product.features
                              .split("\n")
                              .filter((f) => f.trim() !== "")
                              .map((feature, idx) => <li key={idx}>{feature}</li>)
                          : <li>No features provided.</li>}
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Benefits</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {product.benefits
                          ? product.benefits
                              .split("\n")
                              .filter((b) => b.trim() !== "")
                              .map((benefit, idx) => <li key={idx}>{benefit}</li>)
                          : <li>No benefits provided.</li>}
                       </ul>
                     </div>
                   </div>
                 </div>
                )}
                {activeTab === "details" && (
                  <div className="text-gray-700">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-4">Product Specifications</h3>
                        <div className="space-y-2">
                          <div className="flex border-b pb-2">
                            <span className="font-medium text-gray-600 w-1/3">SKU: </span>
                            <span className="text-gray-700">{product.sku || "N/A"}</span>
                          </div>
                          <div className="flex border-b pb-2">
                            <span className="font-medium text-gray-600 w-1/3">Category: </span>
                            <span className="text-gray-700">{product.category}</span>
                          </div>
                          <div className="flex border-b pb-2">
                            <span className="font-medium text-gray-600 w-1/3">Dimensions: </span>
                            <span className="text-gray-700">{product.dimensions || "N/A"}</span>
                          </div>
                          <div className="flex border-b pb-2">
                            <span className="font-medium text-gray-600 w-1/3">Weight: </span>
                            <span className="text-gray-700">{product.weight || "N/A"}</span>
                          </div>
                          <div className="flex border-b pb-2">
                            <span className="font-medium text-gray-600 w-1/3">Materials: </span>
                            <span className="text-gray-700">{product.materials || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-4">Additional Information</h3>
                        <div className="prose text-gray-700">
                          <p>{product.details || "No additional information available."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


{activeTab === "reviews" && (
  <div className="text-gray-700" id="reviews-section">
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg">
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">Based on {reviews.length} reviews</div>
        </div>
        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center">
              <span className="w-6 text-sm">{rating}</span>
              <div className="flex-1 bg-gray-200 rounded h-2 mx-2">
                <div className="bg-[#2E6166] h-2 rounded" style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="w-10 text-right text-sm">{count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="md:col-span-2">
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => {
              // Check if this review belongs to the current user
              const isUserReview = isLoggedIn && user && (
                review.userId === user.id || 
                review.user_id === user.id || 
                review.username === user.username
              );
              
              return (
                <div 
                  key={review.id} 
                  className={`border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${
                    isUserReview ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`} 
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {review.profilePic ? (
                        <img
                          src={review.profilePic.startsWith('http') ? review.profilePic : `https://pawprox-6dd216fb1ef5.herokuapp.com/${review.profilePic}`}
                          alt={`${review.username}'s profile`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                        style={{ display: review.profilePic ? 'none' : 'flex' }}
                      >
                        <span className="text-white font-semibold text-lg">
                          {review.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {review.username}
                            {isUserReview && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Your Review
                              </span>
                            )}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-3">
                          <time className="text-sm text-gray-500 flex-shrink-0">
                            {new Date(review.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {review.updated_at && review.updated_at !== review.created_at && (
                              <span className="text-gray-400 ml-1">(edited)</span>
                            )}
                          </time>
                          {/* Edit/Delete buttons for user's own review */}
                          {isUserReview && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review.id)}
                                className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={18}
                              className={
                                star <= review.rating 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {review.rating}/5
                        </span>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="max-w-md mx-auto">
              <Star size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500 mb-4">
                Be the first to share your experience and help others make informed decisions.
              </p>
              <div className="text-sm text-gray-400">
                Your review helps build trust in our community
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Review Form Section */}
    <div className="mt-8">
      {isLoggedIn ? (
        <>
          {/* Show "Write a Review" button only if user hasn't reviewed yet */}
          {!reviews.some(review => 
            user && (
              review.userId === user.id || 
              review.user_id === user.id || 
              review.username === user.username
            )
          ) && !isEditFormVisible && (
            <button
              onClick={() => setIsReviewFormVisible(!isReviewFormVisible)}
              className="bg-[#2E6166] text-white px-4 py-2 rounded-lg hover:bg-[#1a4e4b] transition duration-200"
            >
              {isReviewFormVisible ? "Cancel Review" : "Write a Review"}
            </button>
          )}
          
          {(isReviewFormVisible || isEditFormVisible) && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={
                            star <= reviewRating
                              ? "text-yellow-400 fill-yellow-400 hover:scale-110 transition-transform"
                              : "text-gray-300 hover:text-yellow-400 hover:scale-110 transition-all"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({reviewRating}/5)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#2E6166] focus:border-transparent"
                    rows="4"
                    placeholder="Share your thoughts about this product..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-[#2E6166] text-white px-6 py-2 rounded-lg hover:bg-[#1a4e4b] transition duration-200"
                  >
                    {editingReview ? "Update Review" : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={editingReview ? handleCancelEdit : () => setIsReviewFormVisible(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-blue-700 mb-2">Please log in to write a review</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#2E6166] text-white px-4 py-2 rounded-lg hover:bg-[#1a4e4b] transition duration-200"
          >
            Log In
          </button>
        </div>
      )}
    </div>
  </div>
)}


                {activeTab === "shipping" && (
                  <div className="text-gray-700">
                    <h3 className="font-semibold text-lg text-gray-800 mb-4">Shipping & Returns</h3>
                    <p>
                      We offer fast shipping with a 30-day return policy. If you are not completely satisfied with your purchase, you can return it within 30 days for a full refund.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
                  >
                    <Link to={`/product/${recommendation.id}`}>
                      <img 
                        src={
                          recommendation.image?.startsWith("data:")
                            ? recommendation.image
                            : `https://pawprox-6dd216fb1ef5.herokuapp.com/${recommendation.image}`
                        }
                        alt={recommendation.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/400/320";
                        }}
                      />
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${recommendation.id}`}>
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-[#2E6166] mb-2">
                          {recommendation.title}
                        </h3>
                      </Link>
                      <div className="flex items-center mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={`${
                                star <= (Number(recommendation.rating) || 0)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-gray-500">
                          ({Number(recommendation.rating) || 0})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-[#2E6166]">
                          {formatPrice(recommendation.price)}
                        </p>
                        <button
                          onClick={() => {
                            addToCart({ ...recommendation, quantity: 1 });
                          }}
                          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-[#2E6166] hover:text-white transition duration-200"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetails;
