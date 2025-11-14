import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { agreementABI } from '../constants';

// Component để hiển thị chi tiết (tránh lặp code)
const ContractDetails = ({ details, contractAddress }) => {
    // 'details' là mảng trả về từ hàm getAgreementDetails()
    const stateMap = ["Created", "Accepted", "InProgress", "Completed", "Paid", "Cancelled"];
    
    return (
      <div className="mt-8 bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h3 className="text-2xl font-bold text-gray-900">Chi tiết Hợp đồng</h3>
        <p className="text-sm text-gray-500 break-all mb-4">ID: {contractAddress}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Trạng thái:</p>
            <p className="text-lg font-semibold text-blue-600">{stateMap[details[0]]}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Giá trị (ETH):</p>
            <p className="text-lg font-semibold text-gray-900">{ethers.formatEther(details[4])}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Mô tả:</p>
          <p className="text-md text-gray-800">{details[5]}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Hash Điều khoản (IPFS):</p>
          <a href={`https://gateway.pinata.cloud/ipfs/${details[6]}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 break-all hover:underline">
              {details[6]}
          </a>
        </div>
        <hr className="my-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Khách hàng (Client):</p>
          <p className="text-xs text-gray-700 break-all">{details[1]}</p>
          <p className="text-sm font-medium text-gray-500">Nhà cung cấp (Provider):</p>
          <p className="text-xs text-gray-700 break-all">{details[2]}</p>
          <p className="text-sm font-medium text-gray-500">Người nhận (Receiver):</p>
          <p className="text-xs text-gray-700 break-all">{details[3]}</p>
        </div>
      </div>
    );
};


const TrackingPage = () => {
  const { provider, connectWallet } = useWeb3(); // Chỉ cần 'provider' để đọc
  const [contractAddress, setContractAddress] = useState(''); // ID người dùng nhập
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setDetails(null);

    // 1. Yêu cầu kết nối ví nếu chưa có 'provider'
    if (!provider) {
      alert("Vui lòng kết nối ví để tra cứu thông tin.");
      connectWallet(); // Yêu cầu kết nối
      return;
    }

      // 2. Kiểm tra địa chỉ hợp lệ
    if (!ethers.isAddress(contractAddress)) {
      setError('Địa chỉ hợp đồng không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);
    try {
        // 3. Tạo instance của Hợp đồng CON (read-only)
      const contract = new ethers.Contract(contractAddress, agreementABI, provider);
      
      // 4. Gọi hàm 'view'
      const agreementDetails = await contract.getAgreementDetails();
      setDetails(agreementDetails);

    } catch (err) {
      console.error(err);
      setError('Không tìm thấy hợp đồng hoặc đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Theo dõi Hợp đồng</h1>
        <p className="text-lg text-gray-600 mt-2">
          Nhập địa chỉ Hợp đồng (ID) để xem trạng thái và chi tiết.
        </p>
      </div>

      {/* Form Tìm kiếm */}
      <form onSubmit={handleSearch} className="mt-8 flex gap-2">
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Dán địa chỉ hợp đồng (VD: 0x...)"
          className="flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Đang tìm...' : 'Tra cứu'}
        </button>
      </form>

      {/* Khu vực Hiển thị Kết quả */}
      <div className="mt-6">
        {error && <p className="text-center text-red-500">{error}</p>}
        {details && <ContractDetails details={details} contractAddress={contractAddress} />}
      </div>
    </div>
  );
};

export default TrackingPage;