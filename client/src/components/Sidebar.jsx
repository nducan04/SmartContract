import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assets, ownerMenuLinks } from "./../assets/assets";

// Nhận props từ DashboardLayout để điều khiển việc đóng/mở
const Sidebar = ({ isMobileOpen, closeMobileMenu }) => {
  const location = useLocation();

  return (
    <>
      {/* 1. BACKDROP (Màn hình đen mờ che phía sau khi mở menu trên mobile) */}
      {/* Chỉ hiện khi isMobileOpen = true và đang ở màn hình nhỏ (md:hidden) */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeMobileMenu}
      ></div>

      {/* 2. SIDEBAR CHÍNH */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-100 flex flex-col 
          shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out
          
          /* Logic hiển thị: */
          /* Mobile: Dựa vào biến isMobileOpen để trượt ra/vào */
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Desktop: Luôn hiển thị và dùng sticky để cố định */
          md:translate-x-0 md:sticky md:top-0
        `}
      >
        {/* LOGO AREA */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src={assets.blockchainLogo} alt="Logo" className="h-8" />
          </Link>

          {/* Nút đóng (X) chỉ hiện trên Mobile */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <i className="uil uil-multiply text-2xl"></i>
          </button>
        </div>

        {/* MENU AREA */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {ownerMenuLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/dashboard"}
              onClick={closeMobileMenu} // Tự động đóng menu khi bấm chọn trên mobile
              className={({ isActive }) =>
                `group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold shadow-sm" // Active State
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium" // Normal State
                }`
              }
            >
              <div
                className={`
                  w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110
                  ${
                    location.pathname === link.path
                      ? ""
                      : "opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                  }
              `}
              >
                <img
                  src={link.coloredIcon || link.icon}
                  alt={link.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* whitespace-nowrap để không bao giờ bị xuống dòng */}
              <span className="whitespace-nowrap text-sm tracking-wide">
                {link.name}
              </span>

              {location.pathname === link.path && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full shadow-lg shadow-blue-300"></div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER AREA */}
        <div className="p-4 border-t border-gray-50 mt-auto shrink-0">
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="uil uil-user"></i>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-700">Tài khoản</p>
              <p className="text-[10px] text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
