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
    <div
      style={{
        width: 300,
        padding: "24px 16px",
        borderLeft: "1px solid #e5e7eb",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#2C1810", fontFamily: "sans-serif" }}>
          Notifications
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b7280",
            padding: 0,
          }}
        >
          <X size={20} />
        </button>
      </div>

      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Notification
            key={notification.id}
            title={notification.title}
            message={notification.message}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))
      ) : (
        <p style={{ fontSize: 14, color: "#6b7280", fontFamily: "sans-serif" }}>
          No new notifications.
        </p>
      )}
    </div>
  );
}