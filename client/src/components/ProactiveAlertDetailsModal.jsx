import React, { useState } from "react";
import {
  X,
  Sparkles,
  AlertTriangle,
  Activity,
  ShieldCheck,
  MapPin,
  Bot,
  PhoneCall,
  Calendar,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  CheckCircle2,
  Copy,
  Check,
  Bug,
  ChevronRight,
  TrendingUp,
  Brain,
  Info,
} from "lucide-react";

export const ProactiveAlertDetailsModal = ({
  alert,
  isOpen,
  onClose,
  onOpenChatWithPrompt,
  onOpenEmergency,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("forecast"); // 'forecast', 'weather', 'symptoms', 'precautions'

  if (!isOpen || !alert) return null;

  const getRiskBadge = (level) => {
    switch (level?.toLowerCase()) {
      case "severe":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-300",
          dot: "bg-rose-600",
          label: "Severe Outbreak Threat",
        };
      case "high":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          label: "High Outbreak Risk",
        };
      case "moderate":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Moderate Watch",
        };
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Low Risk Level",
        };
    }
  };

  const riskBadge = getRiskBadge(alert.riskLevel);

  const handleCopyAlert = () => {
    const text = `🚨 *Bharat Swasthya AI Proactive Outbreak Forecast*\n\n` +
      `🦠 *Forecast Target*: ${alert.diseaseName}\n` +
      `📍 *Location*: ${alert.city !== "All" ? `${alert.city}, ` : ""}${alert.district}, ${alert.state}\n` +
      `⚠️ *Risk Level*: ${alert.riskLevel?.toUpperCase()} RISK\n\n` +
      `🌡️ *Weather Telemetry*: Temp: ${alert.weatherFactors?.temperature || "N/A"}, Humidity: ${alert.weatherFactors?.humidity || "N/A"}, Rainfall: ${alert.weatherFactors?.rainfallRisk || "N/A"}, AQI: ${alert.weatherFactors?.airQualityIndex || "N/A"}\n\n` +
      `📊 *AI Epidemiological Summary*: ${alert.summary}\n\n` +
      `🩹 *Key Symptoms to Watch*: ${(alert.symptomsToWatch || []).join(", ")}\n\n` +
      `🛡️ *Recommended Action*: ${(alert.recommendedPrecautions || []).join("; ")}\n\n` +
      `📞 *Emergency Ambulance*: Dial 108.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchChatbot = () => {
    const prompt = `I am reviewing the AI Outbreak Forecast for ${alert.diseaseName} in ${alert.district}, ${alert.state} (${alert.riskLevel} Risk). What proactive steps and preventive actions should my family take right now?`;
    if (onOpenChatWithPrompt) {
      onOpenChatWithPrompt(prompt);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-800 via-teal-900 to-slate-900 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Proactive AI Outbreak Forecast
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${riskBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${riskBadge.dot} animate-ping`} />
              {riskBadge.label}
            </span>

            {alert.isViral && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                <Bug className="w-3 h-3 text-blue-300" /> Contagious Viral
              </span>
            )}

            <span className="text-xs text-teal-200/90 flex items-center gap-1 font-medium ml-auto pr-8 sm:pr-0">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              {alert.city !== "All" ? `${alert.city}, ` : ""}{alert.district}, {alert.state}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {alert.diseaseName}
          </h2>

          <p className="text-amber-100/90 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            {alert.summary}
          </p>

          {/* Quick Weather Factors Header Strip */}
          {alert.weatherFactors && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/15">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-teal-200/80">Temperature</div>
                  <div className="text-sm font-bold text-white">
                    {alert.weatherFactors.temperature || "30°C"}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-300 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-teal-200/80">Humidity</div>
                  <div className="text-sm font-bold text-white">
                    {alert.weatherFactors.humidity || "80%"}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-cyan-300 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-teal-200/80">Rainfall Risk</div>
                  <div className="text-xs font-bold text-white truncate max-w-[90px]">
                    {alert.weatherFactors.rainfallRisk || "Moderate"}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                <Wind className="w-4 h-4 text-indigo-300 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-teal-200/80">Air Quality</div>
                  <div className="text-xs font-bold text-white truncate max-w-[90px]">
                    {alert.weatherFactors.airQualityIndex || "Moderate"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold text-slate-600 flex-shrink-0">
          <button
            onClick={() => setActiveTab("forecast")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "forecast"
                ? "border-amber-600 text-amber-800 font-extrabold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-600" />
            AI Outbreak Intelligence
          </button>

          <button
            onClick={() => setActiveTab("weather")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "weather"
                ? "border-teal-600 text-teal-800 font-extrabold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <CloudRain className="w-3.5 h-3.5 text-teal-600" />
            Climate Correlation Matrix
          </button>

          <button
            onClick={() => setActiveTab("symptoms")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "symptoms"
                ? "border-teal-600 text-teal-800 font-extrabold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-600" />
            Symptoms Checklist
          </button>

          <button
            onClick={() => setActiveTab("precautions")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "precautions"
                ? "border-teal-600 text-teal-800 font-extrabold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Actionable Protocol
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs sm:text-sm">
          {/* TAB 1: AI OUTBREAK INTELLIGENCE */}
          {activeTab === "forecast" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Epidemiological Summary */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <Brain className="w-4 h-4 text-amber-600" />
                  AI Epidemiological Risk Assessment
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium">
                  {alert.aiInsights || alert.summary}
                </p>
              </div>

              {/* Telemetry Source Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Reports Analyzed</div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {alert.sourceDataCount?.reportsAnalyzed || 18}+ Clinical Notes
                  </div>
                  <div className="text-[11px] text-teal-600 font-medium">Doctors & ASHA field inputs</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Advisories Synthesized</div>
                  <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                    {alert.sourceDataCount?.advisoriesAnalyzed || 4} Health Advisories
                  </div>
                  <div className="text-[11px] text-teal-600 font-medium">District Medical Officers</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Forecast Horizon</div>
                  <div className="text-base sm:text-lg font-bold text-amber-600 mt-0.5">
                    Active 7-Day Window
                  </div>
                  <div className="text-[11px] text-slate-500">Daily midnight AI refresh</div>
                </div>
              </div>

              {/* Target Location Alert */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>
                    <strong>Target Zone:</strong> {alert.city !== "All" ? `${alert.city}, ` : "All Sectors, "}{alert.district}, {alert.state}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  Generated by: <strong>{alert.generatedBy === "gemini_ai" ? "Gemini Outbreak Model" : "Epidemiological Rule Engine"}</strong>
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: CLIMATE MATRIX */}
          {activeTab === "weather" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-teal-600" />
                  Meteorological Outbreak Triggers in {alert.district}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Historical outbreak telemetry indicates sudden changes in relative humidity, stagnant water puddles after intermittent showers, and fluctuating ambient temperatures accelerate pathogen reproduction and vector breeding cycles.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                      <Thermometer className="w-4 h-4 text-amber-500" />
                      Ambient Temperature: {alert.weatherFactors?.temperature || "30°C"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Optimal range for mosquito viral replication and vector lifespan.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Relative Humidity: {alert.weatherFactors?.humidity || "82%"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      High humidity increases mosquito feeding frequency & indoor survival.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-700">
                      <CloudRain className="w-4 h-4 text-teal-600" />
                      Rainfall Factor: {alert.weatherFactors?.rainfallRisk || "Moderate"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Rainwater accumulation in drains and uncovered containers.
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                      <Wind className="w-4 h-4 text-indigo-500" />
                      Air Quality Index: {alert.weatherFactors?.airQualityIndex || "Moderate"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Particulate matter exacerbates upper respiratory viral susceptibility.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYMPTOMS CHECKLIST */}
          {activeTab === "symptoms" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  Primary Symptoms to Watch During this Outbreak Window
                </h4>
                <div className="space-y-2">
                  {(alert.symptomsToWatch || []).map((sym, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium flex items-start gap-2.5 shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                      <span>{sym}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIONABLE PROTOCOL */}
          {activeTab === "precautions" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Recommended Precautions for Citizens & Families
                </div>
                <div className="space-y-2">
                  {(alert.recommendedPrecautions || []).map((prec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-800 font-medium flex items-start gap-2.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{prec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAlert}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied Forecast!" : "Share Forecast"}</span>
            </button>

            {onOpenEmergency && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEmergency();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>108 Ambulance Hotline</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchChatbot}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs sm:text-sm font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProactiveAlertDetailsModal;
