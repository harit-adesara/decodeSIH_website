import React, { useState } from "react";
import {
  X,
  Bug,
  AlertTriangle,
  Activity,
  ShieldCheck,
  MapPin,
  Bot,
  PhoneCall,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  Copy,
  Check,
  AlertOctagon,
  ChevronRight,
  Sparkles,
  HeartPulse,
  Info,
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

export const ViralDiseaseDetailsModal = ({
  disease,
  isOpen,
  onClose,
  onOpenChatWithPrompt,
  onOpenEmergency,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'symptoms', 'clinical', 'reports'

  if (!isOpen || !disease) return null;

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-300",
          dot: "bg-rose-500",
          label: "Critical Severity",
        };
      case "high":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          label: "High Severity",
        };
      case "moderate":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Moderate Severity",
        };
      default:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Low / Monitored",
        };
    }
  };

  const severityBadge = getSeverityBadge(disease.highestSeverity);

  const handleCopyAdvisory = () => {
    const text = `🚨 *Bharat Swasthya AI Viral Outbreak Advisory*\n\n` +
      `🦠 *Disease*: ${disease.diseaseName}\n` +
      `📍 *Location*: ${disease.district}, ${disease.state}\n` +
      `👥 *Monitored Cases*: ${disease.totalCases} patients across ${disease.activeReportsCount} clinical reports\n` +
      `⚠️ *Severity*: ${disease.highestSeverity || "Moderate"}\n\n` +
      `🔬 *Transmission*: ${disease.transmissionType || "Contagious Viral Transmission"}\n` +
      `🩹 *Key Symptoms*: ${(disease.symptoms || []).join(", ")}\n\n` +
      `🛡️ *Clinical Protocol*: ${disease.clinicalProtocol || "Consult nearest medical officer."}\n` +
      `📞 *Emergency Helpline*: Dial 108 for 24x7 Ambulance Dispatch.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchChatbot = () => {
    const prompt = `I am inquiring about ${disease.diseaseName} currently spreading in ${disease.district}, ${disease.state}. What are the primary symptoms, red flag danger signs, and immediate home care guidelines?`;
    if (onOpenChatWithPrompt) {
      onOpenChatWithPrompt(prompt);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-bold uppercase tracking-wider">
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              Contagious Viral Pathogen
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${severityBadge.dot} animate-ping`} />
              {severityBadge.label}
            </span>

            <span className="text-xs text-teal-200/90 flex items-center gap-1 font-medium ml-auto pr-8 sm:pr-0">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              {disease.district}, {disease.state}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {disease.diseaseName}
          </h2>

          <p className="text-teal-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            Verified Epidemiological Profile & Clinical Guidance for Health Centers in {disease.district}
          </p>

          {/* Quick Metrics Header Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/15">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-teal-200/80">Total Cases</div>
              <div className="text-lg font-bold font-display text-white mt-0.5">
                {disease.totalCases} Patients
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-teal-200/80">Active Reports</div>
              <div className="text-lg font-bold font-display text-white mt-0.5">
                {disease.activeReportsCount} Centers
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-teal-200/80">Incubation</div>
              <div className="text-xs font-bold text-teal-200 mt-1 truncate">
                {disease.incubationPeriod || "4 - 10 Days"}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-[10px] uppercase font-semibold text-teal-200/80">Season Peak</div>
              <div className="text-xs font-bold text-amber-300 mt-1 truncate">
                {disease.seasonalRisk || "Monsoon / Wave"}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold text-slate-600 flex-shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-teal-600 text-teal-800 font-extrabold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            Epidemiological Overview
          </button>

          <button
            onClick={() => setActiveTab("symptoms")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "symptoms"
                ? "border-teal-600 text-teal-800 font-extrabold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Symptoms & Red Flags
          </button>

          <button
            onClick={() => setActiveTab("clinical")}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "clinical"
                ? "border-teal-600 text-teal-800 font-extrabold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            Clinical Protocol & Remarks
          </button>

          {disease.sampleReports?.length > 0 && (
            <button
              onClick={() => setActiveTab("reports")}
              className={`py-3 px-2 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "reports"
                  ? "border-teal-600 text-teal-800 font-extrabold"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              Field Reports ({disease.sampleReports.length})
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs sm:text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Transmission & Pathogen Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  <Bug className="w-4 h-4 text-teal-600" />
                  Transmission Mode & Pathogen Classification
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {disease.transmissionType || "Vector-borne or airborne contagious transmission."}
                </p>
                {disease.highRiskGroups && (
                  <div className="mt-2 pt-2 border-t border-slate-200/80 text-xs text-slate-500">
                    <strong className="text-slate-700">High-Risk Vulnerable Cohorts: </strong>
                    {disease.highRiskGroups}
                  </div>
                )}
              </div>

              {/* Geographic Hotspots / Affected Areas */}
              {disease.affectedCities?.length > 0 && (
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider mb-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    Localities & Sub-Districts with Active Cases
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {disease.affectedCities.map((city, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-800 text-xs font-semibold"
                      >
                        📍 {city}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Precautions */}
              {disease.recommendedPrecautions?.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Community & Household Prevention Protocol
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {disease.recommendedPrecautions.map((prec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{prec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYMPTOMS & RED FLAGS */}
          {activeTab === "symptoms" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Primary Clinical Symptoms */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  Primary Symptoms Reported in Patients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(disease.symptoms || []).map((sym, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xs flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Red Flag Warning Signs */}
              {disease.dangerSigns?.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
                    Emergency Danger Signs — Seek Immediate Hospital Care
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-900">
                    {disease.dangerSigns.map((sign, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold">⚠️</span>
                        <span className="font-medium">{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLINICAL PROTOCOL */}
          {activeTab === "clinical" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Clinical Protocol & Warnings */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Recommended Treatment & Medication Protocol
                </div>
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  <MarkdownRenderer content={disease.clinicalProtocol || "Maintain oral hydration with ORS and monitor vital signs. Consult certified medical doctor for prescriptions."} />
                </div>
              </div>

              {/* Attending Doctor Remarks */}
              {disease.doctorRemarks?.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-teal-600" />
                    Doctor Field Notes & Regional Observations
                  </h4>
                  <div className="space-y-2">
                    {disease.doctorRemarks.map((remark, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic">
                        "{remark}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prescribed Actions */}
              {disease.prescribedActions?.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Doctor-Prescribed Interventions
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {disease.prescribedActions.map((action, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">✓</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAMPLE FIELD REPORTS */}
          {activeTab === "reports" && disease.sampleReports?.length > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Grassroots Clinical Reports ({disease.district})
              </h4>
              {disease.sampleReports.map((report, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{report.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 capitalize">
                      {report.severity}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span>📍 {report.city}</span>
                    <span>👥 {report.patientCount} Patient(s)</span>
                    {report.createdAt && (
                      <span>📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {report.doctorDiagnosis && (
                    <div className="text-xs text-slate-700 pt-1 border-t border-slate-200/80">
                      <strong>Diagnosis:</strong> {report.doctorDiagnosis}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer / Action Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAdvisory}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy Advisory"}</span>
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
              <span>Triage with AI Assistant</span>
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

export default ViralDiseaseDetailsModal;
