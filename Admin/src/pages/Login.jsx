import React, { useState, useEffect } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode 
} from "firebase/auth";
import { auth } from "../../Backend/firebaseConfig";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Password reset state for URL parameters
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ADMIN_EMAIL = "aubriemariedual13@gmail.com";

  // Check for password reset parameters on component mount
  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    
    console.log("URL params - mode:", mode, "oobCode:", oobCode); // Debug log
    
    if (mode === 'resetPassword' && oobCode) {
      setShowPasswordResetModal(true);
      // Clear any existing login errors
      setError("");
    }
  }, [searchParams]);

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
      
      // Provide more specific error messages
      switch (err.code) {
        case 'auth/user-not-found':
          setError("No account found with this email address.");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password. Please try again.");
          break;
        case 'auth/invalid-email':
          setError("Invalid email address format.");
          break;
        case 'auth/user-disabled':
          setError("This account has been disabled.");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later.");
          break;
        default:
          setError("Wrong email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    console.log("Create account disabled — only admin allowed.");
    setError("⛔ Account creation is disabled. Only admin can log in.");
  };

  // Send password reset email with custom action URL
  const handleSendResetEmail = async () => {
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setForgotPasswordLoading(true);
    
    if (!forgotEmail) {
      setForgotPasswordError("Please enter your email address.");
      setForgotPasswordLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotPasswordError("Please enter a valid email address.");
      setForgotPasswordLoading(false);
      return;
    }

    try {
      // Configure the action code settings to redirect back to your login page
      const actionCodeSettings = {
        url: `${window.location.origin}/login`, // This will be the URL users return to
        handleCodeInApp: false, // This ensures the link opens in the browser, not the app
      };

      console.log("Sending reset email to:", forgotEmail); // Debug log
      console.log("Action URL:", actionCodeSettings.url); // Debug log

      await sendPasswordResetEmail(auth, forgotEmail, actionCodeSettings);
      
      setForgotPasswordSuccess("Password reset email sent! Check your inbox and click the link to reset your password.");
      
      // Auto-close modal after success
      setTimeout(() => {
        setShowForgotPasswordModal(false);
        setForgotEmail("");
        setForgotPasswordSuccess("");
      }, 4000);
      
    } catch (err) {
      console.error("Password reset error:", err);
      
      // Provide specific error messages
      switch (err.code) {
        case 'auth/user-not-found':
          setForgotPasswordError("No account found with this email address.");
          break;
        case 'auth/invalid-email':
          setForgotPasswordError("Invalid email address format.");
          break;
        case 'auth/too-many-requests':
          setForgotPasswordError("Too many requests. Please wait before trying again.");
          break;
        default:
          setForgotPasswordError("Failed to send reset email. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Handle password reset from email link
  const handlePasswordResetFromLink = async () => {
    setResetError("");
    setResetSuccess("");
    setResetLoading(true);
    
    if (!newPassword || !confirmNewPassword) {
      setResetError("Please fill in both password fields.");
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match.");
      setResetLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters long.");
      setResetLoading(false);
      return;
    }

    const oobCode = searchParams.get('oobCode');
    
    if (!oobCode) {
      setResetError("Invalid reset link. Please request a new password reset email.");
      setResetLoading(false);
      return;
    }

    try {
      console.log("Verifying reset code..."); // Debug log
      
      // Verify the code first
      await verifyPasswordResetCode(auth, oobCode);
      
      console.log("Code verified, confirming password reset..."); // Debug log
      
      // If verification succeeds, confirm the password reset
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      setResetSuccess("Your password has been reset successfully! You can now log in with your new password.");
      
      // Clear URL parameters and close modal after success
      setTimeout(() => {
        window.history.replaceState({}, document.title, "/login");
        setShowPasswordResetModal(false);
        setNewPassword("");
        setConfirmNewPassword("");
        setResetError("");
        setResetSuccess("");
      }, 3000);
      
    } catch (err) {
      console.error("Password reset error:", err);
      
      // Provide specific error messages
      switch (err.code) {
        case 'auth/expired-action-code':
          setResetError("This password reset link has expired. Please request a new one.");
          break;
        case 'auth/invalid-action-code':
          setResetError("This password reset link is invalid. Please request a new one.");
          break;
        case 'auth/weak-password':
          setResetError("Password is too weak. Please choose a stronger password.");
          break;
        default:
          setResetError("Failed to reset password. Please try again or request a new reset link.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Handle modal close for forgot password
  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotEmail("");
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
  };

  // Handle modal close for password reset
  const closePasswordResetModal = () => {
    window.history.replaceState({}, document.title, "/login");
    setShowPasswordResetModal(false);
    setNewPassword("");
    setConfirmNewPassword("");
    setResetError("");
    setResetSuccess("");
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
                  required
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
                    required
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
                className="w-full bg-[#A68B69] text-white py-3 rounded-xl font-bold text-lg shadow-md transition-all hover:bg-[#8C7355] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-100">
            <button
              onClick={closeForgotPasswordModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={forgotPasswordLoading}
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
            <p className="text-gray-600 mb-6">Enter your email and we'll send you a link to reset your password.</p>
            
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all mb-4"
              placeholder="Enter your email"
              disabled={forgotPasswordLoading}
              onKeyPress={(e) => e.key === 'Enter' && handleSendResetEmail()}
            />
            
            <button
              onClick={handleSendResetEmail}
              className="w-full bg-[#A68B69] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#8C7355] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            {forgotPasswordError && (
              <p className="text-red-500 text-sm mt-4 text-center">{forgotPasswordError}</p>
            )}
            {forgotPasswordSuccess && (
              <p className="text-green-500 text-sm mt-4 text-center">{forgotPasswordSuccess}</p>
            )}
          </div>
        </div>
      )}

      {/* Password Reset Modal (from email link) */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg relative transform transition-all duration-300 ease-in-out scale-100">
            <button
              onClick={closePasswordResetModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={resetLoading}
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
            <p className="text-gray-600 mb-6">Enter your new password below.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all"
                    placeholder="Enter new password"
                    disabled={resetLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer flex items-center p-1 transition-colors hover:text-gray-700"
                    disabled={resetLoading}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] transition-all"
                    placeholder="Confirm new password"
                    disabled={resetLoading}
                    minLength={6}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordResetFromLink()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer flex items-center p-1 transition-colors hover:text-gray-700"
                    disabled={resetLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handlePasswordResetFromLink}
              className="w-full bg-[#A68B69] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#8C7355] transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resetLoading}
            >
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            {resetError && (
              <p className="text-red-500 text-sm mt-4 text-center">{resetError}</p>
            )}
            {resetSuccess && (
              <p className="text-green-500 text-sm mt-4 text-center">{resetSuccess}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}