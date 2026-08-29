import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { AiChatbotModal } from "./components/AiChatbotModal";
import { WebsiteGuideModal } from "./components/WebsiteGuideModal";
import { EmergencyNumbersDrawer } from "./components/EmergencyNumbersDrawer";
import { EditProfileModal } from "./components/EditProfileModal";
import { PublicCitizenPortal } from "./pages/PublicCitizenPortal";
import { DoctorPortal } from "./pages/DoctorPortal";
import { HealthAssistantPortal } from "./pages/HealthAssistantPortal";
import { AdminPortal } from "./pages/AdminPortal";
import { PublicApiDocs } from "./pages/PublicApiDocs";
import { PublicLandingView } from "./pages/PublicLandingView";
import { Login } from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import { Activity, Heart, ShieldCheck, Compass, Sparkles } from "lucide-react";

export function App() {
  const { role, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState("");
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Check URL query params on load (e.g. ?tab=login&verifyToken=...)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, []);

  // Automatic routing: When user logs in or auth state changes, set activeTab to "home" to display their role portal
  useEffect(() => {
    if (isAuthenticated && activeTab === "login") {
      setActiveTab("home");
    }
  }, [isAuthenticated]);

  // Handler for Chatbot trigger with authentication check
  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setActiveTab("login");
    } else {
      setChatInitialPrompt("");
      setIsChatOpen(true);
    }
  };

  const handleOpenChatWithPrompt = (prompt) => {
    if (!isAuthenticated) {
      setActiveTab("login");
    } else {
      setChatInitialPrompt(prompt);
      setIsChatOpen(true);
    }
  };

  // Render view based on active tab and authenticated role
  const renderCurrentView = () => {
    if (activeTab === "api-docs") {
      return <PublicApiDocs />;
    }

    if (activeTab === "login") {
      return <Login onLoginSuccess={() => setActiveTab("home")} />;
    }

    // Role-based main workspace when authenticated
    if (isAuthenticated) {
      if (role === "admin") return <AdminPortal onOpenProfile={() => setIsProfileOpen(true)} />;
      if (role === "doctor") return <DoctorPortal onOpenProfile={() => setIsProfileOpen(true)} />;
      if (role === "health_assistant") return <HealthAssistantPortal onOpenProfile={() => setIsProfileOpen(true)} />;
      return (
        <PublicCitizenPortal
          onOpenChat={handleOpenChat}
          onOpenChatWithPrompt={handleOpenChatWithPrompt}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      );
    }


    // Default Public View for Unauthenticated Visitors (Open Emergency Access + Sign In)
    return (
      <PublicLandingView
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenLogin={() => setActiveTab("login")}
        onOpenChatWithPrompt={handleOpenChatWithPrompt}
      />
    );
  };

  const isStaffOrAdmin = isAuthenticated && ["doctor", "health_assistant", "admin"].includes(role);
  const showGuide = !isStaffOrAdmin;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenChat={handleOpenChat}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderCurrentView()}
      </main>

      {/* Global AI Chatbot Modal (Protected) */}
      {isAuthenticated && (
        <AiChatbotModal
          isOpen={isChatOpen}
          initialPrompt={chatInitialPrompt}
          onClose={() => {
            setIsChatOpen(false);
            setChatInitialPrompt("");
          }}
          onOpenEmergency={() => {
            setIsChatOpen(false);
            setIsEmergencyOpen(true);
          }}
        />
      )}

      {/* Global Website Guide Modal (Voice & Text Multilingual Assistant - Only for Public & Citizens) */}
      {showGuide && (
        <WebsiteGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          onOpenEmergency={() => {
            setIsGuideOpen(false);
            setIsEmergencyOpen(true);
          }}
          onOpenChat={handleOpenChat}
        />
      )}

      {/* Global Emergency Numbers Modal (Open to all) */}
      <EmergencyNumbersDrawer
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Edit Profile Modal (Authenticated) */}
      {isAuthenticated && (
        <EditProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Floating Website Guide Action Button (Fixed Bottom-Right - Only for Public Visitors & Citizens) */}
      {showGuide && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xl shadow-teal-900/25 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-400/30"
            title="Open Website Navigation Guide (Voice & Multilingual AI)"
          >
            {/* Pulsing indicator ring */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>

            <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center text-emerald-200">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="flex flex-col text-left">
              <span className="leading-none text-[13px] flex items-center gap-1">
                Website Guide <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              </span>
              <span className="text-[10px] text-emerald-200 font-normal leading-tight">
                गाइड / Voice AI
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-200 py-8 px-4 sm:px-6 mt-auto bg-white/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-slate-900">Bharat Swasthya AI</span>
            <span>• Integrated Disease Surveillance & Outbreak Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            {showGuide && (
              <button onClick={() => setIsGuideOpen(true)} className="hover:text-emerald-700 font-medium flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Website Guide (गाइड)
              </button>
            )}
            <button onClick={() => setActiveTab("api-docs")} className="hover:text-teal-700 font-medium">
              Open APIs
            </button>
            <button onClick={() => setIsEmergencyOpen(true)} className="hover:text-rose-600 font-medium">
              Emergency Hotlines (108)
            </button>
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setIsProfileOpen(true);
                } else {
                  setActiveTab("login");
                }
              }}
              className="hover:text-teal-700 font-medium"
            >
              {isAuthenticated ? "My Profile" : "Sign In / Register"}
            </button>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>for National Healthcare</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


export default App;
