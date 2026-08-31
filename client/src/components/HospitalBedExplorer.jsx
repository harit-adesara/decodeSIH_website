import React, { useState, useEffect } from "react";
import {
  Building2,
  Bed,
  MapPin,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import LocationFilter from "./LocationFilter";

const WARD_TYPE_OPTIONS = [
  "All",
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

export const HospitalBedExplorer = ({
  initialState = "Maharashtra",
  initialDistrict = "Pune",
  initialCity = "All",
  roleContext = "citizen", // 'citizen' | 'health_assistant' | 'admin'
  title = "Real-Time Hospital Bed & Ward Availability",
  subtitle = "Check live bed capacity, vacant ICU units, and daily per-bed pricing across public & private healthcare facilities.",
}) => {
  const [state, setState] = useState(initialState);
  const [district, setDistrict] = useState(initialDistrict);
  const [city, setCity] = useState(initialCity);
  const [wardTypeFilter, setWardTypeFilter] = useState("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("beds_desc"); // 'beds_desc' | 'price_asc' | 'price_desc'

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [expandedHospitals, setExpandedHospitals] = useState({});

  const fetchBedData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (state && state !== "All") params.append("state", state);
      if (district && district !== "All") params.append("district", district);
      if (city && city !== "All") params.append("city", city);
      if (wardTypeFilter && wardTypeFilter !== "All") params.append("wardType", wardTypeFilter);
      if (onlyAvailable) params.append("onlyAvailable", "true");
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (sortBy) params.append("sort", sortBy);

      const res = await axiosInstance.get(`/public/hospital-beds?${params.toString()}`);
      if (res.data) {
        setSummary(res.data.summary);
        const hospitalList = res.data.hospitals || [];
        setHospitals(hospitalList);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedData();
  }, [state, district, city, wardTypeFilter, onlyAvailable, sortBy]);

  const handleLocationChange = (loc) => {
    setState(loc.state);
    setDistrict(loc.district);
    setCity(loc.city);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBedData();
  };

  const toggleHospitalExpand = (hospitalId) => {
    setExpandedHospitals((prev) => ({
      ...prev,
      [hospitalId]: !prev[hospitalId],
    }));
  };

  const toggleExpandAll = () => {
    const allExpanded = hospitals.every((h) => expandedHospitals[h.hospitalId]);
    const newState = {};
    if (!allExpanded) {
      hospitals.forEach((h) => {
        newState[h.hospitalId] = true;
      });
    }
    setExpandedHospitals(newState);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Location Controls */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>National Bed Surveillance Network</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold font-display text-slate-900">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-0.5">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {hospitals.length > 0 && (
              <button
                onClick={toggleExpandAll}
                className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 border border-teal-200 transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {hospitals.every((h) => expandedHospitals[h.hospitalId])
                    ? "Collapse All"
                    : "Expand All"}
                </span>
              </button>
            )}

            <button
              onClick={fetchBedData}
              disabled={loading}
              className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Geographic State, District, City Selector */}
        <LocationFilter
          selectedState={state}
          selectedDistrict={district}
          selectedCity={city}
          onChange={handleLocationChange}
          allowAllState={true}
        />

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 flex-1">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital name, ward, locality..."
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium pl-8 pr-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex items-center gap-2">
              {/* Ward Type Dropdown */}
              <div className="relative flex-1 sm:flex-initial sm:min-w-[170px]">
                <select
                  value={wardTypeFilter}
                  onChange={(e) => setWardTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs font-medium px-3 py-2.5 sm:py-2 pr-7 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer"
                >
                  {WARD_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "All" ? "All Ward Types" : opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-initial sm:min-w-[150px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs font-medium px-3 py-2.5 sm:py-2 pr-7 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="beds_desc">Most Vacant</option>
                  <option value="price_asc">Price: Low-High</option>
                  <option value="price_desc">Price: High-Low</option>
                </select>
                <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Only Available Toggle */}
          <div className="flex items-center gap-3 pt-1 sm:pt-0">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span>Available Only (Vacant &gt; 0)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5 truncate">
            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">Facilities</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-1">
            {summary?.totalHospitals || hospitals.length}
          </div>
          <div className="text-[9px] sm:text-[10px] text-teal-700 font-medium truncate">In selected region</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5 truncate">
            <Bed className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Total Capacity</span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            {summary?.totalHospitals || hospitals.length}
          </div>
          <div className="text-[10px] text-teal-700 font-medium">In selected region</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <Bed className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Bed Capacity</span>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1">
            {summary?.totalBeds || 0}
          </div>
          <div className="text-[10px] text-slate-500">Across {summary?.totalWards || 0} active wards</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Vacant / Free Beds</span>
          </div>
          <div className="text-2xl font-bold font-display text-emerald-700 mt-1">
            {summary?.totalVacantBeds || 0}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">Immediate admission</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Vacant ICU Units</span>
          </div>
          <div className="text-2xl font-bold font-display text-rose-600 mt-1">
            {summary?.icuVacantBeds || 0}
          </div>
          <div className="text-[10px] text-rose-700 font-medium">Critical care vacancy</div>
        </div>
      </div>

      {/* Main Results Display - Facility Based */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          <div className="font-bold text-slate-800 text-sm">Querying Real-Time Hospital Bed Database...</div>
          <div className="text-xs text-slate-500">Fetching live ward allocations and pricing for {district}, {state}</div>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-bold text-slate-800 text-base">No Hospital Facilities Found for Current Criteria</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your State/District/City filters or changing the ward type selection.
          </p>
        </div>
      ) : (
        /* BY HOSPITAL FACILITY LIST WITH ACCORDION/EXPANDABLE WARDS */
        <div className="space-y-4">
          {hospitals.map((hosp, idx) => {
            const isExpanded = Boolean(expandedHospitals[hosp.hospitalId]);
            const totalWardsCount = hosp.wards?.length || 0;

            return (
              <div
                key={hosp.hospitalId || idx}
                className="rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-teal-300 transition-all overflow-hidden"
              >
                {/* Hospital Header - Clickable Card Header */}
                <div
                  onClick={() => toggleHospitalExpand(hosp.hospitalId)}
                  className="p-5 sm:p-6 cursor-pointer select-none flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100 shrink-0 mt-0.5">
                      <Building2 className="w-6 h-6" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg hover:text-teal-700 transition-colors flex items-center gap-2">
                        {hosp.hospitalName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          {hosp.city !== "All" ? `${hosp.city}, ` : ""}{hosp.district}, {hosp.state}
                        </span>
                        {hosp.address && (
                          <span className="text-slate-400 hidden sm:inline">• {hosp.address}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Badges & Expand Trigger */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {totalWardsCount} Ward{totalWardsCount !== 1 ? "s" : ""}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                          hosp.vacantBeds > 0
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {hosp.vacantBeds > 0
                          ? `${hosp.vacantBeds} Beds Vacant`
                          : "No Vacant Beds"}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label="Toggle Ward Details"
                      className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                        isExpanded
                          ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      <span className="hidden sm:inline">
                        {isExpanded ? "Hide Details" : "View Wards & Beds"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Wards & Bed Details Section */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 bg-slate-50/60 border-t border-slate-100 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-teal-600" />
                        Ward Allocations & Bed Status ({hosp.wards.length})
                      </h4>
                      {hosp.phone && (
                        <span className="text-xs text-slate-500 font-medium">
                          Official Contact: <span className="font-bold text-slate-700">{hosp.phone}</span>
                        </span>
                      )}
                    </div>

                    {hosp.wards && hosp.wards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {hosp.wards.map((w) => {
                          const isAvailable = w.vacantBeds > 0;
                          const isIcu =
                            w.wardType.includes("ICU") ||
                            w.wardType.includes("ICCU") ||
                            w.wardType.includes("HDU") ||
                            w.wardType.includes("Emergency");

                          return (
                            <div
                              key={w._id}
                              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between bg-white ${
                                isAvailable
                                  ? "border-slate-200 hover:border-teal-300 shadow-xs"
                                  : "border-rose-200/70 bg-rose-50/20"
                              }`}
                            >
                              <div>
                                {/* Ward Header */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                      isIcu
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-teal-100 text-teal-800"
                                    }`}
                                  >
                                    {w.displayName}
                                  </span>

                                  <span className="text-xs font-bold text-slate-900 font-display">
                                    ₹{w.pricePerDay.toLocaleString()}
                                    <span className="text-[10px] font-normal text-slate-500">/day</span>
                                  </span>
                                </div>

                                {/* Bed Numbers Progress */}
                                <div className="space-y-1.5 mt-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 font-semibold text-[11px]">
                                      Bed Availability:
                                    </span>
                                    <span
                                      className={`font-bold text-[11px] ${
                                        isAvailable ? "text-emerald-700" : "text-rose-600"
                                      }`}
                                    >
                                      {w.vacantBeds} of {w.totalBeds} beds vacant
                                    </span>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                                    <div
                                      className={`h-full transition-all ${
                                        w.occupancyRate > 90
                                          ? "bg-rose-500"
                                          : w.occupancyRate > 60
                                          ? "bg-amber-500"
                                          : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${w.occupancyRate}%` }}
                                    />
                                  </div>
                                  <div className="text-[10px] text-slate-400 text-right">
                                    {w.occupancyRate}% Occupied
                                  </div>
                                </div>

                                {/* Amenities Tags */}
                                {w.amenities && w.amenities.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2.5">
                                    {w.amenities.map((am, aIdx) => (
                                      <span
                                        key={aIdx}
                                        className="text-[9px] font-semibold bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                                      >
                                        {am}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {w.notes && (
                                  <p className="text-[10px] text-slate-500 mt-2 italic leading-relaxed">
                                    &quot;{w.notes}&quot;
                                  </p>
                                )}
                              </div>

                              {/* Footer Details */}
                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                <span>
                                  Updated: {new Date(w.updatedAt).toLocaleDateString()}
                                </span>
                                <span
                                  className={`font-bold px-1.5 py-0.5 rounded ${
                                    isAvailable
                                      ? "text-emerald-700 bg-emerald-50"
                                      : "text-rose-700 bg-rose-50"
                                  }`}
                                >
                                  {isAvailable ? "Ready for Intake" : "Ward Full"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                        No active wards registered under this facility matching current filters.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HospitalBedExplorer;
