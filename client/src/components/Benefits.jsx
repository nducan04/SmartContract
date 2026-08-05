import React from "react";
import { assets } from "../assets/assets";
import { useLanguage } from "../context/LanguageContext";

const Benefits = () => {
  const { t } = useLanguage();

  const benefitData = [
    {
      icon: assets.transparency,
      title: t("benefit1Title"),
      description: t("benefit1Desc"),
    },
    {
      icon: assets.automaticMoney,
      title: t("benefit2Title"),
      description: t("benefit2Desc"),
    },
    {
      icon: assets.security,
      title: t("benefit3Title"),
      description: t("benefit3Desc"),
    },
  ];

  return (
    <section id="benefits" className="bg-gray-50 py-20 lg:py-24">
      <div className="container mx-auto px-6 lg:px-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t("benefitsTitle")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("benefitsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefitData.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-2"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-blue-100 rounded-full mb-6">
                <img src={item.icon} alt="" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {item.title}
              </h3>

              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
