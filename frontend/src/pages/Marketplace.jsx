


import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Search, Star, Filter, X, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

import PriceRange from '../components/PriceRange';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [sortOption, setSortOption] = useState("price");

  const [priceBounds, setPriceBounds] = useState([0, 0]);       // ← new
  const [priceRange, setPriceRange] = useState([0, 0]); 

  const [ratingFilter, setRatingFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const categories = ["All", "Pets", "Accessories", "Food", "Toys"];
  const { addToCart, cartItems } = useContext(CartContext);

  

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5001/api/marketplace");
      const items = response.data.items || response.data;
      setProducts(items);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

    useEffect(() => {
    if (!products.length) return;
    const prices = products.map(p => Number(p.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    setPriceBounds([minPrice, maxPrice]);
    setPriceRange([minPrice, maxPrice]);
  }, [products]);

  useEffect(() => {
    fetchProducts();
    
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, category, priceRange, ratingFilter, sortOption]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Filter and sort products based on all criteria
  const filteredProducts = products
    .filter((product) =>
      product &&
      (category === "All" || product.category === category) &&
      product.title &&
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      Number(product.price) >= priceRange[0] &&
      Number(product.price) <= priceRange[1] &&
      (product.rating || 0) >= ratingFilter
    )
    .sort((a, b) => {
      if (sortOption === "price-asc") {
        return Number(a.price) - Number(b.price);
      } else if (sortOption === "price-desc") {
        return Number(b.price) - Number(a.price);
      } else if (sortOption === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortOption === "popularity") {
        return (b.popularity || 0) - (a.popularity || 0);
      }
      return a.title.localeCompare(b.title);
    });

  // Pagination
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const resetFilters = () => {
    setSearchTerm("");
    setCategory("All");
    setPriceRange([0, 10000]);
    setRatingFilter(0);
    setSortOption("price-asc");
    // Reset any input field too
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) searchInput.value = "";
  };

  const isProductInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Price formatter
  const formatPrice = price =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(price);


  // Mobile filters
  const MobileFilters = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${mobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl transform transition-transform ${mobileFiltersOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#2E6166]">Filters</h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto" style={{maxHeight: 'calc(100vh - 64px)'}}>
          {/* Filter content - same as sidebar but optimized for mobile */}
          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                    category === cat
                      ? "bg-[#2E6166] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {/* Price Range */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Price Range</label>
            <div className="px-2">
            <PriceRange
              min={priceBounds[0]}
              max={priceBounds[1]}
              step={10000}                  // adjust step to PKR-sensible increments
              value={priceRange}
              onChange={setPriceRange}
              formatLabel={formatPrice}
            />
          </div>
          </div>
          {/* Rating Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Minimum Rating</label>
            <div className="flex flex-nowrap justify-between">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(rating)}
                  className={`flex items-center px-2 py-2 rounded-lg transition duration-200 ${
                    ratingFilter === rating
                      ? "bg-[#2E6166] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Star size={14} />
                  <span className="ml-1 text-xs">{rating}+</span>
                </button>
              ))}
            </div>
          </div>
          {/* Sort Option */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6166] focus:border-transparent transition duration-200 bg-white"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
          {/* Reset button */}
          <button
            onClick={resetFilters}
            className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-50 mt-[110px]">
        {/* Sidebar for desktop */}
        <div
          className={`hidden lg:block ${
            sidebarOpen ? "w-80" : "w-20"
          } fixed left-0 top-[80px] h-[calc(100vh-80px)] overflow-y-auto bg-white shadow-lg transition-all duration-300 z-10`}
        >
          <div className="sticky top-2 bg-white p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className={`${sidebarOpen ? "text-xl" : "hidden"} font-bold text-[#2E6166]`}>
              Filters
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors duration-200"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          {sidebarOpen && (
            <div className="p-4 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search Products"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6166] focus:border-transparent transition duration-200 hover:border-[#2E6166]"
                  defaultValue={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              {/* Category */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                        category === cat
                          ? "bg-[#2E6166] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Price Range</label>
                <div className="px-2">
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div
                      className="absolute h-full bg-[#2E6166] rounded-full"
                      style={{
                        left: `${(priceRange[0] / 10000) * 10000}%`,
                        right: `${10000 - (priceRange[1] / 10000) * 10000}%`,
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
                      {formatPrice(priceRange[0])}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
                      {formatPrice(priceRange[1])}
                    </span>
                  </div>
                </div>
              </div>
              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Minimum Rating</label>
                <div className="flex flex-nowrap justify-between">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`flex items-center px-2 py-2 rounded-lg transition duration-200 ${
                        ratingFilter === rating
                          ? "bg-[#2E6166] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <Star size={14} />
                      <span className="ml-1 text-xs">{rating}+</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Sort Option */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6166] focus:border-transparent transition duration-200 bg-white"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popularity">Most Popular</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
              {/* Reset button */}
              <button
                onClick={resetFilters}
                className="w-full mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Main Market Dashboard */}
        <div 
          className={`w-full transition-all duration-300 px-4 pb-8 ${
            sidebarOpen ? "lg:ml-80" : "lg:ml-20"
          }`}
        >
          {/* Mobile header with filters button */}
          <div className="sticky top-16 z-20 lg:hidden bg-white shadow-sm flex items-center justify-between p-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Products"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2E6166] focus:border-transparent"
                defaultValue={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="ml-2 flex items-center justify-center p-2 bg-[#2E6166] text-white rounded-lg hover:bg-[#1a4e4b] transition duration-200"
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Results stats and active filters */}
          <div className="flex flex-wrap items-center justify-between mb-4 mt-4">
            <div className="text-gray-600 text-sm mb-2 md:mb-0">
              Showing {currentItems.length} of {filteredProducts.length} products
              {category !== "All" && ` in ${category}`}
              {ratingFilter > 0 && ` rated ${ratingFilter}+ stars`}
            </div>
            
            {/* Active filters */}
            {(category !== "All" || ratingFilter > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
              <div className="flex flex-wrap gap-2">
                {category !== "All" && (
                  <span className="bg-[#2E6166] text-white text-xs px-3 py-1 rounded-full flex items-center">
                    {category}
                    <button onClick={() => setCategory("All")} className="ml-1">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {ratingFilter > 0 && (
                  <span className="bg-[#2E6166] text-white text-xs px-3 py-1 rounded-full flex items-center">
                    {ratingFilter}+ Stars
                    <button onClick={() => setRatingFilter(0)} className="ml-1">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <span className="bg-[#2E6166] text-white text-xs px-3 py-1 rounded-full flex items-center">
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <button onClick={() => setPriceRange([0, 10000])} className="ml-1">
                      <X size={14} />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs px-3 py-1 rounded-full border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Loading, error, and empty states */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-16 w-16 border-4 border-t-[#2E6166] border-gray-300 rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
              <p className="text-lg font-medium">{error}</p>
              <button 
                onClick={fetchProducts}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <div className="text-gray-500 mb-4 text-6xl">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria.</p>
              <button
                onClick={resetFilters}
                className="bg-[#2E6166] text-white px-4 py-2 rounded-lg hover:bg-[#1a4e4b] transition duration-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Products grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {currentItems.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-300 flex flex-col"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-3 group">
                    <img
                      src={
                        product.image?.startsWith("data:")
                          ? product.image
                          : product.image
                            // If you’ve stored "uploads/xyz.jpg" in product.image...
                            ? `/uploads/${product.image.split("/").pop()}`
                            // …otherwise show the placeholder via our proxy’d endpoint
                            : ``
                      }
                      alt={product.title}
                      className="w-full h-48 object-cover transition transform group-hover:scale-110 duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        // If the upload fails, fall back to the placeholder
                        e.target.src = ``;
                      }}
                    />

                      {product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {product.discount}% OFF
                        </div>
                      )}
                    </div>
                    <div className="flex items-center mb-1">
                      <h2 className="text-lg font-semibold text-gray-800 mb-1 flex-grow">
                        {product.title}
                      </h2>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={`${
                              star <= (Number(product.rating) || 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-xl font-bold text-[#2E6166]">
                          {formatPrice(Number(product.price))}
                        </p>
                        {product.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(Number(product.originalPrice))}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link 
                          to={`/product/${product.id}`}
                          className="flex justify-center items-center bg-[#2E6166] text-white py-2 px-3 rounded-lg text-sm transition duration-200 hover:bg-[#1a4e4b]"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(product)}
                          className={`flex justify-center items-center py-2 px-3 rounded-lg text-sm transition duration-200 ${
                            isProductInCart(product.id)
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          {isProductInCart(product.id) ? "Added" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(Math.max(page - 1, 1))}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded-md ${
                        page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          page === i + 1
                            ? "bg-[#2E6166] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(page + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        page === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters popover */}
      <MobileFilters />
      
      <Footer />
    </>
  );
};

export default Marketplace;