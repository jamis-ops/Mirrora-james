import React from "react"

export function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, ...style }}>
      {children}
    </div>
  )
}

export function CardHeader({ children, style }) {
  return <div style={{ marginBottom: 8, ...style }}>{children}</div>
}

export function CardTitle({ children, style }) {
  return <div style={{ fontWeight: 600, ...style }}>{children}</div>
}

export function CardContent({ children, style }) {
  return <div style={{ ...style }}>{children}</div>
}
