import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assets, ownerMenuLinks } from "./../assets/assets";

const Sidebar = () => {
  const location = useLocation();

  return (
    // chiều rộng w-72 và cố định chiều cao
    <div className="w-72 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] sticky top-0 left-0 h-screen z-30">
      {/* LOGO AREA */}
      <div className="h-20 flex items-center px-8 border-b border-gray-50">
        <Link to="/" className="flex items-center gap-2">
          <img src={assets.blockchainLogo} alt="Logo" className="h-8" />
          {/* <span className="font-bold text-xl text-gray-800 tracking-tight">BLOCKCHAIN</span> */}
        </Link>
      </div>

      {/* MENU AREA */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {ownerMenuLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === "/dashboard"}
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

      {/* FOOTER AREA (Optional: User profile summary) */}
      <div className="p-4 border-t border-gray-50">
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
    </div>
  );
};

export default Sidebar;
