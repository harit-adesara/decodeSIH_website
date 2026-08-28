import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
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
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import MarkdownRenderer from "./MarkdownRenderer";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
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

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const quickPrompts = [
    "High fever with joint pain & headache",
    "Dry cough, sore throat & breathlessness",
    "Watery diarrhea and vomiting remedies",
    "Active Dengue precautions in my area",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialPrompt && activeConversation) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt, activeConversation]);

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await axiosInstance.get("/chat/conversations");
      const convs = res.data?.conversations || res.data || [];
      setConversations(convs);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
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
      const data = res.data || {};
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
    } catch (err) {
      console.error("Failed to fetch messages:", err);
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
    } catch (err) {
      console.error("Failed to create conversation:", err);
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
      } catch (err) {
        console.error("Failed to delete conversation:", err);
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
      } catch (err) {
        console.error("Failed to create conversation:", err);
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

      const data = res.data || {};
      const botMessage = data.botMessage || data.data?.botMessage;

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
    setLocState(convLoc.state === "All" ? "" : convLoc.state || "");
    setLocDistrict(convLoc.district === "All" ? "" : convLoc.district || "");
    setLocCity(convLoc.city === "All" ? "" : convLoc.city || "");
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
    } catch (err) {
      console.error("Failed to update location:", err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-5xl h-[90vh] max-h-[700px] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-slate-900 text-base">
                  Bharat Swasthya AI Tele-Health
                </h3>
                <span className="flex items-center gap-1 bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  AI Ready
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                <MapPin className="w-3 h-3 text-teal-600" />
                {activeConversation ? (
                  <button
                    onClick={handleOpenLocationPicker}
                    className="flex items-center gap-1 hover:text-teal-700 transition-colors cursor-pointer"
                    title="Change location for this conversation"
                  >
                    <span>
                      <strong className="text-slate-800">
                        {getConvLocationLabel(activeConversation) ||
                          `${locationContext.district}, ${locationContext.state}`}
                      </strong>
                    </span>
                    <Pencil className="w-2.5 h-2.5 text-slate-400" />
                  </button>
                ) : (
                  <span>
                    Regional Context:{" "}
                    <strong className="text-slate-800">
                      {locationContext.district}, {locationContext.state}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all shadow-sm"
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
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-teal-100 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-teal-600" />
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-lg mb-2">
                    Namaste! How can I help you?
                  </h4>
                  <p className="text-slate-500 text-sm max-w-sm">
                    I am synchronized with active epidemiological surveillance
                    data for{" "}
                    <strong>
                      {locationContext.district}, {locationContext.state}
                    </strong>
                    . Describe symptoms or ask about outbreaks and home care.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-teal-700" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-teal-600 text-white rounded-tr-none shadow-sm"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <div className="whitespace-pre-line text-sm leading-relaxed">
                        {msg.text}
                      </div>
                    ) : (
                      <MarkdownRenderer
                        content={msg.text}
                        className="text-slate-800"
                      />
                    )}
                    <div
                      className={`text-[10px] mt-2.5 font-mono flex items-center justify-between ${
                        msg.sender === "user"
                          ? "text-teal-100"
                          : "text-slate-400"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.source && (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {msg.source === "python_chatbot"
                            ? "AI Chatbot"
                            : "Health Engine"}
                        </span>
                      )}
                    </div>
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}

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
                      thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 0 && (
              <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  Suggested:
                </span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 shrink-0 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border border-slate-300 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                <textarea
                  rows="1"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask about fever, symptoms, or outbreaks in ${locationContext.district}...`}
                  className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-3 py-2 outline-none resize-none max-h-24"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Preliminary AI Triage only. Consult doctor for diagnosis.
                </span>
                <button
                  onClick={onOpenEmergency}
                  className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
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
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  State
                </label>
                <select
                  value={locState}
                  onChange={(e) => setLocState(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  District
                </label>
                <input
                  type="text"
                  value={locDistrict}
                  onChange={(e) => setLocDistrict(e.target.value)}
                  placeholder="e.g. Pune"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  City / Village
                </label>
                <input
                  type="text"
                  value={locCity}
                  onChange={(e) => setLocCity(e.target.value)}
                  placeholder="e.g. Hadapsar"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
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
