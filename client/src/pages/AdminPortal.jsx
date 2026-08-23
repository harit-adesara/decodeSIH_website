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

export const AdminPortal = () => {
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
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/30 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> National Health Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            System Administration & Staff Management
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Ministry of Health & Family Welfare • National Disease Surveillance System
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Provision Medical Staff
          </button>

          <button
            onClick={handleTriggerProactiveEngine}
            disabled={triggeringAi}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{triggeringAi ? "Running AI Engine..." : "Run AI Outbreak Analysis"}</span>
          </button>
        </div>
      </div>

      {aiMessage && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 flex items-center justify-between">
          <span>{aiMessage}</span>
          <button onClick={() => setAiMessage("")} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-blue-500/20 bg-slate-900/80">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-400" /> Registered Doctors
          </div>
          <div className="text-2xl font-bold font-display text-white mt-1">
            {stats?.users?.doctors || 0}
          </div>
          <div className="text-[11px] text-blue-400">Clinical diagnosticians</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-teal-500/20 bg-slate-900/80">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-teal-400" /> Health Assistants
          </div>
          <div className="text-2xl font-bold font-display text-white mt-1">
            {stats?.users?.healthAssistants || 0}
          </div>
          <div className="text-[11px] text-teal-400">Field ASHA workers</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-slate-900/80">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified Reports
          </div>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
            {stats?.reports?.labeled || 0}
          </div>
          <div className="text-[11px] text-slate-400">Of {stats?.reports?.total || 0} total cases</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 bg-slate-900/80">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Proactive AI Alerts
          </div>
          <div className="text-2xl font-bold font-display text-amber-400 mt-1">
            {stats?.system?.activeAlerts || 0}
          </div>
          <div className="text-[11px] text-amber-400">Daily forecast sync</div>
        </div>
      </div>

      {/* Staff Management Table */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> User Directory & RBAC Roles
            </h3>
            <p className="text-xs text-slate-400">
              Manage Doctor, Health Assistant, and Citizen accounts in the database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Filter:</span>
            {["All", "doctor", "health_assistant", "user"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  roleFilter === r
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {r.replace("_", " ")}
              </button>
            ))}
            <button
              onClick={fetchAdminData}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Name & Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Jurisdiction</th>
                <th className="py-3 px-3">Facility / Qualification</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        u.role === "admin"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          : u.role === "doctor"
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                          : u.role === "health_assistant"
                          ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    📍 {u.city !== "All" ? `${u.city}, ` : ""}{u.district}, {u.state}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    <div>{u.hospitalOrClinic || "National Public Health"}</div>
                    <div className="text-[11px] text-slate-500">{u.qualification}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-red-500/20 text-red-300 border-red-500/30"
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
                            ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
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
