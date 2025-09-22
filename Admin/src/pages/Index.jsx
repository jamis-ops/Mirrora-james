import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  LineChart,
  User,
  Activity,
  TrendingUp,
  TrendingDown,
  Bell,
  X,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Star,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  MoreHorizontal,
  Search
} from "lucide-react";
import { db } from "../../Backend/firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";

// Dashboard Loader Component (only for dashboard content)
const DashboardLoader = () => {
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A68B69]"></div>
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
const Header = ({ onBellClick, onFilterClick }) => {
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
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
      </div>
    </header>
  );
};

// NotificationsList Component
const NotificationsList = ({ onClose, notifications }) => {
  return (
    <div className="h-full bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 border-l border-gray-200/50 flex flex-col">
      <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">Notifications</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white/30 border border-gray-200/50 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#A68B69] to-[#8a6e51] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{notification.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200/50">
        <button className="w-full py-3 px-4 bg-gradient-to-r from-[#A68B69] to-[#8a6e51] text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-[#A68B69]/30 transition-all duration-300">
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
          {trend === "up" ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{trendValue}</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-3xl font-black text-gray-900 mb-2">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      
      <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]}`}
          style={{ width: trend === "up" ? "72%" : "28%" }}
        ></div>
      </div>
    </div>
  );
};

// ReviewPieChart Component - Updated to show a proper pie chart
const ReviewPieChart = ({ reviewData }) => {
  const total = reviewData.reduce((sum, item) => sum + item.count, 0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Calculate angles for the pie chart
  let cumulativeAngle = 0;
  const segments = reviewData.map((item, index) => {
    const percentage = total > 0 ? (item.count / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: cumulativeAngle,
      endAngle: cumulativeAngle + angle,
      index
    };
    cumulativeAngle += angle;
    return segment;
  });

  // Function to calculate coordinates on the circumference
  const getCoordinates = (angle, radius) => {
    const radians = (angle - 90) * (Math.PI / 180);
    return {
      x: radius + radius * Math.cos(radians),
      y: radius + radius * Math.sin(radians)
    };
  };

  // Function to create path for a segment
  const createPath = (startAngle, endAngle, radius) => {
    if (endAngle - startAngle === 360) {
      // Full circle
      return `M ${radius} ${radius} m -${radius} 0 a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0`;
    }
    
    const start = getCoordinates(startAngle, radius);
    const end = getCoordinates(endAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    return `M ${radius} ${radius} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  const radius = 80;
  const size = radius * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <svg width={size} height={size} className="transform -rotate-90">
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index;
            const scale = isHovered ? 1.05 : 1;
            
            return (
              <path
                key={index}
                d={createPath(segment.startAngle, segment.endAngle, radius)}
                fill={segment.color}
                stroke="white"
                strokeWidth="2"
                style={{ 
                  transform: `scale(${scale})`, 
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center transform rotate-90">
            <div className="text-2xl font-black text-gray-900">
              {total}
            </div>
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
              <div 
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < segment.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-sm font-medium text-gray-900">
                {segment.count}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({Math.round(segment.percentage)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SalesLineChart Component - Fixed to show a proper line chart
const SalesLineChart = ({ data, timeFrame }) => {
  const maxValue = Math.max(...data.map(item => item.sales));
  const minValue = Math.min(...data.map(item => item.sales));
  const range = maxValue - minValue;
  
  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = range > 0 ? 100 - ((item.sales - minValue) / range) * 100 : 50;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative h-64">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#f0f0f0"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Line path */}
        <polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          points={points}
        />
        
        {/* Gradient for the line */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A68B69" />
            <stop offset="100%" stopColor="#8a6e51" />
          </linearGradient>
        </defs>
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = range > 0 ? 100 - ((item.sales - minValue) / range) * 100 : 50;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="#A68B69"
              stroke="#fff"
              strokeWidth="1.5"
              className="cursor-pointer hover:r-3 transition-all"
            />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {data.map((item, index) => (
          <div key={index} className="text-center text-xs text-gray-600">
            {item.name}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="absolute top-0 right-0 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
        <div className="w-3 h-0.5 bg-gradient-to-r from-[#A68B69] to-[#8a6e51]"></div>
        <span className="text-xs font-medium text-gray-700">Revenue</span>
      </div>
    </div>
  );
};

// DateFilter Component - Updated to position filter on the right
const DateFilter = ({ timeFrame, onTimeFrameChange, customRange, onCustomRangeChange, onApplyCustomRange }) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  
  const timeFrames = [
    { id: "daily", label: "Daily" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];
  
  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-gray-600 font-medium">
        {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-2">
          {timeFrames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => onTimeFrameChange(frame.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                timeFrame === frame.id
                  ? "bg-[#A68B69] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {frame.label}
            </button>
          ))}
          
          <button
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
              isCustomOpen
                ? "bg-gray-100 text-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>Custom</span>
            {isCustomOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {isCustomOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl p-4 shadow-xl z-10 w-80">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => onCustomRangeChange({ ...customRange, start: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-xl"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => onCustomRangeChange({ ...customRange, end: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-xl"
              />
            </div>
            
            <button
              onClick={() => {
                onApplyCustomRange();
                setIsCustomOpen(false);
              }}
              className="w-full py-2 bg-[#A68B69] text-white font-medium rounded-xl hover:bg-[#8a6e51] transition-colors"
            >
              Apply Range
            </button>
          </div>
        )}
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
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleApply = () => {
    onFilterChange(localFilters);
    onApplyFilters();
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
      dateRange: { start: '', end: '' },
      minPrice: '',
      maxPrice: '',
      category: '',
      status: '',
      searchQuery: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 border-l border-gray-200/50 z-50 transform transition-transform duration-300">
      <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">Advanced Filters</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="p-6 overflow-y-auto h-full pb-24">
        <div className="space-y-6">
          {/* Date Range Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={localFilters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange', { 
                    ...localFilters.dateRange, 
                    start: e.target.value 
                  })}
                  className="w-full p-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={localFilters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange', { 
                    ...localFilters.dateRange, 
                    end: e.target.value 
                  })}
                  className="w-full p-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Price (₱)</label>
                <input
                  type="number"
                  value={localFilters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Price (₱)</label>
                <input
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl text-sm"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>
          
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-xl text-sm"
            >
              <option value="">All Categories</option>
              <option value="wall">Wall Mirrors</option>
              <option value="bathroom">Bathroom Mirrors</option>
              <option value="decorative">Decorative Mirrors</option>
              <option value="vanity">Vanity Mirrors</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-xl text-sm"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          
          {/* Search Query */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={localFilters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm"
                placeholder="Search products, orders..."
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/50 bg-white">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleReset}
            className="py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="py-2 px-4 bg-[#A68B69] text-white font-medium rounded-xl hover:bg-[#8a6e51] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock data fetching functions replaced with real Firestore queries
const fetchOrders = async (filters = {}) => {
  try {
    let ordersQuery = collection(db, "orders");
    
    // Apply filters if provided
    const conditions = [];
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    
    // For date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      conditions.push(where("createdAt", ">=", Timestamp.fromDate(startDate)));
      conditions.push(where("createdAt", "<=", Timestamp.fromDate(endDate)));
    }
    
    // Build the query with conditions
    const q = conditions.length > 0 ? query(ordersQuery, ...conditions) : ordersQuery;
    const querySnapshot = await getDocs(q);
    
    // Additional client-side filtering for price range
    let filteredDocs = querySnapshot.docs;
    if (filters.minPrice || filters.maxPrice) {
      filteredDocs = filteredDocs.filter(doc => {
        const orderData = doc.data();
        const total = parseFloat(orderData.total || orderData.amount || 0);
        
        if (filters.minPrice && total < parseFloat(filters.minPrice)) return false;
        if (filters.maxPrice && total > parseFloat(filters.maxPrice)) return false;
        
        return true;
      });
    }
    
    return filteredDocs.length;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return 0;
  }
};

const fetchTotalRevenue = async (filters = {}) => {
  try {
    let ordersQuery = collection(db, "orders");
    
    // Apply filters if provided
    const conditions = [where("payment", "==", "paid")];
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    
    // For date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      conditions.push(where("createdAt", ">=", Timestamp.fromDate(startDate)));
      conditions.push(where("createdAt", "<=", Timestamp.fromDate(endDate)));
    }
    
    // Build the query with conditions
    const q = query(ordersQuery, ...conditions);
    const querySnapshot = await getDocs(q);
    
    let totalRevenue = 0;
    
    // Additional client-side filtering for price range
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      const total = parseFloat(orderData.total || orderData.amount || 0);
      
      // Apply price range filters
      if (filters.minPrice && total < parseFloat(filters.minPrice)) return;
      if (filters.maxPrice && total > parseFloat(filters.maxPrice)) return;
      
      totalRevenue += total;
    });
    
    return totalRevenue;
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return 0;
  }
};

const fetchProducts = async (filters = {}) => {
  try {
    let productsQuery = collection(db, "products");
    
    // Apply filters if provided
    const conditions = [];
    if (filters.category) {
      conditions.push(where("category", "==", filters.category));
    }
    
    // Build the query with conditions
    const q = conditions.length > 0 ? query(productsQuery, ...conditions) : productsQuery;
    const querySnapshot = await getDocs(q);
    
    // Additional client-side filtering for search query
    let filteredDocs = querySnapshot.docs;
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => {
        const productData = doc.data();
        return (
          productData.name.toLowerCase().includes(searchTerm) ||
          productData.description.toLowerCase().includes(searchTerm)
        );
      });
    }
    
    return filteredDocs.length;
  } catch (error) {
    console.error("Error fetching products:", error);
    return 0;
  }
};

const fetchReviews = async (filters = {}) => {
  try {
    const reviewsRef = collection(db, "reviews");
    const querySnapshot = await getDocs(reviewsRef);
    
    let totalRating = 0;
    let ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    
    querySnapshot.forEach((doc) => {
      const reviewData = doc.data();
      const rating = reviewData.rating || 0;
      totalRating += rating;
      
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      }
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
    return {
      total: 0,
      average: 0,
      breakdown: [
        { rating: 5, count: 0, color: "#10B981" },
        { rating: 4, count: 0, color: "#3B82F6" },
        { rating: 3, count: 0, color: "#F59E0B" },
        { rating: 2, count: 0, color: "#EF4444" },
        { rating: 1, count: 0, color: "#DC2626" }
      ]
    };
  }
};

// FIXED: Modified fetchTodaysSales to avoid the composite index requirement
const fetchTodaysSales = async (filters = {}) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let ordersQuery = collection(db, "orders");
    
    // Apply filters if provided
    const conditions = [where("payment", "==", "paid")];
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    
    // Build the query with conditions
    const q = query(ordersQuery, ...conditions);
    const querySnapshot = await getDocs(q);
    
    let todaysSales = 0;
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      const orderDate = orderData.createdAt?.toDate?.() || new Date();
      const total = parseFloat(orderData.total || orderData.amount || 0);
      
      // Filter on the client side instead of in the query
      if (orderDate >= today && orderDate < tomorrow) {
        // Apply price range filters
        if (filters.minPrice && total < parseFloat(filters.minPrice)) return;
        if (filters.maxPrice && total > parseFloat(filters.maxPrice)) return;
        
        todaysSales += total;
      }
    });
    
    return todaysSales;
  } catch (error) {
    console.error("Error fetching today's sales:", error);
    return 0;
  }
};

const fetchTopProducts = async (filters = {}) => {
  try {
    let ordersQuery = collection(db, "orders");
    
    // Apply filters if provided
    const conditions = [];
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    
    // For date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      conditions.push(where("createdAt", ">=", Timestamp.fromDate(startDate)));
      conditions.push(where("createdAt", "<=", Timestamp.fromDate(endDate)));
    }
    
    // Build the query with conditions
    const q = conditions.length > 0 ? query(ordersQuery, ...conditions) : ordersQuery;
    const querySnapshot = await getDocs(q);
    
    const productSales = {};
    
    querySnapshot.forEach((doc) => {
      const orderData = doc.data();
      const orderTotal = parseFloat(orderData.total || orderData.amount || 0);
      
      // Apply price range filters
      if (filters.minPrice && orderTotal < parseFloat(filters.minPrice)) return;
      if (filters.maxPrice && orderTotal > parseFloat(filters.maxPrice)) return;
      
      if (orderData.items && Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
          if (item.name) {
            if (!productSales[item.name]) {
              productSales[item.name] = {
                name: item.name,
                sales: 0,
                revenue: 0
              };
            }
            
            const quantity = parseInt(item.quantity || 1);
            const price = parseFloat(item.price || 0);
            
            productSales[item.name].sales += quantity;
            productSales[item.name].revenue += quantity * price;
          }
        });
      }
    });
    
    // Convert to array and sort by sales
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3)
      .map(product => ({
        ...product,
        revenue: `₱${product.revenue.toLocaleString()}`
      }));
    
    return topProducts;
  } catch (error) {
    console.error("Error fetching top products:", error);
    return [
      { name: "Premium Wall Mirror", sales: 0, revenue: "₱0" },
      { name: "Vintage Round Mirror", sales: 0, revenue: "₱0" },
      { name: "Modern Bathroom Mirror", sales: 0, revenue: "₱0" }
    ];
  }
};

const fetchSalesData = async (timeFrame, filters = {}) => {
  try {
    let ordersQuery = collection(db, "orders");
    
    // Apply filters if provided
    const conditions = [where("payment", "==", "paid")];
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    
    // Build the query with conditions
    const q = query(ordersQuery, ...conditions);
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    let salesData = [];
    
    if (timeFrame === "daily") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const daySales = querySnapshot.docs.reduce((total, doc) => {
          const orderData = doc.data();
          const orderDate = orderData.createdAt?.toDate?.() || new Date();
          const orderTotal = parseFloat(orderData.total || orderData.amount || 0);
          
          // Apply date filter
          if (orderDate >= dayStart && orderDate <= dayEnd) {
            // Apply price range filters
            if (filters.minPrice && orderTotal < parseFloat(filters.minPrice)) return total;
            if (filters.maxPrice && orderTotal > parseFloat(filters.maxPrice)) return total;
            
            return total + orderTotal;
          }
          return total;
        }, 0);
        
        salesData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: daySales
        });
      }
    } else if (timeFrame === "monthly") {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const monthSales = querySnapshot.docs.reduce((total, doc) => {
          const orderData = doc.data();
          const orderDate = orderData.createdAt?.toDate?.() || new Date();
          const orderTotal = parseFloat(orderData.total || orderData.amount || 0);
          
          // Apply date filter
          if (orderDate >= monthStart && orderDate <= monthEnd) {
            // Apply price range filters
            if (filters.minPrice && orderTotal < parseFloat(filters.minPrice)) return total;
            if (filters.maxPrice && orderTotal > parseFloat(filters.maxPrice)) return total;
            
            return total + orderTotal;
          }
          return total;
        }, 0);
        
        salesData.push({
          name: date.toLocaleDateString('en-US', { month: 'short' }),
          sales: monthSales
        });
      }
    } else if (timeFrame === "yearly") {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);
        
        const yearSales = querySnapshot.docs.reduce((total, doc) => {
          const orderData = doc.data();
          const orderDate = orderData.createdAt?.toDate?.() || new Date();
          const orderTotal = parseFloat(orderData.total || orderData.amount || 0);
          
          // Apply date filter
          if (orderDate >= yearStart && orderDate <= yearEnd) {
            // Apply price range filters
            if (filters.minPrice && orderTotal < parseFloat(filters.minPrice)) return total;
            if (filters.maxPrice && orderTotal > parseFloat(filters.maxPrice)) return total;
            
            return total + orderTotal;
          }
          return total;
        }, 0);
        
        salesData.push({
          name: year.toString(),
          sales: yearSales
        });
      }
    }
    
    return salesData;
  } catch (error) {
    console.error("Error fetching sales data:", error);
    
    // Fallback mock data
    if (timeFrame === "daily") {
      return [
        { name: 'Mon', sales: 4200 },
        { name: 'Tue', sales: 3800 },
        { name: 'Wed', sales: 5100 },
        { name: 'Thu', sales: 4600 },
        { name: 'Fri', sales: 6200 },
        { name: 'Sat', sales: 7800 },
        { name: 'Sun', sales: 5900 }
      ];
    } else if (timeFrame === "monthly") {
      return [
        { name: 'Jan', sales: 45000 },
        { name: 'Feb', sales: 52000 },
        { name: 'Mar', sales: 48000 },
        { name: 'Apr', sales: 61000 },
        { name: 'May', sales: 55000 },
        { name: 'Jun', sales: 67000 }
      ];
    } else {
      return [
        { name: '2020', sales: 420000 },
        { name: '2021', sales: 580000 },
        { name: '2022', sales: 650000 },
        { name: '2023', sales: 720000 },
        { name: '2024', sales: 890000 }
      ];
    }
  }
};

