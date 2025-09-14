// screens/MessageScreen.js - Complete and corrected version
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MessageScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Support');

  const handleSupportChat = () => {
    navigation.navigate('ChatScreen');
  };

  const handleChatbotPress = () => {
    navigation.navigate('ChatbotScreen');
  };

  const handleHelpPress = (type) => {
    // Navigate to help sections or show more info
    console.log(`Help pressed: ${type}`);
    // You can navigate to specific help screens here
    // navigation.navigate('HelpAndSupportScreen', { section: type });
  };

  const handleFaqPress = (question) => {
    // Navigate to FAQ or show answer
    console.log(`FAQ pressed: ${question}`);
    // navigation.navigate('HelpAndSupportScreen', { faq: question });
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
            onPress={() => setActiveTab('Chatbot')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'Chatbot' && styles.activeTabText
            ]}>
              AI Assistant
            </Text>
            {activeTab === 'Chatbot' && <View style={styles.activeTabUnderline} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => setActiveTab('Support')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'Support' && styles.activeTabText
            ]}>
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
              </View>
              
              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={styles.senderName}>Mirrora Support</Text>
                  <View style={styles.onlineStatus}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Online</Text>
                  </View>
                </View>
                <Text style={styles.messagePreview}>
                  Hi! How can we help you today? Ask us about orders, products, or any questions you have.
                </Text>
                <Text style={styles.timeStamp}>Available now</Text>
              </View>
              
              <Icon name="chevron-right" size={20} color="#A67B5B" />
            </TouchableOpacity>
          )}
          
          {activeTab === 'Chatbot' && (
            <TouchableOpacity 
              style={styles.messageCard} 
              onPress={handleChatbotPress}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.chatbotAvatar}>
                  <Icon name="robot" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              
              <View style={styles.messageContent}>
                <View style={styles.messageHeader}>
                  <Text style={styles.senderName}>Mirrora AI</Text>
                  <View style={styles.onlineStatus}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Always Online</Text>
                  </View>
                </View>
                <Text style={styles.messagePreview}>
                  Hello! I'm your AI assistant. I can help you find the perfect mirror, answer questions, and provide recommendations.
                </Text>
                <Text style={styles.timeStamp}>Available 24/7</Text>
              </View>
              
              <Icon name="chevron-right" size={20} color="#A67B5B" />
            </TouchableOpacity>
          )}

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>How can we help?</Text>
            <Text style={styles.helpSubtitle}>Quick access to common topics</Text>
            <View style={styles.helpGrid}>
              <TouchableOpacity 
                style={styles.helpItem}
                onPress={() => handleHelpPress('orders')}
                activeOpacity={0.7}
              >
                <Icon name="package-variant" size={24} color="#A67B5B" />
                <Text style={styles.helpText}>Order Status</Text>
                <Text style={styles.helpSubText}>Track your orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.helpItem}
                onPress={() => handleHelpPress('shipping')}
                activeOpacity={0.7}
              >
                <Icon name="truck-delivery" size={24} color="#A67B5B" />
                <Text style={styles.helpText}>Shipping Info</Text>
                <Text style={styles.helpSubText}>Delivery details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.helpItem}
                onPress={() => handleHelpPress('payment')}
                activeOpacity={0.7}
              >
                <Icon name="credit-card" size={24} color="#A67B5B" />
                <Text style={styles.helpText}>Payment</Text>
                <Text style={styles.helpSubText}>Billing questions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.helpItem}
                onPress={() => handleHelpPress('installation')}
                activeOpacity={0.7}
              >
                <Icon name="wrench" size={24} color="#A67B5B" />
                <Text style={styles.helpText}>Installation</Text>
                <Text style={styles.helpSubText}>Setup assistance</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Preview */}
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            <Text style={styles.faqSubtitle}>Find quick answers to common questions</Text>
            
            <TouchableOpacity 
              style={styles.faqItem}
              onPress={() => handleFaqPress('shipping')}
              activeOpacity={0.7}
            >
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>How long does shipping take?</Text>
                <Text style={styles.faqPreview}>Standard delivery takes 3-5 business days...</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#A67B5B" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.faqItem}
              onPress={() => handleFaqPress('returns')}
              activeOpacity={0.7}
            >
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>Can I return or exchange my mirror?</Text>
                <Text style={styles.faqPreview}>Yes, we offer 30-day returns for most items...</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#A67B5B" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.faqItem}
              onPress={() => handleFaqPress('installation')}
              activeOpacity={0.7}
            >
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>Do you offer installation services?</Text>
                <Text style={styles.faqPreview}>Professional installation is available in select areas...</Text>
              </View>
              <Icon name="chevron-right" size={16} color="#A67B5B" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.faqViewAll}
              onPress={() => navigation.navigate('HelpAndSupportScreen')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All FAQs</Text>
              <Icon name="arrow-right" size={16} color="#A67B5B" />
            </TouchableOpacity>
          </View>
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
  chatbotAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5E3C',
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
    lineHeight: 20,
    marginBottom: 4,
  },
  timeStamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  helpSection: {
    marginTop: 8,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: 4,
  },
  helpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  helpGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  helpItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(166, 123, 91, 0.2)',
  },
  helpText: {
    fontSize: 13,
    color: '#2C1810',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  helpSubText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  faqSection: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: 4,
  },
  faqSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqContent: {
    flex: 1,
    marginRight: 8,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  faqPreview: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  faqViewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(166, 123, 91, 0.2)',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A67B5B',
    marginRight: 8,
  },
});

export default MessageScreen;