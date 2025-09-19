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
  MoreHorizontal
} from "lucide-react";

// Mock data fetching functions
const fetchOrders = async () => {
  // In a real app, this would be an API call
  return 23; // Mock orders count
};

const fetchTotalRevenue = async () => {
  // In a real app, this would be an API call
  return 156890; // Mock revenue in pesos
};

const fetchProducts = async () => {
  // In a real app, this would be an API call
  return 127; // Mock products count
};

const fetchReviews = async () => {
  // In a real app, this would be an API call
  return {
    total: 89,
    average: 4.6,
    breakdown: [
      { rating: 5, count: 61, color: "#10B981" },
      { rating: 4, count: 19, color: "#3B82F6" },
      { rating: 3, count: 6, color: "#F59E0B" },
      { rating: 2, count: 2, color: "#EF4444" },
      { rating: 1, count: 1, color: "#DC2626" }
    ]
  };
};

const Header = ({ onBellClick }) => (
  <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-8 py-6 sticky top-0 z-30">
    <div className="flex items-center justify-between max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onBellClick}
          className="relative p-3 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100/50 rounded-xl"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">3</span>
          </span>
        </button>
      </div>
    </div>
  </header>
);

const NotificationsList = ({ onClose, notifications }) => (
  <div className="h-full flex flex-col bg-white/95 backdrop-blur-lg">
    <div className="p-6 border-b border-gray-200/50 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">Stay updated with your business</p>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
    <div className="flex-1 p-6 space-y-4 overflow-auto">
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  {notification.title}
                </p>
                <p className="text-xs text-blue-700/80 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-blue-600/70 mt-2">
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">We'll notify you when something happens</p>
        </div>
      )}
    </div>
  </div>
);

