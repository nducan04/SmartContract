import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
// import { assets } from '../assets/assets'; // (Chưa cần assets)

// Dữ liệu giả
const statsData = {
  client: {
    count: 5,
    label: "Hợp đồng bạn đã tạo",
    link: "/dashboard/contracts?role=client",
  },
  provider: {
    count: 2,
    label: "Hợp đồng bạn đã chấp nhận",
    link: "/dashboard/contracts?role=provider",
  },
  receiver: {
    count: 1,
    label: "Hợp đồng chờ bạn xác nhận",
    link: "/dashboard/contracts?role=receiver",
  },
};

const DashboardOverview = () => {
  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chào Mừng Trở Lại!</h1>
        <p className="text-gray-600 mt-1">
          Đây là tổng quan về các hoạt động hợp đồng của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thẻ 1: Vai trò Khách hàng (Client) */}
        <Link
          to={statsData.client.link}
          className="block p-6 bg-white rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-300 rounded-full">
              <i className="uil uil-file-plus-alt text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {statsData.client.count}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {statsData.client.label}
              </p>
            </div>
          </div>
        </Link>

        {/* Thẻ 2: Vai trò Nhà cung cấp (Provider) */}
        <Link
          to={statsData.provider.link}
          className="block p-6 bg-white rounded-lg shadow-lg 
                border border-gray-100 hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-300 rounded-full">
              <i className="uil uil-truck text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {statsData.provider.count}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {statsData.provider.label}
              </p>
            </div>
          </div>
        </Link>

        {/* Thẻ 3: Vai trò Người nhận (Receiver) */}
        <Link
          to={statsData.receiver.link}
          className="block p-6 bg-white rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-300 rounded-full">
              <i className="uil uil-check-circle text-2xl text-yellow-600"></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {statsData.receiver.count}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {statsData.receiver.label}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Bạn có hợp đồng mới?
        </h2>
        <p className="text-gray-600 mt-2 mb-4">
          Bắt đầu một thỏa thuận mới an toàn và minh bạch ngay hôm nay.
        </p>
        <Link
          to="/dashboard/create" // Link tới trang tạo (từ file assets.js)
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Tạo Hợp đồng mới
        </Link>
      </div>
    </div>
  );
};

export default DashboardOverview;
