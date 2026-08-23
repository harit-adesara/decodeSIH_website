import React, { useState, useEffect } from "react";
import {
  Shield,
  UserPlus,
  Users,
  Activity,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  HeartHandshake,
  UserCheck,
  UserX,
  Play,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import CreateStaffModal from "../components/CreateStaffModal";

export const AdminPortal = ({ onOpenProfile }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("All");
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [triggeringAi, setTriggeringAi] = useState(false);
  const [aiMessage, setAiMessage] = useState("");


  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        axiosInstance.get("/admin/stats"),
        axiosInstance.get(`/admin/users${roleFilter !== "All" ? `?role=${roleFilter}` : ""}`),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data?.users || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  const handleToggleUser = async (userId) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/toggle-status`);
      fetchAdminData();
    } catch (err) {
      alert(err.message || "Failed to toggle status.");
    }
  };

  const handleTriggerProactiveEngine = async () => {
    setTriggeringAi(true);
    setAiMessage("");
    try {
      const res = await axiosInstance.post("/admin/trigger-proactive-analysis");
      setAiMessage(`✅ AI Outbreak Analysis complete! Updated ${res.data?.count || 4} regional outbreak alerts.`);
      fetchAdminData();
    } catch (err) {
      setAiMessage(`❌ Engine error: ${err.message}`);
    } finally {
      setTriggeringAi(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-purple-600" /> National Health Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            System Administration & Staff Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Ministry of Health & Family Welfare • National Disease Surveillance System
          </p>
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
            onClick={() => setShowStaffModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Provision Medical Staff
          </button>


          <button
            onClick={handleTriggerProactiveEngine}
            disabled={triggeringAi}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{triggeringAi ? "Running AI Engine..." : "Run AI Outbreak Analysis"}</span>
          </button>
        </div>
      </div>

      {aiMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs sm:text-sm text-teal-900 flex items-center justify-between">
          <span>{aiMessage}</span>
          <button onClick={() => setAiMessage("")} className="text-slate-400 hover:text-slate-800">✕</button>
        </div>
      )}

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Registered Doctors
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            {stats?.users?.doctors || 0}
          </div>
          <div className="text-[11px] text-blue-700 font-medium">Clinical diagnosticians</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-600" /> Health Assistants
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            {stats?.users?.healthAssistants || 0}
          </div>
          <div className="text-[11px] text-teal-700 font-medium">Field ASHA workers</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Reports
          </div>
          <div className="text-2xl font-bold font-display text-emerald-700 mt-1">
            {stats?.reports?.labeled || 0}
          </div>
          <div className="text-[11px] text-slate-500">Of {stats?.reports?.total || 0} total cases</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Proactive AI Alerts
          </div>
          <div className="text-2xl font-bold font-display text-amber-600 mt-1">
            {stats?.system?.activeAlerts || 0}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">Daily forecast sync</div>
        </div>
      </div>

      {/* Staff Management Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" /> User Directory & RBAC Roles
            </h3>
            <p className="text-xs text-slate-500">
              Manage Doctor, Health Assistant, and Citizen accounts in the database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Filter:</span>
            {["All", "doctor", "health_assistant", "user"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  roleFilter === r
                    ? "bg-purple-50 text-purple-700 border border-purple-300 font-bold"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={fetchAdminData}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Name & Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Jurisdiction</th>
                <th className="py-3 px-3">Facility / Qualification</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        u.role === "admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : u.role === "doctor"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : u.role === "health_assistant"
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    📍 {u.city !== "All" ? `${u.city}, ` : ""}{u.district}, {u.state}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>{u.hospitalOrClinic || "National Public Health"}</div>
                    <div className="text-[11px] text-slate-400">{u.qualification}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          u.isActive
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showStaffModal && (
        <CreateStaffModal
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          onCreated={() => fetchAdminData()}
        />
      )}
    </div>
  );
};

export default AdminPortal;
