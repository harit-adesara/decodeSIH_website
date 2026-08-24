import React, { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { indiaLocations } from "../data/indiaLocations";

export const LocationFilter = ({
  selectedState = "Maharashtra",
  selectedDistrict = "Pune",
  selectedCity = "All",
  onChange,
  className = "",
  showCity = true,
  allowAllState = false,
}) => {
  const [locations, setLocations] = useState(indiaLocations);
  const [state, setState] = useState(selectedState);
  const [district, setDistrict] = useState(selectedDistrict);
  const [city, setCity] = useState(selectedCity);

  useEffect(() => {
    // Fetch live locations from backend
    axiosInstance
      .get("/public/locations")
      .then((res) => {
        if (res.data?.locations) {
          setLocations(res.data.locations);
        }
      })
      .catch(() => {
        // Use fallback if offline
      });
  }, []);

  useEffect(() => {
    setState(selectedState);
    setDistrict(selectedDistrict);
    setCity(selectedCity);
  }, [selectedState, selectedDistrict, selectedCity]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setState(newState);

    let newDistrict = "All";
    let newCity = "All";

    if (newState !== "All" && locations[newState]) {
      newDistrict = locations[newState].districts[0] || "All";
    }

    setDistrict(newDistrict);
    setCity(newCity);
    if (onChange) onChange({ state: newState, district: newDistrict, city: newCity });
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setDistrict(newDistrict);
    const newCity = "All";
    setCity(newCity);
    if (onChange) onChange({ state, district: newDistrict, city: newCity });
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setCity(newCity);
    if (onChange) onChange({ state, district, city: newCity });
  };

  const availableDistricts = state !== "All" && locations[state] ? locations[state].districts : [];
  const availableCities =
    state !== "All" && district !== "All" && locations[state]?.cities?.[district]
      ? locations[state].cities[district]
      : ["All"];

  return (
    <div className={`flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider pl-1">
        <MapPin className="w-4 h-4 text-teal-600 animate-pulse" />
        <span>Jurisdiction:</span>
      </div>

      {/* State Selector */}
      <div className="relative flex-1 min-w-[140px]">
        <select
          value={state}
          onChange={handleStateChange}
          className="w-full bg-slate-50 text-slate-800 text-xs md:text-sm font-medium rounded-xl px-3 py-2 pr-8 border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer transition-all"
        >
          {allowAllState && <option value="All">All States (Pan-India)</option>}
          {Object.keys(locations).map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* District Selector */}
      <div className="relative flex-1 min-w-[140px]">
        <select
          value={district}
          onChange={handleDistrictChange}
          className="w-full bg-slate-50 text-slate-800 text-xs md:text-sm font-medium rounded-xl px-3 py-2 pr-8 border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer transition-all"
        >
          <option value="All">All Districts</option>
          {availableDistricts.map((dst) => (
            <option key={dst} value={dst}>
              {dst}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* City / Taluk Selector */}
      {showCity && (
        <div className="relative flex-1 min-w-[140px]">
          <select
            value={city}
            onChange={handleCityChange}
            className="w-full bg-slate-50 text-slate-800 text-xs md:text-sm font-medium rounded-xl px-3 py-2 pr-8 border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none appearance-none cursor-pointer transition-all"
          >
            <option value="All">All Cities / Taluks</option>
            {availableCities
              .filter((c) => c !== "All")
              .map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
