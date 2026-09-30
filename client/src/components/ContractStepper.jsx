import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Check, XCircle } from "lucide-react";

const ContractStepper = ({ currentStatus }) => {
  const { t } = useLanguage();
  const steps = [
    { label: t("statusCreated"), statusId: 0 },
    { label: t("statusAccepted"), statusId: 1 },
    { label: t("statusShipping"), statusId: 2 },
    { label: t("statusCompleted"), statusId: 3 },
    { label: t("statusPaid"), statusId: 4 },
  ];

  if (currentStatus === 5) {
    return (
      <div className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 py-3 px-4 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-colors">
        <XCircle className="w-4 h-4 mr-2" />
        <span>{t("statusCancelled")}</span>
      </div>
    );
  }

  const activeIndex = Math.min(currentStatus, 4);

  return (
    <div className="w-full pt-2 pb-6 px-1">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const isLastStep = index === steps.length - 1;

          return (
            <React.Fragment key={step.statusId}>
              {/* NODE */}
              <div className="relative flex flex-col items-center group">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                    isCompleted
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                  } ${
                    isCurrent ? "ring-4 ring-blue-500/20 scale-110 shadow-lg" : ""
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  ) : (
                    <span className="text-[11px] font-bold">{index + 1}</span>
                  )}
                </div>

                {/* LABEL */}
                <div
                  className={`absolute top-9 sm:top-10 w-20 sm:w-24 text-center text-[10px] sm:text-[11px] font-bold tracking-tight transition-colors duration-200 leading-tight ${
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400 font-extrabold"
                      : isCompleted
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </div>
              </div>

              {/* CONNECTING LINE */}
              {!isLastStep && (
                <div className="flex-1 h-1 mx-1.5 sm:mx-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full bg-blue-500 transition-all duration-500 ease-out origin-left ${
                      index < activeIndex ? "w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ContractStepper;
