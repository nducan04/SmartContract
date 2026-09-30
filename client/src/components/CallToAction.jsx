import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

const CallToAction = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStart = () => {
    navigate("/dashboard");
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-14 lg:p-16 text-white text-center shadow-2xl">
          {/* Ambient Glow Effects */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bắt đầu miễn phí ngay hôm nay</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight">
              {t("ctaTitle")}
            </h2>

            <p className="text-base sm:text-lg text-white/80 max-w-2xl mb-10 leading-relaxed">
              {t("ctaDesc")}
            </p>

            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-xl hover:bg-slate-100 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all text-base cursor-pointer"
            >
              <span>{t("ctaBtn")}</span>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
