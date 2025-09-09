// src/pages/Products.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash, X, Image as ImageIcon, ArrowLeft } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import { db } from "../../Backend/firebaseConfig.js";
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import axios from "axios";

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dqwthfhya"; // Replace with your Cloud Name
const CLOUDINARY_UPLOAD_PRESET = "MirroraPH"; // Replace with your Unsigned Upload Preset name

// Mock data for categories
const categories = [
    { id: "1", name: "Wall Mirrors" },
    { id: "2", name: "Bathroom Mirrors" },
    { id: "3", name: "Full Length Mirrors" },
    { id: "4", name: "Decorative Mirrors" },
];

const getCategoryName = (id) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : "Unknown Category";
};

// Loader Component
const Loader = ({ message }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#A68B69] mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

export default function Products() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ id: null, name: "", inventory: 0, imageUrl: "", categoryId: categoryId || "" });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // New state for save button loader
    const [imageFile, setImageFile] = useState(null);

    const categoryName = getCategoryName(categoryId);
    const productsCollectionRef = collection(db, "products");

    useEffect(() => {
        if (!categoryId) {
            setLoading(false);
            return;
        }

        const q = query(productsCollectionRef, where("categoryId", "==", categoryId));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productsList = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }));
            setProducts(productsList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching products: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [categoryId]);

    const openAddModal = () => {
        setIsEdit(false);
        setCurrentProduct({ id: null, name: "", inventory: 0, imageUrl: "", categoryId: categoryId });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setIsEdit(true);
        setCurrentProduct(product);
        setImageFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProduct({ id: null, name: "", inventory: 0, imageUrl: "", categoryId: categoryId });
        setImageFile(null);
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSave = async () => {
        setIsSaving(true); // Start saving state
        
        if (currentProduct.name.trim() === "") {
            alert("Product name is required.");
            setIsSaving(false);
            return;
        }
        if (!currentProduct.categoryId) {
            alert("Category is missing. Please refresh the page or try again.");
            console.error("Error: categoryId is undefined.");
            setIsSaving(false);
            return;
        }

        let imageUrl = currentProduct.imageUrl;
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
                setIsSaving(false);
                return;
            }
        }
        
        if (!imageUrl) {
            alert("Image URL is required.");
            setIsSaving(false);
            return;
        }

        try {
            if (isEdit) {
                const productDocRef = doc(db, "products", currentProduct.id);
                await updateDoc(productDocRef, {
                    name: currentProduct.name,
                    inventory: currentProduct.inventory,
                    imageUrl: imageUrl
                });
            } else {
                await addDoc(collection(db, "products"), {
                    name: currentProduct.name,
                    inventory: currentProduct.inventory,
                    imageUrl: imageUrl,
                    categoryId: currentProduct.categoryId,
                    createdAt: new Date()
                });
            }
            closeModal();
        } catch (error) {
            console.error("Firebase save operation failed: ", error);
            alert("Failed to save product to Firestore. Check your database rules and connection.");
        } finally {
            setIsSaving(false); // End saving state
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this product?");
        if (confirmDelete) {
            try {
                const productDocRef = doc(db, "products", id);
                await deleteDoc(productDocRef);
            } catch (error) {
                console.error("Error deleting product: ", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    if (loading) {
        return <Loader message="Loading products..." />;
    }
    
    return (
        <div className="flex-1 p-8">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)} 
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products in {categoryName}</h1>
                        <p className="text-gray-500">Manage your mirror products here</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-[#A68B69] text-white py-2 px-4 rounded-lg font-semibold flex items-center gap-2 transition-colors hover:bg-[#8C7355] shadow-md"
                >
                    <Plus size={18} /> Add Product
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={() => openEditModal(product)}
                            onDelete={() => handleDelete(product.id)}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 p-8">
                        No products found for this category.
                    </div>
                )}
                <button
                    onClick={openAddModal}
                    className="w-full h-full min-h-[280px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#A68B69] hover:text-[#A68B69] transition-colors"
                >
                    <Plus size={48} />
                    Add New Product
                </button>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEdit ? "Edit Product" : "Add New Product"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A68B69]"
                                placeholder="Product Name"
                                value={currentProduct.name}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                            />
                            <div className="flex items-center gap-4">
                                <label className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-gray-50">
                                    <ImageIcon size={20} className="text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {imageFile ? imageFile.name : (currentProduct.imageUrl ? "Change Image" : "Upload Image")}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                            {(imageFile || currentProduct.imageUrl) && (
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : currentProduct.imageUrl}
                                    alt="Product Preview"
                                    className="mt-2 w-full h-48 object-cover rounded-lg"
                                />
                            )}
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A68B69]"
                                placeholder="Inventory"
                                value={currentProduct.inventory}
                                onChange={(e) => setCurrentProduct({ ...currentProduct, inventory: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="py-2 px-4 rounded-lg border border-gray-300 text-sm font-semibold transition-colors hover:bg-gray-100"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-[#A68B69] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-[#8C7355] disabled:bg-gray-400"
                                disabled={isSaving}
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