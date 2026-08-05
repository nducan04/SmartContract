import React from "react";
import { useLanguage } from "../context/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      step: "01",
      title: t("step1Title"),
      desc: t("step1Desc"),
      icon: "uil-file-plus-alt",
    },
    {
      step: "02",
      title: t("step2Title"),
      desc: t("step2Desc"),
      icon: "uil-truck",
    },
    {
      step: "03",
      title: t("step3Title"),
      desc: t("step3Desc"),
      icon: "uil-sync",
    },
    {
      step: "04",
      title: t("step4Title"),
      desc: t("step4Desc"),
      icon: "uil-bill",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-[#F8F9FD] relative overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {t("howTitle")}
          </h2>
          <p className="text-gray-500 mt-4">
            {t("howSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Đường kẻ nối (Chỉ hiện trên desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-300 border-t-2 border-dashed border-gray-300 -z-10"></div>

          {steps.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white group-hover:border-blue-500 transition-all duration-300 z-10 relative">
                  <i
                    className={`uil ${item.icon} text-4xl text-gray-700 group-hover:text-blue-600 transition-colors`}
                  ></i>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-md">
                  {item.step}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 px-4">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
