// src/components/ProductCard.jsx

import React from "react";
import { Pencil, Trash, Package } from "lucide-react";

export default function ProductCard({ product, onEdit, onDelete }) {
  // Handle case where product might be undefined
  if (!product) {
    return null;
  }

  // Safe property access with fallbacks
  const inventory = product.inventory || 0;
  const price = product.price || 0;
  const name = product.name || 'Unnamed Product';
  const imageUrl = product.imageUrl;

  // Stock status logic
  const isOutOfStock = inventory <= 0;
  const isLowStock = inventory > 0 && inventory <= 5;
  
  const getStockStatus = () => {
    if (isOutOfStock) return "Out of Stock";
    if (isLowStock) return "Low Stock";
    return "In Stock";
  };

  const getStockClasses = () => {
    if (isOutOfStock) return "bg-red-100 text-red-700";
    if (isLowStock) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(product);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(product);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100 hover:shadow-2xl">
      {/* Image Section */}
      <div className="relative group">
        <div className="w-full h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/280x250/e5e7eb/6b7280?text=No+Image";
            }}
          />
        </div>
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStockClasses()}`}>
            {getStockStatus()}
          </span>
        </div>

        {/* Hover Action Buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
            <button
              onClick={handleEditClick}
              className="p-3 rounded-full bg-white/90 text-[#A68B69] hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-3 rounded-full bg-white/90 text-red-500 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              <Trash size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-6">
        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2 min-h-[3.5rem]">
          {name}
        </h3>
        
        {/* Price with PHP Peso Sign */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              ₱{Number(price).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Stock Information */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-blue-600" />
            <span className="text-gray-600 text-sm">
              Stock: <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-600' : 'text-green-600'}`}>
                {inventory}
              </span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleEditClick}
            className="flex-1 bg-gradient-to-r from-[#A68B69] to-[#8C7355] text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Trash size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}