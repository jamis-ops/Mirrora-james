import React, { useState, useEffect } from "react";
import { X, Bell, Package, CreditCard, MessageSquare, Settings, AlertTriangle, XCircle } from "lucide-react";

// Enhanced Notification Component
const Notification = ({ id, type, title, message, timestamp, onDismiss, priority = 'normal' }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'customize':
        return <Settings className="w-5 h-5 text-orange-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'lowstock':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'medium':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-blue-500 bg-white';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${getPriorityStyles(priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {getNotificationIcon(type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 truncate">
              {title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {message}
            </p>
            <span className="text-xs text-gray-500 mt-2 block">
              {formatTimestamp(timestamp)}
            </span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Sample notifications with different types
const initialNotifications = [
  {
    id: 1,
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of $299.99 received for Order #1025',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    priority: 'normal'
  },
  {
    id: 2,
    type: 'order',
    title: 'New Order Placed',
    message: 'Order #1026 has been placed by John Doe',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    priority: 'medium'
  },
  {
    id: 3,
    type: 'message',
    title: 'New Customer Message',
    message: 'Sarah Johnson sent: "Can I customize the frame color?"',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    priority: 'normal'
  },
  {
    id: 4,
    type: 'customize',
    title: 'Customization Request',
    message: 'Custom order request for Vintage Mirror with gold frame',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    priority: 'medium'
  },
  {
    id: 5,
    type: 'cancelled',
    title: 'Order Cancelled',
    message: 'Order #1023 has been cancelled by customer',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    priority: 'high'
  },
  {
    id: 6,
    type: 'lowstock',
    title: 'Low Stock Alert',
    message: 'Vintage Frame Mirror - Only 3 units remaining',
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
    priority: 'high'
  }
];

// Main NotificationsList Component
export default function NotificationsList({ onClose }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');

  // Function to add new notification (you can call this from parent components)
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      priority: 'normal',
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Function to dismiss notification
  const dismissNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  // Function to dismiss all notifications
  const dismissAll = () => {
    setNotifications([]);
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  // Get notification counts by type
  const getNotificationCounts = () => {
    const counts = {
      all: notifications.length,
      payment: 0,
      order: 0,
      message: 0,
      customize: 0,
      cancelled: 0,
      lowstock: 0
    };
    
    notifications.forEach(notif => {
      counts[notif.type]++;
    });
    
    return counts;
  };

  const counts = getNotificationCounts();

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'payment', label: 'Payments', count: counts.payment },
    { key: 'order', label: 'Orders', count: counts.order },
    { key: 'message', label: 'Messages', count: counts.message },
    { key: 'customize', label: 'Custom', count: counts.customize },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    { key: 'lowstock', label: 'Low Stock', count: counts.lowstock }
  ];

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {filterOptions.map(option => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                filter === option.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
              {option.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === option.key ? 'bg-blue-800' : 'bg-gray-400 text-white'
                }`}>
                  {option.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={dismissAll}
              className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          <div className="p-4 space-y-3">
            {filteredNotifications.map((notification) => (
              <Notification
                key={notification.id}
                {...notification}
                onDismiss={() => dismissNotification(notification.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <Bell className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-600 font-medium mb-2">
              {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
            </p>
            <p className="text-xs text-gray-500">
              New notifications will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}