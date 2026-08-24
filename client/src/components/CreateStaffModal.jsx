import React, { useState } from "react";
import {
  X,
  UserPlus,
  Shield,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  User,
  MapPin,
  Building,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { indiaLocations } from "../data/indiaLocations";

export const CreateStaffModal = ({ isOpen, onClose, onCreated }) => {
  const { role: currentUserRole } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: currentUserRole === "doctor" ? "health_assistant" : "doctor",
    state: "Maharashtra",
    district: "Pune",
    city: "Hadapsar",
    phone: "",
    qualification: "",
    hospitalOrClinic: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      let endpoint = "/admin/create-user";
      if (currentUserRole === "doctor") {
        endpoint = "/doctor/create-health-assistant";
      }

      const res = await axiosInstance.post(endpoint, formData);
      setSuccessMsg(res.message || "Staff account created successfully! Credentials email sent.");
      if (onCreated) onCreated(res.data?.user);

      setTimeout(() => {
        onClose();
        setFormData({
          name: "",
          email: "",
          password: "",
          role: currentUserRole === "doctor" ? "health_assistant" : "doctor",
          state: "Maharashtra",
          district: "Pune",
          city: "Hadapsar",
          phone: "",
          qualification: "",
          hospitalOrClinic: "",
        });
        setSuccessMsg("");
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to create staff account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                Create Staff Account
              </h3>
              <p className="text-slate-500 text-xs">
                {currentUserRole === "doctor"
                  ? "Register a new Health Assistant (ASHA field worker) in your district"
                  : "Provision Medical Doctor or Health Assistant credentials"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Selection (Admin only) */}
          {currentUserRole === "admin" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "doctor" })}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 font-semibold text-xs transition-all ${
                    formData.role === "doctor"
                      ? "bg-blue-50 text-blue-700 border-blue-300 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Medical Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "health_assistant" })}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 font-semibold text-xs transition-all ${
                    formData.role === "health_assistant"
                      ? "bg-teal-50 text-teal-700 border-teal-300 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-teal-600" />
                  Health Assistant (ASHA)
                </button>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Ramesh Joshi / Anita Shinde"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@bharatswasthya.gov.in"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Location Assignment Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <select
                required
                value={formData.state}
                onChange={(e) => {
                  const newState = e.target.value;
                  const newDistricts = indiaLocations[newState]?.districts || [];
                  const newDistrict = newDistricts[0] || "All";
                  const newCities = (indiaLocations[newState]?.cities?.[newDistrict] || []).filter((c) => c !== "All");
                  const newCity = newCities[0] || newDistrict;
                  setFormData({
                    ...formData,
                    state: newState,
                    district: newDistrict,
                    city: newCity,
                  });
                }}
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
              >
                {Object.keys(indiaLocations).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
              <select
                required
                value={formData.district}
                onChange={(e) => {
                  const newDistrict = e.target.value;
                  const newCities = (indiaLocations[formData.state]?.cities?.[newDistrict] || []).filter((c) => c !== "All");
                  const newCity = newCities[0] || newDistrict;
                  setFormData({
                    ...formData,
                    district: newDistrict,
                    city: newCity,
                  });
                }}
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
              >
                {(indiaLocations[formData.state]?.districts || []).map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Taluk *</label>
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
              >
                {(() => {
                  const citiesList = (indiaLocations[formData.state]?.cities?.[formData.district] || []).filter((c) => c !== "All");
                  if (citiesList.length === 0) {
                    return <option value={formData.district}>{formData.district} Main</option>;
                  }
                  return citiesList.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ));
                })()}
              </select>
            </div>
          </div>

          {/* Qualifications & Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital / Primary Health Centre (PHC)
              </label>
              <input
                type="text"
                value={formData.hospitalOrClinic}
                onChange={(e) => setFormData({ ...formData, hospitalOrClinic: e.target.value })}
                placeholder="Sassoon General Hospital / PHC Hadapsar"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medical Qualification / Designation
              </label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="MBBS, MD / ANM Worker"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Creating Account..." : "Save Account & Send Credentials"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStaffModal;
