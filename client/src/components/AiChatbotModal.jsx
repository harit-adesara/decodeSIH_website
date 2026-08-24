import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Bot,
  Send,
  User,
  Sparkles,
  AlertTriangle,
  MapPin,
  RefreshCw,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export const AiChatbotModal = ({ isOpen, onClose, onOpenEmergency, initialPrompt = "" }) => {
  const { locationContext } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: `Namaste! 🙏 I am **Bharat Swasthya AI Medical Assistant**.\n\nI am synchronized with active epidemiological surveillance data for **${locationContext.district}, ${locationContext.state}**.\n\nHow can I help you today? You can describe symptoms or ask about contagious outbreaks and home care.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const quickPrompts = [
    "High fever with joint pain & headache",
    "Dry cough, sore throat & breathlessness",
    "Watery diarrhea and vomiting remedies",
    "Active Dengue precautions in my area",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newUserMessage = {
      id: userMsgId,
      sender: "user",
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/public/chatbot", {
        message: message,
        state: locationContext.state,
        district: locationContext.district,
        city: locationContext.city,
      });

      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: response.data?.reply || "I am currently analyzing healthcare records. Please check the recommendations provided.",
        source: response.data?.source,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "⚠️ I encountered an issue connecting to the AI diagnostic engine. For immediate emergency advice, please call **108** or National Health Helpline **1075**.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                  Gemini Ready
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                <MapPin className="w-3 h-3 text-teal-600" />
                <span>
                  Regional Context: <strong className="text-slate-800">{locationContext.district}, {locationContext.state}</strong>
                </span>
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

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
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
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-teal-600 text-white rounded-tr-none shadow-sm"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-line prose prose-sm">
                  {msg.text}
                </div>
                <div
                  className={`text-[10px] mt-2 font-mono flex items-center justify-between ${
                    msg.sender === "user" ? "text-teal-100" : "text-slate-400"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {msg.source === "gemini_ai" ? "Gemini AI" : "Health Engine"}
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
              <div className="bg-white rounded-2xl rounded-tl-none p-3 border border-slate-200 flex items-center gap-2 text-slate-500 text-xs shadow-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>Evaluating symptoms & cross-referencing {locationContext.district} disease records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">Suggested:</span>
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
  );
};

export default AiChatbotModal;
