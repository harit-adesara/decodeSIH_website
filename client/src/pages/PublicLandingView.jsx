import React from "react";
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
} from "lucide-react";

export const PublicLandingView = ({ onOpenEmergency, onOpenLogin }) => {
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

  return (
    <div className="space-y-8 pb-16">
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
    </div>
  );
};

export default PublicLandingView;
