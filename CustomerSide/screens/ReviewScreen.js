import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { db, auth } from '../Backend/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// Define the color palette
const colors = {
  primaryBrown: '#A68B69',
  veryLightGray: '#F9F9F9',
  softBeige: '#E0DAD6',
  neutralGray: '#CAC8C5',
  lightGray: '#E6E6E6',
  white: '#FFFFFF',
  starGold: '#FFD700',
  successGreen: '#10B981',
  disabledGray: '#9CA3AF',
  headerBlue: '#6366F1',
  subtitleColor: '#C7D2FE',
  labelColor: '#374151',
  placeholderColor: '#9CA3AF',
  borderColor: '#E5E7EB',
};

// Star component for rating
const Star = ({ filled, onPress, size = 30 }) => (
  <TouchableOpacity onPress={onPress} style={styles.starButton}>
    <Text style={[styles.star, { fontSize: size, color: filled ? colors.starGold : colors.lightGray }]}>
      ★
    </Text>
  </TouchableOpacity>
);

// Success screen component
const SuccessScreen = ({ onReset }) => (
  <View style={styles.successContainer}>
    <View style={styles.successCard}>
      <View style={styles.successIconContainer}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Thank You!</Text>
      <Text style={styles.successSubtitle}>Your review has been submitted successfully.</Text>
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Write Another Review</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const ReviewScreen = ({ route, navigation }) => {
  const { orderId, items, orderData } = route.params || {};
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [name, setName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  useEffect(() => {
    const checkIfAlreadyReviewed = async () => {
      const user = auth.currentUser;
      if (!user || !orderId) return;

      try {
        // Check if user has already reviewed this order
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('userId', '==', user.uid),
          where('orderId', '==', orderId)
        );
        
        const querySnapshot = await getDocs(reviewsQuery);
        
        if (!querySnapshot.empty) {
          setHasAlreadyReviewed(true);
          Alert.alert(
            "Already Reviewed",
            "You have already submitted a review for this order.",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack()
              }
            ]
          );
        }
      } catch (error) {
        console.error("Error checking existing reviews:", error);
      }
    };

    checkIfAlreadyReviewed();
  }, [orderId, navigation]);

  const handleStarPress = (starValue) => {
    setRating(starValue);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }
    if (!review.trim()) {
      Alert.alert('Review Required', 'Please write a review.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'Please sign in to submit a review.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check again to prevent race condition
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', user.uid),
        where('orderId', '==', orderId)
      );
      
      const querySnapshot = await getDocs(reviewsQuery);
      
      if (!querySnapshot.empty) {
        Alert.alert(
          "Already Reviewed",
          "You have already submitted a review for this order.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
        return;
      }

      // Generate avatar initials from name
      const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      
      // Save review to Firestore
      await addDoc(collection(db, 'reviews'), {
        userName: name.trim(),
        rating: rating,
        comment: review.trim(),
        date: serverTimestamp(),
        isVisible: true,
        avatar: avatar,
        userId: user.uid, // Store user ID
        orderId: orderId || null,
        productInfo: items ? items[0] : null,
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      setIsSubmitted(true);
      
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setReview('');
    setName('');
    setIsSubmitted(false);
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return 'Poor - Not satisfied';
      case 2:
        return 'Fair - Below expectations';
      case 3:
        return 'Good - Met expectations';
      case 4:
        return 'Very Good - Exceeded expectations';
      case 5:
        return 'Excellent - Outstanding!';
      default:
        return 'Please select a rating';
    }
  };

  if (hasAlreadyReviewed) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.softBeige} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Already Reviewed</Text>
          <Text style={styles.headerSubtitle}>You've already reviewed this order</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.alreadyReviewedContainer}>
            <Text style={styles.alreadyReviewedText}>
              You have already submitted a review for this order. Thank you for your feedback!
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Back to Orders</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (isSubmitted) {
    return <SuccessScreen onReset={resetForm} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.softBeige} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
        <Text style={styles.headerSubtitle}>Share your thoughts about your order</Text>
        {orderId && (
          <Text style={styles.orderInfo}>Order #{orderId.substring(0, 8)}</Text>
        )}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Your Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.neutralGray}
            />
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Rate Your Order</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                filled={star <= rating}
                onPress={() => handleStarPress(star)}
                size={35}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
        </View>

        {/* Review Text Area */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Write Your Review</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={review}
              onChangeText={setReview}
              placeholder="Tell us about your experience... What did you love? What could be improved?"
              placeholderTextColor={colors.placeholderColor}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>{review.length}/500 characters</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || !review.trim() || !name.trim() || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || !review.trim() || !name.trim() || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Submitting...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Your Review Matters</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.infoIconText}>★</Text>
              </View>
              <Text style={styles.infoText}>Help other customers make informed decisions</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.infoIconText}>👤</Text>
              </View>
              <Text style={styles.infoText}>Share your authentic experience</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={[styles.infoIcon, { backgroundColor: '#E9D5FF' }]}>
                <Text style={styles.infoIconText}>📧</Text>
              </View>
              <Text style={styles.infoText}>Help us improve our service</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.veryLightGray,
  },
  header: {
    backgroundColor: colors.primaryBrown,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.subtitleColor,
    textAlign: 'center',
    marginBottom: 8,
  },
  orderInfo: {
    fontSize: 14,
    color: colors.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.labelColor,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    color: colors.labelColor,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starButton: {
    marginRight: 8,
    padding: 4,
  },
  star: {
    fontWeight: 'bold',
  },
  ratingText: {
    fontSize: 14,
    color: colors.neutralGray,
    fontStyle: 'italic',
  },
  textAreaContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: 16,
    minHeight: 120,
  },
  textArea: {
    fontSize: 16,
    color: colors.labelColor,
  },
  characterCount: {
    fontSize: 12,
    color: colors.neutralGray,
    textAlign: 'right',
    paddingRight: 16,
    paddingBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.primaryBrown,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primaryBrown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabledGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.labelColor,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoGrid: {},
  infoItem: {
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoIconText: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 14,
    color: colors.neutralGray,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.veryLightGray,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    fontSize: 32,
    color: colors.white,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.labelColor,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.neutralGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: colors.primaryBrown,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  alreadyReviewedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  alreadyReviewedText: {
    fontSize: 16,
    color: colors.neutralGray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  backButton: {
    backgroundColor: colors.primaryBrown,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewScreen;