import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

const dummyMessages = [
    { id: '1', sender: 'chatbot', text: 'Hi! Welcome to Mirrora. How can I help you today?', avatar: require('../assets/chatbot-avatar.png'), time: '9:00 AM', date: 'July 2025' },
    { id: '2', sender: 'user', text: 'Do you have onsite workshop?', time: '9:01 AM' },
    { id: '3', sender: 'chatbot', text: 'Yes, we are located in Brgy. Bulacao, Cebu City, Philippines. You may visit us to check our mirrors in person or inquire about custom orders.', avatar: require('../assets/chatbot-avatar.png'), time: '9:02 AM' },
    { id: '4', sender: 'user', text: 'Thank you.', time: '9:03 AM' },
    { id: '5', sender: 'chatbot', text: 'You\'re welcome! Do you need help with anything else?', avatar: require('../assets/chatbot-avatar.png'), time: '9:04 AM' },
];

const quickReplies = [
    'Do you have onsite workshop?',
    'How much is the delivery fee?',
    'Do you offer same-day delivery?',
    'How do I track my order?',
    'What payment methods are accepted?'
];

const ChatMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
        <View style={[styles.chatMessageContainer, isUser ? styles.userMessageContainer : styles.chatbotMessageContainer]}>
            {!isUser && item.avatar && <Image source={item.avatar} style={styles.chatMessageAvatar} />}
            <View style={[isUser ? styles.userMessageBubble : styles.chatbotMessageBubble, styles.shadow]}>
                <Text style={isUser ? styles.userMessageText : styles.chatbotMessageText}>{item.text}</Text>
            </View>
        </View>
    );
};

export default function ChatbotScreen({ onGoBack }) {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState(dummyMessages);
    const flatListRef = useRef(null);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
 
    if (!leagueSpartanLoaded || !montserratLoaded) {
      return null;
    }

    const handleSendMessage = () => {
        if (inputMessage.trim() === '') return;
        const newMessage = { id: Date.now().toString(), sender: 'user', text: inputMessage, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
        setMessages([...messages, newMessage]);
        setInputMessage('');
        flatListRef.current.scrollToEnd({ animated: true });
    };

    const handleQuickReply = (text) => {
        setInputMessage(text);
        flatListRef.current.scrollToEnd({ animated: true });
    };

    const renderItem = ({ item }) => {
        const isUser = item.sender === 'user';
        return (
            <View>
                {item.date && <Text style={styles.dateSeparator}>{item.date}</Text>}
                <View style={[styles.chatMessageContainer, isUser ? styles.userMessageContainer : styles.chatbotMessageContainer]}>
                    {!isUser && item.avatar && <Image source={item.avatar} style={styles.chatMessageAvatar} />}
                    <View style={[isUser ? styles.userMessageBubble : styles.chatbotMessageBubble, styles.shadow]}>
                        <Text style={isUser ? styles.userMessageText : styles.chatbotMessageText}>{item.text}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
                    <Icon name="chevron-left" size={30} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Chatbot</Text>
                    <Text style={styles.headerSubtitle}>Online</Text>
                </View>
                <View style={{ width: 30 }} />
            </View>
            <View style={styles.mainContent}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatHeaderTitle}>Hello, Aubrie</Text>
                    <Text style={styles.chatHeaderSubtitle}>How can I help?</Text>
                </View>
                <View style={{flex: 1}}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.flatListContent}
                        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                    />
                </View>
                <View style={styles.quickRepliesAndInputContainer}>
                    <ScrollView style={styles.quickRepliesContainer} horizontal showsHorizontalScrollIndicator={false}>
                        {quickReplies.map((reply, index) => (
                            <TouchableOpacity key={index} style={styles.quickReplyButton} onPress={() => handleQuickReply(reply)}>
                                <Text style={styles.quickReplyText}>{reply}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Write Message"
                            placeholderTextColor="#999"
                            value={inputMessage}
                            onChangeText={setInputMessage}
                        />
                        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
                            <Icon name="send" size={24} color="#A68B69" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#A68B69',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 24,
        color: '#fff',
    },
    headerSubtitle: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#fff',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: 10,
    },
    chatHeader: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    chatHeaderTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 28,
        color: '#000',
    },
    chatHeaderSubtitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        color: '#000',
    },
    quickRepliesAndInputContainer: {
        backgroundColor: '#fff',
    },
    quickRepliesContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 10,
        paddingBottom: 10,
    },
    quickReplyButton: {
        backgroundColor: '#E8E8E8',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 5,
    },
    quickReplyText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#000',
    },
    flatListContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    chatMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    chatbotMessageContainer: {
        justifyContent: 'flex-start',
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    chatMessageAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    chatbotMessageBubble: {
        backgroundColor: '#F3F4F6',
        borderRadius: 15,
        padding: 15,
        maxWidth: '80%',
    },
    userMessageBubble: {
        backgroundColor: '#A68B69',
        borderRadius: 15,
        padding: 15,
        maxWidth: '80%',
    },
    chatbotMessageText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        lineHeight: 20,
        color: '#000',
    },
    userMessageText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        lineHeight: 20,
        color: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    messageInput: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 25,
        height: 50,
        paddingHorizontal: 20,
        fontFamily: 'Montserrat_400Regular',
    },
    sendButton: {
        marginLeft: 10,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    dateSeparator: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 12,
        color: '#777',
        textAlign: 'center',
        marginVertical: 10,
    },
});
