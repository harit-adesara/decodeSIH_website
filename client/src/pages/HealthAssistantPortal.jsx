import React, { useState, useEffect } from "react";
import {
  HeartHandshake,
  PlusCircle,
  FileText,
  Megaphone,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Image as ImageIcon,
  MapPin,
  Stethoscope,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  Activity,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import AnalyticsView from "../components/AnalyticsView";
import { useAuth } from "../context/AuthContext";

export const HealthAssistantPortal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("submit"); // 'submit', 'my-reports', 'advisories', 'analytics'
  const [myReports, setMyReports] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Field Report Form State
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    suspectedDisease: "",
    symptoms: "",
    severity: "moderate",
    isViral: false,
    patientCount: 1,
    state: user?.state || "Maharashtra",
    district: user?.district || "Pune",
    city: user?.city || "Hadapsar",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const symptomPresets = [
    "High Fever (>102°F)",
    "Severe Joint / Bone Pain",
    "Watery Loose Stools",
    "Repeated Vomiting",
    "Dry Barking Cough",
    "Petechial Skin Rash",
    "Sore Throat",
    "Severe Headache",
  ];

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/health-assistant/my-reports");
      setMyReports(res.data?.reports || []);
    } catch (err) {
      console.error("Failed to load my reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisories = async () => {
    try {
      const res = await axiosInstance.get("/health-assistant/advisories");
      setAdvisories(res.data?.advisories || []);
    } catch (err) {
      console.error("Failed to load advisories:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axiosInstance.get("/health-assistant/analytics");
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "my-reports") fetchMyReports();
    else if (activeTab === "advisories") fetchAdvisories();
    else if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const toggleSymptom = (sym) => {
    const currentList = reportForm.symptoms
      ? reportForm.symptoms.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    let updatedList;
    if (currentList.includes(sym)) {
      updatedList = currentList.filter((s) => s !== sym);
    } else {
      updatedList = [...currentList, sym];
    }
    setReportForm({ ...reportForm, symptoms: updatedList.join(", ") });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const formData = new FormData();
      Object.keys(reportForm).forEach((key) => {
        formData.append(key, reportForm[key]);
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axiosInstance.post("/health-assistant/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitSuccess(true);
      setReportForm({
        title: "",
        description: "",
        suspectedDisease: "",
        symptoms: "",
        severity: "moderate",
        isViral: false,
        patientCount: 1,
        state: user?.state || "Maharashtra",
        district: user?.district || "Pune",
        city: user?.city || "Hadapsar",
      });
      setImageFile(null);
      setImagePreview(null);

      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab("my-reports");
      }, 1500);
    } catch (err) {
      alert(err.message || "Failed to submit field report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-teal-500/30 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" /> Grassroots Field Health Worker Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {user?.name || "Anita Deshmukh (ASHA / Field Lead)"}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            {user?.hospitalOrClinic || "Hadapsar Primary Health Centre (PHC)"} •{" "}
            <span className="text-teal-300 font-semibold">
              📍 {user?.city}, {user?.district}, {user?.state}
            </span>
          </p>
        </div>

        {/* Quick Tab Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("submit")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Submit Field Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("submit")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "submit"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          New Disease Field Report
        </button>

        <button
          onClick={() => setActiveTab("my-reports")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "my-reports"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <FileText className="w-4 h-4" />
          My Submissions & Doctor Diagnoses ({myReports.length})
        </button>

        <button
          onClick={() => setActiveTab("advisories")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "advisories"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Doctor Advisories & Directives ({advisories.length})
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "analytics"
              ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Grassroots Analytics
        </button>
      </div>

      {/* Tab 1: Submit Field Report Form */}
      {activeTab === "submit" && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel border border-teal-500/30 bg-slate-900/90 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-teal-400" />
              Grassroots Disease / Symptom Field Report
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Submit observations from door-to-door visits, PHCs, or village clusters for Doctor diagnosis.
            </p>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs sm:text-sm text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Report registered successfully! Forwarded to Medical Officer workstation for clinical review.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Report Title / Case Summary *
              </label>
              <input
                type="text"
                required
                value={reportForm.title}
                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                placeholder="e.g. Cluster of High Fever and Joint Pain in Ward 14"
                className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Suspected Disease & Patient Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Suspected Disease *
                </label>
                <input
                  type="text"
                  required
                  value={reportForm.suspectedDisease}
                  onChange={(e) => setReportForm({ ...reportForm, suspectedDisease: e.target.value })}
                  placeholder="e.g. Dengue Fever, Viral Flu, Gastroenteritis"
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Number of Patients Affected *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={reportForm.patientCount}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, patientCount: Number(e.target.value) })
                  }
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            {/* Location Hierarchy: State -> District -> City */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-teal-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Geographic Location (State &gt; District &gt; City)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={reportForm.state}
                    onChange={(e) => setReportForm({ ...reportForm, state: e.target.value })}
                    className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={reportForm.district}
                    onChange={(e) => setReportForm({ ...reportForm, district: e.target.value })}
                    className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">City / Taluk / Village *</label>
                  <input
                    type="text"
                    required
                    value={reportForm.city}
                    onChange={(e) => setReportForm({ ...reportForm, city: e.target.value })}
                    className="w-full bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Symptom Preset Tagger */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Observed Symptoms (Click to tag or type below)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {symptomPresets.map((sym, idx) => {
                  const isSelected = reportForm.symptoms.includes(sym);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-teal-500/20 text-teal-300 border-teal-500/50"
                          : "bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "} {sym}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={reportForm.symptoms}
                onChange={(e) => setReportForm({ ...reportForm, symptoms: e.target.value })}
                placeholder="High fever, Retro-orbital pain, Muscle aches..."
                className="w-full bg-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Clinical Observations / Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Field Observations & Environmental Factors *
              </label>
              <textarea
                rows="3"
                required
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                placeholder="Describe patient age range, onset duration, local water storage conditions, recent rain stagnation, or family history..."
                className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 outline-none resize-none"
              />
            </div>

            {/* Image Upload (Optional) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                Upload Clinical Photo / Water Sample / Test Strip (Optional)
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 cursor-pointer"
                />

                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-xl object-cover border border-teal-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Severity and Viral Check */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Field Severity Assessment
                </label>
                <select
                  value={reportForm.severity}
                  onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                  className="w-full bg-slate-800 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:border-teal-500 outline-none cursor-pointer"
                >
                  <option value="low">Low (Mild symptoms)</option>
                  <option value="moderate">Moderate (Standard follow-up)</option>
                  <option value="high">High (Immediate doctor consultation needed)</option>
                  <option value="critical">Critical (Emergency hospitalization risk)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reportForm.isViral}
                    onChange={(e) => setReportForm({ ...reportForm, isViral: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded bg-slate-800 border-slate-700 focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-300 font-medium">
                    Suspected Contagious / Viral
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-teal-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? "Submitting Report..." : "Submit to Doctor Station"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: My Submitted Reports */}
      {activeTab === "my-reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">My Submitted Field Reports</h3>
            <button
              onClick={fetchMyReports}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl">
              Loading your submitted field reports...
            </div>
          ) : myReports.length > 0 ? (
            <div className="space-y-4">
              {myReports.map((report) => (
                <div
                  key={report._id}
                  className="p-5 rounded-3xl glass-panel border border-slate-800 bg-slate-900/80 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            report.status === "verified_labeled"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {report.status === "verified_labeled"
                            ? "✓ Doctor Diagnosed & Verified"
                            : "⏳ Pending Doctor Review"}
                        </span>
                        <span className="text-xs text-slate-400">
                          📍 {report.city}, {report.district}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-white">{report.title}</h4>
                    </div>

                    <div className="text-xs text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    {report.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                      👥 {report.patientCount} Patients
                    </span>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                      Suspected: {report.suspectedDisease}
                    </span>
                    {report.confirmedDisease && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                        Confirmed: {report.confirmedDisease}
                      </span>
                    )}
                  </div>

                  {/* Doctor feedback box if labeled */}
                  {report.doctorDiagnosis && (
                    <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 space-y-1">
                      <div className="font-bold text-blue-300 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5" /> Doctor Review & Diagnosis:
                      </div>
                      <p>{report.doctorDiagnosis}</p>
                      {report.doctorRemarks && (
                        <p className="text-slate-300">
                          <strong>Remarks: </strong> {report.doctorRemarks}
                        </p>
                      )}
                      {report.prescribedAction && (
                        <p className="text-emerald-300">
                          <strong>Directives for Field Worker: </strong> {report.prescribedAction}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 glass-panel rounded-3xl">
              No reports submitted yet. Click &quot;New Disease Field Report&quot; to register your first observation.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Doctor Advisories */}
      {activeTab === "advisories" && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg">
            Doctor Health Advisories & Directives for {user?.district}, {user?.state}
          </h3>

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
                  <span>From: {advisory.doctor?.name || "District Medical Officer"}</span>
                  <span>{new Date(advisory.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Grassroots Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <AnalyticsView
            analyticsData={analyticsData}
            title="Health Assistant Field Analytics"
          />
        </div>
      )}
    </div>
  );
};
export default HealthAssistantPortal;
