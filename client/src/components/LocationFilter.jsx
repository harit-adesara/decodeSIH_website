import React, { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const fallbackLocations = {
  Maharashtra: {
    districts: ["Pune", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nashik", "Thane"],
    cities: {
      Pune: ["All", "Shivajinagar", "Hadapsar", "Kothrud", "Hinjawadi", "Pimpri", "Baramati"],
      "Mumbai Suburban": ["All", "Andheri", "Bandra", "Borivali", "Goregaon", "Kurla"],
      "Mumbai City": ["All", "Colaba", "Dadar", "Byculla", "Parel", "Worli"],
      Nagpur: ["All", "Sitabuldi", "Dharampeth", "Ramdaspeth"],
      Nashik: ["All", "Panchavati", "CIDCO", "Satpur"],
      Thane: ["All", "Naupada", "Ghodbunder", "Kalyan", "Dombivli"],
    },
  },
  Delhi: {
    districts: ["Central Delhi", "New Delhi", "North Delhi", "South Delhi"],
    cities: {
      "Central Delhi": ["All", "Karol Bagh", "Pahar Ganj", "Rajinder Nagar"],
      "New Delhi": ["All", "Connaught Place", "Chanakyapuri", "Vasant Vihar"],
      "North Delhi": ["All", "Civil Lines", "Model Town", "Narela"],
      "South Delhi": ["All", "Saket", "Hauz Khas", "Greater Kailash"],
    },
  },
  "Uttar Pradesh": {
    districts: ["Lucknow", "Varanasi", "Kanpur Nagar", "Gautam Buddha Nagar"],
    cities: {
      Lucknow: ["All", "Hazratganj", "Gomti Nagar", "Alambagh"],
      Varanasi: ["All", "Lanka", "Sigra", "Godowlia"],
      "Kanpur Nagar": ["All", "Civil Lines", "Kakadeo"],
      "Gautam Buddha Nagar": ["All", "Noida Sector 18", "Noida Sector 62", "Greater Noida"],
    },
  },
  Gujarat: {
    districts: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
    cities: {
      Ahmedabad: ["All", "Navrangpura", "Satellite", "Maninagar", "Vastrapur"],
      Surat: ["All", "Adajan", "Athwa", "Varachha"],
      Vadodara: ["All", "Alkapuri", "Fatehgunj"],
      Rajkot: ["All", "Yagnik Road", "Kalawad Road"],
    },
  },
  Karnataka: {
    districts: ["Bengaluru Urban", "Mysuru", "Mangaluru"],
    cities: {
      "Bengaluru Urban": ["All", "Indiranagar", "Koramangala", "Whitefield", "Jayanagar"],
      Mysuru: ["All", "Gokulam", "Jayalakshmipuram"],
      Mangaluru: ["All", "Kadri", "Kankanady"],
    },
  },
};

export const LocationFilter = ({
  selectedState = "Maharashtra",
  selectedDistrict = "Pune",
  selectedCity = "All",
  onChange,
  className = "",
  showCity = true,
  allowAllState = false,
}) => {
  const [locations, setLocations] = useState(fallbackLocations);
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
