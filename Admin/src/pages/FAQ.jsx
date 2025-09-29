// src/pages/FAQ.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash, Pencil, ChevronDown, ChevronUp, X, Eye, EyeOff, Loader2, Search } from "lucide-react";
import { db } from "../../Backend/firebaseConfig.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [faqToToggle, setFaqToToggle] = useState(null);
  const [currentFAQ, setCurrentFAQ] = useState(null);
  const [newFAQ, setNewFAQ] = useState({ 
    question: "", 
    answer: "", 
    isVisible: true 
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [toast, setToast] = useState(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !processing) {
        if (isEditModalOpen) setIsEditModalOpen(false);
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isDeleteModalOpen) setIsDeleteModalOpen(false);
        if (isVisibilityModalOpen) setIsVisibilityModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditModalOpen, isAddModalOpen, isDeleteModalOpen, isVisibilityModalOpen, processing]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch FAQs from Firestore
  useEffect(() => {
    const q = query(collection(db, 'faqs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const faqList = [];
      snapshot.forEach((doc) => {
        faqList.push({ id: doc.id, ...doc.data() });
      });
      // Sort by creation date (newest first) as default
      const sortedFaqs = faqList.sort((a, b) => 
        (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
      );
      setFaqs(sortedFaqs);
      setFilteredFaqs(sortedFaqs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching FAQs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter FAQs based on search and visibility
  useEffect(() => {
    let result = faqs;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(faq => 
        faq.question.toLowerCase().includes(term) || 
        faq.answer.toLowerCase().includes(term)
      );
    }
    
    if (visibilityFilter === "visible") {
      result = result.filter(faq => faq.isVisible);
    } else if (visibilityFilter === "hidden") {
      result = result.filter(faq => !faq.isVisible);
    }
    
    setFilteredFaqs(result);
  }, [faqs, searchTerm, visibilityFilter]);

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleEditClick = (faq) => {
    setCurrentFAQ({ ...faq });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (faq) => {
    setFaqToDelete(faq);
    setIsDeleteModalOpen(true);
  };

  const handleVisibilityClick = (faq) => {
    setFaqToToggle(faq);
    setIsVisibilityModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    
    setProcessing(true);
    try {
      await deleteDoc(doc(db, 'faqs', faqToDelete.id));
      setIsDeleteModalOpen(false);
      setFaqToDelete(null);
      showToast('FAQ deleted successfully!');
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Failed to delete FAQ");
    } finally {
      setProcessing(false);
    }
  };

  const confirmToggleVisibility = async () => {
    if (!faqToToggle) return;
    
    setProcessing(true);
    setProcessingId(faqToToggle.id);
    
    try {
      const faqRef = doc(db, 'faqs', faqToToggle.id);
      await updateDoc(faqRef, { 
        isVisible: !faqToToggle.isVisible,
        updatedAt: serverTimestamp()
      });
      setIsVisibilityModalOpen(false);
      setFaqToToggle(null);
      showToast(`FAQ ${faqToToggle.isVisible ? 'hidden' : 'shown'} successfully!`);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      
      switch (error.code) {
        case 'permission-denied':
          alert("Permission denied. Please check if you're logged in and have the correct permissions.");
          break;
        case 'not-found':
          alert("FAQ not found. It may have been deleted by another user.");
          break;
        case 'unavailable':
          alert("Network error. Please check your internet connection.");
          break;
        default:
          alert("Failed to update FAQ visibility. Please try again.");
      }
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentFAQ({ 
      ...currentFAQ, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleNewChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewFAQ({ 
      ...newFAQ, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleUpdate = async () => {
    if (!currentFAQ.question || !currentFAQ.answer) {
      alert("Please fill in both question and answer");
      return;
    }

    if (processing) return;
    
    setProcessing(true);
    try {
      const faqRef = doc(db, 'faqs', currentFAQ.id);
      await updateDoc(faqRef, {
        question: currentFAQ.question,
        answer: currentFAQ.answer,
        isVisible: currentFAQ.isVisible,
        updatedAt: serverTimestamp()
      });
      setIsEditModalOpen(false);
      setCurrentFAQ(null);
      showToast('FAQ updated successfully!');
    } catch (error) {
      console.error("Error updating FAQ:", error);
      alert("Failed to update FAQ");
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!newFAQ.question || !newFAQ.answer) {
      alert("Please fill in both question and answer");
      return;
    }

    if (processing) return;
    
    setProcessing(true);
    try {
      await addDoc(collection(db, 'faqs'), {
        question: newFAQ.question,
        answer: newFAQ.answer,
        isVisible: newFAQ.isVisible,
        createdAt: serverTimestamp()
      });
      setIsAddModalOpen(false);
      setNewFAQ({ question: "", answer: "", isVisible: true });
      showToast('FAQ created successfully!');
    } catch (error) {
      console.error("Error creating FAQ:", error);
      alert("Failed to create FAQ");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative">
          <Loader2 size={48} className="text-[#A68B69] animate-spin" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#A68B69] to-[#8C7355] rounded-full opacity-20 blur-sm"></div>
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-600">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border-l-4 ${
          toast.type === 'success' 
            ? 'bg-green-50 border-green-500 text-green-700' 
            : 'bg-red-50 border-red-500 text-red-700'
        } animate-slide-in-right`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-current rounded-full"></div>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#A68B69] to-[#8C7355] bg-clip-text text-transparent">
            FAQ Management
          </h1>
          <p className="text-gray-600 mt-2 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {faqs.filter(f => f.isVisible).length} Visible
            </span>
            <span className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm shadow-sm">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              {faqs.filter(f => !f.isVisible).length} Hidden
            </span>
            <span className="text-sm font-medium text-gray-500">
              Total: {faqs.length} FAQs
            </span>
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={processing}
          className="group relative bg-gradient-to-r from-[#A68B69] to-[#8C7355] text-white py-3 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 min-w-[140px] justify-center"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
          {processing ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} 
          Add New FAQ
        </button>
      </header>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#A68B69] focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="all">All FAQs</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <p className="text-lg font-medium text-gray-600">No FAQs found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || visibilityFilter !== "all" 
                ? `No results for "${searchTerm}" in ${visibilityFilter} FAQs. Try adjusting your search.` 
                : "Add your first FAQ to get started"
              }
            </p>
            {(searchTerm || visibilityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setVisibilityFilter("all");
                }}
                className="mt-4 text-[#A68B69] hover:text-[#8C7355] font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isProcessingThisFAQ = processingId === faq.id;
            
            return (
              <div 
                key={faq.id} 
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md cursor-pointer overflow-hidden ${
                  faq.isVisible ? 'border-gray-200' : 'border-red-200'
                } ${openFAQ === faq.id ? 'ring-2 ring-[#A68B69] ring-opacity-20' : ''} ${
                  isProcessingThisFAQ ? 'opacity-70' : ''
                }`}
              >
                <div
                  className="p-6"
                  onClick={() => !isProcessingThisFAQ && toggleFAQ(faq.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{faq.question}</h3>
                        {!faq.isVisible && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full shrink-0">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {faq.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                        {faq.updatedAt && (
                          <span className="ml-3">
                            • Updated: {faq.updatedAt?.toDate?.().toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 mr-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVisibilityClick(faq);
                          }}
                          disabled={processing || isProcessingThisFAQ}
                          className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 ${
                            faq.isVisible 
                              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                          title={faq.isVisible ? 'Hide FAQ' : 'Show FAQ'}
                        >
                          {isProcessingThisFAQ ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            faq.isVisible ? <EyeOff size={16} /> : <Eye size={16} />
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(faq);
                          }}
                          disabled={processing}
                          className="p-2 rounded-lg bg-gray-50 text-gray-600 transition-all duration-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                          title="Edit FAQ"
                        >
                          <Pencil size={16} />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(faq);
                          }}
                          disabled={processing}
                          className="p-2 rounded-lg bg-gray-50 text-red-500 transition-all duration-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                          title="Delete FAQ"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      
                      <div className="w-px h-6 bg-gray-300"></div>
                      
                      {openFAQ === faq.id ? (
                        <ChevronUp size={20} className="text-[#A68B69] ml-2" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400 ml-2" />
                      )}
                    </div>
                  </div>
                </div>
                
                {openFAQ === faq.id && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#A68B69] rounded-full"></span>
                        Answer
                      </p>
                      <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && faqToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash className="text-red-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete FAQ</h2>
                  <p className="text-gray-600 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">Are you sure you want to delete this FAQ?</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800">{faqToDelete.question}</h3>
                <p className="text-red-600 text-sm mt-1 line-clamp-2">{faqToDelete.answer}</p>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => !processing && setIsDeleteModalOpen(false)} 
                disabled={processing}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={processing}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing && <Loader2 size={16} className="animate-spin" />}
                Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Toggle Confirmation Modal */}
      {isVisibilityModalOpen && faqToToggle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  faqToToggle.isVisible ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  {faqToToggle.isVisible ? (
                    <EyeOff className="text-yellow-600" size={20} />
                  ) : (
                    <Eye className="text-green-600" size={20} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {faqToToggle.isVisible ? 'Hide FAQ' : 'Show FAQ'}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {faqToToggle.isVisible 
                      ? 'This FAQ will be hidden from users' 
                      : 'This FAQ will be visible to users'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to {faqToToggle.isVisible ? 'hide' : 'show'} this FAQ?
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800">{faqToToggle.question}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{faqToToggle.answer}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    faqToToggle.isVisible 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Currently {faqToToggle.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    !faqToToggle.isVisible 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Will be {!faqToToggle.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => !processing && setIsVisibilityModalOpen(false)} 
                disabled={processing}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmToggleVisibility} 
                disabled={processing}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  faqToToggle.isVisible 
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {processing && <Loader2 size={16} className="animate-spin" />}
                {faqToToggle.isVisible ? 'Hide FAQ' : 'Show FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {isEditModalOpen && currentFAQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#A68B69] bg-opacity-10 rounded-full flex items-center justify-center">
                    <Pencil className="text-[#A68B69]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Edit FAQ</h2>
                    <p className="text-gray-600 text-sm">Update the FAQ details</p>
                  </div>
                </div>
                <button 
                  onClick={() => !processing && setIsEditModalOpen(false)} 
                  disabled={processing}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Question {currentFAQ.question && `(${currentFAQ.question.length}/500)`}
                  </label>
                  <textarea
                    name="question"
                    value={currentFAQ.question}
                    onChange={handleEditChange}
                    disabled={processing}
                    className="w-full p-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50 transition-all"
                    rows="3"
                    placeholder="Enter the question..."
                    maxLength={500}
                  />
                  {currentFAQ.question.length >= 450 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      {500 - currentFAQ.question.length} characters remaining
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Answer {currentFAQ.answer && `(${currentFAQ.answer.length}/2000)`}
                  </label>
                  <textarea
                    name="answer"
                    value={currentFAQ.answer}
                    onChange={handleEditChange}
                    disabled={processing}
                    className="w-full p-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50 transition-all"
                    rows="6"
                    placeholder="Enter the answer..."
                    maxLength={2000}
                  />
                  {currentFAQ.answer.length >= 1800 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      {2000 - currentFAQ.answer.length} characters remaining
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label htmlFor="edit-visible" className="text-base font-medium text-gray-700 cursor-pointer">
                      Visible in app
                    </label>
                    <p className="text-sm text-gray-500">Show this FAQ to users</p>
                  </div>
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={currentFAQ.isVisible}
                    onChange={handleEditChange}
                    disabled={processing}
                    className="w-5 h-5 accent-[#A68B69] disabled:opacity-50 cursor-pointer"
                    id="edit-visible"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button 
                  onClick={() => !processing && setIsEditModalOpen(false)} 
                  disabled={processing}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate} 
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-[#A68B69] to-[#8C7355] text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing && <Loader2 size={16} className="animate-spin" />}
                  Update FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New FAQ Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Plus className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Create New FAQ</h2>
                    <p className="text-gray-600 text-sm">Add a new frequently asked question</p>
                  </div>
                </div>
                <button 
                  onClick={() => !processing && setIsAddModalOpen(false)} 
                  disabled={processing}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Question {newFAQ.question && `(${newFAQ.question.length}/500)`}
                  </label>
                  <textarea
                    name="question"
                    value={newFAQ.question}
                    onChange={handleNewChange}
                    placeholder="What would you like to ask?"
                    disabled={processing}
                    className="w-full p-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50 transition-all"
                    rows="3"
                    maxLength={500}
                  />
                  {newFAQ.question.length >= 450 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      {500 - newFAQ.question.length} characters remaining
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Answer {newFAQ.answer && `(${newFAQ.answer.length}/2000)`}
                  </label>
                  <textarea
                    name="answer"
                    value={newFAQ.answer}
                    onChange={handleNewChange}
                    placeholder="Provide a clear and helpful answer..."
                    disabled={processing}
                    className="w-full p-4 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50 transition-all"
                    rows="6"
                    maxLength={2000}
                  />
                  {newFAQ.answer.length >= 1800 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      {2000 - newFAQ.answer.length} characters remaining
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label htmlFor="new-visible" className="text-base font-medium text-gray-700 cursor-pointer">
                      Visible in app
                    </label>
                    <p className="text-sm text-gray-500">Show this FAQ to users</p>
                  </div>
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={newFAQ.isVisible}
                    onChange={handleNewChange}
                    disabled={processing}
                    className="w-5 h-5 accent-[#A68B69] disabled:opacity-50 cursor-pointer"
                    id="new-visible"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button 
                  onClick={() => !processing && setIsAddModalOpen(false)} 
                  disabled={processing}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate} 
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-[#A68B69] to-[#8C7355] text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing && <Loader2 size={16} className="animate-spin" />}
                  Create FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}