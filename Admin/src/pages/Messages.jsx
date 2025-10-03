import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { db, appId } from '../../Backend/firebaseConfig.js';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch,
  doc,
  runTransaction
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import debounce from 'lodash/debounce';

const CustomizationMessage = React.memo(({ msg, onView, onProposal }) => {
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
            onClick={() => onView(msg.customizationData)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => onProposal(msg.customizationData)}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors shadow-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            Send Proposal
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-900">Product Information</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
              <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded border">
                {productInfo?.name || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Base Price</label>
              <p className="text-green-600 font-bold bg-green-50 px-3 py-2 rounded border">
                ₱{productInfo?.price || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-900">Dimensions</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Height</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border text-center">
                {dimensions?.height || 'N/A'} cm
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Width</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border text-center">
                {dimensions?.width || 'N/A'} cm
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Depth</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border text-center">
                {dimensions?.depth || 'Standard'} cm
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-900">Design Specifications</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Frame Style</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                {frameStyle || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Frame Color</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                {frameColor || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mirror Type</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                {mirrorType || 'Standard'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mounting</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                {mountingType || 'Wall mount'}
              </p>
            </div>
          </div>
        </div>

        {additionalFeatures && additionalFeatures.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Additional Features</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {additionalFeatures.map((feature, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Customer Budget</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">₱{budget || 'Not specified'}</p>
          </div>
          
          {deliveryDate && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-orange-800">Preferred Delivery</h4>
              </div>
              <p className="text-lg font-semibold text-orange-600">{deliveryDate}</p>
            </div>
          )}
        </div>

        {specialInstructions && (
          <div className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Special Instructions</h4>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-gray-700 leading-relaxed">{specialInstructions}</p>
            </div>
          </div>
        )}

        {contactInfo && (
          <div className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Contact Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {contactInfo.phone && (
                <div>
                  <label className="block text-gray-600 mb-1">Phone</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{contactInfo.phone}</p>
                </div>
              )}
              {contactInfo.email && (
                <div>
                  <label className="block text-gray-600 mb-1">Email</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{contactInfo.email}</p>
                </div>
              )}
              {contactInfo.address && (
                <div className="col-span-2">
                  <label className="block text-gray-600 mb-1">Delivery Address</label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded border">{contactInfo.address}</p>
                </div>
              )}
            </div>
          </div>
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
});

const ProposalMessage = React.memo(({ msg }) => {
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
});

const FileAttachment = React.memo(({ fileData, isAdminMessage }) => {
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
});

function Messages() {
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
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastMessageCountRef = useRef(0);
  const { threadId } = useParams();

  // Check for pre-filled message on component mount
  useEffect(() => {
    const prefilledMessage = sessionStorage.getItem('prefilledMessage');
    const customerName = sessionStorage.getItem('chatCustomerName');
    const customerEmail = sessionStorage.getItem('chatCustomerEmail');
    
    if (prefilledMessage && customerName) {
      // Find thread for this customer
      const existingThread = chatThreads.find(thread => 
        thread.userName === customerName || 
        thread.customerEmail === customerEmail
      );
      
      if (existingThread) {
        setSelectedThread(existingThread);
        // Auto-fill the message input
        setReplyContent(prefilledMessage);
        
        // Clear the session storage
        sessionStorage.removeItem('prefilledMessage');
        sessionStorage.removeItem('chatCustomerName');
        sessionStorage.removeItem('chatCustomerEmail');
      }
    }
  }, [chatThreads]);

  // Select thread based on URL param
  useEffect(() => {
    if (threadId && chatThreads.length > 0) {
      const thread = chatThreads.find(t => t.id === threadId);
      if (thread) {
        handleThreadSelect(thread);
      }
    }
  }, [threadId, chatThreads]);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Handle scroll to detect if user is at bottom
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
    }
  }, []);

  // Scroll to bottom only when new messages are added and user is at bottom
  useEffect(() => {
    if (isAtBottom && messages.length > lastMessageCountRef.current) {
      scrollToBottom('smooth');
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, isAtBottom, scrollToBottom]);

  // Add scroll event listener to messages container
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Fetch and deduplicate chat threads
  useEffect(() => {
    let isMounted = true;
    const chatsRef = collection(db, `artifacts/${appId}/public/data/chats`);
    const q = query(chatsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!isMounted) return;

      const threadsMap = new Map();
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const customerId = data.customerId || doc.id;
        const existingThread = threadsMap.get(customerId);

        // Only keep the most recent thread for each customerId
        if (!existingThread || (data.timestamp?.toMillis() > existingThread.timestamp?.toMillis())) {
          threadsMap.set(customerId, {
            id: doc.id,
            ...data,
            userName: data.userName || data.senderName || data.customerName || data.name || 'Unknown User',
            hasCustomization: data.hasCustomizationRequest || false,
            customerEmail: data.customerEmail || data.email || ''
          });
        }
      });

      const threads = Array.from(threadsMap.values());
      setChatThreads(threads);
      setLoadingThreads(false);
    }, (error) => {
      console.error("Error fetching chat threads: ", error);
      if (isMounted) setLoadingThreads(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleThreadSelect = useCallback(async (thread) => {
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
  }, []);

  // Fetch messages for selected thread
  useEffect(() => {
    if (selectedThread) {
      let isMounted = true;
      setLoadingMessages(true);
      const messagesRef = collection(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (!isMounted) return;
        const fetchedMessages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            senderName: data.senderName || data.userName || data.customerName || data.name || 
                      (data.senderId === 'mirrora-admin' ? 'Mirrora Support' : 'Customer')
          };
        });
        setMessages(fetchedMessages);
        setLoadingMessages(false);

        // Update thread with proper user name and customization flag
        if (fetchedMessages.length > 0) {
          const customerMessage = fetchedMessages.find(msg => 
            msg.senderId !== 'mirrora-admin' && msg.isUser !== false
          );
          const hasCustomization = fetchedMessages.some(msg => msg.messageType === 'customization_request');
          if ((customerMessage && customerMessage.senderName && customerMessage.senderName !== 'Customer') || hasCustomization !== selectedThread.hasCustomization) {
            const threadRef = doc(db, `artifacts/${appId}/public/data/chats`, selectedThread.id);
            setDoc(threadRef, { 
              userName: customerMessage?.senderName || selectedThread.userName,
              customerName: customerMessage?.senderName || selectedThread.userName,
              hasCustomizationRequest: hasCustomization
            }, { merge: true }).catch(error => {
              console.error("Error updating thread metadata: ", error);
            });
            
            setSelectedThread(prev => ({
              ...prev,
              userName: customerMessage?.senderName || prev.userName,
              hasCustomization: hasCustomization
            }));
          }
        }
      }, (error) => {
        console.error("Error fetching messages: ", error);
        if (isMounted) setLoadingMessages(false);
      });
      
      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [selectedThread]);

  const handleSendReply = useCallback(debounce(async () => {
    if (replyContent.trim() === '' || !selectedThread || isSending) return;
    
    setIsSending(true);
    const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
    const messagesRef = collection(chatThreadRef, 'messages');
    
    try {
      await runTransaction(db, async (transaction) => {
        const threadDoc = await transaction.get(chatThreadRef);
        if (!threadDoc.exists()) throw new Error("Thread does not exist");

        const newMessageRef = doc(messagesRef);
        transaction.set(newMessageRef, {
          text: replyContent.trim(),
          timestamp: serverTimestamp(),
          senderId: 'mirrora-admin',
          senderName: 'Mirrora Support',
          messageType: 'text',
        });

        transaction.update(chatThreadRef, {
          lastMessage: replyContent.trim(),
          timestamp: serverTimestamp(),
          isRead: true, 
        });
      });
      
      setReplyContent('');
      setIsAtBottom(true);
    } catch (error) {
      console.error("Error sending reply: ", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, 300), [replyContent, selectedThread, isSending]);

  const handleDeleteConversation = useCallback(async () => {
    if (!selectedThread || !window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
    const messagesRef = collection(chatThreadRef, 'messages');

    try {
      // Delete all messages first
      const messagesSnapshot = await getDocs(messagesRef);
      const deletePromises = messagesSnapshot.docs.map((messageDoc) => deleteDoc(messageDoc.ref));
      await Promise.all(deletePromises);
      
      // Then delete the thread
      await deleteDoc(chatThreadRef);

      setSelectedThread(null);
      setMessages([]);
    } catch (error) {
      console.error("Error deleting conversation: ", error);
      alert("Could not delete conversation. Please try again.");
    }
  }, [selectedThread]);

  const handleCustomizationView = useCallback((customizationData) => {
    setSelectedCustomization(customizationData);
    setShowCustomizationModal(true);
  }, []);

  const handleSendProposal = useCallback((customizationData) => {
    setSelectedCustomization(customizationData);
    setShowProposalModal(true);
  }, []);

  const sendCustomizationProposal = useCallback(async () => {
    if (!proposalData.price || !proposalData.timeline) {
      alert('Please provide both price and timeline for the proposal.');
      return;
    }

    const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
    const messagesRef = collection(chatThreadRef, 'messages');

    try {
      const orderId = `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const proposalMessage = `🎯 CUSTOMIZATION PROPOSAL

Order ID: ${orderId}

Total Price: ₱${proposalData.price}
Estimated Timeline: ${proposalData.timeline}
${proposalData.downPayment ? `Down Payment: ₱${proposalData.downPayment}` : ''}
${proposalData.paymentTerms ? `Payment Terms: ${proposalData.paymentTerms}` : ''}

${proposalData.notes ? `Additional Details:
${proposalData.notes}

` : ''}Your Customization Details:
Product: ${selectedCustomization.productInfo?.name}
Dimensions: ${selectedCustomization.dimensions?.height} × ${selectedCustomization.dimensions?.width} cm
Frame: ${selectedCustomization.frameStyle} - ${selectedCustomization.frameColor}
Mirror Type: ${selectedCustomization.mirrorType}

Ready to proceed? Click the button below to confirm your custom order!`;

      const batch = writeBatch(db);
      const newMessageRef = doc(messagesRef);
      
      batch.set(newMessageRef, {
        text: proposalMessage,
        timestamp: serverTimestamp(),
        senderId: 'mirrora-admin',
        senderName: 'Mirrora Support',
        messageType: 'customization_proposal',
        proposalData: {
          orderId,
          price: proposalData.price,
          timeline: proposalData.timeline,
          downPayment: proposalData.downPayment,
          paymentTerms: proposalData.paymentTerms,
          notes: proposalData.notes,
          customizationId: selectedCustomization.requestId,
          customizationDetails: selectedCustomization,
          status: 'proposal_sent',
          canProceedToCheckout: true
        },
      });

      batch.update(chatThreadRef, {
        lastMessage: 'Sent a customization proposal',
        timestamp: serverTimestamp(),
        isRead: true,
        hasCustomizationRequest: true
      });

      await batch.commit();

      const customOrdersRef = collection(db, `artifacts/${appId}/public/data/customOrders`);
      await addDoc(customOrdersRef, {
        orderId,
        customerId: selectedThread.id,
        customerName: selectedThread.userName,
        status: 'proposal_sent',
        proposalData: {
          price: proposalData.price,
          timeline: proposalData.timeline,
          downPayment: proposalData.downPayment,
          paymentTerms: proposalData.paymentTerms,
          notes: proposalData.notes
        },
        customizationDetails: selectedCustomization,
        timestamp: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      setShowProposalModal(false);
      setProposalData({ price: '', timeline: '', notes: '', downPayment: '', paymentTerms: '' });
      setSelectedCustomization(null);
      setIsAtBottom(true);

      alert('Customization proposal sent successfully! Customer can now proceed to checkout.');
    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('Failed to send proposal. Please try again.');
    }
  }, [proposalData, selectedCustomization, selectedThread]);

  const filteredThreads = chatThreads
    .filter(thread => filter === 'unread' ? !thread.isRead : filter === 'customization' ? thread.hasCustomization : true)
    .filter(thread => thread.userName?.toLowerCase().includes(searchQuery.toLowerCase()));

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

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({chatThreads.length})
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'unread' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Unread ({chatThreads.filter(t => !t.isRead).length})
            </button>
            <button 
              onClick={() => setFilter('customization')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === 'customization' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Customizations ({chatThreads.filter(t => t.hasCustomization).length})
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading conversations...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <div
                key={thread.id}
                onClick={() => handleThreadSelect(thread)}
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
                    {!thread.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                    {thread.hasCustomization && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        Customization
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm relative">
                  {getInitials(selectedThread.userName)}
                  {selectedThread.hasCustomization && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                      <Settings className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {selectedThread.userName}
                    {selectedThread.hasCustomization && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        Has Customization Request
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Active now
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <button 
                  onClick={handleDeleteConversation}
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

            <div 
              className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4"
              ref={messagesContainerRef}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4" />
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => {
                  const isAdminMessage = msg.senderId === 'mirrora-admin' || msg.isUser === false;
                  
                  return (
                    <div key={msg.id} className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                      {!isAdminMessage && (
                        <div className="w-8 h-8 mr-2 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                          {getInitials(msg.senderName)}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${
                        msg.messageType === 'customization_request' || msg.messageType === 'customization_proposal' || msg.messageType === 'file' ? 'max-w-4xl' : ''
                      }`}>
                        {msg.messageType === 'customization_request' && (
                          <CustomizationMessage 
                            msg={msg} 
                            onView={handleCustomizationView}
                            onProposal={handleSendProposal}
                          />
                        )}
                        {msg.messageType === 'customization_proposal' && (
                          <ProposalMessage msg={msg} />
                        )}
                        {msg.messageType === 'file' && (
                          <FileAttachment 
                            fileData={msg.fileData} 
                            isAdminMessage={isAdminMessage}
                          />
                        )}
                        {msg.messageType !== 'customization_request' && msg.messageType !== 'customization_proposal' && msg.messageType !== 'file' && (
                          <div className={`px-4 py-2 rounded-xl text-sm ${
                            isAdminMessage 
                              ? 'bg-blue-500 text-white rounded-br-none' 
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                          }`}>
                            <p>{msg.text || msg.content}</p>
                            <span className={`block mt-1 text-xs text-right ${
                            isAdminMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {msg.timestamp ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 rounded-lg bg-gray-100 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => { 
                    if (e.key === 'Enter' && !e.shiftKey) { 
                      e.preventDefault(); 
                      handleSendReply(); 
                    } 
                  }}
                />
                <button 
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isSending}
                  className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400 bg-white">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500 text-sm">Choose a customer conversation to view messages</p>
            </div>
          </div>
        )}
      </div>

      {showCustomizationModal && selectedCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Customization Request Details</h2>
                <p className="text-white/90 text-sm mt-1">Review and create proposal</p>
              </div>
              <button 
                onClick={() => setShowCustomizationModal(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-blue-500" />
                  Product Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <div className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-gray-900">
                        {selectedCustomization.productInfo?.name || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base Price</label>
                    <div className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-green-600 font-bold">
                        ₱{selectedCustomization.productInfo?.price || 'Contact for pricing'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Ruler size={20} className="text-blue-500" />
                  Dimensions
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                    <div className="bg-white p-3 rounded border border-gray-300 text-center">
                      <p className="text-gray-900">
                        {selectedCustomization.dimensions?.height || 'N/A'} cm
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                    <div className="bg-white p-3 rounded border border-gray-300 text-center">
                      <p className="text-gray-900">
                        {selectedCustomization.dimensions?.width || 'N/A'} cm
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Depth</label>
                    <div className="bg-white p-3 rounded border border-gray-300 text-center">
                      <p className="text-gray-900">
                        {selectedCustomization.dimensions?.depth || 'Standard'} cm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Palette size={20} className="text-blue-500" />
                  Design Specifications
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frame Style</label>
                    <div className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-gray-900">
                        {selectedCustomization.frameStyle || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frame Color</label>
                    <div className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-gray-900">
                        {selectedCustomization.frameColor || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mirror Type</label>
                    <div className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-gray-900">
                        {selectedCustomization.mirrorType || 'Standard'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mounting</label>
                    <div className="bg-white p-3 rounded border border-gray-300">
                      <p className="text-gray-900">
                        {selectedCustomization.mountingType || 'Wall mount'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg text-green-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-500" />
                  Customer Budget
                </h3>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">₱{selectedCustomization.budget || 'Not specified'}</p>
                  <p className="text-green-700 mt-2">Customer's budget range</p>
                </div>
              </div>

              {selectedCustomization.specialInstructions && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-blue-500" />
                    Special Instructions
                  </h3>
                  <div className="bg-white p-3 rounded border border-gray-300">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedCustomization.specialInstructions}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-100 p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustomizationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowCustomizationModal(false);
                    setShowProposalModal(true);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ShoppingCart size={18} />
                  Send Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProposalModal && selectedCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Create Custom Order Proposal</h2>
                <p className="text-white/90 text-sm mt-1">Set pricing and terms for this customization</p>
              </div>
              <button 
                onClick={() => {
                  setShowProposalModal(false);
                  setProposalData({ price: '', timeline: '', notes: '', downPayment: '', paymentTerms: '' });
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <div className="bg-amber-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Eye size={20} className="text-amber-600" />
                  Request Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">Product</label>
                    <div className="bg-white px-3 py-2 rounded border border-amber-300">
                      <p className="text-amber-900">{selectedCustomization.productInfo?.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">Dimensions</label>
                    <div className="bg-white px-3 py-2 rounded border border-amber-300">
                      <p className="text-amber-900">
                        {selectedCustomization.dimensions?.height} × {selectedCustomization.dimensions?.width} cm
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">Frame</label>
                    <div className="bg-white px-3 py-2 rounded border border-amber-300">
                      <p className="text-amber-900">
                        {selectedCustomization.frameStyle} - {selectedCustomization.frameColor}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-800 mb-2">Customer Budget</label>
                    <div className="bg-green-100 px-3 py-2 rounded border border-green-300">
                      <p className="text-green-700 font-bold">₱{selectedCustomization.budget}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Price (₱) *
                    </label>
                    <input
                      type="number"
                      value={proposalData.price}
                      onChange={(e) => setProposalData(prev => ({...prev, price: e.target.value}))}
                      placeholder="Enter total price"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Timeline *
                    </label>
                    <input
                      type="text"
                      value={proposalData.timeline}
                      onChange={(e) => setProposalData(prev => ({...prev, timeline: e.target.value}))}
                      placeholder="e.g., 2-3 weeks"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Down Payment (₱)
                    </label>
                    <input
                      type="number"
                      value={proposalData.downPayment}
                      onChange={(e) => setProposalData(prev => ({...prev, downPayment: e.target.value}))}
                      placeholder="Optional down payment"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={proposalData.paymentTerms}
                      onChange={(e) => setProposalData(prev => ({...prev, paymentTerms: e.target.value}))}
                      placeholder="e.g., 50% down, 50% on delivery"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details & Terms
                  </label>
                  <textarea
                    value={proposalData.notes}
                    onChange={(e) => setProposalData(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Include any additional details, terms, conditions, or special considerations..."
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProposalModal(false);
                    setProposalData({ price: '', timeline: '', notes: '', downPayment: '', paymentTerms: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={sendCustomizationProposal}
                  disabled={!proposalData.price || !proposalData.timeline}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  <ShoppingCart size={18} />
                  Send Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;