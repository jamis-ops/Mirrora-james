import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  Send, 
  MoreVertical, 
  Trash2, 
  Settings,
  Package,
  DollarSign,
  Calendar,
  Eye,
  MapPin,
  ShoppingCart,
  CheckCircle,
  X,
  FileText,
  Ruler,
  Palette,
  Wrench
} from 'lucide-react';
import { db, appId } from  "../../Backend/firebaseConfig.js";

import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch,
  getDoc
} from 'firebase/firestore';

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

// Custom hook for scroll management
const useScrollToBottom = (messages) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastMessageCountRef = useRef(0);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    }
  };

  useEffect(() => {
    if (isAtBottom && messages.length > lastMessageCountRef.current) {
      scrollToBottom('smooth');
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isAtBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return { messagesEndRef, messagesContainerRef, isAtBottom, setIsAtBottom, scrollToBottom };
};

// Customization Message Component
const CustomizationMessage = ({ msg, onViewDetails, onSendProposal }) => {
  if (!msg.customizationData) return null;

  const { 
    productInfo, 
    dimensions, 
    frameStyle, 
    frameColor, 
    mirrorType,
    mountingType,
    budget, 
    additionalFeatures,
    specialInstructions,
    deliveryDate,
    contactInfo
  } = msg.customizationData;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-4 shadow-lg max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-md">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-900">Customization Request</h3>
            <p className="text-amber-700 text-sm">New order inquiry received</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(msg.customizationData)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => onSendProposal(msg.customizationData)}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Send Proposal
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <CustomizationSection 
          icon={Package} 
          title="Product Information"
          content={
            <div className="grid grid-cols-2 gap-4">
              <CustomizationField label="Product Name" value={productInfo?.name} />
              <CustomizationField label="Base Price" value={`₱${productInfo?.price}`} isPrice />
            </div>
          }
        />

        <CustomizationSection 
          icon={Ruler} 
          title="Dimensions"
          content={
            <div className="grid grid-cols-3 gap-4">
              <CustomizationField label="Height" value={`${dimensions?.height} cm`} centered />
              <CustomizationField label="Width" value={`${dimensions?.width} cm`} centered />
              <CustomizationField label="Depth" value={`${dimensions?.depth || 'Standard'} cm`} centered />
            </div>
          }
        />

        <CustomizationSection 
          icon={Palette} 
          title="Design Specifications"
          content={
            <div className="grid grid-cols-2 gap-4">
              <CustomizationField label="Frame Style" value={frameStyle} />
              <CustomizationField label="Frame Color" value={frameColor} />
              <CustomizationField label="Mirror Type" value={mirrorType} />
              <CustomizationField label="Mounting" value={mountingType} />
            </div>
          }
        />

        {additionalFeatures?.length > 0 && (
          <CustomizationSection 
            icon={Wrench} 
            title="Additional Features"
            content={
              <div className="flex flex-wrap gap-2">
                {additionalFeatures.map((feature, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                    {feature}
                  </span>
                ))}
              </div>
            }
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <BudgetCard value={budget} />
          {deliveryDate && <DeliveryCard value={deliveryDate} />}
        </div>

        {specialInstructions && (
          <CustomizationSection 
            icon={FileText} 
            title="Special Instructions"
            content={<p className="text-gray-700 leading-relaxed">{specialInstructions}</p>}
          />
        )}

        {contactInfo && (
          <CustomizationSection 
            icon={MapPin} 
            title="Contact Information"
            content={
              <div className="grid grid-cols-2 gap-4 text-sm">
                {contactInfo.phone && <CustomizationField label="Phone" value={contactInfo.phone} />}
                {contactInfo.email && <CustomizationField label="Email" value={contactInfo.email} />}
                {contactInfo.address && (
                  <div className="col-span-2">
                    <CustomizationField label="Delivery Address" value={contactInfo.address} />
                  </div>
                )}
              </div>
            }
          />
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-amber-200">
        <p className="text-xs text-amber-600 text-center">
          Request ID: {msg.customizationData.requestId || msg.id} | 
          Submitted: {msg.timestamp ? msg.timestamp.toDate().toLocaleString() : 'Just now'}
        </p>
      </div>
    </div>
  );
};

// Helper components for customization message
const CustomizationSection = ({ icon: Icon, title, content }) => (
  <div className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-amber-600" />
      <h4 className="font-semibold text-gray-900">{title}</h4>
    </div>
    {content}
  </div>
);

const CustomizationField = ({ label, value, isPrice = false, centered = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <p className={`text-gray-900 bg-gray-50 px-3 py-2 rounded border ${centered ? 'text-center' : ''} ${isPrice ? 'text-green-600 font-bold bg-green-50' : ''}`}>
      {value || 'Not specified'}
    </p>
  </div>
);

const BudgetCard = ({ value }) => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
    <div className="flex items-center gap-2 mb-2">
      <DollarSign className="w-5 h-5 text-green-600" />
      <h4 className="font-semibold text-green-800">Customer Budget</h4>
    </div>
    <p className="text-2xl font-bold text-green-600">₱{value || 'Not specified'}</p>
  </div>
);

const DeliveryCard = ({ value }) => (
  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
    <div className="flex items-center gap-2 mb-2">
      <Calendar className="w-5 h-5 text-orange-600" />
      <h4 className="font-semibold text-orange-800">Preferred Delivery</h4>
    </div>
    <p className="text-lg font-semibold text-orange-600">{value}</p>
  </div>
);

// Proposal Message Component
const ProposalMessage = ({ msg }) => {
  if (!msg.proposalData) return null;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-4 shadow-lg max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-green-800 text-lg">Customization Proposal Sent</h3>
          <p className="text-green-600 text-sm">Order ID: {msg.proposalData.orderId}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 border border-green-200 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Total Price:</span>
            <p className="text-xl font-bold text-green-600">₱{msg.proposalData.price}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Timeline:</span>
            <p className="font-semibold text-gray-800">{msg.proposalData.timeline}</p>
          </div>
          {msg.proposalData.downPayment && (
            <div>
              <span className="font-medium text-gray-600">Down Payment:</span>
              <p className="font-semibold text-green-600">₱{msg.proposalData.downPayment}</p>
            </div>
          )}
          {msg.proposalData.paymentTerms && (
            <div>
              <span className="font-medium text-gray-600">Payment Terms:</span>
              <p className="text-gray-800">{msg.proposalData.paymentTerms}</p>
            </div>
          )}
        </div>
        
        {msg.proposalData.notes && (
          <div className="mt-3 pt-3 border-t border-green-100">
            <span className="font-medium text-gray-600">Additional Notes:</span>
            <p className="text-gray-700 mt-1">{msg.proposalData.notes}</p>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-green-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 font-medium">
              Status: {msg.proposalData.status === 'proposal_sent' ? 'Awaiting Customer Response' : msg.proposalData.status}
            </span>
            {msg.proposalData.canProceedToCheckout && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Customer can proceed to checkout
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// File Attachment Component
const FileAttachment = ({ fileData, isAdminMessage }) => {
  if (!fileData?.url) {
    return (
      <div className={`flex items-center bg-red-50 border border-red-200 rounded-lg p-3 mb-2 ${
        isAdminMessage ? 'bg-blue-100 border-blue-200' : ''
      }`}>
        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-sm ${isAdminMessage ? 'text-blue-800' : 'text-red-600'}`}>
          Image unavailable
        </span>
      </div>
    );
  }

  if (fileData.type === 'image') {
    return (
      <div className="mb-2">
        <img
          src={fileData.url}
          alt={fileData.name || 'Uploaded image'}
          className="max-w-[250px] rounded-lg shadow-sm"
          onError={(e) => console.error('Image load error:', e)}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center bg-gray-100 border border-gray-200 rounded-lg p-3 mb-2 ${
      isAdminMessage ? 'bg-blue-100 border-blue-200' : ''
    }`}>
      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <div>
        <p className={`text-sm font-medium ${isAdminMessage ? 'text-blue-800' : 'text-gray-800'}`}>
          {fileData.name || 'Unnamed file'}
        </p>
        <p className={`text-xs ${isAdminMessage ? 'text-blue-600' : 'text-gray-600'}`}>
          {(fileData.size / 1024).toFixed(2)} KB
        </p>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ msg, isAdminMessage }) => {
  const messageTime = msg.isOptimistic
    ? "Sending..."
    : msg.timestamp?.toDate
      ? msg.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "";

  return (
    <div
      className={`px-4 py-2 rounded-xl text-sm ${
        isAdminMessage
          ? "bg-blue-500 text-white rounded-br-none"
          : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
      }`}
    >
      <p>{msg.text || msg.content}</p>
      <span
        className={`block mt-1 text-xs text-right ${
          isAdminMessage ? "text-blue-100" : "text-gray-500"
        }`}
      >
        {messageTime}
      </span>
    </div>
  );
};

// Retry utility function
const sendWithRetry = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await operation();
      return; // Success
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
};

// Main Messages Component
function Messages() {
  const { customerId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');
  const [chatThreads, setChatThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalData, setProposalData] = useState({
    price: '',
    timeline: '',
    notes: '',
    downPayment: '',
    paymentTerms: ''
  });
  const [isSending, setIsSending] = useState(false);
  const hasSentInitialMessage = useRef(false);

  const { messagesEndRef, messagesContainerRef, isAtBottom, setIsAtBottom } = useScrollToBottom(messages);

  // Debounced search
  const debouncedSearch = debounce((query) => {
    setSearchQuery(query);
  }, 300);

  // Fetch and deduplicate chat threads
  useEffect(() => {
    const chatsRef = collection(db, `artifacts/${appId}/public/data/chats`);
    const q = query(chatsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const threadsMap = new Map();
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const threadCustomerId = data.customerId || doc.id;
        const existingThread = threadsMap.get(threadCustomerId);

        if (!existingThread || (data.timestamp?.toMillis() > existingThread.timestamp?.toMillis())) {
          threadsMap.set(threadCustomerId, {
            id: doc.id,
            ...data,
            userName: data.userName || data.senderName || data.customerName || data.name || 'Unknown User',
            hasCustomization: data.hasCustomizationRequest || false
          });
        }
      });

      const threads = Array.from(threadsMap.values());
      setChatThreads(threads);
      setLoadingThreads(false);

      if (customerId && threads.length > 0 && !selectedThread) {
        const decodedCustomerId = decodeURIComponent(customerId);
        let matchingThread = threads.find(thread => 
          thread.customerId === decodedCustomerId || 
          thread.id === decodedCustomerId || 
          thread.userEmail === decodedCustomerId ||
          thread.customer?.email === decodedCustomerId ||
          thread.email === decodedCustomerId
        );

        if (!matchingThread) {
          const newThreadRef = doc(collection(db, `artifacts/${appId}/public/data/chats`));
          const orderRef = doc(db, `artifacts/${appId}/public/data/orders`, orderId || decodedCustomerId);
          const orderDoc = await getDoc(orderRef);
          const customerName = orderDoc.exists() ? orderDoc.data().customerName || 'Unknown User' : 'Unknown User';

          await setDoc(newThreadRef, {
            customerId: decodedCustomerId,
            userName: customerName,
            lastMessage: '',
            timestamp: serverTimestamp(),
            isRead: true,
            hasCustomization: false
          });

          matchingThread = {
            id: newThreadRef.id,
            customerId: decodedCustomerId,
            userName: customerName,
            lastMessage: '',
            isRead: true,
            hasCustomization: false
          };
          setChatThreads(prev => [...prev, matchingThread]);
        }

        if (matchingThread) {
          handleThreadSelect(matchingThread);
        }
      }
    }, (error) => {
      console.error("Error fetching chat threads: ", error);
      setLoadingThreads(false);
    });

    return () => unsubscribe();
  }, [customerId, selectedThread]);

  // Send initial message when thread is selected via URL
  useEffect(() => {
    if (selectedThread && customerId && !hasSentInitialMessage.current) {
      const sendInitialMessage = async () => {
        const batch = writeBatch(db);
        const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats`, selectedThread.id);
        const messagesRef = collection(chatThreadRef, 'messages');
        const newMessageRef = doc(messagesRef);
        
        try {
          batch.set(newMessageRef, {
            text: `Hello, this is Mirrora Support. We're reaching out regarding your order ${orderId || 'ID'}. How can we assist you?`,
            timestamp: serverTimestamp(),
            senderId: 'mirrora-admin',
            senderName: 'Mirrora Support',
            messageType: 'text',
          });

          batch.set(chatThreadRef, {
            lastMessage: `Hello, this is Mirrora Support. We're reaching out regarding your order ${orderId || 'ID'}. How can we assist you?`,
            timestamp: serverTimestamp(),
            isRead: true,
          }, { merge: true });

          await sendWithRetry(() => batch.commit());
          setIsAtBottom(true);
          hasSentInitialMessage.current = true;
        } catch (error) {
          console.error("Error sending initial message: ", error);
          alert("Failed to send initial message. Please try again.");
        }
      };

      sendInitialMessage();
    }
  }, [selectedThread, customerId, orderId, setIsAtBottom]);

  const handleThreadSelect = async (thread) => {
    setSelectedThread(thread);
    setIsAtBottom(true);
    
    if (!thread.isRead) {
      const threadRef = doc(db, `artifacts/${appId}/public/data/chats`, thread.id);
      try {
        await setDoc(threadRef, { isRead: true }, { merge: true });
      } catch (error) {
        console.error("Error marking thread as read: ", error);
      }
    }
  };

  // Fetch messages for selected thread
  useEffect(() => {
    if (!selectedThread) return;

    setLoadingMessages(true);
    const messagesRef = collection(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          senderName: data.senderName || data.userName || data.customerName || data.name || 
                     (data.senderId === 'mirrora-admin' ? 'Mirrora Support' : 'Customer')
        };
      }).filter(msg => !msg.isOptimistic); // Filter out optimistic messages
      
      setMessages(fetchedMessages);
      setLoadingMessages(false);

      // Update thread metadata if needed
      updateThreadMetadata(fetchedMessages);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoadingMessages(false);
    });
    
    return () => unsubscribe();
  }, [selectedThread]);

  const updateThreadMetadata = async (fetchedMessages) => {
    if (fetchedMessages.length === 0) return;

    const customerMessage = fetchedMessages.find(msg => 
      msg.senderId !== 'mirrora-admin' && msg.isUser !== false
    );
    const hasCustomization = fetchedMessages.some(msg => msg.messageType === 'customization_request');
    
    const shouldUpdate = (customerMessage && customerMessage.senderName && customerMessage.senderName !== 'Customer') || 
                        hasCustomization !== selectedThread.hasCustomization;

    if (shouldUpdate) {
      const threadRef = doc(db, `artifacts/${appId}/public/data/chats`, selectedThread.id);
      try {
        await setDoc(threadRef, { 
          userName: customerMessage?.senderName || selectedThread.userName,
          customerName: customerMessage?.senderName || selectedThread.userName,
          hasCustomizationRequest: hasCustomization
        }, { merge: true });
        
        setSelectedThread(prev => ({
          ...prev,
          userName: customerMessage?.senderName || prev.userName,
          hasCustomization: hasCustomization
        }));
      } catch (error) {
        console.error("Error updating thread metadata: ", error);
      }
    }
  };

