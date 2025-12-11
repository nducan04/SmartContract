import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets, menuLinks } from "../assets/assets";
import { useWeb3 } from "../context/Web3Context";
import Blockies from "react-blockies";
import AddressDisplay from "./AddressDisplay";

const Navbar = () => {
  const { walletAddress, walletBalance, connectWallet, disconnectWallet } =
    useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
    ? "bg-white/80 backdrop-blur-md"
    : "bg-white shadow-sm";

  return (
    <div
      className={`sticky top-0 z-40 w-full border-b border-gray-100 transition-all ${navBgClass}`}
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
          {menuLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              placeholder="Tìm kiếm theo ID..."
            />
            <button type="submit">
              <img
                src={assets.search_icon}
                alt="search"
                className="cursor-pointer hover:opacity-70"
              />
            </button>
          </form>

          {/* Dashboard Button */}
          <button
            onClick={() => handleNavigate("/dashboard")}
            className="text-gray-600 font-medium hover:text-blue-600 transition-colors cursor-pointer"
          >
            Bảng Điều Khiển
          </button>
        </div>

        {/* 3. KHU VỰC VÍ / TÀI KHOẢN */}
        <div className="flex items-center space-x-4">
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
                        Tài khoản của tôi
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          Đang kết nối
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin Ví */}
                  <div className="px-5 py-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                        Địa chỉ ví
                      </p>
                      {/* 2. SỬ DỤNG COMPONENT AddressDisplay */}
                      <div className="flex justify-start">
                        <AddressDisplay address={walletAddress} />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                        Số dư hiện tại
                      </p>
                      <p className="text-xl font-bold text-blue-600 mt-1">
                        {walletBalance} ETH
                      </p>
                    </div>
                  </div>

                  {/* Footer: Nút Ngắt kết nối */}
                  <div className="border-t border-gray-100 mt-1 p-2">
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 
                      rounded-lg text-sm font-bold transition-colors cursor-pointer"
                    >
                      <i className="uil uil-sign-out-alt text-lg"></i>
                      Ngắt kết nối ví
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // === CHƯA KẾT NỐI ===
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
            >
              <img
                src={assets.walletIcon}
                alt="wallet"
                className="w-5 h-5 brightness-0 invert"
              />
              <span className="hidden sm:inline cursor-pointer">
                Kết nối Ví
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
    </div>
  );
};

export default Navbar;
