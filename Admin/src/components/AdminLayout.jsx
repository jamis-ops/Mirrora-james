import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      {/* The sidebar is rendered here once and for all */}
      <AdminSidebar />
      <main style={{ flex: 1, padding: 24 }}>
        {/* The content of the individual pages (Users, Settings, etc.) will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}