import React, { useState } from "react";
import {
  X,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Send,
  MapPin,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export const CreateAdvisoryModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    diseaseCategory: "Vector-Borne (Viral)",
    priority: "urgent",
    targetState: "Maharashtra",
    targetDistrict: "Pune",
    targetCity: "All",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/doctor/advisories", formData);
      if (onCreated) onCreated(res.data?.advisory);
      onClose();
      setFormData({
        title: "",
        message: "",
        diseaseCategory: "Vector-Borne (Viral)",
        priority: "urgent",
        targetState: "Maharashtra",
        targetDistrict: "Pune",
        targetCity: "All",
      });
    } catch (err) {
      setError(err.message || "Failed to broadcast advisory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-amber-500/30 shadow-2xl overflow-hidden bg-slate-900/95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base sm:text-lg">
                Broadcast Doctor Health Advisory
              </h3>
              <p className="text-slate-400 text-xs">
                Attach directives to State, District, or City for Health Assistants
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Advisory Headline / Subject *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Intensify Door-to-Door Larval Surveys & Chlorine Tablet Handouts"
              className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-500 outline-none"
            />
          </div>

          {/* Disease Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Disease Category *
              </label>
              <select
                value={formData.diseaseCategory}
                onChange={(e) => setFormData({ ...formData, diseaseCategory: e.target.value })}
                className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="Vector-Borne (Viral)">Vector-Borne (Viral / Dengue / Malaria)</option>
                <option value="Water-Borne Illness">Water-Borne (Gastroenteritis / Typhoid)</option>
                <option value="Respiratory Viral">Respiratory Viral (Influenza / RSV)</option>
                <option value="General Health">General Public Health Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alert Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-500 outline-none cursor-pointer"
              >
                <option value="info">Info (Routine Guideline)</option>
                <option value="warning">Warning (Heightened Vigilance)</option>
                <option value="urgent">Urgent (Immediate Field Action)</option>
                <option value="critical">Critical Emergency Protocol</option>
              </select>
            </div>
          </div>

          {/* Location Targeting */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Target Geographic Jurisdiction
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target State *</label>
                <input
                  type="text"
                  required
                  value={formData.targetState}
                  onChange={(e) => setFormData({ ...formData, targetState: e.target.value })}
                  placeholder="Maharashtra"
                  className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target District</label>
                <input
                  type="text"
                  value={formData.targetDistrict}
                  onChange={(e) => setFormData({ ...formData, targetDistrict: e.target.value })}
                  placeholder="Pune or All"
                  className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target City / Taluk</label>
                <input
                  type="text"
                  value={formData.targetCity}
                  onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                  placeholder="Hadapsar or All"
                  className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Directive & Clinical Message *
            </label>
            <textarea
              rows="4"
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Detailed instructions for field health workers (e.g. check water tanks every Friday, distribute Halazone tablets, monitor platelet counts in high fever patients)..."
              className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-amber-500 outline-none resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Publishing..." : "Broadcast to Health Assistants"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateAdvisoryModal;
