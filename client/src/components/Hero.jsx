import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import TutorialModal from "./TutorialModal";
import { useLanguage } from "../context/LanguageContext";
import {
  Rocket,
  PlayCircle,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Layers,
  CheckCircle2
} from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-24 lg:pb-36 transition-colors">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 -z-10 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 -z-10 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content Bên Trái */}
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400"></span>
              </span>
              <span>{t("heroBadge") || "Hợp đồng thông minh Ethereum"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              {t("heroTitleLine1")} <br />
              <span className="gradient-text-wide">
                {t("heroTitleLine2")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("heroDesc")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base"
              >
                <Rocket className="w-5 h-5" />
                <span>{t("heroBtnStart")}</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
              </button>

              <button
                onClick={() => setShowTutorial(true)}
                className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base"
              >
                <PlayCircle className="w-5 h-5 text-blue-500" />
                <span>{t("heroBtnGuide")}</span>
              </button>
            </div>

            {/* Mini Trust Metrics */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t("heroStatSecurity")}
                  </p>
                </div>
              </div>

              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">0s</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t("heroStatLatency")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hình ảnh Bên Phải */}
          <div className="lg:w-1/2 relative flex justify-center">
            <div className="relative z-10 animate-float w-full max-w-lg">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 sm:p-6">
                <img
                  src={assets.hero_img || assets.characterImg}
                  alt="Blockchain Smart Contract Dashboard"
                  className="w-full h-auto drop-shadow-xl rounded-2xl object-cover"
                />

                {/* Floating micro-badge overlay */}
                <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Escrow Verified
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      Auto Release Funds
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vòng tròn gradient blur phía sau */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-tr from-blue-400/20 via-purple-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
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
