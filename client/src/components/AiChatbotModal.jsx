import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Bot,
  Send,
  User,
  Sparkles,
  MapPin,
  RefreshCw,
  PhoneCall,
  ShieldCheck,
  MessageSquarePlus,
  MessageSquare,
  ChevronLeft,
  ChevronDown,
  Loader2,
  Trash2,
  Pencil,
  Mic,
  MicOff,
  Globe,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Radio,
  Info,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import MarkdownRenderer from "./MarkdownRenderer";
import LocationDropdowns from "./LocationDropdowns";

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

const QUICK_PROMPTS = [
  {
    label: "बुखार और बदन दर्द (Fever & Body Pain)",
    prompt: "मुझे 2 दिन से तेज बुखार, सिरदर्द और बदन दर्द है। क्या यह डेंगू हो सकता है?",
  },
  {
    label: "Dry cough & sore throat",
    prompt: "I have persistent dry cough, sore throat, and mild breathlessness for 3 days.",
  },
  {
    label: "ઉલ્ટી અને ઝાડા (Vomiting & Diarrhea)",
    prompt: "ઝાડા અને ઉલ્ટી માટે પ્રાથમિક સારવાર અને ORS નો ઉપયોગ કેવી રીતે કરવો?",
  },
  {
    label: "Active Dengue precautions in my area",
    prompt: "What are the active dengue precautions and vector-borne outbreak alerts in my district?",
  },
];

