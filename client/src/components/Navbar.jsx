import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { assets, menuLinks } from '../assets/assets';
import { useWeb3 } from '../context/Web3Context';
import UserDropdown from './UserDropdown';

const Navbar = () => {
    const { walletAddress, walletBalance, connectWallet, disconnectWallet } = useWeb3();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const location = useLocation();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/dashboard/contract/${searchTerm.trim()}`);
            setSearchTerm('');
            setOpen(false);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    // Style điều kiện
    const isHome = location.pathname === "/";
    const navBgClass = isHome ? "bg-white/80 backdrop-blur-md" : "bg-white shadow-sm";

    return (
        <div className={`sticky top-0 z-40 w-full border-b border-gray-100 transition-all ${navBgClass}`}>
            <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4">
                
                {/* 1. LOGO */}
                <Link to="/" className="shrink-0">
                    <img src={assets.logoDark} alt="Logo" className="h-8 hover:opacity-80 transition-opacity" />
                </Link>

                {/* 2. MENU DESKTOP & SEARCH */}
                <div className={`
                    fixed inset-0 z-50 bg-white flex flex-col p-10 gap-6 transition-transform duration-300
                    md:static md:bg-transparent md:flex-row md:p-0 md:gap-8 md:items-center md:translate-x-0
                    ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
                `}>
                    {/* Nút đóng menu mobile */}
                    <button className="md:hidden absolute top-5 right-5" onClick={() => setMobileMenuOpen(false)}>
                        <img src={assets.close_icon} className="w-6" alt="close" />
                    </button>

                    {/* Links */}
                    {menuLinks.map((link, index) => (
                        <Link 
                            key={index} 
                            to={link.path} 
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-gray-600 font-medium hover:text-blue-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className='hidden lg:flex items-center text-sm gap-2 border border-borderColor px-3 rounded-full max-w-56'>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" 
                            placeholder="Tìm kiếm theo ID..." 
                        />
                        <button type="submit">
                            <img src={assets.search_icon} alt="search" className="cursor-pointer hover:opacity-70" />
                        </button>
                    </form>

                    {/* Dashboard Button */}
                    <button 
                        onClick={() => handleNavigate('/dashboard')} 
                        className='text-gray-600 font-medium hover:text-blue-600 transition-colors cursor-pointer'
                    >
                        Bảng Điều Khiển
                    </button>
                </div>

                {/* 3. KHU VỰC VÍ / TÀI KHOẢN */}
                <div className="flex items-center space-x-4">
                    {walletAddress ? (
                        // Nếu đã kết nối -> Hiển thị UserDropdown
                        <UserDropdown 
                            walletAddress={walletAddress}
                            walletBalance={walletBalance}
                            disconnectWallet={disconnectWallet}
                        />
                    ) : (
                        // Nếu chưa kết nối -> Hiển thị nút Kết nối
                        <button 
                            onClick={connectWallet}
                            className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5'
                        >
                            <img src={assets.walletIcon} alt="wallet" className="w-5 h-5 brightness-0 invert" />
                            <span className="hidden sm:inline">Kết nối Ví</span>
                        </button>
                    )}

                    {/* Nút mở menu Mobile */}
                    <button className='md:hidden p-2' onClick={() => setMobileMenuOpen(true)}>
                        <img src={assets.menu_icon} alt="menu" className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;