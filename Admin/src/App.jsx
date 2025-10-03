import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import Orders from "./pages/Orders.jsx";
import Settings from "./pages/Settings.jsx";
import Banners from "./pages/Banners.jsx";
import FAQ from "./pages/FAQ.jsx";
import Categories from "./pages/Categories.jsx";
import { ProductsProvider } from "./Context/ProductsContext.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import LogIn from "./pages/Login.jsx";
import "./index.css";
import Products from "./pages/Products.jsx";
import Messages from "./pages/Messages.jsx";
import Reviews from "./pages/Reviews.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ProductsProvider>
        <Routes>
          {/* Default route for the Login page */}
          <Route path="/" element={<LogIn />} />

          {/* All admin-related routes are nested under the /admin path */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* The index route for /admin, which displays the dashboard */}
            <Route index element={<Index />} />
            {/* Route for displaying all products, starting with categories */}
            <Route path="products" element={<Categories />} />
            {/* Route for displaying products within a specific category */}
            <Route path="products/:categoryId" element={<Products />} />
            {/* Route for the orders management page */}
            <Route path="orders" element={<Orders />} />
            {/* Route for the banners management page */}
            <Route path="banners" element={<Banners />} />
            {/* Route for the messages page */}
            <Route path="messages" element={<Messages />} />
            {/* New route to handle specific chat IDs, assuming Messages component can handle chatId */}
            <Route path="messages/:threadId" element={<Messages />} />
            {/* Route for the FAQ management page */}
            <Route path="faq" element={<FAQ />} />
            {/* Route for the Reviews management page */}
            <Route path="reviews" element={<Reviews />} />
            {/* Route for the general settings page */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </ProductsProvider>
    </BrowserRouter>
  );
}