import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Ambulance,
  ShieldCheck,
  HeartHandshake,
  Bot,
  Lock,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Stethoscope,
  Brain,
  ShieldAlert,
  PhoneForwarded,
  Info,
  CheckCircle2,
  Bug,
  Activity,
  MapPin,
  ChevronRight,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import LocationFilter from "../components/LocationFilter";
import ViralDiseaseDetailsModal from "../components/ViralDiseaseDetailsModal";
import HospitalBedExplorer from "../components/HospitalBedExplorer";

export const PublicLandingView = ({ onOpenEmergency, onOpenLogin, onOpenChatWithPrompt }) => {
  const [selectedLocation, setSelectedLocation] = useState({
    state: "Maharashtra",
    district: "Pune",
    city: "All",
  });
  const [viralDiseases, setViralDiseases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal States
  const [selectedViralDisease, setSelectedViralDisease] = useState(null);

  const helplines = [
    {
      name: "National Emergency Ambulance Dispatch",
      number: "108",
      desc: "Free 24x7 emergency medical trauma, stroke, cardiac and road accident dispatch with GPS tracking.",
      category: "Critical Emergency",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: Ambulance,
      primary: true,
    },
    {
      name: "Maternal & Child Health Care (Janani Shishu)",
      number: "102",
      desc: "Dedicated transport and medical assistance for pregnant women and newborns under JSSK scheme.",
      category: "Maternal Health",
      badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
      icon: HeartPulse,
      primary: false,
    },
    {
      name: "National Health Portal Helpline (MoHFW)",
      number: "1075",
      desc: "Pan-India toll-free health guidance, communicable disease inquiries, and hospital information.",
      category: "National Health",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: PhoneCall,
      primary: false,
    },
    {
      name: "State Medical Information & Tele-Advice",
      number: "104",
      desc: "24x7 qualified medical advice, blood availability checks, and primary clinical counseling.",
      category: "Tele-Advice",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Stethoscope,
      primary: false,
    },
    {
      name: "Tele-MANAS Mental Health Support",
      number: "14416",
      desc: "National Tele-Mental Health Assistance and Networking Across States in 20+ regional languages.",
      category: "Mental Health",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Brain,
      primary: false,
    },
    {
      name: "Unified Pan-India Emergency Response",
      number: "112",
      desc: "Single emergency response number integrating Police, Fire, Ambulance, and Disaster assistance.",
      category: "Unified Emergency",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: ShieldAlert,
      primary: false,
    },
  ];

  const fetchSurveillanceData = async () => {
    setLoading(true);
    try {
      const [viralRes, proactiveRes] = await Promise.all([
        axiosInstance.get(
          `/public/viral-diseases?state=${selectedLocation.state}&district=${selectedLocation.district}&city=${selectedLocation.city}`
        ),
        axiosInstance.get(
          `/public/proactive-alerts?state=${selectedLocation.state}&district=${selectedLocation.district}`
        ),
      ]);
      setViralDiseases(viralRes.data?.data || []);
      setProactiveAlerts(proactiveRes.data?.alerts || []);
    } catch {
      // Handled silently in UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveillanceData();
  }, [selectedLocation.state, selectedLocation.district, selectedLocation.city]);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Public Health Platform • India
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-slate-900 leading-tight">
            Integrated Disease Surveillance & <span className="text-teal-600">AI Outbreak Radar</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            National digital health network connecting Citizens, ASHA Community Health Workers, and Medical Officers with real-time syndromic surveillance, weather-linked vector forecasts, and verified clinical guidance.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenLogin}
              className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <span>Sign In / Register Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenEmergency}
              className="px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-sm shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Emergency 108 Directory</span>
            </button>
          </div>
        </div>

        {/* Security & Access Info Card */}
        <div className="w-full lg:w-96 p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-inner space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Lock className="w-4 h-4 text-teal-600" />
            Platform Access & Privacy
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Emergency Services:</strong> 108 & helplines are open 24x7 without login.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>AI Tele-Health Chatbot:</strong> Sign in with email verification to run triage symptom checks.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span><strong>Field & Clinical Workstations:</strong> Doctors and ASHA health workers log in for diagnosis & case reporting.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Regional Surveillance Feed & Location Filter */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Regional Disease Surveillance Radar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore active viral outbreaks and AI outbreak forecasts across all Indian States & Districts.
            </p>
          </div>
        </div>

        <LocationFilter
          selectedState={selectedLocation.state}
          selectedDistrict={selectedLocation.district}
          selectedCity={selectedLocation.city}
          onChange={(newLoc) => setSelectedLocation(newLoc)}
        />
      </section>

      {/* Active Viral Outbreaks Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-600" />
              Active Viral Pathogen Strains in {selectedLocation.district}, {selectedLocation.state}
            </h3>
            <p className="text-xs text-slate-500">
              Click any viral disease card to inspect complete clinical presentation & doctor remarks
            </p>
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {viralDiseases.length} Active Strains
          </span>
        </div>

        {viralDiseases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viralDiseases.map((disease, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedViralDisease(disease)}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm glass-card-hover flex flex-col justify-between cursor-pointer group hover:border-teal-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                      Viral Transmission
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      📍 {disease.district}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                    {disease.diseaseName}
                  </h4>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Cases Reported</div>
                      <div className="font-bold text-teal-700 text-sm">
                        {disease.totalCases} Patients
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Severity</div>
                      <div className="font-bold text-rose-600 capitalize text-sm">
                        {disease.highestSeverity || "Moderate"}
                      </div>
                    </div>
                  </div>

                  {disease.symptoms?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {disease.symptoms.slice(0, 3).map((sym, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          {sym}
                        </span>
                      ))}
                      {disease.symptoms.length > 3 && (
                        <span className="text-[10px] text-teal-700 font-semibold px-1 py-0.5">
                          +{disease.symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Click for Full Details</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedViralDisease(disease);
                    }}
                    className="text-teal-600 group-hover:text-teal-700 font-bold flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center text-slate-500 text-sm shadow-sm">
            ✅ No critical viral outbreak spikes reported currently for {selectedLocation.district},{" "}
            {selectedLocation.state}. Maintain regular hygiene.
          </div>
        )}
      </section>

      {/* Real-Time Hospital Bed & Ward Availability Section */}
      <section className="space-y-4">
        <HospitalBedExplorer
          initialState={selectedLocation.state}
          initialDistrict={selectedLocation.district}
          initialCity={selectedLocation.city}
          roleContext="citizen"
          title={`Live Hospital Bed & Ward Availability (${selectedLocation.district}, ${selectedLocation.state})`}
          subtitle="Check real-time ward capacity, vacant ICU units, and daily per-bed charges across public and private hospitals."
        />
      </section>

      {/* 24x7 Emergency Helplines Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-rose-600" />
              National 24x7 Toll-Free Emergency Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Instant one-touch access to pan-India emergency ambulances, maternal health, and mental health crisis response.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helplines.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div
                key={index}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between shadow-sm ${
                  item.primary
                    ? "border-rose-300 ring-2 ring-rose-500/10"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.category}
                    </span>
                    <IconComp className={`w-4 h-4 ${item.primary ? "text-rose-600" : "text-slate-400"}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{item.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4">{item.desc}</p>
                </div>

                <a
                  href={`tel:${item.number}`}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    item.primary
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-800"
                  }`}
                >
                  <PhoneForwarded className="w-4 h-4" />
                  <span>Call {item.number} (Toll-Free)</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viral Disease Details Modal */}
      {selectedViralDisease && (
        <ViralDiseaseDetailsModal
          disease={selectedViralDisease}
          isOpen={Boolean(selectedViralDisease)}
          onClose={() => setSelectedViralDisease(null)}
          onOpenChatWithPrompt={onOpenLogin}
          onOpenEmergency={onOpenEmergency}
        />
      )}
    </div>
  );
};

export default PublicLandingView;

