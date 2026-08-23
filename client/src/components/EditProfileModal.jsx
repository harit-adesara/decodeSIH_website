import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  Shield,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "Maharashtra",
    district: "Pune",
    city: "Hadapsar",
    hospitalOrClinic: "",
    qualification: "",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        state: user.state || "Maharashtra",
        district: user.district || "Pune",
        city: user.city || "Hadapsar",
        hospitalOrClinic: user.hospitalOrClinic || "",
        qualification: user.qualification || "",
      });
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case "admin":
        return {
          label: "National Health Administrator",
          icon: Shield,
          style: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "doctor":
        return {
          label: "Medical Doctor / Clinician",
          icon: Stethoscope,
          style: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "health_assistant":
        return {
          label: "Field Health Worker (ASHA)",
          icon: HeartHandshake,
          style: "bg-teal-50 text-teal-700 border-teal-200",
        };
      default:
        return {
          label: "Registered Citizen",
          icon: User,
          style: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
    }
  };

  const roleInfo = getRoleBadge(user.role);
  const RoleIcon = roleInfo.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await updateProfile(formData);
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                Edit User Profile
              </h3>
              <p className="text-slate-500 text-xs">
                Manage personal credentials and regional jurisdiction
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Account Overview (Read Only) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] text-slate-500">Registered Email Address</div>
              <div className="text-xs font-mono font-semibold text-slate-800">{user.email}</div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border ${roleInfo.style}`}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              {roleInfo.label}
            </span>
          </div>

          {/* Full Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Geographic Jurisdiction */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Geographic Jurisdiction / Area of Operation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Maharashtra"
                  className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">District *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Pune"
                  className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">City / Taluk / Village</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Hadapsar"
                  className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Staff specific fields (Doctor & Health Assistant) */}
          {(user.role === "doctor" || user.role === "health_assistant" || user.role === "admin") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Facility / Hospital / Clinic
                </label>
                <input
                  type="text"
                  value={formData.hospitalOrClinic}
                  onChange={(e) => setFormData({ ...formData, hospitalOrClinic: e.target.value })}
                  placeholder="e.g. Hadapsar PHC / Sassoon General Hospital"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600" /> Qualification / Designation
                </label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. MBBS, MD (Medicine) / ASHA Lead"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Save Button */}
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
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
