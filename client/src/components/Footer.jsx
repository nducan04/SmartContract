import React from "react";
import { assets, menuLinks } from "../assets/assets";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-60 text-sm text-gray-500 bg-gray-50 pt-16">
      <div className="flex flex-wrap justify-between items-start gap-8 pb-6 border-borderColor border-b">
        <div>
          <img src={assets.blockchainLogo} alt="logo" className="h-8 md:h-9" />
          <p className="max-w-80 mt-3">
            {t("footerDesc")}
          </p>
          <div className="flex items-center gap-3 mt-6">
            <a href="#">
              {" "}
              <img src={assets.facebook_logo} alt="" className="w-5 h-5" />{" "}
            </a>
            <a href="#">
              {" "}
              <img
                src={assets.instagram_logo}
                alt=""
                className="w-5 h-5"
              />{" "}
            </a>
            <a href="#">
              {" "}
              <img src={assets.twitter_logo} alt="" className="w-5 h-5" />{" "}
            </a>
            <a href="#">
              {" "}
              <img src={assets.gmail_logo} alt="" className="w-5 h-5" />{" "}
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-base font-medium text-gray-800 uppercase">
            {t("footerQuickLinks")}
          </h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            {menuLinks.map((link, index) => {
              let label = link.name;
              if (link.path === "/") label = t("navHome");
              else if (link.path === "/tracking") label = t("navTracking");
              return (
                <li key={index}>
                  <Link to={link.path} className="hover:text-blue-600">
                    {label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link to="/" className="hover:text-blue-600">
                {t("footerAboutUs")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-medium text-gray-800 uppercase">
            {t("footerSupport")}
          </h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            <li>
              <a href="#">{t("footerFaq")}</a>
            </li>
            <li>
              <a href="#">{t("footerTerms")}</a>
            </li>
            <li>
              <a href="#">{t("footerPrivacy")}</a>
            </li>
            <li>
              <a href="#">{t("footerInsurance")}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-medium text-gray-800 uppercase">
            {t("footerContact")}
          </h2>
          <ul className="mt-3 flex flex-col gap-1.5">
            <li>
              <a href="#">324 VMU</a>
            </li>
            <li>
              <a href="#">Nguyễn Bình</a>
            </li>
            <li>
              <a href="#">012345677</a>
            </li>
            <li>
              <a href="#">info@example.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-5">
        <p>
          © {new Date().getFullYear()}{" "}
          <a href="https://prebuiltui.com">PrebuiltUI</a>. All rights reserved.
        </p>
        <ul className="flex items-center gap-4">
          <li>
            <a href="#">{t("footerPolicy")}</a>
          </li>
          <li>|</li>
          <li>
            <a href="#">{t("footerTerms")}</a>
          </li>
          <li>|</li>
          <li>
            <a href="#">{t("footerCookies")}</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
