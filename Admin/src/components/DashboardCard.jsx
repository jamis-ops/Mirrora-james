import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.jsx";

export default function DashboardCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card
      style={{
        marginBottom: 8,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      }}
    >
      <CardHeader
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
          paddingBottom: 0,
        }}
      >
        <CardTitle style={{ fontSize: 14, color: "#6b7280", fontFamily: "sans-serif" }}>
          {title}
        </CardTitle>
        {Icon && <Icon size={20} color="#6b7280" />}
      </CardHeader>
      <CardContent style={{ padding: 20, paddingTop: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#2C1810", fontFamily: "sans-serif" }}>
          {value}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            marginTop: 4,
            display: "flex",
            gap: 4,
            alignItems: "center",
            fontFamily: "sans-serif",
          }}
        >
          {trend && (
            <span
              style={{
                color: trend.isPositive ? "#16a34a" : "#dc2626",
                fontWeight: 600,
              }}
            >
              {trend.value}
            </span>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}