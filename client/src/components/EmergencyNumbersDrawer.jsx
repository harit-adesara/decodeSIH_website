import React from "react";
import {
  X,
  PhoneCall,
  Ambulance,
  HeartPulse,
  Stethoscope,
  Brain,
  ShieldAlert,
  PhoneForwarded,
  Info,
} from "lucide-react";

export const EmergencyNumbersDrawer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helplineList = [
    {
      name: "National Emergency Ambulance Dispatch",
      number: "108",
      description: "Free 24x7 emergency medical trauma, stroke, cardiac and road accident dispatch with GPS tracking.",
      category: "Critical Emergency",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: Ambulance,
      primary: true,
    },
    {
      name: "Maternal & Child Health Care (Janani Shishu)",
      number: "102",
      description: "Dedicated transport and medical assistance for pregnant women and newborns under JSSK scheme.",
      category: "Maternal Health",
      badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      icon: HeartPulse,
      primary: false,
    },
    {
      name: "National Health Portal Helpline (MoHFW)",
      number: "1075",
      description: "Pan-India toll-free health guidance, communicable disease inquiries, and government hospital info.",
      category: "National Health",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: PhoneCall,
      primary: false,
    },
    {
      name: "State Medical Information & Tele-Advice",
      number: "104",
      description: "24x7 qualified medical advice, blood availability checks, and primary clinical counseling.",
      category: "Tele-Advice",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: Stethoscope,
      primary: false,
    },
    {
      name: "Tele-MANAS Mental Health Support",
      number: "14416",
      description: "National Tele-Mental Health Assistance and Networking Across States in 20+ regional languages.",
      category: "Mental Health",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: Brain,
      primary: false,
    },
    {
      name: "Unified Pan-India Emergency Response",
      number: "112",
      description: "Single emergency response number integrating Police, Fire, Ambulance, and Disaster assistance.",
      category: "Unified Emergency",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      icon: ShieldAlert,
      primary: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl glass-panel border border-red-500/30 shadow-2xl overflow-hidden bg-slate-900/95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-lg">
                Emergency Medical Helplines
              </h3>
              <p className="text-slate-400 text-xs">
                Toll-Free 24x7 National & State Emergency Services (India)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-xs text-red-300">
            <Info className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p>
              In life-threatening situations (cardiac arrest, unconsciousness, severe hemorrhage, or trauma), immediately dial <strong>108</strong>. All calls are toll-free from any mobile or landline across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {helplineList.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    item.primary
                      ? "bg-red-950/30 border-red-500/40 shadow-lg shadow-red-500/10"
                      : "bg-slate-800/60 border-slate-700 hover:border-slate-600"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.category}
                      </span>
                      <IconComp className={`w-4 h-4 ${item.primary ? "text-red-400" : "text-slate-400"}`} />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">{item.name}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed mb-3">{item.description}</p>
                  </div>

                  <a
                    href={`tel:${item.number}`}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      item.primary
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/30"
                        : "bg-slate-700 hover:bg-emerald-600 text-white hover:text-white"
                    }`}
                  >
                    <PhoneForwarded className="w-4 h-4" />
                    <span>Dial {item.number}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400">
          Operated in coordination with Ministry of Health & Family Welfare (MoHFW), Govt of India.
        </div>
      </div>
    </div>
  );
};
export default EmergencyNumbersDrawer;
