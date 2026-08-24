import React, { useState, useEffect } from "react";
import {
  Activity,
  Bot,
  PhoneCall,
  ShieldCheck,
  MapPin,
  Sparkles,
  Bug,
  Droplets,
  AlertTriangle,
  HeartPulse,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Info,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import LocationFilter from "../components/LocationFilter";
import ProactiveAlertCard from "../components/ProactiveAlertCard";
import ViralDiseaseDetailsModal from "../components/ViralDiseaseDetailsModal";
import ProactiveAlertDetailsModal from "../components/ProactiveAlertDetailsModal";
import { useAuth } from "../context/AuthContext";

export const PublicCitizenPortal = ({ onOpenChat, onOpenEmergency, onOpenProfile, onOpenChatWithPrompt }) => {
  const { user, locationContext, updateLocation } = useAuth();
  const [viralDiseases, setViralDiseases] = useState([]);
  const [proactiveAlerts, setProactiveAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detail Modal States
  const [selectedViralDisease, setSelectedViralDisease] = useState(null);
  const [selectedProactiveAlert, setSelectedProactiveAlert] = useState(null);

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const [viralRes, proactiveRes, statsRes] = await Promise.all([
        axiosInstance.get(
          `/public/viral-diseases?state=${locationContext.state}&district=${locationContext.district}&city=${locationContext.city}`
        ),
        axiosInstance.get(
          `/public/proactive-alerts?state=${locationContext.state}&district=${locationContext.district}`
        ),
        axiosInstance.get("/public/overview-stats"),
      ]);

      setViralDiseases(viralRes.data?.data || []);
      setProactiveAlerts(proactiveRes.data?.alerts || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load public surveillance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, [locationContext.state, locationContext.district, locationContext.city]);

  const handleChatTrigger = (promptText) => {
    if (onOpenChatWithPrompt) {
      onOpenChatWithPrompt(promptText);
    } else if (onOpenChat) {
      onOpenChat();
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-teal-100 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Bharat Swasthya AI • Citizen Health Radar ({user?.name || "Verified Citizen"})
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            Protecting Your Family with{" "}
            <span className="text-emerald-300">
              AI Disease Intelligence
            </span>
          </h1>

          <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
            Real-time seasonal contagion radar, contagious viral tracking across Indian states and districts, daily weather-correlated outbreak forecasts, and 24x7 AI tele-health symptom triage.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onOpenChat && onOpenChat()}
              className="px-5 py-3 rounded-2xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm sm:text-base shadow-lg shadow-black/10 flex items-center gap-2.5 transition-all active:scale-95"
            >
              <Bot className="w-5 h-5 text-teal-700" />
              <span>Talk to AI Health Assistant</span>
            </button>

            <button
              onClick={onOpenEmergency}
              className="px-5 py-3 rounded-2xl bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-400/40 font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-md active:scale-95"
            >
              <PhoneCall className="w-5 h-5 text-rose-200" />
              <span>Emergency Help (108 Ambulance)</span>
            </button>

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm flex items-center gap-2 transition-all backdrop-blur-sm"
              >
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>


        {/* Overview Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 mt-6 border-t border-white/20">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-xs text-teal-100/80 font-medium">Monitored Cases</div>
            <div className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
              {stats?.totalMonitoredCases || "1,420+"}
            </div>
            <div className="text-[10px] text-teal-200/70">Across surveillance network</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-xs text-teal-100/80 font-medium">Active High Alerts</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-300 font-display mt-0.5">
              {stats?.activeOutbreaksCount || "8 Active"}
            </div>
            <div className="text-[10px] text-teal-200/70">Weather & vector risks</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-xs text-teal-100/80 font-medium">Surveillance Districts</div>
            <div className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
              {stats?.totalSurveillanceDistricts || "32+"}
            </div>
            <div className="text-[10px] text-teal-200/70">Grassroots integration</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-xs text-teal-100/80 font-medium">Emergency Hotlines</div>
            <div className="text-xl sm:text-2xl font-bold text-rose-300 font-display mt-0.5">
              24x7 Free
            </div>
            <div className="text-[10px] text-teal-200/70">108 / 102 / 1075 / 104</div>
          </div>
        </div>
      </section>

      {/* Location Filter Section */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Regional Disease Surveillance Feed
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select any Indian State, District, and City to see active contagion risks & proactive advisories.
            </p>
          </div>
        </div>

        <LocationFilter
          selectedState={locationContext.state}
          selectedDistrict={locationContext.district}
          selectedCity={locationContext.city}
          onChange={({ state, district, city }) => updateLocation(state, district, city)}
        />
      </section>

      {/* Active Viral Outbreaks Spread Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-600" />
              Contagious & Viral Diseases Spread in {locationContext.district}, {locationContext.state}
            </h3>
            <p className="text-xs text-slate-500">
              Click any viral disease card to view in-depth symptoms, doctor remarks, and medical precautions
            </p>
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {viralDiseases.length} Active Strains Detected
          </span>
        </div>

        {viralDiseases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viralDiseases.map((disease, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedViralDisease(disease)}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm glass-card-hover flex flex-col justify-between cursor-pointer group hover:border-teal-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                      Viral Transmission
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      📍 {disease.district}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                    {disease.diseaseName}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Cases Reported</div>
                      <div className="font-bold text-teal-700 text-sm">
                        {disease.totalCases} Patients
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Severity</div>
                      <div className="font-bold text-rose-600 capitalize text-sm">
                        {disease.highestSeverity || "Moderate"}
                      </div>
                    </div>
                  </div>

                  {/* Symptoms pill preview */}
                  {disease.symptoms?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {disease.symptoms.slice(0, 3).map((sym, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          {sym}
                        </span>
                      ))}
                      {disease.symptoms.length > 3 && (
                        <span className="text-[10px] text-teal-700 font-semibold px-1 py-0.5">
                          +{disease.symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Click for Full Profile</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedViralDisease(disease);
                    }}
                    className="text-teal-600 group-hover:text-teal-700 font-bold flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
            ✅ No critical viral outbreak spikes reported currently for {locationContext.district},{" "}
            {locationContext.state}. Maintain regular hygiene.
          </div>
        )}
      </section>

      {/* Proactive Weather & AI Outbreak Alerts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Proactive AI Weather-Linked Outbreak Forecasts
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated daily from meteorological indicators + medical observations. Click any forecast to see detailed action protocol.
            </p>
          </div>
        </div>

        {proactiveAlerts.length > 0 ? (
          <div className="space-y-4">
            {proactiveAlerts.map((alert) => (
              <ProactiveAlertCard
                key={alert._id}
                alert={alert}
                onSelectAlert={(selected) => setSelectedProactiveAlert(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
            <Activity className="w-6 h-6 mx-auto mb-2 text-teal-600" />
            No active high-risk alerts in this district. AI engine continuously monitoring.
          </div>
        )}
      </section>

      {/* Instant Symptom Triage Banner */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-teal-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
            <Bot className="w-4 h-4" /> AI Tele-Health Symptom Checker
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
            Feeling unwell or experiencing fever, cough, or stomach cramps?
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Get instant medical guidance personalized for {locationContext.district}, {locationContext.state}, identify danger signs, and learn proper first-aid steps.
          </p>
        </div>

        <button
          onClick={() => onOpenChat && onOpenChat()}
          className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 shrink-0 transition-all active:scale-95"
        >
          Launch Health Chatbot Now →
        </button>
      </section>

      {/* Viral Disease Details Modal */}
      {selectedViralDisease && (
        <ViralDiseaseDetailsModal
          disease={selectedViralDisease}
          isOpen={Boolean(selectedViralDisease)}
          onClose={() => setSelectedViralDisease(null)}
          onOpenChatWithPrompt={handleChatTrigger}
          onOpenEmergency={onOpenEmergency}
        />
      )}

      {/* Proactive Forecast Details Modal */}
      {selectedProactiveAlert && (
        <ProactiveAlertDetailsModal
          alert={selectedProactiveAlert}
          isOpen={Boolean(selectedProactiveAlert)}
          onClose={() => setSelectedProactiveAlert(null)}
          onOpenChatWithPrompt={handleChatTrigger}
          onOpenEmergency={onOpenEmergency}
        />
      )}
    </div>
  );
};

export default PublicCitizenPortal;

