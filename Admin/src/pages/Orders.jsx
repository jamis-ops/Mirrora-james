import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Calendar, Package, CreditCard, User, Phone, Mail, MapPin, Clock, TrendingUp } from "lucide-react";

// Mock components that would be imported
const Header = () => (
  <header className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
      </div>
    </div>
  </header>
);

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Order ID</label>
                <p className="text-lg font-semibold text-gray-900">{order.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Product</label>
                <p className="text-gray-900">{order.product}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="text-xl font-bold text-green-600">{order.amount}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Customer</label>
                <p className="text-gray-900 font-medium">{order.customer.name}</p>
                <p className="text-gray-500 text-sm">{order.customer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Order Date</label>
                <p className="text-gray-900">{order.date} at {order.time}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status,  orderId, onUpdate }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    processing: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <select
      value={status}
      onChange={(e) => onUpdate(orderId, e.target.value)}
      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${config.bg} ${config.text} ${config.border} capitalize`}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
    </select>
  );
};

// Payment badge component
const PaymentBadge = ({ payment,  orderId, onUpdate }) => {
  const paymentConfig = {
    pending: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    partial: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    paid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' }
  };

  const config = paymentConfig[payment] || paymentConfig.pending;

  return (
    <select
      value={payment}
      onChange={(e) => onUpdate(orderId, e.target.value)}
      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${config.bg} ${config.text} ${config.border} capitalize`}
    >
      <option value="pending">Pending</option>
      <option value="partial">Partial</option>
      <option value="paid">Paid</option>
    </select>
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

// Mock local storage functions (since localStorage isn't available)
const getInitialData = (key, initialValue) => {
  return initialValue;
};

const saveToLocalStorage = () => {
  // Mock function - would save to localStorage in real environment
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="p-6 max-w-7xl mx-auto">
        {/* Page Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
              <p className="text-gray-600">Track and manage all your customer orders</p>
            </div>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₱{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                statusFilter === "All Status" ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
              onClick={() => setStatusFilter("All Status")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orderCounts.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                statusFilter === "Pending" ? "border-yellow-500 bg-yellow-50" : "border-gray-200"
              }`}
              onClick={() => setStatusFilter("Pending")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{orderCounts.pending}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                statusFilter === "Processing" ? "border-purple-500 bg-purple-50" : "border-gray-200"
              }`}
              onClick={() => setStatusFilter("Processing")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-purple-600">{orderCounts.processing}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                statusFilter === "Shipped" ? "border-indigo-500 bg-indigo-50" : "border-gray-200"
              }`}
              onClick={() => setStatusFilter("Shipped")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-indigo-600">{orderCounts.shipped}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>

            <div 
              className={`bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                statusFilter === "Delivered" ? "border-green-500 bg-green-50" : "border-gray-200"
              }`}
              onClick={() => setStatusFilter("Delivered")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{orderCounts.delivered}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer text-sm min-w-[150px]"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {(searchQuery || statusFilter !== "All Status") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All Status");
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Orders Overview</h2>
                  <p className="text-sm text-gray-600">Showing {filteredOrders.length} of {orders.length} orders</p>
                </div>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== "All Status"
                  ? "Try adjusting your search or filter criteria."
                  : "No orders have been placed yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <div className="hidden lg:block">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <tr key={order.id} className={`transition-colors duration-200 hover:bg-gray-50 ${index < filteredOrders.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{order.id}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{order.customer.name}</div>
                              <div className="text-xs text-gray-500">{order.customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900 mb-1">{order.product}</div>
                          <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900 text-lg">{order.amount}</div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge
                            status={order.status}
                            orderId={order.id}
                            onUpdate={handleUpdateOrderStatus}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <PaymentBadge
                            payment={order.payment}
                            orderId={order.id}
                            onUpdate={handleUpdatePaymentStatus}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{order.date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="inline-flex items-center justify-center w-9 h-9 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
                            title="View Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{order.id}</div>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{order.customer.name}</div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-900 mb-1">{order.product}</div>
                      <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="font-bold text-gray-900 text-lg">{order.amount}</div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{order.date}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <StatusBadge
                        status={order.status}
                        orderId={order.id}
                        onUpdate={handleUpdateOrderStatus}
                      />
                      <PaymentBadge
                        payment={order.payment}
                        orderId={order.id}
                        onUpdate={handleUpdatePaymentStatus}
                      />
                    </div>
                  </div>
                ))}
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
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdatePayment={handleUpdatePaymentStatus}
        />
      )}
    </div>
  );
}