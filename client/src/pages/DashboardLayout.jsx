import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* SỬA Ở ĐÂY: Có md:ml-72 để né Sidebar trên màn hình máy tính, và print:ml-0 để xóa lề khi in PDF */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-72 relative print:ml-0 print:h-auto print:block print:overflow-visible">
        {/* Header Mobile (Sẽ bị ẩn đi khi in bằng print:hidden) */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:hidden sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <i className="uil uil-bars text-2xl"></i>
            </button>
            <span className="font-bold text-gray-700">Dashboard</span>
          </div>

          <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <i className="uil uil-cube"></i>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden print:overflow-visible print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
