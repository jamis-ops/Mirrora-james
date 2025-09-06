import React from "react";
import { Info, X } from "lucide-react";

export default function Notification({ title, message, onDismiss }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ color: "#8B5E3C", flexShrink: 0 }}>
        <Info size={20} />
      </div>
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#2C1810", marginBottom: 4 }}>
          {title}
        </h4>
        <p style={{ fontSize: 12, color: "#6b7280" }}>{message}</p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}