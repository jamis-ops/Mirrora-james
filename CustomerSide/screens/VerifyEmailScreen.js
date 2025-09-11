import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions } from "react-native";
import { auth } from "../Backend/firebaseConfig";
import { sendEmailVerification } from "firebase/auth";

const { width } = Dimensions.get('window');

export default function VerifyEmailScreen({ navigation }) {
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResending, setIsResending] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  const user = auth.currentUser;
  const email = user?.email || "your@email.com";

  // Animations
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation for email icon
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resend email
  const handleResend = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      Alert.alert("Verification email resent!", `We sent a new email to ${email}`);
      setTimeLeft(300);
    } catch (error) {
      console.error("Error resending verification:", error.message);
      Alert.alert("Error", "Failed to resend verification email.");
    }
    setIsResending(false);
  };

  // Verify email status
  const handleVerify = async () => {
    if (!user) return;
    await user.reload(); // refresh from Firebase
    if (user.emailVerified) {
      Alert.alert("✅ Success", "Your email has been verified!");
      navigation.replace("SignIn"); // go to Sign In screen
    } else {
      Alert.alert("❌ Not Verified", "Please check your inbox and click the link.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Email Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.emailIcon}>
            <Text style={styles.emailIconText}>✉</Text>
          </View>
        </Animated.View>

        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>We've sent a verification link to</Text>
        
        <View style={styles.emailContainer}>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Timer with progress indicator */}
        <View style={styles.timerContainer}>
          <View style={styles.timerIconContainer}>
            <Text style={styles.timerIcon}>⏱</Text>
          </View>
          <Text style={styles.timer}>
            Link expires in <Text style={styles.timerHighlight}>{formatTime(timeLeft)}</Text>
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${(timeLeft / 300) * 100}%` }
            ]} 
          />
        </View>

        <TouchableOpacity 
          style={[styles.resendButton, isResending && styles.resendButtonDisabled]} 
          onPress={handleResend} 
          disabled={isResending}
        >
          <Text style={styles.resendText}>
            {isResending ? "Resending..." : "Didn't receive it? Resend"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyText}>I've Verified My Email</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Make sure to check your spam folder if you don't see it
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F23",
    overflow: "hidden",
  },
  backgroundCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 143, 0, 0.1)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 100,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(76, 175, 80, 0.08)",
  },
  backgroundCircle3: {
    position: "absolute",
    bottom: -120,
    right: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(33, 150, 243, 0.06)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  emailIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 143, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 143, 0, 0.3)",
  },
  emailIconText: {
    fontSize: 32,
    color: "#FF8F00",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#A0A0B0",
    marginBottom: 8,
    textAlign: "center",
  },
  emailContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  timerIconContainer: {
    marginRight: 8,
  },
  timerIcon: {
    fontSize: 18,
    color: "#FF8F00",
  },
  timer: {
    fontSize: 15,
    color: "#A0A0B0",
  },
  timerHighlight: {
    color: "#FF8F00",
    fontWeight: "700",
  },
  progressBarContainer: {
    width: width - 60,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    marginBottom: 40,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF8F00",
    borderRadius: 2,
  },
  resendButton: {
    marginBottom: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 15,
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
  },
  verifyButton: {
    backgroundColor: "#FF8F00",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF8F00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 30,
  },
  verifyText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 8,
  },
  verifyArrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 13,
    color: "#707080",
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 20,
  },
});