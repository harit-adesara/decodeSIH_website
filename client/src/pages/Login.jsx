import React, { useState, useEffect } from "react";
import {
  Activity,
  Lock,
  Mail,
  User,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  KeyRound,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LocationDropdowns from "../components/LocationDropdowns";
import { indiaLocations } from "../data/indiaLocations";

export const Login = ({ onLoginSuccess }) => {
  const {
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    loading,
  } = useAuth();

  // Active Auth Tab: 'signin' | 'register' | 'verify' | 'forgot'
  const [activeTab, setActiveTab] = useState("signin");

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Register State (Citizen)
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    state: "Maharashtra",
    district: "Pune",
    city: "Kothrud",
    phone: "",
  });

  // Verify Email State
  const [verifyToken, setVerifyToken] = useState("");
  const [resendEmail, setResendEmail] = useState("");

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: Request, 2: Reset

  // Feedback Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check URL params for verification token or reset token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("verifyToken") || urlParams.get("token");
    const resetFromUrl = urlParams.get("resetToken");

    if (tokenFromUrl) {
      setActiveTab("verify");
      setVerifyToken(tokenFromUrl);
    } else if (resetFromUrl) {
      setActiveTab("forgot");
      setResetToken(resetFromUrl);
      setResetStep(2);
    }
  }, []);

  const clearAlerts = () => {
    setError("");
    setSuccess("");
  };

  // 1. Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    clearAlerts();

    try {
      await login(signInEmail, signInPassword);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("verify your email")) {
        setResendEmail(signInEmail);
        setError("Your account is not verified yet. Please check your inbox or enter your verification code below.");
        setActiveTab("verify");
      } else {
        setError(err.message || "Invalid email or password credentials.");
      }
    }
  };

  // 2. Handle Citizen Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    clearAlerts();

    try {
      const res = await register(registerData);
      setSuccess(res.message || "Registration successful! A verification email has been sent to your inbox.");
      setResendEmail(registerData.email);
      setActiveTab("verify");
      if (res.data?.verificationToken) {
        setVerifyToken(res.data.verificationToken);
      }
    } catch (err) {
      setError(err.message || "Failed to register account.");
    }
  };

  // 3. Handle Verify Email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!verifyToken.trim()) {
      setError("Please enter the verification code received on your email.");
      return;
    }

    try {
      const res = await verifyEmail(verifyToken.trim());
      setSuccess(res.message || "Email verified successfully! You are now logged in.");
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid or expired verification token.");
    }
  };

  // Handle Resend Verification Email
  const handleResendVerification = async () => {
    clearAlerts();
    const emailToUse = resendEmail || signInEmail || registerData.email;

    if (!emailToUse) {
      setError("Please provide your registered email address to resend verification link.");
      return;
    }

    try {
      const res = await resendVerification(emailToUse);
      setSuccess(res.message || "A fresh verification link has been dispatched to your email.");
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    }
  };

  // 4. Handle Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!forgotEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      const res = await forgotPassword(forgotEmail);
      setSuccess(res.message || "Password reset instructions sent to your email.");
      setResetStep(2);
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.message || "Failed to initiate password reset.");
    }
  };

  // Handle Reset Password Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (!resetToken || !newPassword) {
      setError("Please enter both the reset token and your new password.");
      return;
    }

    try {
      const res = await resetPassword(resetToken.trim(), newPassword);
      setSuccess(res.message || "Password reset successfully! Please sign in with your new password.");
      setTimeout(() => {
        setActiveTab("signin");
        setSignInEmail(forgotEmail);
        setSignInPassword("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    }
  };

  return (
    <div className="max-w-lg mx-auto my-3 sm:my-6 p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4 sm:space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 mx-auto flex items-center justify-center shadow-md shadow-teal-600/20">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
          Bharat<span className="text-teal-600">Swasthya</span> AI
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-500">
          Integrated Disease Surveillance & Outbreak Intelligence Portal
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-slate-100 p-1 rounded-xl sm:rounded-2xl grid grid-cols-3 gap-1 text-[11px] sm:text-xs font-semibold">
        <button
          type="button"
          onClick={() => { setActiveTab("signin"); clearAlerts(); }}
          className={`py-2 rounded-lg sm:rounded-xl transition-all ${
            activeTab === "signin"
              ? "bg-white text-teal-700 shadow-sm font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("register"); clearAlerts(); }}
          className={`py-2 rounded-lg sm:rounded-xl transition-all ${
            activeTab === "register"
              ? "bg-white text-teal-700 shadow-sm font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Register
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab("verify"); clearAlerts(); }}
          className={`py-2 rounded-lg sm:rounded-xl transition-all ${
            activeTab === "verify"
              ? "bg-white text-teal-700 shadow-sm font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Verify
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">{success}</div>
        </div>
      )}

      {/* TAB 1: SIGN IN */}
      {activeTab === "signin" && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                placeholder="name@bharatswasthya.gov.in"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => { setActiveTab("forgot"); clearAlerts(); setForgotEmail(signInEmail); }}
                className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>New user? </span>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); clearAlerts(); }}
              className="text-teal-600 hover:underline font-semibold"
            >
              Register Citizen Account
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: REGISTER CITIZEN */}
      {activeTab === "register" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl text-[11px] text-teal-800">
            <strong>Note:</strong> Citizen accounts can be registered here. Medical Doctor and Health Assistant (ASHA) accounts are officially provisioned by Health Administrators.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Geographic Location Dropdowns (Pan-India) */}
          <LocationDropdowns
            state={registerData.state}
            district={registerData.district}
            city={registerData.city}
            onChange={({ state, district, city }) =>
              setRegisterData({ ...registerData, state, district, city })
            }
            theme="teal"
            size="md"
            stateLabel="State"
            districtLabel="District"
            cityLabel="City / Taluk"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "Registering Account..." : "Create Account & Send Verification Email"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); clearAlerts(); }}
              className="text-teal-600 hover:underline font-semibold"
            >
              Sign In
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: VERIFY EMAIL */}
      {activeTab === "verify" && (
        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Email Verification</h3>
            <p className="text-xs text-slate-500">
              Please enter the verification code sent to your email to activate your account.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Verification Code / Token *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="Paste code from email"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 font-mono rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>Didn't get the email?</span>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={loading}
              className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Resend Verification Email</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: FORGOT PASSWORD */}
      {activeTab === "forgot" && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Reset Password</h3>
            <p className="text-xs text-slate-500">
              {resetStep === 1
                ? "Enter your email to receive a password reset code."
                : "Enter your reset code and set your new password."}
            </p>
          </div>

          {resetStep === 1 ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@bharatswasthya.gov.in"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? "Sending..." : "Send Password Reset Email"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setResetStep(2); clearAlerts(); }}
                  className="text-xs text-teal-600 hover:underline font-semibold"
                >
                  Already have a reset code? Click here
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Reset Token *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste reset token"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 font-mono rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? "Updating..." : "Save New Password"}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setResetStep(1); clearAlerts(); }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  ← Request a different reset token
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-slate-500">
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); clearAlerts(); }}
              className="text-teal-600 hover:underline font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
