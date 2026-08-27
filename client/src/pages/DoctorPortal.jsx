import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Megaphone,
  UserPlus,
  BarChart3,
  ListFilter,
  Search,
  MapPin,
  Bug,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import LocationFilter from "../components/LocationFilter";
import ReportLabelModal from "../components/ReportLabelModal";
import CreateAdvisoryModal from "../components/CreateAdvisoryModal";
import CreateStaffModal from "../components/CreateStaffModal";
import AnalyticsView from "../components/AnalyticsView";
import { useAuth } from "../context/AuthContext";

export const DoctorPortal = ({ onOpenProfile }) => {
  const { user, locationContext, updateLocation } = useAuth();
  const [activeTab, setActiveTab] = useState("review"); // 'review', 'analytics', 'advisories'
  const [reports, setReports] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedReportForLabel, setSelectedReportForLabel] = useState(null);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);

  // New Doctor Report Form state
  const [newReport, setNewReport] = useState({
    title: "",
    description: "",
    suspectedDisease: "",
    confirmedDisease: "",
    symptoms: "",
    severity: "moderate",
    isViral: true,
    patientCount: 1,
    state: user?.state || "Maharashtra",
    district: user?.district || "Pune",
    city: user?.city || "Shivajinagar",
    doctorRemarks: "",
    prescribedAction: "",
    isPublicAlert: true,
  });
  const [reportImageFile, setReportImageFile] = useState(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Quick Alert Form State
  const [quickAlertForm, setQuickAlertForm] = useState({
    title: "",
    diseaseName: "",
    symptoms: "",
    severity: "moderate",
    patientCount: 1,
    description: "",
    state: user?.state || "Maharashtra",
    district: user?.district || "Pune",
    city: user?.city || "Shivajinagar",
  });
  const [quickAlertSubmitting, setQuickAlertSubmitting] = useState(false);
  const [quickAlertSuccess, setQuickAlertSuccess] = useState(false);

  const symptomPresets = [
    "High Fever (>102\u00B0F)",
    "Severe Joint / Bone Pain",
    "Watery Loose Stools",
    "Repeated Vomiting",
    "Dry Barking Cough",
    "Petechial Skin Rash",
    "Sore Throat",
    "Severe Headache",
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/doctor/reports?state=${locationContext.state}&district=${locationContext.district}&status=${statusFilter}&search=${searchQuery}`
      );
      setReports(res.data?.reports || []);
    } catch (err) {
      console.error("Failed to load doctor reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axiosInstance.get(
        `/doctor/analytics?state=${locationContext.state}&district=${locationContext.district}`
      );
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Failed to load doctor analytics:", err);
    }
  };

  const fetchAdvisories = async () => {
    try {
      const res = await axiosInstance.get(
        `/doctor/advisories?state=${locationContext.state}&district=${locationContext.district}`
      );
      setAdvisories(res.data?.advisories || []);
    } catch (err) {
      console.error("Failed to load doctor advisories:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "review") fetchReports();
    else if (activeTab === "analytics") fetchAnalytics();
    else if (activeTab === "advisories") fetchAdvisories();
  }, [activeTab, locationContext.state, locationContext.district, statusFilter]);

  const handleCreateDoctorReport = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const formData = new FormData();
      Object.keys(newReport).forEach((key) => {
        formData.append(key, newReport[key]);
      });
      if (reportImageFile) {
        formData.append("image", reportImageFile);
      }

      await axiosInstance.post("/doctor/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowCreateReportModal(false);
      setReportImageFile(null);
      fetchReports();
    } catch (err) {
      alert(err.message || "Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const toggleQuickAlertSymptom = (sym) => {
    const currentList = quickAlertForm.symptoms
      ? quickAlertForm.symptoms.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    let updatedList;
    if (currentList.includes(sym)) {
      updatedList = currentList.filter((s) => s !== sym);
    } else {
      updatedList = [...currentList, sym];
    }
    setQuickAlertForm({ ...quickAlertForm, symptoms: updatedList.join(", ") });
  };

  const handleQuickAlertSubmit = async (e) => {
    e.preventDefault();
    setQuickAlertSubmitting(true);
    setQuickAlertSuccess(false);

    try {
      await axiosInstance.post("/immediate-alerts", {
        title: quickAlertForm.title,
        description: quickAlertForm.description,
        diseaseName: quickAlertForm.diseaseName,
        symptoms: quickAlertForm.symptoms,
        severity: quickAlertForm.severity,
        patientCount: quickAlertForm.patientCount,
        state: quickAlertForm.state,
        district: quickAlertForm.district,
        city: quickAlertForm.city,
      });

      setQuickAlertSuccess(true);
      setQuickAlertForm({
        title: "",
        diseaseName: "",
        symptoms: "",
        severity: "moderate",
        patientCount: 1,
        description: "",
        state: user?.state || "Maharashtra",
        district: user?.district || "Pune",
        city: user?.city || "Shivajinagar",
      });

      setTimeout(() => setQuickAlertSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish alert.");
    } finally {
      setQuickAlertSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4 text-teal-600" /> Medical Officer Diagnostic Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            {user?.name || "Dr. Rajesh Sharma, MD"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {user?.hospitalOrClinic || "Sassoon General Hospital & Medical College"} •{" "}
            <span className="text-teal-700 font-semibold">{user?.qualification || "MD Internal Medicine"}</span>
          </p>
        </div>

        {/* Action Buttons */}
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
            onClick={() => setShowCreateReportModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Add Clinical Report
          </button>
          <button
            onClick={() => setShowAdvisoryModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Megaphone className="w-4 h-4" /> Broadcast Advisory
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Create Health Assistant
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("review")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "review"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ListFilter className="w-4 h-4" />
          Field Reports & Diagnostic Review
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "analytics"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Epidemiological Trends & Analytics
        </button>

        <button
          onClick={() => setActiveTab("advisories")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "advisories"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Regional Bulletins & Advisories ({advisories.length})
        </button>

        <button
          onClick={() => setActiveTab("quick-alert")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "quick-alert"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Quick Viral Alert
        </button>
      </div>

      {/* Location Bar */}
      <LocationFilter
        selectedState={locationContext.state}
        selectedDistrict={locationContext.district}
        selectedCity={locationContext.city}
        onChange={({ state, district, city }) => updateLocation(state, district, city)}
      />

      {/* Tab 1: Diagnostic Review Station */}
      {activeTab === "review" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-semibold pl-1">Status Filter:</span>
              <button
                onClick={() => setStatusFilter("pending_review")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "pending_review"
                    ? "bg-amber-50 text-amber-700 border border-amber-300"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setStatusFilter("verified_labeled")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "verified_labeled"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                Verified & Labeled
              </button>
              <button
                onClick={() => setStatusFilter("All")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "All"
                    ? "bg-teal-50 text-teal-700 border border-teal-300"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                All Reports
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchReports()}
                  placeholder="Search diseases, symptoms..."
                  className="bg-white text-slate-800 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none w-48 sm:w-60"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                onClick={fetchReports}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reports Grid / Cards */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-teal-600 animate-spin" />
              Loading surveillance reports...
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm glass-card-hover space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            report.status === "verified_labeled"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {report.status === "verified_labeled" ? "Verified Diagnosis" : "Pending Doctor Review"}
                        </span>
                        {report.isViral && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Bug className="w-3 h-3" /> Viral Strain
                          </span>
                        )}
                        <span className="text-xs text-slate-500">
                          📍 {report.city}, {report.district}, {report.state}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{report.title}</h3>
                    </div>

                    <button
                      onClick={() => setSelectedReportForLabel(report)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      {report.status === "verified_labeled" ? "Update Diagnosis" : "Diagnose & Label"}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    {report.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                      👥 {report.patientCount || 1} Patients Affected
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                      Suspected: <strong className="text-amber-700">{report.suspectedDisease}</strong>
                    </span>
                    {report.confirmedDisease && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                        Confirmed: <strong>{report.confirmedDisease}</strong>
                      </span>
                    )}
                    {report.symptoms?.map((sym, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-200"
                      >
                        {sym}
                      </span>
                    ))}
                  </div>

                  {/* Attached photo preview if any */}
                  {report.image && (
                    <div className="pt-1">
                      <img
                        src={report.image}
                        alt="Medical report"
                        className="h-32 rounded-xl border border-slate-200 object-cover"
                      />
                    </div>
                  )}

                  {/* Doctor remarks banner if already labeled */}
                  {report.doctorDiagnosis && (
                    <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-start gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Doctor Clinical Findings: </strong>
                        {report.doctorDiagnosis}. {report.doctorRemarks}
                        {report.prescribedAction && (
                          <div className="text-slate-700 mt-1">
                            <strong>Prescribed Action: </strong>
                            {report.prescribedAction}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-slate-200">
              No reports found matching current filter parameters.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Analytics */}
      {activeTab === "analytics" && (
        <AnalyticsView analyticsData={analyticsData} title="Doctor Epidemiological Intelligence" />
      )}

      {/* Tab 3: Advisories */}
      {activeTab === "advisories" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Broadcasted Medical Advisories & Directives</h3>
            <button
              onClick={() => setShowAdvisoryModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Megaphone className="w-3.5 h-3.5" /> Create New Advisory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisories.map((advisory) => (
              <div
                key={advisory._id}
                className="p-5 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                    {advisory.priority} Priority
                  </span>
                  <span className="text-xs text-slate-500">
                    Target: {advisory.targetDistrict}, {advisory.targetState}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{advisory.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {advisory.message}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Issued by: {advisory.doctor?.name || "Medical Officer"}</span>
                  <span>{new Date(advisory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Quick Viral Alert */}
      {activeTab === "quick-alert" && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-rose-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Publish Immediate Viral Alert
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Alert citizens instantly about disease outbreaks in your area. No approval needed — goes live immediately.
            </p>
          </div>

          {quickAlertSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-700 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Alert published successfully! Citizens in your area can now see this alert.</span>
            </div>
          )}

          <form onSubmit={handleQuickAlertSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disease Name *</label>
                <input
                  type="text"
                  required
                  value={quickAlertForm.diseaseName}
                  onChange={(e) => setQuickAlertForm({ ...quickAlertForm, diseaseName: e.target.value })}
                  placeholder="e.g. Dengue Fever, Viral Flu"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Cases *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={quickAlertForm.patientCount}
                  onChange={(e) => setQuickAlertForm({ ...quickAlertForm, patientCount: Number(e.target.value) })}
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Title *</label>
              <input
                type="text"
                required
                value={quickAlertForm.title}
                onChange={(e) => setQuickAlertForm({ ...quickAlertForm, title: e.target.value })}
                placeholder="e.g. Dengue Surge in Shivajinagar - 8 Cases This Week"
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Location
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={quickAlertForm.state}
                  onChange={(e) => setQuickAlertForm({ ...quickAlertForm, state: e.target.value })}
                  placeholder="State"
                  className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
                <input
                  type="text"
                  required
                  value={quickAlertForm.district}
                  onChange={(e) => setQuickAlertForm({ ...quickAlertForm, district: e.target.value })}
                  placeholder="District"
                  className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
                <input
                  type="text"
                  required
                  value={quickAlertForm.city}
                  onChange={(e) => setQuickAlertForm({ ...quickAlertForm, city: e.target.value })}
                  placeholder="City / Area"
                  className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Symptoms (click to tag)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {symptomPresets.map((sym, idx) => {
                  const isSelected = quickAlertForm.symptoms.includes(sym);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleQuickAlertSymptom(sym)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-rose-50 text-rose-700 border-rose-300 font-semibold"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? "\u2713 " : "+ "}{sym}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={quickAlertForm.symptoms}
                onChange={(e) => setQuickAlertForm({ ...quickAlertForm, symptoms: e.target.value })}
                placeholder="High fever, Joint pain, Rash..."
                className="w-full bg-white text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Observations *</label>
              <textarea
                rows="3"
                required
                value={quickAlertForm.description}
                onChange={(e) => setQuickAlertForm({ ...quickAlertForm, description: e.target.value })}
                placeholder="Describe patient age range, onset duration, lab findings..."
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
              <select
                value={quickAlertForm.severity}
                onChange={(e) => setQuickAlertForm({ ...quickAlertForm, severity: e.target.value })}
                className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 outline-none cursor-pointer"
              >
                <option value="low">Low (Mild)</option>
                <option value="moderate">Moderate</option>
                <option value="high">High (Urgent)</option>
                <option value="critical">Critical (Emergency)</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={quickAlertSubmitting}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{quickAlertSubmitting ? "Publishing Alert..." : "Publish Alert to Citizens"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      {selectedReportForLabel && (
        <ReportLabelModal
          report={selectedReportForLabel}
          isOpen={!!selectedReportForLabel}
          onClose={() => setSelectedReportForLabel(null)}
          onLabeled={() => {
            fetchReports();
            fetchAnalytics();
          }}
        />
      )}

      {showAdvisoryModal && (
        <CreateAdvisoryModal
          isOpen={showAdvisoryModal}
          onClose={() => setShowAdvisoryModal(false)}
          onCreated={() => {
            fetchAdvisories();
          }}
        />
      )}

      {showStaffModal && (
        <CreateStaffModal
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          onCreated={() => {
            alert("Health Assistant account created successfully. Welcome email dispatched.");
          }}
        />
      )}

      {/* Doctor Report Creation Modal */}
      {showCreateReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                Submit Doctor Clinical Case Report
              </h3>
              <button
                onClick={() => setShowCreateReportModal(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoctorReport} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="e.g. Inpatient Cluster of Acute Dengue Hemorrhagic Cases"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmed / Suspected Disease *</label>
                  <input
                    type="text"
                    required
                    value={newReport.suspectedDisease}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        suspectedDisease: e.target.value,
                        confirmedDisease: e.target.value,
                      })
                    }
                    placeholder="e.g. Dengue Fever (DENV-2)"
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Count Affected *</label>
                  <input
                    type="number"
                    min={1}
                    value={newReport.patientCount}
                    onChange={(e) => setNewReport({ ...newReport, patientCount: Number(e.target.value) })}
                    className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">State *</label>
                  <input
                    type="text"
                    value={newReport.state}
                    onChange={(e) => setNewReport({ ...newReport, state: e.target.value })}
                    className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">District *</label>
                  <input
                    type="text"
                    value={newReport.district}
                    onChange={(e) => setNewReport({ ...newReport, district: e.target.value })}
                    className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">City / Taluk *</label>
                  <input
                    type="text"
                    value={newReport.city}
                    onChange={(e) => setNewReport({ ...newReport, city: e.target.value })}
                    className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Symptoms (Comma Separated)</label>
                <input
                  type="text"
                  value={newReport.symptoms}
                  onChange={(e) => setNewReport({ ...newReport, symptoms: e.target.value })}
                  placeholder="High Fever, Retro-orbital pain, Petechial rash"
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Observations & Description *</label>
                <textarea
                  rows="3"
                  required
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Detailed findings, lab metrics, and epidemiological observations..."
                  className="w-full bg-white text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReportImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
                >
                  {submittingReport ? "Submitting..." : "Save Clinical Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPortal;
