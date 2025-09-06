import React from "react";
import { Bell } from "lucide-react";

export default function Header({ onBellClick }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #e5e7eb",
        background: "#fff",
        marginBottom: 24,
      }}
    >
      <div
        onClick={onBellClick}
        style={{ position: "relative", cursor: "pointer" }}
      >
        <Bell size={20} color="#6b7280" />
        <span
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#EF4444",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          3
        </span>
      </div>
    </header>
  );
}