import React from "react";
import AddressDisplay from "../AddressDisplay";
import { Search, QrCode, ArrowRight, Clock, Wallet, Sparkles } from "lucide-react";

const TrackingSearch = ({
  searchId,
  setSearchId,
  handleSearchSubmit,
  loading,
  error,
  walletAddress,
  recentContracts,
  connectWallet,
  onRecentClick,
}) => {
  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 mb-5 border border-blue-200/50 dark:border-blue-900/50 shadow-inner">
          <Search className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Tra cứu Hành trình Hợp đồng
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Nhập địa chỉ Smart Contract hoặc quét mã QR để theo dõi tiến độ vận chuyển trực tiếp trên Blockchain.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="relative shadow-xl shadow-blue-500/5 rounded-2xl bg-white dark:bg-slate-900 p-2 sm:p-2.5 flex items-center border border-slate-200/80 dark:border-slate-800 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
      >
        <div className="pl-3 text-slate-400">
          <QrCode className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Dán mã hợp đồng (0x...)"
          className="flex-grow px-3 sm:px-4 py-2.5 sm:py-3 outline-none text-slate-800 dark:text-slate-200 bg-transparent text-xs sm:text-sm font-mono placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Đang tìm..." : "Tra cứu"}
        </button>
      </form>

      {error && (
        <p className="mt-3.5 text-rose-500 text-center text-xs font-semibold">
          {error}
        </p>
      )}

      {/* RECENT CONTRACTS */}
      <div className="mt-12">
        {walletAddress ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Hợp đồng gần đây của bạn</span>
              </h3>
            </div>

            {recentContracts.length > 0 ? (
              <div className="space-y-3">
                {recentContracts.map((contract) => (
                  <div
                    key={contract._id}
                    onClick={() => onRecentClick(contract.contractAddress)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div className="overflow-hidden mr-3">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {contract.terms && contract.terms.length > 30
                          ? contract.terms.slice(0, 30) + "..."
                          : contract.terms || "Hợp đồng vận chuyển"}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <AddressDisplay address={contract.contractAddress} />
                        {contract.amount && (
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            • {contract.amount} ETH
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 text-xs">Chưa có giao dịch gần đây nào.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={connectWallet}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm hover:underline"
            >
              <Wallet className="w-4 h-4" />
              <span>Kết nối ví Web3</span>
            </button>
            <span className="text-slate-500 text-xs ml-1.5">để xem lịch sử tra cứu của bạn.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingSearch;
