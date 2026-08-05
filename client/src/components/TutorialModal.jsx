import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

const TutorialModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  // Auto-show modal once if never seen before
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
      title: t("tutStep1Title"),
      content: t("tutStep1Content"),
      icon: "uil-wallet",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: t("tutStep2Title"),
      content: t("tutStep2Content"),
      icon: "uil-shield-check",
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: t("tutStep3Title"),
      content: t("tutStep3Content"),
      icon: "uil-fire",
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      title: t("tutStep4Title"),
      content: t("tutStep4Content"),
      icon: "uil-file-contract-dollar",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: t("tutStep5Title"),
      content: t("tutStep5Content"),
      icon: "uil-rocket",
      color: "text-purple-500",
      bg: "bg-purple-50",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-slide-up">
        {/* Nút Đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="uil uil-times text-xl"></i>
        </button>

        <div className="p-8">
          {/* Icon & Title */}
          <div className="text-center mb-6">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${steps[currentStep].bg} ${steps[currentStep].color}`}
            >
              <i className={`uil ${steps[currentStep].icon} text-4xl`}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {steps[currentStep].title}
            </h2>
          </div>

          {/* Nội dung */}
          <div className="min-h-[100px] text-gray-600 text-center leading-relaxed mb-8 whitespace-pre-line">
            {steps[currentStep].content}
          </div>

          {/* Dấu chấm điều hướng (Dots indicator) */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? "w-8 bg-blue-600" : "w-2 bg-gray-200"
                }`}
              ></div>
            ))}
          </div>

          {/* Nút hành động */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all
                ${
                  currentStep === 0
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
                }`}
            >
              {t("tutPrev")}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transition-all cursor-pointer"
            >
              {currentStep === steps.length - 1 ? t("tutFinish") : t("tutNext")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
