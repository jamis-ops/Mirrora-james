import React, { useState } from "react";
import Notification from "./Notification";
import { X } from "lucide-react";

const initialNotifications = [
  { id: 1, title: "New Order Confirmed", message: "Order #002 has been confirmed." },
  { id: 2, title: "Stock Alert", message: "Vintage Frame Mirror is running low." },
  { id: 3, title: "Account Update", message: "Your admin profile has been updated." },
];

export default function NotificationsList({ onClose }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const dismissNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  return (
    <div className="w-80 px-4 py-6 border-l border-gray-200 bg-gray-50 flex flex-col gap-4 overflow-y-auto box-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 font-sans">
          Notifications
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <X size={20} />
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              title={notification.title}
              message={notification.message}
              onDismiss={() => dismissNotification(notification.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 font-sans">
          No new notifications.
        </p>
      )}
    </div>
  );
}