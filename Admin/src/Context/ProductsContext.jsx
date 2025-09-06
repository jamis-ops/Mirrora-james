// src/context/ProductsContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    // Load from localStorage so it stays even after refresh
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const addProduct = (product) => {
    setProducts((prev) => [...prev, product]);
  };

  const editProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, editProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}
