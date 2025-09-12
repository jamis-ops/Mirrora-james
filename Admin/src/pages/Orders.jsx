import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Calendar, Package, CreditCard, User, Phone, Mail, MapPin, Clock, TrendingUp, MoreHorizontal, Download, RefreshCw, Plus, Settings, Bell, ChevronDown, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { db, collection, getDocs, doc, updateDoc } from "../../Backend/firebaseConfig.js";
import { query, orderBy, limit } from "firebase/firestore";

// Helper function to format currency, moved here to resolve the import error.
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

// Enhanced date formatting function
    const formatDateTime = (dateStr, timeStr) => {
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
            }) + (timeStr ? ` at ${date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true 
            })}` : '');
        } catch (error) {
            return dateStr || 'Invalid Date';
        }
    };

    // Calculate payment amounts
    const totalAmount = parseFloat(order.amount?.toString().replace(/[₱,]/g, '') || order.price?.toString().replace(/[₱,]/g, '') || '0');
    const downpaymentAmount = totalAmount * 0.5; // 50% downpayment
    const remainingAmount = totalAmount - downpaymentAmount;

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
                                        <p className="text-lg font-semibold text-gray-900">{order.customer?.name || order.customerName || 'N/A'}</p>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500 block mb-1">Product Name</label>
                                    <p className="text-xl font-semibold text-gray-900 mb-3">{order.product || order.productName || 'N/A'}</p>
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

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [loading, setLoading] = useState(true);
    const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);
    const [totalOrderCount, setTotalOrderCount] = useState(0);

    // Enhanced date formatting function for table display
    const formatOrderDate = (dateStr) => {
        try {
            let date;
            if (dateStr && dateStr.includes('/')) {
                const [month, day, year] = dateStr.split('/');
                date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
            } else if (dateStr && dateStr.includes('-')) {
                date = new Date(dateStr);
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
            });
        } catch (error) {
            return dateStr || 'Invalid Date';
        }
    };

    // Function to fetch orders from Firestore
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const ordersCollectionRef = collection(db, "orders");
            // First, get the total count of orders
            const allOrdersSnapshot = await getDocs(ordersCollectionRef);
            setTotalOrderCount(allOrdersSnapshot.docs.length);

            // Then, fetch the limited and sorted list
            const q = query(
                ordersCollectionRef, 
                orderBy('createdAt', 'desc'),
                limit(visibleOrdersCount)
            );
            const ordersSnapshot = await getDocs(q);

            const ordersList = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(ordersList);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount and when visibleOrdersCount changes
    useEffect(() => {
        fetchOrders();
    }, [visibleOrdersCount]);

    // Combined handler for "See More" and "See Less"
    const handleToggleOrders = () => {
        if (visibleOrdersCount > 10) {
            setVisibleOrdersCount(10);
        } else {
            setVisibleOrdersCount(prevCount => prevCount + 10);
        }
    };
    
    // Memoized calculations to avoid re-calculating on every render
    const filteredOrders = orders.filter((order) => {
        // Enhanced search with multiple customer field options
        const customerName = order.customer?.name || order.customerName || '';
        const customerEmail = order.customer?.email || order.customerEmail || order.email || '';
        const customerPhone = order.customer?.phone || order.customerPhone || order.phone || order.contactNumber || '';
        
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.product || order.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.amount || order.price || '').toString().toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "All Status" || order.status.toLowerCase() === statusFilter.toLowerCase();
            
        return matchesSearch && matchesStatus;
    });

    const orderCounts = {
        total: totalOrderCount,
        pending: orders.filter((o) => o.status === "pending").length,
        processing: orders.filter((o) => o.status === "processing").length,
        shipped: orders.filter((o) => o.status === "shipped").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
    };
    
    const totalRevenue = orders
        .filter(order => order.payment === 'paid')
        .reduce((sum, order) => {
            const amount = order.amount || order.price || '0';
            const numericAmount = parseInt(amount.toString().replace(/[₱,]/g, '')) || 0;
            return sum + numericAmount;
        }, 0);

    // Calculate partial payment revenue (50% downpayments)
    const partialRevenue = orders
        .filter(order => order.payment === 'partial')
        .reduce((sum, order) => {
            const amount = order.amount || order.price || '0';
            const numericAmount = parseInt(amount.toString().replace(/[₱,]/g, '')) || 0;
            return sum + (numericAmount * 0.5); // 50% downpayment
        }, 0);

    const totalCollected = totalRevenue + partialRevenue;

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };

    // Function to update order status in Firestore
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: newStatus });
            // Update local state after successful Firestore update
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order ));
            alert("Order status updated successfully!");
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
            // Update local state after successful Firestore update
            setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, payment: newPaymentStatus } : order ));
            alert("Payment status updated successfully!");
        } catch (error) {
            console.error("Error updating payment status:", error);
            alert("Failed to update payment status. Please try again.");
        }
    };

    const statusOptions = [
        "All Status",
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
    ];
    
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
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue Collected</p>
                                <p className="text-3xl font-bold text-[#A68B69]">
                                    ₱{totalCollected.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">Includes downpayments</p>
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
                                statusFilter === "All Status"
                                    ? "border-[#A68B69] bg-[#A68B69]/10 shadow-[#A68B69]/20"
                                    : "border-gray-200 hover:border-[#A68B69]/50"
                            }`}
                            onClick={() => setStatusFilter("All Status")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#A68B69]/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-[#A68B69] rounded-xl flex items-center justify-center shadow-md">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div
                                        className={`w-3 h-3 rounded-full ${statusFilter === "All Status" ? "bg-[#A68B69]" : "bg-gray-300"} transition-colors duration-200`}
                                    ></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{orderCounts.total}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Pending"
                                    ? "border-yellow-600 bg-yellow-50 shadow-yellow-200"
                                    : "border-gray-200 hover:border-yellow-300"
                            }`}
                            onClick={() => setStatusFilter("Pending")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div
                                        className={`w-3 h-3 rounded-full ${statusFilter === "Pending" ? "bg-yellow-500" : "bg-gray-300"} transition-colors duration-200`}
                                    ></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{orderCounts.pending}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Processing"
                                    ? "border-amber-600 bg-amber-50 shadow-amber-200"
                                    : "border-gray-200 hover:border-amber-300"
                            }`}
                            onClick={() => setStatusFilter("Processing")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
                                        <RefreshCw className="w-6 h-6 text-white" />
                                    </div>
                                    <div
                                        className={`w-3 h-3 rounded-full ${statusFilter === "Processing" ? "bg-amber-500" : "bg-gray-300"} transition-colors duration-200`}
                                    ></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Processing</p>
                                <p className="text-3xl font-bold text-amber-600">{orderCounts.processing}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Shipped"
                                    ? "border-blue-600 bg-blue-50 shadow-blue-200"
                                    : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => setStatusFilter("Shipped")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div
                                        className={`w-3 h-3 rounded-full ${statusFilter === "Shipped" ? "bg-blue-500" : "bg-gray-300"} transition-colors duration-200`}
                                    ></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Shipped</p>
                                <p className="text-3xl font-bold text-blue-600">{orderCounts.shipped}</p>
                            </div>
                        </div>

                        <div
                            className={`group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                statusFilter === "Delivered"
                                    ? "border-green-600 bg-green-50 shadow-green-200"
                                    : "border-gray-200 hover:border-green-300"
                            }`}
                            onClick={() => setStatusFilter("Delivered")}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div
                                        className={`w-3 h-3 rounded-full ${statusFilter === "Delivered" ? "bg-green-500" : "bg-gray-300"} transition-colors duration-200`}
                                    ></div>
                                </div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Delivered</p>
                                <p className="text-3xl font-bold text-green-600">{orderCounts.delivered}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
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
                                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-4 focus:ring-[#A68B69]/20 focus:border-[#A68B69] transition-all duration-200"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
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
                                    <th scope="col" className="p-4 rounded-tr-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                            <td className="p-4 font-medium text-gray-900">{order.id}</td>
                                            <td className="p-4">{order.customer?.name || order.customerName || 'N/A'}</td>
                                            <td className="p-4">{order.product || order.productName || 'N/A'}</td>
                                            <td className="p-4">{formatOrderDate(order.date)}</td>
                                            <td className="p-4 font-semibold text-gray-900">{formatCurrency(parseFloat(order.amount?.toString().replace(/[₱,]/g, '') || order.price?.toString().replace(/[₱,]/g, '') || '0'))}</td>
                                            <td className="p-4">
                                                <EnhancedStatusBadge status={order.status} />
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
                                        <td colSpan="7" className="p-6 text-center text-gray-500">
                                            No orders found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {filteredOrders.length > 0 && totalOrderCount > visibleOrdersCount && (
                        <div className="p-4 flex justify-center">
                            <button
                                onClick={handleToggleOrders}
                                className={`inline-flex items-center gap-2 px-6 py-3 border border-transparent text-sm font-medium rounded-xl transition-all duration-200 shadow-md ${visibleOrdersCount > 10 ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-white bg-[#A68B69] hover:bg-[#8C7355]'}`}
                            >
                                {visibleOrdersCount > 10 ? (
                                    <>
                                        <ChevronDown className="w-4 h-4 transform rotate-180" /> See Less Orders
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" /> See More Orders
                                    </>
                                )}
                            </button>
                        </div>
                    )}
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