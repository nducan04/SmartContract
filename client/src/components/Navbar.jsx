import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets, menuLinks } from "../assets/assets";
import { useWeb3 } from "../context/Web3Context";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import Blockies from "./Blockies";
import AddressDisplay from "./AddressDisplay";
import ConnectWalletModal from "./ConnectWalletModal";
import EmailSettingsModal from "./EmailSettingsModal";
import axios from "axios";
import {
  Search,
  Sun,
  Moon,
  Wallet,
  LogOut,
  Mail,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Copy,
  Check
} from "lucide-react";

const Navbar = () => {
  const { walletAddress, walletBalance, connectWallet, disconnectWallet } =
    useWeb3();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [linkedEmail, setLinkedEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (walletAddress) {
      axios
        .get(`${backendUrl}/api/users/settings/${walletAddress}`)
        .then((res) => {
          if (res.data.email) {
            setLinkedEmail(res.data.email);
          } else {
            setLinkedEmail("");
          }
        })
        .catch(() => setLinkedEmail(""));
    } else {
      setLinkedEmail("");
    }
  }, [walletAddress, backendUrl, isEmailModalOpen]);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/dashboard/contract/${searchTerm.trim()}`);
      setSearchTerm("");
      setMobileMenuOpen(false);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 max-w-7xl mx-auto gap-4">
        {/* 1. LOGO */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-slate-800 border border-blue-500/20 shadow-xs group-hover:scale-105 transition-all">
            <img
              src={assets.iconLogo}
              alt="Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="font-black text-lg tracking-tight hidden sm:inline-block text-slate-900 dark:text-white">
            Smart<span className="text-blue-600 dark:text-blue-400">Contract</span>
          </span>
        </Link>

        {/* 2. DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
          {menuLinks.map((link, index) => {
            let label = link.name;
            if (link.path === "/") label = t("navHome");
            else if (link.path === "/tracking") label = t("navTracking");

            const isActive = location.pathname === link.path;

            return (
              <Link
                key={index}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                {label}
              </Link>
            );
          })}

          <Link
            to="/dashboard"
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              location.pathname.startsWith("/dashboard")
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t("navDashboard")}</span>
          </Link>
        </nav>

        {/* 3. SEARCH BAR (DESKTOP) */}
        <form
          onSubmit={handleSearch}
          className="hidden xl:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full px-3.5 py-1.5 text-xs w-44 focus-within:w-60 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-300"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder={t("navSearchPlaceholder")}
          />
        </form>

        {/* 4. ACTIONS: LANGUAGE, THEME & WALLET */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút Đổi Ngôn Ngữ */}
          <button
            onClick={toggleLanguage}
            className="flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all active:scale-95 shadow-xs cursor-pointer"
            title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <span
              className={`px-2 py-0.5 rounded-full transition-all duration-200 ${
                language === "vi"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              Vi
            </span>
            <span
              className={`px-2 py-0.5 rounded-full transition-all duration-200 ${
                language === "en"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-extrabold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              EN
            </span>
          </button>

          {/* Nút Chế độ tối */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-yellow-400 border border-slate-200/80 dark:border-slate-700/80 transition-all active:scale-95 shadow-xs"
            title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* WALLET BUTTON OR CONNECTED PILL */}
          {walletAddress ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 pl-3 pr-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs active:scale-95"
              >
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    {walletBalance} ETH
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </div>

                <div className="rounded-full overflow-hidden ring-2 ring-blue-500/50 w-7 h-7 shrink-0">
                  <Blockies
                    seed={walletAddress.toLowerCase()}
                    size={8}
                    scale={4}
                  />
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              </button>

              {/* DROPDOWN MENU */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-scale-in divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="rounded-xl overflow-hidden ring-2 ring-blue-500/40 w-11 h-11 shrink-0">
                      <Blockies
                        seed={walletAddress.toLowerCase()}
                        size={10}
                        scale={4}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Đã kết nối ví
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                        {walletBalance} ETH
                      </p>
                    </div>
                  </div>

                  {/* Wallet address & Copy */}
                  <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Địa chỉ ví</span>
                      <button
                        onClick={copyAddress}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      {walletAddress}
                    </p>
                  </div>

                  {/* Email & Settings */}
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setIsEmailModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                    >
                      <Mail className="w-4 h-4 text-blue-500" />
                      <div className="truncate">
                        <span>{linkedEmail ? "Email thông báo" : t("navEmailSettings")}</span>
                        {linkedEmail && (
                          <span className="block text-[11px] font-normal text-emerald-600 dark:text-emerald-400 truncate">
                            {linkedEmail}
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("navDisconnect")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>{t("navConnectWallet")}</span>
            </button>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-lg gradient-text">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mt-4">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-700">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("navSearchPlaceholder")}
                    className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </form>

              {/* Nav links */}
              <div className="mt-6 space-y-1">
                {menuLinks.map((link, index) => {
                  let label = link.name;
                  if (link.path === "/") label = t("navHome");
                  else if (link.path === "/tracking") label = t("navTracking");

                  return (
                    <Link
                      key={index}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {label}
                    </Link>
                  );
                })}

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-500" />
                  <span>{t("navDashboard")}</span>
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-center text-slate-400">
                Smart Contract Platform © 2026
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WALLET CONNECT MODAL */}
      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />

      {/* EMAIL SETTINGS MODAL */}
      <EmailSettingsModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        walletAddress={walletAddress}
      />
    </header>
  );
};

export default Navbar;
