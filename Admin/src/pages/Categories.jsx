// src/pages/Categories.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash, X, Image as ImageIcon } from "lucide-react";
import { db } from "../../Backend/firebaseConfig.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import axios from "axios";

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dqwthfhya";
const CLOUDINARY_UPLOAD_PRESET = "MirroraPH";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, name: "", imageUrl: "" });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const categoriesCollectionRef = collection(db, "categories");

    useEffect(() => {
        const unsubscribe = onSnapshot(categoriesCollectionRef, (snapshot) => {
            const categoriesList = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setCategories(categoriesList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const openAddModal = () => {
        setIsEdit(false);
        setCurrentCategory({ id: null, name: "", imageUrl: "" });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setIsEdit(true);
        setCurrentCategory(category);
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({ id: null, name: "", imageUrl: "" });
        setImageFile(null);
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSave = async () => {
        if (currentCategory.name.trim() === "") {
            alert("Category name is required.");
            return;
        }
        
        let imageUrl = currentCategory.imageUrl;
        if (imageFile) {
            try {
                const formData = new FormData();
                formData.append("file", imageFile);
                formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
                
                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    formData
                );
                imageUrl = response.data.secure_url;
            } catch (error) {
                console.error("Cloudinary upload failed: ", error.response ? error.response.data : error.message);
                alert("Failed to upload image. Please check your Cloudinary settings.");
                return;
            }
        }
        
        if (!imageUrl) {
            alert("Image is required for the category.");
            return;
        }

        try {
            if (isEdit) {
                const categoryDoc = doc(db, "categories", currentCategory.id);
                await updateDoc(categoryDoc, {
                    name: currentCategory.name,
                    imageUrl: imageUrl
                });
            } else {
                await addDoc(categoriesCollectionRef, {
                    name: currentCategory.name,
                    imageUrl: imageUrl,
                    createdAt: new Date()
                });
            }
            closeModal();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category. Please check the console for details.");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this category? This will not delete the associated products."
        );
        if (confirmDelete) {
            try {
                const categoryDoc = doc(db, "categories", id);
                await deleteDoc(categoryDoc);
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category. Please try again.");
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading categories...</div>;
    }

    return (
        <div className="flex-1 p-8">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500">Manage your mirror categories here</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-[#A68B69] text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2 transition-colors hover:bg-[#8C7355] shadow-md"
                >
                    <Plus size={18} /> Add Category
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <div
                            key={cat.id}
                            onClick={() => navigate(`/admin/products/${cat.id}`)}
                            className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                            <div className="relative">
                                <img
                                    src={cat.imageUrl}
                                    alt={cat.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                                            className="p-2 rounded-full bg-white text-[#A68B69] hover:bg-gray-200 transition-colors"
                                        >
                                            <Pencil size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, cat.id)}
                                            className="p-2 rounded-full bg-white text-red-500 hover:bg-gray-200 transition-colors"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 p-8">
                        No categories found.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEdit ? "Edit Category" : "Add New Category"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A68B69] mb-4"
                            placeholder="Category Name"
                            value={currentCategory.name}
                            onChange={(e) =>
                                setCurrentCategory({ ...currentCategory, name: e.target.value })
                            }
                        />
                        <div className="flex flex-col items-center mb-4">
                            <label className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:border-[#A68B69]">
                                <ImageIcon size={48} className="text-gray-400" />
                                <span className="text-sm text-gray-600 font-semibold">
                                    {imageFile ? imageFile.name : (currentCategory.imageUrl ? "Change Image" : "Click to upload an image")}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {(imageFile || currentCategory.imageUrl) && (
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : currentCategory.imageUrl}
                                    alt="Category Preview"
                                    className="mt-4 w-full h-48 object-cover rounded-lg shadow-inner"
                                />
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="py-2 px-4 rounded-lg border border-gray-300 text-sm font-semibold transition-colors hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-[#A68B69] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-[#8C7355]"
                            >
                                {isEdit ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}