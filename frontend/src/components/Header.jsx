
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  User,
  LogOut,
  Settings,
  ShoppingBag,
  Home,
  MessageCircle,
  HelpCircle,
  History
} from "lucide-react";
import pawprox from "../images/pawprox.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [cartItemCount, setCartItemCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve active role ("user" or "vendor")
  const activeRole = localStorage.getItem("activeRole") || "user";

  // Retrieve user details from localStorage if logged in
  const user =
    isLoggedIn && localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  const firstName =
    user?.firstName || (user?.name ? user.name.split(" ")[0] : "");

  // Color scheme for inline styles
  const colors = {
    primary: "#2E6166",
    primaryHover: "#19897F",
    primaryLight: "rgba(25, 137, 127, 0.1)",
    textActive: "#19897F",
    textPrimary: "#374151",
    textSecondary: "#6B7280",
  };

  // Check if current page is marketplace
  const isMarketplacePage = location.pathname === "/marketplace";

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));

    // Get cart items count from localStorage or API
    const fetchCartItems = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItemCount(cart.length);
    };

    fetchCartItems();
    window.addEventListener("cartUpdated", fetchCartItems);
    return () => window.removeEventListener("cartUpdated", fetchCartItems);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const toggleDropdown = (name, e) => {
    e?.preventDefault();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setIsUserDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown-container")) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Navigation items for regular users
  const userNavItems = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    {
      name: "Services",
      icon: <ShoppingBag className="w-4 h-4" />,
      children: [
        {
          name: "Marketplace",
          href: "/marketplace",
          description: "Shop pet products and accessories",
        },
        {
          name: "Pet Care Services",
          href: "/petcare",
          description: "Find grooming, boarding, and more",
        },
        {
          name: "Medical Facilities",
          href: "/medicalfacilities",
          description: "Locate vets and animal hospitals",
        },
      ],
    },
    {
      name: "Community",
      icon: <MessageCircle className="w-4 h-4" />,
      children: [
        {
          name: "Lost & Found",
          href: "/lostfound",
          description: "Help reunite pets with their owners",
        },
        {
          name: "Community Forum",
          href: "/community",
          description: "Connect with fellow pet owners",
        },
      ],
    },
    {
      name: "Support",
      icon: <HelpCircle className="w-4 h-4" />,
      children: [
        { name: "About Us", href: "/about", description: "Learn about our mission" },
        { name: "Contact", href: "/contact", description: "Get in touch with our team" },
        {
          name: "Terms & Conditions",
          href: "/terms",
          description: "Read our terms of service",
        },
        {
          name: "Privacy Policies",
          href: "/privacy",
          description: "Learn how we protect your data",
        },
      ],
    },
  ];

  // Navigation items for vendors
  const vendorNavItems = [
    { name: "Dashboard", href: "/vendor/dashboard", icon: <Home className="w-4 h-4" /> },
    { name: "My Products", href: "/vendor/products", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "My Orders", href: "/vendor/orders", icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  // Render a dropdown menu (for desktop navigation)
  const DropdownMenu = ({ item }) => (
    <div className="relative dropdown-container">
      <button
        onClick={(e) => toggleDropdown(item.name, e)}
        aria-expanded={activeDropdown === item.name}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
        style={
          activeDropdown === item.name
            ? { backgroundColor: colors.primaryLight, color: colors.textActive, fontWeight: 500 }
            : { color: colors.textPrimary }
        }
      >
        {item.icon && <span>{item.icon}</span>}
        <span>{item.name}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            activeDropdown === item.name ? "rotate-180" : ""
          }`}
        />
      </button>
      {activeDropdown === item.name && (
        <div className="absolute left-0 pt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-100 overflow-hidden animate-fadeIn">
          {item.children.map((child) => (
            <Link
              key={child.name}
              to={child.href}
              onClick={() => closeAllDropdowns()}
              className="block p-3 transition-colors duration-150 border-l-4 pl-3"
              style={
                location.pathname === child.href
                  ? { borderLeftColor: colors.primary, fontWeight: 500, color: colors.textActive }
                  : { borderLeftColor: "transparent", color: "inherit" }
              }
            >
              <div className="text-gray-800">{child.name}</div>
              {child.description && (
                <div className="text-xs text-gray-500 mt-1">{child.description}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        isHeaderSticky
          ? "lg:bg-white/90 backdrop-blur-lg shadow-md bg-white/95 h-[70px]"
          : "bg-white backdrop-blur-xl h-[100px]"
      }`}
    >
      <div className="container mx-auto h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Section: Logo */}
          <div className="flex items-center">
            <Link
              to={activeRole === "vendor" ? "/vendor/dashboard" : "/"}
              className="flex items-center group"
            >
              <img
                src={pawprox}
                alt="PawProx Logo"
                className={`transition-all duration-300 group-hover:scale-110 ${
                  isHeaderSticky
                    ? "h-9 w-12"
                    : "h-10 w-14 sm:h-10 sm:w-14 lg:h-12 lg:w-16"
                }`}
              />
              <span
                className={`ml-2 font-bold text-gray-900 transition-all duration-300 ${
                  isHeaderSticky ? "text-lg" : "text-xl sm:text-xl lg:text-2xl"
                }`}
              >
                PawProx
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {activeRole === "vendor"
              ? vendorNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeAllDropdowns}
                    style={
                      location.pathname === item.href
                        ? { backgroundColor: colors.primaryLight, color: colors.textActive, fontWeight: 500 }
                        : { color: colors.textPrimary }
                    }
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.name}</span>
                  </Link>
                ))
              : userNavItems.map((item) =>
                  item.children ? (
                    <DropdownMenu key={item.name} item={item} />
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeAllDropdowns}
                      style={
                        location.pathname === item.href
                          ? { backgroundColor: colors.primaryLight, color: colors.textActive, fontWeight: 500 }
                          : { color: colors.textPrimary }
                      }
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.name}</span>
                    </Link>
                  )
                )}
          </nav>

          {/* Right Section: User Profile & Cart */}
          <div className="flex items-center space-x-2">
            {isLoggedIn && user ? (
              <div className="relative dropdown-container">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                  style={
                    isUserDropdownOpen
                      ? { backgroundColor: colors.primaryLight, color: colors.textActive }
                      : { color: colors.textPrimary }
                  }
                  aria-expanded={isUserDropdownOpen}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={`https://pawprox-6dd216fb1ef5.herokuapp.com/${user.profilePic}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600">
                        {firstName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{firstName}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-50 border border-gray-100 overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">
                        {user?.name || `${user?.firstName} ${user?.lastName}`}
                      </div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </div>
                    <Link
                      to="/settings"
                      onClick={closeAllDropdowns}
                      className="flex items-center space-x-2 w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <Link
                      to="/order-history"
                      onClick={closeAllDropdowns}
                      className="flex items-center space-x-2 w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <History className="w-4 h-4" />
                      <span>Order History</span>
                    </Link>
                    <Link to="/logout" onClick={closeAllDropdowns}>
                      <button
                        onClick={() => {
                          closeAllDropdowns();
                          handleLogout();
                        }}
                        className="flex items-center space-x-2 w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

            {/* Cart Button - Only show on marketplace page */}
            {isMarketplacePage && (
              <Link to="/cart">
                <button
                  style={{ backgroundColor: colors.primary, color: "black" }}
                  className="relative p-2 rounded-full flex items-center transition-colors hover:opacity-90"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-black rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-menu"
          className={`md:hidden inset-0 bg-white z-50 transition-all duration-300 overflow-auto min-w-[100%] pb-[40px] h-[90vh] ${
            isMenuOpen
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-full pointer-events-none"
          }`}
        >
          <nav className="container mx-0 px-0">
            {activeRole === "vendor" ? (
              <>
                <div className="text-xs font-medium uppercase text-gray-500 px-4 py-2">
                  Vendor Menu
                </div>
                {vendorNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={
                      location.pathname === item.href
                        ? { color: colors.textActive, fontWeight: 500 }
                        : {}
                    }
                    className="flex items-center space-x-3 px-4 py-3 border-b border-gray-100 text-gray-700"
                  >
                    {item.icon && <span className="text-gray-500">{item.icon}</span>}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </>
            ) : (
              userNavItems.map((item) =>
                item.children ? (
                  <div key={item.name} className="mb-2">
                    <div className="flex items-center space-x-3 px-4 py-3 font-medium text-gray-800 border-b border-gray-100">
                      {item.icon && <span className="text-gray-500">{item.icon}</span>}
                      <span>{item.name}</span>
                    </div>
                    <div>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          style={
                            location.pathname === child.href
                              ? { color: colors.textActive, fontWeight: 500 }
                              : {}
                          }
                          className="flex flex-col px-4 py-3 border-b border-gray-100 text-gray-700"
                        >
                          <span>{child.name}</span>
                          {child.description && (
                            <span className="text-xs text-gray-500 mt-1">
                              {child.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    style={
                      location.pathname === item.href
                        ? { color: colors.textActive, fontWeight: 500 }
                        : {}
                    }
                    className="flex items-center space-x-3 px-4 py-3 border-b border-gray-100 text-gray-700"
                  >
                    {item.icon && <span className="text-gray-500">{item.icon}</span>}
                    <span>{item.name}</span>
                  </Link>
                )
              )
            )}

            <div className="mt-6 px-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {user?.profilePic ? (
                      <img
                        src={`https://pawprox-6dd216fb1ef5.herokuapp.com/${user.profilePic}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600">{firstName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg">
                      Sign In
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;
