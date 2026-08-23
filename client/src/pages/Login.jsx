import React, { useState } from "react";
import {
  Activity,
  Lock,
  Mail,
  Shield,
  Stethoscope,
  HeartHandshake,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Login = ({ onLoginSuccess }) => {
  const { login, quickSwitchDemo, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    }
  };

  const handleQuickDemo = async (role) => {
    setError("");
    try {
      await quickSwitchDemo(role);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || "Failed to switch role.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/30 bg-slate-900/90 shadow-2xl space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Activity className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">
          Bharat<span className="text-emerald-400">Swasthya</span> AI Portal
        </h2>
        <p className="text-xs text-slate-400">
          Role-Based Access for Admins, Medical Officers, Health Workers & Citizens
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1-Click Quick Demo Buttons */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
          1-Click Instant Demo Login
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo("doctor")}
            className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Stethoscope className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">Doctor (MD)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo("health_assistant")}
            className="p-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <HeartHandshake className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="truncate">ASHA Worker</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo("admin")}
            className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <Shield className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">Admin (Govt)</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo("user")}
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Citizen User</span>
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-800 w-full" />
        <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-bold absolute">
          Or Enter Credentials
        </span>
      </div>

      {/* Manual Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@bharatswasthya.gov.in"
              className="w-full bg-slate-800 text-white text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none"
            />
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-800 text-white text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
export default Login;
