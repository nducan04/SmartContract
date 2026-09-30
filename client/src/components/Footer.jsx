import React from "react";
import { assets, menuLinks } from "../assets/assets";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 pt-16 pb-8 border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Logo & Info (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-slate-800 border border-blue-500/20 shadow-xs flex items-center justify-center shrink-0">
                <img
                  src={assets.iconLogo}
                  alt="Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                Smart<span className="text-blue-600 dark:text-blue-400">Contract</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-sm">
              {t("footerDesc")}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <img src={assets.facebook_logo} alt="Facebook" className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <img src={assets.instagram_logo} alt="Instagram" className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-colors"
                aria-label="Twitter"
              >
                <img src={assets.twitter_logo} alt="Twitter" className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-colors"
                aria-label="Gmail"
              >
                <img src={assets.gmail_logo} alt="Gmail" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {t("footerQuickLinks")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {menuLinks.map((link, index) => {
                let label = link.name;
                if (link.path === "/") label = t("navHome");
                else if (link.path === "/tracking") label = t("navTracking");
                return (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {t("footerSupport")}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footerFaq")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footerTerms")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footerPrivacy")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footerInsurance")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              {t("footerContact")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>324 VMU, Nguyễn Bình, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>0123 456 777</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a
                  href="mailto:contact@smartcontract.io"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                >
                  contact@smartcontract.io
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Smart Contract Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">{t("footerPolicy")}</a>
            <span>•</span>
            <a href="#" className="hover:underline">{t("footerTerms")}</a>
            <span>•</span>
            <a href="#" className="hover:underline">{t("footerCookies")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
