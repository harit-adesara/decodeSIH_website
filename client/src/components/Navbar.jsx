import React from "react";
import {
  Activity,
  PhoneCall,
  Bot,
  Shield,
  Stethoscope,
  HeartHandshake,
  User,
  LogOut,
  Code2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({
  onOpenChat,
  onOpenEmergency,
  activeTab,
  setActiveTab,
}) => {
  const { user, role, logout, quickSwitchDemo, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-2xl backdrop-blur-xl">
      {/* Tricolor Ribbon */}
      <div className="tricolor-stripe w-full" />

      {/* Top Demo Bar for Instant Role Switching */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-slate-300">1-Click Test Role Switcher:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => quickSwitchDemo("user")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              role === "user" && isAuthenticated
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <User className="w-3 h-3" /> Citizen
          </button>
          <button
            onClick={() => quickSwitchDemo("health_assistant")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              role === "health_assistant"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <HeartHandshake className="w-3 h-3" /> Health Assistant (ASHA)
          </button>
          <button
            onClick={() => quickSwitchDemo("doctor")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              role === "doctor"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <Stethoscope className="w-3 h-3" /> Doctor
          </button>
          <button
            onClick={() => quickSwitchDemo("admin")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              role === "admin"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <Shield className="w-3 h-3" /> Admin
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg md:text-xl tracking-tight text-white">
                Bharat<span className="text-emerald-400">Swasthya</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              National Epidemiological Outbreak Intelligence
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Helpline Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 animate-pulse"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="hidden sm:inline">Emergency</span> 108
          </button>

          {/* AI Tele-Health Chatbot Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden md:inline">AI Health</span> Chatbot
          </button>

          {/* 3rd Party API Docs */}
          <button
            onClick={() => setActiveTab("api-docs")}
            className={`flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-xl font-medium transition-all ${
              activeTab === "api-docs"
                ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">Public API</span>
          </button>

          {/* User Profile / Status */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white max-w-[120px] truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-emerald-400 capitalize font-medium">
                  {user.role.replace("_", " ")}
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab("login")}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-700 transition-all"
            >
              Staff Portal
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
