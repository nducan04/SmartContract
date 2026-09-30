import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assets } from "./../assets/assets";
import { useWeb3 } from "../context/Web3Context";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  PlusCircle,
  ShieldCheck,
  X,
  Sun,
  Moon,
  User,
  ExternalLink,
  ChevronRight,
  Globe
} from "lucide-react";

const MENU_ICONS = {
  "/dashboard": LayoutDashboard,
  "/dashboard/contracts": FileText,
  "/dashboard/marketplace": ShoppingBag,
  "/dashboard/create": PlusCircle,
  "/dashboard/admin": ShieldCheck,
};

const NAV_ITEMS = [
  { path: "/dashboard", key: "sideOverview", defaultLabel: "Tổng quan" },
  { path: "/dashboard/contracts", key: "sideContracts", defaultLabel: "Hợp đồng" },
  { path: "/dashboard/marketplace", key: "sideMarketplace", defaultLabel: "Thị trường" },
  { path: "/dashboard/create", key: "sideCreate", defaultLabel: "Tạo mới" },
];

const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const location = useLocation();
  const { walletAddress } = useWeb3();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const ADMIN_WALLETS = import.meta.env.VITE_ADMIN_WALLETS
    ? import.meta.env.VITE_ADMIN_WALLETS.split(",").map((addr) =>
      addr.trim().toLowerCase(),
    )
    : [];
  const isAdmin =
    walletAddress && ADMIN_WALLETS.includes(walletAddress.toLowerCase());

  return (
    <>
      {/* 1. BACKDROP trên Mobile */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobileMenu}
      ></div>

      {/* 2. SIDEBAR ASIDE */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col 
          shadow-xl md:shadow-none transition-transform duration-300 ease-in-out print:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* LOGO AREA */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-slate-800 border border-blue-500/20 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={assets.iconLogo}
                alt="Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
                Smart<span className="text-blue-600 dark:text-blue-400">Contract</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                Dashboard
              </span>
            </div>
          </Link>

          <button
            onClick={closeMobileMenu}
            className="md:hidden p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Điều hướng chính
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = MENU_ICONS[item.path] || LayoutDashboard;
            const isExactActive =
              item.path === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span className="truncate">{t(item.key) || item.defaultLabel}</span>

                {isExactActive ? (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-75" />
                ) : null}
              </NavLink>
            );
          })}

          {/* ADMIN MENU (NẾU ĐƯỢC CẤP QUYỀN) */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="px-3 pb-2 text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
                Quản trị viên
              </div>
              <NavLink
                to="/dashboard/admin"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${
                    isActive
                      ? "bg-rose-600 text-white shadow-md shadow-rose-500/25"
                      : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  }`
                }
              >
                <ShieldCheck className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                <span>{t("sideAdmin") || "Admin Panel"}</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* FOOTER ACTIONS AREA */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto shrink-0 space-y-2.5">
          {/* Controls row: Language & Theme */}
          <div className="grid grid-cols-2 gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === "vi" ? "Tiếng Việt" : "English"}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200/60 dark:border-slate-700/60"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tối</span>
                </>
              )}
            </button>
          </div>

          {/* User Account / Network Badge Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : t("sideAccount") || "Chưa kết nối ví"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${walletAddress ? "bg-emerald-400" : "bg-slate-400"}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${walletAddress ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {walletAddress ? "Web3 Online" : "Khách"}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
              title="Về trang chủ"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
