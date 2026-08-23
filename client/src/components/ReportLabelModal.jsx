import React, { useState } from "react";
import {
  X,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Calendar,
  Sparkles,
  Bug,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export const ReportLabelModal = ({ report, isOpen, onClose, onLabeled }) => {
  const [formData, setFormData] = useState({
    confirmedDisease: report?.confirmedDisease || report?.suspectedDisease || "",
    doctorDiagnosis: report?.doctorDiagnosis || "",
    doctorRemarks: report?.doctorRemarks || "",
    prescribedAction: report?.prescribedAction || "",
    severity: report?.severity || "moderate",
    isViral: report?.isViral ?? true,
    isPublicAlert: report?.isPublicAlert ?? false,
    status: "verified_labeled",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorDiagnosis || !formData.confirmedDisease) {
      setError("Please provide both confirmed disease name and clinical diagnosis.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.put(`/doctor/reports/${report._id}/label`, formData);
      if (onLabeled) onLabeled(res.data?.report);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit clinical diagnosis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-blue-500/30 shadow-2xl overflow-hidden bg-slate-900/95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border-b border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg">
                Diagnostic Review & Clinical Labeling
              </h3>
              <p className="text-slate-400 text-xs">
                Case ID: <span className="font-mono text-slate-300">{report._id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Original Field Report Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Grassroots Observation by {report.reporter?.name || "Health Worker"}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {report.city}, {report.district}, {report.state}
              </span>
            </div>

            <h4 className="font-bold text-white text-base">{report.title}</h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              {report.description}
            </p>

            {/* Symptoms Tags & Patient Count */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                👥 {report.patientCount || 1} Patients Affected
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                Suspected: <strong>{report.suspectedDisease}</strong>
              </span>
              {report.symptoms?.map((sym, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                >
                  {sym}
                </span>
              ))}
            </div>

            {/* Attached Photo if any */}
            {report.image && (
              <div className="mt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Attached Clinical Photo:</div>
                <img
                  src={report.image}
                  alt="Medical Field Report"
                  className="max-h-48 rounded-xl border border-slate-700 object-cover"
                />
              </div>
            )}
          </div>

          {/* Doctor Labeling Inputs */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              Doctor Diagnostic Assessment
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Confirmed Disease */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirmed Clinical Disease Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.confirmedDisease}
                  onChange={(e) => setFormData({ ...formData, confirmedDisease: e.target.value })}
                  placeholder="e.g. Dengue Fever (DENV-2), H3N2 Influenza"
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Severity Level *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="low">Low Severity (Mild Febrile / Outpatient)</option>
                  <option value="moderate">Moderate Severity (Standard Clinical Triage)</option>
                  <option value="high">High Severity (Admission / Surveillance)</option>
                  <option value="critical">Critical Severity (ICU / Emergency Cluster)</option>
                </select>
              </div>
            </div>

            {/* Doctor Diagnosis Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Diagnosis & Pathological Remarks *
              </label>
              <textarea
                rows="2"
                required
                value={formData.doctorDiagnosis}
                onChange={(e) => setFormData({ ...formData, doctorDiagnosis: e.target.value })}
                placeholder="Doctor's clinical findings, confirmatory test results (NS1, Widal, RTPCR), and diagnostic notes..."
                className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            {/* Prescribed Actions / Guidelines */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prescribed Public Health Actions & Field Directives
              </label>
              <textarea
                rows="2"
                value={formData.prescribedAction}
                onChange={(e) => setFormData({ ...formData, prescribedAction: e.target.value })}
                placeholder="e.g. Initiate Abate larvicide spray in Ward 4; Distribute ORS packets; Home quarantine for 5 days..."
                className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-950/40 rounded-2xl border border-slate-800">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isViral}
                  onChange={(e) => setFormData({ ...formData, isViral: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-800 border-slate-700 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <Bug className="w-3.5 h-3.5 text-blue-400" />
                    Contagious Viral Disease
                  </div>
                  <div className="text-[11px] text-slate-400">Included in viral transmission feeds</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isPublicAlert}
                  onChange={(e) => setFormData({ ...formData, isPublicAlert: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded bg-slate-800 border-slate-700 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Broadcast Public Alert
                  </div>
                  <div className="text-[11px] text-slate-400">Visible on citizen disease radar</div>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Verifying..." : "Confirm Diagnosis & Verify Report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ReportLabelModal;
