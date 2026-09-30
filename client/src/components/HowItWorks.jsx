import React from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  FilePlus,
  Truck,
  RefreshCw,
  CheckCircle2,
  Workflow
} from "lucide-react";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      step: "01",
      title: t("step1Title"),
      desc: t("step1Desc"),
      icon: FilePlus,
      color: "from-blue-500 to-indigo-500",
    },
    {
      step: "02",
      title: t("step2Title"),
      desc: t("step2Desc"),
      icon: Truck,
      color: "from-indigo-500 to-purple-500",
    },
    {
      step: "03",
      title: t("step3Title"),
      desc: t("step3Desc"),
      icon: RefreshCw,
      color: "from-purple-500 to-pink-500",
    },
    {
      step: "04",
      title: t("step4Title"),
      desc: t("step4Desc"),
      icon: CheckCircle2,
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 relative overflow-hidden bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60 transition-colors"
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Workflow className="w-3.5 h-3.5" />
            <span>Quy trình hoạt động</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("howTitle")}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            {t("howSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group relative p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xs shadow-md">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
