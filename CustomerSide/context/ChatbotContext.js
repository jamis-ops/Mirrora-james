import React, { createContext, useContext, useState } from 'react';

const ChatbotContext = createContext();

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

export const ChatbotProvider = ({ children }) => {
  const [isChatbotVisible, setIsChatbotVisible] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const toggleChatbotVisibility = () => {
    setIsChatbotVisible(!isChatbotVisible);
  };

  const hideChatbot = () => {
    setIsChatbotVisible(false);
  };

  const showChatbot = () => {
    setIsChatbotVisible(true);
  };

  const addUnreadMessage = () => {
    setUnreadMessages(prev => prev + 1);
  };

  const clearUnreadMessages = () => {
    setUnreadMessages(0);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isChatbotVisible,
        unreadMessages,
        toggleChatbotVisibility,
        hideChatbot,
        showChatbot,
        addUnreadMessage,
        clearUnreadMessages,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};