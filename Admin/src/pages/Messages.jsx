import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MessageSquare,
  Send,
  MoreVertical,
  Trash2,
  Clock,
  User,
  Settings,
  Package,
  DollarSign,
  Calendar,
  Eye,
  X,
  Ruler,
  Palette,
  Circle,
  Wrench,
  FileText,
  MapPin,
} from 'lucide-react';
import { db, appId } from '../../Backend/firebaseConfig.js';
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
  updateDoc,
} from 'firebase/firestore';

export default function Messages() {
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
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteData, setQuoteData] = useState({
    price: '',
    timeline: '',
    notes: '',
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat threads
  useEffect(() => {
    const chatsRef = collection(db, `artifacts/${appId}/public/data/chats`);
    const q = query(chatsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const threads = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            userName:
              data.userName ||
              data.senderName ||
              data.customerName ||
              data.name ||
              'Unknown User',
            hasCustomization: data.hasCustomizationRequest || false,
          };
        });
        setChatThreads(threads);
        setLoadingThreads(false);
      },
      (error) => {
        console.error('Error fetching chat threads: ', error);
        setLoadingThreads(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleThreadSelect = async (thread) => {
    setSelectedThread(thread);
    if (!thread.isRead) {
      const threadRef = doc(db, `artifacts/${appId}/public/data/chats`, thread.id);
      try {
        await setDoc(threadRef, { isRead: true }, { merge: true });
      } catch (error) {
        console.error('Error marking thread as read: ', error);
      }
    }
  };

  // Fetch messages for selected thread
  useEffect(() => {
    if (selectedThread) {
      setLoadingMessages(true);
      const messagesRef = collection(
        db,
        `artifacts/${appId}/public/data/chats/${selectedThread.id}/messages`
      );
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const fetchedMessages = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              senderName:
                data.senderName ||
                data.userName ||
                data.customerName ||
                data.name ||
                (data.senderId === 'mirrora-admin' ? 'Mirrora Support' : 'Customer'),
            };
          });

          setMessages(fetchedMessages);
          setLoadingMessages(false);

          // Update thread with proper user name if needed
          if (
            fetchedMessages.length > 0 &&
            (!selectedThread.userName || selectedThread.userName === 'Unknown User')
          ) {
            const customerMessage = fetchedMessages.find(
              (msg) => msg.senderId !== 'mirrora-admin' && msg.isUser !== false
            );
            if (customerMessage && customerMessage.senderName && customerMessage.senderName !== 'Customer') {
              const threadRef = doc(db, `artifacts/${appId}/public/data/chats`, selectedThread.id);
              setDoc(
                threadRef,
                {
                  userName: customerMessage.senderName,
                  customerName: customerMessage.senderName,
                },
                { merge: true }
              ).catch((error) => {
                console.error('Error updating thread name: ', error);
              });
              setSelectedThread((prev) => ({
                ...prev,
                userName: customerMessage.senderName,
              }));
            }
          }
        },
        (error) => {
          console.error('Error fetching messages: ', error);
          setLoadingMessages(false);
        }
      );

      return () => unsubscribe();
    }
  }, [selectedThread]);

  const handleSendReply = async () => {
    if (replyContent.trim() === '' || !selectedThread) return;
    const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
    const messagesRef = collection(chatThreadRef, 'messages');
    try {
      await addDoc(messagesRef, {
        text: replyContent.trim(),
        timestamp: serverTimestamp(),
        senderId: 'mirrora-admin',
        senderName: 'Mirrora Support',
        messageType: 'text',
      });
      await setDoc(
        chatThreadRef,
        {
          lastMessage: replyContent.trim(),
          timestamp: serverTimestamp(),
          isRead: true,
        },
        { merge: true }
      );
      setReplyContent('');
    } catch (error) {
      console.error('Error sending reply: ', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleDeleteConversation = async () => {
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
      console.error('Error deleting conversation: ', error);
      alert('Could not delete conversation. Please try again.');
    }
  };

  const handleCustomizationView = (customizationData) => {
    setSelectedCustomization(customizationData);
    setShowCustomizationModal(true);
  };

  const handleSendQuote = (customizationData) => {
    setSelectedCustomization(customizationData);
    setShowQuoteModal(true);
  };

  const sendQuote = async () => {
    if (!quoteData.price || !quoteData.timeline) {
      alert('Please provide both price and timeline for the quote.');
      return;
    }

    try {
      const quoteMessage = `📋 CUSTOMIZATION QUOTE

💰 **Quoted Price:** ₱${quoteData.price}
⏱️ **Timeline:** ${quoteData.timeline}

${quoteData.notes ?
`📝 **Additional Notes:**
${quoteData.notes}

` : ''}**Original Request Details:**
🛠️ Product: ${selectedCustomization.productInfo?.name}
📏 Dimensions: ${selectedCustomization.dimensions?.height} × ${selectedCustomization.dimensions?.width} cm
🎨 Frame: ${selectedCustomization.frameStyle} - ${selectedCustomization.frameColor}
🪞 Mirror Type: ${selectedCustomization.mirrorType}

Please let me know if you'd like to proceed with this customization!`;
      // Send quote message
      const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${selectedThread.id}`);
      const messagesRef = collection(chatThreadRef, 'messages');
      await addDoc(messagesRef, {
        text: quoteMessage,
        timestamp: serverTimestamp(),
        senderId: 'mirrora-admin',
        senderName: 'Mirrora Support',
        messageType: 'quote',
        quoteData: {
          ...quoteData,
          customizationId: selectedCustomization.requestId,
          status: 'quoted',
        },
      });
      await setDoc(
        chatThreadRef,
        {
          lastMessage: 'Sent a customization quote',
          timestamp: serverTimestamp(),
          isRead: true,
        },
        { merge: true }
      );
      setShowQuoteModal(false);
      setQuoteData({ price: '', timeline: '', notes: '' });
      setSelectedCustomization(null);

      alert('Quote sent successfully!');
    } catch (error) {
      console.error('Error sending quote:', error);
      alert('Failed to send quote. Please try again.');
    }
  };

  const filteredThreads = chatThreads
    .filter((thread) => (filter === 'unread' ? !thread.isRead : filter === 'customization' ? thread.hasCustomization : true))
    .filter((thread) => thread.userName?.toLowerCase().includes(searchQuery.toLowerCase()));

  const getInitials = (name = '') => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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

  // Enhanced form-style customization message renderer
  const renderCustomizationMessage = (msg) => {
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
      contactInfo,
    } = msg.customizationData;
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-4 shadow-lg max-w-2xl">
        {/* Header */}
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
              onClick={() => handleCustomizationView(msg.customizationData)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors shadow-sm"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => handleSendQuote(msg.customizationData)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors shadow-sm"
            >
              <DollarSign className="w-4 h-4" />
              Send Quote
            </button>
          </div>
        </div>

        {/* Form-Style Content */}
        <div className="space-y-6">
          {/* Product Information Section */}
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

          {/* Dimensions Section */}
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

          {/* Design Specifications */}
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

          {/* Additional Features */}
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

          {/* Budget and Timeline */}
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

          {/* Special Instructions */}
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

          {/* Contact Information */}
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

        {/* Request ID Footer */}
        <div className="mt-6 pt-4 border-t border-amber-200">
          <p className="text-xs text-amber-600 text-center">
            Request ID: {msg.customizationData.requestId || msg.id} | Submitted: {msg.timestamp ? msg.timestamp.toDate().toLocaleString() : 'Just now'}
          </p>
        </div>
      </div>
    );
  };

  const renderQuoteMessage = (msg) => {
    if (!msg.quoteData) return null;
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-800">Quote Sent</span>
        </div>
        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium">Price:</span> ₱{msg.quoteData.price}
          </p>
          <p>
            <span className="font-medium">Timeline:</span> {msg.quoteData.timeline}
          </p>
          {msg.quoteData.notes && (
            <p>
              <span className="font-medium">Notes:</span> {msg.quoteData.notes}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <div className="flex flex-1 overflow-hidden rounded-xl shadow-lg m-6 bg-white">
        {/* Left Sidebar - Message List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#2C1810] mb-4">Customer Messages</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  filter === 'all' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({chatThreads.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  filter === 'unread' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({chatThreads.filter((t) => !t.isRead).length})
              </button>
              <button
                onClick={() => setFilter('customization')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  filter === 'customization' ? 'bg-[#8B5E3C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Customizations ({chatThreads.filter((t) => t.hasCustomization).length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-5 h-5 border-2 border-[#8B5E3C] border-t-transparent rounded-full mx-auto mb-2"></div>
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
              filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => handleThreadSelect(thread)}
                  className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 relative ${
                    selectedThread?.id === thread.id ? 'bg-[#EDE7E0] border-l-4 border-[#A67B5B]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#A67B5B] flex items-center justify-center flex-shrink-0 text-white font-semibold relative">
                    {getInitials(thread.userName)}
                    {thread.hasCustomization && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Settings className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold truncate ${!thread.isRead ? 'text-[#2C1810]' : 'text-gray-700'}`}>
                        {thread.userName && thread.userName !== 'Unknown User' ? thread.userName : 'Loading...'}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{formatTime(thread.timestamp)}</span>
                    </div>
                    <p className={`text-xs truncate ${!thread.isRead ? 'text-[#A0522D] font-bold' : 'text-gray-500'}`}>
                      {thread.lastMessage}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {!thread.isRead && <div className="w-2 h-2 bg-[#8B5E3C] rounded-full"></div>}
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

        {/* Right Pane - Message Content */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#A67B5B] flex items-center justify-center text-white font-semibold relative">
                    {getInitials(selectedThread.userName)}
                    {selectedThread.hasCustomization && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                        <Settings className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2C1810] flex items-center gap-2">
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
                    <Trash2 size={20} />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-5 h-5 border-2 border-[#8B5E3C] border-t-transparent rounded-full"></div>
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
                  messages.map((msg) => {
                    const isAdminMessage = msg.senderId === 'mirrora-admin' || msg.isUser === false;
                    return (
                      <div key={msg.id} className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}>
                        {!isAdminMessage && (
                          <div className="w-8 h-8 mr-2 rounded-full bg-[#A67B5B] flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                            {getInitials(msg.senderName)}
                          </div>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            msg.messageType === 'customization_request' || msg.messageType === 'quote' ? 'max-w-4xl' : ''
                          }`}
                        >
                          {/* Special message types */}
                          {msg.messageType === 'customization_request' && renderCustomizationMessage(msg)}
                          {msg.messageType === 'quote' && renderQuoteMessage(msg)}

                          {/* Regular message bubble - only show if not a special message type */}
                          {msg.messageType !== 'customization_request' && msg.messageType !== 'quote' && (
                            <div
                              className={`px-4 py-2 rounded-xl text-sm ${
                                isAdminMessage ? 'bg-[#A67B5B] text-white rounded-br-none' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p>{msg.text || msg.content}</p>
                              <span className={`block mt-1 text-xs text-right ${isAdminMessage ? 'text-gray-200' : 'text-gray-500'}`}>
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

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-3 rounded-full bg-gray-100 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:bg-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyContent.trim()}
                    className="bg-[#A67B5B] text-white p-3 rounded-full hover:bg-[#8B5E3C] transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 text-sm">Choose a customer conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customization Details Modal */}
      {showCustomizationModal && selectedCustomization && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 transform scale-95 opacity-0 animate-fade-in-scale">
            <div className="sticky top-0 bg-[#A67B5B] text-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold">Customization Request Details</h2>
              <button
                onClick={() => setShowCustomizationModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product and Design Info */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Product Info */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    Product Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                      <p className="text-lg font-semibold text-gray-900 bg-white p-3 rounded-lg border border-gray-200">
                        {selectedCustomization.productInfo?.name || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Base Price</label>
                      <p className="text-xl font-bold text-green-600 bg-white p-3 rounded-lg border border-gray-200">
                        ₱{selectedCustomization.productInfo?.price || 'Contact for pricing'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Frame Details */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Palette size={20} className="text-amber-600" />
                    </div>
                    Frame & Mirror Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Frame Style</label>
                      <p className="text-gray-900 bg-white p-2 rounded-lg border border-gray-200">
                        {selectedCustomization.frameStyle || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Frame Color</label>
                      <p className="text-gray-900 bg-white p-2 rounded-lg border border-gray-200">
                        {selectedCustomization.frameColor || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Mirror Type</label>
                      <p className="text-gray-900 bg-white p-2 rounded-lg border border-gray-200">
                        {selectedCustomization.mirrorType || 'Standard'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Mounting</label>
                      <p className="text-gray-900 bg-white p-2 rounded-lg border border-gray-200">
                        {selectedCustomization.mountingType || 'Wall mount'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensions and Additional Info */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Dimensions */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Ruler size={20} className="text-purple-600" />
                    </div>
                    Dimensions
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 text-center">Height</label>
                      <p className="text-lg font-semibold text-gray-900 bg-white p-2 rounded-lg border border-gray-200 text-center">
                        {selectedCustomization.dimensions?.height || 'N/A'} cm
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 text-center">Width</label>
                      <p className="text-lg font-semibold text-gray-900 bg-white p-2 rounded-lg border border-gray-200 text-center">
                        {selectedCustomization.dimensions?.width || 'N/A'} cm
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1 text-center">Depth</label>
                      <p className="text-lg font-semibold text-gray-900 bg-white p-2 rounded-lg border border-gray-200 text-center">
                        {selectedCustomization.dimensions?.depth || 'Standard'} cm
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                {selectedCustomization.additionalFeatures?.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <Wrench size={20} className="text-teal-600" />
                      </div>
                      Additional Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomization.additionalFeatures.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-white text-teal-800 px-4 py-2 rounded-full text-sm font-medium border border-teal-200 shadow-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info and Special Instructions */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Budget & Delivery */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                    Customer Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Customer Budget</label>
                      <p className="text-2xl font-bold text-green-600 bg-white p-3 rounded-lg border border-gray-200">
                        ₱{selectedCustomization.budget || 'Not specified'}
                      </p>
                    </div>
                    {selectedCustomization.deliveryDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Preferred Delivery</label>
                        <p className="text-lg font-semibold text-orange-600 bg-white p-3 rounded-lg border border-gray-200">
                          {selectedCustomization.deliveryDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact and Instructions */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <MapPin size={20} className="text-indigo-600" />
                    </div>
                    Contact & Instructions
                  </h4>
                  <div className="space-y-4">
                    {selectedCustomization.contactInfo?.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                        <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200 font-medium">
                          {selectedCustomization.contactInfo.phone}
                        </p>
                      </div>
                    )}
                    {selectedCustomization.contactInfo?.email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                        <p className="text-gray-900 bg-white p-3 rounded-lg border border-gray-200 font-medium">
                          {selectedCustomization.contactInfo.email}
                        </p>
                      </div>
                    )}
                    {selectedCustomization.specialInstructions && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Special Instructions</label>
                        <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200">
                          {selectedCustomization.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCustomizationModal(false);
                    setShowQuoteModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg"
                >
                  <DollarSign size={20} />
                  Send Quote
                </button>
                <button
                  onClick={() => setShowCustomizationModal(false)}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedCustomization && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between bg-gradient-to-r from-[#A67B5B] to-[#8B5E3C] text-white rounded-t-xl">
              <h2 className="text-2xl font-bold">Send Customization Quote</h2>
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setQuoteData({ price: '', timeline: '', notes: '' });
                }}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Summary */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3 text-lg">Request Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">Product</label>
                    <p className="text-amber-700 bg-white px-3 py-2 rounded border border-amber-200">
                      {selectedCustomization.productInfo?.name}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">Dimensions</label>
                    <p className="text-amber-700 bg-white px-3 py-2 rounded border border-amber-200">
                      {selectedCustomization.dimensions?.height} × {selectedCustomization.dimensions?.width} cm
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">Frame</label>
                    <p className="text-amber-700 bg-white px-3 py-2 rounded border border-amber-200">
                      {selectedCustomization.frameStyle} - {selectedCustomization.frameColor}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-amber-800 mb-1">Customer Budget</label>
                    <p className="text-green-600 font-bold bg-white px-3 py-2 rounded border border-amber-200">
                      ₱{selectedCustomization.budget}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Your Quoted Price (₱) *</label>
                  <input
                    type="number"
                    value={quoteData.price}
                    onChange={(e) => setQuoteData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="Enter your price quote"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A67B5B] focus:border-transparent text-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Completion Timeline *</label>
                  <input
                    type="text"
                    value={quoteData.timeline}
                    onChange={(e) => setQuoteData((prev) => ({ ...prev, timeline: e.target.value }))}
                    placeholder="e.g., 2-3 weeks, 10 business days"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A67B5B] focus:border-transparent text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Additional Notes & Terms</label>
                  <textarea
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Include any additional details, terms, conditions, or special considerations..."
                    rows="4"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#A67B5B] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowQuoteModal(false);
                    setQuoteData({ price: '', timeline: '', notes: '' });
                  }}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={sendQuote}
                  disabled={!quoteData.price || !quoteData.timeline}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg shadow-lg"
                >
                  <Send size={20} />
                  Send Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}