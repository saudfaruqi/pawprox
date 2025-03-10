import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    location: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Email validation with better regex
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Phone validation with international formats
  const validatePhone = (phone) => {
    // Allow international formats, spaces, dashes, and parentheses
    return /^(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    
    if (name === "password") {
      handlePasswordStrength(value);
    }
    
    // Check password match when typing in confirm field
    if (name === "confirmPassword" && formData.password !== value) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords don't match" }));
    } else if (name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
  };

  const handlePasswordStrength = (value) => {
    // More comprehensive password strength check
    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const length = value.length;
    
    const criteria = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, length >= 8].filter(Boolean).length;
    
    if (length === 0) {
      setPasswordStrength("");
    } else if (criteria <= 2) {
      setPasswordStrength("Weak");
    } else if (criteria <= 4) {
      setPasswordStrength("Moderate");
    } else {
      setPasswordStrength("Strong");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!validatePhone(formData.phone_number)) {
      newErrors.phone_number = "Invalid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Create a copy without confirmPassword for API submission
    const submissionData = { ...formData };
    delete submissionData.confirmPassword;
    
    try {
      const response = await axios.post("http://localhost:5001/api/auth/signup", submissionData);
      
      localStorage.setItem("token", response.data.token);
      
      // Show success message
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Account created successfully! Please log in." 
          } 
        });
      }, 1000);
      
    } catch (err) {
      console.error("Signup error:", err);
      
      // Handle known error responses
      if (err.response?.status === 409) {
        setErrors({ email: "Email already in use" });
      } else {
        setErrors({ 
          form: err.response?.data?.error || "Signup failed. Please try again." 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    return `mt-1 w-full px-4 py-3 border ${
      formSubmitted && errors[fieldName] 
        ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
        : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
    } rounded-lg transition-colors`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 to-emerald-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-12 animate-fade-in-up">
            <img
              src="/api/placeholder/600/400"
              alt="Pets illustration"
              className="w-full h-auto rounded-xl shadow-xl transform transition hover:scale-105 duration-300"
            />
          </div>
          
          <div className="space-y-6 text-center">
            <Link to="/">
              <h2 className="text-5xl font-bold text-white drop-shadow-md">Welcome to Pawprox</h2>
            </Link>
            <p className="text-xl text-white opacity-90">Connect with pet lovers and find the best care for your furry friends.</p>
            
            <div className="flex justify-center space-x-8 pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm opacity-80">Pet Sitters</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">1,200+</div>
                <div className="text-sm opacity-80">Happy Pets</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">98%</div>
                <div className="text-sm opacity-80">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="mt-3 text-gray-600">Start your pet care journey with Pawprox</p>
          </div>

          {errors.form && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded animate-fade-in">
              <p className="text-red-700">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              {/* Name Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  Full Name
                  {formSubmitted && errors.name && (
                    <span className="text-red-500 text-xs">{errors.name}</span>
                  )}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={getInputClassName("name")}
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  Email Address
                  {formSubmitted && errors.email && (
                    <span className="text-red-500 text-xs">{errors.email}</span>
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClassName("email")}
                  placeholder="email@example.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  Password
                  {formSubmitted && errors.password && (
                    <span className="text-red-500 text-xs">{errors.password}</span>
                  )}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={getInputClassName("password")}
                  placeholder="••••••••"
                />
                {formData.password && (
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength === "Weak"
                            ? "w-1/3 bg-red-500"
                            : passwordStrength === "Moderate"
                            ? "w-2/3 bg-yellow-500"
                            : "w-full bg-green-500"
                        }`}
                      />
                    </div>
                    <span className={`ml-2 text-xs ${
                      passwordStrength === "Weak" ? "text-red-500" :
                      passwordStrength === "Moderate" ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Use 8+ characters with a mix of letters, numbers & symbols
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  Confirm Password
                  {formSubmitted && errors.confirmPassword && (
                    <span className="text-red-500 text-xs">{errors.confirmPassword}</span>
                  )}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={getInputClassName("confirmPassword")}
                  placeholder="••••••••"
                />
              </div>

              {/* Location Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  Location
                  {formSubmitted && errors.location && (
                    <span className="text-red-500 text-xs">{errors.location}</span>
                  )}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={getInputClassName("location")}
                  placeholder="City, State"
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between">
                  Phone Number
                  {formSubmitted && errors.phone_number && (
                    <span className="text-red-500 text-xs">{errors.phone_number}</span>
                  )}
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={getInputClassName("phone_number")}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-emerald-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-emerald-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-all duration-200 
              transform hover:translate-y-[-1px] hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-sm text-gray-400">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    fill="#1877F2"
                  />
                </svg>
                Facebook
              </button>
            </div>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login">
                <span className="text-emerald-600 hover:text-emerald-500 font-medium">
                  Sign in
                </span>
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;