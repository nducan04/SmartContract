import React, { createContext, useState, useContext } from 'react';
import { ethers } from 'ethers';

// Import ABI và Địa chỉ chúng ta vừa tạo
import { factoryABI, factoryAddress, agreementABI } from '../constants';

// 1. Tạo Context
const Web3Context = createContext();

// 2. Tạo Provider (Component "bọc" ứng dụng)
export const Web3Provider = ({ children }) => {
    
    // State để lưu trữ các đối tượng quan trọng
    const [walletAddress, setWalletAddress] = useState(null);
    const [walletBalance, setWalletBalance] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    
    // State quan trọng nhất: Instance của Hợp đồng MẸ (Factory)
    const [factoryContract, setFactoryContract] = useState(null);

    // Hàm kết nối ví (Cập nhật từ Navbar)
    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Vui lòng cài đặt Metamask!");
            return;
        }

        try {
            const ethProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(ethProvider);

            // Yêu cầu kết nối tài khoản
            const accounts = await ethProvider.send("eth_requestAccounts", []);
            const account = accounts[0];
            setWalletAddress(account);

            // Lấy số dư
            const balance = await ethProvider.getBalance(account);
            setWalletBalance(ethers.formatEther(balance));

            // Lấy Signer (Đối tượng để "ký" giao dịch)
            const ethSigner = await ethProvider.getSigner();
            setSigner(ethSigner);

            // TẠO INSTANCE CỦA HỢP ĐỒNG MẸ (FACTORY)
            const factory = new ethers.Contract(
                factoryAddress,
                factoryABI,
                ethSigner
            );
            setFactoryContract(factory);

        } catch (error) {
            console.error("Lỗi khi kết nối ví:", error);
        }
    };

    // Hàm để lấy một Hợp đồng CON (Chúng ta sẽ dùng sau)
    const getAgreementContract = (contractAddress) => {
        if (!signer) return null;
        return new ethers.Contract(contractAddress, agreementABI, signer);
    };

    return (
        <Web3Context.Provider value={{ 
            // Trạng thái
            walletAddress,
            walletBalance,
            provider,
            signer,
            factoryContract, // Hợp đồng MẸ

            // Hàm
            connectWallet,
            getAgreementContract // Hàm lấy hợp đồng CON
        }}>
            {children}
        </Web3Context.Provider>
    );
};

// 3. Tạo custom Hook (để các component con dễ dàng sử dụng)
export const useWeb3 = () => {
    return useContext(Web3Context);
};