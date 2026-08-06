import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import { useWeb3 } from "../context/Web3Context";

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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "assistant", content: t("chatWelcome") }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
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

      // Build history (exclude welcome message)
      const history = newMessages
        .filter((m, i) => !(i === 0 && m.role === "assistant"))
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.content,
        }));

      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        walletAddress: walletAddress || null,
        history: history.slice(0, -1), // exclude current message
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
      {/* Floating Mascot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 group ${
          isOpen
            ? "w-14 h-14 bg-gray-800"
            : "w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-0.5"
        }`}
        style={{
          boxShadow: isOpen
            ? "0 8px 30px rgba(0,0,0,0.3)"
            : "0 8px 32px rgba(79, 70, 229, 0.45)",
        }}
        title="Trợ lý AI Smart Contract"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <div className="w-full h-full rounded-full overflow-hidden relative bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <img
              src="/ai-mascot.png"
              alt="AI Mascot"
              className="w-full h-full object-cover rounded-full transform group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}
      </button>

      {/* Glowing Pulse effect when closed */}
      {!isOpen && (
        <span className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-indigo-500 animate-ping opacity-25 pointer-events-none" />
      )}

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isExpanded
            ? "w-[640px] max-w-[94vw] h-[80vh] max-h-[720px]"
            : "w-[440px] max-w-[94vw] h-[650px] max-h-[85vh]"
        } ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-0 opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full p-0.5 bg-white/30 backdrop-blur-md shadow-sm shrink-0">
              <img
                src="/ai-mascot.png"
                alt="AI Mascot"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-base leading-tight">
                  {t("chatTitle")}
                </h3>
              </div>
              <p className="text-white/80 text-xs mt-0.5">
                {t("chatSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand / Minimize Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title={isExpanded ? "Thu nhỏ cửa sổ" : "Phóng to cửa sổ"}
            >
              {isExpanded ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9L4 4m0 0l5 0m-5 0l0 5m11 5l5 5m0 0l-5 0m5 0l0-5"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 3h6m0 0v6m0-6L14 10M9 21H3m0 0v-6m0 6l7-7"
                  />
                </svg>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Đóng"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className={`flex-1 overflow-y-auto px-5 py-4 space-y-4 ${
            isExpanded
              ? "max-h-[calc(80vh-140px)] min-h-[400px]"
              : "max-h-[460px] min-h-[320px]"
          }`}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mr-3 mt-1 shadow-sm border border-indigo-100">
                  <img
                    src="/ai-mascot.png"
                    alt="AI Mascot"
                    className="w-full h-full object-cover bg-white"
                  />
                </div>
              )}

              <div
                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md font-medium"
                    : "bg-gray-100/90 text-gray-800 rounded-tl-xs shadow-xs border border-gray-200/50"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mr-3 mt-1 shadow-sm border border-indigo-100">
                <img
                  src="/ai-mascot.png"
                  alt="AI Mascot"
                  className="w-full h-full object-cover bg-white"
                />
              </div>
              <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded-2xl rounded-tl-xs text-sm flex items-center gap-2 border border-gray-200/50">
                <span
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
                <span className="ml-1 text-xs text-gray-500 font-medium">
                  {t("chatThinking")}
                </span>
              </div>
            </div>
          )}

          {/* Quick Suggestions */}
          {showSuggestions && !isLoading && (
            <div className="flex flex-wrap gap-2 pt-2">
              {[t("chatSuggest1"), t("chatSuggest2"), t("chatSuggest3")].map(
                (suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-200/80 transition-all cursor-pointer font-medium shadow-xs hover:shadow-sm"
                  >
                    💡 {suggestion}
                  </button>
                ),
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200/60 px-5 py-3.5 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chatPlaceholder")}
              disabled={isLoading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-50 placeholder:text-gray-400 font-medium"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-11 h-11 rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 active:scale-95 shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-gray-400">
            <span>Powered by Google Gemini AI</span>
            <span>Sepolia Smart Contract Assistant</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatWidget;
