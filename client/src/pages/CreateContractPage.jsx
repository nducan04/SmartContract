import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';


const CreateContractPage = () => {

    const [receiver, setReceiver] = useState('');
    const [terms, setTerms] = useState('');
    const [amount, setAmount] = useState('');
    const [file, setFile] = useState(null); // State cho file PDF

    // State cho Giao dịch
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');

    const { factoryContract, signer } = useWeb3();
    const navigate = useNavigate();

    // 1. HÀM TẢI FILE LÊN IPFS (PINATA)
    const uploadToIPFS = async () => {
        if (!file) {
            setError('Vui lòng chọn một file điều khoản (PDF, JPG...)');
            return null;
        }
        
        console.log("Key của tôi là:", import.meta.env.VITE_PINATA_JWT);

        setStatus('Đang tải file điều khoản lên IPFS...');
        const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
        
        // Tạo dữ liệu form
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await axios.post(url, formData, {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
                }
            });
            
            // Trả về Hash (còn gọi là CID)
            return response.data.IpfsHash; 
        } catch (ipfsError) {
            console.error('Lỗi khi tải lên IPFS:', ipfsError);
            setError('Không thể tải file lên IPFS. Vui lòng kiểm tra API Key.');
            return null;
        }
    };

    // 2. HÀM SUBMIT FORM
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');

        if (!factoryContract || !signer) {
            setError('Vui lòng kết nối ví trước khi tạo hợp đồng.');
            return;
        }
        
        // Kiểm tra địa chỉ ví hợp lệ
        if (!ethers.isAddress(receiver)) {
            setError('Địa chỉ ví Người nhận không hợp lệ.');
            return;
        }

        setLoading(true);

        // BƯỚC A: Tải file lên IPFS
        const termsHash = await uploadToIPFS();
        if (!termsHash) {
            setLoading(false);
            return; // Dừng lại nếu tải file thất bại
        }

        setStatus(`File đã tải lên IPFS! Hash: ${termsHash}`);
        
        try {
            // BƯỚC B: GỬI GIAO DỊCH LÊN BLOCKCHAIN
            setStatus('Đang chuẩn bị giao dịch...');

            // Chuyển đổi ETH sang Wei
            const amountInWei = ethers.parseEther(amount);

            // Gọi hàm createAgreement từ Hợp đồng MẸ
            const tx = await factoryContract.createAgreement(
                receiver,
                terms,
                termsHash,
                { value: amountInWei } // Gửi tiền ký quỹ kèm theo
            );

            setStatus('Đang chờ xác nhận giao dịch (xin chờ)...');
            await tx.wait(); // Chờ giao dịch được đào

            setLoading(false);
            setStatus('Thành công! Hợp đồng đã được tạo.');
            
            // Chuyển hướng về trang quản lý sau 2 giây
            setTimeout(() => {
                navigate('/dashboard/contracts');
            }, 2000);

        } catch (txError) {
            setLoading(false);
            console.error('Lỗi khi tạo hợp đồng:', txError);
            setError('Giao dịch thất bại. Bạn đã hủy, hoặc không đủ Gas.');
        }
    };

  return (
    <div className='p-4 max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-6'>Tạo Hợp Đồng Mới</h1>

        <form onSubmit={handleSubmit} className='space-y-6 bg-white p-8 shadow-lg rounded-lg border border-gray-200'>

            <div>
                <label htmlFor="receiver" className="block text-sm font-medium text-gray-700">Địa chỉ ví người nhận (Receiver)</label>
                <input
                    id="receiver"
                    type="text"
                    required
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    placeholder="0x..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label htmlFor="terms" className="block text-sm font-medium text-gray-700">Mô tả Dịch vụ / Hàng hóa</label>
                <textarea
                    id="terms"
                    rows={3}
                    required
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Ví dụ: Vận chuyển 1 container hàng may mặc từ cảng A đến cảng B"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Số tiền Ký quỹ (ETH)</label>
                <input
                    id="amount"
                    type="number"
                    step="0.001"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ví dụ: 1.5"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div>
                <label htmlFor='file' className="block text-sm font-medium text-gray-700">File Điều khoản (PDF, JPG...)</label>
                <input
                    id="file"
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files[0])}
                    className='mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0 file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all
                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {loading ? 'Đang xử lý...' : 'Tạo Hợp đồng & Ký quỹ'}
                </button>

                {/* Hiển thị thông báo trạng thái hoặc lỗi */}
                {status && <p className="mt-4 text-sm text-green-600">{status}</p>}
                {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </div>
            
        </form>
    </div>
  )
}

export default CreateContractPage