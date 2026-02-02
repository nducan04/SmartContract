import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (Fixed) */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Content Area */}
      {/* SỬA QUAN TRỌNG: Thêm 'md:ml-72' để đẩy nội dung sang phải trên Desktop */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-72 relative">
        {/* Header Mobile */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            >
              <i className="uil uil-bars text-2xl"></i>
            </button>
            <span className="font-bold text-gray-700">Dashboard</span>
          </div>
          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <i className="uil uil-cube"></i>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
