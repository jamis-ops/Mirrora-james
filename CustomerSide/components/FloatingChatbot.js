import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  PanResponder,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FloatingChatbot() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [position, setPosition] = useState({ x: screenWidth - 100, y: screenHeight - 250 });

  const flatListRef = useRef(null);

  // Separate animated values
  const chatAnimatedValue = useRef(new Animated.Value(0)).current;
  const dragPosition = useRef(new Animated.ValueXY(position)).current;
  const robotEyeScale = useRef(new Animated.Value(1)).current;
  const robotBounce = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current; // For fading
  const textTranslateX = useRef(new Animated.Value(-80)).current; // Start off to the left of robot width

  // Gemini API configuration
  const GEMINI_API_KEY = "AIzaSyAJaYkB3G69TzOWQ66bwVMmlQHR5ug3Jt0";
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  // Quick reply options
  const quickReplies = [
    'Do you have onsite workshop?',
    'How much is the delivery fee?',
    'Do you offer same-day delivery?',
    'How do I track my order?',
    'What payment methods are accepted?',
  ];

  // Pan responder for dragging
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      console.log('PanResponder: Grant');
      dragPosition.setOffset({
        x: dragPosition.x._value,
        y: dragPosition.y._value,
      });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: dragPosition.x, dy: dragPosition.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (evt, gestureState) => {
      console.log('PanResponder: Release');
      dragPosition.flattenOffset();

      // Snap to edges - updated for bigger robot
      const newX = dragPosition.x._value < screenWidth / 2 ? 20 : screenWidth - 100;
      const newY = Math.max(100, Math.min(screenHeight - 250, dragPosition.y._value));

      Animated.spring(dragPosition, {
        toValue: { x: newX, y: newY },
        useNativeDriver: false,
      }).start();

      setPosition({ x: newX, y: newY });
    },
  });

  useEffect(() => {
    console.log('FloatingChatbot: Mounted');
    initializeChat();
    // Trigger floating text animation on mount
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: 0, // Move to center of robot
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(5000), // Show for 5 seconds
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: -80, // Move back off to the left
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]);
    animation.start();

    // Cleanup animation on unmount
    return () => animation.stop();
  }, []);

  const initializeChat = () => {
    const welcomeMessage = {
      id: 1,
      text: "Hi! I'm Mira, your mirror assistant! How can I help you today?",
      sender: 'chatbot',
      timestamp: new Date(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMessage]);
  };

  const toggleExpanded = () => {
    console.log('FloatingChatbot: Toggling expanded', !isExpanded);
    setIsExpanded(!isExpanded);
    Animated.timing(chatAnimatedValue, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Call Gemini AI
  const callGeminiAI = async (userMessage) => {
    try {
      if (!GEMINI_API_KEY) {
        return "I'm having trouble connecting to my AI service. You can visit our workshop at Brgy. Bulacao, Cebu City for immediate assistance!";
      }

      let aiResponseText = "";
      if (userMessage.toLowerCase().includes('payment methods') || userMessage.toLowerCase().includes('payment')) {
        aiResponseText = "Mirrora PH only accepts bank transfer for a 50% downpayment. The remaining 50% is due upon delivery of the product or item.";
      } else if (userMessage.toLowerCase().includes('track my order') || userMessage.toLowerCase().includes('order status')) {
        aiResponseText = "You can track your order on the 'My Order' screen, where you can see the current status of your order.";
      } else if (userMessage.toLowerCase().includes('delivery fee')) {
        aiResponseText = "The delivery fee depends on your specific location within Cebu City.";
      } else if (userMessage.toLowerCase().includes('onsite workshop') || userMessage.toLowerCase().includes('workshop')) {
        aiResponseText = "Yes! We have an onsite workshop at Brgy. Bulacao, Cebu City. You're welcome to visit and see our mirrors in person!";
      } else {
        const systemPrompt = `You are Mira, a cute and helpful mirror-themed chatbot assistant for "Mirrora" - a custom mirror company in Brgy. Bulacao, Cebu City, Philippines.

        Key Information:
        - Location: Brgy. Bulacao, Cebu City, Philippines
        - Services: Custom mirrors, decorative mirrors, delivery, installation
        - Payment: Bank transfer (50% down, 50% on delivery)
        - Delivery: Available in Cebu City, fees vary by location
        - Same-day delivery: Available for in-stock items
        - Return policy: 7 days for defective items
        - Workshop visits: Welcome for viewing mirrors and custom orders
        
        Personality: Be cute, friendly, mirror-themed, and helpful. Use mirror/reflection puns when appropriate. Keep responses under 80 words.
        
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
              }],
            }],
            generationConfig: {
              temperature: 0.8,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 120,
            },
          }),
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
      return "Oops! I'm having a reflective moment. You can visit our workshop at Brgy. Bulacao, Cebu City for immediate assistance. What specific question do you have about our mirrors?";
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
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      if (!messageText) setInputText('');

      // Get AI response
      const aiResponse = await callGeminiAI(textToSend);

      const botMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'chatbot',
        timestamp: new Date(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
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
          <View style={styles.miniAvatarContainer}>
            <Text style={styles.miniAvatarText}>🤖</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.botMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.botMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // Robot face animation with proper cleanup
  useEffect(() => {
    console.log('FloatingChatbot: Starting animations');
    let blinkInterval;
    let bounceInterval;

    const startAnimations = () => {
      // Blinking animation
      const blinkAnimation = () => {
        console.log('FloatingChatbot: Blink animation');
        Animated.sequence([
          Animated.timing(robotEyeScale, {
            toValue: 0.1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(robotEyeScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
        ]).start();
      };

      // Bounce animation
      const bounceAnimation = () => {
        console.log('FloatingChatbot: Bounce animation');
        Animated.sequence([
          Animated.timing(robotBounce, {
            toValue: -5,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(robotBounce, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ]).start();
      };

      blinkInterval = setInterval(blinkAnimation, 3000);
      bounceInterval = setInterval(bounceAnimation, 4000);
    };

    startAnimations();

    return () => {
      console.log('FloatingChatbot: Cleaning up animations');
      if (blinkInterval) clearInterval(blinkInterval);
      if (bounceInterval) clearInterval(bounceInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Expanded Chat Window */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.chatWindow,
            {
              opacity: chatAnimatedValue,
              transform: [
                {
                  scale: chatAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                {
                  translateY: chatAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={isExpanded ? 'auto' : 'none'}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.headerRobot}>
                  <Text style={styles.headerRobotText}>🤖</Text>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Mira</Text>
                  <Text style={styles.headerSubtitle}>Mirror Assistant</Text>
                </View>
              </View>
              <TouchableOpacity onPress={toggleExpanded} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <View style={styles.messagesContainer}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
                ListFooterComponent={() =>
                  isBotTyping && (
                    <View style={styles.typingContainer}>
                      <View style={styles.miniAvatarContainer}>
                        <Text style={styles.miniAvatarText}>🤖</Text>
                      </View>
                      <View style={styles.typingBubble}>
                        <ActivityIndicator size="small" color="#A68B69" />
                        <Text style={styles.typingText}>Mira is typing...</Text>
                      </View>
                    </View>
                  )
                }
              />
            </View>

            {/* Quick Replies */}
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

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Ask me about mirrors..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => sendMessage()}
                multiline
              />
              <TouchableOpacity
                onPress={() => sendMessage()}
                disabled={loading || !inputText.trim()}
                style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
              >
                <Text style={styles.sendButtonText}>{loading ? '...' : '🚀'}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* Floating Robot Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [
              { translateX: dragPosition.x },
              { translateY: dragPosition.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.robotContainer,
            {
              transform: [{ translateY: robotBounce }],
            },
          ]}
        >
          <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
            {/* Robot Body */}
            <View style={styles.robotBody}>
              {/* Robot Head */}
              <View style={styles.robotHead}>
                {/* Eyes */}
                <View style={styles.robotEyes}>
                  <Animated.View
                    style={[
                      styles.robotEye,
                      { transform: [{ scaleY: robotEyeScale }] },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.robotEye,
                      { transform: [{ scaleY: robotEyeScale }] },
                    ]}
                  />
                </View>
                {/* Mouth */}
                <View style={styles.robotMouth} />
              </View>

              {/* Mirror reflection effect */}
              <View style={styles.mirrorReflection}>
                <Text style={styles.mirrorText}>🪞</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Floating Text */}
          <Animated.Text
            style={[
              styles.floatingText,
              {
                opacity: textOpacity,
                transform: [
                  {
                    translateX: textTranslateX, // Move from left to center
                  },
                ],
              },
            ]}
          >
            Hi I'm Mira! How can I help you?
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  floatingButton: {
    position: 'absolute',
    zIndex: 1000,
  },
  robotContainer: {
    position: 'relative',
  },
  robotBody: {
    width: 80,
    height: 80,
    backgroundColor: '#A68B69',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  robotHead: {
    width: 60,
    height: 60,
    backgroundColor: '#D4C4B0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  robotEyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 28,
    marginTop: -10,
  },
  robotEye: {
    width: 8,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  robotMouth: {
    width: 16,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 3,
    marginTop: 6,
  },
  mirrorReflection: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 26,
    height: 26,
    backgroundColor: '#fff',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A68B69',
  },
  mirrorText: {
    fontSize: 14,
  },
  chatWindow: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: screenWidth - 40,
    height: 500,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#A68B69',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRobot: {
    width: 35,
    height: 35,
    backgroundColor: '#D4C4B0',
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerRobotText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingBottom: 45,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  miniAvatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#A68B69',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 14,
  },
  messageBubble: {
    borderRadius: 12,
    padding: 12,
    maxWidth: '75%',
  },
  botMessageBubble: {
    backgroundColor: '#E8E8E8',
  },
  userMessageBubble: {
    backgroundColor: '#A68B69',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  botMessageText: {
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 12,
  },
  typingText: {
    marginLeft: 8,
    color: '#A68B69',
    fontSize: 12,
  },
  quickRepliesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F9F9F9',
    maxHeight: 35,
  },
  quickReplyButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 7,
    maxWidth: 140,
  },
  quickReplyText: {
    fontSize: 11,
    color: '#333',
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#A68B69',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
  },
  floatingText: {
    position: 'absolute',
    top: -40, // Position above the robot
    left: 0, // Start aligned to the left of the robot
    backgroundColor: 'rgba(166, 139, 105, 0.9)', // Semi-transparent Mirrora color
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 12,
    textAlign: 'center',
    zIndex: 1001,
  },
});