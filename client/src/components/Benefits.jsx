import React from 'react'
import { assets } from '../assets/assets';


const benefitData = [
    {
        icon: assets.transparency,
        title: "Minh bạch tuyệt đối",
        description: "Mọi trạng thái, lịch sử của hợp đồng đều được ghi lại vĩnh viễn trên Blockchain, không thể thay đổi hay xóa bỏ."
    },
    {
        icon: assets.automaticMoney,
        title: "Tự động thanh toán (Escrow)",
        description: "Tiền ký quỹ được khóa an toàn. Hợp đồng sẽ tự động thanh toán cho Nhà cung cấp ngay khi Người nhận xác nhận, không cần bên thứ ba."
    },
    {
        icon: assets.security,
        title: "Bảo mật & Bất biến",
        description: "Sử dụng mã hóa và cơ chế đồng thuận phi tập trung, đảm bảo không ai có thể can thiệp hay làm giả thông tin hợp đồng."
    }
];

const Benefits = () => {
  return (
    <section id='benefits' className='bg-gray-50 py-20 lg:py-24'>

        <div className='container mx-auto px-6 lg:px-24'>

            <div className='text-center mb-16'>
                <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-4'>
                    Tại Sao Nên Chọn Hệ thống Của Chúng Tôi?
                </h2>
                <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                    Khám phá những lợi ích vượt trội mà công nghệ hợp đồng thông minh mang lại
                    cho quy trình quản lý của bạn.
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                {benefitData.map((item, index) => (
                    <div key={index} className='bg-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-2'>
                        
                        <div className="flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-6">
                            <img src={item.icon} alt="" />
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {item.title}
                        </h3>

                        <p className="text-gray-600">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>

        </div>

    </section>
  )
}

export default Benefits