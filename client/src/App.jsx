import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import ContractListPage from "./pages/ContractListPage";
import CreateContractPage from "./pages/CreateContractPage";
import ContractDetailsPage from "./pages/ContractDetailsPage";
import TrackingPage from "./pages/TrackingPage";
import NotFound from "./pages/NotFound";
import MarketplacePage from "./pages/MarketplacePage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  const location = useLocation();
  // Ẩn Navbar/Footer khi ở Dashboard hoặc khi đang xem chi tiết Tracking (để giống app mobile)
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isTrackingDetail = /^\/tracking\/0x/.test(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Ẩn Navbar ở Dashboard và Trang chi tiết Tracking (để tập trung vào timeline) */}
      {!isDashboard && !isTrackingDetail && <Navbar />}

      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/tracking/:id" element={<TrackingPage />} />
          {/* ------------------------- */}

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="contracts" element={<ContractListPage />} />
            <Route path="create" element={<CreateContractPage />} />
            <Route path="contract/:id" element={<ContractDetailsPage />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isDashboard && !isTrackingDetail && <Footer />}
    </div>
  );
};

export default App;
