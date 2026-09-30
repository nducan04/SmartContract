import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import { useWeb3 } from "../context/Web3Context";
import {
  Sparkles,
  Send,
  Maximize2,
  Minimize2,
  X,
  MessageSquare,
  Bot,
  User
} from "lucide-react";

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { t } = useLanguage();
  const { walletAddress } = useWeb3();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: t("chatWelcome") }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const history = newMessages
        .filter((m, i) => !(i === 0 && m.role === "assistant"))
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.content,
        }));

      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        walletAddress: walletAddress || null,
        history: history.slice(0, -1),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      const serverErrorMessage = error.response?.data?.error;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: serverErrorMessage || t("chatError"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer group ${
          isOpen ? "rotate-90" : ""
        }`}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform" />
        ) : (
          <div className="relative">
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      <div
        className={`fixed bottom-24 right-6 z-40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 origin-bottom-right flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 ${
          isExpanded
            ? "w-[95vw] sm:w-[650px] max-w-[700px] h-[80vh]"
            : "w-[92vw] sm:w-[420px] max-h-[600px] h-[550px]"
        } ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-90 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                  {t("chatTitle") || "Trợ lý AI Smart Contract"}
                </h3>
              </div>
              <p className="text-white/80 text-[11px] mt-0.5">
                {t("chatSubtitle") || "Hỗ trợ 24/7 kiến thức Blockchain & Hợp đồng"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? "Thu nhỏ" : "Phóng to"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-xs font-medium"
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start justify-start">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mr-2.5 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-2xl rounded-tl-xs text-xs flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                <span className="text-[11px] text-slate-400 ml-1">AI đang suy nghĩ...</span>
              </div>
            </div>
          )}

          {/* Quick suggestions */}
          {showSuggestions && !isLoading && (
            <div className="flex flex-wrap gap-2 pt-2">
              {[t("chatSuggest1"), t("chatSuggest2"), t("chatSuggest3")].map(
                (suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-750 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 transition-all cursor-pointer font-medium shadow-xs"
                  >
                    💡 {suggestion}
                  </button>
                ),
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="border-t border-slate-200/80 dark:border-slate-800 p-3 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chatPlaceholder") || "Hỏi về hợp đồng hoặc blockchain..."}
              disabled={isLoading}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 placeholder:text-slate-400 font-medium"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
            <span>Google Gemini AI</span>
            <span>Ethereum Sepolia Network</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatWidget;
