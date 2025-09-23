// screens/MessageScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const MessageScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState('Support');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [expoPushToken, setExpoPushToken] = useState('');

  // Simulate receiving messages when screen is focused
  useEffect(() => {
    if (isFocused) {
      checkForNewMessages();
    }

    // Simulate periodic message checks
    const messageInterval = setInterval(() => {
      if (Math.random() < 0.2) {
        simulateAdminMessage();
      }
    }, 30000);

    return () => clearInterval(messageInterval);
  }, [isFocused]);

  // Handle push notification permissions and listener
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          console.log('Push token:', token);
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        Alert.alert('Error', 'Failed to initialize notifications');
      }
    };

    setupNotifications();

    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        setHasUnreadMessages(true);
      }
    );

    return () => subscription.remove();
  }, []);

  // Request notification permissions
  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      Alert.alert('Error', 'Must use a physical device for push notifications');
      return null;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Failed to get push token for notifications');
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: 'your-project-id', // Replace with your Expo project ID
        })
      ).data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  };

  // Check for new messages (simulated)
  const checkForNewMessages = async () => {
    try {
      const hasNewMessages = Math.random() < 0.3;
      if (hasNewMessages) {
        setHasUnreadMessages(true);
        setLastMessage('We have a special offer for you!');
        await schedulePushNotification();
      } else {
        setHasUnreadMessages(false);
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  // Schedule a local push notification
  const schedulePushNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New message from Mirrora Philippines',
          body: 'You have a new message from our support team',
          data: { data: 'goes here' },
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Simulate receiving an admin message
  const simulateAdminMessage = async () => {
    const messages = [
      'Hello! We have a new collection available.',
      'Your order status has been updated.',
      'Special discount just for you!',
      'We noticed you were browsing our mirrors - need help?',
      'Thank you for being a valued customer!',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setHasUnreadMessages(true);
    setLastMessage(randomMessage);

    await schedulePushNotification();

    // Alert for demo purposes (remove in production)
    Alert.alert(
      'New Message',
      `You have a new message from Mirrora Philippines: "${randomMessage}"`,
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  // Navigate to chat screen and reset unread messages
  const handleSupportChat = () => {
    setHasUnreadMessages(false);
    navigation.navigate('ChatScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#A67B5B"
        translucent={false}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Container */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('Support')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'Support' && styles.activeTabText,
              ]}
            >
              Customer Support
            </Text>
            {activeTab === 'Support' && <View style={styles.activeTabUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {activeTab === 'Support' && (
            <TouchableOpacity
              style={styles.messageCard}
              onPress={handleSupportChat}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.supportAvatar}>
                  <Icon name="account-tie" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.onlineIndicator} />
                {hasUnreadMessages && <View style={styles.notificationBadge} />}
              </View>

              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={styles.senderName}>Mirrora Philippines</Text>
                  <View style={styles.onlineStatus}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Online</Text>
                  </View>
                </View>

                {hasUnreadMessages && lastMessage ? (
                  <View style={styles.unreadMessageContainer}>
                    <Text style={styles.unreadMessageText} numberOfLines={1}>
                      {lastMessage}
                    </Text>
                    <View style={styles.unreadIndicator} />
                  </View>
                ) : (
                  <Text style={styles.messagePreview}>
                    Send us a message for any inquiries
                  </Text>
                )}
              </View>

              <Icon name="chevron-right" size={20} color="#A67B5B" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#A67B5B',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? 20 : 15,
    backgroundColor: '#A67B5B',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#A67B5B',
    fontWeight: '600',
  },
  activeTabUnderline: {
    marginTop: 8,
    height: 3,
    width: '70%',
    backgroundColor: '#A67B5B',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(166, 123, 91, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  supportAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#A67B5B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C1810',
    flex: 1,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  onlineText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  messagePreview: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  unreadMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadMessageText: {
    fontSize: 14,
    color: '#2C1810',
    fontWeight: '600',
    flex: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A67B5B',
    marginLeft: 8,
  },
});

export default MessageScreen;