import React, { useState, useEffect } from "react";
import {
  Activity,
  Bot,
  PhoneCall,
  ShieldCheck,
  MapPin,
  Sparkles,
  Bug,
  AlertTriangle,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import LocationFilter from "../components/LocationFilter";
import ViralDiseaseDetailsModal from "../components/ViralDiseaseDetailsModal";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useAuth } from "../context/AuthContext";

export const PublicCitizenPortal = ({ onOpenChat, onOpenEmergency, onOpenProfile, onOpenChatWithPrompt }) => {
  const { user, locationContext, updateLocation } = useAuth();
  const [viralDiseases, setViralDiseases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Immediate Alerts
  const [immediateAlerts, setImmediateAlerts] = useState([]);

  // Detail Modal States
  const [selectedViralDisease, setSelectedViralDisease] = useState(null);

  // Proactive Advisory from LLM
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryResult, setAdvisoryResult] = useState(null);
  const [advisoryError, setAdvisoryError] = useState(null);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const [viralRes, statsRes, immediateRes] = await Promise.all([
        axiosInstance.get(
          `/public/viral-diseases?state=${locationContext.state}&district=${locationContext.district}&city=${locationContext.city}`
        ),
        axiosInstance.get("/public/overview-stats"),
        axiosInstance.get("/immediate-alerts").catch(() => ({ data: { alerts: [] } })),
      ]);

      setViralDiseases(viralRes.data?.data || []);
      setStats(statsRes.data);
      setImmediateAlerts(immediateRes.data?.alerts || []);
    } catch {
      // Handled silently in UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, [locationContext.state, locationContext.district, locationContext.city]);

  const handleFetchAdvisory = async () => {
    setAdvisoryLoading(true);
    setAdvisoryError(null);
    setAdvisoryResult(null);
    try {
      const res = await axiosInstance.post("/public/proactive-advisory", {
        state: locationContext.state,
        district: locationContext.district,
        city: locationContext.city,
      });
      setAdvisoryResult(res.data?.data || res.data);
      setShowAdvisoryModal(true);
    } catch (err) {
      setAdvisoryError(err.response?.data?.message || "Failed to fetch advisory. Please try again.");
    } finally {
      setAdvisoryLoading(false);
    }
  };

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
            Real-time seasonal contagion radar, contagious viral tracking across Indian states and districts, AI-powered outbreak forecasts, and 24x7 AI tele-health symptom triage.
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
              {stats?.totalMonitoredCases !== undefined ? stats.totalMonitoredCases.toLocaleString() : "0"}
            </div>
            <div className="text-[10px] text-teal-200/70">Across surveillance network</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-xs text-teal-100/80 font-medium">Active High Alerts</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-300 font-display mt-0.5">
              {stats?.activeOutbreaksCount !== undefined ? `${stats.activeOutbreaksCount} Active` : "0 Active"}
            </div>
            <div className="text-[10px] text-teal-200/70">Weather & vector risks</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-xs text-teal-100/80 font-medium">Surveillance Districts</div>
            <div className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
              {stats?.totalSurveillanceDistricts !== undefined ? stats.totalSurveillanceDistricts : "0"}
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

      {/* Location Filter & Locality AI Advisory Section */}
      <section className="space-y-4">
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

        {/* AI Advisory Callout Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-600" /> Regional Advisory Engine
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {locationContext.city !== "All" ? `${locationContext.city}, ` : ""}{locationContext.district}, {locationContext.state}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Generate instant AI synthesis of local contagion risks, meteorological triggers & precaution protocols.
            </p>
          </div>

          <button
            onClick={handleFetchAdvisory}
            disabled={advisoryLoading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            {advisoryLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Advisory...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Get AI Advisory for {locationContext.city !== "All" ? locationContext.city : locationContext.district}</span>
              </>
            )}
          </button>
        </div>

        {advisoryError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {advisoryError}
          </div>
        )}
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

      {/* Immediate Viral Alerts */}
      {immediateAlerts.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Immediate Health Alerts in Your Area
            </h3>
            <p className="text-xs text-slate-500">
              Published by local Health Assistants and Doctors for instant community awareness.
            </p>
          </div>

          <div className="space-y-4">
            {immediateAlerts.map((alert) => (
              <div
                key={alert._id}
                className="p-5 rounded-3xl bg-white border border-rose-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      alert.severity === "critical"
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : alert.severity === "high"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {alert.severity} Alert
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {alert.patientCount} case{alert.patientCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {alert.location?.city}, {alert.location?.district}
                  </span>
                </div>

                <h4 className="font-bold text-base text-slate-900">{alert.title}</h4>

                {alert.formattedAlert ? (
                  <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs leading-relaxed">
                    {alert.formattedAlert}
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    {alert.description}
                  </p>
                )}

                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Published by: {alert.publishedBy?.name || alert.publishedByRole} ({alert.publishedByRole})</span>
                  <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* AI Advisory Modal */}
      {showAdvisoryModal && advisoryResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">AI Outbreak Advisory</h3>
                  <p className="text-xs text-slate-500">
                    {advisoryResult.district !== "All" ? advisoryResult.district : ""}{" "}
                    {advisoryResult.state}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvisoryModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <MarkdownRenderer content={advisoryResult.advisory} className="text-slate-800" />
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowAdvisoryModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCitizenPortal;

