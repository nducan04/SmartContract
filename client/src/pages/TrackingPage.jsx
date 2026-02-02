import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { agreementABI } from "../constants";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Import các component con
import TrackingSearch from "../components/tracking/TrackingSearch";
import TrackingTimeline from "../components/tracking/TrackingTimeline";
import TrackingInfoCard from "../components/tracking/TrackingInfoCard";

const TrackingPage = () => {
  const { provider, connectWallet, walletAddress } = useWeb3();
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState("");
  const [recentContracts, setRecentContracts] = useState([]);
  const [contractData, setContractData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Logic lấy danh sách gần đây
  useEffect(() => {
    const fetchRecents = async () => {
      if (!id && walletAddress) {
        try {
          // LƯU Ý: Sửa localhost thành IP nếu cần test LAN (sẽ nói ở phần 2)
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:5000";
          const response = await axios.get(
            `${API_URL}/api/contracts?wallet=${walletAddress}`,
          );
          setRecentContracts(response.data.slice(0, 3));
        } catch (err) {
          console.error("Lỗi tải gợi ý:", err);
        }
      }
    };
    fetchRecents();
  }, [walletAddress, id]);

  // Logic gọi Smart Contract
  useEffect(() => {
    if (id && ethers.isAddress(id)) {
      const fetchData = async () => {
        setLoading(true);
        setError("");
        let activeProvider = new ethers.JsonRpcProvider(
          "https://rpc.ankr.com/eth_sepolia",
        );

        try {
          const contract = new ethers.Contract(
            id,
            agreementABI,
            activeProvider,
          );
          const data = await contract.getAgreementDetails();
          setContractData({
            state: Number(data[0]),
            client: data[1],
            provider: data[2],
            receiver: data[3],
            amount: ethers.formatEther(data[4]),
            terms: data[5],
            address: id,
          });
        } catch (err) {
          setError("Không thể tải dữ liệu. ID không đúng hoặc lỗi mạng.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id, provider]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (ethers.isAddress(searchId)) navigate(`/tracking/${searchId}`);
    else setError("Địa chỉ ví không hợp lệ.");
  };

  // --- RENDER ---
  if (id) {
    // Giao diện chi tiết (Timeline)
    return (
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">
              <i className="uil uil-cube"></i> SupplyChain Track
            </h1>
          </div>
          <button
            onClick={() => navigate("/tracking")}
            className="text-white hover:bg-blue-700 p-2 rounded-full"
          >
            <i className="uil uil-search text-xl"></i>
          </button>
        </div>

        <div className="max-w-md mx-auto p-4 mt-2">
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
              {error}
            </div>
          ) : contractData ? (
            <>
              <TrackingInfoCard data={contractData} id={id} />
              <TrackingTimeline currentState={contractData.state} />
            </>
          ) : null}
        </div>
      </div>
    );
  }

  // Giao diện tìm kiếm
  return (
    <div className="min-h-[80vh] bg-gray-50 py-12 px-4 flex flex-col items-center justify-center">
      <TrackingSearch
        searchId={searchId}
        setSearchId={setSearchId}
        handleSearchSubmit={handleSearchSubmit}
        loading={loading}
        error={error}
        walletAddress={walletAddress}
        recentContracts={recentContracts}
        connectWallet={connectWallet}
        onRecentClick={(addr) => navigate(`/tracking/${addr}`)}
      />
    </div>
  );
};

export default TrackingPage;
