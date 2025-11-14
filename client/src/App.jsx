import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import DashboardLayout from './pages/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import ContractListPage from './pages/ContractListPage';
import CreateContractPage from './pages/CreateContractPage';
import TrackingPage from './pages/TrackingPage';


const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const location = useLocation();

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      
      {!isDashboard && (
        <Navbar walletAddress={walletAddress} setWalletAddress={setWalletAddress} />
      )}

      <main className="grow">
        <Routes>
          
          <Route path='/' element={<Home />} />
          <Route path='/tracking' element={<TrackingPage />} />

          <Route path='/dashboard' element={<DashboardLayout />}>

              <Route index element={<DashboardOverview />} />
              <Route path='contracts' element={<ContractListPage />} />
              <Route path="create" element={<CreateContractPage />} />
            
          </Route>
          
        </Routes>
      </main>

      {!isDashboard && <Footer />}
      
    </div>

  )
  
}

export default App