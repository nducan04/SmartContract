import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWeb3 } from "../context/Web3Context";

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    description: "Kết nối ví MetaMask",
  },
  {
    id: "trustwallet",
    name: "Trust Wallet",
    icon: "https://trustwallet.com/assets/images/media/assets/trust_logo.png",
    description: "Kết nối ví Trust Wallet",
  },
  {
    id: "okx",
    name: "OKX Wallet",
    icon: "https://raw.githubusercontent.com/okx/okx-ui-components/main/assets/okx-wallet-logo.png",
    description: "Kết nối ví OKX Web3",
  },
  {
    id: "binance",
    name: "Binance Wallet",
    icon: "https://public.bnbchain.org/image/bsc-logo.png",
    description: "Kết nối ví BNB Chain",
  },
];

const ConnectWalletModal = ({ isOpen, onClose }) => {
  const { connectWallet, isWalletInstalled, walletAddress } = useWeb3();
  const [installedWallets, setInstalledWallets] = useState({});

  const [connectingId, setConnectingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState(""); // Thêm state cho thông báo tính năng mới

  useEffect(() => {
    if (isOpen) {
      const status = {};
      WALLETS.forEach((wallet) => {
        status[wallet.id] = isWalletInstalled(wallet.id);
      });
      setInstalledWallets(status);
      setConnectingId(null);
      setErrorMsg("");
      setInfoMsg("");
    }
  }, [isOpen, isWalletInstalled]);

  useEffect(() => {
    if (walletAddress && isOpen) {
      onClose();
    }
  }, [walletAddress, isOpen, onClose]);

  if (!isOpen) return null;

  const handleWalletClick = async (walletId) => {
    setConnectingId(walletId);
    setErrorMsg("");
    setInfoMsg("");

    try {
      await connectWallet(walletId);
    } catch (error) {
      if (error.message === "USER_REJECTED") {
        setErrorMsg("Kết nối bị từ chối. Vui lòng thử lại!");
      } else if (error.message !== "NOT_INSTALLED") {
        setErrorMsg("Có lỗi xảy ra khi kết nối. Vui lòng thử lại!");
      }
    } finally {
      setConnectingId(null);
    }
  };

  const handleFutureFeature = (featureName) => {
    setErrorMsg("");
    setInfoMsg(`Tính năng ${featureName} đang được phát triển ở phiên bản sau!`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CỘT TRÁI: DANH SÁCH VÍ (Giao diện PancakeSwap) */}
        <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-white flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              <i className="uil uil-multiply text-2xl"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pb-2">
            {/* THÔNG BÁO LỖI / INFO */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2 animate-fade-in">
                <i className="uil uil-exclamation-octagon text-lg"></i>
                {errorMsg}
              </div>
            )}
            {infoMsg && (
              <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold border border-blue-100 flex items-center gap-2 animate-fade-in">
                <i className="uil uil-info-circle text-lg"></i>
                {infoMsg}
              </div>
            )}

            {/* 1. SOCIAL LOGIN BUTTON */}
            <button
              onClick={() => handleFutureFeature("Social Login (Web3Auth)")}
              className="w-full flex items-center justify-between p-3 sm:p-4 mb-5 bg-gray-50 border border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm z-40 group-hover:-translate-y-1 transition-transform duration-300">
                  <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-4 h-4" alt="Google" />
                </div>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border border-gray-200 shadow-sm z-30 group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                  <i className="uil uil-twitter text-white text-sm"></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2AABEE] flex items-center justify-center border border-gray-200 shadow-sm z-20 group-hover:-translate-y-1 transition-transform duration-300 delay-100">
                  <i className="uil uil-telegram text-white text-sm"></i>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center border border-gray-200 shadow-sm z-10 group-hover:-translate-y-1 transition-transform duration-300 delay-150">
                  <i className="uil uil-discord text-white text-sm"></i>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                Social Login <i className="uil uil-angle-right-b text-lg text-gray-400 group-hover:text-blue-500"></i>
              </div>
            </button>

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Top Wallets
            </p>

            {/* 2. GRID 4 VÍ CHÍNH */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {WALLETS.map((wallet) => {
                const isInstalled = installedWallets[wallet.id];
                const isConnecting = connectingId === wallet.id;

                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletClick(wallet.id)}
                    disabled={connectingId !== null && !isConnecting}
                    className={`flex flex-col items-center justify-center gap-3 p-4 bg-white border rounded-2xl transition-all group relative cursor-pointer
                      ${connectingId !== null && !isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-md hover:bg-blue-50/30 border-gray-200'}
                      ${isConnecting ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/50' : ''}
                    `}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full group-hover:scale-110 transition-transform relative">
                      {isConnecting ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-8 h-8 object-contain drop-shadow-sm"
                          onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" }}
                        />
                      )}
                    </div>
                    <span className="font-bold text-gray-800 text-sm whitespace-nowrap">
                      {isConnecting ? "Đang kết nối..." : wallet.name}
                    </span>

                    {!isConnecting && (
                      <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${isInstalled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {isInstalled ? "Kết nối" : "Cài đặt"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3. MORE WALLETS BUTTON */}
            <button
              onClick={() => handleFutureFeature("WalletConnect")}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center border border-gray-200 shadow-sm z-40 group-hover:-translate-y-1 transition-transform duration-300">
                    <img src="https://explorer-api.walletconnect.com/v3/logo/md/df2ce6fc-de91-4475-eb3e-8121625a6600?projectId=2f05ae7f1116030fde2d4ba50042e3f5" className="w-5 h-5 rounded-full" alt="WC" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm z-30 group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                    <img src="https://avatars.githubusercontent.com/u/18060234?s=200&v=4" className="w-5 h-5 rounded-full" alt="CB" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm z-20 group-hover:-translate-y-1 transition-transform duration-300 delay-100">
                    <img src="https://cryptologos.cc/logos/safe-sfp-logo.png" className="w-5 h-5 rounded-full" alt="Safe" />
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full ml-1 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">+11</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                More Wallets <i className="uil uil-angle-right-b text-lg text-gray-400 group-hover:text-blue-500"></i>
              </div>
            </button>

          </div>
        </div>

        {/* CỘT PHẢI: ĐỒ HỌA */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-gray-50 flex flex-col justify-between hidden md:flex relative border-l border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer"
          >
            <i className="uil uil-multiply text-xl"></i>
          </button>

          <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-6 shadow-md shadow-blue-100 border border-gray-100">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg"
                alt="ETH Logo"
                className="w-20 h-20 object-contain opacity-80 animate-pulse-slow"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Web3 Gateway</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[250px] leading-relaxed">
              Quản lý và lưu trữ tài sản mã hóa của bạn một cách an toàn. Đăng nhập để kích hoạt Smart Contract.
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Chưa có ví? <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">Tìm hiểu cách cài đặt</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConnectWalletModal;
