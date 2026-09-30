import React from "react";
import { assets, menuLinks } from "../assets/assets";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 pt-16 pb-6 mt-24 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-wrap justify-between items-start gap-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          {/* Logo & Description */}
          <div className="flex flex-col min-w-[200px]">
            <Link to="/">
              <img src={assets.blockchainLogo} alt="logo" className="h-8 md:h-9" />
            </Link>
            <p className="max-w-80 mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t("footerDesc")}
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-200"
                aria-label="Facebook"
              >
                <img src={assets.facebook_logo} alt="Facebook" className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-purple-600 hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <img src={assets.instagram_logo} alt="Instagram" className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-400 hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <img src={assets.twitter_logo} alt="Twitter" className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
                aria-label="Gmail"
              >
                <img src={assets.gmail_logo} alt="Gmail" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              {t("footerQuickLinks")}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {menuLinks.map((link, index) => {
                let label = link.name;
                if (link.path === "/") label = t("navHome");
                else if (link.path === "/tracking") label = t("navTracking");
                return (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t("footerAboutUs")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              {t("footerSupport")}
            </h3>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t("footerFaq")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t("footerTerms")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t("footerPrivacy")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t("footerInsurance")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              {t("footerContact")}
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>324 VMU, Nguyễn Bình, Hà Nội</li>
              <li>0123 456 777</li>
              <li>
                <a
                  href="mailto:info@example.com"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  info@example.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between pt-6 text-xs text-gray-400 dark:text-gray-500">
          <p>
            © {new Date().getFullYear()} Smart Contract. All rights reserved.
          </p>
          <ul className="flex items-center gap-4">
            <li>
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t("footerPolicy")}
              </a>
            </li>
            <li>·</li>
            <li>
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t("footerTerms")}
              </a>
            </li>
            <li>·</li>
            <li>
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {t("footerCookies")}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
