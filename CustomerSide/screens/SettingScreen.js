import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    TextInput,
    StatusBar,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { getAuth } from "firebase/auth";
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../Backend/firebaseConfig";
import { deleteUser } from "firebase/auth";



const SettingsScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [showAddCardModal, setShowAddCardModal] = useState(false);

    const [currentTab, setCurrentTab] = useState('accountData');
    const [accountEmail, setAccountEmail] = useState('');
    const [accountName, setAccountName] = useState('');
    const [accountFirstName, setAccountFirstName] = useState('');
    const [accountLastName, setAccountLastName] = useState('');
    const [accountPhoneNumber, setAccountPhoneNumber] = useState('');

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);


    // Fetch account info when component mounts and user is authenticated
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                
                if (user) {
                    // Set email from Auth (most reliable source)
                    setAccountEmail(user.email || "");
                    
                    // Fetch additional user data from Firestore
                    const userId = user.uid;
                    const userRef = doc(db, "user", userId);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        setAccountFirstName(data.firstName || "Not set");
                        setAccountLastName(data.lastName || "Not set");
                        setAccountPhoneNumber(data.phoneNumber || "Not set");
                    } else {
                        // Set default values if no data exists
                        setAccountFirstName("Not set");
                        setAccountLastName("Not set");
                        setAccountPhoneNumber("Not set");
                    }
                }
            } catch (error) {
                console.log("Error fetching user data:", error);
                // Set default values on error
                setAccountFirstName("Error loading");
                setAccountLastName("Error loading");
                setAccountPhoneNumber("Error loading");
            }
        };

        fetchUserData();
    }, []);

    // Also fetch data when account info modal opens to ensure fresh data
    useEffect(() => {
        const fetchAccountInfo = async () => {
            if (showAccountInfo) {
                try {
                    const auth = getAuth();
                    const user = auth.currentUser;
                    
                    if (user) {
                        // Always get email from Auth
                        setAccountEmail(user.email || "");
                        
                        // Fetch from Firestore for other data
                        const userId = user.uid;
                        const userRef = doc(db, "user", userId);
                        const userSnap = await getDoc(userRef);

                        if (userSnap.exists()) {
                            const data = userSnap.data();
                            setAccountFirstName(data.firstName || "Not set");
                            setAccountLastName(data.lastName || "Not set");
                            setAccountPhoneNumber(data.phoneNumber || "Not set");
                        } else {
                            setAccountFirstName("Not set");
                            setAccountLastName("Not set");
                            setAccountPhoneNumber("Not set");
                        }
                    }
                } catch (error) {
                    console.log("Error fetching account info:", error);
                }
            }
        };

        fetchAccountInfo();
    }, [showAccountInfo]);

    const saveAccountInfo = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                alert("No user logged in.");
                return;
            }

            const userId = user.uid;
            const userRef = doc(db, "user", userId);

            await setDoc(
                userRef,
                {
                    email: accountEmail,
                    firstName: accountFirstName,
                    lastName: accountLastName,
                    phoneNumber: accountPhoneNumber,
                },
                { merge: true }
            );

            alert("Account info saved successfully!");
            setShowAccountInfo(false);
        } catch (error) {
            console.log("Error saving account info:", error);
            alert("Failed to save account info.");
        }
    };

    const deleteAccount = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                alert("No user logged in.");
                return;
            }

            const userId = user.uid;

            // Delete Firestore document
            await deleteDoc(doc(db, "user", userId));

            // Delete Firebase Auth account
            await deleteUser(user);

            alert("Account deleted successfully!");
            navigation.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
            });

        } catch (error) {
            console.log("Error deleting account:", error);
            alert("Failed to delete account. You may need to re-login and try again.");
        }
    };

    // New states for the add card form
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVC, setCardCVC] = useState('');

    // Notification Modal States
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [systemEmail, setSystemEmail] = useState(true);
    const [systemSms, setSystemSms] = useState(false);
    const [marketingEmail, setMarketingEmail] = useState(true);
    const [marketingSms, setMarketingSms] = useState(false);

    const [showHelpSupportModal, setShowHelpSupportModal] = useState(false);
    const [faqExpanded, setFaqExpanded] = useState(null);
    const [helpName, setHelpName] = useState('');
    const [helpEmail, setHelpEmail] = useState('');
    const [helpMessage, setHelpMessage] = useState('');

    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });
    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });

    useEffect(() => {
        if (montserratLoaded && leagueSpartanLoaded) {
            setIsLoading(false);
        }
    }, [montserratLoaded, leagueSpartanLoaded]);

    // Function to get theme-aware styles
    const getStyles = () => {
        const theme = {
            backgroundPrimary: '#F8F8F8',
            backgroundSecondary: '#FFFFFF',
            textPrimary: '#1F2937', // Darker gray for primary text
            textSecondary: '#6B7280', // Medium gray for secondary text
            accent: '#C76A51', // Warm Terracotta
            border: '#E5E7EB', // Lighter gray for borders
            deleteButtonText: '#EF4444',
            deleteButtonBg: '#FEE2E2',
        };

        return StyleSheet.create({
            safeArea: {
                flex: 1,
                backgroundColor: theme.backgroundPrimary,
            },
            container: {
                flex: 1,
            },
            loadingContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.backgroundPrimary,
            },
            header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: Platform.OS === 'android' ? 50 : 0,
                paddingBottom: 15,
                backgroundColor: theme.backgroundPrimary,
                borderBottomColor: 'transparent',
                elevation: 0,
                shadowOpacity: 0,
            },
            backButton: {
                width: 40,
                alignItems: 'flex-start',
            },
            headerSpacer: {
                width: 40,
            },
            headerTitle: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 20,
                color: theme.textPrimary,
                flex: 1,
                textAlign: 'center',
            },
            scrollView: {
                flex: 1,
                backgroundColor: theme.backgroundPrimary,
            },
            scrollViewContent: {
                paddingBottom: 100,
            },
            settingsContainer: {
                paddingHorizontal: 20,
                paddingTop: 20,
            },
            sectionHeader: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: theme.textSecondary,
                marginBottom: 15,
                marginTop: 10,
            },
            settingsSection: {
                backgroundColor: theme.backgroundSecondary,
                borderRadius: 20, // Increased corner radius for a softer look
                marginBottom: 25,
                overflow: 'hidden',
                // Added drop shadow for a layered effect
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                    },
                    android: {
                        elevation: 4,
                    },
                }),
            },
            settingsItem: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
            },
            settingsItemLast: {
                borderBottomWidth: 0,
            },
            settingsItemLeft: {
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
            },
            settingsItemIcon: {
                marginRight: 15,
            },
            settingsItemText: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 16,
                color: theme.textPrimary,
            },
            // Modal specific styles
            modalSafeArea: {
                flex: 1,
                backgroundColor: theme.backgroundPrimary,
            },
            modalContainer: {
                flex: 1,
                backgroundColor: theme.backgroundPrimary,
            },
            modalHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: theme.backgroundPrimary,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
            },
            modalBackButton: {
                padding: 4,
            },
            modalHeaderSpacer: {
                width: 32,
            },
            modalHeaderTitle: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 18,
                color: theme.textPrimary,
                flex: 1,
                textAlign: 'center',
            },
            modalScrollView: {
                flex: 1,
                backgroundColor: theme.backgroundPrimary,
            },
            tabBar: {
                flexDirection: 'row',
                backgroundColor: theme.backgroundSecondary,
                marginHorizontal: 16,
                marginTop: 8,
                borderRadius: 16,
                padding: 6,
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                    },
                    android: {
                        elevation: 2,
                    },
                }),
            },
            tab: {
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderRadius: 12,
            },
            activeTab: {
                backgroundColor: theme.backgroundPrimary,
            },
            tabText: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 14,
                color: theme.textSecondary,
            },
            activeTabText: {
                fontFamily: 'Montserrat_600SemiBold',
                color: theme.textPrimary,
            },
            tabContent: {
                paddingHorizontal: 20,
                paddingTop: 24,
                backgroundColor: theme.backgroundPrimary,
            },
            inputGroup: {
                marginBottom: 20,
            },
            label: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 13,
                color: theme.textSecondary,
                marginBottom: 8,
            },
            input: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 16,
                color: theme.textPrimary,
                paddingVertical: 16,
                paddingHorizontal: 18,
                backgroundColor: theme.backgroundSecondary,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
            },
            deleteSection: {
                marginTop: 40,
                paddingTop: 20,
            },
            deleteTitle: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: theme.textPrimary,
                marginBottom: 8,
            },
            deleteDescription: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 14,
                color: theme.textSecondary,
                marginBottom: 20,
                lineHeight: 20,
            },
            deleteButton: {
                backgroundColor: theme.deleteButtonBg,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
            },
            deleteButtonText: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: theme.deleteButtonText,
            },
            saveButtonContainer: {
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: theme.backgroundPrimary,
                borderTopWidth: 1,
                borderTopColor: theme.border,
            },
            saveButton: {
                backgroundColor: theme.accent,
                paddingVertical: 16,
                borderRadius: 25, // More rounded, pill-like shape
                alignItems: 'center',
            },
            saveButtonText: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: '#fff',
            },
            // Payment Method Modal specific styles
            paymentMethodContent: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
                backgroundColor: theme.backgroundPrimary,
            },
            paymentCardIcon: {
                marginBottom: 20,
            },
            noCardTitle: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 20,
                color: theme.textPrimary,
                marginBottom: 10,
                textAlign: 'center',
            },
            noCardDescription: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 15,
                color: theme.textSecondary,
                textAlign: 'center',
                marginBottom: 30,
                lineHeight: 22,
            },
            addCardButton: {
                backgroundColor: theme.accent,
                paddingVertical: 16,
                paddingHorizontal: 40,
                borderRadius: 25,
                alignItems: 'center',
            },
            addCardButtonText: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: '#fff',
            },
            // New styles for the Add Card screen layout
            cardInfoRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20,
            },
            cardInfoInputGroup: {
                width: '48%',
            },
            // Delete Confirmation Modal styles
            confirmModalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
            },
            confirmModalContainer: {
                backgroundColor: theme.backgroundSecondary,
                marginHorizontal: 30,
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                    },
                    android: {
                        elevation: 10,
                    },
                }),
            },
            confirmModalIcon: {
                marginBottom: 16,
            },
            confirmModalTitle: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 20,
                color: theme.textPrimary,
                textAlign: 'center',
                marginBottom: 8,
            },
            confirmModalMessage: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 15,
                color: theme.textSecondary,
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
            },
            confirmModalButtons: {
                flexDirection: 'row',
                gap: 12,
                width: '100%',
            },
            confirmModalButton: {
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
            },
            confirmModalCancelButton: {
                backgroundColor: theme.backgroundPrimary,
                borderWidth: 1,
                borderColor: theme.border,
            },
            confirmModalDeleteButton: {
                backgroundColor: theme.deleteButtonText,
            },
            confirmModalCancelText: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: theme.textPrimary,
            },
            confirmModalDeleteText: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: '#fff',
            },
        });
    };

    const themedStyles = getStyles();

    if (isLoading) {
        return (
            <View style={themedStyles.loadingContainer}>
                <ActivityIndicator size="large" color={themedStyles.accent} />
            </View>
        );
    }

    const SettingsItem = ({ icon, title, onPress, hasChevron = true, themeStyles, isLast = false }) => (
        <TouchableOpacity style={[themeStyles.settingsItem, isLast && themeStyles.settingsItemLast]} onPress={onPress}>
            <View style={themeStyles.settingsItemLeft}>
                <Icon name={icon} size={24} color={themeStyles.textPrimary} style={themedStyles.settingsItemIcon} />
                <Text style={themeStyles.settingsItemText}>{title}</Text>
            </View>
            {hasChevron && (
                <Icon name="chevron-right" size={20} color={themeStyles.textSecondary} />
            )}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title, themeStyles }) => (
        <Text style={themeStyles.sectionHeader}>{title}</Text>
    );

    const renderAccountInfoContent = () => {
        if (currentTab === 'accountData') {
            return (
                <View style={themedStyles.tabContent}>
                    <View style={themedStyles.inputGroup}>
                        <Text style={themedStyles.label}>Email Address</Text>
                        <TextInput
                            style={themedStyles.input}
                            value={accountEmail}
                            placeholder="Email"
                            keyboardType="email-address"
                            editable={false}
                            selectTextOnFocus={false}
                        />
                    </View>

                    <View style={themedStyles.deleteSection}>
                        <Text style={themedStyles.deleteTitle}>Delete account</Text>
                        <Text style={themedStyles.deleteDescription}>
                            Your account will be permanently removed from the application.
                        </Text>
                        <TouchableOpacity 
                            style={themedStyles.deleteButton} 
                            onPress={() => setShowDeleteConfirmModal(true)}
                        >
                            <Text style={themedStyles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else if (currentTab === 'personalData') {
            return (
                <View style={themedStyles.tabContent}>
                    <View style={themedStyles.inputGroup}>
                        <Text style={themedStyles.label}>First Name</Text>
                        <TextInput
                            style={themedStyles.input}
                            value={accountFirstName}
                            placeholder="First Name"
                            editable={false}
                            selectTextOnFocus={false}

                        />
                    </View>
                    <View style={themedStyles.inputGroup}>
                        <Text style={themedStyles.label}>Last Name</Text>
                        <TextInput
                            style={themedStyles.input}
                            value={accountLastName}
                            onChangeText={setAccountLastName}
                            placeholder="Last Name"
                            editable={false}
                            selectTextOnFocus={false}
                        />
                    </View>
                    <View style={themedStyles.inputGroup}>
                        <Text style={themedStyles.label}>Phone Number</Text>
                        <TextInput
                            style={themedStyles.input}
                            value={accountPhoneNumber}
                            placeholder="Phone Number"
                            editable={false}
                            selectTextOnFocus={false}
                        />
                    </View>
                </View>
            );
        }
    };

    const renderAddCardModalContent = () => {
        return (
            <View style={themedStyles.modalContainer}>
                <View style={themedStyles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowAddCardModal(false)} style={themedStyles.modalBackButton}>
                        <Icon name="chevron-left" size={24} color={themedStyles.textPrimary} />
                    </TouchableOpacity>
                    <Text style={themedStyles.modalHeaderTitle}>Add new card</Text>
                    <View style={themedStyles.modalHeaderSpacer} />
                </View>
                <ScrollView style={themedStyles.modalScrollView} showsVerticalScrollIndicator={false}>
                    <View style={themedStyles.tabContent}>
                        <View style={themedStyles.inputGroup}>
                            <Text style={themedStyles.label}>Name on card</Text>
                            <TextInput
                                style={themedStyles.input}
                                value={cardName}
                                onChangeText={setCardName}
                                placeholder="Julie Utrera"
                                placeholderTextColor={themedStyles.textSecondary}
                                keyboardType="default"
                            />
                        </View>
                        <View style={themedStyles.inputGroup}>
                            <Text style={themedStyles.label}>Card Number</Text>
                            <TextInput
                                style={themedStyles.input}
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                placeholder="0000 0000 0000 0000"
                                placeholderTextColor={themedStyles.textSecondary}
                                keyboardType="numeric"
                                maxLength={16}
                            />
                        </View>
                        <View style={themedStyles.cardInfoRow}>
                            <View style={themedStyles.cardInfoInputGroup}>
                                <Text style={themedStyles.label}>MM/YY</Text>
                                <TextInput
                                    style={themedStyles.input}
                                    value={cardExpiry}
                                    onChangeText={setCardExpiry}
                                    placeholder="MM/YY"
                                    placeholderTextColor={themedStyles.textSecondary}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                            <View style={themedStyles.cardInfoInputGroup}>
                                <Text style={themedStyles.label}>CVC</Text>
                                <TextInput
                                    style={themedStyles.input}
                                    value={cardCVC}
                                    onChangeText={setCardCVC}
                                    placeholder="CVC"
                                    placeholderTextColor={themedStyles.textSecondary}
                                    keyboardType="numeric"
                                    secureTextEntry
                                    maxLength={4}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View style={themedStyles.saveButtonContainer}>
                    <TouchableOpacity style={themedStyles.saveButton}>
                        <Text style={themedStyles.saveButtonText}>Add new card</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={themedStyles.safeArea}>
            <View style={themedStyles.container}>
                <StatusBar barStyle={"dark-content"} backgroundColor={'#F8F8F8'} />

                {/* Header */}
                <View style={themedStyles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={themedStyles.backButton}>
                        <Icon name="chevron-left" size={28} color={themedStyles.textPrimary} />
                    </TouchableOpacity>
                    <Text style={themedStyles.headerTitle}>Settings</Text>
                    <View style={themedStyles.headerSpacer} />
                </View>

                {/* Settings Content */}
                <ScrollView style={themedStyles.scrollView} contentContainerStyle={themedStyles.scrollViewContent}>
                    <View style={themedStyles.settingsContainer}>
                        {/* General Section */}
                        <SectionHeader title="General" themeStyles={themedStyles} />
                        <View style={themedStyles.settingsSection}>
                            <SettingsItem
                                icon="account-outline"
                                title="Account Information"
                                onPress={() => setShowAccountInfo(true)}
                                themeStyles={themedStyles}
                            />
                            <SettingsItem
                                icon="credit-card-outline"
                                title="Payment Methods"
                                onPress={() => setShowPaymentMethodModal(true)}
                                themeStyles={themedStyles}
                            />
                            <SettingsItem
                                icon="bell-outline"
                                title="Notification"
                                onPress={() => setShowNotificationModal(true)}
                                themeStyles={themedStyles}
                                isLast={true}
                            />
                        </View>

                        {/* Help & Support Section */}
                        <SectionHeader title="Help & Support" themeStyles={themedStyles} />
                        <View style={themedStyles.settingsSection}>
                            <SettingsItem
                                icon="help-circle-outline"
                                title="Help Center"
                                onPress={() => setShowHelpSupportModal(true)}
                                themeStyles={themedStyles}
                                isLast={true}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Delete Account Confirmation Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showDeleteConfirmModal}
                    onRequestClose={() => setShowDeleteConfirmModal(false)}
                >
                    <View style={themedStyles.confirmModalOverlay}>
                        <View style={themedStyles.confirmModalContainer}>
                            <Icon 
                                name="alert-circle-outline" 
                                size={48} 
                                color={themedStyles.deleteButtonText} 
                                style={themedStyles.confirmModalIcon}
                            />
                            <Text style={themedStyles.confirmModalTitle}>
                                Delete Account?
                            </Text>
                            <Text style={themedStyles.confirmModalMessage}>
                                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                            </Text>
                            <View style={themedStyles.confirmModalButtons}>
                                <TouchableOpacity 
                                    style={[themedStyles.confirmModalButton, themedStyles.confirmModalCancelButton]}
                                    onPress={() => setShowDeleteConfirmModal(false)}
                                >
                                    <Text style={themedStyles.confirmModalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[themedStyles.confirmModalButton, themedStyles.confirmModalDeleteButton]}
                                    onPress={() => {
                                        setShowDeleteConfirmModal(false);
                                        deleteAccount();
                                    }}
                                >
                                    <Text style={themedStyles.confirmModalDeleteText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Account Information Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showAccountInfo}
                    onRequestClose={() => setShowAccountInfo(false)}
                >
                    <SafeAreaView style={themedStyles.modalSafeArea}>
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#F8F8F8'} />
                        <View style={themedStyles.modalContainer}>
                            {/* Modal Header */}
                            <View style={themedStyles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowAccountInfo(false)} style={themedStyles.modalBackButton}>
                                    <Icon name="chevron-left" size={24} color={themedStyles.textPrimary} />
                                </TouchableOpacity>
                                <Text style={themedStyles.modalHeaderTitle}>Account Information</Text>
                                <View style={themedStyles.modalHeaderSpacer} />
                            </View>

                            <ScrollView style={themedStyles.modalScrollView} showsVerticalScrollIndicator={false}>
                                {/* Tab Bar */}
                                <View style={themedStyles.tabBar}>
                                    <TouchableOpacity
                                        style={[themedStyles.tab, currentTab === 'accountData' && themedStyles.activeTab]}
                                        onPress={() => setCurrentTab('accountData')}
                                    >
                                        <Text style={[themedStyles.tabText, currentTab === 'accountData' && themedStyles.activeTabText]}>
                                            Account Data
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[themedStyles.tab, currentTab === 'personalData' && themedStyles.activeTab]}
                                        onPress={() => setCurrentTab('personalData')}
                                    >
                                        <Text style={[themedStyles.tabText, currentTab === 'personalData' && themedStyles.activeTabText]}>
                                            Personal Data
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {renderAccountInfoContent()}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </Modal>

                {/* Payment Methods Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showPaymentMethodModal}
                    onRequestClose={() => setShowPaymentMethodModal(false)}
                >
                    <SafeAreaView style={themedStyles.modalSafeArea}>
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#F8F8F8'} />
                        <View style={themedStyles.modalContainer}>
                            <View style={themedStyles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowPaymentMethodModal(false)} style={themedStyles.modalBackButton}>
                                    <Icon name="chevron-left" size={24} color={themedStyles.textPrimary} />
                                </TouchableOpacity>
                                <Text style={themedStyles.modalHeaderTitle}>Payment Methods</Text>
                                <View style={themedStyles.modalHeaderSpacer} />
                            </View>
                            <View style={themedStyles.paymentMethodContent}>
                                <Icon name="credit-card-off-outline" size={72} color={themedStyles.textSecondary} style={themedStyles.paymentCardIcon} />
                                <Text style={themedStyles.noCardTitle}>No cards yet!</Text>
                                <Text style={themedStyles.noCardDescription}>
                                    Looks like you haven't added any payment methods yet. Add a card to make purchases.
                                </Text>
                                <TouchableOpacity style={themedStyles.addCardButton} onPress={() => { setShowPaymentMethodModal(false); setShowAddCardModal(true); }}>
                                    <Text style={themedStyles.addCardButtonText}>Add a card</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </Modal>

                {/* Add Card Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showAddCardModal}
                    onRequestClose={() => setShowAddCardModal(false)}
                >
                    <SafeAreaView style={themedStyles.modalSafeArea}>
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#F8F8F8'} />
                        {renderAddCardModalContent()}
                    </SafeAreaView>
                </Modal>

                {/* Notification Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showNotificationModal}
                    onRequestClose={() => setShowNotificationModal(false)}
                >
                    <SafeAreaView style={themedStyles.modalSafeArea}>
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#F8F8F8'} />
                        <View style={themedStyles.modalContainer}>
                            {/* Header */}
                            <View style={themedStyles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowNotificationModal(false)} style={themedStyles.modalBackButton}>
                                    <Icon name="chevron-left" size={24} color={themedStyles.textPrimary} />
                            </TouchableOpacity>
                            <Text style={themedStyles.modalHeaderTitle}>Notification</Text>
                            <View style={themedStyles.modalHeaderSpacer} />
                        </View>

                        <ScrollView style={themedStyles.modalScrollView} contentContainerStyle={{ padding: 20 }}>
                            {/* System Notification */}
                            <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: themedStyles.border, paddingBottom: 16 }}>
                                <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: themedStyles.textPrimary, marginBottom: 6 }}>
                                    System Notification
                                </Text>
                                <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 14, color: themedStyles.textSecondary, marginBottom: 12 }}>
                                    Receive notification about the latest news & system updates from us.
                                </Text>

                                <View style={themedStyles.settingsItem}>
                                    <Text style={themedStyles.settingsItemText}>Email</Text>
                                    <TouchableOpacity onPress={() => setSystemEmail(!systemEmail)}>
                                        <Icon
                                            name={systemEmail ? "toggle-switch" : "toggle-switch-off-outline"}
                                            size={32}
                                            color={systemEmail ? themedStyles.accent : themedStyles.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={[themedStyles.settingsItem, themedStyles.settingsItemLast]}>
                                    <Text style={themedStyles.settingsItemText}>SMS</Text>
                                    <TouchableOpacity onPress={() => setSystemSms(!systemSms)}>
                                        <Icon
                                            name={systemSms ? "toggle-switch" : "toggle-switch-off-outline"}
                                            size={32}
                                            color={systemSms ? themedStyles.accent : themedStyles.textSecondary}
                                        />
                                    </TouchableOpacity>
                            </View>
                        </View>

                        {/* Marketing Notification */}
                        <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: themedStyles.border, paddingBottom: 16 }}>
                            <Text style={{ fontFamily: "Montserrat_600SemiBold", fontSize: 16, color: themedStyles.textPrimary, marginBottom: 6 }}>
                                Marketing Notification
                            </Text>
                            <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 14, color: themedStyles.textSecondary, marginBottom: 12 }}>
                                Receive notifications with personalized offers about new products.
                            </Text>

                            <View style={themedStyles.settingsItem}>
                                <Text style={themedStyles.settingsItemText}>Email</Text>
                                <TouchableOpacity onPress={() => setMarketingEmail(!marketingEmail)}>
                                    <Icon
                                        name={marketingEmail ? "toggle-switch" : "toggle-switch-off-outline"}
                                        size={32}
                                        color={marketingEmail ? themedStyles.accent : themedStyles.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={[themedStyles.settingsItem, themedStyles.settingsItemLast]}>
                                <Text style={themedStyles.settingsItemText}>SMS</Text>
                                <TouchableOpacity onPress={() => setMarketingSms(!marketingSms)}>
                                    <Icon
                                        name={marketingSms ? "toggle-switch" : "toggle-switch-off-outline"}
                                        size={32}
                                        color={marketingSms ? themedStyles.accent : themedStyles.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Save Button */}
                    <View style={themedStyles.saveButtonContainer}>
                        <TouchableOpacity style={themedStyles.saveButton} onPress={() => setShowNotificationModal(false)}>
                            <Text style={themedStyles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>

        {/* Help & Support Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showHelpSupportModal}
          onRequestClose={() => setShowHelpSupportModal(false)}
        >
          <SafeAreaView style={themedStyles.modalSafeArea}>
            <StatusBar barStyle={"dark-content"} backgroundColor={'#F8F8F8'} />
            <View style={themedStyles.modalContainer}>
              {/* Header */}
              <View style={themedStyles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowHelpSupportModal(false)}
                  style={themedStyles.modalBackButton}
                >
                  <Icon name="chevron-left" size={24} color={themedStyles.textPrimary} />
                </TouchableOpacity>
                <Text style={themedStyles.modalHeaderTitle}>Help and Support</Text>
                <View style={themedStyles.modalHeaderSpacer} />
              </View>

              <ScrollView style={themedStyles.modalScrollView} contentContainerStyle={{ padding: 20 }}>
                {/* Contact Us Form */}
                <Text style={[themedStyles.label, { fontSize: 16, marginBottom: 12 }]}>
                  Contact Us
                </Text>
                <TextInput
                  style={[themedStyles.input, { marginBottom: 12 }]}
                  placeholder="Name"
                  value={helpName}
                  onChangeText={setHelpName}
                />
                <TextInput
                  style={[themedStyles.input, { marginBottom: 12 }]}
                  placeholder="Email"
                  value={helpEmail}
                  onChangeText={setHelpEmail}
                  keyboardType="email-address"
                />
                <TextInput
                  style={[themedStyles.input, { marginBottom: 12, height: 100, textAlignVertical: 'top' }]}
                  placeholder="Message"
                  value={helpMessage}
                  onChangeText={setHelpMessage}
                  multiline
                />
                <TouchableOpacity style={themedStyles.saveButton}>
                  <Text style={themedStyles.saveButtonText}>Submit</Text>
                </TouchableOpacity>

                {/* FAQs */}
                <View style={{ marginTop: 30 }}>
                  <Text style={[themedStyles.label, { fontSize: 16, marginBottom: 12 }]}>
                    FAQs
                  </Text>

                  {[
                    { q: "How long does delivery take?", a: "Delivery usually takes 3–5 business days depending on your location." },
                    { q: "Do you offer returns or exchanges?", a: "Yes, you can return or exchange items within 7 days of delivery." }
                  ].map((faq, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <TouchableOpacity
                        style={themedStyles.settingsItem}
                        onPress={() => setFaqExpanded(faqExpanded === index ? null : index)}
                      >
                        <Text style={themedStyles.settingsItemText}>{faq.q}</Text>
                        <Icon
                          name={faqExpanded === index ? "chevron-up" : "chevron-down"}
                          size={20}
                          color={themedStyles.textSecondary}
                        />
                      </TouchableOpacity>
                      {faqExpanded === index && (
                        <View style={{ padding: 12, backgroundColor: "#fff", borderRadius: 8 }}>
                          <Text style={{ fontFamily: "Montserrat_400Regular", color: themedStyles.textSecondary }}>
                            {faq.a}
                          </Text>
                        </View>
                     )}
                   </View>
                 ))}
               </View>
             </ScrollView>
           </View>
         </SafeAreaView>
       </Modal>
     </View>
   </SafeAreaView>
  );
};

export default SettingsScreen;