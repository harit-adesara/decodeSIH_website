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
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import LocationFilter from "../components/LocationFilter";
import ProactiveAlertCard from "../components/ProactiveAlertCard";
import { useAuth } from "../context/AuthContext";

export const PublicCitizenPortal = ({ onOpenChat, onOpenEmergency }) => {
  const { locationContext, updateLocation } = useAuth();
  const [viralDiseases, setViralDiseases] = useState([]);
  const [proactiveAlerts, setProactiveAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-emerald-500/30 p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Bharat Swasthya AI • Public Health Radar
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            Protecting Your Family with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              AI Disease Intelligence
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time seasonal disease radar, contagious viral tracking across Indian states and districts, daily weather-correlated outbreak forecasts, and 24x7 AI tele-health symptom triage.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenChat}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/25 flex items-center gap-2.5 transition-all active:scale-95"
            >
              <Bot className="w-5 h-5" />
              <span>Talk to AI Health Assistant</span>
            </button>

            <button
              onClick={onOpenEmergency}
              className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-rose-300 hover:text-white border border-rose-500/30 font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all"
            >
              <PhoneCall className="w-5 h-5 text-rose-400" />
              <span>Emergency Help (108 Ambulance)</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 mt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Monitored Cases</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-display mt-0.5">
              {stats?.totalMonitoredCases || "1,420+"}
            </div>
            <div className="text-[10px] text-slate-500">Across surveillance network</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Active High Alerts</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 font-display mt-0.5">
              {stats?.activeOutbreaksCount || "8 Active"}
            </div>
            <div className="text-[10px] text-slate-500">Weather & vector risks</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Surveillance Districts</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-400 font-display mt-0.5">
              {stats?.totalSurveillanceDistricts || "32+"}
            </div>
            <div className="text-[10px] text-slate-500">Grassroots integration</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Emergency Hotlines</div>
            <div className="text-xl sm:text-2xl font-bold text-rose-400 font-display mt-0.5">
              24x7 Free
            </div>
            <div className="text-[10px] text-slate-500">108 / 102 / 1075 / 104</div>
          </div>
        </div>
      </section>

      {/* Location Filter Section */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              Regional Disease Surveillance Feed
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select your State and District to see active contagion risks & proactive advisories.
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
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-400" />
            Contagious & Viral Diseases Spread in {locationContext.district}, {locationContext.state}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {viralDiseases.length} Active Strains Detected
          </span>
        </div>

        {viralDiseases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viralDiseases.map((disease, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl glass-panel border border-slate-800 bg-slate-900/80 glass-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                      Viral Transmission
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      📍 {disease.district}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-white mb-2">{disease.diseaseName}</h4>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Cases Reported</div>
                      <div className="font-bold text-emerald-400 text-sm">
                        {disease.totalCases} Patients
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">Severity</div>
                      <div className="font-bold text-rose-400 capitalize text-sm">
                        {disease.highestSeverity || "Moderate"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Surveillance Status: Active</span>
                  <button
                    onClick={onOpenChat}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>Check Symptoms</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 bg-slate-900/60 text-center text-slate-400 text-sm">
            ✅ No critical viral outbreak spikes reported currently for {locationContext.district},{" "}
            {locationContext.state}. Maintain regular hygiene.
          </div>
        )}
      </section>

      {/* Proactive Weather & AI Outbreak Alerts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Proactive AI Weather-Linked Outbreak Forecasts
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated daily from meteorological indicators + doctor field observations
            </p>
          </div>
        </div>

        {proactiveAlerts.length > 0 ? (
          <div className="space-y-4">
            {proactiveAlerts.map((alert) => (
              <ProactiveAlertCard key={alert._id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center text-slate-400 text-sm">
            <Activity className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
            No active high-risk alerts in this district. AI engine continuously monitoring.
          </div>
        )}
      </section>

      {/* Instant Symptom Triage Banner */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Bot className="w-4 h-4" /> AI Tele-Health Symptom Checker
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
            Feeling unwell or experiencing fever, cough, or stomach cramps?
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Get instant medical guidance personalized for {locationContext.district}, {locationContext.state}, identify danger signs, and learn proper first-aid steps.
          </p>
        </div>

        <button
          onClick={onOpenChat}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 shrink-0 transition-all active:scale-95"
        >
          Launch Health Chatbot Now →
        </button>
      </section>
    </div>
  );
};
export default PublicCitizenPortal;
