import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useWeb3 } from "../context/Web3Context";
import {
  X,
  ChevronRight,
  AlertCircle,
  Info,
  ExternalLink,
  ShieldCheck,
  Wallet,
  Sparkles
} from "lucide-react";

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
  const [infoMsg, setInfoMsg] = useState("");

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
    setInfoMsg(`Tính năng ${featureName} đang được phát triển ở phiên bản kế tiếp!`);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-md transition-all duration-300 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transform transition-all duration-300 scale-100 border border-slate-200/80 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CỘT TRÁI: DANH SÁCH VÍ */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kết nối ví Web3
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Chọn ví bạn muốn liên kết với DApp</p>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 pb-2">
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-900/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {infoMsg && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-900/50 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* GRID 4 VÍ CHÍNH */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {WALLETS.map((wallet) => {
                const isInstalled = installedWallets[wallet.id];
                const isConnecting = connectingId === wallet.id;

                return (
                  <button
                    key={wallet.id}
                    onClick={() => handleWalletClick(wallet.id)}
                    disabled={connectingId !== null && !isConnecting}
                    className={`flex flex-col items-center justify-center gap-2.5 p-4 bg-slate-50/60 dark:bg-slate-800/40 border rounded-2xl transition-all group relative cursor-pointer
                      ${connectingId !== null && !isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-md hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'}
                      ${isConnecting ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/40' : ''}
                    `}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform shadow-xs relative">
                      {isConnecting ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                      ) : (
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-8 h-8 object-contain drop-shadow-sm"
                          onError={(e) => { e.target.src = "https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg" }}
                        />
                      )}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm whitespace-nowrap">
                      {isConnecting ? "Đang kết nối..." : wallet.name}
                    </span>

                    {!isConnecting && (
                      <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        isInstalled
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50'
                          : 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {isInstalled ? "Sẵn sàng" : "Cài đặt"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* MORE WALLETS */}
            <button
              onClick={() => handleFutureFeature("WalletConnect")}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl hover:border-blue-400 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Wallet className="w-4 h-4 text-blue-500" />
                <span>Thêm phương thức kết nối khác</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: GRAPHIC */}
        <div className="w-full md:w-1/2 p-8 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col justify-between hidden md:flex relative border-l border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
            <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10 border border-slate-200/80 dark:border-slate-800 relative">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg"
                alt="ETH Logo"
                className="w-16 h-16 object-contain opacity-85"
              />
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-blue-600 text-white shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Bảo mật Web3 Escrow
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs">
              Mọi giao dịch thanh toán đều được khóa an toàn trong Smart Contract và chỉ giải ngân khi người nhận phê duyệt.
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-200/80 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Chưa có ví?{" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Cài MetaMask</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConnectWalletModal;
