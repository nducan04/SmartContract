import React from 'react'
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Hero = () => {

  const navigate = useNavigate();

  // điều hướng người dùng đến trang tạo hợp đồng
  // (hoặc kích hoạt modal kết nối ví, tùy logic sau này)
  const handleStart = () => {
    navigate('/dashboard');
  };

  return (
    
    <section className='relative bg-linear-to-r from-blue-300 to-blue-400 text-white overflow-hidden'>

      <div className='absolute inset-0 opacity-10'>
        <svg viewBox="0 0 1440 560" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 480C240 360 480 240 720 360C960 480 1200 600 1440 480V560H0V480Z" fill="white"/>
        </svg>
      </div>

      <div className='container mx-auto px-6 lg:px-24 py-20 lg:py-32 relative z-10'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-12'>
          <div className='lg:w-1/2 text-center lg:text-left'>

            <h1 className='className="text-4xl lg:text-5xl font-bold leading-tight mb-6'>Quản Lý Hợp Đồng Thông Minh</h1>
            <p className='text-lg lg:text-xl text-blue-100 opacity-90 mb-8'>
              Nền tảng ứng dụng Blockchain đảm bảo tính minh bạch, 
              tự động hóa thanh toán và bảo mật tuyệt đối cho mọi thỏa thuận.
            </p>

            <div className='flex justify-center lg:justify-start gap-4'>
              <button onClick={handleStart} 
              className='px-8 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-lg 
              hover:bg-gray-100 transition-all transform hover:scale-105'>
                Bắt đầu ngay
              </button>
              <a 
                href='#benefits'
                className='px-8 py-3 bg-blue-500 text-white font-semibold rounded-full 
                border border-blue-400 hover:bg-blue-400 transition-all'>
                Tìm hiểu thêm
              </a>
            </div>

          </div>

          <div className='lg:w-1/2 flex justify-center'>
            <img src={assets.characterImg} alt="Logistics Blockchain" className='w-full max-w-md lg:max-w-lg' />
          </div>

        </div>
      </div>

    </section>

  )
}

export default Hero