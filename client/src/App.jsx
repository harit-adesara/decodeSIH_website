import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { AiChatbotModal } from "./components/AiChatbotModal";
import { EmergencyNumbersDrawer } from "./components/EmergencyNumbersDrawer";
import { PublicCitizenPortal } from "./pages/PublicCitizenPortal";
import { DoctorPortal } from "./pages/DoctorPortal";
import { HealthAssistantPortal } from "./pages/HealthAssistantPortal";
import { AdminPortal } from "./pages/AdminPortal";
import { PublicApiDocs } from "./pages/PublicApiDocs";
import { Login } from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import { Activity, ShieldCheck, Heart } from "lucide-react";

export function App() {
  const { role, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Render view based on active tab and authenticated role
  const renderCurrentView = () => {
    if (activeTab === "api-docs") {
      return <PublicApiDocs />;
    }

    if (activeTab === "login") {
      return <Login onLoginSuccess={() => setActiveTab("home")} />;
    }

    // Role-based main workspace
    if (isAuthenticated) {
      if (role === "admin") return <AdminPortal />;
      if (role === "doctor") return <DoctorPortal />;
      if (role === "health_assistant") return <HealthAssistantPortal />;
      return (
        <PublicCitizenPortal
          onOpenChat={() => setIsChatOpen(true)}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
        />
      );
    }

    // Default Public Citizen View
    return (
      <PublicCitizenPortal
        onOpenChat={() => setIsChatOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenChat={() => setIsChatOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderCurrentView()}
      </main>

      {/* Global AI Chatbot Modal */}
      <AiChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenEmergency={() => {
          setIsChatOpen(false);
          setIsEmergencyOpen(true);
        }}
      />

      {/* Global Emergency Numbers Modal */}
      <EmergencyNumbersDrawer
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800 py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-white">Bharat Swasthya AI</span>
            <span>• Integrated Disease Surveillance & Outbreak Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab("api-docs")} className="hover:text-emerald-400">
              Open APIs
            </button>
            <button onClick={() => setIsEmergencyOpen(true)} className="hover:text-red-400">
              Emergency Hotlines (108)
            </button>
            <button onClick={() => setActiveTab("login")} className="hover:text-emerald-400">
              Staff Portal
            </button>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
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
