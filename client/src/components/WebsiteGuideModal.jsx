import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Compass,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Volume2,
  VolumeX,
  Globe,
  Loader2,
  Radio,
  Copy,
  Check,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  PhoneCall,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import MarkdownRenderer from "./MarkdownRenderer";
import { useAuth } from "../context/AuthContext";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Supported Indian Languages for Sarvam STT
const SARVAM_LANGUAGES = [
  { code: "unknown", label: "Auto Detect (Indian Languages / English)" },
  { code: "hi-IN", label: "Hindi (हिन्दी)" },
  { code: "gu-IN", label: "Gujarati (ગુજરાતી)" },
  { code: "mr-IN", label: "Marathi (मराठी)" },
  { code: "bn-IN", label: "Bengali (বাংলা)" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
  { code: "te-IN", label: "Telugu (తెలుగు)" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)" },
  { code: "pa-IN", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "od-IN", label: "Odia (ଓଡ଼ିଆ)" },
  { code: "en-IN", label: "English (Indian Accent)" },
];

const QUICK_SUGGESTIONS = [
  {
    label: "AI Health Chatbot कहां मिलेगा?",
    prompt: "AI Health Chatbot कहां मिलेगा और इसका उपयोग कैसे करें?",
  },
  {
    label: "How to check disease alerts in my district?",
    prompt: "How can I check active viral disease outbreaks and advisories for my district?",
  },
  {
    label: "108 Emergency Helpline kaise use kare?",
    prompt: "आपातकालीन 108 एम्बुलेंस और अन्य हेल्पलाइन नंबर कैसे डायल करें?",
  },
  {
    label: "How to register & edit profile?",
    prompt: "How do I create a Citizen account and update my location profile?",
  },
  {
    label: "Public API Explorer docs?",
    prompt: "Where can I find the Public REST API documentation?",
  },
];

export const WebsiteGuideModal = ({ isOpen, onClose, onOpenEmergency, onOpenChat }) => {
  const { user } = useAuth();
  const storageKey = user?._id
    ? `bharat_swasthya_guide_user_${user._id}`
    : "bharat_swasthya_guide_guest";

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("unknown");
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load and prune 1-day chat history for this user/guest on mount or user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const pruned = (Array.isArray(parsed) ? parsed : []).filter((msg) => {
          if (!msg.timestamp) return true;
          return now - new Date(msg.timestamp).getTime() <= ONE_DAY_MS;
        });
        setMessages(pruned);
        localStorage.setItem(storageKey, JSON.stringify(pruned));
      } else {
        setMessages([]);
      }
    } catch {
      // Handled silently
    }
  }, [storageKey]);

  // Save messages to user-specific or guest local storage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch {
        // Handled silently
      }
    }
  }, [messages, storageKey]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen, isTranscribing]);

  // Cleanup audio recording on unmount or close
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
  };

  // 1-Day chat history builder for API call
  const getOneDayChatHistory = () => {
    const now = Date.now();
    return messages
      .filter((msg) => {
        if (!msg.timestamp) return true;
        return now - new Date(msg.timestamp).getTime() <= ONE_DAY_MS;
      })
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
        timestamp: msg.timestamp,
      }));
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessagesList = [...messages, userMessage];
    setMessages(newMessagesList);
    setInputText("");
    setIsLoading(true);

    try {
      const historyPayload = getOneDayChatHistory();

      const res = await axiosInstance.post("/public/guide", {
        message: query.trim(),
        chat_history: historyPayload,
      });

      // Handle both intercepted (res) and raw (res.data) responses safely
      const responseData = res?.data !== undefined && typeof res.data === "object" ? res.data : res;
      const guideText =
        responseData?.response ??
        responseData?.data?.response ??
        responseData?.reply ??
        responseData?.output ??
        responseData?.message ??
        (typeof responseData === "string" ? responseData : "");

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: guideText || "No response received from Guide LLM.",
        source: responseData?.source || "guide_llm",
        timestamp: new Date().toISOString(),
      };

      setMessages([...newMessagesList, botMessage]);
    } catch (err) {
      const errorDetail =
        err.response?.data?.response ||
        err.response?.data?.message ||
        err.message ||
        "Could not connect to Guide LLM service.";

      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Guide LLM Error**: ${errorDetail}`,
        source: "guide_llm_error",
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessagesList, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start Audio Recording for Sarvam STT
  const startRecording = async () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Prefer standard webm or mp4 audio
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mime = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        stream.getTracks().forEach((track) => track.stop());

        if (audioBlob.size > 0) {
          await processVoiceWithSarvam(audioBlob, mime);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Microphone access was denied or is not supported in this browser.");
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Send Audio to Sarvam STT API Endpoint
  const processVoiceWithSarvam = async (audioBlob, mimeType) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      formData.append("file", audioBlob, `voice-input.${ext}`);
      formData.append("language_code", selectedLanguage || "unknown");

      const res = await axiosInstance.post("/public/guide/stt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res?.data !== undefined && typeof res.data === "object" ? res.data : res;
      if (data && data.transcript && data.transcript.trim()) {
        const transcript = data.transcript.trim();
        // Automatically send the transcribed speech to Guide LLM
        handleSendMessage(transcript);
      } else {
        const msg = data?.message || data?.error || "No speech recognized. Please speak clearly into your microphone.";
        setInputText(msg);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Could not transcribe speech.";
      setInputText(`STT Error: ${errMsg}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Text-To-Speech playback toggle for guide response
  const toggleSpeak = (msg) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingMsgId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for pleasant speech
    const cleanText = msg.content
      .replace(/[#*_`~>-]/g, " ")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;

    // Detect Hindi or English voice
    const isHindi = /[\u0900-\u097F]/.test(cleanText);
    utterance.lang = isHindi ? "hi-IN" : "en-IN";

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? "max-w-5xl h-[94vh]"
            : "max-w-3xl h-[88vh] max-h-[720px]"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Compass className="w-5 h-5 text-emerald-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-white text-base sm:text-lg">
                  BharatSwasthya AI Website Guide
                </h3>
                <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Voice + Multilingual
                </span>
              </div>
              <p className="text-emerald-100/80 text-xs mt-0.5">
                Instant help for website navigation, features & emergency access (Supports Indian Languages)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-all"
              title={isExpanded ? "Restore size" : "Expand size"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition-all"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader Toolbar: Language Picker & Clear Button */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-semibold text-[11px] text-slate-700">Voice Language:</span>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:border-teal-500 focus:outline-none cursor-pointer pr-6 shadow-xs appearance-none"
              >
                {SARVAM_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
              Sarvam AI STT
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] text-slate-400">
              1-Day Chat History
            </span>
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 transition-colors px-2 py-0.5 rounded hover:bg-rose-50"
                title="Clear guide conversation history"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="py-6 sm:py-10 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-teal-200 flex items-center justify-center mx-auto shadow-sm text-teal-700">
                <Compass className="w-8 h-8 text-teal-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display font-bold text-slate-900 text-lg">
                  नमस्ते! How can I guide you on BharatSwasthya AI?
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Ask me in Hindi, English, Gujarati, Marathi, Bengali, Tamil, Telugu, or any Indian language. Speak using the microphone or type below!
                </p>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Popular Questions / अक्सर पूछे जाने वाले सवाल
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all active:scale-95 text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-teal-700 text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="whitespace-pre-line leading-relaxed font-medium">
                    {msg.content}
                  </div>
                ) : (
                  <div>
                    <MarkdownRenderer content={msg.content} className="text-slate-800" />

                    {/* Actions on Assistant reply: Speak, Copy */}
                    <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSpeak(msg)}
                          className={`p-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px] ${
                            speakingMsgId === msg.id
                              ? "text-teal-600 font-bold bg-teal-50"
                              : "text-slate-500"
                          }`}
                          title="Listen to response (TTS)"
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors flex items-center gap-1 text-[11px]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Transcribing Loaders */}
          {isTranscribing && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 animate-spin text-emerald-600" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-emerald-200 flex items-center gap-2.5 text-slate-700 text-xs shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span className="font-semibold text-emerald-800">
                  Transcribing voice with Sarvam AI STT ({selectedLanguage})...
                </span>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 flex items-center gap-2.5 text-slate-700 text-xs shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.3s]" />
                </div>
                <span className="font-semibold text-teal-900">
                  Preparing guide instructions...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Recording Overlay Banner */}
        {isRecording && (
          <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white px-4 py-3 flex items-center justify-between animate-fadeIn shadow-inner">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-white block animate-ping" />
                <span className="w-3 h-3 rounded-full bg-white block absolute inset-0" />
              </div>
              <div className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span>Listening... Speak in your language</span>
                <span className="font-mono bg-white/20 px-2 py-0.5 rounded-md text-xs">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>
            </div>

            <button
              onClick={stopRecording}
              className="px-3.5 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>Done Speaking</span>
            </button>
          </div>
        )}

        {/* Input Control Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border border-slate-300 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            {/* Voice Record Mic Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading || isTranscribing}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm ${
                isRecording
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isRecording ? "Stop recording" : "Voice input (Sarvam AI STT)"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <textarea
              rows="1"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask how to use features, find AI Health Chatbot, emergency 108... / प्रश्न पूछें..."
              className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-2 py-2 outline-none resize-none max-h-24"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading || isTranscribing}
              className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
              title="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Shortcuts & Disclaimer */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-2 px-1 gap-2">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              Website navigation guide only. For medical triage, use AI Health Chatbot.
            </span>

            {onOpenEmergency && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEmergency();
                }}
                className="text-rose-600 hover:underline flex items-center gap-1 font-semibold ml-auto"
              >
                <PhoneCall className="w-3 h-3" /> Emergency 108 Hotline
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteGuideModal;
