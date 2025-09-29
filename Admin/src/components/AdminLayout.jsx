// src/components/AdminLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";

export default function AdminLayout() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="ml-64 p-6">
        {/* The content of the individual pages (Users, Settings, etc.) will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}
