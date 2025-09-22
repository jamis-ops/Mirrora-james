// screens/CustomOrderCheckoutScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { db, auth } from '../Backend/firebaseConfig';
import { doc, getDoc, collection, addDoc, Timestamp, getDocs, updateDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const CustomOrderCheckoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { proposalData, threadId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [showFullNotes, setShowFullNotes] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showCustomerNotesModal, setShowCustomerNotesModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Authentication Error", "Please log in to place an order.");
        setLoading(false);
        return;
      }

      // Create order data with proper structure
      const orderData = {
        userId: user.uid,
        userID: user.uid, // For compatibility
        type: 'custom',
        customizationDetails: proposalData.customizationDetails,
        proposalData: {
          price: proposalData.price,
          timeline: proposalData.timeline,
          downPayment: proposalData.downPayment,
          paymentTerms: proposalData.paymentTerms,
          notes: proposalData.notes
        },
        customerNotes: customerNotes.trim(),
        orderId: proposalData.orderId,
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date()),
        total: parseFloat(proposalData.price),
        downPaymentAmount: proposalData.downPayment ? 
          parseFloat(proposalData.downPayment) : 
          Math.round(parseFloat(proposalData.price) * 0.5),
      };

      // Add to orders collection
      const ordersRef = collection(db, 'orders');
      await addDoc(ordersRef, orderData);

      // Update the chat message to mark as processed
      const chatThreadRef = doc(db, `artifacts/mirrora-app/public/data/chats/${threadId}`);
      const messagesRef = collection(chatThreadRef, 'messages');
      
      const messagesSnapshot = await getDocs(messagesRef);
      messagesSnapshot.forEach(async (messageDoc) => {
        const messageData = messageDoc.data();
        if (messageData.proposalData && messageData.proposalData.orderId === proposalData.orderId) {
          await updateDoc(messageDoc.ref, {
            'proposalData.status': 'order_created',
            'proposalData.canProceedToCheckout': false
          });
        }
      });

      // Also update the custom order in the customOrders collection
      const customOrdersRef = collection(db, `artifacts/mirrora-app/public/data/customOrders`);
      const customOrdersSnapshot = await getDocs(customOrdersRef);
      customOrdersSnapshot.forEach(async (orderDoc) => {
        const orderData = orderDoc.data();
        if (orderData.orderId === proposalData.orderId) {
          await updateDoc(orderDoc.ref, {
            status: 'order_created',
            lastUpdated: Timestamp.fromDate(new Date())
          });
        }
      });

      Alert.alert(
        "Order Created Successfully!",
        `Your custom order #${proposalData.orderId} has been created and will appear in your orders.`,
        [
          {
            text: "View My Orders",
            onPress: () => navigation.navigate('MyOrderScreen')
          }
        ]
      );

    } catch (error) {
      console.error("Error creating order: ", error);
      Alert.alert("Error", "Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Full Screen Notes Modal (for seller notes)
  const FullScreenNotesModal = () => (
    <Modal
      visible={showFullNotes}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFullNotes(false)}
    >
      <View style={styles.fullScreenModal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setShowFullNotes(false)}
            style={styles.modalCloseButton}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Seller Notes</Text>
          <View style={styles.modalHeaderRight} />
        </View>
        
        <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
          <View style={styles.fullNotesContainer}>
            <View style={styles.fullNotesHeader}>
              <Icon name="store" size={24} color="#A67B5B" />
              <Text style={styles.fullNotesTitle}>Order Details & Instructions</Text>
            </View>
            
            <View style={styles.fullNotesContent}>
              {proposalData.notes.includes('•') || proposalData.notes.includes('-') || proposalData.notes.includes('\n') ? (
                proposalData.notes.split(/[\n•-]/).filter(item => item.trim()).map((item, index) => (
                  <View key={index} style={styles.fullNoteItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.fullNoteText}>{item.trim()}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.fullNotesText}>{proposalData.notes}</Text>
              )}
            </View>
            
            <View style={styles.fullNotesFooter}>
              <View style={styles.notesMetadata}>
                <Icon name="clock-outline" size={16} color="#999" />
                <Text style={styles.metadataText}>From: Mirrora Team</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const InfoCard = ({ icon, title, children, gradient = false }) => (
    <View style={[styles.card, gradient && styles.gradientCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Icon name={icon} size={24} color={gradient ? "#fff" : "#A67B5B"} />
        </View>
        <Text style={[styles.cardTitle, gradient && styles.gradientCardTitle]}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const SummaryRow = ({ label, value, highlight = false, gradient = false }) => (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryLabel, gradient && styles.gradientText]}>{label}</Text>
      <Text style={[
        styles.summaryValue, 
        highlight && styles.highlightValue,
        gradient && styles.gradientText
      ]}>{value}</Text>
    </View>
  );

  // Enhanced Notes Component with Interactive Features
  const NotesSection = ({ notes }) => {
    const maxLines = 3;
    const isLongText = notes && notes.length > 150;
    
    const toggleNotes = () => {
      setNotesExpanded(!notesExpanded);
    };

    const openFullNotes = () => {
      setShowFullNotes(true);
    };

    const formatNotes = (text) => {
      // Split notes into sections if they contain bullet points or line breaks
      if (text.includes('•') || text.includes('-') || text.includes('\n')) {
        return text.split(/[\n•-]/).filter(item => item.trim()).map((item, index) => (
          <View key={index} style={styles.noteItem}>
            <Icon name="circle-small" size={16} color="#A67B5B" />
            <Text style={styles.noteItemText}>{item.trim()}</Text>
          </View>
        ));
      }
      return <Text style={styles.notesText}>{text}</Text>;
    };

    return (
      <InfoCard icon="note-text" title="Additional Notes">
        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <Icon name="information" size={20} color="#A67B5B" />
            <Text style={styles.notesHeaderText}>Important Details</Text>
            {isLongText && (
              <TouchableOpacity onPress={toggleNotes} style={styles.expandButton}>
                <Icon 
                  name={notesExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#A67B5B" 
                />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.notesContentContainer}>
            <View style={[
              styles.notesContent,
              !notesExpanded && isLongText && styles.collapsedNotes
            ]}>
              {formatNotes(notes)}
            </View>
            
            {!notesExpanded && isLongText && (
              <View style={styles.fadeOverlay}>
                <TouchableOpacity onPress={toggleNotes} style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>Read More</Text>
                  <Icon name="chevron-down" size={16} color="#A67B5B" />
                </TouchableOpacity>
              </View>
            )}
            
            {notesExpanded && isLongText && (
              <TouchableOpacity onPress={toggleNotes} style={styles.collapseButton}>
                <Text style={styles.collapseText}>Show Less</Text>
                <Icon name="chevron-up" size={16} color="#A67B5B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons for Notes */}
          <View style={styles.notesActions}>
            <TouchableOpacity onPress={openFullNotes} style={styles.notesActionButton}>
              <Icon name="fullscreen" size={16} color="#666" />
              <Text style={styles.notesActionText}>View Full Screen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                // Copy to clipboard functionality would go here
                Alert.alert("Notes Copied", "Additional notes copied to clipboard");
              }} 
              style={styles.notesActionButton}
            >
              <Icon name="content-copy" size={16} color="#666" />
              <Text style={styles.notesActionText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </InfoCard>
    );
  };

  // Customer Notes Component with Full Functionality
  const CustomerNotesSection = () => {
    const saveCustomerNotes = () => {
      setIsEditingNotes(false);
      Alert.alert("Notes Saved", "Your additional notes have been saved successfully.");
    };

    const openNotesEditor = () => {
      setShowCustomerNotesModal(true);
    };

    return (
      <InfoCard icon="account-edit" title="Your Additional Notes">
        <View style={styles.customerNotesContainer}>
          <View style={styles.customerNotesHeader}>
            <Icon name="account" size={20} color="#4CAF50" />
            <Text style={styles.customerNotesHeaderText}>Add Your Requirements</Text>
            <TouchableOpacity onPress={openNotesEditor} style={styles.editNotesButton}>
              <Icon name={customerNotes ? "pencil" : "plus"} size={18} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          {customerNotes ? (
            <View style={styles.customerNotesContent}>
              <Text style={styles.customerNotesText}>
                {customerNotes.length > 100 ? `${customerNotes.substring(0, 100)}...` : customerNotes}
              </Text>
              {customerNotes.length > 100 && (
                <TouchableOpacity onPress={openNotesEditor} style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>View Full Notes</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.customerNotesActions}>
                <TouchableOpacity onPress={openNotesEditor} style={styles.customerActionButton}>
                  <Icon name="pencil" size={14} color="#4CAF50" />
                  <Text style={styles.customerActionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert(
                      "Clear Notes",
                      "Are you sure you want to clear your notes?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Clear", onPress: () => setCustomerNotes(''), style: "destructive" }
                      ]
                    );
                  }}
                  style={[styles.customerActionButton, styles.clearButton]}
                >
                  <Icon name="delete-outline" size={14} color="#FF5722" />
                  <Text style={[styles.customerActionText, styles.clearButtonText]}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyNotesState}>
              <Icon name="note-plus" size={32} color="#E0E0E0" />
              <Text style={styles.emptyNotesText}>No additional notes yet</Text>
              <Text style={styles.emptyNotesSubtext}>
                Add special instructions, delivery preferences, or any other requirements
              </Text>
              <TouchableOpacity onPress={openNotesEditor} style={styles.addNotesButton}>
                <Icon name="plus" size={16} color="#4CAF50" />
                <Text style={styles.addNotesButtonText}>Add Notes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </InfoCard>
    );
  };

  // Customer Notes Editor Modal
  const CustomerNotesModal = () => {
    const [tempNotes, setTempNotes] = useState(customerNotes);
    const characterLimit = 500;
    const remainingChars = characterLimit - tempNotes.length;

    const handleSave = () => {
      setCustomerNotes(tempNotes);
      setShowCustomerNotesModal(false);
      Alert.alert("Success", "Your notes have been saved!");
    };

    const handleCancel = () => {
      setTempNotes(customerNotes); // Reset to original
      setShowCustomerNotesModal(false);
    };

    const addQuickNote = (note) => {
      const newText = tempNotes ? `${tempNotes}\n• ${note}` : `• ${note}`;
      if (newText.length <= characterLimit) {
        setTempNotes(newText);
      }
    };

    return (
      <Modal
        visible={showCustomerNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView 
          style={styles.notesModalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.notesModalHeader}>
            <TouchableOpacity onPress={handleCancel} style={styles.modalCancelButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.notesModalTitle}>Additional Notes</Text>
            <TouchableOpacity onPress={handleSave} style={styles.modalSaveButton}>
              <Icon name="check" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.notesModalContent}>
            <View style={styles.notesEditorContainer}>
              <View style={styles.notesEditorHeader}>
                <Text style={styles.notesEditorTitle}>Your Requirements & Instructions</Text>
                <Text style={[
                  styles.characterCount, 
                  remainingChars < 50 && styles.characterCountWarning
                ]}>
                  {remainingChars} characters remaining
                </Text>
              </View>

              <TextInput
                style={styles.notesTextInput}
                value={tempNotes}
                onChangeText={(text) => text.length <= characterLimit && setTempNotes(text)}
                placeholder="Add any special instructions, delivery preferences, or requirements here..."
                multiline
                textAlignVertical="top"
                autoFocus
              />

              {/* Quick Add Buttons */}
              <View style={styles.quickNotesSection}>
                <Text style={styles.quickNotesTitle}>Quick Add:</Text>
                <View style={styles.quickNotesButtons}>
                  {[
                    "Rush delivery needed",
                    "Call before delivery", 
                    "Specific installation requirements",
                    "Gift wrapping requested",
                    "Delivery to different address"
                  ].map((note, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => addQuickNote(note)}
                      style={styles.quickNoteButton}
                    >
                      <Icon name="plus-circle" size={14} color="#4CAF50" />
                      <Text style={styles.quickNoteText}>{note}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview Section */}
              {tempNotes.length > 0 && (
                <View style={styles.notesPreviewSection}>
                  <Text style={styles.previewTitle}>Preview:</Text>
                  <View style={styles.notesPreviewContainer}>
                    <Text style={styles.notesPreviewText}>{tempNotes}</Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.notesModalActions}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Icon name="content-save" size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Save Notes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5E3C" />
      
      {/* Enhanced Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Custom Order</Text>
            <Text style={styles.headerSubtitle}>Review & Confirm</Text>
          </View>
          <View style={styles.orderBadge}>
            <Icon name="star" size={16} color="#FFD700" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order ID Banner */}
        <View style={styles.orderIdBanner}>
          <Icon name="clipboard-text" size={20} color="#A67B5B" />
          <Text style={styles.orderIdText}>Order #{proposalData.orderId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>PENDING</Text>
          </View>
        </View>

        {/* Product Summary Card */}
        <InfoCard icon="package-variant" title="Product Details">
          <SummaryRow 
            label="Product" 
            value={proposalData.customizationDetails.productInfo?.name || "Custom Mirror"} 
          />
          <SummaryRow 
            label="Dimensions" 
            value={`${proposalData.customizationDetails.dimensions?.height} × ${proposalData.customizationDetails.dimensions?.width} cm`}
          />
          <SummaryRow 
            label="Frame Style" 
            value={`${proposalData.customizationDetails.frameStyle} - ${proposalData.customizationDetails.frameColor}`}
          />
          <SummaryRow 
            label="Mirror Type" 
            value={proposalData.customizationDetails.mirrorType || "Standard"}
          />
        </InfoCard>

        {/* Pricing Card with Gradient */}
        <InfoCard icon="currency-php" title="Pricing Details" gradient={true}>
          <SummaryRow 
            label="Total Price" 
            value={`₱${parseFloat(proposalData.price).toLocaleString()}`}
            highlight={true}
            gradient={true}
          />
          {proposalData.downPayment && (
            <SummaryRow 
              label="Down Payment" 
              value={`₱${parseFloat(proposalData.downPayment).toLocaleString()}`}
              gradient={true}
            />
          )}
          <SummaryRow 
            label="Estimated Timeline" 
            value={proposalData.timeline}
            gradient={true}
          />
          {proposalData.paymentTerms && (
            <SummaryRow 
              label="Payment Terms" 
              value={proposalData.paymentTerms}
              gradient={true}
            />
          )}
        </InfoCard>

        {/* Enhanced Seller Notes Section */}
        {proposalData.notes && (
          <NotesSection notes={proposalData.notes} />
        )}

        {/* Customer Additional Notes Section */}
        <CustomerNotesSection />

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Order Summary</Text>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Subtotal</Text>
            <Text style={styles.summaryLineValue}>₱{parseFloat(proposalData.price).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Customization Fee</Text>
            <Text style={styles.summaryLineValue}>Included</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₱{parseFloat(proposalData.price).toLocaleString()}</Text>
          </View>
        </View>

        {/* Safety margin for bottom button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Enhanced Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Amount to Pay Now</Text>
            <Text style={styles.paymentAmount}>
              ₱{(proposalData.downPayment || Math.round(parseFloat(proposalData.price) * 0.5)).toLocaleString()}
            </Text>
            <Text style={styles.paymentNote}>
              {proposalData.downPayment ? 'Down payment required' : '50% deposit required'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.confirmButton, loading && styles.disabledButton]}
            onPress={handlePlaceOrder}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="shield-check" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Screen Notes Modal */}
      {showFullNotes && <FullScreenNotesModal />}
      
      {/* Customer Notes Editor Modal */}
      {showCustomerNotesModal && <CustomerNotesModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#A67B5B',
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  orderBadge: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  orderIdBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderIdText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientCard: {
    backgroundColor: '#A67B5B',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(166, 139, 105, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gradientCardTitle: {
    color: '#fff',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  gradientText: {
    color: '#fff',
  },
  notesContainer: {
    backgroundColor: 'rgba(166, 139, 105, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(166, 139, 105, 0.2)',
    overflow: 'hidden',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(166, 139, 105, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(166, 139, 105, 0.2)',
  },
  notesHeaderText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#A67B5B',
  },
  expandButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(166, 139, 105, 0.1)',
  },
  notesContentContainer: {
    position: 'relative',
  },
  notesContent: {
    padding: 16,
  },
  collapsedNotes: {
    maxHeight: 80,
    overflow: 'hidden',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(248, 249, 250, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#A67B5B',
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  readMoreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(166, 139, 105, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(166, 139, 105, 0.2)',
  },
  collapseText: {
    fontSize: 14,
    color: '#A67B5B',
    fontWeight: '600',
    marginRight: 4,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteItemText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginLeft: 4,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(166, 139, 105, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(166, 139, 105, 0.1)',
  },
  notesActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(166, 139, 105, 0.2)',
  },
  notesActionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  // Full Screen Modal Styles
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#A67B5B',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
  },
  fullNotesContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  fullNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(166, 139, 105, 0.2)',
  },
  fullNotesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A67B5B',
    marginLeft: 12,
  },
  fullNotesContent: {
    marginBottom: 20,
  },
  fullNoteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingLeft: 8,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A67B5B',
    marginTop: 6,
    marginRight: 12,
  },
  fullNoteText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  fullNotesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  fullNotesFooter: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(166, 139, 105, 0.2)',
  },
  notesMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  
  // Customer Notes Styles
  customerNotesContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    overflow: 'hidden',
  },
  customerNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(76, 175, 80, 0.2)',
  },
  customerNotesHeaderText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  editNotesButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  customerNotesContent: {
    padding: 16,
  },
  customerNotesText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    marginBottom: 12,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  customerNotesActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.1)',
  },
  customerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },

    customerActionText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    borderColor: 'rgba(255, 87, 34, 0.2)',
  },
  clearButtonText: {
    color: '#FF5722',
  },
  emptyNotesState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyNotesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyNotesSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  addNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addNotesButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },

  // Customer Notes Modal Styles
  notesModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  notesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
  },
  modalCancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesModalContent: {
    flex: 1,
  },
  notesEditorContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  notesEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  notesEditorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },
  characterCountWarning: {
    color: '#FF5722',
    fontWeight: '600',
  },
  notesTextInput: {
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  quickNotesSection: {
    marginTop: 20,
  },
  quickNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  quickNotesButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  quickNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  quickNoteText: {
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 8,
    fontWeight: '500',
  },
  notesPreviewSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.2)',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  notesPreviewContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  notesPreviewText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  notesModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    flex: 0.4,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 0.55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#A67B5B',
  },
  summaryCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A67B5B',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLineLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryLineValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(166, 139, 105, 0.1)',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A67B5B',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A67B5B',
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomBarContent: {
    alignItems: 'center',
  },
  paymentInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A67B5B',
    marginBottom: 4,
  },
  paymentNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#A67B5B',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: width * 0.8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CustomOrderCheckoutScreen;