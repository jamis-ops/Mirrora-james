// src/pages/Settings.jsx

import React from "react";
import { User, Palette, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure your application preferences.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <SettingsIcon size={24} className="text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800">General Settings</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Manage your store information and primary configurations.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Store Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A67B5B] focus:ring focus:ring-[#A67B5B] focus:ring-opacity-50" 
                placeholder="My Awesome Mirror Store" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input 
                type="email" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A67B5B] focus:ring focus:ring-[#A67B5B] focus:ring-opacity-50" 
                placeholder="contact@mirrors.com" 
              />
            </div>
            <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A67B5B] hover:bg-[#8C7355] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A67B5B]">
              Save Changes
            </button>
          </div>
        </div>

        {/* Appearance Settings Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <Palette size={24} className="text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800">Appearance</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Customize the look and feel of your admin panel.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A67B5B] focus:ring focus:ring-[#A67B5B] focus:ring-opacity-50">
                <option>Light Mode</option>
                <option>Dark Mode</option>
                <option>System Default</option>
              </select>
            </div>
            <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A67B5B] hover:bg-[#8C7355] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A67B5B]">
              Apply Theme
            </button>
          </div>
        </div>
        
        {/* Account Settings Card (full width on small screens) */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-4 mb-4">
                <User size={24} className="text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-800">Account</h2>
            </div>
            <p className="text-gray-600 mb-4">
                Update your login and profile information.
            </p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Change Password</label>
                    <input 
                        type="password" 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A67B5B] focus:ring focus:ring-[#A67B5B] focus:ring-opacity-50" 
                        placeholder="New Password" 
                    />
                </div>
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A67B5B] hover:bg-[#8C7355] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A67B5B]">
                    Update Password
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}