export default function Index() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: "0",
    ordersToday: "0",
    revenue: "₱0",
    todaysSales: "₱0",
    totalReviews: "0",
    averageRating: "0",
  });
  const [salesData, setSalesData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    minPrice: '',
    maxPrice: '',
    category: '',
    status: '',
    searchQuery: ''
  });
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel with filters
        const [orders, revenue, products, reviews, todaysSales, topProductsData] = await Promise.all([
          fetchOrders(filters),
          fetchTotalRevenue(filters),
          fetchProducts(filters),
          fetchReviews(filters),
          fetchTodaysSales(filters),
          fetchTopProducts(filters)
        ]);
        
        // Set dashboard data
        setDashboardData({
          totalProducts: products.toString(),
          ordersToday: orders.toString(),
          revenue: `₱${revenue.toLocaleString()}`,
          todaysSales: `₱${todaysSales.toLocaleString()}`,
          totalReviews: reviews.total.toString(),
          averageRating: reviews.average.toString(),
        });
        
        // Fetch sales data based on current time frame and filters
        const sales = await fetchSalesData(timeFrame, filters);
        setSalesData(sales);
        
        // Set review data and top products
        setReviewData(reviews.breakdown);
        setTopProducts(topProductsData);
        
        // Set notifications (you might want to fetch these from Firestore too)
        setNotifications([
          {
            title: "New Order Completed",
            message: "Premium Wall Mirror - ₱3,500 by Maria Santos",
            time: "5 minutes ago"
          },
          {
            title: "5-Star Review Received", 
            message: "\"Amazing quality mirror, exactly as described!\"",
            time: "12 minutes ago"
          },
          {
            title: "Stock Alert",
            message: "Vintage Round Mirror running low (3 units left)",
            time: "1 hour ago"
          }
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [timeFrame, filters]); // Refetch when timeFrame or filters change

  const togglePanel = () => setIsPanelOpen(!isPanelOpen);
  const toggleFilterPanel = () => setIsFilterPanelOpen(!isFilterPanelOpen);

  const handleTimeFrameChange = async (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
    const sales = await fetchSalesData(newTimeFrame, filters);
    setSalesData(sales);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = async () => {
    setIsLoading(true);
    
    // Refetch all data with the new filters
    const [orders, revenue, products, reviews, todaysSales, topProductsData, sales] = await Promise.all([
      fetchOrders(filters),
      fetchTotalRevenue(filters),
      fetchProducts(filters),
      fetchReviews(filters),
      fetchTodaysSales(filters),
      fetchTopProducts(filters),
      fetchSalesData(timeFrame, filters)
    ]);
    
    // Update all state with filtered data
    setDashboardData({
      totalProducts: products.toString(),
      ordersToday: orders.toString(),
      revenue: `₱${revenue.toLocaleString()}`,
      todaysSales: `₱${todaysSales.toLocaleString()}`,
      totalReviews: reviews.total.toString(),
      averageRating: reviews.average.toString(),
    });
    
    setSalesData(sales);
    setReviewData(reviews.breakdown);
    setTopProducts(topProductsData);
    
    setIsLoading(false);
  };

  // Real-time listeners for data updates
  useEffect(() => {
    // Listen for new orders
    const ordersUnsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      fetchOrders(filters).then(count => {
        setDashboardData(prev => ({ ...prev, ordersToday: count.toString() }));
      });
      
      fetchTotalRevenue(filters).then(revenue => {
        setDashboardData(prev => ({ ...prev, revenue: `₱${revenue.toLocaleString()}` }));
      });
      
      fetchTodaysSales(filters).then(sales => {
        setDashboardData(prev => ({ ...prev, todaysSales: `₱${sales.toLocaleString()}` }));
      });
      
      fetchTopProducts(filters).then(products => {
        setTopProducts(products);
      });
      
      fetchSalesData(timeFrame, filters).then(sales => {
        setSalesData(sales);
      });
    });
    
    // Listen for new products
    const productsUnsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      fetchProducts(filters).then(count => {
        setDashboardData(prev => ({ ...prev, totalProducts: count.toString() }));
      });
    });
    
    // Listen for new reviews
    const reviewsUnsubscribe = onSnapshot(collection(db, "reviews"), (snapshot) => {
      fetchReviews(filters).then(reviews => {
        setDashboardData(prev => ({ 
          ...prev, 
          totalReviews: reviews.total.toString(),
          averageRating: reviews.average.toString()
        }));
        setReviewData(reviews.breakdown);
      });
    });
    
    // Cleanup listeners on component unmount
    return () => {
      ordersUnsubscribe();
      productsUnsubscribe();
      reviewsUnsubscribe();
    };
  }, [timeFrame, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex-1 flex flex-col">
        <Header onBellClick={togglePanel} onFilterClick={toggleFilterPanel} />

        <main className="p-8 max-w-7xl mx-auto w-full relative">
          {/* Dashboard Loader */}
          {isLoading && <DashboardLoader />}
          
          {/* Welcome Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-[#A68B69] to-gray-900 bg-clip-text text-transparent">
              Business Overview
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
             Welcome back! Here's your mirror business performance at a glance. Everything looks great today.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200/50 w-fit mx-auto">
              <Calendar className="w-5 h-5 text-[#A68B69]" />
              <span className="text-sm font-semibold text-gray-700">
                {new Date().toLocaleDateString('en-PH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <DashboardCard
              title="Total Products"
              value={dashboardData.totalProducts}
              trend="up"
              trendValue=""
              description="vs last month"
              icon={Package}
              color="tan"
            />
            <DashboardCard
              title="Orders Today"
              value={dashboardData.ordersToday}
              trend="up"
              trendValue=""
              description="vs yesterday"
              icon={ShoppingCart}
              color="gray"
            />
            <DashboardCard
              title="Total Revenue"
              value={dashboardData.revenue}
              trend="up"
              trendValue=""
              description="this month"
              icon={PesoSign}
              color="blue"
            />
          </div>

          {/* Main Content Area - Fixed Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Sales Performance (spans 2 columns) */}
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 relative">
              {isLoading && <DashboardLoader />}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Sales Performance
                  </h2>
                  <p className="text-gray-600">
                    {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} revenue trends
                  </p>
                </div>
                <DateFilter 
                  timeFrame={timeFrame}
                  onTimeFrameChange={handleTimeFrameChange}
                  customRange={customDateRange}
                  onCustomRangeChange={setCustomDateRange}
                  onApplyCustomRange={() => {}}
                />
              </div>

              <SalesLineChart data={salesData} timeFrame={timeFrame} />
            </div>

            {/* Right Column - Today's Sales and Satisfaction */}
            <div className="space-y-8">
              {/* Today's Sales - Top card */}
              <div className="bg-gradient-to-br from-[#A68B69] via-[#8a6e51] to-[#6d5940] text-white p-8 rounded-3xl shadow-2xl shadow-[#A68B69]/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#E0DAD6] text-sm font-medium mb-2 uppercase tracking-wider">
                        Today's Sales
                      </p>
                      <p className="text-3xl font-black mb-4">{dashboardData.todaysSales}</p>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <PesoSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Satisfaction - Bottom card */}
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-8 rounded-3xl shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium mb-2 uppercase tracking-wider">
                        Satisfaction
                      </p>
                      <p className="text-3xl font-black mb-4">
                        {dashboardData.averageRating}/5
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current text-yellow-300" />
                        ))}
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

          {/* Bottom Section - Customer Reviews and Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Reviews - Left card */}
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 relative">
              {isLoading && <DashboardLoader />}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Customer Reviews
                  </h3>
                  <p className="text-gray-600">
                    Rating breakdown and feedback analysis
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-black text-gray-900">
                    {dashboardData.averageRating}/5
                  </span>
                  <span className="text-sm text-gray-500">
                    ({dashboardData.totalReviews} reviews)
                  </span>
                </div>
              </div>

              <ReviewPieChart reviewData={reviewData} />
            </div>

            {/* Top Products - Right card */}
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 relative">
              {isLoading && <DashboardLoader />}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">
                    Top Products
                  </h3>
                  <p className="text-gray-600">
                    Your best-selling products this month
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#A68B69]" />
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="group relative overflow-hidden bg-gradient-to-r from-gray-50/50 to-white/30 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-white shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        'bg-gradient-to-r from-orange-400 to-red-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-[#A68B69] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.sales} units sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900">{product.revenue}</p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-xs font-medium text-green-600">+{12 - index * 2}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-[#A68B69]/0 to-[#A68B69]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Notifications Panel */}
      <div
        className={`fixed top-0 right-0 w-96 h-full transform transition-all duration-500 ease-out z-50 ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <NotificationsList onClose={togglePanel} notifications={notifications} />
      </div>

      {/* Global Filter Panel */}
      <GlobalFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={toggleFilterPanel}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
      />

      {/* Enhanced Overlay */}
      {(isPanelOpen || isFilterPanelOpen) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => {
            if (isPanelOpen) togglePanel();
            if (isFilterPanelOpen) toggleFilterPanel();
          }}
        ></div>
      )}
    </div>
  );
}