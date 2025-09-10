// src/pages/Categories.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash, X, Image as ImageIcon } from "lucide-react";
import { db } from "../../Backend/firebaseConfig.js";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
} from "firebase/firestore";

// Loader Component
const Loader = ({ message }) => (
    <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#A68B69] mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
    </div>
);

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true); // New loading state for the page
    const [isSaving, setIsSaving] = useState(false); // New saving state for the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, name: "" });
    const [imageFile, setImageFile] = useState(null);

    const categoriesCollectionRef = collection(db, "categories");

    useEffect(() => {
        const unsubscribe = onSnapshot(categoriesCollectionRef, (snapshot) => {
            const categoriesList = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setCategories(categoriesList);
            setLoading(false); // Set loading to false once data is fetched
        }, (error) => {
            console.error("Error fetching categories: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const openAddModal = () => {
        setIsEdit(false);
        setCurrentCategory({ id: null, name: "" });
        setIsModalOpen(true);
        setImageFile(null);
    };

    const openEditModal = (category) => {
        setIsEdit(true);
        setCurrentCategory(category);
        setIsModalOpen(true);
        setImageFile(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({ id: null, name: "" });
        setImageFile(null);
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSave = async () => {
        if (currentCategory.name.trim() === "") return;
        setIsSaving(true); // Start saving state

        try {
            if (isEdit) {
                const categoryDoc = doc(db, "categories", currentCategory.id);
                await updateDoc(categoryDoc, { name: currentCategory.name });
                console.log("Category updated successfully.");
            } else {
                await addDoc(categoriesCollectionRef, {
                    name: currentCategory.name,
                });
                console.log("Category added successfully.");
            }
            closeModal();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Failed to save category. Please check the console for details.");
        } finally {
            setIsSaving(false); // End saving state
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
                console.log("Category deleted successfully.");
            } catch (error) {
                console.error("Error deleting category:", error);
                alert("Failed to delete category. Please try again.");
            }
        }
    };

    // Conditional rendering for the main page loader
    if (loading) {
        return <Loader message="Loading categories..." />;
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
                {categories.map((cat) => (
                    <Link
                        to={`/admin/products/${cat.id}`}
                        key={cat.id}
                        className="block"
                    >
                        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                            {/* This is a placeholder for the image. You'll need to fetch the image URL from your Firestore data. */}
                            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                <ImageIcon size={64} className="text-gray-400" />
                            </div>
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-gray-900">{cat.name}</h2>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            openEditModal(cat);
                                        }}
                                        className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, cat.id)}
                                        className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {categories.length === 0 && !loading && (
                    <div className="col-span-full text-center text-gray-500 p-8">
                        No categories found.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center p-4 z-50">
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
                                    {imageFile ? imageFile.name : "Click to upload an image"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {imageFile && (
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Category Preview"
                                    className="mt-4 w-full h-48 object-cover rounded-lg shadow-inner"
                                />
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="py-2 px-4 rounded-lg border border-gray-300 text-sm font-semibold transition-colors hover:bg-gray-100"
                                disabled={isSaving} // Disable if saving
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-[#A68B69] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-[#8C7355] disabled:bg-gray-400"
                                disabled={isSaving} // Disable if saving
                            >
                                {isSaving ? "Saving..." : (isEdit ? "Update" : "Add")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}