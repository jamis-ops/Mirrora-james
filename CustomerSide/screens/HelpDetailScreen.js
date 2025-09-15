// screens/HelpDetailScreen.js - Complete Help Detail Screen with PHP currency and correct payment methods
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HelpDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { section, faq } = route.params || {};

  const getHelpContent = () => {
    if (faq) {
      return getFAQContent(faq);
    }

    switch (section) {
      case 'orders':
        return {
          title: 'Order Status',
          icon: 'package-variant',
          content: [
            {
              title: 'Track Your Order',
              text: 'You can track your order status in real-time using your order confirmation email or by logging into your account.',
              steps: [
                'Go to "My Orders" in your account',
                'Find your order using order number',
                'View real-time tracking information',
                'Get estimated delivery date'
              ]
            },
            {
              title: 'Order Status Meanings',
              text: 'Understanding what each status means:',
              steps: [
                'Processing: Your order is being prepared',
                'Shipped: Your order is on its way',
                'Out for Delivery: Your order will arrive today',
                'Delivered: Your order has been completed'
              ]
            },
            {
              title: 'Need Help?',
              text: 'If you have issues with your order status, our support team is here to help.',
              action: {
                text: 'Contact Support',
                onPress: () => navigation.navigate('ChatScreen')
              }
            }
          ]
        };

      case 'shipping':
        return {
          title: 'Shipping Information',
          icon: 'truck-delivery',
          content: [
            {
              title: 'Shipping Options',
              text: 'We offer several shipping options to meet your needs:',
              steps: [
                'Standard Shipping: 3-5 business days',
                'Express Shipping: 1-2 business days',
                'Overnight Shipping: Next business day',
                'White Glove Delivery: Scheduled installation'
              ]
            },
            {
              title: 'Shipping Costs',
              text: 'Shipping costs vary based on location and mirror size:',
              steps: [
                'Standard mirrors: ₱800-1,200',
                'Large mirrors (over 36"): ₱1,800-2,500',
                'Custom mirrors: Calculated at checkout',
                'Free shipping on orders over ₱10,000'
              ]
            },
            {
              title: 'International Shipping',
              text: 'We currently ship to select international locations. Contact us for availability and pricing.',
              action: {
                text: 'Check International Shipping',
                onPress: () => navigation.navigate('ChatScreen')
              }
            }
          ]
        };

      case 'payment':
        return {
          title: 'Payment Information',
          icon: 'credit-card',
          content: [
            {
              title: 'Payment Process',
              text: 'Mirrora uses a split payment system for your convenience and security:',
              steps: [
                '50% down payment via bank transfer upon order confirmation',
                'Remaining 50% payment upon product delivery',
                'Bank transfer details will be provided after order placement',
                'Payment confirmation required before processing'
              ]
            },
            {
              title: 'Bank Transfer Information',
              text: 'For the 50% down payment, we accept bank transfers to:',
              steps: [
                'BPI, BDO, Metrobank, and other major Philippine banks',
                'Bank details will be sent via email after order',
                'Please use your order number as reference',
                'Send payment proof via email or chat support'
              ]
            },
            {
              title: 'Final Payment',
              text: 'The remaining balance is collected upon delivery:',
              steps: [
                'Cash payment to delivery personnel',
                'Bank transfer before delivery (if preferred)',
                'Payment must be completed before installation',
                'Official receipt provided upon full payment'
              ]
            },
            {
              title: 'Payment Security',
              text: 'Your payment is secure with our trusted process:',
              steps: [
                'Official bank account details only',
                'Payment confirmation via email',
                'Order tracking with payment status',
                'Full refund policy if order is cancelled'
              ]
            },
            {
              title: 'Payment Issues',
              text: 'Having trouble with your payment? We can help resolve payment questions quickly.',
              action: {
                text: 'Get Payment Help',
                onPress: () => navigation.navigate('ChatScreen')
              }
            }
          ]
        };

      case 'installation':
        return {
          title: 'Installation Services',
          icon: 'wrench',
          content: [
            {
              title: 'Professional Installation',
              text: 'Our certified installers ensure your mirror is mounted safely and securely:',
              steps: [
                'Available in most major cities',
                'Includes mounting hardware',
                'Wall type assessment',
                'Clean-up after installation',
                '1-year installation warranty'
              ]
            },
            {
              title: 'DIY Installation',
              text: 'Prefer to install yourself? We provide everything you need:',
              steps: [
                'Detailed installation guide',
                'All necessary mounting hardware',
                'Template for precise placement',
                'Video tutorials available',
                'Customer support via chat/phone'
              ]
            },
            {
              title: 'Installation Pricing',
              text: 'Professional installation pricing:',
              steps: [
                'Standard mirrors: ₱3,800-5,000',
                'Large mirrors (over 36"): ₱6,300-7,500',
                'Custom or heavy mirrors: ₱8,800-10,000',
                'Free installation on orders over ₱25,000'
              ]
            },
            {
              title: 'Schedule Installation',
              text: 'Ready to schedule your professional installation?',
              action: {
                text: 'Schedule Installation',
                onPress: () => navigation.navigate('ChatScreen')
              }
            }
          ]
        };

      default:
        return {
          title: 'Help & Support',
          icon: 'help-circle',
          content: [
            {
              title: 'How can we help?',
              text: 'Choose from the topics below or contact our support team directly.',
            }
          ]
        };
    }
  };

  const getFAQContent = (faqType) => {
    switch (faqType) {
      case 'shipping':
        return {
          title: 'Shipping FAQ',
          icon: 'truck-delivery',
          content: [
            {
              title: 'How long does shipping take?',
              text: 'Shipping times depend on your location and the shipping method selected:',
              steps: [
                'Standard Shipping: 3-5 business days',
                'Express Shipping: 1-2 business days',
                'Overnight Shipping: Next business day (excluding weekends)',
                'Processing time: 1-2 business days before shipping'
              ]
            },
            {
              title: 'Do you ship internationally?',
              text: 'Yes, we offer international shipping to select countries. Shipping times and costs vary by destination.',
            },
            {
              title: 'Can I change my shipping address?',
              text: 'You can change your shipping address before your order ships. Contact us immediately if you need to make changes.',
              action: {
                text: 'Contact Support',
                onPress: () => navigation.navigate('ChatScreen')
              }
            }
          ]
        };

      case 'returns':
        return {
          title: 'Returns & Exchanges',
          icon: 'keyboard-return',
          content: [
            {
              title: 'Can I return or exchange my mirror?',
              text: 'Yes, we offer a 30-day return policy for most items:',
              steps: [
                'Items must be in original condition',
                'Original packaging required',
                'Return shipping label provided',
                'Refund processed within 5-7 business days'
              ]
            },
            {
              title: 'Custom Mirror Returns',
              text: 'Custom mirrors can only be returned if they arrive damaged or defective. We stand behind the quality of all our products.',
            },
            {
              title: 'How to start a return',
              text: 'Starting your return is easy:',
              steps: [
                'Contact our support team',
                'Provide your order number',
                'Receive return instructions',
                'Print prepaid return label',
                'Package and ship back to us'
              ],
              action: {
                text: 'Start Return Process',
                onPress: () => navigation.navigate('ChatScreen')
              }
            }
          ]
        };

      case 'installation':
        return {
          title: 'Installation FAQ',
          icon: 'wrench',
          content: [
            {
              title: 'Do you offer installation services?',
              text: 'Yes, professional installation is available in select areas:',
              steps: [
                'Available in most major cities',
                'Certified and insured installers',
                'Includes all mounting hardware',
                'Clean-up after installation',
                '1-year installation warranty'
              ]
            },
            {
              title: 'What if I want to install it myself?',
              text: 'We provide everything you need for DIY installation:',
              steps: [
                'Detailed step-by-step guide',
                'All necessary mounting hardware',
                'Paper template for positioning',
                'Video tutorials available online',
                'Phone support during installation'
              ]
            },
            {
              title: 'What wall types do you install on?',
              text: 'Our installers work with all common wall types:',
              steps: [
                'Drywall with studs',
                'Brick and masonry',
                'Tile walls (bathroom/kitchen)',
                'Concrete walls',
                'Metal studs (commercial spaces)'
              ]
            }
          ]
        };

      default:
        return {
          title: 'FAQ',
          icon: 'frequently-asked-questions',
          content: [
            {
              title: 'Frequently Asked Questions',
              text: 'Find answers to common questions about our products and services.',
            }
          ]
        };
    }
  };

  const helpContent = getHelpContent();

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
          <Text style={styles.headerTitle}>{helpContent.title}</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ChatScreen')}
            style={styles.chatButton}
            activeOpacity={0.7}
          >
            <Icon name="message-text" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Icon name={helpContent.icon} size={32} color="#A67B5B" />
            </View>
            <Text style={styles.sectionTitle}>{helpContent.title}</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need to know about {helpContent.title.toLowerCase()}
            </Text>
          </View>

          {/* Content Sections */}
          {helpContent.content.map((item, index) => (
            <View key={index} style={styles.contentSection}>
              <Text style={styles.contentTitle}>{item.title}</Text>
              <Text style={styles.contentText}>{item.text}</Text>
              
              {item.steps && (
                <View style={styles.stepsList}>
                  {item.steps.map((step, stepIndex) => (
                    <View key={stepIndex} style={styles.stepItem}>
                      <View style={styles.stepBullet} />
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}

              {item.action && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={item.action.onPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>{item.action.text}</Text>
                  <Icon name="arrow-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Contact Support Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Still need help?</Text>
            <Text style={styles.contactSubtitle}>
              Our support team is here to help you with any questions
            </Text>
            
            <View style={styles.contactOptions}>
              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => navigation.navigate('ChatScreen')}
                activeOpacity={0.8}
              >
                <Icon name="message-text" size={24} color="#A67B5B" />
                <Text style={styles.contactOptionText}>Live Chat</Text>
                <Text style={styles.contactOptionSubtext}>Available now</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactOption}
                onPress={() => navigation.navigate('ChatbotScreen')}
                activeOpacity={0.8}
              >
                <Icon name="robot" size={24} color="#A67B5B" />
                <Text style={styles.contactOptionText}>AI Assistant</Text>
                <Text style={styles.contactOptionSubtext}>24/7 support</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.faqButton}
              onPress={() => navigation.navigate('HelpAndSupportScreen')}
              activeOpacity={0.8}
            >
              <Text style={styles.faqButtonText}>View All FAQs</Text>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  chatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(166, 123, 91, 0.2)',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C1810',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C1810',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  stepsList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A67B5B',
    marginTop: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  stepText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A67B5B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C1810',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactOption: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(166, 123, 91, 0.2)',
  },
  contactOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C1810',
    marginTop: 8,
    marginBottom: 4,
  },
  contactOptionSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(166, 123, 91, 0.2)',
  },
  faqButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A67B5B',
    marginRight: 8,
  },
});

export default HelpDetailScreen;