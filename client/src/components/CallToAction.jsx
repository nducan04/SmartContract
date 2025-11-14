import React from 'react'
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {

    const navigate = useNavigate();
    
    const handleStart = () => {
        // (Sau này Navbar sẽ xử lý việc kết nối ví trước)
        navigate('/dashboard'); 
    };

  return (
    <section className='bg-white'>
        <div className='container mx-auto px-6 lg:px-24 py-20 lg:py-24'>
            <div className='flex flex-col items-center text-center'>
                
                <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
                    Sẵn sàng để Minh bạch hóa Quy trình của bạn?
                </h2>

                <p className='text-lg text-gray-600 opacity-90 max-w-2xl mb-8'>
                    Tham gia ngay hôm nay để trải nghiệm sức mạnh của hợp đồng thông minh.
                    Kết nối ví của bạn và tạo thỏa thuận đầu tiên chỉ trong vài phút.
                </p>

                <button onClick={handleStart}
                className='px-10 py-4 bg-white text-blue-700 font-semibold rounded-full shadow-lg 
                hover:bg-gray-100 transition-all transform hover:scale-105 text-lg cursor-pointer' >
                    Bắt đầu ngay
                </button>

            </div>
        </div>
    </section>
  )
}

export default CallToAction