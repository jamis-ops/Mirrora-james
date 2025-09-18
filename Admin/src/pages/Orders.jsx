import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Filter, Eye, Calendar, Package, CreditCard, User, Phone, Mail, Clock, TrendingUp, MoreHorizontal, Download, RefreshCw, Plus, Settings, Bell, ChevronDown, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Tag } from "lucide-react";

import { db, collection, getDocs, doc, updateDoc } from "../../Backend/firebaseConfig.js";
import { query, orderBy, limit } from "firebase/firestore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Helper function to format currency
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

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
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
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-white bg-[#A68B69] hover:bg-[#8C7355] rounded-lg font-medium transition-all duration-200"
                        >
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
    <header className="bg-white/100 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Add your logo or title here */}
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

// Enhanced Status Badge Component with workflow enforcement
const EnhancedStatusBadge = ({ status, orderId, onUpdate, currentStatus }) => {
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

    // Define the status progression
    const getAvailableStatusOptions = (currentStatus) => {
        const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(currentStatus);
        
        if (currentIndex === -1) return statusOrder; // For non-standard statuses, show all
        
        // Only allow moving forward in the workflow, not backward
        return statusOrder.filter((_, index) => index >= currentIndex);
    };

    const availableOptions = getAvailableStatusOptions(currentStatus);

    return (
        <div className="relative">
            <select
                value={status}
                onChange={(e) => onUpdate(orderId, e.target.value)}
                className={`pl-10 pr-8 py-3 rounded-xl text-sm font-medium border-2 cursor-pointer appearance-none transition-all duration-200 hover:shadow-md ${config.bg} ${config.text} ${config.border} capitalize min-w-[140px]`}
                disabled={!availableOptions.includes(status) && status !== currentStatus}
            >
                {availableOptions.map(option => (
                    <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                ))}
                {/* Include current status even if not in available options to show it */}
                {!availableOptions.includes(status) && (
                    <option value={status} disabled>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                )}
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
                className={`pl-10 pr-8 py-3 rounded-xl text-sm font-medium border-2 cursor-pointer appearance-none transition-all duration-200 hover:shadow-md ${config.bg} ${config.text} ${config.border} capitalize min-w-[140px]`}
            >
                <option value="pending">Pending</option>
                <option value="partial">Partial (50% Paid)</option>
                <option value="paid">Fully Paid</option>
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

// Order Type Badge Component
const OrderTypeBadge = ({ type }) => {
    if (type === 'custom') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                <Tag className="w-3 h-3" />
                Custom
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <Tag className="w-3 h-3" />
            Regular
        </span>
    );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, isOpen, onClose, onUpdateStatus, onUpdatePayment }) => {
    if (!isOpen) return null;

    // Enhanced date formatting function
    const formatDateTime = useCallback((dateStr, timeStr) => {
        try {
            let date;
            if (dateStr && dateStr.includes('/')) {
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

    const totalAmount = getTotalAmount(order);
    const downpaymentAmount = totalAmount * 0.5;
    const remainingAmount = totalAmount - downpaymentAmount;

    const renderProductDetails = () => {
        if (order.type === 'custom') {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">Custom Order Details</h4>
                            <OrderTypeBadge type="custom" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <label className="text-sm font-medium text-blue-800 block mb-2">Base Product</label>
                            <p className="text-lg font-semibold text-gray-900">{order.customizationDetails?.productInfo?.name || 'Custom Mirror'}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <label className="text-sm font-medium text-blue-800 block mb-2">Dimensions</label>
                            <p className="text-lg font-semibold text-gray-900">
                                {order.customizationDetails?.dimensions 
                                    ? `${order.customizationDetails.dimensions.height} × ${order.customizationDetails.dimensions.width} cm` 
                                    : 'Custom size'}
                            </p>
                        </div>
                        {order.customizationDetails?.frameStyle && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <label className="text-sm font-medium text-blue-800 block mb-2">Frame Style</label>
                                <p className="text-lg font-semibold text-gray-900">{order.customizationDetails.frameStyle}</p>
                            </div>
                        )}
                        {order.customizationDetails?.material && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <label className="text-sm font-medium text-blue-800 block mb-2">Material</label>
                                <p className="text-lg font-semibold text-gray-900">{order.customizationDetails.material}</p>
                            </div>
                        )}
                        {order.customizationDetails?.referenceImages && order.customizationDetails.referenceImages.length > 0 && (
                            <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <label className="text-sm font-medium text-blue-800 block mb-2">Reference Images</label>
                                <p className="text-gray-900">{order.customizationDetails.referenceImages.length} image(s) provided</p>
                                {/* You can add image display here if needed */}
                            </div>
                        )}
                        {order.customizationDetails?.additionalNotes && (
                            <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <label className="text-sm font-medium text-blue-800 block mb-2">Additional Notes</label>
                                <p className="text-gray-900 italic">{order.customizationDetails.additionalNotes}</p>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-600 block mb-2">Quantity</label>
                        <p className="text-xl font-bold text-gray-900">1 (Custom)</p>
                    </div>
                </div>
            );
        } else {
            // Regular order details
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500 block mb-1">Product Name</label>
                        <p className="text-xl font-semibold text-gray-900 mb-3">{getProductName(order)}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600">Quantity:</span>
                                <p className="font-semibold text-gray-900">{order.quantity || '1'}</p>
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
            );
        }
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
                                <OrderTypeBadge type={order.type || 'regular'} />
                                <p className="text-gray-600">Complete order information and management</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md">
                            ✕
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3">
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
                                <EnhancedStatusBadge status={order.status} orderId={order.id} onUpdate={onUpdateStatus} currentStatus={order.status} />
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                <label className="text-sm font-medium text-gray-500 block mb-2">Payment Status</label>
                                <EnhancedPaymentBadge payment={order.payment} orderId={order.id} onUpdate={onUpdatePayment} />
                            </div>
                        </div>
                    </div>

                    {/* Customer Contact Information Card */}
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
                                        <p className="text-lg font-semibold text-gray-900">{getCustomerName(order)}</p>
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
                                        <p className="text-gray-900 font-medium">{order.customer?.email || order.customerEmail || order.email || 'N/A'}</p>
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
                                        <p className="text-gray-900 font-medium">{order.customer?.phone || order.customerPhone || order.phone || order.contactNumber || 'N/A'}</p>
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
                            {renderProductDetails()}
                        </div>
                    </div>

                    {/* Payment Information Card */}
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

                    {/* Order Summary Card */}
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

// Updated Helper function to extract customer name from order
const getCustomerName = (order) => {
    // Check all possible locations where customer name might be stored
    if (order.customer?.name) return order.customer.name;
    if (order.customerName) return order.customerName;
    if (order.items && order.items[0]?.name) return order.items[0].name;
    if (order.shippingInfo?.name) return order.shippingInfo.name;
    if (order.userInfo?.name) return order.userInfo.name;
    if (order.customer?.fullName) return order.customer.fullName; // For custom orders
    return 'N/A';
};

// Updated Helper function to extract product name from order
const getProductName = (order) => {
    if (order.type === 'custom') {
        return order.customizationDetails?.productInfo?.name || "Custom Mirror Order";
    }
    if (order.product) return order.product;
    if (order.productName) return order.productName;
    if (order.items && order.items[0]?.productName) return order.items[0].productName;
    if (order.items && order.items[0]?.name) return order.items[0].name;
    return 'N/A';
};

// Updated Helper function to extract total amount from order (returns number)
const getTotalAmount = (order) => {
    let amount;
    if (order.type === 'custom') {
        amount = order.total;
    } else {
        amount = order.amount || order.price || (order.items && order.items[0]?.total) || order.total;
    }
    if (typeof amount === 'string') {
        return parseFloat(amount.replace(/[₱,]/g, '')) || 0;
    }
    return typeof amount === 'number' ? amount : 0;
};

// Updated Helper function to extract order date from order
const getOrderDate = (order) => {
    if (order.type === 'custom') {
        return order.createdAt || order.timestamp || order.date;
    }
    if (order.date) return order.date;
    if (order.orderDate) return order.orderDate;
    if (order.createdAt) return order.createdAt;
    if (order.timestamp) return order.timestamp;
    return 'N/A';
};

// Main Orders Component
export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [typeFilter, setTypeFilter] = useState("All"); // New filter for order type
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;
    
    // State for confirmation modals
    const [showStatusConfirm, setShowStatusConfirm] = useState(false);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState({ type: '', orderId: '', newValue: '' });

    // Enhanced date formatting function for table display
    const formatOrderDate = useCallback((dateStr) => {
        try {
            let date;
            
            // Handle Firebase Timestamp objects
            if (dateStr && typeof dateStr === 'object' && dateStr.seconds) {
                date = new Date(dateStr.seconds * 1000);
            } 
            // Handle string dates
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

    // Function to fetch orders from Firestore
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const ordersCollectionRef = collection(db, "orders");
            const ordersSnapshot = await getDocs(ordersCollectionRef);
            const ordersList = ordersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: data.type || 'regular', // Ensure type is set
                    ...data
                };
            });
            setOrders(ordersList);
            
            // Debug: Log the first order to see its structure
            if (ordersList.length > 0) {
                console.log("First order structure:", ordersList[0]);
                console.log("Order date field:", ordersList[0].date);
                console.log("Order timestamp field:", ordersList[0].timestamp);
                console.log("Custom orders found:", ordersList.filter(o => o.type === 'custom').length);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Memoized calculations to avoid re-calculating on every render
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const customerName = getCustomerName(order);
            const customerEmail = order.customer?.email || order.customerEmail || order.email || '';
            const customerPhone = order.customer?.phone || order.customerPhone || order.phone || order.contactNumber || '';

            const matchesSearch =
                order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                getProductName(order).toLowerCase().includes(searchQuery.toLowerCase()) ||
                getTotalAmount(order).toString().toLowerCase().includes(searchQuery.toLowerCase());

            // Fixed: Case-insensitive status matching
            const matchesStatus = statusFilter === "All Status" || 
                (order.status && order.status.toLowerCase() === statusFilter.toLowerCase());
            
            // New: Type filter
            const matchesType = typeFilter === "All" || 
                (order.type && order.type.toLowerCase() === typeFilter.toLowerCase());
            
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [orders, searchQuery, statusFilter, typeFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const startIndex = (currentPage - 1) * ordersPerPage;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

    // Calculate order counts and revenue - FIXED: Added null checks and case-insensitive comparison
    const orderCounts = useMemo(() => ({
        total: orders.length,
        pending: orders.filter((o) => o.status && o.status.toLowerCase() === "pending").length,
        processing: orders.filter((o) => o.status && o.status.toLowerCase() === "processing").length,
        shipped: orders.filter((o) => o.status && o.status.toLowerCase() === "shipped").length,
        delivered: orders.filter((o) => o.status && o.status.toLowerCase() === "delivered").length,
        custom: orders.filter((o) => o.type && o.type.toLowerCase() === "custom").length,
    }), [orders]);

    // FIXED: Calculate revenue from delivered AND paid orders
    const totalRevenue = useMemo(() => {
        return orders
            .filter(order => 
                order.status && order.status.toLowerCase() === "delivered" && 
                order.payment && (order.payment.toLowerCase() === "paid" || order.payment.toLowerCase() === "partial")
            )
            .reduce((sum, order) => {
                const amount = getTotalAmount(order);
                
                // If payment is partial, only count 50% of the amount
                if (order.payment && order.payment.toLowerCase() === "partial") {
                    return sum + (amount * 0.5);
                }
                
                return sum + amount;
            }, 0);
    }, [orders]);

    // Calculate total collected revenue (all paid orders regardless of status)
    const totalCollected = useMemo(() => {
        return orders
            .filter(order => order.payment && (order.payment.toLowerCase() === "paid" || order.payment.toLowerCase() === "partial"))
            .reduce((sum, order) => {
                const amount = getTotalAmount(order);
                
                if (order.payment && order.payment.toLowerCase() === "partial") {
                    return sum + (amount * 0.5);
                }
                
                return sum + amount;
            }, 0);
    }, [orders]);

    // Debug useEffect to check order counts and revenue
    useEffect(() => {
        console.log("Order counts:", orderCounts);
        console.log("Total revenue from delivered orders:", totalRevenue);
        console.log("Total collected revenue:", totalCollected);
        console.log("Delivered orders:", orders.filter((o) => o.status && o.status.toLowerCase() === "delivered"));
    }, [orders, orderCounts, totalRevenue, totalCollected]);

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
            currentValue: order.status
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
            currentValue: order.payment
        });
        setShowPaymentConfirm(true);
    };

    // Function to update order status in Firestore
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: newStatus });
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
            setShowStatusConfirm(false);
        } catch (error) {
            console.error("Error updating order status:", error);
            alert("Failed to update order status. Please try again.");
        }
    };

    // Function to update payment status in Firestore
    const handleUpdatePaymentStatus = async (orderId, newPaymentStatus) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { payment: newPaymentStatus });
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, payment: newPaymentStatus } : order));
            setShowPaymentConfirm(false);
        } catch (error) {
            console.error("Error updating payment status:", error);
            alert("Failed to update payment status. Please try again.");
        }
    };

    // Function to export orders to Excel
    const exportToExcel = () => {
        if (!filteredOrders || filteredOrders.length === 0) {
            alert("No orders to export.");
            return;
        }

        // Flatten orders for Excel
        const exportData = filteredOrders.map(order => ({
            OrderID: order.id,
            Type: order.type || 'regular',
            CustomerName: getCustomerName(order),
            Email: order.customer?.email || order.customerEmail || order.email || "N/A",
            Phone: order.customer?.phone || order.customerPhone || order.phone || order.contactNumber || "N/A",
            Product: getProductName(order),
            Quantity: order.items?.[0]?.quantity || order.quantity || 1,
            TotalAmount: getTotalAmount(order),
            Status: order.status || "N/A",
            Payment: order.payment || "N/A",
            Date: getOrderDate(order) || "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "orders.xlsx");
    };

    const statusOptions = ["All Status", "Pending", "Processing", "Shipped", "Delivered"];
    const typeOptions = ["All", "Regular", "Custom"];

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
                                <p className="text-sm font-medium text-gray-500 mb-1">Revenue from Delivered Orders</p>
                                <p className="text-3xl font-bold text-[#A68B69]">
                                    {formatCurrency(totalRevenue)}
                                </p>
                                <p className="text-xs text-gray-500">From delivered and paid orders</p>
                            </div>
                            <div className="w-16 h-16 bg-[#A68B69] rounded-2xl flex items-center justify-center shadow-lg">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Stats Cards - Added Custom count */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
                    </div>

                    {/* Custom Orders Stat Card */}
                    {orderCounts.custom > 0 && (
                        <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                                        <Tag className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-800">Custom Orders</h3>
                                        <p className="text-blue-600">{orderCounts.custom} custom orders pending customization</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setTypeFilter("Custom"); setStatusFilter("All Status"); setCurrentPage(1); }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                                >
                                    View Custom
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search and Filter Section - Added Type Filter */}
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
                        {/* New Type Filter */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">Filter by Type:</span>
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                                className="py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-[#A68B69]/20 focus:border-[#A68B69] transition-all duration-200"
                            >
                                {typeOptions.map((option) => (
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

                {/* Orders Table - Added Type Column and Visual Distinction */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="p-4 rounded-tl-xl">Order ID</th>
                                    <th scope="col" className="p-4">Customer Name</th>
                                    <th scope="col" className="p-4">Type</th>
                                    <th scope="col" className="p-4">Product</th>
                                    <th scope="col" className="p-4">Order Date</th>
                                    <th scope="col" className="p-4">Total Amount</th>
                                    <th scope="col" className="p-4">Status</th>
                                    <th scope="col" className="p-4 rounded-tr-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.length > 0 ? (
                                    currentOrders.map((order) => (
                                        <tr key={order.id} className={`bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${order.type === 'custom' ? 'border-l-4 border-blue-500 bg-blue-50/50' : ''}`}>
                                            <td className="p-4 font-medium text-gray-900">{order.id}</td>
                                            <td className="p-4">{getCustomerName(order)}</td>
                                            <td className="p-4">
                                                <OrderTypeBadge type={order.type || 'regular'} />
                                            </td>
                                            <td className="p-4">
                                                {getProductName(order)}
                                                {order.type === 'custom' && (
                                                    <div className="mt-1">
                                                        <span className="text-xs text-blue-600 font-medium">Custom specifications</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">{formatOrderDate(getOrderDate(order))}</td>
                                            <td className="p-4">{formatCurrency(getTotalAmount(order))}</td>
                                            <td className="p-4">
                                                <EnhancedStatusBadge 
                                                    status={order.status} 
                                                    orderId={order.id} 
                                                    onUpdate={handleStatusUpdateRequest}
                                                    currentStatus={order.status}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-[#A68B69] hover:bg-[#8C7355] transition-colors duration-200"
                                                >
                                                    <Eye className="w-3 h-3" /> View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="p-6 text-center text-gray-500">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
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
            
            {/* Order Detail Modal */}
            {showOrderDetail && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    isOpen={showOrderDetail}
                    onClose={() => setShowOrderDetail(false)}
                    onUpdateStatus={handleStatusUpdateRequest}
                    onUpdatePayment={handlePaymentUpdateRequest}
                />
            )}
            
            {/* Status Update Confirmation Modal */}
            <ConfirmationModal
                isOpen={showStatusConfirm}
                onClose={() => setShowStatusConfirm(false)}
                onConfirm={() => handleUpdateOrderStatus(pendingUpdate.orderId, pendingUpdate.newValue)}
                title="Confirm Status Update"
                message={`Are you sure you want to change the order status from "${pendingUpdate.currentValue}" to "${pendingUpdate.newValue}"?`}
                confirmText="Update Status"
                cancelText="Cancel"
            />
            
            {/* Payment Status Update Confirmation Modal */}
            <ConfirmationModal
                isOpen={showPaymentConfirm}
                onClose={() => setShowPaymentConfirm(false)}
                onConfirm={() => handleUpdatePaymentStatus(pendingUpdate.orderId, pendingUpdate.newValue)}
                title="Confirm Payment Status Update"
                message={`Are you sure you want to change the payment status from "${pendingUpdate.currentValue}" to "${pendingUpdate.newValue}"?`}
                confirmText="Update Payment Status"
                cancelText="Cancel"
            />
        </div>
    );
}