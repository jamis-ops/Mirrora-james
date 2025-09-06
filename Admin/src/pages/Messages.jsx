import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Send,
  User,
  Archive,
  Star,
  Trash2,
  MoreVertical,
} from 'lucide-react';

// Mock data for messages and user profiles
const users = [
  {
    id: 'u1',
    name: 'Jane Doe',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    lastMessage: 'Hi! I have a question about my order.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'u2',
    name: 'John Smith',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    lastMessage: 'Is the large mirror available?',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'u3',
    name: 'Emily Chen',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    lastMessage: 'Thank you for your help!',
    time: '2 days ago',
    unread: false,
  },
  {
    id: 'u4',
    name: 'Michael Brown',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    lastMessage: 'Regarding the custom mirror...',
    time: '3 days ago',
    unread: false,
  },
];

// Mock conversation messages
const conversations = {
  'u1': [
    { sender: 'user', text: 'Hi, I have a question about my order #12345.', time: '2 hours ago' },
    { sender: 'admin', text: 'Hello Jane, I can help you with that. What is your question?', time: '2 hours ago' },
    { sender: 'user', text: 'I wanted to know if the shipping date is accurate.', time: '2 hours ago' },
  ],
  'u2': [
    { sender: 'user', text: 'Hi, is the large circular mirror available?', time: 'Yesterday' },
    { sender: 'admin', text: 'Hello John, yes it is. I have reserved one for you.', time: 'Yesterday' },
  ],
};

export default function Messages() {
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(`Sending message to ${selectedUser.name}: ${message}`);
      // In a real app, you'd send this to your backend
      setMessage('');
    }
  };

  const currentConversation = conversations[selectedUser.id] || [];

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans">
      <div className="flex flex-1 overflow-hidden rounded-xl shadow-lg m-6 bg-white">
        
        {/* Left Sidebar - Message List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#2C1810]">Messages</h2>
            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
                  selectedUser.id === user.id ? 'bg-[#EDE7E0] border-l-4 border-[#A67B5B]' : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 overflow-hidden">
                  <h4 className={`text-sm font-semibold truncate ${user.unread ? 'text-[#2C1810]' : 'text-gray-700'}`}>
                    {user.name}
                  </h4>
                  <p className={`text-xs truncate ${user.unread ? 'text-[#A0522D] font-bold' : 'text-gray-500'}`}>
                    {user.lastMessage}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs text-gray-400">{user.time}</span>
                  {user.unread && (
                    <span className="block w-2 h-2 bg-green-500 rounded-full ml-auto mt-1"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane - Message Content */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-[#2C1810]">
                      {selectedUser.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Active
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <button className="p-2 rounded-full hover:bg-gray-100"><Star size={20} /></button>
                  <button className="p-2 rounded-full hover:bg-gray-100"><Archive size={20} /></button>
                  <button className="p-2 rounded-full hover:bg-gray-100"><Trash2 size={20} /></button>
                  <button className="p-2 rounded-full hover:bg-gray-100"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {currentConversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-xl ${
                        msg.sender === 'admin' 
                          ? 'bg-[#A67B5B] text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className="block mt-1 text-xs text-right opacity-70">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 p-3 rounded-full bg-gray-100 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C]"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-[#A67B5B] text-white p-3 rounded-full hover:bg-[#8B5E3C] transition-colors duration-200"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto" />
                <p className="mt-4 text-lg">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}