import React from "react";
import { assets } from "../assets/assets";

const steps = [
  {
    step: "01",
    title: "Tạo Hợp đồng & Ký quỹ",
    description:
      "Khách hàng (Client) nhập chi tiết dịch vụ, file điều khoản (tải lên IPFS) và ký quỹ (escrow) tiền vào Hợp đồng thông minh.",
    icon: assets.contractSetup,
  },
  {
    step: "02",
    title: "Nhà cung cấp Chấp nhận",
    description:
      "Nhà cung cấp (Provider) xem xét các hợp đồng đang chờ và gửi giao dịch 'Chấp nhận', chính thức khóa thỏa thuận.",
    icon: assets.approved,
  },
  {
    step: "03",
    title: "Thực hiện & Cập nhật",
    description:
      "Nhà cung cấp thực hiện dịch vụ và cập nhật các trạng thái ('InProgress', 'Completed') lên Blockchain.",
    icon: assets.statusUpdate,
  },
  {
    step: "04",
    title: "Xác nhận & Thanh toán",
    description:
      "Người nhận (Receiver) xác nhận dịch vụ đã hoàn thành. Hợp đồng ngay lập tức tự động thanh toán tiền ký quỹ cho Nhà cung cấp.",
    icon: assets.confirmPayment,
  },
];

const HowItWorks = () => {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="container mx-auto px-6 lg:px-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Quy trình hoạt động
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chỉ với 4 bước đơn giản để đảm bảo một thỏa thuận minh bạch và tự
            động hoàn toàn.
          </p>
        </div>

        <div className="relative">
          {/* Đường kẻ dọc ở giữa (chỉ hiển thị trên desktop) */}
          <div className="hidden md:block absolute w-0.5 h-full bg-blue-200 top-0 left-1/2 transform -translate-x-1/2"></div>

          {steps.map((item, index) => (
            <div key={index} className="relative mb-12 flex items-center">
              <div
                className={`flex w-full ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Phần nội dung (Trái/Phải) */}
                <div className="w-full md:w-5/12 p-6 bg-white rounded-lg shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold text-blue-600 mb-2">
                    {item.step}. {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>

                {/* Dấu chấm tròn và Icon (ở giữa) */}
                <div className="hidden md:flex w-2/12 items-center justify-center">
                  <div
                    className="relative z-10 flex items-center justify-center
                                    h-20 w-20 bg-amber-100 rounded-full text-white shadow-lg"
                  >
                    {item.icon.startsWith("uil") ? (
                      <i className={`${item.icon} text-4xl`}></i>
                    ) : (
                      <img
                        src={item.icon}
                        alt={item.title}
                        className="w-10 h-10"
                      />
                    )}
                  </div>
                </div>

                {/* Phần trống (chỉ cho desktop) */}
                <div className="hidden md:block w-5/12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
