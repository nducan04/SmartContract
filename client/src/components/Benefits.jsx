import React from "react";
import { assets } from "../assets/assets";
import { useLanguage } from "../context/LanguageContext";
import { ShieldCheck, Zap, Eye, Sparkles } from "lucide-react";

const Benefits = () => {
  const { t } = useLanguage();

  const benefitData = [
    {
      icon: Eye,
      img: assets.transparency,
      title: t("benefit1Title"),
      description: t("benefit1Desc"),
      gradient: "from-blue-500/10 to-cyan-500/10",
      accent: "text-blue-500",
    },
    {
      icon: Zap,
      img: assets.automaticMoney,
      title: t("benefit2Title"),
      description: t("benefit2Desc"),
      gradient: "from-purple-500/10 to-indigo-500/10",
      accent: "text-purple-500",
    },
    {
      icon: ShieldCheck,
      img: assets.security,
      title: t("benefit3Title"),
      description: t("benefit3Desc"),
      gradient: "from-emerald-500/10 to-teal-500/10",
      accent: "text-emerald-500",
    },
  ];

  return (
    <section id="benefits" className="py-20 lg:py-28 relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ưu thế vượt trội</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("benefitsTitle")}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            {t("benefitsSubtitle")}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefitData.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-slate-900/90 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Ambient glow in card corner */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`}></div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-8 h-8 object-contain"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <Icon className="w-4 h-4" />
                  <span>Chuẩn bảo mật Web3</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
