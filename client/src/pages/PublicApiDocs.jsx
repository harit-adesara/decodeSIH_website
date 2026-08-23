import React, { useState } from "react";
import {
  Code2,
  Play,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Bug,
  Bot,
  MapPin,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

export const PublicApiDocs = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [liveResponse, setLiveResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      title: "Get Active Viral Diseases",
      method: "GET",
      path: "/api/v1/public/viral-diseases?state=Maharashtra&district=Pune",
      description: "Allows external hospital management and health telemetry services to retrieve active viral disease outbreaks filtered by state, district, or city.",
      icon: Bug,
      params: [
        { name: "state", type: "string", desc: "Filter by Indian State (e.g. Maharashtra)" },
        { name: "district", type: "string", desc: "Filter by District (e.g. Pune)" },
        { name: "city", type: "string", desc: "Filter by City / Village (optional)" },
      ],
      samplePayload: null,
    },
    {
      title: "Get Proactive AI Outbreak Forecasts",
      method: "GET",
      path: "/api/v1/public/proactive-alerts?state=Maharashtra",
      description: "Retrieve daily proactive AI disease forecasts correlated with meteorological weather factors (humidity, rainfall, heatwave indices).",
      icon: Sparkles,
      params: [
        { name: "state", type: "string", desc: "Indian State (e.g. Maharashtra, Delhi)" },
        { name: "riskLevel", type: "string", desc: "Filter by 'high', 'severe', or 'moderate'" },
      ],
      samplePayload: null,
    },
    {
      title: "Conversational Tele-Health Triage",
      method: "POST",
      path: "/api/v1/public/chatbot",
      description: "AI-driven symptom checker endpoint with Indian regional outbreak awareness. Ready for Gemini API keys.",
      icon: Bot,
      params: [
        { name: "message", type: "string", desc: "User query / symptom description" },
        { name: "state", type: "string", desc: "User State location context" },
        { name: "district", type: "string", desc: "User District location context" },
      ],
      samplePayload: {
        message: "High fever 103F and extreme bone pain behind eyes for 2 days",
        state: "Maharashtra",
        district: "Pune",
      },
    },
    {
      title: "National Emergency Helpline Directory",
      method: "GET",
      path: "/api/v1/public/helplines",
      description: "Returns pan-India emergency ambulance (108), maternal health (102), and tele-mental health numbers.",
      icon: ExternalLink,
      params: [],
      samplePayload: null,
    },
    {
      title: "Indian States & Districts Hierarchy",
      method: "GET",
      path: "/api/v1/public/locations",
      description: "Returns the geographic hierarchy for Indian states, districts, and administrative taluks.",
      icon: MapPin,
      params: [],
      samplePayload: null,
    },
  ];

  const currentEp = endpoints[selectedEndpoint];

  const handleTestEndpoint = async () => {
    setLoading(true);
    setLiveResponse(null);
    try {
      let res;
      if (currentEp.method === "GET") {
        // Strip /api/v1 prefix since axios baseURL includes it
        const relativeUrl = currentEp.path.replace("/api/v1", "");
        res = await axiosInstance.get(relativeUrl);
      } else {
        const relativeUrl = currentEp.path.replace("/api/v1", "");
        res = await axiosInstance.post(relativeUrl, currentEp.samplePayload);
      }
      setLiveResponse(res);
    } catch (err) {
      setLiveResponse({
        error: true,
        message: err.message,
        statusCode: err.statusCode,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" /> Open Interoperability & 3rd-Party APIs
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Bharat Swasthya AI Developer REST API
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 max-w-2xl">
            Integrate syndromic outbreak intelligence, proactive vector forecasts, and tele-triage endpoints directly into hospital management systems (HMIS) and public applications.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Base URL: <strong>http://localhost:5000/api/v1</strong></span>
        </div>
      </div>

      {/* Main Documentation & Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">
            Available Endpoints
          </div>
          {endpoints.map((ep, idx) => {
            const IconComp = ep.icon;
            const isSelected = selectedEndpoint === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedEndpoint(idx);
                  setLiveResponse(null);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? "bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                    : "glass-panel border-slate-800 hover:border-slate-700 bg-slate-900/60"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                        ep.method === "GET"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-semibold text-xs text-white truncate">{ep.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{ep.path}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Explorer Panel */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 bg-slate-900/90 space-y-5">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg font-mono ${
                      currentEp.method === "GET"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {currentEp.method}
                  </span>
                  <h3 className="font-bold text-white text-base sm:text-lg">{currentEp.title}</h3>
                </div>

                <button
                  onClick={handleTestEndpoint}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{loading ? "Sending Request..." : "Test Endpoint Live"}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs text-emerald-300">
                <span className="truncate">{currentEp.path}</span>
                <button
                  onClick={() => handleCopy(currentEp.path)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mt-2.5">{currentEp.description}</p>
            </div>

            {/* Request Parameters */}
            {currentEp.params.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Query & Body Parameters
                </h4>
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400">
                      <tr>
                        <th className="py-2 px-3">Parameter</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {currentEp.params.map((p, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-mono font-semibold text-emerald-400">{p.name}</td>
                          <td className="py-2 px-3 text-slate-400">{p.type}</td>
                          <td className="py-2 px-3 text-slate-300">{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sample Request Payload if POST */}
            {currentEp.samplePayload && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Request JSON Body
                </h4>
                <pre className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(currentEp.samplePayload, null, 2)}
                </pre>
              </div>
            )}

            {/* Live Response Output */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Live API Server Response
                </h4>
                {liveResponse && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    HTTP 200 OK
                  </span>
                )}
              </div>

              <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    Executing live HTTP request to Bharat Swasthya AI backend...
                  </div>
                ) : liveResponse ? (
                  <pre className="text-emerald-300 leading-relaxed">
                    {JSON.stringify(liveResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="text-slate-500 italic">
                    Click &quot;Test Endpoint Live&quot; to invoke this API route and view real response data.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PublicApiDocs;
