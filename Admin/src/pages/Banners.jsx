import React, { useState, useEffect } from "react";
import { Plus, Trash, Eye, EyeOff, Pencil, X, Loader, Image, ExternalLink, MoreVertical, Settings } from "lucide-react";
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

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: "Design Your Perfect",
    subtitle: "Mirror Today",
    description: "Crafted Just for You!",
    buttonText: "Customize Now",
    imageUrl: "",
    link: "/customization",
    customLink: "",
    active: true,
  });
  const [uploading, setUploading] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cloudinary Configuration
  const CLOUDINARY_CLOUD_NAME = "dqwthfhya";
  const CLOUDINARY_UPLOAD_PRESET = "MirroraPH";

  // Check if user has chosen "Don't Show Again"
  useEffect(() => {
    const hideDeleteModal = localStorage.getItem('hideDeleteModal');
    if (hideDeleteModal === 'true') {
      setIsDeleteModalOpen(false);
    }
  }, []);

  // Fetch banners from Firestore with error handling
  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const q = query(collection(db, "banners"));
        
        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            if (!isMounted) return;
            
            const bannerList = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setBanners(bannerList);
            setIsLoading(false);
          },
          (error) => {
            if (!isMounted) return;
            console.error("Error fetching banners:", error);
            setIsLoading(false);
            setBanners([]);
          }
        );
      } catch (error) {
        if (!isMounted) return;
        console.error("Error setting up banners listener:", error);
        setIsLoading(false);
        setBanners([]);
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Cleanup function
  const cleanupAction = () => {
    setIsDeleting(false);
    setIsCreating(false);
    setIsUpdating(false);
    setActionInProgress(false);
  };

  // Action handler with better error handling
  const executeAction = async (action, loadingSetter) => {
    if (actionInProgress) {
      console.log("Action already in progress, skipping");
      return;
    }
    
    loadingSetter(true);
    setActionInProgress(true);
    
    try {
      const minLoaderTime = new Promise(resolve => setTimeout(resolve, 500));
      const actionPromise = action();
      await Promise.all([actionPromise, minLoaderTime]);
      return true;
    } catch (error) {
      console.error("Action failed:", error);
      await new Promise(resolve => setTimeout(resolve, 500));
      throw error;
    } finally {
      cleanupAction();
    }
  };

  const handleEditClick = (banner) => {
    if (actionInProgress) return;
    
    setCurrentBanner({ 
      ...banner,
      title: banner.title || "Design Your Perfect",
      subtitle: banner.subtitle || "Mirror Today", 
      description: banner.description || "Crafted Just for You!",
      buttonText: banner.buttonText || "Customize Now",
      customLink: banner.link && !['/customization', '/products', '/'].includes(banner.link) ? banner.link : ""
    });
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteClick = (banner) => {
    if (actionInProgress) return;
    
    const hideDeleteModal = localStorage.getItem('hideDeleteModal');
    
    if (hideDeleteModal === 'true') {
      confirmDeleteImmediately(banner);
    } else {
      setBannerToDelete(banner);
      setIsDeleteModalOpen(true);
      setDontShowAgain(false);
    }
    setActiveDropdown(null);
  };

  const confirmDeleteImmediately = async (banner) => {
    try {
      await executeAction(
        () => deleteDoc(doc(db, "banners", banner.id)),
        setIsDeleting
      );
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner. Please try again.");
    }
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    try {
      await executeAction(
        async () => {
          if (dontShowAgain) {
            localStorage.setItem('hideDeleteModal', 'true');
          }
          await deleteDoc(doc(db, "banners", bannerToDelete.id));
          setIsDeleteModalOpen(false);
          setBannerToDelete(null);
          setDontShowAgain(false);
        },
        setIsDeleting
      );
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner. Please try again.");
    }
  };

  const cancelDelete = () => {
    if (actionInProgress) return;
    setIsDeleteModalOpen(false);
    setBannerToDelete(null);
    setDontShowAgain(false);
  };

  const resetDeletePreference = () => {
    localStorage.removeItem('hideDeleteModal');
    alert("Delete confirmation modal will now show again.");
  };

  const handleToggleActive = async (banner) => {
    try {
      await executeAction(
        () => updateDoc(doc(db, "banners", banner.id), {
          active: !banner.active
        }),
        setIsUpdating
      );
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner status. Please try again.");
    }
    setActiveDropdown(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentBanner(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBanner(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (!currentBanner?.id) {
      alert("No banner selected for update");
      return;
    }

    try {
      await executeAction(
        async () => {
          const { id, customLink, ...bannerData } = currentBanner;
          
          if (bannerData.link === "other") {
            bannerData.link = customLink || "/customization";
          }
          
          bannerData.title = bannerData.title || "Design Your Perfect";
          bannerData.subtitle = bannerData.subtitle || "Mirror Today";
          bannerData.description = bannerData.description || "Crafted Just for You!";
          bannerData.buttonText = bannerData.buttonText || "Customize Now";
          bannerData.active = Boolean(bannerData.active);
          
          await updateDoc(doc(db, "banners", id), bannerData);
          setIsEditModalOpen(false);
          setCurrentBanner(null);
        },
        setIsUpdating
      );
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner. Please try again.");
    }
  };

  // Image upload function
  const uploadImage = async (file) => {
    if (!file) {
      throw new Error("No file provided");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image upload failed: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  };

  const handleFileChange = async (e, type) => {
    if (actionInProgress) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }
    
    setUploading(true);
    setActionInProgress(true);
    
    try {
      const result = await uploadImage(file);
      const imageUrl = result.secure_url;
      
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
      setActionInProgress(false);
    }
  };

  const handleCreate = async () => {
    if (!newBanner.imageUrl) {
      alert("Image is required");
      return;
    }

    try {
      await executeAction(
        async () => {
          const bannerData = { ...newBanner };
          
          if (bannerData.link === "other") {
            bannerData.link = bannerData.customLink || "/customization";
          }
          
          delete bannerData.customLink;
          
          bannerData.title = bannerData.title || "Design Your Perfect";
          bannerData.subtitle = bannerData.subtitle || "Mirror Today";
          bannerData.description = bannerData.description || "Crafted Just for You!";
          bannerData.buttonText = bannerData.buttonText || "Customize Now";
          bannerData.active = Boolean(bannerData.active);
          
          await addDoc(collection(db, "banners"), bannerData);
          
          setIsAddModalOpen(false);
          setNewBanner({
            title: "Design Your Perfect",
            subtitle: "Mirror Today",
            description: "Crafted Just for You!",
            buttonText: "Customize Now",
            imageUrl: "",
            link: "/customization",
            customLink: "",
            active: true,
          });
        },
        setIsCreating
      );
    } catch (error) {
      console.error("Error creating banner:", error);
      alert("Failed to create banner. Please try again.");
    }
  };

  const closeEditModal = () => {
    if (actionInProgress) return;
    setIsEditModalOpen(false);
    setCurrentBanner(null);
  };

  const closeAddModal = () => {
    if (actionInProgress) return;
    setIsAddModalOpen(false);
  };

  // Loading component
  const LoadingSpinner = ({ size = 20, text = "Loading..." }) => (
    <div className="flex items-center justify-center gap-3">
      <Loader size={size} className="animate-spin text-blue-600" />
      <span className="text-gray-600 font-medium">{text}</span>
    </div>
  );

  // Stats component
  const BannerStats = () => {
    const activeCount = banners.filter(b => b.active !== false).length;
    const totalCount = banners.length;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Banners</p>
              <p className="text-3xl font-bold">{totalCount}</p>
            </div>
            <Image className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Active Banners</p>
              <p className="text-3xl font-bold">{activeCount}</p>
            </div>
            <Eye className="w-8 h-8 text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Inactive</p>
              <p className="text-3xl font-bold">{totalCount - activeCount}</p>
            </div>
            <EyeOff className="w-8 h-8 text-amber-200" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Banner Management
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Create and manage your homepage banner carousel
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {actionInProgress && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                <Loader size={16} className="animate-spin" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={actionInProgress || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              <Plus size={20} />
              Add New Banner
            </button>
          </div>
        </div>

        {/* Stats */}
        <BannerStats />

        {/* Settings */}
        {localStorage.getItem('hideDeleteModal') === 'true' && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-medium">Delete confirmations are disabled</span>
              </div>
              <button 
                onClick={resetDeletePreference}
                className="text-orange-600 hover:text-orange-800 text-sm font-medium underline"
              >
                Enable confirmations
              </button>
            </div>
          </div>
        )}

        {/* Banners List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Banners</h2>
            <p className="text-gray-600 text-sm">Manage your banner content and visibility</p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner size={32} text="Loading banners..." />
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No banners yet</p>
                <p className="text-gray-400">Create your first banner to get started!</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Banner
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center p-6 gap-6">
                      {/* Banner Image */}
                      <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-md">
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/128x96/f3f4f6/9ca3af?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Image className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Banner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {banner.title || "Untitled Banner"}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                banner.active 
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {banner.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-1">
                              {banner.subtitle || "No subtitle"}
                            </p>
                            
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                              {banner.description || "No description"}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                Button: {banner.buttonText || "Customize Now"}
                              </span>
                              <span className="flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                Links to: {banner.link || "/customization"}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === banner.id ? null : banner.id)}
                              disabled={actionInProgress}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                              <MoreVertical size={20} className="text-gray-500" />
                            </button>
                            
                            {activeDropdown === banner.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                <button
                                  onClick={() => handleToggleActive(banner)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                >
                                  {banner.active ? <EyeOff size={16} /> : <Eye size={16} />}
                                  {banner.active ? "Hide Banner" : "Show Banner"}
                                </button>
                                <button
                                  onClick={() => handleEditClick(banner)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                >
                                  <Pencil size={16} />
                                  Edit Banner
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(banner)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 transition-colors"
                                >
                                  <Trash size={16} />
                                  Delete Banner
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && bannerToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isDeleting ? "Deleting Banner" : "Confirm Deletion"}
              </h2>
              {!isDeleting && (
                <button 
                  onClick={cancelDelete} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>
            
            {isDeleting ? (
              <div className="text-center py-8">
                <LoadingSpinner size={32} text="Deleting banner..." />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to delete "{bannerToDelete.title || "Untitled Banner"}"?
                  </p>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="dontShowAgain"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="dontShowAgain" className="text-sm text-gray-700 cursor-pointer">
                    Don't show this confirmation again
                  </label>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    Delete Banner
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Forms - Edit and Create would go here with similar redesigned styling */}
      {/* I'll create these as separate components to keep the code manageable */}
      
      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}