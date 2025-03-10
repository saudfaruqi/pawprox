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
  Gift,
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

  const { addToCart, isInCart, updateCartItemQuantity, cartItems } = useContext(CartContext);
  const navigate = useNavigate();

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
        const response = await axios.get(`http://localhost:5001/api/marketplace/${productId}`);
        const productData = response.data.item;
        setProduct(productData);
        
        setSelectedImage(
          productData.image?.startsWith("data:") 
            ? productData.image 
            : `http://localhost:5001/${productData.image}`
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
      const response = await axios.get(`http://localhost:5001/api/marketplace?category=${category}`);
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
    axios.get(`http://localhost:5001/api/reviews?productId=${product.id}`)
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

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("Please login to submit a review", "error");
      return;
    }
    if (!reviewComment.trim()) {
      showNotification("Please enter a review comment", "error");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5001/api/reviews",
        {
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Refresh the reviews list after submitting a review
      const { data } = await axios.get(`http://localhost:5001/api/reviews?productId=${product.id}`);
      setReviews(data.reviews);
      showNotification("Review submitted successfully!");
      setReviewComment("");
      setReviewRating(5);
      setIsReviewFormVisible(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      showNotification("Error submitting review, please try again.", "error");
    }
  };

  // Mock product images (in production these come from product data)
  const productImages = product
  ? [
      product.image?.startsWith("data:")
        ? product.image
        : `http://localhost:5001/${product.image}`,
      ...(product.detail_images
        ? JSON.parse(product.detail_images).map((img) => `http://localhost:5001/${img}`)
        : [])
    ]
  : [];

  const getProfilePicUrl = (pic) => {
    if (!pic) return null;
    return pic.startsWith('http') ? pic : `http://localhost:5001/${pic}`;
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
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="border p-4 rounded-lg ">
                                <div className="flex items-center mb-2">
                                <img
                                  src={getProfilePicUrl(review.profilePic)}
                                  alt={review.username}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm mr-2"
                                />
                                  <span className="font-bold">{review.username}</span>
                                  <div className="flex ml-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={16}
                                        className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p>{review.comment}</p>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-8">
                      <button
                        onClick={() => setIsReviewFormVisible(!isReviewFormVisible)}
                        className="bg-[#2E6166] text-white px-4 py-2 rounded-lg hover:bg-[#1a4e4b] transition duration-200"
                      >
                        {isReviewFormVisible ? "Cancel Review" : "Write a Review"}
                      </button>
                      {isReviewFormVisible && (
                        <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Rating</label>
                            <select
                              value={reviewRating}
                              onChange={(e) => setReviewRating(parseInt(e.target.value))}
                              className="mt-1 block w-full border-gray-300 rounded-md"
                            >
                              {[1, 2, 3, 4, 5].map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Review</label>
                            <textarea
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="mt-1 block w-full border-gray-300 rounded-md"
                              rows="4"
                              placeholder="Share your thoughts..."
                            ></textarea>
                          </div>
                          <button type="submit" className="bg-[#2E6166] text-white px-4 py-2 rounded-lg hover:bg-[#1a4e4b] transition duration-200">
                            Submit Review
                          </button>
                        </form>
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
                            : `http://localhost:5001/${recommendation.image}`
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
