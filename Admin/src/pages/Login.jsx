import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Backend/firebaseConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For making API calls to your backend

// Import assets
import loginBg from "../assets/loginbg.png";
import logo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  const navigate = useNavigate();
  const ADMIN_EMAIL = "mirrora@gmail.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.email === ADMIN_EMAIL) {
        console.log("✅ Admin logged in:", user.email);
        navigate("/admin");
      } else {
        setError("⛔ You are not authorized to access admin.");
      }
    } catch (err) {
      console.error("Login failed:", err.message);
      setError("Wrong email or password.");
    }
  };

  const handleCreateAccount = () => {
    console.log("Create account disabled — only admin allowed.");
    setError("⛔ Account creation is disabled. Only admin can log in.");
  };

  // Forgot password handlers
  const handleSendResetEmail = async () => {
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    if (!forgotEmail) {
      setForgotPasswordError("Please enter your email address.");
      return;
    }

    try {
      // Call your backend API to generate and send a 6-digit code
      const response = await axios.post("/api/send-reset-code", { email: forgotEmail });
      if (response.data.success) {
        setForgotPasswordSuccess("A 6-digit code has been sent to your email.");
        setForgotPasswordStep(2);
      } else {
        setForgotPasswordError("Failed to send reset code. Please check your email.");
      }
    } catch (err) {
      console.error("Forgot password failed:", err.message);
      setForgotPasswordError("Failed to send reset code. Please try again.");
    }
  };

  const handleVerifyCodeAndReset = async () => {
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    if (!resetCode || !newPassword) {
      setForgotPasswordError("Please enter a valid code and new password.");
      return;
    }

    try {
      // Call your backend API to verify the code and reset the password
      const response = await axios.post("/api/verify-reset-code", {
        email: forgotEmail,
        code: resetCode,
        newPassword,
      });
      if (response.data.success) {
        setForgotPasswordSuccess("Your password has been reset successfully!");
        setForgotPasswordStep(3);
      } else {
        setForgotPasswordError("Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("Password reset failed:", err.message);
      setForgotPasswordError("Invalid code or new password. Please try again.");
    }
  };

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600 mb-6">Enter your email to receive a 6-digit reset code.</p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all mb-4"
              placeholder="Enter your email"
            />
            <button
              onClick={handleSendResetEmail}
              className="w-full bg-[#A68B69] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#8C7355] transition-colors"
            >
              Send Reset Code
            </button>
            {forgotPasswordError && <p className="text-red-500 text-sm mt-4 text-center">{forgotPasswordError}</p>}
            {forgotPasswordSuccess && <p className="text-green-500 text-sm mt-4 text-center">{forgotPasswordSuccess}</p>}
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600 mb-6">Enter the 6-digit code sent to your email and your new password.</p>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all mb-4"
              placeholder="Enter 6-digit code"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all mb-4"
              placeholder="Enter new password"
            />
            <button
              onClick={handleVerifyCodeAndReset}
              className="w-full bg-[#A68B69] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#8C7355] transition-colors"
            >
              Reset Password
            </button>
            {forgotPasswordError && <p className="text-red-500 text-sm mt-4 text-center">{forgotPasswordError}</p>}
            {forgotPasswordSuccess && <p className="text-green-500 text-sm mt-4 text-center">{forgotPasswordSuccess}</p>}
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-green-600 mb-6">{forgotPasswordSuccess}</p>
            <p className="text-gray-600 mb-6">You can now return to the login page with your new password.</p>
            <button
              onClick={() => {
                setShowForgotPasswordModal(false);
                setForgotPasswordStep(1); // Reset for next time
              }}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-600 transition-colors"
            >
              Return to Login
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Left Side */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-opacity-40"></div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-l-3xl shadow-2xl">
        <div className="flex justify-center mt-10">
          <img src={logo} alt="Logo" className="w-56 object-contain" />
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:px-12 lg:px-20">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-lg">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl text-base placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3 pr-14 border border-gray-300 rounded-xl text-base placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer flex items-center p-1 transition-colors hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#A68B69] focus:ring-[#A68B69]"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-[#A68B69] text-white py-3 rounded-xl font-bold text-lg shadow-md transition-all hover:bg-[#8C7355] hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>

              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

              <div className="relative text-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <span className="relative px-2 bg-white text-sm text-gray-500">or</span>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="text-sm font-medium text-[#A68B69] hover:text-[#8C7355] transition-colors"
                >
                  Create an account
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-100">
            <button
              onClick={() => {
                setShowForgotPasswordModal(false);
                setForgotPasswordStep(1); // Reset modal state when closed
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            {renderForgotPasswordContent()}
          </div>
        </div>
      )}
    </div>
  );
}