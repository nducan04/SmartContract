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

  const isHome = location.pathname === "/";
  const navBgClass = isHome
    ? "glass border-b-0"
    : "glass border-b border-gray-100/50";

  return (
    <div
      className={`relative z-40 w-full border-b border-gray-100 transition-all ${navBgClass}`}
    >
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4">
        {/* 1. LOGO */}
        <Link to="/" className="shrink-0">
          <img
            src={assets.blockchainLogo}
            alt="Logo"
            className="h-8 hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* 2. MENU DESKTOP & SEARCH */}
        <div
          className={`
            fixed inset-0 z-50 bg-white flex flex-col p-10 gap-6 transition-transform duration-300
            items-start 
            md:static md:bg-transparent md:flex-row md:p-0 md:gap-8 md:items-center md:translate-x-0
            ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
        >
          {/* Nút đóng menu mobile */}
          <button
            className="md:hidden absolute top-5 right-5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img src={assets.close_icon} className="w-6" alt="close" />
          </button>

          {/* Links */}
          {menuLinks.map((link, index) => {
            let label = link.name;
            if (link.path === "/") label = t("navHome");
            else if (link.path === "/tracking") label = t("navTracking");
            return (
              <Link
                key={index}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 font-medium hover:text-blue-600 transition-colors text-lg md:text-base"
              >
                {label}
              </Link>
            );
          })}

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex w-full lg:w-auto items-center text-sm gap-2 border border-gray-300 px-4 py-2 lg:py-1 lg:px-3 rounded-xl lg:rounded-full max-w-full lg:max-w-56"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 text-base lg:text-sm"
              placeholder={t("navSearchPlaceholder")}
            />
            <button type="submit" className="shrink-0 p-1">
              <img
                src={assets.search_icon}
                alt="search"
                className="cursor-pointer hover:opacity-70 w-5 h-5 lg:w-4 lg:h-4"
              />
            </button>
          </form>

          {/* Dashboard Button */}
          <button
            onClick={() => handleNavigate("/dashboard")}
            className="text-gray-600 font-medium hover:text-blue-600 transition-colors cursor-pointer text-left text-lg md:text-base"
          >
            {t("navDashboard")}
          </button>
        </div>

        {/* 3. KHU VỰC VÍ / TÀI KHOẢN & NGÔN NGỮ */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Nút Đổi Ngôn Ngữ - Segmented Toggle Switch */}
          <div
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200/80 cursor-pointer select-none transition-all hover:border-blue-300 shadow-xs active:scale-95"
            title={language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <div className="pl-1.5 text-gray-500 flex items-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div className="flex items-center text-xs font-bold">
              <span
                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
                  language === "vi"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                VIE
              </span>
              <span
                className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
                  language === "en"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                ENG
              </span>
            </div>
          </div>

          {/* Nút Chế độ tối */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
              theme === "dark"
                ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
          >
            {theme === "dark" ? (
              <i className="uil uil-sun text-lg"></i>
            ) : (
              <i className="uil uil-moon text-lg"></i>
            )}
          </button>

          {walletAddress ? (
            // ĐÃ KẾT NỐI: HIỂN THỊ AVATAR BLOCKIES
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 focus:outline-none transition-transform active:scale-95"
              >
                {/* AVATAR TỰ ĐỘNG SINH RA TỪ VÍ */}
                <div className="rounded-full overflow-hidden border-2 border-blue-500 shadow-md w-10 h-10 hover:shadow-blue-200 transition-all cursor-pointer">
                  <Blockies
                    seed={walletAddress.toLowerCase()}
                    size={10}
                    scale={4}
                    className="identicon"
                  />
                </div>
              </button>

              {/* DROPDOWN MENU */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 ring-1 ring-black ring-opacity-5 animation-fade-in-up">
                  {/* Header Dropdown */}
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                    <div className="rounded-full overflow-hidden w-10 h-10 border border-gray-200">
                      <Blockies
                        seed={walletAddress.toLowerCase()}
                        size={10}
                        scale={4}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {t("navWalletTitle")}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin Ví */}
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                        Wallet Address
                      </p>
                      <div className="flex justify-start">
                        <AddressDisplay address={walletAddress} />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        Balance
                      </p>
                      <p className="text-xl font-bold text-blue-600 mt-1">
                        {walletBalance} ETH
                      </p>
                    </div>
                  </div>

                  {/* Nút Cài đặt Email */}
                  <div className="border-t border-gray-100 mt-1 p-2 pb-0">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setIsEmailModalOpen(true);
                      }}
                      className={`w-full flex flex-col items-center justify-center gap-0.5 px-4 py-2 text-sm font-bold transition-colors cursor-pointer rounded-lg ${
                        linkedEmail
                          ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"
                          : "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <i
                          className={`uil ${linkedEmail ? "uil-check-circle" : "uil-envelope"} text-lg`}
                        ></i>
                        {linkedEmail
                          ? "Đã liên kết email"
                          : t("navEmailSettings")}
                      </div>
                      {linkedEmail && (
                        <span className="text-xs font-normal text-green-600 truncate w-full text-center">
                          {linkedEmail} (Bấm để đổi)
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Footer: Nút Ngắt kết nối */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 
                      rounded-lg text-sm font-bold transition-colors cursor-pointer"
                    >
                      <i className="uil uil-sign-out-alt text-lg"></i>
                      {t("navDisconnect")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // === CHƯA KẾT NỐI ===
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2"
            >
              <img
                src={assets.walletIcon}
                alt="wallet"
                className="w-5 h-5 brightness-0 invert"
              />
              <span className="hidden sm:inline">
                {t("navConnectWallet")}
              </span>
            </button>
          )}

          {/* Nút mở menu Mobile */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <img src={assets.menu_icon} alt="menu" className="w-6 h-6" />
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default Navbar;
