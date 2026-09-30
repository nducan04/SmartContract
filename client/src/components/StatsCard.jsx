import React from "react";
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
  const colorStyles = {
    blue: {
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50",
      glow: "hover:border-blue-400/50 dark:hover:border-blue-500/30",
      accent: "from-blue-600 to-indigo-600",
    },
    green: {
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50",
      glow: "hover:border-emerald-400/50 dark:hover:border-emerald-500/30",
      accent: "from-emerald-600 to-teal-600",
    },
    purple: {
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50",
      glow: "hover:border-purple-400/50 dark:hover:border-purple-500/30",
      accent: "from-purple-600 to-violet-600",
    },
    orange: {
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50",
      glow: "hover:border-amber-400/50 dark:hover:border-amber-500/30",
      accent: "from-amber-500 to-orange-600",
    },
    indigo: {
      bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50",
      glow: "hover:border-indigo-400/50 dark:hover:border-indigo-500/30",
      accent: "from-indigo-600 to-blue-600",
    },
    slate: {
      bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50",
      glow: "hover:border-slate-400/50 dark:hover:border-slate-600/30",
      accent: "from-slate-600 to-slate-800",
    },
  };

  const style = colorStyles[color] || colorStyles.blue;
  const LucideIcon = (typeof icon === "string" ? ICON_MAP[icon] : icon) || Activity;

  return (
    <div
      className={`
        group relative rounded-2xl p-5 sm:p-6 transition-all duration-300
        bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80
        shadow-sm hover:shadow-xl hover:-translate-y-1 ${style.glow}
        flex flex-col justify-between overflow-hidden
      `}
    >
      {/* Decorative gradient corner aura */}
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
            {value}
          </h4>
        </div>

        <div
          className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-xs ${style.bg}`}
        >
          {LucideIcon && typeof LucideIcon === "function" ? (
            <LucideIcon className="w-6 h-6" />
          ) : (
            <i className={`uil ${icon} text-2xl`}></i>
          )}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{subtitle || "Cập nhật realtime"}</span>
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
