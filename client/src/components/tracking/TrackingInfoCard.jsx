import React from "react";
import AddressDisplay from "../AddressDisplay";

const TrackingInfoCard = ({ data, id }) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Mã Hợp Đồng
            </span>
            <span
              className={`px-2 py-1 rounded-md text-xs font-bold ${data.state === 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}
            >
              {data.state === 5 ? "Đã hủy" : "Đang hoạt động"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 break-all font-mono mb-1">
            {id.slice(0, 8)}...{id.slice(-6)}
          </h2>
          <p className="text-sm text-gray-500 line-clamp-2 italic">
            "{data.terms}"
          </p>
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-400 font-bold">GIÁ TRỊ</span>
            <span className="text-lg font-bold text-blue-600">
              {data.amount} ETH
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3">
        {[
          {
            label: "Người gửi",
            address: data.client,
            icon: "uil-user",
            color: "blue",
          },
          {
            label: "Vận chuyển",
            address: data.provider,
            icon: "uil-truck",
            color: "green",
          },
          {
            label: "Người nhận",
            address: data.receiver,
            icon: "uil-home",
            color: "purple",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-white rounded-lg border border-gray-100 flex items-center gap-3"
          >
            <div
              className={`w-8 h-8 rounded-full bg-${item.color}-100 flex items-center justify-center text-${item.color}-600`}
            >
              <i className={`uil ${item.icon}`}></i>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-400 font-bold uppercase">
                {item.label}
              </p>
              <AddressDisplay address={item.address} />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8 pb-8">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <i className="uil uil-shield-check text-green-500"></i> Xác thực bởi
          Ethereum Sepolia
        </p>
      </div>
    </>
  );
};

export default TrackingInfoCard;
