import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import AddressDisplay from "../AddressDisplay";
import { useLanguage } from "../../context/LanguageContext";
import { QrCode, ArrowRight, FolderOpen, Loader2 } from "lucide-react";

const parseTerms = (termsString) => {
  if (!termsString) return null;
  try {
    const parsed = JSON.parse(termsString);
    if (parsed && typeof parsed === "object" && "art1_items" in parsed)
      return parsed;
    return null;
  } catch (error) {
    return null;
  }
};

const ContractRow = ({
  c,
  walletAddress,
  onShowQR,
  onViewDetails,
  getRoleBadge,
  getStatusBadge,
}) => {
  const { t } = useLanguage();
  const [terms, setTerms] = useState(c.terms || "");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!terms || !terms.includes("partyA_name")) {
      const fetchFromBlockchain = async () => {
        setIsSyncing(true);
        try {
          const rpcProvider = new ethers.JsonRpcProvider(
            "https://ethereum-sepolia-rpc.publicnode.com",
          );
          const abi = [
            "function getAgreementDetails() view returns (uint8, address, address, address, uint256, string terms)",
          ];
          const sc = new ethers.Contract(c.contractAddress, abi, rpcProvider);
          const data = await sc.getAgreementDetails();
          setTerms(data[5]);
        } catch (error) {
          console.error("Lỗi đồng bộ terms:", error);
        } finally {
          setIsSyncing(false);
        }
      };
      fetchFromBlockchain();
    }
  }, [c.contractAddress, terms]);

  const parsedTerms = parseTerms(terms);
  const displayTitle = isSyncing
    ? "⏳ Đang tải từ Blockchain..."
    : parsedTerms
      ? parsedTerms.art1_items
      : terms || "Thỏa thuận mua bán & vận chuyển";

  return (
    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/80">
      <td className="px-5 py-4 align-middle">
        <AddressDisplay address={c.contractAddress} />
      </td>

      <td className="px-5 py-4 align-middle">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 break-words">
          {displayTitle}
        </p>
      </td>

      <td className="px-5 py-4 align-middle">{getRoleBadge(c)}</td>

      <td className="px-5 py-4 align-middle">
        <span className="font-extrabold text-slate-900 dark:text-white whitespace-nowrap text-sm">
          {c.amount} <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">ETH</span>
        </span>
      </td>

      <td className="px-5 py-4 align-middle">{getStatusBadge(c.status)}</td>

      <td className="px-5 py-4 align-middle text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onShowQR(c.contractAddress)}
            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
            title="Hiện mã QR"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewDetails(c.contractAddress)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <span>{t("btnView")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const ContractTable = ({
  contracts,
  loading,
  walletAddress,
  onShowQR,
  onViewDetails,
}) => {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Đang tải dữ liệu hợp đồng...</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
          Chưa tìm thấy hợp đồng nào
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
          {t("emptyTable")}
        </p>
      </div>
    );
  }

  const getRoleBadge = (contract) => {
    const current = walletAddress?.toLowerCase();
    if (contract.client?.toLowerCase() === current)
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/40 rounded-md">
          Client (Bên A)
        </span>
      );
    if (contract.provider?.toLowerCase() === current)
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/40 rounded-md">
          Provider (Vận chuyển)
        </span>
      );
    if (contract.receiver?.toLowerCase() === current)
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/40 rounded-md">
          Receiver (Bên B)
        </span>
      );
    return (
      <span className="text-[11px] font-medium text-slate-400">Khách</span>
    );
  };

  const getStatusBadge = (status) => {
    const map = [
      { text: t("listFilterStatus0"), color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
      { text: t("listFilterStatus1"), color: "bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40" },
      { text: t("listFilterStatus2"), color: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40" },
      { text: t("listFilterStatus3"), color: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40" },
      { text: t("listFilterStatus4"), color: "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40" },
      { text: t("listFilterStatus5"), color: "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40" },
    ];
    const s = map[status] || map[0];
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-max ${s.color}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
        {s.text}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5 w-[20%]">{t("tabAddress")}</th>
              <th className="px-5 py-3.5 w-[32%]">{t("createArt1")}</th>
              <th className="px-5 py-3.5 w-[14%]">{t("tabRole")}</th>
              <th className="px-5 py-3.5 w-[12%]">{t("tabValue")}</th>
              <th className="px-5 py-3.5 w-[12%]">{t("tabStatus")}</th>
              <th className="px-5 py-3.5 w-[10%] text-right">{t("tabAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {contracts.map((c) => (
              <ContractRow
                key={c._id}
                c={c}
                walletAddress={walletAddress}
                onShowQR={onShowQR}
                onViewDetails={onViewDetails}
                getRoleBadge={getRoleBadge}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContractTable;
