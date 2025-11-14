import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { assets, menuLinks } from '../assets/assets';

const Navbar = ({ walletAddress, setWalletAddress }) => {
    
    const [walletBalance, setWalletBalance] = useState(null);
    const [open, setOpen] = useState(false); // Menu mobile
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false); // dropdown

    const location = useLocation();
    const navigate = useNavigate();

    // Kết nối ví
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const account = accounts[0];
                
                setWalletAddress(account);

                const balance = await provider.getBalance(account);
                setWalletBalance(ethers.formatEther(balance));
                
                setOpen(false);
                setIsUserMenuOpen(true); 
            } catch (error) {
                console.error("Lỗi khi kết nối ví:", error);
            }
        } else {
            alert("Vui lòng cài đặt Metamask!");
        }
    };

    // Ngắt kết nối 
    const disconnectWallet = () => {
        setWalletAddress(null);
        setWalletBalance(null);
        setIsUserMenuOpen(false);
    };

    // Điều hướng và đóng menu
    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <div className={`flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32
        py-4 text-gray-600 border-b border-borderColor relative transition-all
        ${location.pathname === "/" ? "bg-light" : "bg-white"}`}>
            
            <Link to="/">
                <img src={assets.logoDark} alt="Logo" className="h-8" />
            </Link>

            {/* Menu (Desktop & Mobile Container) */}
            <div className={`max-sm:fixed max-sm:h-screen max-sm:w-full max-sm:top-16 
            max-sm:border-t border-borderColor right-0 flex flex-col sm:flex-row 
            items-start sm:items-center gap-4 sm:gap-8 max-sm:p-4 transition-all duration-300 z-50
            ${location.pathname === "/" ? "bg-light" : "bg-white"} 
            ${open ? "max-sm:translate-x-0" : "max-sm:translate-x-full"}`}>
                
                {menuLinks.map((link, index) => (
                    <Link key={index} to={link.path} onClick={() => setOpen(false)}>
                        {link.name}
                    </Link>
                ))}

                <div className='hidden lg:flex items-center text-sm gap-2 border border-borderColor
                px-3 rounded-full max-w-56'>
                    <input type="text" className="py-1.5 w-full bg-transparent outline-none 
                    placeholder-gray-500" placeholder="Tìm kiếm hợp đồng" />
                    <img src={assets.search_icon} alt="search" />
                </div>

                <button onClick={() => handleNavigate('/dashboard')} className='cursor-pointer'>Bảng Điều Khiển</button>
            </div>

            {/*logic avatar */}
            <div className="flex items-center space-x-2">
                {walletAddress ? (
                    // 1. nếu đã kết nối
                    <div className="relative">
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                            <img 
                                src={assets.anh_pmt}
                                className="rounded-full h-9 w-9" 
                                alt="Avatar" 
                            />
                        </button>
                        
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-4 px-5 z-50">
                                <div className="flex items-center space-x-3 pb-3">
                                    <img src={assets.anh_pmt} className="rounded-full h-12 w-12" alt="Avatar" />                                    
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">Ví điện tử:</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                                        </p>
                                        <button onClick={() => navigator.clipboard.writeText(walletAddress)} className="text-gray-400 hover:text-blue-600">
                                            <i className="uil uil-copy"></i>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500">Số dư:</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {walletBalance ? parseFloat(walletBalance).toFixed(4) : '0'} ETH
                                    </p>
                                </div>
                                <hr className="my-4" />
                                <button onClick={disconnectWallet} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 
                                p-2 rounded-md w-full cursor-pointer">
                                    <i className="uil uil-sign-out-alt text-lg"></i>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // 2. nếu chưa kết nối
                    <button 
                        onClick={connectWallet}
                        className='cursor-pointer p-2 rounded-full hover:bg-gray-100'
                    >
                        <img src={assets.walletIcon} alt="wallet-icon" className="h-6 w-6" />
                    </button>
                )}

                {/* Nút Menu Mobile */}
                <button className='sm:hidden cursor-pointer' aria-label='Menu' onClick={() => setOpen(!open)}>
                    <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Navbar;