import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";

// FAQ data for the collapsible sections
const faqData = [
    {
        question: 'What is your return policy?',
        answer: 'Items can be returned within 30 days of purchase, provided they are in their original condition and packaging. A receipt is required for all returns and exchanges.',
    },
    {
        question: 'What are your delivery options and charges?',
        answer: 'We offer standard and express delivery. Standard delivery is free for orders over $50. Express delivery charges vary based on location and weight.',
    },
    {
        question: 'How long does delivery take?',
        answer: 'Standard delivery typically takes 5-7 business days. Express delivery arrives within 1-2 business days.',
    },
    {
        question: 'Do you offer returns or exchanges?',
        answer: 'Yes, we offer both returns and exchanges. Please refer to our full return policy for more details.',
    },
];

export default function HelpAndSupportScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
    const [leagueSpartanLoaded] = useMontserrat({ LeagueSpartan_700Bold });

    if (!montserratLoaded || !leagueSpartanLoaded) {
        return null;
    }

    const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

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
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        placeholder="Message"
                        multiline
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity style={styles.submitButton}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQs Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>FAQs</Text>
                    {faqData.map((item, index) => (
                        <View key={index} style={styles.faqItem}>
                            <TouchableOpacity style={styles.faqQuestionContainer} onPress={() => toggleFAQ(index)}>
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
                    ))}
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
    },
});
