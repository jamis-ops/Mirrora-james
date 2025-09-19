import React, { useState, useEffect } from "react";
import {
  Star,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  X,
  Calendar,
  Package,
  MessageSquare,
  TrendingUp,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { db } from "../../Backend/firebaseConfig.js";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const REVIEWS_PER_PAGE = 10;

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewList = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          reviewList.push({
            id: docSnap.id,
            userName: data.userName || "Anonymous",
            rating: data.rating || 0,
            comment: data.comment || "",
            date:
              data.date && typeof data.date.toDate === "function"
                ? data.date.toDate()
                : new Date(),
            isVisible: data.isVisible !== false,
            avatar: data.avatar || "US",
            orderId: data.orderId || null,
            productInfo: data.productInfo || null,
            createdAt:
              data.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate()
                : new Date(),
            status: data.status || "approved",
          });
        });
        setReviews(reviewList);
        setFilteredReviews(reviewList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let results = reviews;

    if (searchTerm) {
      results = results.filter(
        (review) =>
          review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (review.productInfo &&
            review.productInfo.name &&
            review.productInfo.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedRating > 0) {
      results = results.filter((review) => review.rating === selectedRating);
    }

    if (selectedProduct !== "all") {
      results = results.filter(
        (review) =>
          review.productInfo && review.productInfo.name === selectedProduct
      );
    }

    results = [...results].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "date":
        default:
          return b.date - a.date;
      }
    });

    setFilteredReviews(results);
    setCurrentPage(1);
  }, [searchTerm, selectedRating, selectedProduct, reviews, sortBy]);

  const productOptions = [
    "all",
    ...new Set(
      reviews
        .filter((review) => review.productInfo && review.productInfo.name)
        .map((review) => review.productInfo.name)
    ),
  ];

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      const reviewRef = doc(db, "reviews", id);
      await updateDoc(reviewRef, {
        isVisible: !currentVisibility,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error toggling review visibility:", error);
      alert("Failed to update review visibility");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={18}
        className={index < rating ? "fill-current" : ""}
        style={{
          color: index < rating ? "#F59E0B" : "#E5E7EB",
        }}
      />
    ));
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRating(0);
    setSelectedProduct("all");
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      if (review.rating in distribution) {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      }
    });
    return distribution;
  };

  const visibleCount = filteredReviews.filter((review) => review.isVisible).length;
  const hasActiveFilters = searchTerm || selectedRating > 0 || selectedProduct !== "all";
  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();

  // Pagination logic
  const totalReviews = filteredReviews.length;
  const pageCount = Math.ceil(totalReviews / REVIEWS_PER_PAGE);
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
  const endIndex = startIndex + REVIEWS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] p-6 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-[#A68B69] rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw size={28} className="animate-spin text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Reviews</h3>
          <p className="text-gray-600">Please wait while we fetch your customer feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E6E6E6] overflow-hidden">
            <div className="bg-gradient-to-r from-[#A68B69] to-[#8a7456] p-8 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-6 lg:mb-0">
                  <h1 className="text-4xl font-bold mb-2">Customer Reviews</h1>
                  <p className="text-[#E0DAD6] text-lg">
                    Manage customer feedback and showcase testimonials
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="fill-current text-yellow-400 mr-1" size={24} />
                      <span className="text-3xl font-bold">{averageRating}</span>
                    </div>
                    <p className="text-[#E0DAD6] text-sm">Average Rating</p>
                  </div>

                  <div className="w-px h-16 bg-[#CAC8C5]/40"></div>

                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{reviews.length}</div>
                    <p className="text-[#E0DAD6] text-sm">Total Reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="px-8 py-6 bg-white border-b border-[#E6E6E6]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{visibleCount}</div>
                    <div className="text-sm text-[#CAC8C5]">Visible</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle size={20} className="text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{reviews.length - visibleCount}</div>
                    <div className="text-sm text-[#CAC8C5]">Hidden</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E0DAD6] rounded-lg flex items-center justify-center">
                    <Award size={20} className="text-[#A68B69]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{ratingDistribution[5]}</div>
                    <div className="text-sm text-[#CAC8C5]">5-Star Reviews</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E0DAD6] rounded-lg flex items-center justify-center">
                    <TrendingUp size={20} className="text-[#A68B69]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {reviews.length > 0
                        ? Math.round(((ratingDistribution[5] + ratingDistribution[4]) / reviews.length) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-[#CAC8C5]">Positive</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="px-8 py-4 bg-[#E0DAD6] border-b border-[#CAC8C5]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#A68B69]">
                    <Filter size={16} />
                    <span className="font-medium">Active Filters:</span>
                    {searchTerm && (
                      <span className="bg-[#CAC8C5] px-2 py-1 rounded text-xs">Search: "{searchTerm}"</span>
                    )}
                    {selectedRating > 0 && (
                      <span className="bg-[#CAC8C5] px-2 py-1 rounded text-xs">{selectedRating} Stars</span>
                    )}
                    {selectedProduct !== "all" && (
                      <span className="bg-[#CAC8C5] px-2 py-1 rounded text-xs">{selectedProduct}</span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-[#A68B69] hover:text-[#8a7456] font-medium text-sm flex items-center gap-1"
                  >
                    <X size={14} />
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E6E6E6] mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search size={20} className="text-[#A68B69]" />
              <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#CAC8C5]" size={18} />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all"
                />
              </div>

              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
                className="px-4 py-3 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                <option value={3}>⭐⭐⭐ 3 Stars</option>
                <option value={2}>⭐⭐ 2 Stars</option>
                <option value={1}>⭐ 1 Star</option>
              </select>

              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-4 py-3 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all"
              >
                <option value="all">All Products</option>
                {productOptions
                  .filter((opt) => opt !== "all")
                  .map((product, index) => (
                    <option key={index} value={product}>
                      {product}
                    </option>
                  ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-[#E6E6E6] rounded-xl focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E6E6E6] p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-[#A68B69]" />
            <h3 className="text-lg font-semibold text-gray-900">Rating Distribution</h3>
          </div>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center">
                  <div className="w-16 flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-2">{rating}</span>
                    <Star size={16} className="fill-current text-yellow-400" />
                  </div>
                  <div className="flex-1 ml-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#A68B69] h-2.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-medium text-gray-600">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedReviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  review.isVisible ? "border-green-100" : "border-red-100"
                }`}
              >
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#A68B69] to-[#8a7456] rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {review.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{review.userName}</h3>
                        <div className="flex items-center gap-1 text-xs text-[#CAC8C5]">
                          <Calendar size={12} />
                          <span>{formatDate(review.date)}</span>
                          <span>•</span>
                          <Clock size={12} />
                          <span>{formatTime(review.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        review.isVisible
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {review.isVisible ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {review.isVisible ? "LIVE" : "HIDDEN"}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">{renderStars(review.rating)}</div>
                    <span className="text-lg font-bold text-gray-800">{review.rating}.0</span>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">"{review.comment}"</p>
                  </div>

                  {/* Product Info */}
                  {review.productInfo && (
                    <div className="mb-4 p-3 bg-[#F9F9F9] rounded-lg border border-[#E6E6E6]">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={14} className="text-[#A68B69]" />
                        <span className="text-sm font-medium text-[#A68B69]">Product Reviewed</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{review.productInfo.name}</p>
                      {review.productInfo.size && (
                        <p className="text-xs text-[#CAC8C5] mt-1">Size: {review.productInfo.size}</p>
                      )}
                    </div>
                  )}

                  {/* Order ID */}
                  {review.orderId && (
                    <div className="mb-4 text-xs text-[#CAC8C5]">
                      Order: #{review.orderId.substring(0, 8)}...
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E6E6E6]">
                    <button
                      onClick={() => toggleVisibility(review.id, review.isVisible)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        review.isVisible
                          ? "bg-[#A68B69] text-white hover:bg-[#8a7456]"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {review.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      {review.isVisible ? "Hide" : "Show"}
                    </button>
                    <div className="text-xs text-[#CAC8C5]">
                      ID: {review.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalReviews > REVIEWS_PER_PAGE && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-[#E6E6E6] text-[#A68B69] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9F9F9] transition-all font-medium"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pageCount) }).map((_, index) => {
                let pageNumber;
                if (pageCount <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= pageCount - 2) {
                  pageNumber = pageCount - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-lg transition-all font-medium ${
                      currentPage === pageNumber
                        ? "bg-[#A68B69] text-white"
                        : "bg-white border border-[#E6E6E6] text-[#A68B69] hover:bg-[#F9F9F9]"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-[#E6E6E6] text-[#A68B69] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9F9F9] transition-all font-medium"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Page Info */}
          {totalReviews > REVIEWS_PER_PAGE && (
            <div className="text-center mt-4">
              <span className="text-[#CAC8C5] font-medium">
                Showing {startIndex + 1}-{Math.min(endIndex, totalReviews)} of {totalReviews} reviews
              </span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#E0DAD6] rounded-full flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="text-[#CAC8C5]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {hasActiveFilters ? "No matching reviews found" : "No reviews yet"}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {hasActiveFilters
                  ? "Try adjusting your search criteria to find the reviews you're looking for."
                  : "Customer reviews will appear here once they start submitting feedback about your products."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-[#A68B69] text-white rounded-lg hover:bg-[#8a7456] transition-all duration-200 font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;