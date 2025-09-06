// src/pages/Banners.jsx

import React, { useState } from "react";
import { Plus, Trash, Eye, EyeOff, Pencil, X } from "lucide-react";

// Mock data to simulate banners
const initialBanners = [
  {
    id: 1,
    title: "Premium Mirror Collection",
    subtitle: "Discover our handcrafted mirrors with elegant frames",
    image: "/src/assets/banner1.jpg", 
    link: "/products/mirrors",
    active: true,
  },
  {
    id: 2,
    title: "Summer Sale - 30% Off",
    subtitle: "Limited time offer on all decorative mirrors",
    image: "/src/assets/banner2.jpg",
    link: "/sale",
    active: true,
  },
  {
    id: 3,
    title: "Custom Mirror Solutions",
    subtitle: "Get personalized mirrors for your space",
    image: "/src/assets/banner3.jpg",
    link: "/custom",
    active: false,
  },
];

export default function Banners() {
  const [banners, setBanners] = useState(initialBanners);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    image: null,
    link: "",
    active: true,
  });

  const handleEditClick = (banner) => {
    setCurrentBanner({ ...banner });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setBanners(banners.filter((banner) => banner.id !== id));
  };

  const handleToggleActive = (id) => {
    setBanners(
      banners.map((b) =>
        b.id === id ? { ...b, active: !b.active } : b
      )
    );
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentBanner({
      ...currentBanner,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBanner({
      ...newBanner,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleUpdate = () => {
    setBanners(
      banners.map((b) => (b.id === currentBanner.id ? currentBanner : b))
    );
    setIsEditModalOpen(false);
    setCurrentBanner(null);
  };

  const handleCreate = () => {
    const newId = banners.length > 0 ? Math.max(...banners.map(b => b.id)) + 1 : 1;
    setBanners([...banners, { ...newBanner, id: newId }]);
    setIsAddModalOpen(false);
    setNewBanner({
      title: "",
      subtitle: "",
      image: null,
      link: "",
      active: true,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (type === "new") {
        setNewBanner({ ...newBanner, image: imageUrl });
      } else {
        setCurrentBanner({ ...currentBanner, image: imageUrl });
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 p-6 bg-gray-50">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">
            Homepage Banners
          </h1>
          <p className="text-sm text-gray-500 font-sans">
            Manage your homepage banner carousel
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-[#A67B5B] rounded-lg cursor-pointer transition-colors duration-200 hover:bg-[#8B5E3C]"
        >
          <Plus size={16} /> Add Banner
        </button>
      </header>
      
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-50">
            <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              {banner.image && (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-1 flex-1 ml-4">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-base text-gray-900">
                  {banner.title}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${banner.active ? 'bg-orange-100 text-[#8B5E3C]' : 'bg-gray-200 text-gray-700'}`}>
                  {banner.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {banner.subtitle}
              </div>
              <div className="text-xs text-gray-400">
                Links to: <span className="text-[#7A6C5D]">{banner.link}</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handleToggleActive(banner.id)}
                className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
              >
                {banner.active ? <Eye size={18} className="text-gray-700" /> : <EyeOff size={18} className="text-gray-700" />}
              </button>
              <button
                onClick={() => handleEditClick(banner)}
                className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
              >
                <Pencil size={18} className="text-gray-700" />
              </button>
              <button
                onClick={() => handleDeleteClick(banner.id)}
                className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
              >
                <Trash size={18} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Banner Modal */}
      {isEditModalOpen && currentBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Banner</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-transparent border-none cursor-pointer">
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={currentBanner.title}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Subtitle</label>
                <textarea
                  name="subtitle"
                  value={currentBanner.subtitle}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Image (Upload File)</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "edit")}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer"
                />
                {currentBanner.image && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-700">Current image:</p>
                    <img
                      src={currentBanner.image}
                      alt="Current Banner"
                      className="max-w-full h-auto rounded-lg mt-1"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Link URL</label>
                <input
                  type="text"
                  name="link"
                  value={currentBanner.link}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={currentBanner.active}
                  onChange={handleEditChange}
                  className="h-4 w-4 text-[#A67B5B] rounded border-gray-300 focus:ring-[#A67B5B]"
                />
                <label className="text-sm text-gray-900">Active (show on homepage)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 font-semibold text-gray-700 bg-transparent border border-gray-700 rounded-lg transition-colors duration-200 hover:bg-gray-100">Cancel</button>
              <button onClick={handleUpdate} className="px-6 py-3 font-semibold text-white bg-[#A67B5B] rounded-lg transition-colors duration-200 hover:bg-[#8B5E3C]">Update Banner</button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Banner</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="bg-transparent border-none cursor-pointer">
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newBanner.title}
                  onChange={handleNewChange}
                  placeholder="Enter banner title"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Subtitle</label>
                <textarea
                  name="subtitle"
                  value={newBanner.subtitle}
                  onChange={handleNewChange}
                  placeholder="Enter banner subtitle"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Image (Upload File)</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "new")}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer"
                />
                {newBanner.image && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-700">Preview:</p>
                    <img
                      src={newBanner.image}
                      alt="New Banner Preview"
                      className="max-w-full h-auto rounded-lg mt-1"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Link URL</label>
                <input
                  type="text"
                  name="link"
                  value={newBanner.link}
                  onChange={handleNewChange}
                  placeholder="/products or https://example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={newBanner.active}
                  onChange={handleNewChange}
                  className="h-4 w-4 text-[#A67B5B] rounded border-gray-300 focus:ring-[#A67B5B]"
                />
                <label className="text-sm text-gray-900">Active (show on homepage)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 font-semibold text-gray-700 bg-transparent border border-gray-700 rounded-lg transition-colors duration-200 hover:bg-gray-100">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-3 font-semibold text-white bg-[#A67B5B] rounded-lg transition-colors duration-200 hover:bg-[#8B5E3C]">Create Banner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}