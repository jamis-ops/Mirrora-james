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
    Alert,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../Backend/firebaseConfig";
import { deleteUser } from "firebase/auth";

const SettingsScreen = () => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(true);
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentTab, setCurrentTab] = useState('accountData');
    
    // Account Info States
    const [accountEmail, setAccountEmail] = useState('');
    const [accountFirstName, setAccountFirstName] = useState('');
    const [accountLastName, setAccountLastName] = useState('');
    const [accountPhoneNumber, setAccountPhoneNumber] = useState('');
    
    // Change Password States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const saveAccountInfo = async () => {
        try {
            const auth = getAuth();
            const userId = auth.currentUser.uid;
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

    useEffect(() => {
        const fetchAccountInfo = async () => {
            try {
                const auth = getAuth();
                const userId = auth.currentUser.uid;
                const userRef = doc(db, "user", userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setAccountEmail(data.email || "");
                    setAccountFirstName(data.firstName || "");
                    setAccountLastName(data.lastName || "");
                    setAccountPhoneNumber(data.phoneNumber || "");
                }
            } catch (error) {
                console.log("Error fetching account info:", error);
            }
        };

        if (showAccountInfo) fetchAccountInfo();
    }, [showAccountInfo]);

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

    const validatePasswordForm = () => {
        const errors = {
            current: '',
            new: '',
            confirm: ''
        };

        if (!currentPassword) {
            errors.current = 'Current password is required';
        }

        if (!newPassword) {
            errors.new = 'New password is required';
        } else if (newPassword.length < 6) {
            errors.new = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            errors.confirm = 'Please confirm your new password';
        } else if (newPassword !== confirmPassword) {
            errors.confirm = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return !errors.current && !errors.new && !errors.confirm;
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) {
            return;
        }

        setIsChangingPassword(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user || !user.email) {
                Alert.alert('Error', 'No user logged in.');
                return;
            }

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            Alert.alert('Success', 'Password changed successfully!');
            
            // Reset form and close modal
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordErrors({ current: '', new: '', confirm: '' });
            setShowChangePassword(false);
            
        } catch (error) {
            console.log('Error changing password:', error);
            
            // Handle specific Firebase auth errors
            if (error.code === 'auth/wrong-password') {
                setPasswordErrors(prev => ({
                    ...prev,
                    current: 'Current password is incorrect'
                }));
            } else if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Error', 'For security reasons, please log in again before changing your password.');
            } else if (error.code === 'auth/weak-password') {
                setPasswordErrors(prev => ({
                    ...prev,
                    new: 'Password is too weak. Please choose a stronger password.'
                }));
            } else {
                Alert.alert('Error', 'Failed to change password. Please try again.');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

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
            textPrimary: '#1F2937',
            textSecondary: '#6B7280',
            accent: '#C76A51',
            border: '#E5E7EB',
            deleteButtonText: '#EF4444',
            deleteButtonBg: '#FEE2E2',
            error: '#DC2626',
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
                borderRadius: 20,
                marginBottom: 25,
                overflow: 'hidden',
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
            errorInput: {
                borderColor: theme.error,
            },
            errorText: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 12,
                color: theme.error,
                marginTop: 4,
                marginLeft: 4,
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
                borderRadius: 25,
                alignItems: 'center',
            },
            saveButtonDisabled: {
                backgroundColor: theme.textSecondary,
                opacity: 0.6,
            },
            saveButtonText: {
                fontFamily: 'Montserrat_600SemiBold',
                fontSize: 16,
                color: '#fff',
            },
            passwordRequirements: {
                marginTop: 8,
                padding: 12,
                backgroundColor: theme.backgroundSecondary,
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: theme.accent,
            },
            requirementText: {
                fontFamily: 'Montserrat_400Regular',
                fontSize: 12,
                color: theme.textSecondary,
                lineHeight: 16,
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
                        <TouchableOpacity style={themedStyles.deleteButton} onPress={deleteAccount}>
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

    const renderChangePasswordModal = () => (
        <View style={themedStyles.modalContainer}>
            <View style={themedStyles.modalHeader}>
                <TouchableOpacity onPress={() => setShowChangePassword(false)} style={themedStyles.modalBackButton}>
                    <Icon name="chevron-left" size={24} color={themedStyles.textPrimary} />
                </TouchableOpacity>
                <Text style={themedStyles.modalHeaderTitle}>Change Password</Text>
                <View style={themedStyles.modalHeaderSpacer} />
            </View>
            
            <ScrollView style={themedStyles.modalScrollView} showsVerticalScrollIndicator={false}>
                <View style={themedStyles.tabContent}>
                    <View style={themedStyles.inputGroup}>
                        <Text style={themedStyles.label}>Current Password</Text>
                        <TextInput
                            style={[
                                themedStyles.input,
                                passwordErrors.current && themedStyles.errorInput
                            ]}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Enter your current password"
                            placeholderTextColor={themedStyles.textSecondary}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {passwordErrors.current ? (
                            <Text style={themedStyles.errorText}>{passwordErrors.current}</Text>
                        ) : null}
                    </View>

                    <View style={themedStyles.inputGroup}>
                        <Text style={themedStyles.label}>New Password</Text>
                        <TextInput
                            style={[
                                themedStyles.input,
                                passwordErrors.new && themedStyles.errorInput
                            ]}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            placeholderTextColor={themedStyles.textSecondary}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {passwordErrors.new ? (
                            <Text style={themedStyles.errorText}>{passwordErrors.new}</Text>
                        ) : null}
                    </View>

                    <View style={themedStyles.inputGroup}>
                        <Text style={themedStyles.label}>Confirm New Password</Text>
                        <TextInput
                            style={[
                                themedStyles.input,
                                passwordErrors.confirm && themedStyles.errorInput
                            ]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            placeholderTextColor={themedStyles.textSecondary}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        {passwordErrors.confirm ? (
                            <Text style={themedStyles.errorText}>{passwordErrors.confirm}</Text>
                        ) : null}
                    </View>

                    <View style={themedStyles.passwordRequirements}>
                        <Text style={themedStyles.requirementText}>
                            • Password must be at least 6 characters long{'\n'}
                            • Use a combination of letters, numbers, and symbols for better security
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={themedStyles.saveButtonContainer}>
                <TouchableOpacity 
                    style={[
                        themedStyles.saveButton,
                        isChangingPassword && themedStyles.saveButtonDisabled
                    ]}
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                >
                    {isChangingPassword ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={themedStyles.saveButtonText}>Change Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

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
                                icon="lock-outline"
                                title="Change Password"
                                onPress={() => setShowChangePassword(true)}
                                themeStyles={themedStyles}
                                isLast={true}
                            />
                        </View>
                    </View>
                </ScrollView>

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

                {/* Change Password Modal */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showChangePassword}
                    onRequestClose={() => setShowChangePassword(false)}
                >
                    <SafeAreaView style={themedStyles.modalSafeArea}>
                        <StatusBar barStyle={"dark-content"} backgroundColor={'#F8F8F8'} />
                        {renderChangePasswordModal()}
                    </SafeAreaView>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

export default SettingsScreen;