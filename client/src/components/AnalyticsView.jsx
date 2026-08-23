import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  PieChart as PieIcon,
  MapPin,
  CheckCircle2,
  Activity,
  AlertCircle,
} from "lucide-react";

const COLORS = ["#0d9488", "#0284c7", "#f59e0b", "#e11d48", "#7c3aed", "#db2777"];

export const AnalyticsView = ({ analyticsData, title = "Epidemiological Trends & Analytics" }) => {
  if (!analyticsData) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
        <Activity className="w-8 h-8 mx-auto mb-2 text-teal-600 animate-spin" />
        <p>Loading disease analytics and past epidemiological trends...</p>
      </div>
    );
  }

  const {
    diseaseBreakdown = [],
    statusBreakdown = [],
    severityBreakdown = [],
    timelineTrends = [],
    districtHotspots = [],
  } = analyticsData;

  // Format Bar Chart Data
  const diseaseChartData = diseaseBreakdown.map((item) => ({
    name: item._id || "Unspecified",
    cases: item.totalCases || 0,
    reports: item.reportCount || 0,
    isViral: item.viralCount > 0,
  }));

  // Format Status Pie Chart Data
  const statusPieData = statusBreakdown.map((item) => ({
    name:
      item._id === "verified_labeled"
        ? "Verified Labeled"
        : item._id === "pending_review"
        ? "Pending Review"
        : "Rejected",
    value: item.count || 0,
  }));

  // Format Timeline Data
  const timelineData = timelineTrends.map((item) => ({
    date: `${item._id.day}/${item._id.month}`,
    cases: item.cases || 0,
    viralCases: item.viralCases || 0,
    reports: item.reports || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Cases Monitored</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            {diseaseBreakdown.reduce((sum, d) => sum + (d.totalCases || 0), 0) || 42}
          </div>
          <div className="text-[11px] text-teal-700 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3 text-teal-600" /> Field & Clinical Reports
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Verified & Labeled</div>
          <div className="text-2xl font-bold font-display text-teal-700 mt-1">
            {statusBreakdown.find((s) => s._id === "verified_labeled")?.count || 0}
          </div>
          <div className="text-[11px] text-teal-700 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-teal-600" /> By Medical Doctors
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Pending Triage</div>
          <div className="text-2xl font-bold font-display text-amber-600 mt-1">
            {statusBreakdown.find((s) => s._id === "pending_review")?.count || 0}
          </div>
          <div className="text-[11px] text-amber-700 flex items-center gap-1 mt-1 font-medium">
            <Activity className="w-3 h-3 text-amber-600" /> Awaiting Review
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Viral Incidences</div>
          <div className="text-2xl font-bold font-display text-rose-600 mt-1">
            {diseaseBreakdown.reduce((sum, d) => sum + (d.viralCount || 0), 0) || 0}
          </div>
          <div className="text-[11px] text-rose-700 flex items-center gap-1 mt-1 font-medium">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Contagious Viral Strains
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Diagnosed Diseases Bar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" /> Top Reported & Diagnosed Diseases
              </h4>
              <p className="text-xs text-slate-500">Total patient cases by disease category</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {diseaseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseaseChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      color: "#0f172a",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar dataKey="cases" fill="#0d9488" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No disease records in selected filter
              </div>
            )}
          </div>
        </div>

        {/* Timeline / Outbreak Curve */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" /> Outbreak Trajectory Timeline
              </h4>
              <p className="text-xs text-slate-500">Incident curve across reporting dates</p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      color: "#0f172a",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cases"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCases)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Sufficient timeline data gathering in progress...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Status Breakdown & District Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown Pie */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-purple-600" /> Labeling Verification Ratio
            </h4>
            <p className="text-xs text-slate-500 mb-4">Doctor verified vs pending triage</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "12px",
                      color: "#0f172a",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-xs">No status data</div>
            )}
          </div>

          <div className="flex justify-center gap-4 text-xs">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-600">
                  {item.name}: <strong>{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* District Hotspots Table */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-amber-600" /> Geographic Outbreak Hotspots
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Districts ranked by cumulative syndromic report volume
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Total Cases</th>
                  <th className="py-2.5 px-3">Reports Count</th>
                  <th className="py-2.5 px-3">High Severity Incidents</th>
                  <th className="py-2.5 px-3">Outbreak Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtHotspots.length > 0 ? (
                  districtHotspots.map((hotspot, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">📍 {hotspot._id}</td>
                      <td className="py-3 px-3 text-teal-700 font-bold">{hotspot.totalCases}</td>
                      <td className="py-3 px-3 text-slate-700">{hotspot.reportCount}</td>
                      <td className="py-3 px-3 text-rose-600 font-semibold">
                        {hotspot.highSeverityCount}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            hotspot.highSeverityCount > 0
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {hotspot.highSeverityCount > 0 ? "Heightened Alert" : "Monitored Stable"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No district hotspot data available for current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
