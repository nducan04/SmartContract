import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-9xl font-bold text-gray-600">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Không tìm thấy trang này</h2>
            <p className="text-gray-600 mt-2 mb-8">
                Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.
            </p>
            <Link 
                to="/" 
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
            >
                Quay về Trang chủ
            </Link>
        </div>
    );
};

export default NotFound;