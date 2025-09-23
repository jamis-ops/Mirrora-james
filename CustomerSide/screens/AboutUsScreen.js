import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFirestore, doc, getDoc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../Backend/firebaseConfig';
import { useFonts, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';

const { width } = Dimensions.get('window');

const AboutUsScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({ LeagueSpartan_700Bold });
  const [currentView, setCurrentView] = useState('menu');
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Your Business Name',
    description:
      'We are a leading company dedicated to providing exceptional services and products to our valued customers. Our commitment to quality and innovation drives everything we do.',
    founded: '2020',
    location: 'City, Country',
    mission:
      'To deliver outstanding value through innovative solutions and exceptional customer service.',
    vision:
      'To be the leading provider in our industry, recognized for our commitment to excellence and sustainability.',
    aboutUs: '',
  });
  const [contactInfo, setContactInfo] = useState({
    telephone1: '',
    telephone2: '',
    email: '',
    supportEmail: '',
    location: '',
  });
  const [faqs, setFaqs] = useState([]);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [selectedContactMethod, setSelectedContactMethod] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessUnsubscribe = onSnapshot(
          doc(db, 'settings', 'businessInfo'),
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setBusinessInfo((prev) => ({
                ...prev,
                name: data.businessName || prev.name,
                description: data.description || prev.description,
                aboutUs: data.aboutUs || prev.aboutUs,
                founded: data.foundedYear || prev.founded,
                location: data.location || prev.location,
                mission: data.mission || prev.mission,
                vision: data.vision || prev.vision,
              }));
            }
          },
          (error) => {
            console.error('Error in businessInfo onSnapshot:', error);
          }
        );

        const contactUnsubscribe = onSnapshot(
          doc(db, 'settings', 'contactInfo'),
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setContactInfo((prev) => ({
                ...prev,
                telephone1: data.telephone1 || prev.telephone1,
                telephone2: data.telephone2 || prev.telephone2,
                email: data.email || prev.email,
                supportEmail: data.supportEmail || prev.supportEmail,
                location: data.location || prev.location,
              }));
            }
          },
          (error) => {
            console.error('Error in contactInfo onSnapshot:', error);
          }
        );

        const faqQuery = query(collection(db, 'faqs'), orderBy('order', 'asc'));
        const faqUnsubscribe = onSnapshot(
          faqQuery,
          (snapshot) => {
            const faqList = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (data.isVisible !== false) {
                faqList.push({ id: doc.id, ...data });
              }
            });
            setFaqs(faqList);
          },
          (error) => {
            console.error('Error in faqs onSnapshot:', error);
          }
        );

        return () => {
          businessUnsubscribe();
          contactUnsubscribe();
          faqUnsubscribe();
        };
      } catch (error) {
        console.error('Error setting up Firestore listeners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const handleContactMethodSelect = (method) => {
    setSelectedContactMethod(method);
  };

  const handleSendMessage = () => {
    if (!selectedContactMethod) {
      Alert.alert('Selection Required', 'Please select a contact method first.');
      return;
    }

    switch (selectedContactMethod) {
      case 'telephone1':
        if (contactInfo.telephone1) {
          Linking.openURL(`tel:${contactInfo.telephone1}`);
        } else {
          Alert.alert('Error', 'Telephone number is not available.');
        }
        break;
      case 'telephone2':
        if (contactInfo.telephone2) {
          Linking.openURL(`tel:${contactInfo.telephone2}`);
        } else {
          Alert.alert('Error', 'Contact number is not available.');
        }
        break;
      case 'email':
        if (contactInfo.email) {
          Linking.openURL(`mailto:${contactInfo.email}`);
        } else {
          Alert.alert('Error', 'General email is not available.');
        }
        break;
      case 'supportEmail':
        if (contactInfo.supportEmail) {
          Linking.openURL(`mailto:${contactInfo.supportEmail}`);
        } else {
          Alert.alert('Error', 'Support email is not available.');
        }
        break;
      default:
        Alert.alert('Error', 'Invalid contact method selected.');
    }
  };

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

  const BusinessInfoView = () => (
    <ScrollView style={styles.contentView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.businessHeader}>
          <View style={styles.businessLogo}>
            <FontAwesome5 name="building" size={40} color="#A68B69" />
          </View>
          <Text style={styles.companyName}>{businessInfo.name}</Text>
          <Text style={styles.companyTagline}>Excellence in every service</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#A68B69" />
            <Text style={styles.cardTitle}>About Us</Text>
          </View>
          <Text style={styles.description}>
            {businessInfo.aboutUs || businessInfo.description}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={24} color="#A68B69" />
            </View>
            <Text style={styles.statValue}>{businessInfo.founded}</Text>
            <Text style={styles.statLabel}>Founded</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="location" size={24} color="#A68B69" />
            </View>
            <Text style={styles.statValue}>{businessInfo.location.split(',')[0]}</Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
        </View>

        <View style={styles.missionVision}>
          <View style={styles.mvCard}>
            <View style={styles.mvHeader}>
              <Ionicons name="rocket" size={24} color="#A68B69" />
              <Text style={styles.mvTitle}>Our Mission</Text>
            </View>
            <Text style={styles.mvText}>{businessInfo.mission}</Text>
          </View>

          <View style={styles.mvCard}>
            <View style={styles.mvHeader}>
              <Ionicons name="eye" size={24} color="#A68B69" />
              <Text style={styles.mvTitle}>Our Vision</Text>
            </View>
            <Text style={styles.mvText}>{businessInfo.vision}</Text>
          </View>
        </View>

        <View style={styles.valuesContainer}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesList}>
            <View style={styles.valueItem}>
              <View style={styles.valueIcon}>
                <Ionicons name="heart" size={20} color="#A68B69" />
              </View>
              <Text style={styles.valueText}>Customer First</Text>
            </View>
            <View style={styles.valueItem}>
              <View style={styles.valueIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#A68B69" />
              </View>
              <Text style={styles.valueText}>Quality Assurance</Text>
            </View>
            <View style={styles.valueItem}>
              <View style={styles.valueIcon}>
                <Ionicons name="bulb" size={20} color="#A68B69" />
              </View>
              <Text style={styles.valueText}>Innovation</Text>
            </View>
            <View style={styles.valueItem}>
              <View style={styles.valueIcon}>
                <Ionicons name="people" size={20} color="#A68B69" />
              </View>
              <Text style={styles.valueText}>Teamwork</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const FAQView = () => (
    <ScrollView style={styles.contentView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.faqHeaderContainer}>
          <View style={styles.faqIconContainer}>
            <Ionicons name="help-circle" size={50} color="#A68B69" />
          </View>
          <Text style={styles.faqHeader}>Frequently Asked Questions</Text>
          <Text style={styles.faqSubheader}>
            Find answers to the most common questions about our services.
          </Text>
        </View>

        {faqs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={60} color="#CAC8C5" />
            <Text style={styles.emptyStateText}>No FAQs available at the moment</Text>
            <Text style={styles.emptyStateSubtext}>
              Please check back later or contact us directly for any questions.
            </Text>
          </View>
        ) : (
          <View style={styles.faqContainer}>
            {faqs.map((faq) => (
              <View key={faq.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(faq.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqQuestionContent}>
                    <Ionicons name="help" size={20} color="#A68B69" style={styles.faqQIcon} />
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  </View>
                  <Ionicons
                    name={openFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#A68B69"
                  />
                </TouchableOpacity>
                {openFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <View style={styles.faqAnswerContent}>
                      <Ionicons name="information-circle" size={20} color="#A68B69" style={styles.faqAIcon} />
                      <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.supportCta}>
          <Text style={styles.supportCtaText}>Still have questions?</Text>
          <Text style={styles.supportCtaSubtext}>
            We're here to help you with any questions you may have.
          </Text>
          <TouchableOpacity
            style={styles.supportCtaButton}
            onPress={() => setCurrentView('contact')}
          >
            <Text style={styles.supportCtaButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const ContactView = () => (
    <ScrollView style={styles.contentView} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.contactHeader}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="chatbubbles" size={50} color="#A68B69" />
          </View>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <Text style={styles.contactSubtitle}>
            We'd love to hear from you. Please select how you'd like to contact us.
          </Text>
        </View>

        <View style={styles.contactContainer}>
          <View style={styles.contactMethods}>
            <Text style={styles.contactMethodsTitle}>Contact Methods</Text>

            <TouchableOpacity
              style={[
                styles.contactMethod,
                selectedContactMethod === 'telephone1' && styles.selectedContactMethod,
              ]}
              onPress={() => handleContactMethodSelect('telephone1')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={24} color="#A68B69" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Primary Telephone</Text>
                <Text style={styles.contactValue}>
                  {contactInfo.telephone1 || '+1 (555) 123-4567'}
                </Text>
              </View>
              {selectedContactMethod === 'telephone1' && (
                <Ionicons name="checkmark-circle" size={24} color="#A68B69" />
              )}
            </TouchableOpacity>

            {contactInfo.telephone2 ? (
              <TouchableOpacity
                style={[
                  styles.contactMethod,
                  selectedContactMethod === 'telephone2' && styles.selectedContactMethod,
                ]}
                onPress={() => handleContactMethodSelect('telephone2')}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name="call" size={24} color="#A68B69" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Secondary Telephone</Text>
                  <Text style={styles.contactValue}>{contactInfo.telephone2}</Text>
                </View>
                {selectedContactMethod === 'telephone2' && (
                  <Ionicons name="checkmark-circle" size={24} color="#A68B69" />
                )}
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.contactMethod,
                selectedContactMethod === 'email' && styles.selectedContactMethod,
              ]}
              onPress={() => handleContactMethodSelect('email')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color="#A68B69" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>General Email</Text>
                <Text style={styles.contactValue}>
                  {contactInfo.email || 'info@yourbusiness.com'}
                </Text>
              </View>
              {selectedContactMethod === 'email' && (
                <Ionicons name="checkmark-circle" size={24} color="#A68B69" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactMethod,
                selectedContactMethod === 'supportEmail' && styles.selectedContactMethod,
              ]}
              onPress={() => handleContactMethodSelect('supportEmail')}
            >
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color="#A68B69" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Support Email</Text>
                <Text style={styles.contactValue}>
                  {contactInfo.supportEmail || 'support@yourbusiness.com'}
                </Text>
              </View>
              {selectedContactMethod === 'supportEmail' && (
                <Ionicons name="checkmark-circle" size={24} color="#A68B69" />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.contactButton,
              !selectedContactMethod && styles.contactButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!selectedContactMethod}
          >
            <Ionicons name="paper-plane" size={20} color="#FFFFFF" style={styles.contactButtonIcon} />
            <Text style={styles.contactButtonText}>
              {selectedContactMethod ? 'Contact Now' : 'Select a Contact Method'}
            </Text>
          </TouchableOpacity>

          <View style={styles.contactAdditionalInfo}>
            <Text style={styles.contactAdditionalTitle}>Business Hours</Text>
            <Text style={styles.contactAdditionalText}>
              Monday - Friday: 9:00 AM - 6:00 PM
            </Text>
            <Text style={styles.contactAdditionalText}>Saturday: 10:00 AM - 4:00 PM</Text>
            <Text style={styles.contactAdditionalText}>Sunday: Closed</Text>
          </View>
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

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#A68B69" />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                console.log('Back button pressed');
                console.log('Current view:', currentView);
                console.log('Navigation prop:', navigation);
                if (currentView === 'menu') {
                  if (navigation) {
                    navigation.goBack();
                  } else {
                    console.log('Navigation prop is undefined');
                  }
                } else {
                  setCurrentView('menu');
                  setSelectedContactMethod(null);
                }
              }}
            >
              <Icon name="chevron-left" size={32} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About Us</Text>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Cart')}
            >
              
            </TouchableOpacity>
          </View>
          {renderCurrentView()}
        </>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#FFF',
  },
  iconButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'LeagueSpartan_700Bold',
    fontSize: 22,
    color: '#000',
  },
  menuContainer: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A68B69',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: '#666666',
  },
  contentView: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  section: {
    padding: 16,
  },
  businessHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  businessLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'center',
  },
  companyTagline: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  missionVision: {
    marginBottom: 24,
  },
  mvCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mvHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mvTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 8,
  },
  mvText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  valuesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  valuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  valueItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  valueIcon: {
    marginRight: 8,
  },
  valueText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  faqHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  faqIconContainer: {
    marginBottom: 16,
  },
  faqHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  faqSubheader: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  faqContainer: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  faqQIcon: {
    marginRight: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  faqAnswer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
  },
  faqAnswerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  faqAIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  faqAnswerText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    flex: 1,
  },
  supportCta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  supportCtaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportCtaSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  supportCtaButton: {
    backgroundColor: '#A68B69',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  supportCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contactIconContainer: {
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  contactContainer: {
    marginBottom: 24,
  },
  contactMethods: {
    marginBottom: 24,
  },
  contactMethodsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedContactMethod: {
    borderWidth: 2,
    borderColor: '#A68B69',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A68B69',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contactButtonDisabled: {
    backgroundColor: '#CAC8C5',
  },
  contactButtonIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contactAdditionalInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactAdditionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  contactAdditionalText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
});

export default AboutUsScreen;