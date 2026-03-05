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

  const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Mã Hex của mạng Sepolia (11155111)

  // 1. HÀM KIỂM TRA VÀ ÉP CHUYỂN MẠNG SEPOLIA TỰ ĐỘNG
  const switchToSepolia = async () => {
    if (!window.ethereum) return false;
    try {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      }
      return true;
    } catch (error) {
      // Nếu ví của người dùng chưa từng thêm mạng Sepolia, tự động cài đặt cho họ
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Lỗi cài đặt mạng Sepolia:", addError);
          return false;
        }
      }
      console.error("Lỗi chuyển mạng:", error);
      return false;
    }
  };

  // 2. HÀM CẬP NHẬT DỮ LIỆU TÀI KHOẢN (GỌI SAU KHI ĐÃ Ở SEPOLIA)
  const updateAccount = async (account) => {
    if (!window.ethereum) return;
    try {
      // Ép kiểm tra mạng trước khi lấy bất kỳ dữ liệu gì
      const isSepolia = await switchToSepolia();
      if (!isSepolia) {
        alert(
          "⛔ Ứng dụng chỉ hoạt động trên mạng Sepolia. Vui lòng chuyển mạng trong MetaMask!",
        );
        return;
      }

      // Dùng "any" để tránh lỗi cache network cũ của ethers.js
      const ethProvider = new ethers.BrowserProvider(window.ethereum, "any");
      const balance = await ethProvider.getBalance(account);
      const ethSigner = await ethProvider.getSigner();

      const factory = new ethers.Contract(
        factoryAddress,
        factoryABI,
        ethSigner,
      );

      setWalletAddress(account);
      // Format lấy 4 số thập phân để không bị lỗi 0.0000000000...
      setWalletBalance(Number(ethers.formatEther(balance)).toFixed(4));
      setSigner(ethSigner);
      setProvider(ethProvider);
      setFactoryContract(factory);
    } catch (error) {
      console.error("Lỗi cập nhật tài khoản:", error);
    }
  };

  // 3. HÀM KẾT NỐI VÍ (BẤM NÚT)
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          // SỬA LỖI: Chuyển hết logic cập nhật vào hàm updateAccount thay vì viết rời rạc
          await updateAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Lỗi kết nối ví:", error);
      }
    } else {
      alert("Vui lòng cài đặt tiện ích MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setFactoryContract(null);
    setSigner(null);
    setProvider(null);
  };

  // 4. LẮNG NGHE SỰ KIỆN KHI VÀO TRANG HOẶC ĐỔI VÍ
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          updateAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    // Khi người dùng F5 tải lại trang, lấy ví đang active và cập nhật
    const checkConnection = async () => {
      if (window.ethereum) {
        // Đọc trực tiếp từ window.ethereum cho nhanh, không thông qua provider để tránh lỗi cache
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts && accounts.length > 0) {
          await updateAccount(accounts[0]);
        }
      }
    };
    checkConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, []);

  // 5. LẤY SMART CONTRACT
  const getAgreementContract = (address) => {
    if (!address) return null;
    // Fallback: Ưu tiên có Signer để ghi, nếu chỉ có Provider thì dùng để đọc dữ liệu
    if (signer) return new ethers.Contract(address, agreementABI, signer);
    if (provider) return new ethers.Contract(address, agreementABI, provider);
    return null;
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
