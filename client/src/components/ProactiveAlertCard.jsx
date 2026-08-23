import React from "react";
import {
  AlertCircle,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bug,
  Activity,
} from "lucide-react";

export const ProactiveAlertCard = ({ alert }) => {
  const isHighRisk = alert.riskLevel === "high" || alert.riskLevel === "severe";

  const getRiskBadge = (level) => {
    switch (level) {
      case "severe":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "moderate":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all glass-panel glass-card-hover border ${
        isHighRisk
          ? "border-red-500/30 bg-slate-900/90 shadow-xl shadow-red-500/5"
          : "border-slate-800 bg-slate-900/70"
      }`}
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getRiskBadge(
                alert.riskLevel
              )}`}
            >
              {alert.riskLevel} Risk Outbreak
            </span>
            {alert.isViral && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Bug className="w-3 h-3" /> Contagious Viral
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              📍 {alert.city !== "All" ? `${alert.city}, ` : ""}{alert.district}, {alert.state}
            </span>
          </div>

          <h3 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
            {alert.diseaseName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-xl border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>AI Proactive Forecast</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-300 leading-relaxed mb-4">{alert.summary}</p>

      {/* Weather Factors Grid */}
      {alert.weatherFactors && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Temp</div>
              <div className="text-xs font-semibold text-white">
                {alert.weatherFactors.temperature || "30°C"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Humidity</div>
              <div className="text-xs font-semibold text-white">
                {alert.weatherFactors.humidity || "80%"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Rainfall Risk</div>
              <div className="text-xs font-semibold text-white truncate max-w-[100px]">
                {alert.weatherFactors.rainfallRisk || "Moderate"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Air Quality</div>
              <div className="text-xs font-semibold text-white truncate max-w-[100px]">
                {alert.weatherFactors.airQualityIndex || "Moderate"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Symptoms To Watch & Precautions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Symptoms */}
        {alert.symptomsToWatch?.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              Symptoms to Watch
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {alert.symptomsToWatch.map((sym, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-medium"
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Precautions */}
        {alert.recommendedPrecautions?.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Recommended Precautions
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {alert.recommendedPrecautions.map((prec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{prec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Insights footer */}
      {alert.aiInsights && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300 font-semibold">Epidemiological Analysis: </strong>
            {alert.aiInsights}
          </span>
        </div>
      )}
    </div>
  );
};
export default ProactiveAlertCard;
