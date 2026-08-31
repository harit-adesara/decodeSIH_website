import React, { useState } from "react";
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
  Edit3,
  Building2,
  Lock,
  Menu,
  X,
  ChevronRight,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
    if (!isAuthenticated) {
      setActiveTab("login");
    } else {
      onOpenChat();
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleEmergencyClick = () => {
    setMobileMenuOpen(false);
    onOpenEmergency();
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    onOpenProfile();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 shadow-sm backdrop-blur-md">
      {/* Tricolor Ribbon */}
      <div className="tricolor-stripe w-full" />

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div
          onClick={() => handleTabClick("home")}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-bold text-base sm:text-lg md:text-xl tracking-tight text-slate-900">
                Bharat<span className="text-teal-600">Swasthya</span>
              </span>
              <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-teal-200 uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden md:block">
              National Epidemiological Outbreak Intelligence Platform
            </p>
          </div>
        </div>

        {/* Desktop Action Controls (md and up) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {/* Home Button */}
          <button
            onClick={() => handleTabClick("home")}
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

          {/* Emergency Helpline Button */}
          <button
            onClick={handleEmergencyClick}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
            <span>Emergency 108</span>
          </button>

          {/* AI Tele-Health Chatbot Button */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-sm shadow-teal-600/20 transition-all active:scale-95"
            title={isAuthenticated ? "Open AI Tele-Health Chatbot" : "Sign in to access AI Chatbot"}
          >
            <Bot className="w-4 h-4" />
            <span>AI Health Chatbot</span>
          </button>

          {/* 3rd Party API Docs */}
          <button
            onClick={() => handleTabClick("api-docs")}
            className={`flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 rounded-xl font-medium transition-all ${
              activeTab === "api-docs"
                ? "bg-teal-50 text-teal-700 border border-teal-200 font-semibold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
            }`}
            title={role === "admin" ? "Public REST API Explorer" : "Public API (Admin Only)"}
          >
            <Code2 className="w-4 h-4 text-teal-600" />
            <span>Public API</span>
            {role !== "admin" && (
              <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
            )}
          </button>

          {/* User Profile / Auth Status */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={handleProfileClick}
                title="Edit Profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden lg:block">
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
              onClick={() => handleTabClick("login")}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* Mobile Header Controls (Visible below md) */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Quick Emergency 108 Button */}
          <button
            onClick={handleEmergencyClick}
            className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-xs active:scale-95"
            title="Emergency 108 Helplines"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>108</span>
          </button>

          {/* Quick AI Chatbot Button */}
          <button
            onClick={handleChatClick}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-xs active:scale-95"
            title="AI Health Chatbot"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden min-[380px]:inline">AI Chat</span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all active:scale-95 ml-0.5"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[67px] z-50 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border-b border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[calc(100vh-70px)] overflow-y-auto">
            {/* User Profile Card (if authenticated) */}
            {isAuthenticated && user ? (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center border border-teal-200">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                    {currentRoleBadge && (
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-md border ${currentRoleBadge.style}`}>
                        {RoleIcon && <RoleIcon className="w-3 h-3" />}
                        {currentRoleBadge.label}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleProfileClick}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-teal-900 text-xs sm:text-sm">Public Health Access</div>
                  <div className="text-[11px] text-teal-700">Sign in for personalized AI triage & records</div>
                </div>
                <button
                  onClick={() => handleTabClick("login")}
                  className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-xs"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1 pt-1">
              <button
                onClick={() => handleTabClick("home")}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "home"
                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Home className="w-4 h-4" />
                  </div>
                  <span>Home Dashboard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={handleChatClick}
                className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div>AI Health Chatbot</div>
                    <div className="text-[10px] text-slate-400 font-normal">Multilingual Tele-Triage (Voice & Text)</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={handleEmergencyClick}
                className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center animate-pulse">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div>Emergency Helplines (108 / 102 / 104)</div>
                    <div className="text-[10px] text-rose-600/80 font-normal">24x7 Ambulance & Tele-Advice</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={() => handleTabClick("api-docs")}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "api-docs"
                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div className="text-left flex items-center gap-1.5">
                    <span>Public REST API Explorer</span>
                    {role !== "admin" && <Lock className="w-3 h-3 text-slate-400" />}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-rose-200 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => handleTabClick("login")}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
