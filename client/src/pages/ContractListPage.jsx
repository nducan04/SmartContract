import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const mockContracts = [
    {
        id: "0x123...",
        terms: "Vận chuyển 1 container hàng may mặc",
        role: "Khách Hàng",
        status: "Đã Chấp Nhận",
        value: "1.5 ETH"
    },
    {
        id: "0x456...",
        terms: "Cung cấp dịch vụ bảo trì phần mềm",
        role: "Nhà Cung Cấp",
        status: "Đang Thực Hiện",
        value: "0.8 ETH"
    },
    {
        id: "0x789...",
        terms: "Giám sát thi công công trình A",
        role: "Người Nhận",
        status: "Đã Hoàn Thành",
        value: "5.0 ETH"
    },
    {
        id: "0xABC...",
        terms: "Thiết kế logo và bộ nhận diện",
        role: "Khách Hàng",
        status: "Đã Thanh Toán",
        value: "0.2 ETH"
    }
];

const ContractListPage = () => {

    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const roleFilter = new URLSearchParams(location.search).get('role');

    useEffect(() => {
        // === Logic Fetch Dữ liệu (Sẽ thay sau) ===
        
        setLoading(true);
        let filteredData = mockContracts;
        if (roleFilter) {
            filteredData = mockContracts.filter(c => c.role.toLowerCase() === roleFilter);
        }
        setContracts(filteredData);
        setLoading(false);

    }, [roleFilter]);

    const getStatusClass = (status) => {
        switch (status) {
            case "Accepted": return "bg-blue-100 text-blue-800";
            case "InProgress": return "bg-yellow-100 text-yellow-800";
            case "Completed": return "bg-green-100 text-green-800";
            case "Paid": return "bg-gray-100 text-gray-800";
            default: return "bg-red-100 text-red-800";
        }
    };

  return (
    <div className='p-4'>

        <h1 className='text-3xl font-bold text-gray-900 mb-6'>
            Quản Lý Hợp Đồng
        </h1>

        {/* Thêm các tab lọc (Tất cả, Client, Provider, Receiver) */}
        {loading ? (
            <p>Đang tải hợp đồng...</p>
        ) : (
            <div className='bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Mô tả</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Vai trò của bạn</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Trạng thái</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Giá trị</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'></th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {contracts.map((contract) => (
                            <tr key={contract.id} className='hover:bg-gray-50'>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <p className='text-sm font-medium text-gray-900'>{contract.terms}</p>
                                    <p className='text-sm text-gray-500'>ID: {contract.id.substring(0, 10)}...</p>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className="text-sm text-gray-700">{contract.role}</span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className='{`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${getStatusClass(contract.status)}`}'>
                                        {contract.status}
                                    </span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <span className='text-sm font-bold text-gray-900'>{contract.value}</span>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                    <Link to={`/dashboard/contract/${contract.id}`} className="text-blue-600 hover:text-blue-900">
                                        Xem chi tiết
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

    </div>
  )
}

export default ContractListPage