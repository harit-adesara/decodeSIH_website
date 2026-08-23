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
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: Ambulance,
      primary: true,
    },
    {
      name: "Maternal & Child Health Care (Janani Shishu)",
      number: "102",
      description: "Dedicated transport and medical assistance for pregnant women and newborns under JSSK scheme.",
      category: "Maternal Health",
      badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
      icon: HeartPulse,
      primary: false,
    },
    {
      name: "National Health Portal Helpline (MoHFW)",
      number: "1075",
      description: "Pan-India toll-free health guidance, communicable disease inquiries, and government hospital info.",
      category: "National Health",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: PhoneCall,
      primary: false,
    },
    {
      name: "State Medical Information & Tele-Advice",
      number: "104",
      description: "24x7 qualified medical advice, blood availability checks, and primary clinical counseling.",
      category: "Tele-Advice",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Stethoscope,
      primary: false,
    },
    {
      name: "Tele-MANAS Mental Health Support",
      number: "14416",
      description: "National Tele-Mental Health Assistance and Networking Across States in 20+ regional languages.",
      category: "Mental Health",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      icon: Brain,
      primary: false,
    },
    {
      name: "Unified Pan-India Emergency Response",
      number: "112",
      description: "Single emergency response number integrating Police, Fire, Ambulance, and Disaster assistance.",
      category: "Unified Emergency",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      icon: ShieldAlert,
      primary: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center shadow-md shadow-rose-600/20 text-white animate-pulse">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-lg">
                Emergency Medical Helplines
              </h3>
              <p className="text-slate-500 text-xs">
                Toll-Free 24x7 National & State Emergency Services (India)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Directory Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
            <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
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
                      ? "bg-rose-50/50 border-rose-300 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.category}
                      </span>
                      <IconComp className={`w-4 h-4 ${item.primary ? "text-rose-600" : "text-slate-400"}`} />
                    </div>
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">{item.name}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-3">{item.description}</p>
                  </div>

                  <a
                    href={`tel:${item.number}`}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      item.primary
                        ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-800"
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Operated in coordination with Ministry of Health & Family Welfare (MoHFW), Govt of India.
        </div>
      </div>
    </div>
  );
};

export default EmergencyNumbersDrawer;
