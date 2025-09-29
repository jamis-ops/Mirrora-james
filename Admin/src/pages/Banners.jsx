import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash, Eye, EyeOff, Pencil, X } from "lucide-react";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../../Backend/firebaseConfig.js";

// Constants
const CLOUDINARY_CLOUD_NAME = "dqwthfhya";
const CLOUDINARY_UPLOAD_PRESET = "MirroraPH";
const DEFAULT_BANNER = {
  title: "",
  subtitle: "",
  imageUrl: "",
  link: "/customization",
  customLink: "",
  active: true,
};
const STANDARD_LINKS = ['/customization', '/products', '/'];

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [newBanner, setNewBanner] = useState(DEFAULT_BANNER);
  const [uploading, setUploading] = useState(false);

  // Memoized Cloudinary upload function
  const uploadImage = useCallback(async (file) => {
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
      
      if (!response.ok) throw new Error("Image upload failed");
      
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  }, []);

  // Optimized banner fetching with ordering
  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("title"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bannerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(bannerList);
    });

    return () => unsubscribe();
  }, []);

  // Handler functions
  const handleEditClick = useCallback((banner) => {
    setCurrentBanner({ 
      ...banner,
      customLink: banner.link && !STANDARD_LINKS.includes(banner.link) ? banner.link : ""
    });
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((banner) => {
    setBannerToDelete(banner);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!bannerToDelete) return;
    
    try {
      await deleteDoc(doc(db, "banners", bannerToDelete.id));
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner. Please try again.");
    }
  }, [bannerToDelete]);

  const cancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setBannerToDelete(null);
  }, []);

  const handleToggleActive = useCallback(async (banner) => {
    try {
      await updateDoc(doc(db, "banners", banner.id), {
        active: !banner.active
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner status. Please try again.");
    }
  }, []);

  // Generic change handlers
  const createChangeHandler = useCallback((setStateFunction) => 
    (e) => {
      const { name, value, type, checked } = e.target;
      setStateFunction(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }, []);

  const handleEditChange = createChangeHandler(setCurrentBanner);
  const handleNewChange = createChangeHandler(setNewBanner);

  // File upload handler
  const handleFileChange = useCallback(async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      
      if (type === "new") {
        setNewBanner(prev => ({ ...prev, imageUrl }));
      } else {
        setCurrentBanner(prev => ({ ...prev, imageUrl }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [uploadImage]);

  // Banner operations
  const prepareBannerData = useCallback((bannerData) => {
    const data = { ...bannerData };
    
    // Handle custom link
    if (data.link === "other" && data.customLink) {
      data.link = data.customLink;
    }
    
    // Remove unused fields and ensure correct types
    delete data.customLink;
    delete data.id;
    data.active = Boolean(data.active);
    
    return data;
  }, []);

  const handleUpdate = useCallback(async () => {
    if (!currentBanner) return;
    
    try {
      const bannerData = prepareBannerData(currentBanner);
      await updateDoc(doc(db, "banners", currentBanner.id), bannerData);
      setIsEditModalOpen(false);
      setCurrentBanner(null);
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner. Please try again.");
    }
  }, [currentBanner, prepareBannerData]);

  const handleCreate = useCallback(async () => {
    // Validate required fields
    if (!newBanner.title?.trim() || !newBanner.imageUrl) {
      alert("Title and image are required");
      return;
    }
    
    try {
      const bannerData = prepareBannerData(newBanner);
      await addDoc(collection(db, "banners"), bannerData);
      setIsAddModalOpen(false);
      setNewBanner(DEFAULT_BANNER);
    } catch (error) {
      console.error("Error creating banner:", error);
      alert("Failed to create banner. Please try again.");
    }
  }, [newBanner, prepareBannerData]);

  // Modal management
  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setNewBanner(DEFAULT_BANNER);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setCurrentBanner(null);
  }, []);

  // Banner List Item Component for better performance
  const BannerItem = React.memo(({ banner, onEdit, onDelete, onToggleActive }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-colors duration-200 hover:bg-gray-50">
      <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/128x80?text=Image+Error";
          }}
        />
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
          onClick={() => onToggleActive(banner)}
          className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
          title={banner.active ? "Hide banner" : "Show banner"}
        >
          {banner.active ? <Eye size={18} className="text-gray-700" /> : <EyeOff size={18} className="text-gray-700" />}
        </button>
        <button
          onClick={() => onEdit(banner)}
          className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
          title="Edit banner"
        >
          <Pencil size={18} className="text-gray-700" />
        </button>
        <button
          onClick={() => onDelete(banner)}
          className="p-2 rounded-lg bg-gray-100 border-none cursor-pointer hover:bg-gray-200"
          title="Delete banner"
        >
          <Trash size={18} className="text-red-400" />
        </button>
      </div>
    </div>
  ));

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
            <p className="text-gray-500">No banners yet. Create your first banner!</p>
          </div>
        ) : (
          banners.map((banner) => (
            <BannerItem
              key={banner.id}
              banner={banner}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggleActive={handleToggleActive}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          bannerToDelete={bannerToDelete}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}

      {/* Edit Banner Modal */}
      {isEditModalOpen && currentBanner && (
        <EditModal
          currentBanner={currentBanner}
          uploading={uploading}
          onChange={handleEditChange}
          onFileChange={(e) => handleFileChange(e, "edit")}
          onClose={closeEditModal}
          onUpdate={handleUpdate}
        />
      )}

      {/* Create New Banner Modal */}
      {isAddModalOpen && (
        <AddModal
          newBanner={newBanner}
          uploading={uploading}
          onChange={handleNewChange}
          onFileChange={(e) => handleFileChange(e, "new")}
          onClose={closeAddModal}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

// Extracted Modal Components for better organization
const DeleteModal = React.memo(({ bannerToDelete, onCancel, onConfirm }) => (
  <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
        <button onClick={onCancel} className="bg-transparent border-none cursor-pointer">
          <X size={24} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      <div className="mb-6">
        <p className="text-gray-700">
          Are you sure you want to delete the banner "<span className="font-semibold">{bannerToDelete?.title || "Untitled Banner"}</span>"?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone.
        </p>
      </div>
      <div className="flex justify-end gap-3">
        <button 
          onClick={onCancel}
          className="px-4 py-2 font-medium text-gray-700 bg-transparent border border-gray-300 rounded-lg transition-colors duration-200 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className="px-4 py-2 font-medium text-white bg-red-600 rounded-lg transition-colors duration-200 hover:bg-red-700"
        >
          Delete Banner
        </button>
      </div>
    </div>
  </div>
));

const EditModal = React.memo(({ currentBanner, uploading, onChange, onFileChange, onClose, onUpdate }) => (
  <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Edit Banner</h2>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer">
          <X size={24} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      <BannerForm
        banner={currentBanner}
        uploading={uploading}
        onChange={onChange}
        onFileChange={onFileChange}
      />
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-6 py-3 font-semibold text-gray-700 bg-transparent border border-gray-700 rounded-lg transition-colors duration-200 hover:bg-gray-100">Cancel</button>
        <button onClick={onUpdate} className="px-6 py-3 font-semibold text-white bg-[#A67B5B] rounded-lg transition-colors duration-200 hover:bg-[#8B5E3C]">Update Banner</button>
      </div>
    </div>
  </div>
));

const AddModal = React.memo(({ newBanner, uploading, onChange, onFileChange, onClose, onCreate }) => (
  <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Banner</h2>
        <button onClick={onClose} className="bg-transparent border-none cursor-pointer">
          <X size={24} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      <BannerForm
        banner={newBanner}
        uploading={uploading}
        onChange={onChange}
        onFileChange={onFileChange}
      />
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={onClose} className="px-6 py-3 font-semibold text-gray-700 bg-transparent border border-gray-700 rounded-lg transition-colors duration-200 hover:bg-gray-100">Cancel</button>
        <button 
          onClick={onCreate} 
          disabled={uploading || !newBanner.title?.trim() || !newBanner.imageUrl} 
          className="px-6 py-3 font-semibold text-white bg-[#A67B5B] rounded-lg transition-colors duration-200 hover:bg-[#8B5E3C] disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Create Banner"}
        </button>
      </div>
    </div>
  </div>
));

// Reusable Banner Form Component
const BannerForm = React.memo(({ banner, uploading, onChange, onFileChange }) => {
  const showCustomLink = banner.link === "other" || 
    (banner.link && !['/customization', '/products', '/'].includes(banner.link));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-gray-900 block mb-2">Title *</label>
        <input
          type="text"
          name="title"
          value={banner.title || ""}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-900 block mb-2">Subtitle</label>
        <textarea
          name="subtitle"
          value={banner.subtitle || ""}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-900 block mb-2">Image (Upload File) *</label>
        <input
          type="file"
          onChange={onFileChange}
          className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer"
          disabled={uploading}
          accept="image/*"
        />
        {uploading && <p className="text-sm text-gray-500 mt-2">Uploading to Cloudinary...</p>}
        {banner.imageUrl && (
          <div className="mt-3">
            <p className="text-xs text-gray-700">{banner.id ? "Current image:" : "Preview:"}</p>
            <img
              src={banner.imageUrl}
              alt={banner.id ? "Current Banner" : "New Banner Preview"}
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
          value={banner.link === "other" ? "other" : (banner.link || "/customization")}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
        >
          <option value="/customization">Customization Screen</option>
          <option value="/products">Products Page</option>
          <option value="/">Home Page</option>
          <option value="other">Other (enter custom URL)</option>
        </select>
        {showCustomLink && (
          <input
            type="text"
            name="customLink"
            value={banner.customLink || banner.link || ""}
            onChange={onChange}
            placeholder="Enter custom URL"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="active"
          checked={banner.active !== false}
          onChange={onChange}
          className="h-4 w-4 text-[#A67B5B] rounded border-gray-300 focus:ring-[#A67B5B]"
        />
        <label className="text-sm text-gray-900">Active (show on homepage)</label>
      </div>
    </div>
  );
});