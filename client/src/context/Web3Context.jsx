import React, { createContext, useState, useContext, useEffect } from "react";
import { ethers } from "ethers";
import { factoryABI, factoryAddress, agreementABI } from "../constants";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [factoryContract, setFactoryContract] = useState(null);

  // === 1. HÀM KẾT NỐI VÍ (QUAN TRỌNG NHẤT) ===
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Không tìm thấy MetaMask! Vui lòng cài đặt extension.");
      return;
    }

    try {
      // Tạo provider từ MetaMask
      const ethProvider = new ethers.BrowserProvider(window.ethereum);

      // --- DÒNG LỆNH NÀY SẼ MỞ POPUP METAMASK ---
      const accounts = await ethProvider.send("eth_requestAccounts", []);

      // Lấy tài khoản đầu tiên
      const account = accounts[0];
      setWalletAddress(account);

      // Lấy số dư
      const balance = await ethProvider.getBalance(account);
      setWalletBalance(ethers.formatEther(balance));

      // Lấy Signer (Người ký) - quan trọng để tạo giao dịch
      const ethSigner = await ethProvider.getSigner();
      setSigner(ethSigner);
      setProvider(ethProvider);

      // Kết nối với Hợp đồng Mẹ (Factory)
      const factory = new ethers.Contract(
        factoryAddress,
        factoryABI,
        ethSigner
      );
      setFactoryContract(factory);

      console.log("Đã kết nối ví:", account);
    } catch (error) {
      console.error("Lỗi kết nối ví:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setFactoryContract(null);
    setSigner(null);
  };

  // Nếu  muốn khi reload trang mà vẫn giữ kết nối, hãy bỏ comment đoạn này
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.send("eth_accounts", []); // Chỉ kiểm tra, không yêu cầu popup
        if (accounts.length > 0) {
          connectWallet();
        }
      }
    };
    checkConnection();
  }, []);

  // === 4. HELPER: Lấy Hợp đồng Con ===
  const getAgreementContract = (address) => {
    if (!signer || !address) return null;
    return new ethers.Contract(address, agreementABI, signer);
  };

  return (
    <Web3Context.Provider
      value={{
        walletAddress,
        walletBalance,
        connectWallet,
        disconnectWallet,
        factoryContract,
        provider,
        signer,
        getAgreementContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  return useContext(Web3Context);
};