const handleSendReply = async () => {
  if (!replyContent.trim() || !selectedThread || isSending) return;

  const messageContent = replyContent.trim();
  setReplyContent('');
  setIsSending(true);

  const tempMessageId = `temp-${Date.now()}`;
  const optimisticMessage = {
    id: tempMessageId,
    text: messageContent,
    timestamp: { toDate: () => new Date() },
    senderId: 'mirrora-admin',
    senderName: 'Mirrora Support',
    messageType: 'text',
    isOptimistic: true
  };

  // show message instantly
  setMessages(prev => [...prev, optimisticMessage]);

  const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
  const messagesRef = collection(chatThreadRef, 'messages');
  const newMessageRef = doc(messagesRef);

  try {
    await sendWithRetry(() =>
      writeBatch(db)
        .set(newMessageRef, {
          text: messageContent,
          timestamp: serverTimestamp(),
          senderId: 'mirrora-admin',
          senderName: 'Mirrora Support',
          messageType: 'text'
        })
        .set(
          chatThreadRef,
          {
            lastMessage: messageContent,
            timestamp: serverTimestamp(),
            isRead: true
          },
          { merge: true }
        )
        .commit()
    );
  } catch (error) {
    console.error("Error sending reply:", error);
    // revert optimistic message
    setMessages(prev => prev.filter(m => m.id !== tempMessageId));
    setReplyContent(messageContent); // restore text
    alert("Failed to send message. Please try again.");
  } finally {
    setIsSending(false);
  }
};

  const handleDeleteConversation = async () => {
    if (!selectedThread || !window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
    const messagesRef = collection(chatThreadRef, 'messages');

    try {
      const messagesSnapshot = await getDocs(messagesRef);
      const deletePromises = messagesSnapshot.docs.map((messageDoc) => deleteDoc(messageDoc.ref));
      await Promise.all(deletePromises);
      await deleteDoc(chatThreadRef);

      setSelectedThread(null);
      setMessages([]);
    } catch (error) {
      console.error("Error deleting conversation: ", error);
      alert("Could not delete conversation. Please try again.");
    }
  };

  const handleCustomizationView = (customizationData) => {
    setSelectedCustomization(customizationData);
    setShowCustomizationModal(true);
  };

  const handleSendProposal = (customizationData) => {
    setSelectedCustomization(customizationData);
    setShowProposalModal(true);
  };

  const sendCustomizationProposal = async () => {
    if (!proposalData.price || !proposalData.timeline) {
      alert('Please provide both price and timeline for the proposal.');
      return;
    }

    const batch = writeBatch(db);
    const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
    const messagesRef = collection(chatThreadRef, 'messages');
    const newMessageRef = doc(messagesRef);
    const customOrdersRef = collection(db, `artifacts/${appId}/public/data/customOrders`);
    const newOrderRef = doc(customOrdersRef);

    try {
      const orderId = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Simplified proposal data
      const simplifiedProposal = {
        orderId,
        price: proposalData.price,
        timeline: proposalData.timeline,
        downPayment: proposalData.downPayment || '',
        paymentTerms: proposalData.paymentTerms || '',
        notes: proposalData.notes || '',
        status: 'proposal_sent',
        canProceedToCheckout: true
      };

      // Message batch
      batch.set(newMessageRef, {
        text: `Customization proposal sent for order ${orderId}`,
        timestamp: serverTimestamp(),
        senderId: 'mirrora-admin',
        senderName: 'Mirrora Support',
        messageType: 'customization_proposal',
        proposalData: simplifiedProposal,
      });

      // Thread update batch
      batch.set(chatThreadRef, {
        lastMessage: 'Sent a customization proposal',
        timestamp: serverTimestamp(),
        isRead: true,
        hasCustomizationRequest: true
      }, { merge: true });

      // Order creation batch
      batch.set(newOrderRef, {
        orderId,
        customerId: selectedThread.id,
        customerName: selectedThread.userName,
        status: 'proposal_sent',
        proposalData: simplifiedProposal,
        timestamp: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      await sendWithRetry(() => batch.commit());

      setShowProposalModal(false);
      setProposalData({ price: '', timeline: '', notes: '', downPayment: '', paymentTerms: '' });
      setSelectedCustomization(null);
      setIsAtBottom(true);

      alert('Customization proposal sent successfully! Customer can now proceed to checkout.');
    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('Failed to send proposal. Please try again.');
    }
  };

  const filteredThreads = chatThreads
    .filter(thread => {
      switch (filter) {
        case 'unread': return !thread.isRead;
        case 'customization': return thread.hasCustomization;
        default: return true;
      }
    })
    .filter(thread => thread.userName?.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderMessage = (msg) => {
    const isAdminMessage = msg.senderId === 'mirrora-admin' || msg.isUser === false;
    
    return (
      <div key={msg.id} className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
        {!isAdminMessage && (
          <div className="w-8 h-8 mr-2 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
            {getInitials(msg.senderName)}
          </div>
        )}
        <div className={`max-w-xs lg:max-w-md ${
          ['customization_request', 'customization_proposal', 'file'].includes(msg.messageType) ? 'max-w-4xl' : ''
        }`}>
          {msg.messageType === 'customization_request' && (
            <CustomizationMessage 
              msg={msg} 
              onViewDetails={handleCustomizationView}
              onSendProposal={handleSendProposal}
            />
          )}
          {msg.messageType === 'customization_proposal' && <ProposalMessage msg={msg} />}
          {msg.messageType === 'file' && <FileAttachment fileData={msg.fileData} isAdminMessage={isAdminMessage} />}
          {!['customization_request', 'customization_proposal', 'file'].includes(msg.messageType) && (
            <MessageBubble msg={msg} isAdminMessage={isAdminMessage} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Left Sidebar - Conversation List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2 mb-4">
            {[
              { key: 'all', label: `All (${chatThreads.length})` },
              { key: 'unread', label: `Unread (${chatThreads.filter(t => !t.isRead).length})` },
              { key: 'customization', label: `Customizations (${chatThreads.filter(t => t.hasCustomization).length})` }
            ].map(({ key, label }) => (
              <button 
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === key 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <LoadingState message="Loading conversations..." />
          ) : filteredThreads.length === 0 ? (
            <EmptyState 
              icon={MessageSquare}
              message={searchQuery ? 'No conversations match your search' : 'No conversations yet'}
            />
          ) : (
            filteredThreads.map(thread => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                selectedThread={selectedThread}
                onSelect={handleThreadSelect}
                getInitials={getInitials}
                formatTime={formatTime}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Pane - Message Content */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <ChatHeader
              thread={selectedThread}
              getInitials={getInitials}
              onDelete={handleDeleteConversation}
            />
            
            <MessagesArea
              ref={messagesContainerRef}
              messages={messages}
              loadingMessages={loadingMessages}
              renderMessage={renderMessage}
              messagesEndRef={messagesEndRef}
            />

            <MessageInput
              replyContent={replyContent}
              onReplyChange={setReplyContent}
              onSendReply={handleSendReply}
              isSending={isSending}
            />
          </>
        ) : (
          <EmptyChatState />
        )}
      </div>

      {/* Modals */}
      <CustomizationModal
        isOpen={showCustomizationModal}
        customization={selectedCustomization}
        onClose={() => setShowCustomizationModal(false)}
        onSendProposal={() => {
          setShowCustomizationModal(false);
          setShowProposalModal(true);
        }}
      />

      <ProposalModal
        isOpen={showProposalModal}
        customization={selectedCustomization}
        proposalData={proposalData}
        onProposalChange={setProposalData}
        onClose={() => {
          setShowProposalModal(false);
          setProposalData({ price: '', timeline: '', notes: '', downPayment: '', paymentTerms: '' });
        }}
        onSubmit={sendCustomizationProposal}
      />
    </div>
  );
}

// Sub-components for better organization
const LoadingState = ({ message }) => (
  <div className="p-4 text-center">
    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="p-4 text-center">
    <Icon size={32} className="mx-auto mb-2 text-gray-300" />
    <p className="text-gray-500 text-sm">{message}</p>
  </div>
);

const ThreadItem = ({ thread, selectedThread, onSelect, getInitials, formatTime }) => (
  <div
    onClick={() => onSelect(thread)}
    className={`flex items-center p-4 border-b border-gray-100 cursor-pointer transition-colors ${
      selectedThread?.id === thread.id 
        ? 'bg-blue-50 border-l-4 border-blue-500' 
        : 'hover:bg-gray-50'
    }`}
  >
    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm relative">
      {getInitials(thread.userName)}
      {thread.hasCustomization && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
          <Settings className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
    <div className="ml-3 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium truncate ${
          !thread.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'
        }`}>
          {thread.userName && thread.userName !== 'Unknown User' ? thread.userName : 'Loading...'}
        </span>
        <span className="text-xs text-gray-500 ml-2">{formatTime(thread.timestamp)}</span>
      </div>
      <p className={`text-xs truncate ${
        !thread.isRead ? 'text-blue-600 font-medium' : 'text-gray-500'
      }`}>
        {thread.lastMessage}
      </p>
      <div className="flex items-center gap-1 mt-1">
        {!thread.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
        {thread.hasCustomization && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            Customization
          </span>
        )}
      </div>
    </div>
  </div>
);

const ChatHeader = ({ thread, getInitials, onDelete }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm relative">
        {getInitials(thread.userName)}
        {thread.hasCustomization && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
            <Settings className="w-2 h-2 text-white" />
          </div>
        )}
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {thread.userName}
          {thread.hasCustomization && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Has Customization Request
            </span>
          )}
        </h3>
      </div>
    </div>
    
    <div className="flex items-center gap-2 text-gray-500">
      <button 
        onClick={onDelete}
        className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Delete conversation"
      >
        <Trash2 size={18} />
      </button>
      <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
  </div>
);

const MessagesArea = React.forwardRef(({ messages, loadingMessages, renderMessage, messagesEndRef }, ref) => (
  <div 
    className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4"
    ref={ref}
  >
    {loadingMessages ? (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    ) : messages.length === 0 ? (
      <EmptyChatState />
    ) : (
      messages.map(renderMessage)
    )}
    <div ref={messagesEndRef} />
  </div>
));

const EmptyChatState = () => (
  <div className="flex items-center justify-center h-full text-gray-400">
    <div className="text-center">
      <MessageSquare size={48} className="mx-auto mb-4" />
      <p className="text-lg">No messages yet</p>
      <p className="text-sm">Start the conversation!</p>
    </div>
  </div>
);

const MessageInput = ({ replyContent, onReplyChange, onSendReply, isSending }) => (
  <div className="p-4 bg-white border-t border-gray-200">
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={replyContent}
        onChange={(e) => onReplyChange(e.target.value)}
        placeholder={isSending ? "Sending..." : "Type your message..."}
        disabled={isSending}
        className="flex-1 p-3 rounded-lg bg-gray-100 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        onKeyPress={(e) => { 
          if (e.key === 'Enter' && !e.shiftKey && !isSending) { 
            e.preventDefault(); 
            onSendReply(); 
          } 
        }}
      />
      <button 
        onClick={onSendReply}
        disabled={!replyContent.trim() || isSending}
        className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
      >
        {isSending ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </div>
  </div>
);

const CustomizationModal = ({ isOpen, customization, onClose, onSendProposal }) => {
  if (!isOpen || !customization) return null;

  return (
    <Modal title="Customization Request Details" subtitle="Review and create proposal" onClose={onClose}>
      <div className="overflow-y-auto p-6 flex-1 space-y-4">
        <DetailSection icon={Package} title="Product Information">
          <div className="grid md:grid-cols-2 gap-4">
            <DetailField label="Product Name" value={customization.productInfo?.name} />
            <DetailField label="Base Price" value={`₱${customization.productInfo?.price}`} isPrice />
          </div>
        </DetailSection>

        <DetailSection icon={Ruler} title="Dimensions">
          <div className="grid md:grid-cols-3 gap-4">
            <DetailField label="Height" value={`${customization.dimensions?.height} cm`} centered />
            <DetailField label="Width" value={`${customization.dimensions?.width} cm`} centered />
            <DetailField label="Depth" value={`${customization.dimensions?.depth || 'Standard'} cm`} centered />
          </div>
        </DetailSection>

        <DetailSection icon={Palette} title="Design Specifications">
          <div className="grid md:grid-cols-2 gap-4">
            <DetailField label="Frame Style" value={customization.frameStyle} />
            <DetailField label="Frame Color" value={customization.frameColor} />
            <DetailField label="Mirror Type" value={customization.mirrorType} />
            <DetailField label="Mounting" value={customization.mountingType} />
          </div>
        </DetailSection>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-green-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-500" />
            Customer Budget
          </h3>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₱{customization.budget || 'Not specified'}</p>
          </div>
        </div>

        {customization.specialInstructions && (
          <DetailSection icon={FileText} title="Special Instructions">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {customization.specialInstructions}
            </p>
          </DetailSection>
        )}
      </div>

      <ModalActions
        secondaryAction={{ label: 'Close', onClick: onClose }}
        primaryAction={{ label: 'Send Proposal', onClick: onSendProposal, icon: ShoppingCart }}
      />
    </Modal>
  );
};

const ProposalModal = ({ isOpen, customization, proposalData, onProposalChange, onClose, onSubmit }) => {
  if (!isOpen || !customization) return null;

  return (
    <Modal title="Create Custom Order Proposal" subtitle="Set pricing and terms for this customization" onClose={onClose}>
      <div className="overflow-y-auto p-6 flex-1">
        <div className="bg-amber-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-amber-600" />
            Request Summary
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <DetailField label="Product" value={customization.productInfo?.name} />
            <DetailField label="Dimensions" value={`${customization.dimensions?.height} × ${customization.dimensions?.width} cm`} />
            <DetailField label="Frame" value={`${customization.frameStyle} - ${customization.frameColor}`} />
            <DetailField label="Customer Budget" value={`₱${customization.budget}`} isPrice />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Total Price (₱) *"
              type="number"
              value={proposalData.price}
              onChange={(value) => onProposalChange(prev => ({...prev, price: value}))}
              placeholder="Enter total price"
            />
            <InputField
              label="Completion Timeline *"
              value={proposalData.timeline}
              onChange={(value) => onProposalChange(prev => ({...prev, timeline: value}))}
              placeholder="e.g., 2-3 weeks"
            />
            <InputField
              label="Down Payment (₱)"
              type="number"
              value={proposalData.downPayment}
              onChange={(value) => onProposalChange(prev => ({...prev, downPayment: value}))}
              placeholder="Optional down payment"
            />
            <InputField
              label="Payment Terms"
              value={proposalData.paymentTerms}
              onChange={(value) => onProposalChange(prev => ({...prev, paymentTerms: value}))}
              placeholder="e.g., 50% down, 50% on delivery"
            />
          </div>

          <InputField
            label="Additional Details & Terms"
            type="textarea"
            value={proposalData.notes}
            onChange={(value) => onProposalChange(prev => ({...prev, notes: value}))}
            placeholder="Include any additional details, terms, conditions, or special considerations..."
            rows={4}
          />
        </div>
      </div>

      <ModalActions
        secondaryAction={{ label: 'Cancel', onClick: onClose }}
        primaryAction={{ 
          label: 'Send Proposal', 
          onClick: onSubmit, 
          icon: ShoppingCart,
          disabled: !proposalData.price || !proposalData.timeline
        }}
      />
    </Modal>
  );
};

// Reusable modal components
const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-white/90 text-sm mt-1">{subtitle}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200">
          <X size={24} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ModalActions = ({ secondaryAction, primaryAction }) => (
  <div className="bg-gray-100 p-4 border-t border-gray-200">
    <div className="flex gap-3">
      <button
        onClick={secondaryAction.onClick}
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        {secondaryAction.label}
      </button>
      <button
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {primaryAction.icon && <primaryAction.icon size={18} />}
        {primaryAction.label}
      </button>
    </div>
  </div>
);

const DetailSection = ({ icon: Icon, title, children }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
      <Icon size={20} className="text-blue-500" />
      {title}
    </h3>
    {children}
  </div>
);

const DetailField = ({ label, value, isPrice = false, centered = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className={`bg-white p-3 rounded border border-gray-300 ${centered ? 'text-center' : ''}`}>
      <p className={isPrice ? 'text-green-600 font-bold' : 'text-gray-900'}>
        {value || 'Not specified'}
      </p>
    </div>
  </div>
);

const InputField = ({ label, type = 'text', value, onChange, placeholder, rows }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )}
  </div>
);

export default Messages;