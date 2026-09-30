import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Wallet,
  ShieldCheck,
  Flame,
  FileText,
  Rocket,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const TutorialModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const hasSeen = localStorage.getItem("hasSeenTutorial");
    if (!hasSeen) {
      localStorage.setItem("hasSeenTutorial", "true");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    {
      title: t("tutStep1Title") || "Kết nối Ví Web3",
      content: t("tutStep1Content") || "Sử dụng MetaMask, Trust Wallet hoặc OKX Wallet để đăng nhập an toàn.",
      icon: Wallet,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      title: t("tutStep2Title") || "Ký quỹ An toàn",
      content: t("tutStep2Content") || "Tiền của bạn được khóa trong Smart Contract phi tập trung cho tới khi đơn hàng giao thành công.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      title: t("tutStep3Title") || "Tự động Phạt vi phạm",
      content: t("tutStep3Content") || "Nếu người vận chuyển giao hàng trễ hạn đã cam kết, hợp đồng tự động khấu trừ tiền phạt.",
      icon: Flame,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      title: t("tutStep4Title") || "Lưu trữ Bằng chứng IPFS",
      content: t("tutStep4Content") || "Hợp đồng scan và ảnh giao nhận được lưu vĩnh viễn trên mạng lưu trữ phân tán IPFS.",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      title: t("tutStep5Title") || "Sẵn sàng Bắt đầu!",
      content: t("tutStep5Content") || "Tạo ngay hợp đồng đầu tiên để trải nghiệm công nghệ Escrow hiện đại nhất.",
      icon: Rocket,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/40",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-scale-in border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div
              className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 transition-all duration-300 ${steps[currentStep].bg} ${steps[currentStep].color}`}
            >
              <StepIcon className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {steps[currentStep].title}
            </h2>
          </div>

          <div className="min-h-[90px] text-slate-600 dark:text-slate-300 text-center text-sm leading-relaxed mb-6 whitespace-pre-line">
            {steps[currentStep].content}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-blue-600 dark:bg-blue-400"
                    : "w-2 bg-slate-200 dark:bg-slate-700"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1 ${
                currentStep === 0
                  ? "opacity-30 cursor-not-allowed text-slate-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? "Hoàn tất" : "Tiếp theo"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