const DashboardCard = ({
  title,
  value,
  description,
  trend = "up",
  trendValue,
  color = "blue",
  icon: Icon,
}) => {
  const colorClasses = {
    tan: { 
      gradient: "from-[#A68B69]/10 to-[#8a6e51]/5", 
      iconBg: "bg-gradient-to-r from-[#A68B69] to-[#8a6e51]", 
      accent: "text-[#A68B69]",
      border: "border-[#A68B69]/20"
    },
    gray: { 
      gradient: "from-gray-500/10 to-gray-600/5", 
      iconBg: "bg-gradient-to-r from-gray-500 to-gray-600", 
      accent: "text-gray-600",
      border: "border-gray-500/20"
    },
    blue: { 
      gradient: "from-blue-500/10 to-indigo-500/5", 
      iconBg: "bg-gradient-to-r from-blue-500 to-indigo-500", 
      accent: "text-blue-600",
      border: "border-blue-500/20"
    },
  };

  const currentColor = colorClasses[color] || colorClasses.tan;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${currentColor.gradient} backdrop-blur-sm rounded-3xl p-8 border ${currentColor.border} hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-black text-gray-900 mb-4 group-hover:scale-105 transition-transform duration-300">{value}</p>
            <div className="flex items-center gap-2">
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  trend === "up" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {trendValue}
              </span>
              <span className="text-sm text-gray-500">{description}</span>
            </div>
          </div>
          <div className={`w-16 h-16 ${currentColor.iconBg} rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewPieChart = ({ reviewData }) => {
  const total = reviewData.reduce((sum, item) => sum + item.count, 0);
  let cumulativePercentage = 0;
  
  const segments = reviewData.map((item) => {
    const percentage = (item.count / total) * 100;
    const startAngle = cumulativePercentage * 3.6;
    const endAngle = (cumulativePercentage + percentage) * 3.6;
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle
    };
  });

  const createPath = (startAngle, endAngle, outerRadius = 90, innerRadius = 30) => {
    const start = polarToCartesian(100, 100, outerRadius, endAngle);
    const end = polarToCartesian(100, 100, outerRadius, startAngle);
    const innerStart = polarToCartesian(100, 100, innerRadius, endAngle);
    const innerEnd = polarToCartesian(100, 100, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="h-80 bg-gradient-to-br from-white/50 to-gray-50/30 backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-[#A68B69]/10 to-transparent rounded-full -ml-12 -mt-12"></div>
      
      <div className="flex items-center justify-center h-full relative z-10">
        <div className="relative">
          <svg width="200" height="200" className="drop-shadow-lg">
            {segments.map((segment, index) => (
              <path
                key={segment.rating}
                d={createPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                stroke="white"
                strokeWidth="2"
              />
            ))}
            <circle cx="100" cy="100" r="25" fill="white" className="drop-shadow-md" />
            <text x="100" y="95" textAnchor="middle" className="text-sm font-bold fill-gray-800">4.6</text>
            <text x="100" y="110" textAnchor="middle" className="text-xs fill-gray-600">Rating</text>
          </svg>
          
          <div className="absolute -right-40 top-1/2 transform -translate-y-1/2 space-y-2">
            {segments.map((segment) => (
              <div key={segment.rating} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: segment.color }}
                ></div>
                <span className="text-gray-700 font-medium">
                  {segment.rating}★ ({segment.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Loader = () => (
  <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-[#A68B69]/20 rounded-full"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#A68B69] rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-gray-600 text-lg font-medium">
      Loading your dashboard...
    </p>
  </div>
);

const SalesLineChart = ({ data, timeFrame }) => {
  const maxSales = Math.max(...data.map(item => item.sales));
  const minSales = Math.min(...data.map(item => item.sales));
  const range = maxSales - minSales || 1;
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.sales - minSales) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="h-80 bg-gradient-to-br from-white/50 to-gray-50/30 backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#A68B69]/10 to-transparent rounded-full -mr-12 -mt-12"></div>
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
        {[0, 25, 50, 75, 100].map((yPos) => (
          <line
            key={yPos}
            x1="0"
            y1={yPos}
            x2="100"
            y2={yPos}
            stroke="#E5E7EB"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}
        
        <polygon
          points={areaPoints}
          fill="url(#gradient)"
          opacity="0.3"
        />
        
        <polyline
          fill="none"
          stroke="#A68B69"
          strokeWidth="3"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.sales - minSales) / range) * 100;
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke="#A68B69"
                strokeWidth="3"
                className="cursor-pointer hover:r-6 transition-all duration-300"
              />
              <circle
                cx={x}
                cy={y}
                r="2"
                fill="#A68B69"
              />
            </g>
          );
        })}
        
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A68B69" />
            <stop offset="100%" stopColor="#A68B69" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute bottom-2 left-6 right-6 flex justify-between">
        {data.slice(0, 6).map((item, index) => (
          <span key={index} className="text-xs font-medium text-gray-600">
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const DateFilter = ({ timeFrame, onTimeFrameChange, customRange, onCustomRangeChange, onApplyCustomRange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  return (
    <div className="flex items-center gap-2 relative">
      <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50 shadow-sm">
        {["daily", "monthly", "yearly", "custom"].map((frame) => (
          <button
            key={frame}
            onClick={() => frame === "custom" ? setShowCustomPicker(!showCustomPicker) : onTimeFrameChange(frame)}
            className={`px-4 py-2 text-sm rounded-xl transition-all duration-300 font-medium ${
              timeFrame === frame 
                ? "bg-gradient-to-r from-[#A68B69] to-[#8a6e51] text-white shadow-lg shadow-[#A68B69]/20" 
                : "text-gray-600 hover:bg-gray-100/50"
            }`}
          >
            {frame.charAt(0).toUpperCase() + frame.slice(1)}
          </button>
        ))}
      </div>
      
      {showCustomPicker && (
        <div className="absolute top-full right-0 mt-3 bg-white/95 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-gray-200/50 z-20 min-w-[300px]">
          <h4 className="font-semibold text-gray-900 mb-4">Custom Date Range</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">From:</label>
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => onCustomRangeChange({...customRange, start: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#A68B69]/20 focus:border-[#A68B69] transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">To:</label>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => onCustomRangeChange({...customRange, end: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#A68B69]/20 focus:border-[#A68B69] transition-all"
              />
            </div>
            <button
              onClick={() => {
                onTimeFrameChange("custom");
                onApplyCustomRange();
                setShowCustomPicker(false);
              }}
              className="w-full bg-gradient-to-r from-[#A68B69] to-[#8a6e51] text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg hover:shadow-[#A68B69]/20 transition-all duration-300"
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PesoSign = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0极 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 11H17M7 15H17M12 3V21M7 7H17C17 7 19 7 19 5C19 3 17 3 17 3H7C7 3 5 3 5 5C5 7 极7 7 7 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Index() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const generateSalesData = (timeFrame) => {
    switch(timeFrame) {
      case "daily":
        return [
          { name: 'Mon', sales: 4200 },
          { name: 'Tue', sales: 3800 },
          { name: 'Wed', sales: 5100 },
          { name: 'Thu', sales: 4600 },
          { name: 'Fri', sales: 6200 },
          { name: 'Sat', sales: 7800 },
          { name: 'Sun', sales: 5900 }
        ];
      case "monthly":
        return [
          { name: 'Jan', sales: 45000 },
          { name: 'Feb', sales: 52000 },
          { name: 'Mar', sales: 48000 },
          { name: 'Apr', sales: 61000 },
          { name: 'May', sales: 55000 },
          { name: 'Jun', sales: 67000 }
        ];
      case "yearly":
        return [
          { name: '2020', sales: 420000 },
          { name: '2021', sales: 580000 },
          { name: '2022', sales: 650000 },
          { name: '2023', sales: 极20000 },
          { name: '2024', sales: 890000 }
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch data from all sources
        const [orders, revenue, products, reviews] = await Promise.all([
          fetchOrders(),
          fetchTotalRevenue(),
          fetchProducts(),
          fetchReviews()
        ]);
        
        // Update dashboard data
        setDashboardData({
          totalProducts: products.toString(),
          ordersToday: orders.toString(),
          revenue: `₱${revenue.toLocaleString()}`,
          todaysSales: `₱${Math.round(revenue / 30).toLocaleString()}`,
          totalReviews: reviews.total.toString(),
          averageRating: reviews.average.toString(),
        });
        
        // Set other data
        setSalesData(generateSalesData(timeFrame));
        setReviewData(reviews.breakdown);
        setTopProducts([
          { name: "Premium Wall Mirror", sales: 89, revenue: "₱267,000" },
          { name: "Vintage Round Mirror", sales: 76, revenue: "₱152,000" },
          { name: "Modern Bathroom Mirror", sales: 64, revenue: "₱128,000" }
        ]);
        
        // Set notifications
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
  }, [timeFrame]);

  const togglePanel = () => setIsPanelOpen(!isPanelOpen);

  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
    setSalesData(generateSalesData(new极Frame));
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex-1 flex flex-col">
        <Header onBellClick={togglePanel} />

        <main className="p-8 max-w-7xl mx-auto w-full">
          {/* Welcome Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-[#A68B69] to-gray-900 bg-clip-text text-transparent">
              Business Overview
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
             Welcome back! Here's your mirror business performance at a glance. Everything looks great today.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-gray极200/50 w-fit mx-auto">
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
              trendValue="+12%"
              description="vs last month"
              icon={Package}
              color="tan"
            />
            <DashboardCard
              title="Orders Today"
              value={dashboardData.ordersToday}
              trend="up"
              trendValue="+18%"
              description="vs yesterday"
              icon={ShoppingCart}
              color="gray"
            />
            <DashboardCard
              title="Total Revenue"
              value={dashboardData.revenue}
              trend="up"
              trendValue="+24%"
              description="this month"
              icon={PesoSign}
              color="blue"
            />
          </div>

          {/* Main Content Area - Modified Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Sales Performance */}
            <div className="lg:col-span-3 bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5">
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
            <div className="space-y-6">
              {/* Today's Sales */}
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
                        <span className="text-sm font-semibold">+15% from yesterday</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <PesoSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Satisfaction */}
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

          {/* Customer Reviews Section - Now below the main content */}
          <div className="lg:col-span-2bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5 mb-12">
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

          {/* Top Products Section */}
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl shadow-black/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Top Performers
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
                <div key={product.name} className="group relative overflow-hidden bg-gradient-to-r from-gray-50/50 to-white/30 backdrop-blur-sm border border-gray-200/50 rounded-2xl p极6 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
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

      {/* Enhanced Overlay */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50  z-40 transition-all duration-300"
          onClick={togglePanel}
        ></div>
      )}
    </div>
  );
}