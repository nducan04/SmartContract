import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* SỬA Ở ĐÂY: Có md:ml-72 để né Sidebar trên màn hình máy tính, và print:ml-0 để xóa lề khi in PDF */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-72 relative print:ml-0 print:h-auto print:block print:overflow-visible">
        {/* Header Mobile (Sẽ bị ẩn đi khi in bằng print:hidden) */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 md:hidden sticky top-0 z-30 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <i className="uil uil-bars text-2xl"></i>
            </button>
            <span className="font-bold text-gray-700 dark:text-white">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark mode toggle for mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                theme === "dark"
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
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
