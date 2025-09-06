// src/components/ProductCard.jsx (Revised with Tailwind CSS)
import React from "react";
import { Pencil, Trash } from "lucide-react";

export default function ProductCard({ product, onEdit, onDelete }) {
  const stockStatus = product.inventory > 0 ? "In Stock" : "Out of Stock";
  const stockColorClass = product.inventory > 0 ? "text-green-700" : "text-red-700";
  const stockBgClass = product.inventory > 0 ? "bg-green-100" : "bg-red-100";

  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-md overflow-hidden flex flex-col font-sans transition-shadow duration-300 hover:shadow-lg">
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/280x250/e5e7eb/6b7280?text=No+Image";
          }}
        />
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-semibold rounded-full ${stockBgClass} ${stockColorClass}`}
        >
          {stockStatus}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {product.name}
          </h3>
        </div>
        <div className="flex justify-between items-end mt-auto">
          <p className="text-xl font-bold text-gray-900">
            {product.price}
          </p>
          <span className="text-xs font-medium text-gray-500">
            Stock: {product.inventory}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-3 p-4 border-t border-gray-200">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold transition-colors duration-200 hover:bg-yellow-700"
        >
          <Pencil size={16} />
          Edit
        </button>
        <button
          onClick={() => onDelete(product)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200 hover:bg-red-700"
        >
          <Trash size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}