export const AiChatbotModal = ({
  isOpen,
  onClose,
  onOpenEmergency,
  initialPrompt = "",
}) => {
  const { locationContext, user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showSidebar, setShowSidebar] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth >= 768;
    return true;
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locState, setLocState] = useState("");
  const [locDistrict, setLocDistrict] = useState("");
  const [locCity, setLocCity] = useState("");
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  // Voice Recording & Multilingual States
  const [selectedLanguage, setSelectedLanguage] = useState("unknown");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isTranscribing]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    } else {
      stopRecordingCleanup();
    }
  }, [isOpen]);

  // Cleanup audio recording on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
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

  useEffect(() => {
    if (isOpen && initialPrompt && activeConversation) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt, activeConversation]);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await axiosInstance.get("/chat/conversations");
      const convs = res.data?.conversations || res.data?.data?.conversations || res.data || [];
      setConversations(convs);
    } catch {
      // Handled silently
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setShowSidebar(false);
    await fetchMessages(conv._id, 1);
  };

  const fetchMessages = async (conversationId, pageNum) => {
    setIsLoadingMessages(true);
    try {
      const res = await axiosInstance.get(
        `/chat/conversations/${conversationId}/messages?page=${pageNum}&limit=50`,
      );
      const data = res.data?.data || res.data || {};
      const fetchedMessages = (data.messages || []).map((msg) => ({
        id: msg._id,
        sender: msg.role === "user" ? "user" : "bot",
        text: msg.content,
        source: msg.source,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      if (pageNum === 1) {
        setMessages(fetchedMessages);
      } else {
        setMessages((prev) => [...fetchedMessages, ...prev]);
      }

      setHasMore(pageNum < (data.totalPages || 1));
      setPage(pageNum);
    } catch {
      // Handled silently
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await axiosInstance.post("/chat/conversations");
      const newConv =
        res.data?.conversation || res.data?.data?.conversation || res.data;
      if (newConv && newConv._id) {
        setConversations((prev) => [newConv, ...prev]);
        selectConversation(newConv);
      }
    } catch {
      // Handled silently
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (deleteConfirmId === convId) {
      try {
        await axiosInstance.delete(`/chat/conversations/${convId}`);
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        if (activeConversation?._id === convId) {
          setActiveConversation(null);
          setMessages([]);
          setShowSidebar(true);
        }
      } catch {
        // Handled silently
      }
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(convId);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    let convId = activeConversation?._id;

    if (!convId) {
      try {
        const res = await axiosInstance.post("/chat/conversations");
        const newConv =
          res.data?.conversation || res.data?.data?.conversation || res.data;
        if (newConv && newConv._id) {
          convId = newConv._id;
          setActiveConversation(newConv);
          setConversations((prev) => [newConv, ...prev]);
          setShowSidebar(false);
        }
      } catch {
        return;
      }
    }

    const userMsgId = Date.now().toString();
    const newUserMessage = {
      id: userMsgId,
      sender: "user",
      text: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post(
        `/chat/conversations/${convId}/messages`,
        {
          message: message,
        },
      );

      const data = res.data?.data || res.data || {};
      const botMessage = data.botMessage;

      if (botMessage) {
        const botReply = {
          id: botMessage._id,
          sender: "bot",
          text: botMessage.content,
          source: botMessage.source,
          timestamp: new Date(botMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botReply]);
      }

      if (
        activeConversation &&
        activeConversation.title === "New Conversation"
      ) {
        const updatedConv = {
          ...activeConversation,
          title: message.trim().slice(0, 50),
        };
        setActiveConversation(updatedConv);
        setConversations((prev) =>
          prev.map((c) => (c._id === updatedConv._id ? updatedConv : c)),
        );
      }
    } catch (err) {
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "I encountered an issue connecting to the AI diagnostic engine. For immediate emergency advice, please call **108** or National Health Helpline **1075**.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start Audio Recording for Sarvam STT
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

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

  // Send Audio to Sarvam STT Endpoint
  const processVoiceWithSarvam = async (audioBlob, mimeType) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      const ext = mimeType.includes("mp4") ? "mp4" : "webm";
      formData.append("file", audioBlob, `voice-input.${ext}`);
      formData.append("language_code", selectedLanguage || "unknown");

      // Try authenticated chat STT first, fallback to guide STT
      let res;
      try {
        res = await axiosInstance.post("/chat/stt", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        res = await axiosInstance.post("/public/guide/stt", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const data = res?.data !== undefined && typeof res.data === "object" ? res.data : res;
      if (data && data.transcript && data.transcript.trim()) {
        const transcript = data.transcript.trim();
        // Automatically send the voice input query to the AI health triage engine
        await handleSendMessage(transcript);
      } else {
        const msg = data?.message || data?.error || "No speech recognized. Please speak clearly into your microphone.";
        setInputMessage(msg);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Could not transcribe speech.";
      setInputMessage(`STT Error: ${errMsg}`);
    } finally {
      setIsTranscribing(false);
    }
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMessages || !hasMore) return;

    if (container.scrollTop < 80) {
      const nextPage = page + 1;
      if (activeConversation) {
        fetchMessages(activeConversation._id, nextPage);
      }
    }
  }, [page, hasMore, isLoadingMessages, activeConversation]);

  const handleOpenLocationPicker = () => {
    const convLoc = activeConversation?.location || {};
    setLocState(
      convLoc.state && convLoc.state !== "All"
        ? convLoc.state
        : locationContext.state || "Maharashtra"
    );
    setLocDistrict(
      convLoc.district && convLoc.district !== "All"
        ? convLoc.district
        : locationContext.district || "Pune"
    );
    setLocCity(
      convLoc.city && convLoc.city !== "All"
        ? convLoc.city
        : locationContext.city || "Shivajinagar"
    );
    setShowLocationPicker(true);
  };

  const handleSaveLocation = async () => {
    if (!activeConversation) return;
    setIsUpdatingLocation(true);
    try {
      const payload = {};
      if (locState.trim()) payload.state = locState.trim();
      if (locDistrict.trim()) payload.district = locDistrict.trim();
      if (locCity.trim()) payload.city = locCity.trim();

      const res = await axiosInstance.put(
        `/chat/conversations/${activeConversation._id}/location`,
        payload,
      );
      const updatedConv =
        res.data?.conversation || res.data?.data?.conversation;
      if (updatedConv) {
        setActiveConversation(updatedConv);
        setConversations((prev) =>
          prev.map((c) => (c._id === updatedConv._id ? updatedConv : c)),
        );
      }
      setShowLocationPicker(false);
    } catch {
      // Handled silently
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const getConversationPreview = (conv) => {
    if (conv.title && conv.title !== "New Conversation") return conv.title;
    return "New Conversation";
  };

  const getConvLocationLabel = (conv) => {
    const loc = conv?.location;
    if (!loc) return null;
    const parts = [loc.city, loc.district, loc.state].filter(
      (p) => p && p !== "All",
    );
    if (parts.length === 0) return null;
    return parts.join(", ");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded
            ? "max-w-6xl h-[94vh]"
            : "max-w-5xl h-[90vh] max-h-[720px]"
        }`}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all mr-1"
                title="Show conversation list"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner text-white">
              <Bot className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-white text-sm sm:text-base">
                  Bharat Swasthya AI Tele-Health
                </h3>
                <span className="flex items-center gap-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                  Voice + Multilingual
                </span>
              </div>
              <div className="flex items-center gap-1 text-teal-100/80 text-xs mt-0.5">
                <MapPin className="w-3 h-3 text-teal-300" />
                {activeConversation ? (
                  <button
                    onClick={handleOpenLocationPicker}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    title="Change location for this conversation"
                  >
                    <span>
                      <strong className="text-white">
                        {getConvLocationLabel(activeConversation) ||
                          `${locationContext.district}, ${locationContext.state}`}
                      </strong>
                    </span>
                    <Pencil className="w-2.5 h-2.5 text-teal-300" />
                  </button>
                ) : (
                  <span>
                    Regional Context:{" "}
                    <strong className="text-white">
                      {locationContext.district}, {locationContext.state}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-100 hover:text-white transition-all"
              title={isExpanded ? "Restore size" : "Expand size"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-100 hover:text-white transition-all"
              title="Close Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader Toolbar: Language Picker & Region Status */}
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
            <span className="hidden sm:inline-block text-[10px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded font-mono">
              Sarvam AI STT
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto text-xs text-slate-500">
            <span className="hidden md:inline text-[11px]">
              Active in <strong>{locationContext.district || "Pune"}</strong>
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className={`${
              showSidebar ? "w-72" : "w-0"
            } transition-all duration-300 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden shrink-0`}
          >
            <div className="p-3 border-b border-slate-200">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
              >
                <MessageSquarePlus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="mt-1">Start a new chat</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`group w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                      activeConversation?._id === conv._id
                        ? "bg-teal-100 text-teal-800 border border-teal-200"
                        : "hover:bg-slate-100 text-slate-700 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        <span className="truncate">
                          {getConversationPreview(conv)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv._id, e)}
                        className={`shrink-0 p-1 rounded-lg transition-all ${
                          deleteConfirmId === conv._id
                            ? "bg-red-100 text-red-600"
                            : "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title={
                          deleteConfirmId === conv._id
                            ? "Click again to confirm delete"
                            : "Delete conversation"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-5">
                      <span className="text-[10px] text-slate-400">
                        {new Date(conv.updatedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {getConvLocationLabel(conv) && (
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                          <MapPin className="w-2 h-2" />
                          {getConvLocationLabel(conv)}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50"
            >
              {isLoadingMessages && messages.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              )}

              {!isLoadingMessages && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-100 to-emerald-50 border border-teal-200 flex items-center justify-center mb-4 text-teal-700 shadow-sm">
                    <Bot className="w-8 h-8 text-teal-600" />
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-lg mb-1.5">
                    नमस्ते! How can I assist with your health?
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                    Speak using the microphone or type below in Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu, English, or any Indian language. Triage is localized to{" "}
                    <strong>
                      {locationContext.district}, {locationContext.state}
                    </strong>
                    .
                  </p>

                  {/* Quick Prompts */}
                  <div className="w-full pt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                      Suggested Health Questions / अक्सर पूछे जाने वाले सवाल
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {QUICK_PROMPTS.map((item, idx) => (
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
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Bot className="w-4 h-4 text-teal-700" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-teal-600 text-white rounded-tr-none shadow-sm"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <div className="whitespace-pre-line leading-relaxed font-medium">
                        {msg.text}
                      </div>
                    ) : (
                      <div>
                        <MarkdownRenderer
                          content={msg.text}
                          className="text-slate-800"
                        />

                        {/* Bot message footer: timestamp & copy */}
                        <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                          <span className="font-mono text-[10px]">
                            {msg.timestamp}
                          </span>

                          <div className="flex items-center gap-2">
                            {msg.source && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                {msg.source === "python_chatbot"
                                  ? "AI Chatbot"
                                  : msg.source === "gemini_ai"
                                  ? "Gemini Medical AI"
                                  : "Health Engine"}
                              </span>
                            )}

                            <button
                              onClick={() => copyToClipboard(msg.text, msg.id)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1 text-[11px]"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 font-medium">Copied</span>
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

                    {msg.sender === "user" && (
                      <div className="text-[10px] mt-2 font-mono text-teal-100 text-right">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

              {/* Transcribing Indicator */}
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

              {/* Thinking Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 flex items-center gap-2.5 text-slate-700 text-xs shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.3s]" />
                    </div>
                    <span className="font-semibold text-teal-900 tracking-wide text-xs">
                      Consulting health intelligence...
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
                    <span>Listening... Speak your symptoms in your language</span>
                    <span className="font-mono bg-white/20 px-2 py-0.5 rounded-md text-xs">
                      {formatTimer(recordingSeconds)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={stopRecording}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Done Speaking</span>
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border border-slate-300 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                {/* Voice Record Mic Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading || isTranscribing}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer ${
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title={isRecording ? "Stop recording" : "Voice input (Sarvam AI STT - Multilingual)"}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <textarea
                  rows="1"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Speak or type symptoms in ${locationContext.district}... / लक्षण बताएं...`}
                  className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-2 py-2 outline-none resize-none max-h-24"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading || isTranscribing}
                  className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1 flex-wrap gap-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Preliminary AI Triage only. Consult doctor for diagnosis.
                </span>
                <button
                  onClick={onOpenEmergency}
                  className="text-rose-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3" /> Emergency Call (108)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 mx-4">
            <h3 className="font-display font-bold text-slate-900 text-base mb-1">
              Update Conversation Location
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              The AI will use this location for disease context in this chat.
            </p>

            <div className="space-y-3">
              <LocationDropdowns
                state={locState}
                district={locDistrict}
                city={locCity}
                onChange={({ state, district, city }) => {
                  setLocState(state);
                  setLocDistrict(district);
                  setLocCity(city);
                }}
                layout="vertical"
                theme="teal"
                stateLabel="State"
                districtLabel="District"
                cityLabel="City / Village / Area"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setShowLocationPicker(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocation}
                disabled={isUpdatingLocation}
                className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {isUpdatingLocation ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                ) : (
                  "Save Location"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatbotModal;
