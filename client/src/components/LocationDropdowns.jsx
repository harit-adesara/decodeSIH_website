import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import {
  indiaLocations,
  getStatesList,
  getDistrictsList,
  getCitiesList,
} from "../data/indiaLocations";

export const LocationDropdowns = ({
  state = "Maharashtra",
  district = "Pune",
  city = "Shivajinagar",
  onChange,
  allowAllState = false,
  allowAllDistrict = false,
  allowAllCity = false,
  showCity = true,
  required = true,
  disabled = false,
  theme = "teal", // 'teal' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate'
  layout = "grid", // 'grid' | 'horizontal' | 'vertical'
  size = "sm", // 'sm' | 'md'
  stateLabel = "State",
  districtLabel = "District",
  cityLabel = "City / Taluk / Locality",
  showLabels = true,
  className = "",
}) => {
  const [locationsData, setLocationsData] = useState(indiaLocations);

  // Fetch live locations dataset from backend on mount (falls back gracefully to bundled dataset)
  useEffect(() => {
    axiosInstance
      .get("/public/locations")
      .then((res) => {
        if (res.data?.locations && Object.keys(res.data.locations).length > 0) {
          setLocationsData(res.data.locations);
        }
      })
      .catch(() => {
        // Fallback already initialized with bundled dataset
      });
  }, []);

  // Compute available lists
  const availableStates = useMemo(() => {
    const states = Object.keys(locationsData);
    return allowAllState ? ["All", ...states] : states;
  }, [locationsData, allowAllState]);

  const availableDistricts = useMemo(() => {
    if (!state || state === "All" || !locationsData[state]) {
      return allowAllDistrict ? ["All"] : [];
    }
    const dList = locationsData[state]?.districts || [];
    return allowAllDistrict ? ["All", ...dList] : dList;
  }, [locationsData, state, allowAllDistrict]);

  const availableCities = useMemo(() => {
    if (!state || state === "All" || !district) {
      return allowAllCity ? ["All"] : [];
    }
    if (district === "All") {
      return allowAllCity ? ["All"] : [];
    }

    const confCities = (locationsData[state]?.cities?.[district] || []).filter(
      (c) => c !== "All"
    );

    let cities;
    if (confCities.length > 0) {
      cities = confCities;
    } else {
      cities = [
        `${district} Main`,
        `${district} North`,
        `${district} South`,
        `${district} East`,
        `${district} West`,
        `${district} Rural`,
      ];
    }

    return allowAllCity ? ["All", ...cities] : cities;
  }, [locationsData, state, district, allowAllCity]);

  // Color themes for inputs
  const themeStyles = {
    teal: "focus:border-teal-500 focus:ring-teal-500/20",
    amber: "focus:border-amber-500 focus:ring-amber-500/20",
    rose: "focus:border-rose-500 focus:ring-rose-500/20",
    blue: "focus:border-blue-500 focus:ring-blue-500/20",
    purple: "focus:border-purple-500 focus:ring-purple-500/20",
    slate: "focus:border-slate-500 focus:ring-slate-500/20",
  };

  const activeThemeClass = themeStyles[theme] || themeStyles.teal;

  const sizeClasses = {
    sm: "text-xs py-2 px-3 pr-8 rounded-xl",
    md: "text-xs sm:text-sm py-2.5 px-3.5 pr-8 rounded-xl",
  };

  const activeSizeClass = sizeClasses[size] || sizeClasses.sm;

  const handleStateChange = (e) => {
    const newState = e.target.value;

    let newDistrict = "All";
    let newCity = "All";

    if (newState !== "All" && locationsData[newState]) {
      const dList = locationsData[newState]?.districts || [];
      newDistrict = allowAllDistrict ? "All" : dList[0] || "";

      if (newDistrict && newDistrict !== "All") {
        const cList = (locationsData[newState]?.cities?.[newDistrict] || []).filter(
          (c) => c !== "All"
        );
        newCity = allowAllCity
          ? "All"
          : cList[0] || `${newDistrict} Main`;
      }
    }

    if (onChange) {
      onChange({ state: newState, district: newDistrict, city: newCity });
    }
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    let newCity = "All";

    if (newDistrict !== "All" && state !== "All" && locationsData[state]) {
      const cList = (locationsData[state]?.cities?.[newDistrict] || []).filter(
        (c) => c !== "All"
      );
      newCity = allowAllCity ? "All" : cList[0] || `${newDistrict} Main`;
    }

    if (onChange) {
      onChange({ state, district: newDistrict, city: newCity });
    }
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    if (onChange) {
      onChange({ state, district, city: newCity });
    }
  };

  const layoutClasses = {
    grid: showCity ? "grid grid-cols-1 sm:grid-cols-3 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3",
    horizontal: "flex flex-wrap items-center gap-3",
    vertical: "space-y-3",
  };

  return (
    <div className={`${layoutClasses[layout] || layoutClasses.grid} ${className}`}>
      {/* STATE DROPDOWN */}
      <div className={layout === "horizontal" ? "flex-1 min-w-[140px]" : "w-full"}>
        {showLabels && (
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {stateLabel} {required && !allowAllState && "*"}
          </label>
        )}
        <div className="relative">
          <select
            value={state || ""}
            onChange={handleStateChange}
            disabled={disabled}
            required={required && !allowAllState}
            className={`w-full bg-white text-slate-800 font-medium border border-slate-300 ${activeThemeClass} focus:ring-2 outline-none transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${activeSizeClass}`}
          >
            {!state && <option value="">Select State</option>}
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* DISTRICT DROPDOWN */}
      <div className={layout === "horizontal" ? "flex-1 min-w-[140px]" : "w-full"}>
        {showLabels && (
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            {districtLabel} {required && !allowAllDistrict && "*"}
          </label>
        )}
        <div className="relative">
          <select
            value={district || ""}
            onChange={handleDistrictChange}
            disabled={disabled || !state || (state === "All" && !allowAllDistrict)}
            required={required && !allowAllDistrict}
            className={`w-full bg-white text-slate-800 font-medium border border-slate-300 ${activeThemeClass} focus:ring-2 outline-none transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${activeSizeClass}`}
          >
            {allowAllDistrict && <option value="All">All Districts</option>}
            {!allowAllDistrict && (!district || availableDistricts.length === 0) && (
              <option value="">Select District</option>
            )}
            {availableDistricts
              .filter((d) => (allowAllDistrict ? true : d !== "All"))
              .map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* CITY / TALUK / LOCALITY DROPDOWN */}
      {showCity && (
        <div className={layout === "horizontal" ? "flex-1 min-w-[140px]" : "w-full"}>
          {showLabels && (
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {cityLabel} {required && !allowAllCity && "*"}
            </label>
          )}
          <div className="relative">
            <select
              value={city || ""}
              onChange={handleCityChange}
              disabled={disabled || !district || (district === "All" && !allowAllCity)}
              required={required && !allowAllCity}
              className={`w-full bg-white text-slate-800 font-medium border border-slate-300 ${activeThemeClass} focus:ring-2 outline-none transition-all appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed ${activeSizeClass}`}
            >
              {allowAllCity && <option value="All">All Cities / Taluks</option>}
              {!allowAllCity && (!city || availableCities.length === 0) && (
                <option value="">Select City / Taluk</option>
              )}
              {availableCities
                .filter((c) => (allowAllCity ? true : c !== "All"))
                .map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdowns;
