import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { db } from "../../Backend/firebaseConfig.js";
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          reviewList.push({
            id: doc.id,
            userName: data.userName || 'Anonymous',
            rating: data.rating || 0,
            comment: data.comment || '',
            date: data.date?.toDate() || new Date(),
            isVisible: data.isVisible !== false, // Default to true if not set
            avatar: data.avatar || 'US',
            orderId: data.orderId || null,
            productInfo: data.productInfo || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            status: data.status || 'approved'
          });
        });
        setReviews(reviewList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      const reviewRef = doc(db, 'reviews', id);
      await updateDoc(reviewRef, {
        isVisible: !currentVisibility,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error toggling review visibility:", error);
      alert("Failed to update review visibility");
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (error) {
        console.error("Error deleting review:", error);
        alert("Failed to delete review");
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'fill-current' : ''}
        style={{ 
          color: index < rating ? '#A68B69' : '#E6E6E6' 
        }}
      />
    ));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const visibleCount = reviews.filter(review => review.isVisible).length;
  const totalCount = reviews.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-[#A68B69] mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h1>
          <p className="text-gray-600">
            Manage customer feedback and control what appears on your app
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {visibleCount} visible
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {totalCount} total
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 ${
                review.isVisible 
                  ? 'border-green-200 shadow-green-50' 
                  : 'border-red-200 shadow-red-50 opacity-75'
              }`}
            >
              {/* Status Indicator */}
              <div className={`h-1 w-full rounded-t-lg ${
                review.isVisible ? 'bg-green-400' : 'bg-red-400'
              }`} />
              
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {review.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.userName}</h3>
                      <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                      {review.orderId && (
                        <p className="text-xs text-gray-400 mt-1">
                          Order: #{review.orderId.substring(0, 8)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    review.isVisible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {review.isVisible ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {review.isVisible ? 'Live' : 'Hidden'}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {review.rating}/5
                  </span>
                </div>

                {/* Comment */}
                <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                  {review.comment}
                </p>

                {/* Product Info (if available) */}
                {review.productInfo && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-600 mb-1">Product Reviewed:</p>
                    <p className="text-sm text-gray-800">{review.productInfo.name}</p>
                    {review.productInfo.size && (
                      <p className="text-xs text-gray-600">Size: {review.productInfo.size}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleVisibility(review.id, review.isVisible)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      review.isVisible
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {review.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    {review.isVisible ? 'Hide' : 'Show'}
                  </button>
                  
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Customer reviews will appear here when submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;