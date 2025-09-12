// src/components/Notification.jsx

import React from "react";
import { Info, X } from "lucide-react";

export default function Notification({ title, message, onDismiss, type = "info" }) {
  const typeStyles = {
    info: {
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      titleColor: "text-blue-800",
      messageColor: "text-blue-600",
    },
    success: {
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      titleColor: "text-green-800",
      messageColor: "text-green-600",
    },
    warning: {
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      titleColor: "text-yellow-800",
      messageColor: "text-yellow-600",
    },
    danger: {
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      titleColor: "text-red-800",
      messageColor: "text-red-600",
    },
  };

  const currentStyles = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl shadow-lg border-l-4 ${currentStyles.borderColor} ${currentStyles.bgColor} transition-transform duration-300 ease-out transform hover:scale-[1.02]`}
    >
      <div className={`flex-shrink-0 ${currentStyles.iconColor}`}>
        <Info size={24} />
      </div>
      <div className="flex-grow">
        <h4 className={`text-sm font-semibold ${currentStyles.titleColor} mb-1`}>
          {title}
        </h4>
        <p className={`text-xs ${currentStyles.messageColor}`}>{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 rounded-full"
      >
        <X size={16} />
      </button>
    </div>
  );
}