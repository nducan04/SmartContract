import React from "react";
import AddressDisplay from "../AddressDisplay";

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
    <div className="max-w-xl w-full mx-auto">
      <div className="text-center mb-10">
        <div className="inline-block p-4 rounded-full bg-blue-100 text-blue-600 mb-4">
          <i className="uil uil-search text-4xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tra cứu Hợp đồng
        </h1>
        <p className="text-gray-600">
          Nhập ID hợp đồng để xem tiến độ vận chuyển.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="relative shadow-lg rounded-2xl bg-white p-2 flex items-center"
      >
        <i className="uil uil-qrcode-scan text-2xl text-gray-400 ml-4"></i>
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Dán ID hợp đồng (0x...)"
          className="flex-grow px-4 py-3 outline-none text-gray-700 bg-transparent"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md"
        >
          {loading ? "Đang tìm..." : "Tra cứu"}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-red-500 text-center text-sm font-medium">
          {error}
        </p>
      )}

      <div className="mt-12">
        {walletAddress ? (
          <>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4 text-center">
              Gần đây của bạn
            </h3>
            {recentContracts.length > 0 ? (
              <div className="space-y-3">
                {recentContracts.map((contract) => (
                  <div
                    key={contract._id}
                    onClick={() => onRecentClick(contract.contractAddress)}
                    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-gray-700 group-hover:text-blue-600 truncate max-w-[200px]">
                        {contract.terms}
                      </p>
                      <div className="mt-1">
                        <AddressDisplay address={contract.contractAddress} />
                      </div>
                    </div>
                    <i className="uil uil-arrow-right text-gray-300 group-hover:text-blue-500"></i>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm">
                Chưa có hợp đồng nào.
              </p>
            )}
          </>
        ) : (
          <div className="text-center mt-8">
            <button
              onClick={connectWallet}
              className="text-blue-600 font-bold hover:underline"
            >
              Kết nối ví
            </button>
            <span className="text-gray-500 ml-1">để xem lịch sử của bạn.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingSearch;
