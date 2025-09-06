// src/pages/FAQ.jsx

import React, { useState } from "react";
import { Plus, Trash, Pencil, ChevronDown, ChevronUp, X } from "lucide-react";

// Mock data for FAQs
const initialFAQs = [
  {
    id: 1,
    question: "What materials are your mirrors made of?",
    answer:
      "Our mirrors are crafted from high-quality, durable materials, including premium glass and sturdy frames made from sustainable wood or metal alloys. We ensure each piece meets our standards for clarity and longevity.",
  },
  {
    id: 2,
    question: "Do you offer custom sizing?",
    answer:
      "Yes, we provide custom sizing for select mirror designs. Please contact our customer service team with your specific dimensions and desired style, and we will provide you with a quote.",
  },
  {
    id: 3,
    question: "What is your return policy?",
    answer:
      "We accept returns within 30 days of purchase for a full refund, provided the mirror is in its original condition and packaging. Please see our full return policy on our website for more details.",
  },
  {
    id: 4,
    question: "How do I clean my mirror?",
    answer:
      "For best results, use a soft, lint-free cloth and a non-abrasive glass cleaner. Avoid harsh chemicals and paper towels, which can leave streaks or scratch the surface.",
  },
  {
    id: 5,
    question: "Can I install the mirrors myself?",
    answer:
      "Many of our mirrors come with easy-to-follow installation instructions and hardware. For larger or more complex installations, we recommend consulting a professional to ensure safety and proper placement.",
  },
  {
    id: 6,
    question: "What is the warranty on your products?",
    answer:
      "We offer a one-year limited warranty on all our mirrors, covering any manufacturing defects. For more information, please refer to our warranty policy page.",
  },
  {
    id: 7,
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to many countries worldwide. Shipping costs and delivery times vary by destination. You can calculate the shipping cost at checkout after entering your address.",
  },
];

export default function FAQ() {
  const [faqs, setFaqs] = useState(initialFAQs);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState(null);
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" });

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleEditClick = (faq) => {
    setCurrentFAQ({ ...faq });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentFAQ({ ...currentFAQ, [name]: value });
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewFAQ({ ...newFAQ, [name]: value });
  };

  const handleUpdate = () => {
    setFaqs(faqs.map((f) => (f.id === currentFAQ.id ? currentFAQ : f)));
    setIsEditModalOpen(false);
    setCurrentFAQ(null);
  };

  const handleCreate = () => {
    const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;
    setFaqs([...faqs, { ...newFAQ, id: newId }]);
    setIsAddModalOpen(false);
    setNewFAQ({ question: "", answer: "" });
  };

  return (
    <div className="flex flex-col flex-1 p-6 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brown-500">Manage FAQ</h1>
          
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#A68B69] text-white py-2 px-4 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors hover:bg-[#8C7355]"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all hover:shadow-sm">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFAQ(faq.id)}
            >
              <h3 className="text-base font-semibold text-gray-800">{faq.question}</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(faq);
                  }}
                  className="p-2 rounded-lg bg-gray-200 text-gray-600 transition-colors hover:bg-gray-300"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(faq.id);
                  }}
                  className="p-2 rounded-lg bg-gray-200 text-red-500 transition-colors hover:bg-red-100"
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
              <p className="mt-4 text-sm text-gray-600 transition-all duration-300 ease-in-out">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      {/* Edit FAQ Modal */}
      {isEditModalOpen && currentFAQ && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit FAQ</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y"
                  rows="3"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Answer</label>
                <textarea
                  name="answer"
                  value={currentFAQ.answer}
                  onChange={handleEditChange}
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y"
                  rows="6"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsEditModalOpen(false)} className="py-2 px-4 rounded-lg text-sm font-semibold border border-gray-300 transition-colors hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleUpdate} className="bg-[#A68B69] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-[#8C7355]">
                Update FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New FAQ Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New FAQ</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y"
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
                  className="w-full p-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68B69] resize-y"
                  rows="6"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsAddModalOpen(false)} className="py-2 px-4 rounded-lg text-sm font-semibold border border-gray-300 transition-colors hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={handleCreate} className="bg-[#A68B69] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:bg-[#8C7355]">
                Create FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}