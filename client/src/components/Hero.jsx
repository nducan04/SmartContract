import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-white overflow-hidden pt-10 pb-20 lg:pt-20 lg:pb-32">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-purple-50 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/4"></div>

      <div className="container mx-auto px-6 lg:px-24">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content Bên Trái */}
          <div className="lg:w-1/2 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Công nghệ Blockchain 4.0
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Quản Lý Hợp Đồng <br />
              <span className="text-gray-900 bg-clip-text bg-linear-to-r">
                Minh Bạch & Tự Động
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Giải pháp tối ưu cho chuỗi cung ứng logistics. Loại bỏ trung gian,
              giảm thiểu rủi ro và tự động hóa thanh toán với Smart Contract an
              toàn tuyệt đối.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 
                transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="uil uil-rocket"></i> Bắt đầu ngay
              </button>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 
                transition-all flex items-center justify-center gap-2"
              >
                <i className="uil uil-play-circle"></i> Xem quy trình
              </a>
            </div>

            {/* Stats nhỏ */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-gray-100">
              <div>
                <p className="text-3xl font-bold text-gray-900">100%</p>
                <p className="text-sm text-gray-500 font-medium">Bảo mật</p>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div>
                <p className="text-3xl font-bold text-gray-900">0s</p>
                <p className="text-sm text-gray-500 font-medium">
                  Độ trễ thanh toán
                </p>
              </div>
            </div>
          </div>

          {/* Hình ảnh Bên Phải */}
          <div className="lg:w-1/2 relative">
            <div className="relative z-10 animate-float">
              {" "}
              {/* Hiệu ứng bay nhẹ */}
              <img
                src={assets.hero_img || assets.characterImg} // Ưu tiên ảnh Hero nếu có
                alt="Blockchain Dashboard"
                className="w-full max-w-lg mx-auto drop-shadow-2xl"
              />
            </div>

            {/* Vòng tròn trang trí sau lưng ảnh */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full opacity-60 blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
