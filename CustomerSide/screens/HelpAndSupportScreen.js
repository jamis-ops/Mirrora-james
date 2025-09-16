import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { db } from '../Backend/firebaseConfig';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

export default function HelpAndSupportScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [faqData, setFaqData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
    const [leagueSpartanLoaded] = useMontserrat({ LeagueSpartan_700Bold });

    useEffect(() => {
        // Fetch FAQs from Firestore
        const unsubscribe = onSnapshot(
            collection(db, 'faqs'), 
            (snapshot) => {
                const faqs = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    // Only include FAQs that are marked as visible
                    if (data.isVisible) {
                        faqs.push({
                            id: doc.id,
                            question: data.question,
                            answer: data.answer,
                            order: data.order || 0
                        });
                    }
                });
                // Sort FAQs by order field
                faqs.sort((a, b) => (a.order || 0) - (b.order || 0));
                setFaqData(faqs);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching FAQs:", error);
                Alert.alert("Error", "Failed to load FAQs");
                setLoading(false);
            }
        );

        // Clean up the listener when component unmounts
        return () => unsubscribe();
    }, []);

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const handleSubmit = async () => {
        if (!name || !email || !message) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        try {
            await addDoc(collection(db, 'supportMessages'), {
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
                createdAt: new Date(),
                status: 'new'
            });
            
            Alert.alert("Success", "Your message has been sent! We'll get back to you soon.");
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", "Failed to send message. Please try again.");
        }
    };

    if (!montserratLoaded || !leagueSpartanLoaded) {
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help And Support</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Contact Us Section */}
                <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#999"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        placeholder="Message"
                        multiline
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQs Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>FAQs</Text>
                    
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#A68B69" />
                            <Text style={styles.loadingText}>Loading FAQs...</Text>
                        </View>
                    ) : faqData.length === 0 ? (
                        <View style={styles.noFaqsContainer}>
                            <Icon name="help-circle-outline" size={40} color="#ccc" />
                            <Text style={styles.noFaqsText}>No FAQs available</Text>
                            <Text style={styles.noFaqsSubtext}>Check back later for frequently asked questions.</Text>
                        </View>
                    ) : (
                        faqData.map((item, index) => (
                            <View key={item.id} style={styles.faqItem}>
                                <TouchableOpacity 
                                    style={styles.faqQuestionContainer} 
                                    onPress={() => toggleFAQ(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.faqQuestion}>{item.question}</Text>
                                    <Icon
                                        name={expandedFAQ === index ? "chevron-up" : "chevron-down"}
                                        size={24}
                                        color="#777"
                                    />
                                </TouchableOpacity>
                                {expandedFAQ === index && (
                                    <View style={styles.faqAnswerContainer}>
                                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 22,
        color: '#000',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40, // Extra padding at the bottom
    },
    contactSection: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        color: '#000',
        marginBottom: 15,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#F3EFE9',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#333',
    },
    messageInput: {
        height: 120,
        paddingTop: 15,
    },
    submitButton: {
        backgroundColor: '#A68B69',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
    },
    faqSection: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        minHeight: 200, // Ensure consistent height
    },
    faqItem: {
        marginBottom: 10,
    },
    faqQuestionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    faqQuestion: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#000',
        flex: 1,
        paddingRight: 10,
    },
    faqAnswerContainer: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        marginTop: 5,
    },
    faqAnswer: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Montserrat_400Regular',
        color: '#666',
        fontSize: 14,
    },
    noFaqsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    noFaqsText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 5,
    },
    noFaqsSubtext: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});