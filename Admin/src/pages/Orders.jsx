// Orders.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, Eye, Calendar, Package, CreditCard, User, Phone, Mail, Clock, TrendingUp, MoreHorizontal, Download, RefreshCw, Plus, Settings, Bell, ChevronDown, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, MessageCircle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { db } from "../../Backend/firebaseConfig.js";
import { collection, onSnapshot, doc, updateDoc, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// NEW: Helper to format currency (already in your code, but needed for email template in backend)
export const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount);
        if (isNaN(amount)) {
            return '₱0.00';
        }
    }
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Generate a display-only order ID (different from Firebase ID)
const generateDisplayOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

// Confirmation Modal Component with Loader
const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirm", 
    cancelText = "Cancel",
    isLoading = false 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-4 py-2 text-white bg-[#A68B69] hover:bg-[#8C7355] rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Header Component
const Header = () => (
    <header>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            </div>
        </div>
    </header>
);

// Enhanced Status Badge Component with workflow enforcement
const EnhancedStatusBadge = ({ status, orderId, onUpdate, currentStatus, isLoading = false }) => {
    const statusConfig = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: Clock },
        confirmed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: CheckCircle },
        processing: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: RefreshCw },
        shipped: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: Package },
        delivered: { bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-400', icon: CheckCircle },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: XCircle },
        refunded: { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300', icon: RefreshCw },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    // Define the status progression - include cancelled as an option from any status
    const getAvailableStatusOptions = (currentStatus) => {
        const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        
        if (currentIndex === -1) {
            // For cancelled or other statuses, show all options including cancelled
            return [...statusOrder, 'cancelled'];
        }
        
        // Allow moving forward in workflow OR cancelling from any status
        return [...statusOrder.filter((_, index) => index >= currentIndex), 'cancelled'];
    };

    const availableOptions = getAvailableStatusOptions(currentStatus);

    return (
        <div className="relative">
            <select
                value={status}
                onChange={(e) => onUpdate(orderId, e.target.value)}
                disabled={isLoading || (!availableOptions.includes(status) && status !== currentStatus)}
                className={`pl-10 pr-8 py-3 rounded-xl text-sm font-medium border-2 cursor-pointer appearance-none transition-all duration-200 hover:shadow-md ${config.bg} ${config.text} ${config.border} capitalize min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {availableOptions.map(option => (
                    <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                ))}
                {!availableOptions.includes(status) && (
                    <option value={status} disabled>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                )}
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                ) : (
                    <Icon className="w-4 h-4" />
                )}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    );
};

// Enhanced Payment Badge Component with Loader
const EnhancedPaymentBadge = ({ payment, orderId, onUpdate, isLoading = false }) => {
    const paymentConfig = {
        pending: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: XCircle },
        partial: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: AlertCircle },
        paid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: CheckCircle },
        refunded: { bg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300', icon: RefreshCw },
    };

    const config = paymentConfig[payment] || paymentConfig.pending;
    const Icon = config.icon;

    return (
        <div className="relative">
            <select
                value={payment}
                onChange={(e) => onUpdate(orderId, e.target.value)}
                disabled={isLoading}
                className={`pl-10 pr-8 py-3 rounded-xl text-sm font-medium border-2 cursor-pointer appearance-none transition-all duration-200 hover:shadow-md ${config.bg} ${config.text} ${config.border} capitalize min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                <option value="pending">Pending</option>
                <option value="partial">Partial (50% Paid)</option>
                <option value="paid">Fully Paid</option>
                <option value="refunded">Refunded</option>
            </select>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                ) : (
                    <Icon className="w-4 h-4" />
                )}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
            </div>
        </div>
    );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, isOpen, onClose, onUpdateStatus, onUpdatePayment, isLoading = false }) => {
    const navigate = useNavigate();

    // NEW: Function to handle chat with customer
    const handleChatWithCustomer = () => {
        const customerName = getCustomerName(order);
        const customerEmail = getCustomerEmail(order);
        const orderId = order.displayId || order.id;
        
        // Create the pre-filled message exactly as requested
        const message = `Hi ${customerName},

Thank you so much for your order with Mirrora Philippines! ✨
Your support means the world to us, and we're excited for you to receive your item. We'll keep you updated as your order gets ready and shipped.

If you have any questions in the meantime, feel free to reach out. We're always here to help. 💌

With gratitude,
The Mirrora PH Team`;

        // Store the customer info and pre-filled message in sessionStorage
        sessionStorage.setItem('chatCustomerName', customerName);
        sessionStorage.setItem('chatCustomerEmail', customerEmail);
        sessionStorage.setItem('prefilledMessage', message);
        sessionStorage.setItem('chatOrderId', orderId);
        
        // Navigate to messages page
        navigate('/admin/messages');
    };

    if (!isOpen) return null;

    // Enhanced date formatting function
    const formatDateTime = useCallback((dateStr, timeStr) => {
        try {
            let date;
            if (dateStr && typeof dateStr === 'object' && dateStr.seconds) {
                date = new Date(dateStr.seconds * 1000);
            } else if (dateStr && dateStr.includes('/')) {
                const [month, day, year] = dateStr.split('/');
                date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${timeStr || '00:00'}`);
            } else if (dateStr && dateStr.includes('-')) {
                date = new Date(`${dateStr} ${timeStr || '00:00'}`);
            } else {
                date = new Date(dateStr);
            }

            if (isNaN(date.getTime())) {
                return dateStr || 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) + (timeStr ? ` at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : '');
        } catch (error) {
            return dateStr || 'Invalid Date';
        }
    }, []);

    const totalAmount = parseFloat(order.total?.toString().replace(/[₱,]/g, '') || order.amount?.toString().replace(/[₱,]/g, '') || order.price?.toString().replace(/[₱,]/g, '') || '0');
    const downpaymentAmount = order.downPayment || totalAmount * 0.5;
    const remainingAmount = order.remainingPayment || totalAmount - downpaymentAmount;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
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
                            disabled={isLoading}
                            className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A68B69]"></div>
                        </div>
                    )}

                    {/* NEW: Chat with Customer Button */}
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={handleChatWithCustomer}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat with Customer
                        </button>
                    </div>

                    {/* Rest of the modal content remains exactly the same */}
                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#A68B69]" />
                            Order Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-1">Order ID</label>
                                <p className="text-xl font-bold text-gray-900">{order.displayId || order.id}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-1">Order Date & Time</label>
                                <p className="text-gray-900 font-medium">{formatDateTime(order.createdAt || order.orderDate, order.orderTime)}</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-1">Payment Method</label>
                                <p className="text-gray-900 font-medium">{order.paymentMethod || 'Bank Transfer'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-2">Order Status</label>
                                <EnhancedStatusBadge 
                                    status={order.status} 
                                    orderId={order.id} 
                                    onUpdate={onUpdateStatus} 
                                    currentStatus={order.status}
                                    isLoading={isLoading}
                                />
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-2">Payment Status</label>
                                <EnhancedPaymentBadge 
                                    payment={order.payment || 'pending'} 
                                    orderId={order.id} 
                                    onUpdate={onUpdatePayment}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#A68B69]" />
                            Customer Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-[#A68B69] rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Customer Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{order.customerName || order.customer?.name || order.userName || order.userInfo?.name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                                        <p className="text-gray-900 font-medium">{order.userEmail || order.customer?.email || order.customerEmail || order.email || order.userInfo?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Contact Number</label>
                                        <p className="text-gray-900 font-medium">{order.customerPhone || order.customer?.phone || order.customerPhone || order.phone || order.contactNumber || order.userInfo?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-[#A68B69]" />
                            Product Details
                        </h3>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                    <div key={index} className="mb-6 last:mb-0">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-medium text-gray-500 block mb-1">Product Name</label>
                                                <p className="text-xl font-semibold text-gray-900 mb-3">{item.name || 'N/A'}</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <span className="text-gray-600">Quantity:</span>
                                                        <p className="font-semibold text-gray-900">{item.quantity || '1'}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <span className="text-gray-600">Price:</span>
                                                        <p className="font-semibold text-gray-900">{formatCurrency(item.price || 0)}</p>
                                                    </div>
                                                    {item.size && (
                                                        <div className="bg-gray-50 p-3 rounded-lg">
                                                            <span className="text-gray-600">Size:</span>
                                                            <p className="font-semibold text-gray-900">{item.size}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {index < order.items.length - 1 && <hr className="my-6 border-gray-200" />}
                                    </div>
                                ))
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-500 block mb-1">Product Name</label>
                                        <p className="text-xl font-semibold text-gray-900 mb-3">{order.product || order.productName || 'N/A'}</p>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <span className="text-gray-600">Quantity:</span>
                                                <p className="font-semibold text-gray-900">{order.quantity || order.items?.[0]?.quantity || '1'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <span className="text-gray-600">Total Amount:</span>
                                                <p className="font-bold text-[#A68B69] text-lg">{formatCurrency(totalAmount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#A68B69]" />
                            Payment Information
                        </h3>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-blue-800 font-medium">Total Order Amount</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-green-800 font-medium">Downpayment (50%)</span>
                                        </div>
                                        <p className="text-xl font-bold text-green-900">{formatCurrency(downpaymentAmount)}</p>
                                        <p className="text-xs text-green-600 mt-1">Required upfront payment</p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-orange-800 font-medium">Remaining Balance</span>
                                        </div>
                                        <p className="text-xl font-bold text-orange-900">{formatCurrency(remainingAmount)}</p>
                                        <p className="text-xs text-orange-600 mt-1">Due upon completion</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Payment Status Overview
                                    </h4>
                                    <div className="space-y-3">
                                        {order.payment === 'partial' ? (
                                            <>
                                                <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm text-green-800 font-medium">Downpayment</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-green-800">{formatCurrency(downpaymentAmount)}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-orange-500" />
                                                        <span className="text-sm text-orange-800 font-medium">Balance Due</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-orange-800">{formatCurrency(remainingAmount)}</span>
                                                </div>
                                            </>
                                        ) : order.payment === 'paid' ? (
                                            <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    <span className="text-sm text-green-800 font-medium">Fully Paid</span>
                                                    </div>
                                                <span className="text-sm font-bold text-green-800">{formatCurrency(totalAmount)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                    <span className="text-sm text-red-800 font-medium">Payment Pending</span>
                                                </div>
                                                <span className="text-sm font-bold text-red-800">{formatCurrency(totalAmount)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(order.payment === 'partial' || order.payment === 'paid' || order.referenceNumber || order.bankDetails) && (
                        <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#A68B69]" />
                                Payment Details
                            </h3>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-green-800 font-medium">Bank Type</span>
                                            </div>
                                            <p className="text-lg font-bold text-green-900">
                                                {order.bankDetails?.fullName || order.bankType || order.paymentDetails?.bankType || order.paymentMethod || 'N/A'}
                                            </p>
                                        </div>
                                        {order.bankDetails?.accountNumber && (
                                            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-blue-800 font-medium">Account Number</span>
                                                </div>
                                                <p className="text-lg font-bold text-blue-900">
                                                    {order.bankDetails.accountNumber}
                                                </p>
                                            </div>
                                        )}
                                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-purple-800 font-medium">Reference Number</span>
                                            </div>
                                            <p className="text-lg font-bold text-purple-900">
                                                {order.referenceNumber || order.paymentDetails?.refNumber || order.refNumber || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" />
                                            Payment Verification
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Verify the payment details with the provided reference number and bank information.
                                            {order.downPayment && (
                                                <>
                                                    <br />
                                                    <span className="font-semibold">Down Payment: {formatCurrency(order.downPayment)}</span>
                                                </>
                                            )}
                                            {order.remainingPayment && (
                                                <>
                                                    <br />
                                                    <span className="font-semibold">Remaining Balance: {formatCurrency(order.remainingPayment)}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {order.deliveryAddress && (
                        <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#A68B69]" />
                                Delivery Address
                            </h3>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-5 h-5 text-[#A68B69] mt-1">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Recipient Name</p>
                                            <p className="font-medium">{order.deliveryAddress.fullName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-5 h-5 text-[#A68B69] mt-1">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="font-medium">{order.deliveryAddress.phoneNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-5 h-5 text-[#A68B69] mt-1">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Delivery Address</p>
                                            <p className="font-medium">{order.deliveryAddress.completeAddress}</p>
                                            {order.deliveryAddress.landmark && (
                                                <p className="text-sm text-gray-600">Landmark: {order.deliveryAddress.landmark}</p>
                                            )}
                                            <p className="text-sm text-gray-600">Postal Code: {order.deliveryAddress.postalCode}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#F8F5F2] rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#A68B69]" />
                            Order Summary
                        </h3>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Product Subtotal</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Shipping Fee</span>
                                    <span className="font-semibold text-gray-900">
                                        {order.shippingFee ? formatCurrency(order.shippingFee) : 'FREE'}
                                    </span>
                                </div>
                                <div className="bg-[#A68B69]/10 rounded-lg p-4 border-2 border-[#A68B69]/20">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold text-gray-900">Grand Total</span>
                                        <span className="text-3xl font-bold text-[#A68B69]">
                                            {formatCurrency(totalAmount)}
                                        </span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-[#A68B69]/20">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Amount Collected:</span>
                                            <span className="font-semibold text-green-700">
                                                {order.payment === 'paid' ? formatCurrency(totalAmount) :
                                                    order.payment === 'partial' ? formatCurrency(downpaymentAmount) :
                                                        formatCurrency(0)}
                                            </span>
                                        </div>
                                        {order.payment !== 'paid' && (
                                            <div className="flex justify-between text-sm mt-1">
                                                <span className="text-gray-600">Outstanding:</span>
                                                <span className="font-semibold text-orange-700">
                                                    {order.payment === 'partial' ? formatCurrency(remainingAmount) : formatCurrency(totalAmount)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to extract customer name from order
const getCustomerName = (order) => {
    if (order.customerName) return order.customerName;
    if (order.customer?.name) return order.customer.name;
    if (order.userName) return order.userName;
    if (order.userInfo?.name) return order.userInfo.name;
    if (order.shippingInfo?.name) return order.shippingInfo.name;
    return 'N/A';
};

// NEW: Helper to extract customer email from order
const getCustomerEmail = (order) => {
    return order.userEmail || order.customer?.email || order.customerEmail || order.email || order.userInfo?.email || '';
};

// Helper function to extract product name from order
const getProductName = (order) => {
    if (order.items && order.items.length > 0) {
        if (order.items.length === 1) {
            return order.items[0].name;
        } else {
            return `${order.items[0].name} and ${order.items.length - 1} more`;
        }
    }
    if (order.product) return order.product;
    if (order.productName) return order.productName;
    return 'N/A';
};

// Helper function to extract total amount from order
const getTotalAmount = (order) => {
    if (order.total) return order.total;
    if (order.amount) return order.amount;
    if (order.price) return order.price;
    if (order.items && order.items[0]?.total) return order.items[0].total;
    return '0';
};

// Helper function to extract order date from order
const getOrderDate = (order) => {
    if (order.createdAt) return order.createdAt;
    if (order.date) return order.date;
    if (order.orderDate) return order.orderDate;
    if (order.timestamp) return order.timestamp;
    return 'N/A';
};

// Helper function to check if an order is customized
const isCustomizedOrder = (order) => {
    return order.isCustomized || 
           order.customizationDetails || 
           order.customOptions || 
           (order.items && order.items.some(item => item.isCustomized || item.size));
};

// Helper function to get timestamp from order for sorting
const getOrderTimestamp = (order) => {
    if (order.createdAt && typeof order.createdAt === 'object' && order.createdAt.seconds) {
        return order.createdAt.seconds * 1000;
    }
    if (order.timestamp && typeof order.timestamp === 'object' && order.timestamp.seconds) {
        return order.timestamp.seconds * 1000;
    }
    if (order.orderDate) {
        try {
            const date = new Date(order.orderDate);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        } catch (error) {
            return 0;
        }
    }
    if (order.date) {
        try {
            const date = new Date(order.date);
            return isNaN(date.getTime()) ? 0 : date.getTime();
        } catch (error) {
            return 0;
        }
    }
    return 0;
};

// Main Orders Component
export default function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("all");
    const ordersPerPage = 5;
    
    // State for confirmation modals and loaders
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState({ 
        type: '', 
        orderId: '', 
        newValue: '', 
        currentValue: '',
        isLoading: false 
    });
    const [updatingOrders, setUpdatingOrders] = useState(new Set());

    // Enhanced date formatting function for table display
    const formatOrderDate = useCallback((dateStr) => {
        try {
            let date;
            if (dateStr && typeof dateStr === 'object' && dateStr.seconds) {
                date = new Date(dateStr.seconds * 1000);
            } 
            else if (dateStr && dateStr.includes('/')) {
                const [month, day, year] = dateStr.split('/');
                date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
            } else if (dateStr && dateStr.includes('-')) {
                date = new Date(dateStr);
            } else if (dateStr) {
                date = new Date(dateStr);
            } else {
                return 'N/A';
            }

            if (isNaN(date.getTime())) {
                return dateStr || 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error("Error formatting date:", error, dateStr);
            return dateStr || 'Invalid Date';
        }
    }, []);

    // Function to fetch orders from Firestore with real-time updates
    const fetchOrders = useCallback(() => {
        setLoading(true);
        const ordersCollectionRef = collection(db, "orders");
        const unsubscribe = onSnapshot(ordersCollectionRef, (snapshot) => {
            const ordersList = snapshot.docs.map(doc => ({
                id: doc.id,
                displayId: generateDisplayOrderId(),
                ...doc.data()
            }));
            
            const sortedOrders = ordersList.sort((a, b) => {
                const aTimestamp = getOrderTimestamp(a);
                const bTimestamp = getOrderTimestamp(b);
                
                if ((a.status === 'delivered') === (b.status === 'delivered')) {
                    return bTimestamp - aTimestamp;
                }
                
                return a.status === 'delivered' ? 1 : -1;
            });
            
            setOrders(sortedOrders);
            setLoading(false);
            
            if (ordersList.length > 0) {
                console.log("First order structure:", ordersList[0]);
            }
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        const unsubscribe = fetchOrders();
        return () => unsubscribe();
    }, [fetchOrders]);

    // Memoized calculations to avoid re-calculating on every render
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            if (activeTab === "customized" && !isCustomizedOrder(order)) {
                return false;
            }
            
            const customerName = getCustomerName(order);
            const customerEmail = getCustomerEmail(order);
            const customerPhone = order.customerPhone || order.customer?.phone || order.customerPhone || order.phone || order.contactNumber || order.userInfo?.phone || '';

            const matchesSearch =
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                getProductName(order).toLowerCase().includes(searchQuery.toLowerCase()) ||
                getTotalAmount(order).toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                (order.referenceNumber && order.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === "All Status" || 
                (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
            
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter, activeTab]);

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

    // Calculate order counts and revenue
    const orderCounts = useMemo(() => ({
        total: orders.length,
        pending: orders.filter((o) => o.status && o.status.toLowerCase() === "pending").length,
        processing: orders.filter((o) => o.status && o.status.toLowerCase() === "processing").length,
        shipped: orders.filter((o) => o.status && o.status.toLowerCase() === "shipped").length,
        delivered: orders.filter((o) => o.status && o.status.toLowerCase() === "delivered").length,
        cancelled: orders.filter((o) => o.status && o.status.toLowerCase() === "cancelled").length,
        customized: orders.filter(isCustomizedOrder).length,
    }), [orders]);

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    // Function to handle status update with confirmation
    const handleStatusUpdateRequest = (orderId, newStatus) => {
        const order = orders.find(o => o.id === orderId);
        setPendingUpdate({
            type: 'status',
            orderId,
            newValue: newStatus,
            currentValue: order.status,
            isLoading: false
        });
        setShowStatusConfirm(true);
    };

    // Function to handle payment status update with confirmation
    const handlePaymentUpdateRequest = (orderId, newPaymentStatus) => {
        const order = orders.find(o => o.id === orderId);
        setPendingUpdate({
            type: 'payment',
            orderId,
            newValue: newPaymentStatus,
            currentValue: order.payment || 'pending',
            isLoading: false
        });
        setShowPaymentConfirm(true);
    };

    // Function to send email update via backend
    const sendOrderUpdateEmail = async (order) => {
        const customerEmail = getCustomerEmail(order);
        if (!customerEmail) {
            console.warn("No customer email found for order:", order.id);
            return;  // Skip if no email
        }

        const emailData = {
            id: order.id,
            displayId: order.displayId,
            customerName: getCustomerName(order),
            customerEmail: customerEmail,
            status: order.status,
            payment: order.payment || 'pending',
            totalAmount: getTotalAmount(order),
        };

        try {
            const response = await fetch('http://localhost:3001/api/send-order-update-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    // Function to update order status in Firestore
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            setPendingUpdate(prev => ({ ...prev, isLoading: true }));
            setUpdatingOrders(prev => new Set(prev).add(orderId));

            const order = orders.find(o => o.id === orderId);
            
            // Handle inventory management for processing status
            if (newStatus === "processing" && order.status !== "processing") {
                let items = [];
                if (order.items && Array.isArray(order.items) && order.items.length > 0) {
                    items = order.items;
                } else {
                    items = [{
                        name: order.product || order.productName || 'Unknown Product',
                        quantity: parseInt(order.quantity || order.items?.[0]?.quantity || 1)
                    }];
                }

                for (const item of items) {
                    if (!item.name || item.quantity <= 0) continue;

                    const productsQuery = query(collection(db, "products"), where("name", "==", item.name));
                    const querySnapshot = await getDocs(productsQuery);

                    if (!querySnapshot.empty) {
                        const productDoc = querySnapshot.docs[0];
                        const productData = productDoc.data();
                        const currentInventory = productData.inventory || 0;
                        const qty = item.quantity || 1;

                        if (currentInventory < qty) {
                            setPendingUpdate(prev => ({ ...prev, isLoading: false }));
                            setUpdatingOrders(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(orderId);
                                return newSet;
                            });
                            return;
                        }

                        await updateDoc(productDoc.ref, {
                            inventory: currentInventory - qty
                        });
                    } else {
                        console.warn(`No product found with name: ${item.name}`);
                    }
                }
            }

            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: newStatus });
            
            // Find the updated order and send email
            const updatedOrder = orders.find(o => o.id === orderId);
            if (updatedOrder) {
                await sendOrderUpdateEmail({ ...updatedOrder, status: newStatus });
            }

            setShowStatusConfirm(false);
        } catch (error) {
            console.error("Error updating order status:", error);
        } finally {
            setPendingUpdate(prev => ({ ...prev, isLoading: false }));
            setUpdatingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    // Function to update payment status in Firestore
    const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
        try {
            setPendingUpdate(prev => ({ ...prev, isLoading: true }));
            setUpdatingOrders(prev => new Set(prev).add(orderId));

            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { payment: newPaymentStatus });
            
            // Find the updated order and send email
            const updatedOrder = orders.find(o => o.id === orderId);
            if (updatedOrder) {
                await sendOrderUpdateEmail({ ...updatedOrder, payment: newPaymentStatus });
            }

            setShowPaymentConfirm(false);
        } catch (error) {
            console.error("Error updating payment status:", error);
        } finally {
            setPendingUpdate(prev => ({ ...prev, isLoading: false }));
            setUpdatingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    // Function to export orders to Excel
    const exportToExcel = () => {
        if (!filteredOrders || filteredOrders.length === 0) {
            return;
        }

        const exportData = filteredOrders.map(order => ({
            OrderID: order.displayId || order.id,
            CustomerName: getCustomerName(order),
            Email: getCustomerEmail(order),
            Phone: order.customerPhone || order.customer?.phone || order.customerPhone || order.phone || order.contactNumber || order.userInfo?.phone || "N/A",
            Product: getProductName(order),
            Quantity: order.items?.reduce((total, item) => total + (item.quantity || 0), 0) || order.quantity || 1,
            TotalAmount: getTotalAmount(order),
            DownPayment: order.downPayment || 0,
            RemainingPayment: order.remainingPayment || 0,
            Status: order.status || "N/A",
            Payment: order.payment || "N/A",
            Bank: order.bankDetails?.fullName || "N/A",
            ReferenceNumber: order.referenceNumber || "N/A",
            Date: getOrderDate(order) || "N/A",
            Customized: isCustomizedOrder(order) ? "Yes" : "No",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "orders.xlsx");
    };

    const statusOptions = ["All Status", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#F8F5F2]">
                <div className="text-gray-600 text-lg">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F5F2]">
            <Header />
            <main className="p-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                        <div className="mb-6 lg:mb-0">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                Orders Management
                            </h1>
                            <p className="text-gray-600 text-lg">Track and manage all your customer orders with ease</p>
                        </div>
                    </div>

                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === "all" ? "bg-white text-[#A68B69] border-t-2 border-l-2 border-r-2 border-[#A68B69]" : "text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All Orders ({orders.length})
                        </button>
                        <button
                            className={`py-3 px-6 font-medium text-sm rounded-t-lg transition-all duration-200 ${activeTab === "customized" ? "bg-white text-[#A68B69] border-t-2 border-l-2 border-r-2 border-[#A68B69]" : "text-gray-500 hover:text-gray-700"}`}
                            onClick={() => setActiveTab("customized")}
                        >
                            Customized Orders ({orderCounts.customized})
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${statusFilter === "All Status" ? "border-[#A68B69] bg-[#A68B69]/10 shadow-[#A68B69]/20" : "border-gray-200 hover:border-[#A68B69]/50"}`}
                            onClick={() => { setStatusFilter("All Status"); setCurrentPage(1); }}
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
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${statusFilter === "Pending" ? "border-yellow-600 bg-yellow-50 shadow-yellow-200" : "border-gray-200 hover:border-yellow-300"}`}
                            onClick={() => { setStatusFilter("Pending"); setCurrentPage(1); }}
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
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${statusFilter === "Processing" ? "border-amber-600 bg-amber-50 shadow-amber-200" : "border-gray-200 hover:border-amber-300"}`}
                            onClick={() => { setStatusFilter("Processing"); setCurrentPage(1); }}
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
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${statusFilter === "Shipped" ? "border-blue-600 bg-blue-50 shadow-blue-200" : "border-gray-200 hover:border-blue-300"}`}
                            onClick={() => { setStatusFilter("Shipped"); setCurrentPage(1); }}
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
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${statusFilter === "Delivered" ? "border-green-600 bg-green-50 shadow-green-200" : "border-gray-200 hover:border-green-300"}`}
                            onClick={() => { setStatusFilter("Delivered"); setCurrentPage(1); }}
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

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${statusFilter === "Cancelled" ? "border-red-600 bg-red-50 shadow-red-200" : "border-gray-200 hover:border-red-300"}`}
                            onClick={() => { setStatusFilter("Cancelled"); setCurrentPage(1); }}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                                        <XCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${statusFilter === "Cancelled" ? "bg-red-500" : "bg-gray-300"} transition-colors duration-200`}></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Cancelled</p>
                                <p className="text-3xl font-bold text-red-600">{orderCounts.cancelled}</p>
                            </div>
                        </div>
                    </div>
                </div>

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
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#A68B69]/20 focus:border-[#A68B69] transition-all duration-200 text-sm bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-[#A68B69]/20 focus:border-[#A68B69] transition-all duration-200"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl ml-2 transition-all duration-200 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Export Orders
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="p-4 rounded-tl-xl">Order ID</th>
                                    <th scope="col" className="p-4">Customer Name</th>
                                    <th scope="col" className="p-4">Product</th>
                                    <th scope="col" className="p-4">Order Date</th>
                                    <th scope="col" className="p-4">Total Amount</th>
                                    <th scope="col" className="p-4">Status</th>
                                    <th scope="col" className="p-4">Payment</th>
                                    <th scope="col" className="p-4">Type</th>
                                    <th scope="col" className="p-4 rounded-tr-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.length > 0 ? (
                                    currentOrders.map((order) => {
                                        const isUpdating = updatingOrders.has(order.id);
                                        return (
                                            <tr key={order.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                                <td className="p-4 font-medium text-gray-900">{order.displayId || order.id}</td>
                                                <td className="p-4">{getCustomerName(order)}</td>
                                                <td className="p-4">{getProductName(order)}</td>
                                                <td className="p-4">{formatOrderDate(getOrderDate(order))}</td>
                                                <td className="p-4">{formatCurrency(getTotalAmount(order))}</td>
                                                <td className="p-4">
                                                    <EnhancedStatusBadge 
                                                        status={order.status || 'pending'} 
                                                        orderId={order.id} 
                                                        onUpdate={handleStatusUpdateRequest}
                                                        currentStatus={order.status || 'pending'}
                                                        isLoading={isUpdating}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <EnhancedPaymentBadge 
                                                        payment={order.payment || 'pending'} 
                                                        orderId={order.id} 
                                                        onUpdate={handlePaymentUpdateRequest}
                                                        isLoading={isUpdating}
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isCustomizedOrder(order) ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {isCustomizedOrder(order) ? 'Customized' : 'Standard'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleViewOrder(order)}
                                                        disabled={isUpdating}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#A68B69] hover:bg-[#8C7355] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Eye className="w-3 h-3" /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="p-6 text-center text-gray-500">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length > ordersPerPage && (
                        <div className="p-4 flex justify-between items-center border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(startIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border ${currentPage === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-[#A68B69] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg border ${currentPage === totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'}`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            {showOrderDetail && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={showOrderDetail}
                    onClose={() => setShowOrderDetail(false)}
                    onUpdateStatus={handleStatusUpdateRequest}
                    onUpdatePayment={handlePaymentUpdateRequest}
                    isLoading={updatingOrders.has(selectedOrder.id)}
                />
            )}
            
            <ConfirmationModal
                isOpen={showStatusConfirm}
                onClose={() => setShowStatusConfirm(false)}
                onConfirm={() => handleUpdateOrderStatus(pendingUpdate.orderId, pendingUpdate.newValue)}
                title="Confirm Status Update"
                message={`Are you sure you want to change the order status from "${pendingUpdate.currentValue}" to "${pendingUpdate.newValue}"?`}
                confirmText="Update Status"
                cancelText="Cancel"
                isLoading={pendingUpdate.isLoading}
            />
            
            <ConfirmationModal
                isOpen={showPaymentConfirm}
                onClose={() => setShowPaymentConfirm(false)}
                onConfirm={() => handleUpdatePaymentStatus(pendingUpdate.orderId, pendingUpdate.newValue)}
                title="Confirm Payment Status Update"
                message={`Are you sure you want to change the payment status from "${pendingUpdate.currentValue}" to "${pendingUpdate.newValue}"?`}
                confirmText="Update Payment Status"
                cancelText="Cancel"
                isLoading={pendingUpdate.isLoading}
            />
        </div>
    );
}