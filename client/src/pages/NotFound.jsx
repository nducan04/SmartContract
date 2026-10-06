import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-gray-600">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-4">
        {t("notFoundTitle")}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
        {t("notFoundDesc")}
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all"
      >
        {t("notFoundBackHome")}
      </Link>
    </div>
  );
};

export default NotFound;
