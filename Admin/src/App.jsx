// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Orders from "./pages/Orders.jsx";
import Settings from "./pages/Settings.jsx";
import Banners from "./pages/Banners.jsx";
import FAQ from "./pages/FAQ.jsx";
import Categories from "./pages/Categories.jsx"; // Import Categories
import { ProductsProvider } from "./Context/ProductsContext.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import LogIn from "./pages/Login.jsx";
import "./index.css";
import Products from "./pages/Products.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ProductsProvider>
        <Routes>
          {/* Default route = Login page */}
          <Route path="/" element={<LogIn />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Index />} />
            {/* When the user clicks the "Products" link, they will see the Categories page first */}
            <Route path="products" element={<Categories />} />
            {/* This route handles navigating to a specific category's products */}
            <Route path="products/:categoryId" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="banners" element={<Banners />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </ProductsProvider>
    </BrowserRouter>
  );
}