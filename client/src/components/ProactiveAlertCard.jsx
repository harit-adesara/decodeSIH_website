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
        return "bg-rose-50 text-rose-700 border-rose-300";
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-300";
      case "moderate":
        return "bg-amber-50 text-amber-700 border-amber-300";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
    }
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 transition-all bg-white border shadow-sm glass-card-hover ${
        isHighRisk
          ? "border-rose-200"
          : "border-slate-200"
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
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Bug className="w-3 h-3 text-blue-600" /> Contagious Viral
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">
              📍 {alert.city !== "All" ? `${alert.city}, ` : ""}{alert.district}, {alert.state}
            </span>
          </div>

          <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
            {alert.diseaseName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-semibold px-2.5 py-1 rounded-xl border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>AI Proactive Forecast</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{alert.summary}</p>

      {/* Weather Factors Grid */}
      {alert.weatherFactors && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Temp</div>
              <div className="text-xs font-semibold text-slate-800">
                {alert.weatherFactors.temperature || "30°C"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Humidity</div>
              <div className="text-xs font-semibold text-slate-800">
                {alert.weatherFactors.humidity || "80%"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Rainfall Risk</div>
              <div className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">
                {alert.weatherFactors.rainfallRisk || "Moderate"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-indigo-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Air Quality</div>
              <div className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">
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
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-600" />
              Symptoms to Watch
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {alert.symptomsToWatch.map((sym, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium"
                >
                  {sym}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Precautions */}
        {alert.recommendedPrecautions?.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Recommended Precautions
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {alert.recommendedPrecautions.map((prec, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                  <span>{prec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Insights footer */}
      {alert.aiInsights && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-700 font-semibold">Epidemiological Analysis: </strong>
            {alert.aiInsights}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProactiveAlertCard;
