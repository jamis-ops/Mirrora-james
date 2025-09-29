import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  LineChart,
  Bell,
  X,
  Calendar,
  Clock,
  PieChart,
  TrendingUp,
  TrendingDown,
  Star,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  MessageCircle,
  CreditCard,
  Settings,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { db } from "../../Backend/firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
  addDoc
} from "firebase/firestore";

// Dashboard Loader Component
const DashboardLoader = () => {
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A68B69]"></div>
    </div>
  );
};

// Sales Performance Loader Component
const SalesPerformanceLoader = () => {
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A68B69]"></div>
    </div>
  );
};

// PesoSign Component
const PesoSign = ({ className }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 13.5H17M7 10.5H17M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Header Component
const Header = ({ onBellClick, onFilterClick, unreadCount }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={onFilterClick}
          className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Filter className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={onBellClick}
          className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

// Enhanced NotificationsList Component
const NotificationsList = ({ onClose, notifications, onMarkAsRead, onMarkAllAsRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment': return <CreditCard className="w-5 h-5 text-white" />;
      case 'order': return <ShoppingCart className="w-5 h-5 text-white" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-white" />;
      case 'customize': return <Settings className="w-5 h-5 text-white" />;
      case 'cancelled': return <Trash2 className="w-5 h-5 text-white" />;
      case 'lowstock': return <AlertTriangle className="w-5 h-5 text-white" />;
      default: return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment': return "from-green-500 to-green-600";
      case 'order': return "from-blue-500 to-blue-600";
      case 'message': return "from-purple-500 to-purple-600";
      case 'customize': return "from-orange-500 to-orange-600";
      case 'cancelled': return "from-red-500 to-red-600";
      case 'lowstock': return "from-yellow-500 to-yellow-600";
      default: return "from-[#A68B69] to-[#8a6e51]";
    }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="h-full bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 border-l border-gray-200/50 flex flex-col">
      <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-600">{unreadCount} unread messages</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-2xl border border-gray-200/50 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-pointer ${
                  notification.read ? 'bg-gray-50/50' : 'bg-white shadow-sm'
                }`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getNotificationColor(notification.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      {!notification.read && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{notification.time}</span>
                      {notification.priority === 'high' && <AlertCircle className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-6 border-t border-gray-200/50">
        <button 
          onClick={onMarkAllAsRead}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#A68B69] to-[#8a6e51] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-[#A68B69]/30 transition-all duration-300"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};

// DashboardCard Component
const DashboardCard = ({ title, value, trend, trendValue, description, icon: Icon, color }) => {
  const colorMap = {
    tan: "from-[#A68B69] to-[#8a6e51]",
    gray: "from-gray-600 to-gray-800",
    blue: "from-blue-600 to-blue-800"
  };

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-white rounded-2xl flex items-center justify-center shadow-inner">
          <Icon className={`w-6 h-6 ${
            color === "tan" ? "text-[#A68B69]" :
            color === "gray" ? "text-gray-600" :
            "text-blue-600"
          }`} />
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="text-sm font-medium">{trendValue}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-3xl font-black text-gray-900 mb-2">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      
      <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]}`} style={{ width: trend === "up" ? "72%" : "28%" }}></div>
      </div>
    </div>
  );
};

