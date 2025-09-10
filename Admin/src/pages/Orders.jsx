// src/pages/Orders.jsx

import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Calendar, Package, CreditCard, User, Phone, Mail, MapPin, Clock, TrendingUp, MoreHorizontal, Download, RefreshCw, Plus, Settings, Bell, ChevronDown, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Enhanced Header Component
const Header = () => (
    <header className="bg-white/100 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            </div>
            <div className="flex items-center gap-3">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    </header>
);

const OrderDetailModal = ({ order, isOpen, onClose, onUpdateStatus, onUpdatePayment }) => {
    if (!isOpen) return null;

    const formatDateTime = (dateStr, timeStr) => {
        const [month, day, year] = dateStr.split('/');
        const date = new Date(`${year}-${month}-${day} ${timeStr}`);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-[#F8F5F2]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#A68B69] rounded-xl flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                <p className="text-gray-600">Complete order information and management</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export Details
                        </button>
                        <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Customer
                        </button>
                    
                    </div>

                    {/* Order Information Card */}
                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#A68B69]" />
                            Order Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-1">Order ID</label>
                                <p className="text-xl font-bold text-gray-900">{order.id}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-1">Order Date & Time</label>
                                <p className="text-gray-900 font-medium">{formatDateTime(order.date, order.time)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-1">Payment Method</label>
                                <p className="text-gray-900 font-medium">{order.paymentMethod || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-2">Order Status</label>
                                <EnhancedStatusBadge
                                    status={order.status}
                                    orderId={order.id}
                                    onUpdate={onUpdateStatus}
                                />
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-2">Payment Status</label>
                                <EnhancedPaymentBadge
                                    payment={order.payment}
                                    orderId={order.id}
                                    onUpdate={onUpdatePayment}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customer Information Card */}
                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#A68B69]" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-[#A68B69] rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Customer Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{order.customer.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                                        <p className="text-gray-900 font-medium">{order.customer.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Information Card */}
                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#A68B69]" />
                            Product Details
                        </h3>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500 block mb-1">Product Name</label>
                                    <p className="text-xl font-semibold text-gray-900 mb-2">{order.product}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>Quantity: <strong>{order.quantity}</strong></span>
                                        <span>Unit Price: <strong>{order.amount}</strong></span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Card */}
                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#A68B69]" />
                            Order Summary
                        </h3>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold text-gray-900">{order.amount}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Shipping Fee</span>
                                    <span className="font-semibold text-gray-900">FREE</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-semibold text-gray-900">Included</span>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Grand Total</span>
                                        <span className="text-2xl font-bold text-[#A68B69]">{order.amount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {order.notes && (
                        <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-[#A68B69]" />
                                Order Notes
                            </h3>
                            <p className="text-gray-700 bg-white rounded-lg p-4 shadow-sm">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Enhanced Status Badge Component
const EnhancedStatusBadge = ({ status, orderId, onUpdate }) => {
    const statusConfig = {
        pending: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            icon: Clock,
        },
        confirmed: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            icon: CheckCircle,
        },
        processing: {
            bg: 'bg-amber-100',
            text: 'text-amber-800',
            border: 'border-amber-300',
            icon: RefreshCw,
        },
        shipped: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            border: 'border-blue-300',
            icon: Package,
        },
        delivered: {
            bg: 'bg-green-200',
            text: 'text-green-800',
            border: 'border-green-400',
            icon: CheckCircle,
        },
        cancelled: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            icon: XCircle,
        },
        refunded: {
            bg: 'bg-gray-200',
            text: 'text-gray-800',
            border: 'border-gray-300',
            icon: RefreshCw,
        },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <div className="relative">
            <select
                value={status}
                onChange={(e) => onUpdate(orderId, e.target.value)}
                className={`pl-10 pr-8 py-3 rounded-xl text-sm font-medium border-2 cursor-pointer appearance-none transition-all duration-200 hover:shadow-md ${config.bg} ${config.text} ${config.border} capitalize min-w-[140px]`}
            >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Icon className="w-4 h-4" />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    );
};

// Enhanced Payment Badge Component
const EnhancedPaymentBadge = ({ payment, orderId, onUpdate }) => {
    const paymentConfig = {
        pending: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            icon: XCircle,
        },
        partial: {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-300',
            icon: AlertCircle,
        },
        paid: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            icon: CheckCircle,
        },
        refunded: {
            bg: 'bg-gray-200',
            text: 'text-gray-800',
            border: 'border-gray-300',
            icon: RefreshCw,
        },
    };

    const config = paymentConfig[payment] || paymentConfig.pending;
    const Icon = config.icon;

    return (
        <div className="relative">
            <select
                value={payment}
                onChange={(e) => onUpdate(orderId, e.target.value)}
                className={`pl-10 pr-8 py-3 rounded-xl text-sm font-medium border-2 cursor-pointer appearance-none transition-all duration-200 hover:shadow-md ${config.bg} ${config.text} ${config.border} capitalize min-w-[140px]`}
            >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Icon className="w-4 h-4" />
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    );
};

// Initial orders data
const initialOrders = [
    { id: "ORD-001", customer: { name: "Maria Santos", email: "maria.santos@email.com" }, product: "Classic Wall Mirror - Large", amount: "₱2,500", status: "pending", payment: "partial", date: "8/17/2024", time: "6:30:00 PM", quantity: 1, paymentMethod: "Bank Transfer", notes: "50% down payment received" },
    { id: "ORD-002", customer: { name: "Juan Dela Cruz", email: "juan.delacruz@email.com" }, product: "Decorative Vintage Mirror", amount: "₱6,400", status: "processing", payment: "paid", date: "8/16/2024", time: "3:45:00 PM", quantity: 2, paymentMethod: "GCash", notes: "Express delivery requested" },
    { id: "ORD-003", customer: { name: "Ana Rodriguez", email: "ana.rodriguez@email.com" }, product: "Modern Frameless Mirror", amount: "₱1,800", status: "shipped", payment: "pending", date: "8/15/2024", time: "11:20:00 AM", quantity: 1, paymentMethod: "Cash on Delivery", notes: "Customer requested special packaging" },
    { id: "ORD-004", customer: { name: "Carlos Lopez", email: "carlos.lopez@email.com" }, product: "Oval Bathroom Mirror Set", amount: "₱3,200", status: "delivered", payment: "paid", date: "8/17/2024", time: "9:15:00 AM", quantity: 1, paymentMethod: "Credit Card", notes: "Successfully delivered and installed" },
    { id: "ORD-005", customer: { name: "Lisa Chen", email: "lisa.chen@email.com" }, product: "Round Decorative Mirror", amount: "₱2,950", status: "confirmed", payment: "paid", date: "8/16/2024", time: "2:30:00 PM", quantity: 1, paymentMethod: "PayPal", notes: "Ready for processing" },
];

// Mock local storage functions
const getInitialData = (key, initialValue) => {
    return initialValue;
};

const saveToLocalStorage = () => {
    // Mock function
};

export default function Orders() {
    const [orders, setOrders] = useState(() =>
        getInitialData("orders", initialOrders)
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    useEffect(() => {
        saveToLocalStorage("orders", orders);
    }, [orders]);

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.amount.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "All Status" ||
            order.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const orderCounts = {
        total: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
        processing: orders.filter((o) => o.status === "processing").length,
        shipped: orders.filter((o) => o.status === "shipped").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
    };

    const totalRevenue = orders
        .filter(order => order.payment === 'paid')
        .reduce((sum, order) => sum + parseInt(order.amount.replace('₱', '').replace(',', '')), 0);

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    const handleUpdateOrderStatus = (orderId, newStatus) => {
        const updatedOrders = orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updatedOrders);
    };

    const handleUpdatePaymentStatus = (orderId, newPaymentStatus) => {
        const updatedOrders = orders.map((order) =>
            order.id === orderId ? { ...order, payment: newPaymentStatus } : order
        );
        setOrders(updatedOrders);
    };

    const statusOptions = [
        "All Status",
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
    ];

    return (
        <div className="min-h-screen bg-[#F8F5F2]">
            <Header />

            <main className="p-6 max-w-7xl mx-auto">
                {/* Enhanced Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                        <div className="mb-6 lg:mb-0">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                Orders Management
                            </h1>
                            <p className="text-gray-600 text-lg">Track and manage all your customer orders with ease</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue (Paid Orders)</p>
                                <p className="text-3xl font-bold text-[#A68B69]">
                                    ₱{totalRevenue.toLocaleString()}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-[#A68B69] rounded-2xl flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "All Status" ? "border-[#A68B69] bg-[#A68B69]/10 shadow-[#A68B69]/20" : "border-gray-200 hover:border-[#A68B69]/50"
                            }`}
                            onClick={() => setStatusFilter("All Status")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#A68B69]/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-[#A68B69] rounded-xl flex items-center justify-center shadow-md">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${statusFilter === "All Status" ? "bg-[#A68B69]" : "bg-gray-300"} transition-colors duration-200`}></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{orderCounts.total}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Pending" ? "border-yellow-600 bg-yellow-50 shadow-yellow-200" : "border-gray-200 hover:border-yellow-300"
                            }`}
                            onClick={() => setStatusFilter("Pending")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${statusFilter === "Pending" ? "bg-yellow-500" : "bg-gray-300"} transition-colors duration-200`}></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{orderCounts.pending}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Processing" ? "border-amber-600 bg-amber-50 shadow-amber-200" : "border-gray-200 hover:border-amber-300"
                            }`}
                            onClick={() => setStatusFilter("Processing")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
                                        <RefreshCw className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${statusFilter === "Processing" ? "bg-amber-500" : "bg-gray-300"} transition-colors duration-200`}></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Processing</p>
                                <p className="text-3xl font-bold text-amber-600">{orderCounts.processing}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Shipped" ? "border-blue-600 bg-blue-50 shadow-blue-200" : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => setStatusFilter("Shipped")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${statusFilter === "Shipped" ? "bg-blue-500" : "bg-gray-300"} transition-colors duration-200`}></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Shipped</p>
                                <p className="text-3xl font-bold text-blue-600">{orderCounts.shipped}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Delivered" ? "border-green-600 bg-green-50 shadow-green-200" : "border-gray-200 hover:border-green-300"
                            }`}
                            onClick={() => setStatusFilter("Delivered")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${statusFilter === "Delivered" ? "bg-green-500" : "bg-gray-300"} transition-colors duration-200`}></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Delivered</p>
                                <p className="text-3xl font-bold text-green-600">{orderCounts.delivered}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filter Bar */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search orders, customers, or products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A68B69]/20 focus:border-[#A68B69] transition-all duration-200 text-sm bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="py-4 px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A68B69]/20 focus:border-[#A68B69] bg-white cursor-pointer text-sm min-w-[160px] font-medium"
                                >
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button className="px-6 py-4 bg-[#A68B69] hover:bg-[#8C7355] text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            {(searchQuery || statusFilter !== "All Status") && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("All Status");
                                    }}
                                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 text-sm font-medium whitespace-nowrap shadow-md hover:shadow-lg"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enhanced Orders Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-[#F8F5F2]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#A68B69] rounded-xl flex items-center justify-center shadow-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Orders Overview</h2>
                                    <p className="text-gray-600">Showing {filteredOrders.length} of {orders.length} orders</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#F8F5F2]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{order.customer.name}</div>
                                                <div className="text-xs text-gray-500">{order.customer.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.product}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <EnhancedStatusBadge
                                                    status={order.status}
                                                    orderId={order.id}
                                                    onUpdate={handleUpdateOrderStatus}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <EnhancedPaymentBadge
                                                    payment={order.payment}
                                                    orderId={order.id}
                                                    onUpdate={handleUpdatePaymentStatus}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#A68B69] hover:bg-[#8C7355] transition-colors duration-200"
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500 text-lg">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            {showOrderDetail && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={showOrderDetail}
                    onClose={() => setShowOrderDetail(false)}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onUpdatePayment={handleUpdatePaymentStatus}
                />
            )}
        </div>
    );
}