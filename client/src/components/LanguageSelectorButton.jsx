import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check, Languages } from "lucide-react";

export const INDIAN_LANGUAGES = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", label: "Hindi (हिन्दी)" },
  { code: "en", name: "English", nativeName: "English", label: "English" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", label: "Gujarati (ગુજરાતી)" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", label: "Marathi (मराठी)" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", label: "Bengali (বাংলা)" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", label: "Tamil (தமிழ்)" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", label: "Telugu (తెలుగు)" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", label: "Malayalam (മലയാളം)" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "od", name: "Odia", nativeName: "ଓଡ଼ିଆ", label: "Odia (ଓଡ଼ିଆ)" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", label: "Assamese (অসমীয়া)" },
  { code: "ur", name: "Urdu", nativeName: "اردو", label: "Urdu (اردو)" },
];

/**
 * LanguageSelectorButton
 * Compact, modern language selector button placed on the left side of AI Action buttons.
 *
 * @param {string} value - Selected language name (e.g., 'Hindi', 'Gujarati', 'English')
 * @param {function} onChange - Callback with selected language name
 * @param {string} theme - 'amber' | 'dark' | 'white' | 'teal'
 * @param {string} size - 'sm' | 'md'
 */
export const LanguageSelectorButton = ({
  value = "Hindi",
  onChange,
  theme = "amber",
  size = "md",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentLang =
    INDIAN_LANGUAGES.find(
      (l) =>
        l.name.toLowerCase() === (value || "").toLowerCase() ||
        l.label.toLowerCase() === (value || "").toLowerCase()
    ) || INDIAN_LANGUAGES[0];

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const themeStyles = {
    amber: {
      button:
        "bg-white/90 hover:bg-white text-amber-950 border border-amber-300/80 shadow-xs hover:border-amber-400 focus:ring-2 focus:ring-amber-400/40",
      badge: "bg-amber-100/90 text-amber-800",
      icon: "text-amber-600",
    },
    dark: {
      button:
        "bg-white/10 hover:bg-white/15 text-white border border-white/20 shadow-xs backdrop-blur-md hover:border-white/30 focus:ring-2 focus:ring-white/30",
      badge: "bg-white/15 text-amber-200",
      icon: "text-amber-300",
    },
    teal: {
      button:
        "bg-white/90 hover:bg-white text-teal-950 border border-teal-300/80 shadow-xs hover:border-teal-400 focus:ring-2 focus:ring-teal-400/40",
      badge: "bg-teal-100 text-teal-800",
      icon: "text-teal-600",
    },
    white: {
      button:
        "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs focus:ring-2 focus:ring-teal-500/30",
      badge: "bg-slate-100 text-slate-700",
      icon: "text-slate-600",
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.amber;

  return (
    <div className={`relative inline-block text-left shrink-0 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold transition-all duration-150 active:scale-95 cursor-pointer select-none ${
          size === "sm" ? "text-xs py-2 px-2.5" : "text-xs sm:text-sm"
        } ${currentTheme.button}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Select Language for Proactive AI Advisory"
      >
        <Languages className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${currentTheme.icon}`} />
        <span className="truncate max-w-[90px] sm:max-w-[120px] font-medium">
          {currentLang.nativeName || currentLang.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-auto sm:right-0 mt-1.5 w-64 max-h-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden flex flex-col animate-fadeIn">
          {/* Header / Search */}
          <div className="px-3 pb-2 pt-1 border-b border-slate-100">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-500" />
              <span>Select Indian Language</span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white outline-none"
              autoFocus
            />
          </div>

          {/* Languages List */}
          <div className="overflow-y-auto flex-1 p-1 space-y-0.5 max-h-56">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected =
                  currentLang.name.toLowerCase() === lang.name.toLowerCase();
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onChange && onChange(lang.name);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-amber-50 text-amber-900 font-bold"
                        : "text-slate-700 hover:bg-slate-100 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{lang.nativeName}</span>
                      <span className="text-[11px] text-slate-500">({lang.name})</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">No matching language</div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-500">
            Advisory will be generated in selected language
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelectorButton;