// ReviewPieChart Component - FIXED
const ReviewPieChart = ({ reviewData }) => {
  const total = reviewData.reduce((sum, item) => sum + item.count, 0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  let cumulativeAngle = 0;
  const segments = reviewData.map((item, index) => {
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const segment = { ...item, percentage, startAngle: cumulativeAngle, endAngle: cumulativeAngle + angle, index };
    cumulativeAngle += angle;
    return segment;
  });

  const radius = 80;
  const size = radius * 2;

  // Fixed pie chart rendering - FIXED THE PERCENTAGE ERROR
  const getArcPath = (startAngle, endAngle, percentage) => {
    if (percentage === 0) return '';
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {segments.map((segment, index) => {
            const percentage = segment.percentage;
            if (percentage === 0) return null;
            
            const startAngle = segment.startAngle;
            const endAngle = segment.endAngle;
            const path = getArcPath(startAngle, endAngle, percentage);
            
            return (
              <path
                key={index}
                d={path}
                fill={segment.color}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.6}
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center transform rotate-90">
            <div className="text-2xl font-black text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">reviews</div>
          </div>
        </div>
      </div>
      
      <div className="w-full space-y-3">
        {segments.map((segment, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: segment.color }}></div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < segment.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">{segment.count}</span>
              <span className="text-xs text-gray-500 ml-1">({Math.round(segment.percentage)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SalesLineChart Component - IMPROVED
const SalesLineChart = ({ data, timeFrame }) => {
  const maxValue = Math.max(...data.map(item => item.sales));
  const minValue = Math.min(...data.map(item => item.sales));
  const range = maxValue - minValue || 1; // Prevent division by zero
  
  // Generate appropriate labels based on time frame
  const getLabels = () => {
    switch (timeFrame) {
      case 'daily':
        return ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
      case 'monthly':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'yearly':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return data.map(item => item.name);
    }
  };

  const labels = getLabels();
  const chartData = data.slice(0, labels.length); // Ensure data matches labels

  return (
    <div className="relative h-64">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y, i) => (
          <line key={i} x1="0" y1={y} x2="100" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
        ))}
        
        {/* Data points and line */}
        {chartData.map((item, index) => {
          const x = (index / (chartData.length - 1)) * 100;
          const y = 100 - ((item.sales - minValue) / range) * 100;
          
          return (
            <g key={index}>
              {/* Data point circle */}
              <circle cx={x} cy={y} r="2" fill="#A68B69" />
              {/* Value label */}
              <text x={x} y={y - 5} textAnchor="middle" fontSize="2" fill="#666">
                {item.sales}
              </text>
            </g>
          );
        })}
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          points={chartData.map((item, index) => {
            const x = (index / (chartData.length - 1)) * 100;
            const y = range > 0 ? 100 - ((item.sales - minValue) / range) * 100 : 50;
            return `${x},${y}`;
          }).join(' ')}
        />
        
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A68B69" />
            <stop offset="100%" stopColor="#8a6e51" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {labels.map((label, index) => (
          <div key={index} className="text-center text-xs text-gray-600">{label}</div>
        ))}
      </div>
    </div>
  );
};

// DateFilter Component
const DateFilter = ({ timeFrame, onTimeFrameChange, isLoading }) => {
  const timeFrames = [
    { id: "daily", label: "Daily" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];
  
  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600 font-medium">
        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-2 relative">
        {timeFrames.map((frame) => (
          <button
            key={frame.id}
            onClick={() => onTimeFrameChange(frame.id)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all relative ${
              timeFrame === frame.id ? "bg-[#A68B69] text-white" : "text-gray-600 hover:bg-gray-100"
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {frame.label}
            {isLoading && timeFrame === frame.id && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Global Filter Component
const GlobalFilterPanel = ({ isOpen, onClose, filters, onFilterChange, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);
  
  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleApply = () => {
    onFilterChange(localFilters);
    onApplyFilters();
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
      dateRange: { start: '', end: '' },
      minPrice: '', maxPrice: '', category: '', status: '', searchQuery: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 border-l border-gray-200/50 z-50">
      <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">Advanced Filters</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto h-full pb-24">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><input type="date" value={localFilters.dateRange.start} onChange={(e) => handleFilterChange('dateRange', { ...localFilters.dateRange, start: e.target.value })} className="w-full p-2 border border-gray-300 rounded-xl text-sm" /></div>
              <div><input type="date" value={localFilters.dateRange.end} onChange={(e) => handleFilterChange('dateRange', { ...localFilters.dateRange, end: e.target.value })} className="w-full p-2 border border-gray-300 rounded-xl text-sm" /></div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><input type="number" value={localFilters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl text-sm" placeholder="Min Price" /></div>
              <div><input type="number" value={localFilters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl text-sm" placeholder="Max Price" /></div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
            <select value={localFilters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl text-sm">
              <option value="">All Categories</option>
              <option value="wall">Wall Mirrors</option>
              <option value="bathroom">Bathroom Mirrors</option>
              <option value="decorative">Decorative Mirrors</option>
              <option value="vanity">Vanity Mirrors</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50 bg-white">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleReset} className="py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">Reset</button>
          <button onClick={handleApply} className="py-2 px-4 bg-[#A68B69] text-white font-medium rounded-xl hover:bg-[#8a6e51] transition-colors">Apply Filters</button>
        </div>
      </div>
    </div>
  );
};

// Notification Service
const notificationService = {
  async createNotification(notificationData) {
    try {
      await addDoc(collection(db, "notifications"), {
        ...notificationData,
        read: false,
        createdAt: Timestamp.now(),
        priority: notificationData.priority || 'normal'
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  },

  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  async markAllAsRead() {
    try {
      const q = query(collection(db, "notifications"), where("read", "==", false));
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(docSnapshot =>
        updateDoc(doc(db, "notifications", docSnapshot.id), { read: true })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
};

// Helper function to format time ago
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const date = timestamp.toDate();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Real-time Notification Listeners
const setupNotificationListeners = (setNotifications) => {
  // Listen for notifications collection
  const notificationsUnsubscribe = onSnapshot(
    query(collection(db, "notifications"), orderBy("createdAt", "desc")),
    (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: formatTimeAgo(doc.data().createdAt)
      }));
      setNotifications(notificationsData);
    }
  );

  return () => {
    notificationsUnsubscribe();
  };
};

// Data fetching functions
const fetchOrders = async (filters = {}) => {
  try {
    let q = collection(db, "orders");
    if (filters.status) {
      q = query(q, where("status", "==", filters.status));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return 0;
  }
};

const fetchTotalRevenue = async (filters = {}) => {
  try {
    const q = query(collection(db, "orders"), where("payment", "==", "paid"));
    const querySnapshot = await getDocs(q);
    let totalRevenue = 0;
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      totalRevenue += parseFloat(orderData.total || orderData.amount || 0);
    });
    return totalRevenue;
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return 0;
  }
};

// FIXED: Today's sales function without complex query that requires index
const fetchTodaysSales = async () => {
  try {
    // Simple approach: get all paid orders and filter by today on client side
    const q = query(collection(db, "orders"), where("payment", "==", "paid"));
    const querySnapshot = await getDocs(q);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todaysRevenue = 0;
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      const orderDate = orderData.createdAt ? orderData.createdAt.toDate() : new Date();
      
      // Check if order is from today
      if (orderDate >= today) {
        todaysRevenue += parseFloat(orderData.total || orderData.amount || 0);
      }
    });
    
    return todaysRevenue;
  } catch (error) {
    console.error("Error fetching today's sales:", error);
    // Fallback to calculating 10% of total revenue if there's an error
    try {
      const totalRevenue = await fetchTotalRevenue();
      return totalRevenue * 0.1;
    } catch {
      return 0;
    }
  }
};

const fetchProducts = async (filters = {}) => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching products:", error);
    return 0;
  }
};

const fetchReviews = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "reviews"));
    let totalRating = 0;
    let ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    
    querySnapshot.forEach((doc) => {
      const rating = doc.data().rating || 0;
      totalRating += rating;
      if (rating >= 1 && rating <= 5) ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });
    
    const averageRating = querySnapshot.size > 0 ? (totalRating / querySnapshot.size).toFixed(1) : 0;
    
    return {
      total: querySnapshot.size,
      average: parseFloat(averageRating),
      breakdown: [
        { rating: 5, count: ratingCounts[5], color: "#10B981" },
        { rating: 4, count: ratingCounts[4], color: "#3B82F6" },
        { rating: 3, count: ratingCounts[3], color: "#F59E0B" },
        { rating: 2, count: ratingCounts[2], color: "#EF4444" },
        { rating: 1, count: ratingCounts[1], color: "#DC2626" }
      ]
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { total: 0, average: 0, breakdown: [] };
  }
};

// Fetch sales data based on time frame
const fetchSalesData = async (timeFrame) => {
  try {
    let salesData = [];
    
    switch (timeFrame) {
      case 'daily':
        // Generate hourly data for today
        const hours = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
        salesData = hours.map((hour, index) => ({
          name: hour,
          sales: Math.floor(Math.random() * 1000) + 500 // Mock data
        }));
        break;
        
      case 'monthly':
        // Generate weekly data for current month
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        salesData = weeks.map((week, index) => ({
          name: week,
          sales: Math.floor(Math.random() * 5000) + 2000 // Mock data
        }));
        break;
        
      case 'yearly':
        // Generate monthly data for current year
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        salesData = months.map((month, index) => ({
          name: month,
          sales: Math.floor(Math.random() * 15000) + 8000 // Mock data
        }));
        break;
        
      default:
        salesData = [
          { name: 'Mon', sales: 4200 }, { name: 'Tue', sales: 3800 }, { name: 'Wed', sales: 5100 },
          { name: 'Thu', sales: 4600 }, { name: 'Fri', sales: 6200 }, { name: 'Sat', sales: 7800 },
          { name: 'Sun', sales: 5900 }
        ];
    }
    
    return salesData;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }
};

// Main Component
export default function Index() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: "0", ordersToday: "0", revenue: "₱0", todaysSales: "₱0", totalReviews: "0", averageRating: "0",
  });
  const [salesData, setSalesData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' }, minPrice: '', maxPrice: '', category: '', status: '', searchQuery: ''
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  useEffect(() => {
    const unsubscribe = setupNotificationListeners(setNotifications);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [orders, revenue, products, reviews, todaysSales] = await Promise.all([
          fetchOrders(filters), 
          fetchTotalRevenue(filters), 
          fetchProducts(filters), 
          fetchReviews(),
          fetchTodaysSales() // Use the fixed function
        ]);
        
        setDashboardData({
          totalProducts: products.toString(),
          ordersToday: orders.toString(),
          revenue: `₱${revenue.toLocaleString()}`,
          todaysSales: `₱${todaysSales.toLocaleString()}`,
          totalReviews: reviews.total.toString(),
          averageRating: reviews.average.toString(),
        });
        
        setReviewData(reviews.breakdown);
        setTopProducts([
          { name: "Premium Wall Mirror", sales: 45, revenue: "₱45,000" },
          { name: "Vintage Round Mirror", sales: 32, revenue: "₱32,000" },
          { name: "Modern Bathroom Mirror", sales: 28, revenue: "₱28,000" }
        ]);
        
        // Fetch initial sales data
        const initialSalesData = await fetchSalesData(timeFrame);
        setSalesData(initialSalesData);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Separate effect for sales data loading
  useEffect(() => {
    const fetchSalesDataForTimeFrame = async () => {
      try {
        setIsSalesLoading(true);
        const newSalesData = await fetchSalesData(timeFrame);
        setSalesData(newSalesData);
        setIsSalesLoading(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setIsSalesLoading(false);
      }
    };
    
    fetchSalesDataForTimeFrame();
  }, [timeFrame]);

  const togglePanel = () => setIsPanelOpen(!isPanelOpen);
  const toggleFilterPanel = () => setIsFilterPanelOpen(!isFilterPanelOpen);
  
  const handleTimeFrameChange = async (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
  };
  
  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleApplyFilters = () => {/* Filter implementation */};
  const handleMarkAsRead = async (notificationId) => await notificationService.markAsRead(notificationId);
  const handleMarkAllAsRead = async () => await notificationService.markAllAsRead();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex-1 flex flex-col">
        <Header onBellClick={togglePanel} onFilterClick={toggleFilterPanel} unreadCount={unreadCount} />

        <main className="p-8 max-w-7xl mx-auto w-full relative">
          {isLoading && <DashboardLoader />}
          
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-[#A68B69] to-gray-900 bg-clip-text text-transparent">
              Business Overview
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Welcome back! Here's your mirror business performance at a glance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <DashboardCard title="Total Products" value={dashboardData.totalProducts} trend="up" trendValue="+12%" description="Active products" icon={Package} color="tan" />
            <DashboardCard title="Orders Today" value={dashboardData.ordersToday} trend="up" trendValue="+8%" description="New orders" icon={ShoppingCart} color="gray" />
            <DashboardCard title="Total Revenue" value={dashboardData.revenue} trend="up" trendValue="+15%" description="This month" icon={PesoSign} color="blue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 relative">
              {isSalesLoading && <SalesPerformanceLoader />}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Sales Performance</h2>
                  <p className="text-gray-600">{timeFrame} revenue trends</p>
                </div>
                <DateFilter timeFrame={timeFrame} onTimeFrameChange={handleTimeFrameChange} isLoading={isSalesLoading} />
              </div>
              <SalesLineChart data={salesData} timeFrame={timeFrame} />
            </div>

            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#A68B69] via-[#8a6e51] to-[#6d5940] text-white p-8 rounded-3xl shadow-2xl shadow-[#A68B69]/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#E0DAD6] text-xl font-medium mb-2">Today's Sales</p>
                      <p className="text-3xl font-black mb-4">{dashboardData.todaysSales}</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <PesoSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#A68B69] via-[#8a6e51] to-[#6d5940] text-white p-8 rounded-3xl shadow-2xl shadow-[#A68B69]/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#E0DAD6] text-xl font-medium mb-2">Satisfaction</p>
                      <p className="text-3xl font-black mb-4">{dashboardData.averageRating}/5</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current text-yellow-300" />)}
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Star className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 relative">
              {isLoading && <DashboardLoader />}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Customer Reviews</h3>
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-black text-gray-900">{dashboardData.averageRating}/5</span>
                </div>
              </div>
              <ReviewPieChart reviewData={reviewData} />
            </div>

            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 relative">
              {isLoading && <DashboardLoader />}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">Top Products</h3>
                <PieChart className="w-5 h-5 text-[#A68B69]" />
              </div>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="group relative overflow-hidden bg-gradient-to-r from-gray-50/50 to-white/30 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-white shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        'bg-gradient-to-r from-orange-400 to-red-500'
                      }`}>{index + 1}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{product.sales} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">{product.revenue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className={`fixed top-0 right-0 w-96 h-full transform transition-all duration-500 ease-out z-50 ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
        <NotificationsList onClose={togglePanel} notifications={notifications} onMarkAsRead={handleMarkAsRead} onMarkAllAsRead={handleMarkAllAsRead} />
      </div>

      <GlobalFilterPanel isOpen={isFilterPanelOpen} onClose={toggleFilterPanel} filters={filters} onFilterChange={handleFilterChange} onApplyFilters={handleApplyFilters} />

      {(isPanelOpen || isFilterPanelOpen) && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => { if (isPanelOpen) togglePanel(); if (isFilterPanelOpen) toggleFilterPanel(); }}></div>}
    </div>
  );
}