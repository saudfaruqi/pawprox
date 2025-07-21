

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
    
    // Check for remembered email
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isEmailValid = email === "" || validateEmail(email);
  const isPasswordValid = password === "" || password.length >= 6;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      // Replace with your real API endpoint
      const response = await axios.post("https://pawprox-6dd216fb1ef5.herokuapp.com/api/auth/login", { email, password });
      
      // Save token and user object if login is successful
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setForgotPasswordSuccess(null);

    if (!validateEmail(forgotPasswordEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // Replace with your real API endpoint
      await axios.post("https://pawprox-6dd216fb1ef5.herokuapp.com/api/auth/forgot-password", { email: forgotPasswordEmail });
      setForgotPasswordSuccess("Password reset link sent to your email. Please check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-400 to-emerald-600 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <svg viewBox="0 0 400 300" className="w-full h-auto max-h-80">
            <rect width="400" height="300" fill="rgba(255,255,255,0.1)" rx="20" />
            <circle cx="200" cy="150" r="100" fill="rgba(255,255,255,0.1)" />
            <circle cx="200" cy="150" r="80" fill="rgba(255,255,255,0.2)" />
            <circle cx="200" cy="150" r="60" fill="rgba(255,255,255,0.3)" />
            <rect x="160" y="120" width="80" height="100" rx="8" fill="white" />
            <circle cx="200" cy="100" r="20" fill="white" />
            <rect x="180" y="160" width="40" height="20" rx="4" fill="#059669" />
            <circle cx="185" cy="140" r="4" fill="#059669" />
            <circle cx="215" cy="140" r="4" fill="#059669" />
          </svg>
          <h2 className="text-3xl font-bold mt-12">Welcome Back!</h2>
          <p className="text-lg mt-4 text-emerald-50">
            Sign in to access your account and continue your journey with us.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-emerald-50" />
              <span className="text-emerald-50">Secure authentication</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-emerald-50" />
              <span className="text-emerald-50">Personalized dashboard</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-emerald-50" />
              <span className="text-emerald-50">Access to premium features</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
          {isForgotPassword && (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="flex items-center text-emerald-600 mb-6 hover:text-emerald-700 transition duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          )}

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isForgotPassword ? "Reset Password" : "Sign In"}
          </h2>
          
          <p className="text-gray-500 mb-8">
            {isForgotPassword 
              ? "Enter your email address to receive a password reset link." 
              : "Please enter your credentials to access your account."}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {forgotPasswordSuccess && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm">{forgotPasswordSuccess}</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition duration-300 flex justify-center items-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ${
                      emailTouched && !isEmailValid
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    autoFocus
                  />
                </div>
                {emailTouched && !isEmailValid && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ${
                      passwordTouched && !isPasswordValid
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {passwordTouched && !isPasswordValid && (
                  <p className="mt-1 text-sm text-red-600">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-emerald-600 text-sm hover:text-emerald-700 transition duration-200 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition duration-300 flex justify-center items-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="flex flex-col space-y-6">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                
                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 flex justify-center items-center font-medium"
                  onClick={() => navigate("/signup")}
                >
                  Create an account
                </button>
              </div>

              <div className="text-sm text-center text-gray-600 pt-4">
                Don't have an account?{" "}
                <Link to="/signup">
                  <span className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Sign up now
                  </span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

