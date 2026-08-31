import React from "react";
import {
  Activity,
  Home,
  PhoneCall,
  Bot,
  Shield,
  Stethoscope,
  HeartHandshake,
  User,
  LogOut,
  Code2,
  UserCheck,
  Edit3,
  Building2,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Navbar = ({
  onOpenChat,
  onOpenEmergency,
  onOpenProfile,
  activeTab,
  setActiveTab,
}) => {
  const { user, role, logout, isAuthenticated } = useAuth();

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case "admin":
        return { label: "National Admin", icon: Shield, style: "bg-purple-50 text-purple-700 border-purple-200" };
      case "hospital":
        return { label: "Hospital Facility", icon: Building2, style: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "doctor":
        return { label: "Medical Doctor", icon: Stethoscope, style: "bg-blue-50 text-blue-700 border-blue-200" };
      case "health_assistant":
        return { label: "Health Assistant (ASHA)", icon: HeartHandshake, style: "bg-teal-50 text-teal-700 border-teal-200" };
      default:
        return { label: "Citizen", icon: User, style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
  };

  const currentRoleBadge = user ? getRoleBadge(user.role) : null;
  const RoleIcon = currentRoleBadge ? currentRoleBadge.icon : null;

  const handleChatClick = () => {
    if (!isAuthenticated) {
      setActiveTab("login");
    } else {
      onOpenChat();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 shadow-sm backdrop-blur-md">
      {/* Tricolor Ribbon */}
      <div className="tricolor-stripe w-full" />

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg md:text-xl tracking-tight text-slate-900">
                Bharat<span className="text-teal-600">Swasthya</span>
              </span>
              <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block">
              National Epidemiological Outbreak Intelligence Platform
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Home Button */}
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-1.5 text-xs sm:text-sm px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === "home"
                ? "bg-teal-50 text-teal-800 border border-teal-200 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            title="Go to Home"
          >
            <Home className="w-4 h-4 text-teal-600" />
            <span>Home</span>
          </button>

          {/* Emergency Helpline Button (Always Accessible To All) */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
            <span className="hidden sm:inline">Emergency</span> 108
          </button>

          {/* AI Tele-Health Chatbot Button (Checks Authentication) */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-sm shadow-teal-600/20 transition-all active:scale-95"
            title={isAuthenticated ? "Open AI Tele-Health Chatbot" : "Sign in to access AI Chatbot"}
          >
            <Bot className="w-4 h-4" />
            <span className="hidden md:inline">AI Health</span> Chatbot
          </button>

          {/* 3rd Party API Docs (Admin Protected) */}
          <button
            onClick={() => setActiveTab("api-docs")}
            className={`flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-xl font-medium transition-all ${
              activeTab === "api-docs"
                ? "bg-teal-50 text-teal-700 border border-teal-200 font-semibold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            title={role === "admin" ? "Public REST API Explorer" : "Public API (Admin Only)"}
          >
            <Code2 className="w-4 h-4 text-teal-600" />
            <span className="hidden lg:inline">Public API</span>
            {role !== "admin" && (
              <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
            )}
          </button>

          {/* User Profile / Auth Status */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {/* Profile Card Trigger */}
              <button
                onClick={onOpenProfile}
                title="Edit Profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800 max-w-[110px] truncate flex items-center gap-1">
                    <span>{user.name}</span>
                    <Edit3 className="w-3 h-3 text-slate-400" />
                  </div>
                  {currentRoleBadge && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${currentRoleBadge.style}`}>
                      {RoleIcon && <RoleIcon className="w-2.5 h-2.5" />}
                      {currentRoleBadge.label}
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab("login")}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
