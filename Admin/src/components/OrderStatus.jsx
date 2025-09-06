import React from "react";

const statusColors = {
  pending: { bg: "#fef3c7", text: "#92400e" },
  confirmed: { bg: "#dcfce7", text: "#166534" },
  processing: { bg: "#bfdbfe", text: "#1d4ed8" },
  shipped: { bg: "#e5e7eb", text: "#4b5563" },
};

export default function OrderStatus({ status }) {
  const { bg, text } = statusColors[status.toLowerCase()] || {
    bg: "#e5e7eb",
    text: "#4b5563",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 9999,
        fontWeight: 500,
        fontSize: 12,
        color: text,
        background: bg,
        textTransform: "capitalize",
        fontFamily: "sans-serif",
      }}
    >
      {status}
    </span>
  );
}