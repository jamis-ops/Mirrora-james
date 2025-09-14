import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';

// Simple ChatbotScreen without external dependencies
export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const flatListRef = useRef(null);

  // Gemini API configuration
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "AIzaSyAJaYkB3G69TzOWQ66bwVMmlQHR5ug3Jt0";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  // Quick reply options
  const quickReplies = [
    'Do you have onsite workshop?',
    'How much is the delivery fee?',
    'Do you offer same-day delivery?',
    'How do I track my order?',
    'What payment methods are accepted?'
  ];

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = () => {
    const welcomeMessage = {
      id: 1,
      text: "Hi! Welcome to Mirrora. How can I help you today?",
      sender: 'chatbot',
      timestamp: new Date(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  };

  // Call Gemini AI
  const callGeminiAI = async (userMessage) => {
    try {
      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('your_api_key')) {
        return "I'm having trouble connecting to my AI service. Please make sure your API key is set up correctly. You can visit our workshop at Brgy. Bulacao, Cebu City for immediate assistance!";
      }

      let aiResponseText = "";
      if (userMessage.toLowerCase().includes('payment methods') || userMessage.toLowerCase().includes('payment')) {
        aiResponseText = "Mirrora PH only accepts bank transfer for a 50% downpayment. The remaining 50% is due upon delivery of the product or item.";
      } else if (userMessage.toLowerCase().includes('track my order') || userMessage.toLowerCase().includes('order status')) {
        aiResponseText = "You can track your order on the 'My Order' screen, where you can see the current status of your order.";
      } else if (userMessage.toLowerCase().includes('delivery fee')) {
        aiResponseText = "The delivery fee depends on your specific location.";
      } else {
        const systemPrompt = `You are a helpful customer service assistant for "Mirrora" - a mirror company in Brgy. Bulacao, Cebu City, Philippines.

        Key Information:
        - Location: Brgy. Bulacao, Cebu City, Philippines
        - Services: Custom mirrors, decorative mirrors, delivery, installation
        - Payment: Cash, bank transfer, GCash, PayPal
        - Delivery: Available in Cebu City, fees ₱150-₱300
        - Same-day delivery: Available for in-stock items
        - Return policy: 7 days for defective items
        - Workshop visits: Welcome for viewing mirrors and custom orders
        
        Be helpful, friendly, and keep responses under 100 words.
        
        User question: ${userMessage}`;
        
        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: systemPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 150,
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        aiResponseText = data.candidates[0].content.parts[0].text;
      }

      return aiResponseText;
    } catch (error) {
      console.error('AI Error:', error);
      return "I'm having trouble right now. You can visit our workshop at Brgy. Bulacao, Cebu City for immediate assistance. What specific question do you have about our mirrors?";
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    try {
      setLoading(true);
      setIsBotTyping(true);

      // Add user message
      const userMessage = {
        id: Date.now(),
        text: textToSend,
        sender: 'user',
        timestamp: new Date(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, userMessage]);
      if (!messageText) setInputText('');

      // Get AI response
      const aiResponse = await callGeminiAI(textToSend);
      
      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'chatbot',
        timestamp: new Date(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Send Error:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setIsBotTyping(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.botMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.botMessageText
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mirrora Chat</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderTitle}>Hello!</Text>
          <Text style={styles.chatHeaderSubtitle}>How can I help?</Text>
        </View>

        {/* Messages */}
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={() => (
              isBotTyping && (
                <View style={styles.typingContainer}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>🤖</Text>
                  </View>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color="#A68B69" />
                    <Text style={styles.typingText}>Typing...</Text>
                  </View>
                </View>
              )
            )}
          />
        </View>

        {/* Quick Replies and Input */}
        <View style={styles.bottomContainer}>
          <ScrollView 
            style={styles.quickRepliesContainer} 
            horizontal 
            showsHorizontalScrollIndicator={false}
          >
            {quickReplies.map((reply, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.quickReplyButton} 
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Write Message"
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity 
              onPress={() => sendMessage()} 
              disabled={loading || !inputText.trim()}
              style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
            >
              <Text style={styles.sendButtonText}>
                {loading ? '...' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A68B69',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },
  chatHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  chatHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  chatHeaderSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#A68B69',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  messageBubble: {
    borderRadius: 15,
    padding: 15,
    maxWidth: '80%',
  },
  botMessageBubble: {
    backgroundColor: '#F3F4F6',
  },
  userMessageBubble: {
    backgroundColor: '#A68B69',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#000',
  },
  userMessageText: {
    color: '#fff',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 15,
    padding: 15,
  },
  typingText: {
    marginLeft: 8,
    color: '#A68B69',
    fontSize: 14,
  },
  bottomContainer: {
    backgroundColor: '#fff',
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
    paddingBottom: 10,
  },
  quickReplyButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  quickReplyText: {
    fontSize: 12,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#A68B69',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});