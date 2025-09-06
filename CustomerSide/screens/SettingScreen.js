import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import BottomNavigationBar from '../components/BottomNavigationBar'; // Import the new navigation bar

export default function SettingScreen() {
    const navigation = useNavigation();
    
    const [montserratLoaded] = useMontserrat({ 
        Montserrat_400Regular, 
        Montserrat_500Medium, 
        Montserrat_600SemiBold 
    });

    if (!montserratLoaded) {
        return null;
    }

    const handleLogout = () => {
        // Add logout functionality here
        console.log('Logout pressed');
    };

    const SettingsItem = ({ icon, title, onPress }) => (
        <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
            <View style={styles.settingsItemLeft}>
                <Icon name={icon} size={20} color="#666" style={styles.itemIcon} />
                <Text style={styles.itemText}>{title}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F2EC" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="chevron-left" size={24} color="#2C2C2C" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* General Section */}
                <Text style={styles.sectionTitle}>General</Text>
                
                <View style={styles.settingsContainer}>
                    <SettingsItem 
                        icon="account-outline"
                        title="Account Information"
                        onPress={() => console.log('Account Information pressed')}
                    />
                    
                    <SettingsItem 
                        icon="credit-card-outline"
                        title="Payment Methods"
                        onPress={() => console.log('Payment Methods pressed')}
                    />
                    
                    <SettingsItem 
                        icon="palette-outline"
                        title="Appearance"
                        onPress={() => console.log('Appearance pressed')}
                    />
                    
                    <SettingsItem 
                        icon="bell-outline"
                        title="Notification"
                        onPress={() => console.log('Notification pressed')}
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Navigation Bar */}
            <BottomNavigationBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F2EC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F5F2EC',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        color: '#2C2C2C',
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sectionTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#2C2C2C',
        marginBottom: 16,
        marginLeft: 4,
    },
    settingsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 40,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0F0F0',
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemIcon: {
        marginRight: 16,
        width: 20,
    },
    itemText: {
        fontFamily: 'Montserrat_500Medium',
        fontSize: 16,
        color: '#2C2C2C',
    },
    logoutButton: {
        backgroundColor: '#A68B69',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#A68B69',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    logoutButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#fff',
        letterSpacing: 0.5,
    },
});
