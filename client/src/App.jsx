import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
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

const App = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      {!isDashboard && <Navbar />}

      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tracking" element={<TrackingPage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />

            <Route path="contracts" element={<ContractListPage />} />

            <Route path="create" element={<CreateContractPage />} />

            <Route path="contract/:id" element={<ContractDetailsPage />} />

            <Route path="marketplace" element={<MarketplacePage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isDashboard && <Footer />}
    </div>
  );
};

export default App;
