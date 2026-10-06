import React from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
  Users,
  Layers,
  ArrowUpRight
} from "lucide-react";

const ICON_MAP = {
  "uil-file-contract-dollar": FileText,
  "uil-truck": Truck,
  "uil-check-circle": CheckCircle2,
  "uil-clock": Clock,
  "uil-shield-check": ShieldCheck,
  "uil-chart-line": Activity,
  "uil-users-alt": Users,
  "uil-layers": Layers,
};

const StatsCard = ({ title, value, icon, color = "blue", subtitle, trend }) => {
  const { t } = useLanguage();
  const colorStyles = {
    blue: {
      bg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-500/30",
      glow: "hover:border-blue-400/50 dark:hover:border-blue-500/40",
      accent: "from-blue-600 to-indigo-600",
    },
    green: {
      bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30",
      glow: "hover:border-emerald-400/50 dark:hover:border-emerald-500/40",
      accent: "from-emerald-600 to-teal-600",
    },
    purple: {
      bg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/30",
      glow: "hover:border-purple-400/50 dark:hover:border-purple-500/40",
      accent: "from-purple-600 to-violet-600",
    },
    orange: {
      bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30",
      glow: "hover:border-amber-400/50 dark:hover:border-amber-500/40",
      accent: "from-amber-500 to-orange-600",
    },
    indigo: {
      bg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/30",
      glow: "hover:border-indigo-400/50 dark:hover:border-indigo-500/40",
      accent: "from-indigo-600 to-blue-600",
    },
    slate: {
      bg: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60",
      glow: "hover:border-slate-400/50 dark:hover:border-slate-600/40",
      accent: "from-slate-600 to-slate-800",
    },
  };

  const style = colorStyles[color] || colorStyles.blue;
  const LucideIcon = (typeof icon === "string" ? ICON_MAP[icon] : icon) || Activity;

  return (
    <div
      className={`
        group relative rounded-2xl p-4 sm:p-5 transition-all duration-300
        bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800
        shadow-sm hover:shadow-xl hover:-translate-y-1 ${style.glow}
        flex flex-col justify-between overflow-hidden h-full min-h-[120px]
      `}
    >
      {/* Decorative gradient corner aura */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block min-h-[2.25rem] line-clamp-2 leading-snug">
            {title}
          </span>
          <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight leading-none">
            {value}
          </h4>
        </div>

        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-xs ${style.bg}`}
        >
          {LucideIcon && typeof LucideIcon === "function" ? (
            <LucideIcon className="w-5 h-5 shrink-0" />
          ) : (
            <i className={`uil ${icon} text-xl`}></i>
          )}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{subtitle || t("statRealtime")}</span>
          {trend && (
            <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
              <span>{trend}</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
