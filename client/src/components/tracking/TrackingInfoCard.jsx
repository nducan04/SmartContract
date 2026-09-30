import React from "react";
import AddressDisplay from "../AddressDisplay";
import { User, Truck, Home, ShieldCheck, Coins } from "lucide-react";

const TrackingInfoCard = ({ data, id }) => {
  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm p-6 mb-6 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Smart Contract
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                data.state === 5
                  ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/40"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/40"
              }`}
            >
              {data.state === 5 ? "Đã hủy" : "Đang bảo chứng"}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white break-all font-mono mb-2">
            {id.slice(0, 8)}...{id.slice(-6)}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
            "{data.terms}"
          </p>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-bold uppercase">GIÁ TRỊ KÝ QUỸ</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {data.amount} <span className="text-xs">ETH</span>
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {[
          {
            label: "Người gửi (Bên A)",
            address: data.client,
            icon: User,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
          },
          {
            label: "Đơn vị vận chuyển",
            address: data.provider,
            icon: Truck,
            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
          },
          {
            label: "Người nhận (Bên B)",
            address: data.receiver,
            icon: Home,
            color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {item.label}
                </p>
                <AddressDisplay address={item.address} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-8 pb-4">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Xác thực bởi Ethereum Blockchain</span>
        </p>
      </div>
    </>
  );
};

export default TrackingInfoCard;
