import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assets, ownerMenuLinks } from "./../assets/assets";
import { useWeb3 } from "../context/Web3Context";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const location = useLocation();
  const { walletAddress } = useWeb3();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // 1. Kiểm tra Admin y hệt Navbar cũ
  const ADMIN_WALLETS = import.meta.env.VITE_ADMIN_WALLETS
    ? import.meta.env.VITE_ADMIN_WALLETS.split(",").map((addr) =>
      addr.trim().toLowerCase(),
    )
    : [];
  const isAdmin =
    walletAddress && ADMIN_WALLETS.includes(walletAddress.toLowerCase());

  const getMenuLabel = (path) => {
    switch (path) {
      case "/dashboard":
        return t("sideOverview");
      case "/dashboard/contracts":
        return t("sideContracts");
      case "/dashboard/marketplace":
        return t("sideMarketplace");
      case "/dashboard/create":
        return t("sideCreate");
      default:
        return "";
    }
  };

  return (
    <>
      {/* 1. BACKDROP (Lớp phủ đen mờ trên mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobileMenu}
      ></div>

      {/* 2. SIDEBAR (Luôn Fixed) */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-100 flex flex-col 
          shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out print:hidden
          
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          
          md:translate-x-0
        `}
      >
        {/* LOGO AREA */}
        <div className="h-20 flex items-center justify-between px-6 md:px-8 border-b border-gray-50 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src={assets.blockchainLogo} alt="Logo" className="h-8 md:h-10 shrink-0" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-all cursor-pointer shadow-xs active:scale-95"
              title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            >
              <span>{language === "vi" ? "🇻🇳" : "🇬🇧"}</span>
              <span>{language === "vi" ? "VI" : "EN"}</span>
            </button>
            <button
              onClick={closeMobileMenu}
              className="md:hidden p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors shrink-0"
            >
              <i className="uil uil-multiply text-2xl"></i>
            </button>
          </div>
        </div>

        {/* MENU AREA */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {ownerMenuLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/dashboard"}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium"
                }`
              }
            >
              <div
                className={`w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110
                ${
                  location.pathname === link.path
                    ? ""
                    : "opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                }`}
              >
                <img
                  src={link.coloredIcon || link.icon}
                  alt={link.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="whitespace-nowrap text-sm tracking-wide">
                {getMenuLabel(link.path) || link.name}
              </span>
              {location.pathname === link.path && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full shadow-lg shadow-blue-300"></div>
              )}
            </NavLink>
          ))}

          {/* CHỈ HIỆN MENU ADMIN NẾU ĐÚNG VÍ */}
          {isAdmin && (
            <NavLink
              to="/dashboard/admin"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 mt-4
                ${
                  isActive
                    ? "bg-red-50 text-red-700 font-bold shadow-sm border border-red-100"
                    : "text-gray-500 hover:bg-red-50 hover:text-red-700 font-medium"
                }`
              }
            >
              <div
                className={`w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110
                ${
                  location.pathname === "/dashboard/admin"
                    ? ""
                    : "opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 text-red-500"
                }`}
              >
                <i className="uil uil-shield-check text-2xl"></i>
              </div>
              <span className="whitespace-nowrap text-sm tracking-wide">
                {t("sideAdmin")}
              </span>
              {location.pathname === "/dashboard/admin" && (
                <div className="ml-auto w-2 h-2 bg-red-600 rounded-full shadow-lg shadow-red-300"></div>
              )}
            </NavLink>
          )}
        </nav>

        {/* FOOTER AREA */}
        <div className="p-4 border-t border-gray-50 mt-auto shrink-0 space-y-3">
          {/* Nút Đổi Ngôn Ngữ - Segmented Toggle Switch */}
          <div
            onClick={toggleLanguage}
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 cursor-pointer select-none transition-all hover:border-blue-300 shadow-xs"
            title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <div className="flex items-center gap-1.5 pl-1 text-gray-600 text-xs font-semibold">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Ngôn ngữ / Lang</span>
            </div>
            <div className="flex items-center text-xs font-bold bg-gray-200/60 p-0.5 rounded-lg">
              <span
                className={`px-2 py-0.5 rounded-md transition-all duration-200 ${
                  language === "vi"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                VIE
              </span>
              <span
                className={`px-2 py-0.5 rounded-md transition-all duration-200 ${
                  language === "en"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                ENG
              </span>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div
            onClick={toggleTheme}
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700/80 cursor-pointer select-none transition-all hover:border-blue-300 shadow-xs active:scale-[0.98]"
            title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          >
            <div className="flex items-center gap-1.5 pl-1 text-gray-600 dark:text-gray-300 text-xs font-semibold">
              <i className={`uil ${theme === "dark" ? "uil-sun text-yellow-400" : "uil-moon"} text-lg`}></i>
              <span>{theme === "dark" ? "Sáng" : "Tối"}</span>
            </div>
            <div className="flex items-center text-xs font-bold bg-gray-200 dark:bg-gray-600 p-0.5 rounded-lg transition-all">
              <span
                className={`px-2 py-0.5 rounded-md transition-all duration-200 ${
                  theme === "light"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                ☀️
              </span>
              <span
                className={`px-2 py-0.5 rounded-md transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                🌙
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="uil uil-user"></i>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-700">{t("sideAccount")}</p>
              <p className="text-10px text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                {t("sideOnline")}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
