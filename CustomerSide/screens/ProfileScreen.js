import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    Modal, 
    ActivityIndicator, 
    Platform 
} from 'react-native';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";

// --- Firebase Imports ---
import { auth, db } from '../Backend/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import TabNavigator from './../components/TabNavigator';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold, });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    // This useEffect hook fetches user data from Firebase every time the screen is focused.
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    setEmail(currentUser.email);
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setName(userData.name || currentUser.displayName || 'No name set');
                    } else {
                        setName(currentUser.displayName || 'No name set');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user data for profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchUserData();
        }
    }, [isFocused]);

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null;
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setShowLogoutModal(false);
            navigation.navigate('SignIn');
        } catch (error) {
            console.error('Sign out error', error);
        }
    };

    const handleNavigation = (screenName) => {
        const parentNav = navigation.getParent();
        if (parentNav) {
            parentNav.navigate(screenName);
        } else {
            console.warn("Parent navigator not found!");
        }
    };

    const MenuItem = ({ icon, title, onPress, isLast = false }) => (
        <TouchableOpacity style={[styles.menuItem, isLast && styles.lastMenuItem]} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <View style={styles.iconCircle}>
                    <Icon name={icon} size={24} color="#A68B69" />
                </View>
                <Text style={styles.menuItemText}>{title}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#777" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Profile Content */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* User Info Section */}
                <View style={styles.userInfoSection}>
                    <Image source={require('../assets/profile.png')} style={styles.avatar} />
                    <Text style={[styles.userName, loading && styles.skeletonName]}>
                        {loading ? ' ' : name}
                    </Text>
                    {/* The user's email is now correctly displayed here */}
                    <Text style={[styles.userHandle, loading && styles.skeletonEmail]}>
                        {loading ? ' ' : email}
                    </Text>
                </View>

                {/* Menu Items Section */}
                <View style={styles.menuSection}>
                    <MenuItem
                        icon="account-outline"
                        title="Edit Profile"
                        onPress={() => handleNavigation('CompleteProfile')}
                    />
                    <MenuItem
                        icon="archive-outline"
                        title="My Order"
                        onPress={() => handleNavigation('MyOrderScreen')}
                    />
                    <MenuItem
                        icon="map-marker-outline"
                        title="Address"
                        onPress={() => handleNavigation('MyAddressScreen')}
                    />
                    <MenuItem
                        icon="cog-outline"
                        title="Setting"
                        onPress={() => handleNavigation('SettingScreen')}
                    />
                    <MenuItem
                        icon="information-outline"
                        title="About Us"
                        onPress={() => handleNavigation('AboutUsScreen')}
                        isLast={true}
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Logout Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLogoutModal}
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Logout</Text>
                        <Text style={styles.modalText}>Are you sure you want to log out?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowLogoutModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutModalButton]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutModalButtonText}>LOGOUT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Bottom Navigation Bar */}
            <TabNavigator navigation={navigation} currentScreen="Profile" />
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
        paddingTop: Platform.OS === 'android' ? 50 : 60,
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
        alignItems: 'center',
        paddingBottom: 80,
    },
    userInfoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    userName: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        color: '#000',
    },
    userHandle: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#777',
    },
    skeletonName: {
        backgroundColor: '#E0E0E0',
        height: 24,
        width: 150,
        borderRadius: 4,
    },
    skeletonEmail: {
        backgroundColor: '#E0E0E0',
        height: 16,
        width: 200,
        borderRadius: 4,
        marginTop: 4,
    },
    menuSection: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3EFE9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#000',
        marginLeft: 15,
    },
    logoutButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#A68B69",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 25,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        marginBottom: 10,
        color: '#000',
    },
    modalText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#E5E5E5',
    },
    cancelButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: '#777',
        textAlign: 'center',
    },
    logoutModalButton: {
        backgroundColor: '#A68B69',
    },
    logoutModalButtonText: {
        fontFamily: 'Montserrat_600SemiBold',
        color: 'white',
        textAlign: 'center',
    },
}); 