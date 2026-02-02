import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  // State quản lý việc đóng mở menu trên mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar truyền props vào */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* --- HEADER MOBILE (Chỉ hiện trên màn hình nhỏ) --- */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:hidden shrink-0">
          <div className="flex items-center gap-3">
            {/* Nút 3 gạch (Hamburger) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <i className="uil uil-bars text-2xl"></i>
            </button>
            <span className="font-bold text-gray-700">Dashboard</span>
          </div>

          {/* Logo nhỏ bên phải cho đẹp */}
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <i className="uil uil-cube"></i>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
