import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

import ChatbotScreen from './ChatbotScreen'; // Import the new ChatbotScreen component

export default function MessageScreen() {
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState('Chatbot');
    const [showChatbotScreen, setShowChatbotScreen] = useState(false);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
  
    if (!leagueSpartanLoaded || !montserratLoaded) {
      return null;
    }

    const messages = [
        { id: '1', sender: 'chatbot', text: 'Hi! Welcome to Mirrora. How can I help you today?', username: 'CHATBOTX00719ZV', avatar: require('../assets/chatbot-avatar.png') },
    ];

    const renderMessage = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => setShowChatbotScreen(true)} style={styles.messageCard}>
                <View style={styles.messageRow}>
                    <Image source={item.avatar} style={styles.messageAvatar} />
                    <View style={styles.messageTextContainer}>
                        <Text style={styles.messageUsername}>{item.username}</Text>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (showChatbotScreen) {
        return <ChatbotScreen navigation={navigation} onGoBack={() => setShowChatbotScreen(false)} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-left" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Messages</Text>
                <View style={{ width: 30 }} />
            </View>
            <View style={styles.mainContent}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => setSelectedTab('Chatbot')} style={styles.tab}>
                        <Text style={[styles.tabText, selectedTab === 'Chatbot' && styles.activeTabText]}>
                            Chatbot
                        </Text>
                        {selectedTab === 'Chatbot' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab('Seller')} style={styles.tab}>
                        <Text style={[styles.tabText, selectedTab === 'Seller' && styles.activeTabText]}>
                            Seller
                        </Text>
                        {selectedTab === 'Seller' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                </View>
                {selectedTab === 'Chatbot' ? (
                    <FlatList
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={{ padding: 20 }}
                    />
                ) : (
                    <View style={styles.noChatContainer}>
                        <Text style={styles.noChatText}>No seller conversations yet.</Text>
                    </View>
                )}
            </View>
        </View>
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
    title: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 20,
        color: '#fff',
    },
    mainContent: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    tab: {
        alignItems: 'center',
        flex: 1,
    },
    tabText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#888',
    },
    activeTabText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#000',
    },
    tabIndicator: {
        marginTop: 4,
        height: 2,
        backgroundColor: '#A68B69',
        width: '60%',
        borderRadius: 2,
    },
    messageCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    messageAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    messageTextContainer: {
        flex: 1,
    },
    messageUsername: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
        marginBottom: 4,
        color: '#000',
    },
    messageText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#444',
    },
    noChatContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noChatText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: 'gray',
    },
});
