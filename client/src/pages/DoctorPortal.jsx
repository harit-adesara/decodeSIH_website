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
  Calendar,
  FileText,
  Bug,
  Sparkles,
  RefreshCw,
  Eye,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import LocationFilter from "../components/LocationFilter";
import ReportLabelModal from "../components/ReportLabelModal";
import CreateAdvisoryModal from "../components/CreateAdvisoryModal";
import CreateStaffModal from "../components/CreateStaffModal";
import AnalyticsView from "../components/AnalyticsView";
import { useAuth } from "../context/AuthContext";

export const DoctorPortal = () => {
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

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" /> Medical Officer Diagnostic Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {user?.name || "Dr. Rajesh Sharma, MD"}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            {user?.hospitalOrClinic || "Sassoon General Hospital & Medical College"} •{" "}
            <span className="text-blue-300 font-semibold">{user?.qualification || "MD Internal Medicine"}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowCreateReportModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Add Clinical Report
          </button>
          <button
            onClick={() => setShowAdvisoryModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all active:scale-95"
          >
            <Megaphone className="w-4 h-4" /> Broadcast Advisory
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Create Health Assistant
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("review")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "review"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <ListFilter className="w-4 h-4" />
          Field Reports & Diagnostic Review
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "analytics"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Epidemiological Trends & Analytics
        </button>

        <button
          onClick={() => setActiveTab("advisories")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "advisories"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Regional Bulletins & Advisories ({advisories.length})
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
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold pl-1">Status Filter:</span>
              <button
                onClick={() => setStatusFilter("pending_review")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "pending_review"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setStatusFilter("verified_labeled")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "verified_labeled"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Verified & Labeled
              </button>
              <button
                onClick={() => setStatusFilter("All")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "All"
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    : "bg-slate-800 text-slate-400 hover:text-white"
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
                  className="bg-slate-800 text-white text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none w-48 sm:w-60"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                onClick={fetchReports}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reports Grid / Cards */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm glass-panel rounded-3xl">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-blue-400 animate-spin" />
              Loading surveillance reports...
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-3xl glass-panel border border-slate-800 bg-slate-900/80 glass-card-hover space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            report.status === "verified_labeled"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {report.status === "verified_labeled" ? "Verified Diagnosis" : "Pending Doctor Review"}
                        </span>
                        {report.isViral && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                            <Bug className="w-3 h-3" /> Viral Strain
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          📍 {report.city}, {report.district}, {report.state}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">{report.title}</h3>
                    </div>

                    <button
                      onClick={() => setSelectedReportForLabel(report)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      {report.status === "verified_labeled" ? "Update Diagnosis" : "Diagnose & Label"}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    {report.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                      👥 {report.patientCount || 1} Patients Affected
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                      Suspected: <strong className="text-amber-300">{report.suspectedDisease}</strong>
                    </span>
                    {report.confirmedDisease && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-medium">
                        Confirmed: <strong>{report.confirmedDisease}</strong>
                      </span>
                    )}
                    {report.symptoms?.map((sym, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700"
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
                        className="h-32 rounded-xl border border-slate-700 object-cover"
                      />
                    </div>
                  )}

                  {/* Doctor remarks banner if already labeled */}
                  {report.doctorDiagnosis && (
                    <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2">
                      <Stethoscope className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Doctor Clinical Findings: </strong>
                        {report.doctorDiagnosis}. {report.doctorRemarks}
                        {report.prescribedAction && (
                          <div className="text-slate-300 mt-1">
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
            <div className="p-12 text-center text-slate-400 text-sm glass-panel rounded-3xl">
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
            <h3 className="font-bold text-white text-lg">Broadcasted Medical Advisories & Directives</h3>
            <button
              onClick={() => setShowAdvisoryModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" /> Create New Advisory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisories.map((advisory) => (
              <div
                key={advisory._id}
                className="p-5 rounded-3xl glass-panel border border-amber-500/20 bg-slate-900/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    {advisory.priority} Priority
                  </span>
                  <span className="text-xs text-slate-400">
                    Target: {advisory.targetDistrict}, {advisory.targetState}
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">{advisory.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  {advisory.message}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Issued by: {advisory.doctor?.name || "Medical Officer"}</span>
                  <span>{new Date(advisory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
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
            alert("Health Assistant account created successfully.");
          }}
        />
      )}

      {/* Doctor Report Creation Modal */}
      {showCreateReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-blue-500/30 shadow-2xl overflow-hidden bg-slate-900/95">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-900 border-b border-blue-500/20 flex items-center justify-between">
              <h3 className="font-display font-bold text-white text-base sm:text-lg">
                Submit Doctor Clinical Case Report
              </h3>
              <button
                onClick={() => setShowCreateReportModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDoctorReport} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  placeholder="e.g. Inpatient Cluster of Acute Dengue Hemorrhagic Cases"
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmed / Suspected Disease *</label>
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
                    className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Count Affected *</label>
                  <input
                    type="number"
                    min={1}
                    value={newReport.patientCount}
                    onChange={(e) => setNewReport({ ...newReport, patientCount: Number(e.target.value) })}
                    className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">State *</label>
                  <input
                    type="text"
                    value={newReport.state}
                    onChange={(e) => setNewReport({ ...newReport, state: e.target.value })}
                    className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">District *</label>
                  <input
                    type="text"
                    value={newReport.district}
                    onChange={(e) => setNewReport({ ...newReport, district: e.target.value })}
                    className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">City / Taluk *</label>
                  <input
                    type="text"
                    value={newReport.city}
                    onChange={(e) => setNewReport({ ...newReport, city: e.target.value })}
                    className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Symptoms (Comma Separated)</label>
                <input
                  type="text"
                  value={newReport.symptoms}
                  onChange={(e) => setNewReport({ ...newReport, symptoms: e.target.value })}
                  placeholder="High Fever, Retro-orbital pain, Petechial rash"
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Observations & Description *</label>
                <textarea
                  rows="3"
                  required
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Detailed findings, lab metrics, and epidemiological observations..."
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReportImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
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
