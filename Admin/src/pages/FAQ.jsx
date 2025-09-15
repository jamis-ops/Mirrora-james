// src/pages/FAQ.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash, Pencil, ChevronDown, ChevronUp, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { db } from "../../Backend/firebaseConfig.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [currentFAQ, setCurrentFAQ] = useState(null);
  const [newFAQ, setNewFAQ] = useState({ 
    question: "", 
    answer: "", 
    order: 0, 
    isVisible: true 
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch FAQs from Firestore
  useEffect(() => {
    const q = query(collection(db, 'faqs'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const faqList = [];
      snapshot.forEach((doc) => {
        faqList.push({ id: doc.id, ...doc.data() });
      });
      setFaqs(faqList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching FAQs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    
    setProcessing(true);
    try {
      await deleteDoc(doc(db, 'faqs', faqToDelete.id));
      setIsDeleteModalOpen(false);
      setFaqToDelete(null);
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Failed to delete FAQ");
    } finally {
      setProcessing(false);
    }
  };

  const toggleVisibility = async (id, currentVisibility) => {
    if (processing) return;
    
    setProcessing(true);
    try {
      const faqRef = doc(db, 'faqs', id);
      await updateDoc(faqRef, { isVisible: !currentVisibility });
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to update FAQ visibility");
    } finally {
      setProcessing(false);
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
        order: parseInt(currentFAQ.order),
        isVisible: currentFAQ.isVisible
      });
      setIsEditModalOpen(false);
      setCurrentFAQ(null);
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
        order: parseInt(newFAQ.order),
        isVisible: newFAQ.isVisible,
        createdAt: new Date()
      });
      setIsAddModalOpen(false);
      setNewFAQ({ question: "", answer: "", order: 0, isVisible: true });
    } catch (error) {
      console.error("Error creating FAQ:", error);
      alert("Failed to create FAQ");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 p-6 bg-gray-50 items-center justify-center">
        <div className="text-lg text-gray-600">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-6 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brown-500">Manage FAQ</h1>
          <p className="text-gray-600 mt-1">
            {faqs.length} FAQs • {faqs.filter(f => f.isVisible).length} visible
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={processing}
          className="bg-[#A68B69] text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors hover:bg-[#8C7355] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
          Add FAQ
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
        {faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No FAQs found. Add your first FAQ to get started.
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className={`bg-gray-50 p-4 rounded-lg border transition-all hover:shadow-sm ${
              faq.isVisible ? 'border-gray-200' : 'border-red-200 bg-red-50'
            }`}>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-gray-800">{faq.question}</h3>
                  {!faq.isVisible && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Hidden
                    </span>
                  )}
                  <span className="text-xs text-gray-500">Order: {faq.order}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(faq.id, faq.isVisible);
                    }}
                    disabled={processing}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      faq.isVisible 
                        ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                    title={faq.isVisible ? 'Hide FAQ' : 'Show FAQ'}
                  >
                    {processing ? <Loader2 size={16} className="animate-spin" /> : (faq.isVisible ? <EyeOff size={16} /> : <Eye size={16} />)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(faq);
                    }}
                    disabled={processing}
                    className="p-2 rounded-lg bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="p-2 rounded-lg bg-gray-200 text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete FAQ"
                  >
                    <Trash size={16} />
                  </button>
                  {openFAQ === faq.id ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </div>
              {openFAQ === faq.id && (
                <div className="mt-4 transition-all duration-300 ease-in-out">
                  <p className="text-sm text-gray-600 mb-2">Answer:</p>
                  <p className="text-sm text-gray-800 bg-white p-3 rounded border">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && faqToDelete && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
              <button 
                onClick={() => !processing && setIsDeleteModalOpen(false)} 
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">Are you sure you want to delete this FAQ?</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800">{faqToDelete.question}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{faqToDelete.answer}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => !processing && setIsDeleteModalOpen(false)} 
                disabled={processing}
                className="py-2 px-4 rounded-lg text-sm font-semibold border border-gray-300 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={processing}
                className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {processing && <Loader2 size={16} className="animate-spin" />}
                Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {isEditModalOpen && currentFAQ && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit FAQ</h2>
              <button 
                onClick={() => !processing && setIsEditModalOpen(false)} 
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Question</label>
                <textarea
                  name="question"
                  value={currentFAQ.question}
                  onChange={handleEditChange}
                  disabled={processing}
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50"
                  rows="3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Answer</label>
                <textarea
                  name="answer"
                  value={currentFAQ.answer}
                  onChange={handleEditChange}
                  disabled={processing}
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50"
                  rows="6"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={currentFAQ.order}
                    onChange={handleEditChange}
                    disabled={processing}
                    className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={currentFAQ.isVisible}
                    onChange={handleEditChange}
                    disabled={processing}
                    className="mr-2 disabled:opacity-50"
                    id="edit-visible"
                  />
                  <label htmlFor="edit-visible" className="text-sm text-gray-700">
                    Visible in app
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => !processing && setIsEditModalOpen(false)} 
                disabled={processing}
                className="py-2 px-4 rounded-lg text-sm font-semibold border border-gray-300 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate} 
                disabled={processing}
                className="bg-[#A68B69] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-[#8C7355] disabled:opacity-50 flex items-center gap-2"
              >
                {processing && <Loader2 size={16} className="animate-spin" />}
                Update FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New FAQ Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New FAQ</h2>
              <button 
                onClick={() => !processing && setIsAddModalOpen(false)} 
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Question</label>
                <textarea
                  name="question"
                  value={newFAQ.question}
                  onChange={handleNewChange}
                  placeholder="Enter the question"
                  disabled={processing}
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50"
                  rows="3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Answer</label>
                <textarea
                  name="answer"
                  value={newFAQ.answer}
                  onChange={handleNewChange}
                  placeholder="Enter the answer"
                  disabled={processing}
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y disabled:opacity-50"
                  rows="6"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={newFAQ.order}
                    onChange={handleNewChange}
                    disabled={processing}
                    className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={newFAQ.isVisible}
                    onChange={handleNewChange}
                    disabled={processing}
                    className="mr-2 disabled:opacity-50"
                    id="new-visible"
                  />
                  <label htmlFor="new-visible" className="text-sm text-gray-700">
                    Visible in app
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => !processing && setIsAddModalOpen(false)} 
                disabled={processing}
                className="py-2 px-4 rounded-lg text-sm font-semibold border border-gray-300 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                disabled={processing}
                className="bg-[#A68B69] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-[#8C7355] disabled:opacity-50 flex items-center gap-2"
              >
                {processing && <Loader2 size={16} className="animate-spin" />}
                Create FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}