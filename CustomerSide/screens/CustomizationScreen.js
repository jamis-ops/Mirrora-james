// screens/CustomizationScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

// Firebase imports
import { auth, db } from "../Backend/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";

// Font imports
import {
  useFonts as useLeagueSpartan,
  LeagueSpartan_700Bold,
} from "@expo-google-fonts/league-spartan";
import {
  useFonts as useMontserrat,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
} from "@expo-google-fonts/montserrat";

export default function CustomizationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params || {};

  const [formData, setFormData] = useState({
    dimensions: {
      height: "",
      width: "",
      depth: "",
    },
    frameStyle: "",
    frameColor: "",
    mirrorType: "Standard",
    mountingType: "Wall Mounted",
    additionalFeatures: [],
    specialInstructions: "",
    budget: "",
    deliveryDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load fonts
  const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
  const [montserratLoaded] = useMontserrat({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
  });

  // Frame styles options
  const frameStyles = [
    "Modern",
    "Classic",
    "Vintage",
    "Minimalist",
    "Ornate",
    "Industrial",
    "Rustic",
    "Contemporary"
  ];

  // Frame colors options
  const frameColors = [
    "Black",
    "White",
    "Gold",
    "Silver",
    "Brown",
    "Natural Wood",
    "Bronze",
    "Custom Color"
  ];

  // Mirror types
  const mirrorTypes = [
    "Standard",
    "Anti-fog",
    "LED Backlit",
    "Smart Mirror",
    "Tinted",
    "Beveled Edge"
  ];

  // Mounting types
  const mountingTypes = [
    "Wall Mounted",
    "Floor Standing",
    "Ceiling Mounted",
    "Freestanding"
  ];

  // Additional features
  const additionalFeatures = [
    "LED Lighting",
    "Bluetooth Speakers",
    "Heating Pad",
    "Touch Controls",
    "Motion Sensor",
    "USB Charging Port"
  ];

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      additionalFeatures: prev.additionalFeatures.includes(feature)
        ? prev.additionalFeatures.filter(f => f !== feature)
        : [...prev.additionalFeatures, feature]
    }));
  };

  const validateForm = () => {
    const { dimensions, frameStyle, frameColor, budget } = formData;
    
    if (!dimensions.height || !dimensions.width) {
      Alert.alert("Validation Error", "Please provide height and width dimensions.");
      return false;
    }
    
    if (!frameStyle) {
      Alert.alert("Validation Error", "Please select a frame style.");
      return false;
    }
    
    if (!frameColor) {
      Alert.alert("Validation Error", "Please select a frame color.");
      return false;
    }
    
    if (!budget) {
      Alert.alert("Validation Error", "Please provide your budget range.");
      return false;
    }
    
    return true;
  };

  const sendCustomizationToSeller = async () => {
    if (!validateForm()) return;

    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Authentication Required",
        text2: "Please sign in to submit customization request.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // App ID constant (same as in ChatScreen)
      const appId = 'mirrora-app';
      
      // Get user name
      const userName = user.displayName || user.email?.split('@')[0] || 'Customer';
      
      // TODO: Implement your seller assignment logic here
      // For now, using a placeholder or making it optional
      const sellerId = 'default_seller_id'; // Replace with actual logic
      
      // Format customization data for the chat message
      const customizationSummary = formatCustomizationSummary(formData, product);
      
      // Create seller chat thread reference
      const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}`);
      const messagesRef = collection(chatThreadRef, 'messages');

      // Update seller chat thread
      await setDoc(chatThreadRef, {
        lastMessage: `New customization request from ${userName}`,
        timestamp: serverTimestamp(),
        userName: userName,
        userAvatar: userName.substring(0, 2).toUpperCase(),
        isRead: false,
        hasCustomizationRequest: true,
      }, { merge: true });

      // Send customization message to seller
      await addDoc(messagesRef, {
        text: customizationSummary,
        timestamp: serverTimestamp(),
        senderId: user.uid,
        senderName: userName,
        senderAvatar: userName.substring(0, 2).toUpperCase(),
        messageType: 'customization_request',
        customizationData: {
          ...formData,
          productInfo: product,
          requestId: `custom_${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      });

      // Also save to a separate customization requests collection for easier management
      const customizationRequestsRef = collection(db, `artifacts/${appId}/public/data/customization_requests`);
      await addDoc(customizationRequestsRef, {
        customerId: user.uid,
        customerName: userName,
        sellerId: sellerId,
        productInfo: {
          id: product?.id || '',
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          imageUrl: product?.imageUrl || '',
        },
        customizationData: formData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Toast.show({
        type: "success",
        text1: "Customization Request Sent!",
        text2: "The seller will review your request and contact you soon.",
      });

      // Navigate back or to a confirmation screen
      navigation.goBack();

    } catch (error) {
      console.error("Error sending customization request:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to send customization request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCustomizationSummary = (data, productInfo) => {
    const { dimensions, frameStyle, frameColor, mirrorType, mountingType, additionalFeatures, specialInstructions, budget, deliveryDate } = data;
    
    return `🛠️ NEW CUSTOMIZATION REQUEST

📦 Product: ${productInfo?.name || 'Unknown Product'}
💰 Original Price: ₱${productInfo?.price || 0}

📏 DIMENSIONS:
• Height: ${dimensions.height}
• Width: ${dimensions.width}
${dimensions.depth ? `• Depth: ${dimensions.depth}` : ''}

🎨 SPECIFICATIONS:
• Frame Style: ${frameStyle}
• Frame Color: ${frameColor}
• Mirror Type: ${mirrorType}
• Mounting: ${mountingType}

${additionalFeatures.length > 0 ? `✨ ADDITIONAL FEATURES:
${additionalFeatures.map(feature => `• ${feature}`).join('\n')}` : ''}

💵 Budget Range: ₱${budget}
${deliveryDate ? `📅 Preferred Delivery: ${deliveryDate}` : ''}

${specialInstructions ? `📝 SPECIAL INSTRUCTIONS:
${specialInstructions}` : ''}

Please review this customization request and provide a quote with timeline.`;
  };

  const renderOptionSelector = (title, options, selectedValue, onSelect, field) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedValue === option && styles.selectedOption
            ]}
            onPress={() => onSelect(field, option)}
          >
            <Text style={[
              styles.optionText,
              selectedValue === option && styles.selectedOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFeatureSelector = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Additional Features (Optional)</Text>
      <View style={styles.optionsContainer}>
        {additionalFeatures.map((feature) => (
          <TouchableOpacity
            key={feature}
            style={[
              styles.optionButton,
              formData.additionalFeatures.includes(feature) && styles.selectedOption
            ]}
            onPress={() => toggleFeature(feature)}
          >
            <Text style={[
              styles.optionText,
              formData.additionalFeatures.includes(feature) && styles.selectedOptionText
            ]}>
              {feature}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (!leagueSpartanLoaded || !montserratLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#A68B69" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={30} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize {product?.name || 'Product'}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product?.name || 'Product'}</Text>
          <Text style={styles.productPrice}>Base Price: ₱{product?.price || 0}</Text>
        </View>

        {/* Dimensions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dimensions (Required)</Text>
          <View style={styles.dimensionsContainer}>
            <View style={styles.dimensionInput}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.dimensions.height}
                onChangeText={(value) => updateFormData('dimensions.height', value)}
                keyboardType="numeric"
                placeholder="e.g., 60"
              />
            </View>
            <View style={styles.dimensionInput}>
              <Text style={styles.inputLabel}>Width (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.dimensions.width}
                onChangeText={(value) => updateFormData('dimensions.width', value)}
                keyboardType="numeric"
                placeholder="e.g., 40"
              />
            </View>
            <View style={styles.dimensionInput}>
              <Text style={styles.inputLabel}>Depth (cm) - Optional</Text>
              <TextInput
                style={styles.textInput}
                value={formData.dimensions.depth}
                onChangeText={(value) => updateFormData('dimensions.depth', value)}
                keyboardType="numeric"
                placeholder="e.g., 3"
              />
            </View>
          </View>
        </View>

        {/* Frame Style */}
        {renderOptionSelector(
          "Frame Style (Required)",
          frameStyles,
          formData.frameStyle,
          updateFormData,
          'frameStyle'
        )}

        {/* Frame Color */}
        {renderOptionSelector(
          "Frame Color (Required)",
          frameColors,
          formData.frameColor,
          updateFormData,
          'frameColor'
        )}

        {/* Mirror Type */}
        {renderOptionSelector(
          "Mirror Type",
          mirrorTypes,
          formData.mirrorType,
          updateFormData,
          'mirrorType'
        )}

        {/* Mounting Type */}
        {renderOptionSelector(
          "Mounting Type",
          mountingTypes,
          formData.mountingType,
          updateFormData,
          'mountingType'
        )}

        {/* Additional Features */}
        {renderFeatureSelector()}

        {/* Budget */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Budget Range (Required)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.budget}
            onChangeText={(value) => updateFormData('budget', value)}
            placeholder="e.g., ₱5,000 - ₱10,000"
          />
        </View>

        {/* Preferred Delivery Date */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferred Delivery Date (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={formData.deliveryDate}
            onChangeText={(value) => updateFormData('deliveryDate', value)}
            placeholder="e.g., Within 2 weeks, By December 15, etc."
          />
        </View>

        {/* Special Instructions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.specialInstructions}
            onChangeText={(value) => updateFormData('specialInstructions', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Any special requirements, installation notes, or additional details..."
          />
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.continueButton, isSubmitting && styles.disabledButton]}
          onPress={sendCustomizationToSeller}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Send Customization Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7EC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#FFF7EC",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 18,
    marginLeft: 15,
    color: "#000",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productInfo: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontFamily: "LeagueSpartan_700Bold",
    fontSize: 18,
    color: "#000",
  },
  productPrice: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#A68B69",
    marginTop: 5,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#000",
    marginBottom: 12,
  },
  dimensionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  dimensionInput: {
    width: "48%",
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    fontFamily: "Montserrat_400Regular",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: "#A68B69",
    borderColor: "#A68B69",
  },
  optionText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: "#555",
  },
  selectedOptionText: {
    color: "#fff",
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  continueButton: {
    backgroundColor: "#A68B69",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  continueButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
});