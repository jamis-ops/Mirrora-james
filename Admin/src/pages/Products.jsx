// src/pages/Products.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash, X, Image as ImageIcon, ArrowLeft, Package, Hash, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import { db } from "../../Backend/firebaseConfig.js";
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import axios from "axios";

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = "dqwthfhya";
const CLOUDINARY_UPLOAD_PRESET = "MirroraPH";

// Mock data for categories
const categories = [
    { id: "1", name: "Wall Mirrors" },
    { id: "2", name: "Bathroom Mirrors" },
    { id: "3", name: "Full Length Mirrors" },
    { id: "4", name: "Decorative Mirrors" },
];

const getCategoryName = (id) => {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : " ";
};

export default function Products() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({
        id: null,
        name: "",
        price: "",
        inventory: "",
        imageUrl: "",
        categoryId: categoryId || ""
    });
    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 5;

    // Add product loading state
    const [isAddingProduct, setIsAddingProduct] = useState(false);

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
            console.error("Error fetching products:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [categoryId]);

    // Pagination Logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openAddModal = () => {
        setIsEdit(false);
        setCurrentProduct({
            id: null,
            name: "",
            price: "",
            inventory: "",
            imageUrl: "",
            categoryId: categoryId
        });
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
        setCurrentProduct({
            id: null,
            name: "",
            price: "",
            inventory: "",
            imageUrl: "",
            categoryId: categoryId
        });
        setImageFile(null);
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSave = async () => {
        // Enhanced validation
        if (currentProduct.name.trim() === "") {
            alert("Product name is required.");
            return;
        }
        if (!currentProduct.price || currentProduct.price.toString().trim() === "") {
            alert("Price is required.");
            return;
        }
        if (!currentProduct.inventory || currentProduct.inventory.toString().trim() === "") {
            alert("Inventory quantity is required.");
            return;
        }
        if (!currentProduct.categoryId) {
            alert("Category is missing. Please refresh the page or try again.");
            return;
        }

        setIsAddingProduct(true); // Set loading state ON

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
                setIsAddingProduct(false); // Reset loading state on error
                return;
            }
        }
        
        if (!imageUrl) {
            alert("Image is required for the product.");
            setIsAddingProduct(false); // Reset loading state on error
            return;
        }

        try {
            const productData = {
                name: currentProduct.name,
                price: parseFloat(currentProduct.price),
                inventory: parseInt(currentProduct.inventory),
                imageUrl: imageUrl,
                categoryId: currentProduct.categoryId,
                createdAt: new Date()
            };

            if (isEdit) {
                const productDocRef = doc(db, "products", currentProduct.id);
                await updateDoc(productDocRef, productData);
                console.log("Product updated successfully.");
            } else {
                await addDoc(collection(db, "products"), productData);
                console.log("Product added successfully.");
            }
            closeModal();
        } catch (error) {
            console.error("Firebase save operation failed: ", error);
            alert("Failed to save product to Firestore. Check your database rules and connection.");
        } finally {
            setIsAddingProduct(false); // Set loading state OFF, regardless of success or failure
        }
    };

    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            const productDocRef = doc(db, "products", productToDelete.id);
            await deleteDoc(productDocRef);
            console.log("Product deleted successfully.");
            closeDeleteModal();
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert("Failed to delete product. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A68B69] mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">Loading products...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex-1 p-6 bg-gray-50 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md border border-gray-200"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Products {categoryName}
                        </h1>
                        <p className="text-gray-600 text-lg">Manage your mirror products collection</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    disabled={isAddingProduct} // Disable button while adding
                    className={`bg-gradient-to-r from-[#A68B69] to-[#8C7355] text-white py-3 px-6 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-105 transform ${isAddingProduct ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isAddingProduct ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mx-auto"></div>
                    ) : (
                        <Plus size={20} />
                    )}
                    Add New Product
                </button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={() => openEditModal(product)}
                            onDelete={() => openDeleteModal(product)}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-16">
                        <Package size={64} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
                        <p className="text-gray-400">Add your first product to get started</p>
                    </div>
                )}
                
                {/* Add New Product Card - Only show if there's no data or on the first page */}
                {currentProducts.length === 0 && currentPage === 1 && (
                    <button
                        onClick={openAddModal}
                        className="w-full h-full min-h-[320px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-[#A68B69] hover:text-[#A68B69] transition-all duration-300 hover:bg-gray-50 group"
                    >
                        <Plus size={48} className="mb-3 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-semibold">Add New Product</span>
                    </button>
                )}
            </div>

            {/* Pagination Controls */}
            {products.length > productsPerPage && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-semibold text-gray-800">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Enhanced Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEdit ? "Edit Product" : "Add New Product"}
                            </h2>
                            <button 
                                onClick={closeModal} 
                                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Product Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter product name"
                                    value={currentProduct.name}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                />
                            </div>

                            {/* Price Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Package size={16} className="text-green-600" />
                                    Price (₱) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter price (e.g., 1450.00)"
                                    value={currentProduct.price}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                />
                            </div>

                            {/* Inventory Quantity Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Hash size={16} className="text-blue-600" />
                                    Inventory Quantity *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all duration-200"
                                    placeholder="Enter inventory quantity (e.g., 50)"
                                    value={currentProduct.inventory}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, inventory: e.target.value })}
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Product Image *
                                </label>
                                <label className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 hover:border-[#A68B69] hover:bg-gray-50">
                                    <ImageIcon size={48} className="text-gray-400" />
                                    <div className="text-center">
                                        <span className="text-sm text-gray-600 font-semibold block">
                                            {imageFile ? imageFile.name : (currentProduct.imageUrl ? "Change Image" : "Click to upload an image")}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1 block">
                                            PNG, JPG, GIF up to 10MB
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                {(imageFile || currentProduct.imageUrl) && (
                                    <div className="mt-4">
                                        <img
                                            src={imageFile ? URL.createObjectURL(imageFile) : currentProduct.imageUrl}
                                            alt="Product Preview"
                                            className="w-full h-48 object-cover rounded-xl shadow-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isAddingProduct} // Disable button while adding
                                className={`text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform ${isAddingProduct ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#A68B69] to-[#8C7355] hover:scale-105'}`}
                            >
                                {isAddingProduct ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mx-auto"></div>
                                ) : (
                                    <>{isEdit ? "Update Product" : "Add Product"}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
                        <div className="flex justify-center mb-4">
                            <Trash size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Deletion</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete <strong className="font-semibold text-gray-800">{productToDelete?.name}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={closeDeleteModal}
                                className="py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}