import React, { useState, useEffect } from "react";
import {
  Building2,
  Bed,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronDown,
  X,
  Phone,
  MapPin,
  Sparkles,
  Shield,
  Activity,
  DollarSign,
  HeartPulse,
  Plus,
  Minus,
  SlidersHorizontal,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export const WARD_TYPES = [
  "General Ward",
  "Private Ward",
  "Semi-Private Ward",
  "ICU (Intensive Care Unit)",
  "ICCU (Intensive Cardiac Care Unit)",
  "Emergency / Casualty",
  "HDU (High Dependency Unit)",
  "Isolation Ward",
  "Pediatric Ward",
  "Neonatal ICU (NICU)",
  "Pediatric ICU (PICU)",
  "Maternity / Obstetric Ward",
  "Post-Operative / Recovery Ward",
  "Burns Ward",
  "Psychiatric Ward",
  "Other",
];

export const HospitalPortal = ({ onOpenProfile }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    wardType: "General Ward",
    customWardName: "",
    totalBeds: 20,
    vacantBeds: 5,
    pricePerDay: 800,
    amenities: "",
    notes: "",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchHospitalData = async () => {
    setLoading(true);
    try {
      const [statsRes, wardsRes] = await Promise.all([
        axiosInstance.get("/hospital/stats"),
        axiosInstance.get("/hospital/wards"),
      ]);
      setStats(statsRes.data);
      setWards(wardsRes.data?.wards || []);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const openAddModal = () => {
    setFormData({
      wardType: "General Ward",
      customWardName: "",
      totalBeds: 20,
      vacantBeds: 5,
      pricePerDay: 800,
      amenities: "",
      notes: "",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (ward) => {
    setSelectedWard(ward);
    setFormData({
      wardType: ward.wardType,
      customWardName: ward.customWardName || "",
      totalBeds: ward.totalBeds,
      vacantBeds: ward.vacantBeds,
      pricePerDay: ward.pricePerDay,
      amenities: Array.isArray(ward.amenities) ? ward.amenities.join(", ") : ward.amenities || "",
      notes: ward.notes || "",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (ward) => {
    setSelectedWard(ward);
    setIsDeleteModalOpen(true);
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    if (Number(formData.vacantBeds) > Number(formData.totalBeds)) {
      setFormError("Vacant beds cannot exceed total beds.");
      setFormLoading(false);
      return;
    }

    if (formData.wardType === "Other" && !formData.customWardName.trim()) {
      setFormError("Please enter custom ward name for 'Other' option.");
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        totalBeds: Number(formData.totalBeds),
        vacantBeds: Number(formData.vacantBeds),
        pricePerDay: Number(formData.pricePerDay),
        amenities: formData.amenities
          ? formData.amenities.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
      };

      await axiosInstance.post("/hospital/wards", payload);
      setFeedbackMsg("✅ Ward added successfully!");
      setIsAddModalOpen(false);
      fetchHospitalData();
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      setFormError(err.message || "Failed to add ward.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateWard = async (e) => {
    e.preventDefault();
    if (!selectedWard) return;
    setFormLoading(true);
    setFormError("");

    if (Number(formData.vacantBeds) > Number(formData.totalBeds)) {
      setFormError("Vacant beds cannot exceed total beds.");
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        totalBeds: Number(formData.totalBeds),
        vacantBeds: Number(formData.vacantBeds),
        pricePerDay: Number(formData.pricePerDay),
        amenities: formData.amenities
          ? formData.amenities.split(",").map((a) => a.trim()).filter(Boolean)
          : [],
      };

      await axiosInstance.put(`/hospital/wards/${selectedWard._id}`, payload);
      setFeedbackMsg("✅ Ward details updated successfully!");
      setIsEditModalOpen(false);
      fetchHospitalData();
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      setFormError(err.message || "Failed to update ward.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWard = async () => {
    if (!selectedWard) return;
    setFormLoading(true);
    try {
      await axiosInstance.delete(`/hospital/wards/${selectedWard._id}`);
      setFeedbackMsg("🗑️ Ward removed from hospital directory.");
      setIsDeleteModalOpen(false);
      fetchHospitalData();
      setTimeout(() => setFeedbackMsg(""), 3000);
    } catch (err) {
      alert(err.message || "Failed to delete ward.");
    } finally {
      setFormLoading(false);
    }
  };

  // Quick 1-click Vacant Bed Adjuster (Admit / Discharge)
  const handleQuickAdjustVacant = async (ward, delta) => {
    const newVacant = ward.vacantBeds + delta;
    if (newVacant < 0 || newVacant > ward.totalBeds) return;

    try {
      await axiosInstance.put(`/hospital/wards/${ward._id}`, {
        vacantBeds: newVacant,
      });
      // Optimistic local state update
      setWards((prev) =>
        prev.map((w) =>
          w._id === ward._id ? { ...w, vacantBeds: newVacant } : w
        )
      );
      // Refresh stats
      const statsRes = await axiosInstance.get("/hospital/stats");
      setStats(statsRes.data);
    } catch (err) {
      alert(err.message || "Failed to adjust vacant beds.");
    }
  };

  const filteredWards = wards.filter((w) => {
    const matchType = filterType === "All" || w.wardType === filterType;
    const matchSearch =
      !searchQuery ||
      w.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.wardType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Healthcare Facility Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            {user?.name || "Hospital Facility"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              {user?.city !== "All" ? `${user?.city}, ` : ""}{user?.district}, {user?.state}
            </span>
            {user?.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                {user.phone}
              </span>
            )}
            <span className="text-slate-400">
              • {user?.qualification || "Verified Healthcare Provider"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all border border-slate-200"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Ward</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs sm:text-sm font-semibold text-teal-900 flex items-center justify-between animate-fadeIn">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg("")} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Total Wards</span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            {stats?.totalWards || wards.length}
          </div>
          <div className="text-[10px] text-teal-700 font-medium">Active departments</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Beds</span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            {stats?.totalBeds || 0}
          </div>
          <div className="text-[10px] text-slate-500">Hospital capacity</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vacant Beds</span>
          </div>
          <div className="text-2xl font-bold font-display text-emerald-700 mt-1">
            {stats?.vacantBeds || 0}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">Ready for admission</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Occupancy Rate</span>
          </div>
          <div className="text-2xl font-bold font-display text-amber-600 mt-1">
            {stats?.occupancyRate || 0}%
          </div>
          <div className="text-[10px] text-amber-700 font-medium">
            {stats?.occupiedBeds || 0} occupied beds
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-purple-600" />
            <span>Avg Bed Rate</span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            ₹{stats?.avgPrice ? stats.avgPrice.toLocaleString() : 0}
          </div>
          <div className="text-[10px] text-slate-400">per day / bed</div>
        </div>
      </div>

      {/* Ward Management Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Controls & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Bed className="w-5 h-5 text-teal-600" />
              <span>Hospital Ward Directory & Live Bed Status</span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage bed capacity, update vacancies in real-time, adjust per-day pricing, or add new wards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wards..."
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter by Type */}
            <div className="relative min-w-[170px]">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium px-3 py-2 pr-7 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Ward Types</option>
                {WARD_TYPES.map((wt) => (
                  <option key={wt} value={wt}>
                    {wt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={fetchHospitalData}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              title="Refresh Wards"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Wards Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
            <span>Loading hospital wards...</span>
          </div>
        ) : filteredWards.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Bed className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-bold text-slate-800 text-sm">No Wards Registered Yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Add New Ward&quot; above to register General Wards, ICU, Maternity, or custom wards with real-time bed tracking.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Your First Ward</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Ward Name / Type</th>
                  <th className="py-3 px-3">Bed Capacity</th>
                  <th className="py-3 px-3">Vacant (Admit / Discharge)</th>
                  <th className="py-3 px-3">Price Per Day</th>
                  <th className="py-3 px-3">Occupancy</th>
                  <th className="py-3 px-3">Amenities / Notes</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWards.map((w) => {
                  const isAvailable = w.vacantBeds > 0;
                  const isIcu =
                    w.wardType.includes("ICU") ||
                    w.wardType.includes("ICCU") ||
                    w.wardType.includes("HDU") ||
                    w.wardType.includes("Emergency");

                  return (
                    <tr key={w._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{w.displayName}</span>
                          {w.wardType === "Other" && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold uppercase ${
                              isIcu
                                ? "bg-rose-50 text-rose-700"
                                : "bg-teal-50 text-teal-700"
                            }`}
                          >
                            {w.wardType}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 text-sm">
                          {w.totalBeds} Beds
                        </div>
                        <div className="text-[10px] text-slate-400">Total configured</div>
                      </td>

                      {/* Live Quick Vacant Bed Adjuster */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickAdjustVacant(w, -1)}
                            disabled={w.vacantBeds <= 0}
                            title="Admit Patient (Reduce 1 Vacant Bed)"
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-bold flex items-center justify-center border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span
                            className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border min-w-[50px] text-center ${
                              isAvailable
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {w.vacantBeds}
                          </span>

                          <button
                            onClick={() => handleQuickAdjustVacant(w, 1)}
                            disabled={w.vacantBeds >= w.totalBeds}
                            title="Discharge Patient (Increase 1 Vacant Bed)"
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 font-bold flex items-center justify-center border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {w.vacantBeds > 0 ? "Vacant Available" : "Full Capacity"}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900 text-sm font-display">
                          ₹{w.pricePerDay.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">per 24 hrs</div>
                      </td>

                      <td className="py-3 px-3 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">
                            {w.totalBeds - w.vacantBeds} / {w.totalBeds}
                          </span>
                          <span className="font-bold text-slate-700">
                            {w.occupancyRate}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              w.occupancyRate > 90
                                ? "bg-rose-500"
                                : w.occupancyRate > 60
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${w.occupancyRate}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[200px]">
                        {w.amenities && w.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {w.amenities.slice(0, 2).map((am, aIdx) => (
                              <span
                                key={aIdx}
                                className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium truncate"
                              >
                                {am}
                              </span>
                            ))}
                            {w.amenities.length > 2 && (
                              <span className="text-[9px] text-teal-700 font-bold">
                                +{w.amenities.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        {w.notes && (
                          <div className="text-[10px] text-slate-500 truncate" title={w.notes}>
                            {w.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(w)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-all"
                            title="Edit Ward"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openDeleteModal(w)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-all"
                            title="Delete Ward"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD WARD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                    Add Hospital Ward
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Register a new ward with bed capacity and price per day
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateWard} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Ward Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ward Type *
                </label>
                <div className="relative">
                  <select
                    value={formData.wardType}
                    onChange={(e) => setFormData({ ...formData, wardType: e.target.value })}
                    required
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer"
                  >
                    {WARD_TYPES.map((wt) => (
                      <option key={wt} value={wt}>
                        {wt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Conditional Custom Ward Name for 'Other' */}
              {formData.wardType === "Other" && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-semibold text-teal-800 mb-1">
                    Specify Custom Ward Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customWardName}
                    onChange={(e) => setFormData({ ...formData, customWardName: e.target.value })}
                    placeholder="e.g. Post-Covid Pulmonary Recovery / Dialysis Daycare"
                    className="w-full bg-teal-50/50 text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              )}

              {/* Bed Counts: Total & Vacant */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Beds in Ward *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vacant / Available Beds *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={formData.totalBeds}
                    value={formData.vacantBeds}
                    onChange={(e) => setFormData({ ...formData, vacantBeds: e.target.value })}
                    placeholder="e.g. 8"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Price Per Day */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price Per Day (₹ INR / Bed) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    placeholder="e.g. 1500"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-bold"
                  />
                  <span className="text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">
                    ₹
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amenities / Equipment (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Ventilator, Oxygen Support, 24/7 Intensivist, Air Conditioning"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Notes / Insurance (Ayushman Bharat, etc.)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Covered under Ayushman Bharat / MJPJAY schemes."
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formLoading ? "Adding Ward..." : "Save & Publish Ward"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WARD MODAL */}
      {isEditModalOpen && selectedWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                    Edit Ward: {selectedWard.displayName}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Update bed availability, price per day, or details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateWard} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ward Type *
                </label>
                <div className="relative">
                  <select
                    value={formData.wardType}
                    onChange={(e) => setFormData({ ...formData, wardType: e.target.value })}
                    required
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer"
                  >
                    {WARD_TYPES.map((wt) => (
                      <option key={wt} value={wt}>
                        {wt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {formData.wardType === "Other" && (
                <div className="animate-fadeIn">
                  <label className="block text-xs font-semibold text-teal-800 mb-1">
                    Specify Custom Ward Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customWardName}
                    onChange={(e) => setFormData({ ...formData, customWardName: e.target.value })}
                    placeholder="e.g. Post-Covid Pulmonary Recovery / Dialysis Daycare"
                    className="w-full bg-teal-50/50 text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Beds in Ward *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.totalBeds}
                    onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vacant / Available Beds *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={formData.totalBeds}
                    value={formData.vacantBeds}
                    onChange={(e) => setFormData({ ...formData, vacantBeds: e.target.value })}
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Price Per Day (₹ INR / Bed) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none font-bold"
                  />
                  <span className="text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2">
                    ₹
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amenities / Equipment (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Ventilator, Oxygen Support, Air Conditioning"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Notes / Insurance
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formLoading ? "Saving..." : "Update Ward Details"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">
                Delete {selectedWard.displayName}?
              </h3>
              <p className="text-xs text-slate-500">
                This will remove this ward and its bed allocation from public and clinical surveillance searches.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
              <div><strong>Ward Type:</strong> {selectedWard.wardType}</div>
              <div><strong>Total Beds:</strong> {selectedWard.totalBeds} ({selectedWard.vacantBeds} Vacant)</div>
              <div><strong>Rate:</strong> ₹{selectedWard.pricePerDay}/day</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWard}
                disabled={formLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 disabled:opacity-50"
              >
                {formLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalPortal;
