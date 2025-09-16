import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AboutUsScreen = ({ navigation }) => {
  const [currentView, setCurrentView] = useState('menu');

  const menuItems = [
    {
      id: 1,
      title: 'Business Information',
      icon: 'business-outline',
      onPress: () => setCurrentView('business'),
    },
    {
      id: 2,
      title: 'Frequently Asked Questions',
      icon: 'help-circle-outline',
      onPress: () => setCurrentView('faq'),
    },
    {
      id: 3,
      title: 'Contact Us',
      icon: 'mail-outline',
      onPress: () => setCurrentView('contact'),
    },
  ];

  const businessInfo = {
    name: 'Your Business Name',
    description: 'We are a leading company dedicated to providing exceptional services and products to our valued customers. Our commitment to quality and innovation drives everything we do.',
    founded: '2020',
    location: 'City, Country',
    employees: '50+',
    mission: 'To deliver outstanding value through innovative solutions and exceptional customer service.',
    vision: 'To be the leading provider in our industry, recognized for our commitment to excellence and sustainability.',
  };

  const faqData = [
    {
      id: 1,
      question: 'What services do you offer?',
      answer: 'We offer a comprehensive range of services including product development, consulting, and customer support to meet all your business needs.',
    },
    {
      id: 2,
      question: 'How can I contact customer support?',
      answer: 'You can reach our customer support team through email, phone, or our online chat system. We are available 24/7 to assist you.',
    },
    {
      id: 3,
      question: 'What are your business hours?',
      answer: 'Our business hours are Monday through Friday, 9:00 AM to 6:00 PM. However, our online services are available 24/7.',
    },
    {
      id: 4,
      question: 'Do you offer international shipping?',
      answer: 'Yes, we offer international shipping to most countries worldwide. Shipping costs and delivery times vary by location.',
    },
  ];

  const MenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={28} color="#A68B69" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.menuItemText}>{item.title}</Text>
          <Text style={styles.menuItemSubtext}>Learn more</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#CAC8C5" />
      </View>
    </TouchableOpacity>
  );

  const MenuView = () => (
    <View style={styles.menuContainer}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>About Us</Text>
        <Text style={styles.welcomeSubtitle}>
          Get to know more about our company, services, and how we can help you.
        </Text>
      </View>
      
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );

  const BusinessInfoView = () => {
    return (
      <ScrollView style={styles.contentView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.companyName}>{businessInfo.name}</Text>
            <Text style={styles.description}>{businessInfo.description}</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Founded</Text>
                <Text style={styles.infoValue}>{businessInfo.founded}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{businessInfo.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Team Size</Text>
                <Text style={styles.infoValue}>{businessInfo.employees}</Text>
              </View>
            </View>
            
            <View style={styles.missionVision}>
              <View style={styles.mvCard}>
                <Text style={styles.mvTitle}>Our Mission</Text>
                <Text style={styles.mvText}>{businessInfo.mission}</Text>
              </View>
              
              <View style={styles.mvCard}>
                <Text style={styles.mvTitle}>Our Vision</Text>
                <Text style={styles.mvText}>{businessInfo.vision}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const FAQView = () => {
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const toggleFAQ = (faqId) => {
      setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
    };

    return (
      <ScrollView style={styles.contentView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.faqHeader}>Frequently Asked Questions</Text>
          <Text style={styles.faqSubheader}>
            Find answers to the most common questions about our services.
          </Text>
          
          {faqData.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#A68B69"
                />
              </View>
              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const ContactView = () => (
    <ScrollView style={styles.contentView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <Text style={styles.contactSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </Text>
          
          <View style={styles.contactMethods}>
            <TouchableOpacity style={styles.contactMethod}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color="#A68B69" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>info@yourbusiness.com</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactMethod}>
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={24} color="#A68B69" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>+1 (555) 123-4567</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactMethod}>
              <View style={styles.contactIcon}>
                <Ionicons name="location" size={24} color="#A68B69" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Address</Text>
                <Text style={styles.contactValue}>123 Business Street, City, Country</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'business':
        return <BusinessInfoView />;
      case 'faq':
        return <FAQView />;
      case 'contact':
        return <ContactView />;
      default:
        return <MenuView />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentView === 'menu') {
              navigation?.goBack();
            } else {
              setCurrentView('menu');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#A68B69" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentView === 'menu' ? '' : 
            currentView === 'business' ? 'Business Information' :
            currentView === 'faq' ? 'FAQs' : 'Contact Us'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {renderCurrentView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A68B69',
  },
  placeholder: {
    width: 40,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A68B69',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0DAD6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: '#888',
  },
  contentView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#A68B69',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#E0DAD6',
    marginHorizontal: 4,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  missionVision: {
    gap: 16,
  },
  mvCard: {
    backgroundColor: '#CAC8C5',
    borderRadius: 12,
    padding: 16,
  },
  mvTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A68B69',
    marginBottom: 8,
  },
  mvText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  faqHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A68B69',
    textAlign: 'center',
    marginBottom: 8,
  },
  faqSubheader: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#E6E6E6',
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A68B69',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  contactMethods: {
    marginBottom: 30,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#E0DAD6',
    borderRadius: 12,
    marginBottom: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactButton: {
    backgroundColor: '#A68B69',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AboutUsScreen;