import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Circle,
  Image,
  HelpCircle,
  ChevronDown,
  LogOut,
  MessageCircle, // <-- Import the MessageCircle icon
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Messages", href: "/admin/messages", icon: MessageCircle }, 
  { name: "Banners", href: "/admin/banners", icon: Image },
  { name: "FAQ", href: "/admin/faq", icon: HelpCircle },
];

export default function AdminSidebar() {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <aside
      className="
        w-64 
        min-h-screen 
        bg-gradient-to-b 
        from-gray-50 
        to-gray-100 
        p-6 
        flex 
        flex-col 
        border-r 
        border-gray-200
        font-sans
      "
    >
      {/* Logo / Title */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-11 h-11 bg-gradient-to-br from-[#A67B5B] to-[#8B5E3C] rounded-full flex items-center justify-center shadow-lg">
          <Circle size={20} color="#fff" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#2C1810]">
            Mirrora Philippines
          </h1>
    
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/admin"}
            className={({ isActive }) =>
              `
              flex 
              items-center 
              gap-3 
              p-3 
              rounded-lg 
              text-sm 
              font-bold 
              transition-all 
              duration-300 
              mb-2
              ${isActive 
                ? 'bg-gradient-to-r from-[#A67B5B] to-[#8B5E3C] text-white shadow-md' 
                : 'text-[#2C1810] hover:bg-[#EDE7E0] hover:text-[#A67B5B]'
              }`
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Admin Section */}
      <div className="pt-5 border-t border-gray-200 mt-auto">
        <button
          onClick={() => setAdminMenuOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-2 rounded-lg transition-colors duration-200 hover:bg-[#EDE7E0]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A67B5B] to-[#8B5E3C] rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#2C1810]">Admin</p>
              <p className="text-xs text-[#6B5E4F]">Mirrora Philippines</p>
            </div>
          </div>
          <ChevronDown
            size={20}
            className={`text-[#6B5E4F] transition-transform duration-300 ${
              adminMenuOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Dropdown */}
        {adminMenuOpen && (
          <div className="mt-3 pl-12">
            <NavLink
              to="/admin/settings"
              className="flex items-center gap-2 text-sm text-[#2C1810] p-2 rounded-lg transition-colors duration-200 mb-2 hover:bg-[#EDE7E0] hover:text-[#A67B5B]"
            >
              <Settings size={16} />
              Settings
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-sm text-red-600 p-2 rounded-lg transition-colors duration-200 text-left hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}