import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8F9FD]">
      {" "}
      <Sidebar />
      {/* Nội dung chính bên phải */}
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {" "}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
