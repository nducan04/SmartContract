import React, { useState, useRef, useEffect, useCallback } from "react";
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
  User,
  RotateCcw,
  Move
} from "lucide-react";
import animeAvatar from "../assets/anime-ai-avatar.jpg";

const GREETINGS = [
  "✨ Chào bạn! Cần em hỗ trợ gì không?",
  "💬 Hỏi em về Smart Contract & Ký quỹ nhé!",
  "🚀 Em hỗ trợ 24/7 kiến thức Blockchain nè!",
  "💡 Bạn có thể kéo thả em đi khắp màn hình đó!",
];

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

  // --- TRẠNG THÁI DI CHUYỂN & BONG BÓNG THOẠI ---
  const [position, setPosition] = useState({ x: 0, y: 0 }); // offset so với góc ban đầu
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initPosX: 0, initPosY: 0, moved: false });
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [showSpeech, setShowSpeech] = useState(true);

  // Tự động xoay vòng câu chào
  useEffect(() => {
    if (isOpen) {
      setShowSpeech(false);
      return;
    }
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
      setShowSpeech(true);
    }, 9000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Xử lý kéo thả Mascot (chuột & cảm ứng)
  const handlePointerDown = (e) => {
    // Không drag nếu click vào nút con (ví dụ nút đóng hoặc nút reset)
    if (e.target.closest("button[data-no-drag]")) return;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initPosX: position.x,
      initPosY: position.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 5) {
        dragRef.current.moved = true;
      }

      // Giới hạn trong khung nhìn màn hình
      const maxLeft = -(window.innerWidth - 90);
      const maxTop = -(window.innerHeight - 90);

      const nextX = Math.min(20, Math.max(maxLeft, dragRef.current.initPosX + deltaX));
      const nextY = Math.min(20, Math.max(maxTop, dragRef.current.initPosY + deltaY));

      setPosition({ x: nextX, y: nextY });
      if (Math.hypot(nextX, nextY) > 20) {
        setHasMoved(true);
      }
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Nếu không kéo hoặc kéo < 5px thì tính là CLICK -> Mở/đóng chat
    if (!dragRef.current.moved) {
      setIsOpen((prev) => !prev);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerUp);
      window.addEventListener("touchmove", handlePointerMove);
      window.addEventListener("touchend", handlePointerUp);
    }
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const resetPosition = (e) => {
    e.stopPropagation();
    setPosition({ x: 0, y: 0 });
    setHasMoved(false);
  };

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
      {/* KHU VỰC MASCOT DI CHUYỂN SỐNG ĐỘNG */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: "none",
        }}
        className={`fixed bottom-6 right-6 z-40 transition-transform ${
          isDragging ? "duration-0" : "duration-200"
        }`}
      >
        {/* Bong bóng thoại tương tác dễ thương */}
        {!isOpen && showSpeech && (
          <div
            onClick={() => setIsOpen(true)}
            className="absolute -top-14 right-0 sm:right-2 w-max max-w-[240px] px-3 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 text-xs font-semibold shadow-xl border border-blue-200/80 dark:border-blue-900/60 animate-bubble-pop cursor-pointer hover:scale-105 transition-all select-none group"
          >
            <div className="flex items-center gap-1.5">
              <span>{GREETINGS[greetingIndex]}</span>
              <button
                data-no-drag="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeech(false);
                }}
                className="opacity-40 hover:opacity-100 text-slate-500 hover:text-rose-500 p-0.5 rounded-full transition-opacity ml-1"
                title="Đóng bong bóng"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            {/* Mũi tên bong bóng chỉ xuống mascot */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-blue-200/80 dark:border-blue-900/60 rotate-45"></div>
          </div>
        )}

        {/* Nút Reset vị trí nếu đã kéo đi */}
        {hasMoved && !isOpen && (
          <button
            data-no-drag="true"
            onClick={resetPosition}
            className="absolute -top-3 -left-3 z-50 p-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 shadow-md border border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Đưa mascot về góc ban đầu"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}

        {/* NÚT MASCOT CHÍNH: Lơ lửng, Vòng xoay Cyber Orbit, Avatar Anime */}
        <div
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          className={`relative group ${
            isDragging ? "cursor-grabbing scale-105" : "cursor-grab"
          }`}
          title="Bấm để trò chuyện hoặc Giữ chuột để kéo thả di chuyển"
        >
          {/* Lớp 1: Hào quang năng lượng tỏa sáng (Aura Glow) */}
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 blur-md group-hover:blur-lg opacity-80 group-hover:opacity-100 transition-all duration-300 pointer-events-none animate-pulse"></div>

          {/* Lớp 2: Vòng quỹ đạo công nghệ quay tròn (Cyber Holographic Orbit) */}
          {!isOpen && (
            <div className="absolute -inset-2 rounded-full border border-dashed border-cyan-400/60 dark:border-cyan-300/50 animate-spin-slow pointer-events-none">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
            </div>
          )}

          {/* Lớp 3: Nút Avatar Mascot lơ lửng nhịp nhàng (Breathing & Floating) */}
          <div
            className={`w-15 h-15 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-2xl shadow-indigo-500/40 ring-2 ring-white/80 dark:ring-slate-800 transition-transform duration-300 ${
              !isOpen && !isDragging ? "animate-mascot-float" : ""
            } group-hover:scale-105 active:scale-95`}
          >
            {isOpen ? (
              <div className="w-full h-full rounded-full bg-slate-900/90 backdrop-blur-xs flex items-center justify-center text-white">
                <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
              </div>
            ) : (
              <div className="relative w-full h-full rounded-full overflow-hidden select-none">
                <img
                  src={animeAvatar}
                  alt="AI Assistant Anime Mascot"
                  draggable={false}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 pointer-events-none select-none"
                />

                {/* Đèn tín hiệu trực tuyến Neon (Online Signal Ripple) */}
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 flex items-center justify-center pointer-events-none">
                  <span className="absolute w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900"></span>
                </div>
              </div>
            )}
          </div>

          {/* Huy hiệu di chuyển nhỏ khi hover */}
          {!isOpen && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full backdrop-blur-xs pointer-events-none flex items-center gap-0.5 whitespace-nowrap shadow-xs">
              <Move className="w-2.5 h-2.5" />
              <span>Kéo thả</span>
            </div>
          )}
        </div>
      </div>

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
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50 shadow-sm shrink-0 bg-white/20">
              <img
                src={animeAvatar}
                alt="AI Assistant"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                  {t("chatTitle") || "Trợ lý AI Smart Contract"}
                </h3>
                <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-semibold px-2 py-0.5 rounded-full border border-white/20">
                  Online
                </span>
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
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-blue-300 dark:ring-blue-600 shrink-0 mr-2.5 mt-0.5 shadow-xs">
                  <img
                    src={animeAvatar}
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
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
              <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-blue-300 dark:ring-blue-600 shrink-0 mr-2.5 mt-0.5 shadow-xs">
                <img
                  src={animeAvatar}
                  alt="AI Assistant"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-2xl rounded-tl-xs text-xs flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                <span className="text-[11px] text-slate-400 ml-1">
                  {t("chatThinking") || "AI đang suy nghĩ..."}
                </span>
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
