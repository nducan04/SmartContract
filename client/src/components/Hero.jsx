import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import TutorialModal from "./TutorialModal";
import { useLanguage } from "../context/LanguageContext";

const Hero = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="relative bg-white dark:bg-gray-950 overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-32 transition-colors">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-purple-50 dark:bg-purple-950/20 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/4"></div>

      <div className="container mx-auto px-6 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content Bên Trái */}
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
              {t("heroBadge")}
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              {t("heroTitleLine1")} <br />
              <span className="gradient-text-wide">
                {t("heroTitleLine2")}
              </span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("heroDesc")}
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2"
              >
                <i className="uil uil-rocket"></i> {t("heroBtnStart")}
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-bold rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50"
              >
                <i className="uil uil-play-circle text-lg"></i> {t("heroBtnGuide")}
              </button>
            </div>

            {/* Stats nhỏ */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">100%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t("heroStatSecurity")}</p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0s</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {t("heroStatLatency")}
                </p>
              </div>
            </div>
          </div>

          {/* Hình ảnh Bên Phải */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 animate-float">
              {" "}
              {/* Hiệu ứng bay nhẹ */}
              <img
                src={assets.hero_img || assets.characterImg} // Ưu tiên ảnh Hero nếu có
                alt="Blockchain Dashboard"
                className="w-full max-w-lg mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Vòng tròn trang trí sau lưng ảnh */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full opacity-60 blur-2xl -z-10"></div>
          </div>
        </div>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </section>
  );
};

export default Hero;
