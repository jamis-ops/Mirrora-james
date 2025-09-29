import React, { useState, useEffect } from "react";
import { Plus, Trash, Eye, EyeOff, Pencil, X } from "lucide-react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query
} from "firebase/firestore";
import { db } from "../../Backend/firebaseConfig.js";

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    link: "/customization",
    customLink: "",
    active: true,
  });
  const [uploading, setUploading] = useState(false);

  // Cloudinary Configuration
  const CLOUDINARY_CLOUD_NAME = "dqwthfhya";
  const CLOUDINARY_UPLOAD_PRESET = "MirroraPH";

  // Fetch banners from Firestore
  useEffect(() => {
    const q = query(collection(db, "banners"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(bannerList);
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = (banner) => {
    setCurrentBanner({ 
      ...banner,
      // Ensure customLink is set if link is a custom URL
      customLink: banner.link && !['/customization', '/products', '/'].includes(banner.link) ? banner.link : ""
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (banner) => {
    setBannerToDelete(banner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "banners", bannerToDelete.id));
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner. Please try again.");
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBannerToDelete(null);
  };

  const handleToggleActive = async (banner) => {
    try {
      await updateDoc(doc(db, "banners", banner.id), {
        active: !banner.active
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner status. Please try again.");
    }
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

  const handleUpdate = async () => {
    try {
      const { id, customLink, ...bannerData } = currentBanner;
      
      // If custom link is provided, use it instead of the selected option
      if (bannerData.link === "other" && customLink) {
        bannerData.link = customLink;
      }
      
      // Ensure active is a boolean
      bannerData.active = Boolean(bannerData.active);
      
      await updateDoc(doc(db, "banners", id), bannerData);
      setIsEditModalOpen(false);
      setCurrentBanner(null);
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner. Please try again.");
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error("Image upload failed");
      }
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }
    
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      
      if (type === "new") {
        setNewBanner({ ...newBanner, imageUrl });
      } else {
        setCurrentBanner({ ...currentBanner, imageUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!newBanner.title || !newBanner.imageUrl) {
        alert("Title and image are required");
        return;
      }
      
      const bannerData = { ...newBanner };
      
      // If custom link is provided, use it instead of the selected option
      if (bannerData.link === "other" && bannerData.customLink) {
        bannerData.link = bannerData.customLink;
      }
      
      // Remove customLink field if not needed
      delete bannerData.customLink;
      
      // Ensure active is a boolean
      bannerData.active = Boolean(bannerData.active);
      
      await addDoc(collection(db, "banners"), bannerData);
      setIsAddModalOpen(false);
      setNewBanner({
        title: "",
        subtitle: "",
        imageUrl: "",
        link: "/customization",
        customLink: "",
        active: true,
      });
    } catch (error) {
      console.error("Error creating banner:", error);
      alert("Failed to create banner. Please try again.");
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
        {banners.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-50">
              <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                {banner.imageUrl && (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/128x80?text=Image+Error";
                    }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 flex-1 ml-4">
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-base text-gray-900">
                    {banner.title || "Untitled Banner"}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${banner.active ? 'bg-orange-100 text-[#8B5E3C]' : 'bg-gray-200 text-gray-700'}`}>
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {banner.subtitle}
                </div>
                <div className="text-xs text-gray-400">
                  Links to: <span className="text-[#7A6C5D]">{banner.link || "Customization Screen"}</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
                  title={banner.active ? "Hide banner" : "Show banner"}
                >
                  {banner.active ? <Eye size={18} className="text-gray-700" /> : <EyeOff size={18} className="text-gray-700" />}
                </button>
                <button
                  onClick={() => handleEditClick(banner)}
                  className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
                  title="Edit banner"
                >
                  <Pencil size={18} className="text-gray-700" />
                </button>
                <button
                  onClick={() => handleDeleteClick(banner)}
                  className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
                  title="Delete banner"
                >
                  <Trash size={18} className="text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && bannerToDelete && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
              <button onClick={cancelDelete} className="bg-transparent border-none cursor-pointer">
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the banner "<span className="font-semibold">{bannerToDelete.title || "Untitled Banner"}</span>"?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 font-medium text-gray-700 bg-transparent border border-gray-300 rounded-lg transition-colors duration-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg transition-colors duration-200 hover:bg-red-700"
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {isEditModalOpen && currentBanner && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Banner</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="bg-transparent border-none cursor-pointer">
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={currentBanner.title || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Subtitle</label>
                <textarea
                  name="subtitle"
                  value={currentBanner.subtitle || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Image (Upload File) *</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "edit")}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer"
                  disabled={uploading}
                  accept="image/*"
                />
                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading to Cloudinary...</p>}
                {currentBanner.imageUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-700">Current image:</p>
                    <img
                      src={currentBanner.imageUrl}
                      alt="Current Banner"
                      className="max-w-full h-32 object-contain rounded-lg mt-1"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x150?text=Image+Error";
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Link URL</label>
                <select
                  name="link"
                  value={currentBanner.link === "other" ? "other" : (currentBanner.link || "/customization")}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                >
                  <option value="/customization">Customization Screen</option>
                  <option value="/products">Products Page</option>
                  <option value="/">Home Page</option>
                  <option value="other">Other (enter custom URL)</option>
                </select>
                {(currentBanner.link === "other" || 
                  (currentBanner.link && 
                   !['/customization', '/products', '/'].includes(currentBanner.link))) && (
                  <input
                    type="text"
                    name="customLink"
                    value={currentBanner.customLink || currentBanner.link || ""}
                    onChange={handleEditChange}
                    placeholder="Enter custom URL"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="active"
                  checked={currentBanner.active !== false}
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Banner</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="bg-transparent border-none cursor-pointer">
                <X size={24} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={newBanner.title}
                  onChange={handleNewChange}
                  placeholder="Enter banner title"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                  required
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
                <label className="text-sm font-medium text-gray-900 block mb-2">Image (Upload File) *</label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "new")}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer"
                  disabled={uploading}
                  accept="image/*"
                  required
                />
                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading to Cloudinary...</p>}
                {newBanner.imageUrl && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-700">Preview:</p>
                    <img
                      src={newBanner.imageUrl}
                      alt="New Banner Preview"
                      className="max-w-full h-32 object-contain rounded-lg mt-1"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x150?text=Image+Error";
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Link URL</label>
                <select
                  name="link"
                  value={newBanner.link}
                  onChange={handleNewChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                >
                  <option value="/customization">Customization Screen</option>
                  <option value="/products">Products Page</option>
                  <option value="/">Home Page</option>
                  <option value="other">Other (enter custom URL)</option>
                </select>
                {newBanner.link === "other" && (
                  <input
                    type="text"
                    name="customLink"
                    value={newBanner.customLink}
                    onChange={handleNewChange}
                    placeholder="Enter custom URL"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
                  />
                )}
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
              <button onClick={handleCreate} disabled={uploading || !newBanner.title || !newBanner.imageUrl} className="px-6 py-3 font-semibold text-white bg-[#A67B5B] rounded-lg transition-colors duration-200 hover:bg-[#8B5E3C] disabled:opacity-50">
                {uploading ? "Uploading..." : "Create Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}