import React from 'react'
import { assets, menuLinks } from '../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-60 text-sm text-gray-500 bg-gray-50 pt-16'>
            <div className='flex flex-wrap justify-between items-start gap-8 pb-6 border-borderColor border-b'>
                <div>
                    <img src={assets.blockchainLogo} 
                    alt="logo" className='h-8 md:h-9' />
                    <p className='max-w-80 mt-3'>
                        Nền tảng quản lý hợp đồng phi tập trung,
                        đảm bảo minh bạch, tự động và bảo mật bằng công nghệ Blockchain.
                    </p>
                    <div className='flex items-center gap-3 mt-6'>
                        <a href="#"> <img src={assets.facebook_logo} alt="" className='w-5 h-5' /> </a>                        
                        <a href="#"> <img src={assets.instagram_logo} alt="" className='w-5 h-5' /> </a>                        
                        <a href="#"> <img src={assets.twitter_logo} alt="" className='w-5 h-5' /> </a>                        
                        <a href="#"> <img src={assets.gmail_logo} alt="" className='w-5 h-5' /> </a>                        
                    </div>
                </div>

                <div>
                    <h2 className='text-base font-medium text-gray-800 uppercase'>LIÊN KẾT NHANH</h2>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        {menuLinks.map((link, index) => (
                            <li key={index}>
                                <Link to={link.path} className="hover:text-blue-600">{link.name}</Link>
                            </li>
                        ))}
                        <li><Link to="/" className="hover:text-blue-600">Về Chúng Tôi</Link></li>
                    </ul>
                </div>

                <div>
                    <h2 className='text-base font-medium text-gray-800 uppercase'>HỖ TRỢ</h2>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li><a href="#">Câu Hỏi Thường Gặp - FAQ</a></li>
                        <li><a href="#">Điều Khoản Dịch Vụ</a></li>
                        <li><a href="#">Chính Sách Bảo Mật  </a></li>
                        <li><a href="#">Chính Sách Bảo Hiểm</a></li>
                    </ul>
                </div>

                <div>
                    <h2 className='text-base font-medium text-gray-800 uppercase'>LIÊN HỆ</h2>
                    <ul className='mt-3 flex flex-col gap-1.5'>
                        <li><a href="#">324 VMU</a></li>
                        <li><a href="#">Nguyễn Bình</a></li>
                        <li><a href="#">012345677</a></li>
                        <li><a href="#">info@example.com</a></li>
                    </ul>
                </div>
            </div>

            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} <a href="https://prebuiltui.com">PrebuiltUI</a>. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Chính Sách</a></li>
                    <li>|</li>
                    <li><a href="#">Điều Khoản</a></li>
                    <li>|</li>
                    <li><a href="#">Cookies</a></li>
                </ul>
            </div>
        </div>
  )
}

export default Footer