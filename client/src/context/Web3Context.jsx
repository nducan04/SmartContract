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

  // Hàm update lại state khi có thay đổi
  const updateAccount = async (account) => {
    if (!window.ethereum) return;
    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const balance = await ethProvider.getBalance(account);
      const ethSigner = await ethProvider.getSigner();

      const factory = new ethers.Contract(
        factoryAddress,
        factoryABI,
        ethSigner
      );

      setWalletAddress(account);
      setWalletBalance(ethers.formatEther(balance));
      setSigner(ethSigner);
      setProvider(ethProvider);
      setFactoryContract(factory);
    } catch (error) {
      console.error("Lỗi cập nhật tài khoản:", error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài đặt MetaMask!");
      return;
    }

    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await ethProvider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        await updateAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setFactoryContract(null);
    setSigner(null);
    // Lưu ý: Không thể ngắt kết nối thực sự từ phía dApp, chỉ có thể xóa state
  };

  // --- PHẦN QUAN TRỌNG: TỰ ĐỘNG LẮNG NGHE SỰ KIỆN ---
  useEffect(() => {
    if (window.ethereum) {
      // 1. Nghe sự kiện đổi tài khoản
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          updateAccount(accounts[0]);
        } else {
          disconnectWallet(); // Người dùng ngắt kết nối trong ví
        }
      });

      // 2. Nghe sự kiện đổi mạng (Chain)
      window.ethereum.on("chainChanged", () => {
        window.location.reload(); // Reload trang để cập nhật provider mới
      });
    }

    // Kiểm tra kết nối ngay khi vào trang
    const checkConnection = async () => {
      if (window.ethereum) {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.send("eth_accounts", []);
        if (accounts.length > 0) {
          await updateAccount(accounts[0]);
        }
      }
    };
    checkConnection();

    // Cleanup listener khi unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

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
