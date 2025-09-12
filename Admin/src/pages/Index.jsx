import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  LineChart,
  User,
  Activity,
  DollarSign,
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
  Icon,
} from "lucide-react";

// Mock components (would be imported in real app)
const Header = ({ onBellClick }) => (
  <header className="bg-white border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Removed the orange box div here */}
      </div>
      <button
        onClick={onBellClick}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </div>
  </header>
);

const NotificationsList = ({ onClose }) => (
  <div className="h-full flex flex-col">
    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
    <div className="flex-1 p-6 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm font-medium text-blue-900">
              New Order Received
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Order #ORD-006 from Sarah Johnson
            </p>
            <p className="text-xs text-blue-600 mt-1">2 minutes ago</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm font-medium text-green-900">
              Payment Received
            </p>
            <p className="text-xs text-green-700 mt-1">
              ₱3,200 from Carlos Lopez
            </p>
            <p className="text-xs text-green-600 mt-1">1 hour ago</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Low Stock Alert
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Classic Wall Mirror - Only 3 left
            </p>
            <p className="text-xs text-yellow-600 mt-1">3 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Dashboard Card Component
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
    tan: { bg: "bg-[#A68B69]", light: "bg-[#E0DAD6]", text: "text-[#A68B69]" },
    white: { bg: "bg-[#F9F9F9]", light: "bg-[#F9F9F9]", text: "text-[#E6E6E6]" },
    gray: { bg: "bg-[#CAC8C5]", light: "bg-[#E6E6E6]", text: "text-[#F9F9F9]" },
    darkTan: { bg: "bg-[#A68B69]", light: "bg-[#E0DAD6]", text: "text-[#E6E6E6]" },
  };

  const currentColor = colorClasses[color];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center gap-2">
            {trend === "up" ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendValue}
            </span>
            <span className="text-sm text-gray-500">{description}</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${currentColor.light} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${currentColor.text}`} />
        </div>
      </div>
    </div>
  );
};

// Sales data for chart
const salesData = [
  { name: "Jan", sales: 4000, orders: 45 },
  { name: "Feb", sales: 3000, orders: 35 },
  { name: "Mar", sales: 5000, orders: 55 },
  { name: "Apr", sales: 4500, orders: 48 },
  { name: "May", sales: 6000, orders: 62 },
  { name: "Jun", sales: 5500, orders: 58 },
];

// Recent orders data
const recentOrders = [
  {
    id: "ORD-006",
    customer: "Sarah Johnson",
    product: "Round Decorative Mirror",
    amount: "₱2,100",
    status: "pending",
  },
  {
    id: "ORD-005",
    customer: "Lisa Chen",
    product: "Round Decorative Mirror",
    amount: "₱2,950",
    status: "confirmed",
  },
  {
    id: "ORD-004",
    customer: "Carlos Lopez",
    product: "Oval Bathroom Mirror Set",
    amount: "₱3,200",
    status: "delivered",
  },
];

// Top products data
const topProducts = [
  { name: "Classic Wall Mirror - Large", sales: 45, revenue: "₱112,500" },
  { name: "Decorative Vintage Mirror", sales: 32, revenue: "₱204,800" },
  { name: "Modern Frameless Mirror", sales: 28, revenue: "₱50,400" },
];

// Loader component
const Loader = () => (
  <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-[#E6E6E6]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A68B69]"></div>
    <p className="mt-4 text-gray-700 text-lg font-medium">
      Loading dashboard...
    </p>
  </div>
);

export default function Index() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData] = useState({
    totalProducts: "248",
    ordersToday: "23",
    revenue: "₱45,680",
    activeCustomers: "156",
    todaysSales: "₱5,800",
    monthlyGrowth: "+15.2%",
  });

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    fetchData();
  }, []);

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen ] flex">
    

      <div className="flex-1 flex flex-col">
        <Header onBellClick={togglePanel} />

        <main className="p-6 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome back! Here's what's happening with your mirror business
                  today.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 lg:mt-0">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Today, {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Products"
              value={dashboardData.totalProducts}
              description="from last month"
              trendValue="+12%"
              trend="up"
              icon={Package}
              color="tan"
            />
            <DashboardCard
              title="Orders Today"
              value={dashboardData.ordersToday}
              description="from last month"
              trendValue="+8%"
              trend="up"
              icon={ShoppingCart}
              color="gray"
            />
            <DashboardCard
              title="Total Revenue"
              value={dashboardData.revenue}
              description="from last month"
              trendValue="+23%"
              trend="up"
              icon={DollarSign}
              color="tan"
            />
            <DashboardCard
              title="Active Customers"
              value={dashboardData.activeCustomers}
              description="from last month"
              trendValue="+5%"
              trend="up"
              icon={User}
              color="gray"
            />
          </div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sales Analytics Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Sales Analytics
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Monthly sales performance overview
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#A68B69]" />
                  <span className="text-sm text-gray-500">Last 6 months</span>
                </div>
              </div>

              {/* Chart Placeholder with Mock Data */}
              <div className="h-64 bg-[#F9F9F9] rounded-lg p-4 flex items-end justify-around">
                {salesData.map((item) => (
                  <div key={item.name} className="flex flex-col items-center">
                    <div
                      className="bg-[#A68B69] rounded-t-md w-8 transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                      style={{ height: `${(item.sales / 6000) * 180}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-[#A68B69] text-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#E0DAD6] text-sm font-medium">
                      Today's Sales
                    </p>
                    <p className="text-2xl font-bold">{dashboardData.todaysSales}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +12% vs yesterday
                      </span>
                    </div>
                  </div>
                  <DollarSign className="w-10 h-10 text-[#E0DAD6]" />
                </div>
              </div>

              <div className="bg-[#CAC8C5] text-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">
                      Monthly Growth
                    </p>
                    <p className="text-2xl font-bold">
                      {dashboardData.monthlyGrowth}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">Above target</span>
                    </div>
                  </div>
                  <Activity className="w-10 h-10 text-[#F9F9F9]" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Recent Orders and Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Recent Orders
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Latest customer orders
                  </p>
                </div>
                <Link to="/admin/orders" className="text-[#A68B69] hover:text-[#7A6451] text-sm font-medium flex items-center gap-1">
                View all <ArrowUpRight className="w-4 h-4" />
            </Link>
              </div>

              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#A68B69] rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customer}
                        </p>
                        <p className="text-sm text-gray-600">{order.product}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {order.amount}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === "delivered"
                            ? "bg-[#E0DAD6] text-[#A68B69]"
                            : order.status === "confirmed"
                            ? "bg-[#E0DAD6] text-[#A68B69]"
                            : "bg-[#E0DAD6] text-[#A68B69]"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Top Products
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Best selling items this month
                  </p>
                </div>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-[#A68B69] text-white rounded-lg font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.revenue}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#A68B69] fill-current" />
                        <span className="text-xs text-gray-500">Top seller</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications Panel */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 shadow-xl ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <NotificationsList onClose={togglePanel} />
      </div>

      {/* Overlay */}
      {isPanelOpen && (
        <div
          className="fixed inset-0  bg-opacity-25 z-40"
          onClick={togglePanel}
        ></div>
      )}
    </div>
  );
}