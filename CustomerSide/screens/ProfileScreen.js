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
    Platform,
    Alert,
    Linking
} from 'react-native';
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from "@expo-google-fonts/league-spartan";
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from "@expo-google-fonts/montserrat";
import * as ImagePicker from 'expo-image-picker';
import BottomNavigationBar from '../components/BottomNavigationBar';

// --- Firebase Imports ---
import { auth, db } from '../Backend/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    // Request permission for image picker
    const requestPermissions = async () => {
        try {
            const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

            if (mediaLibraryStatus !== 'granted' || cameraStatus !== 'granted') {
                Alert.alert(
                    'Permissions Required',
                    'Camera and photo library permissions are needed to upload images. Please enable them in settings.',
                    [
                        { text: 'OK', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Permission request error:', error);
            Alert.alert('Error', 'Failed to request permissions. Please try again.');
            return false;
        }
    };

    // Convert image to base64 (adapted from ChatScreen.js)
    const convertImageToBase64 = async (fileUri, mimeType) => {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
            throw new Error('Only JPEG and PNG images are supported.');
        }

        setUploadProgress(0);
        console.log('🔄 Converting image to base64:', { fileUri, mimeType });

        try {
            const response = await fetch(fileUri);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = reader.result;
                    const dataUrl = `data:${mimeType};base64,${base64String.split(',')[1]}`;
                    
                    const base64Length = base64String.length;
                    const estimatedSize = (base64Length * 0.75);
                    
                    if (estimatedSize > 900000) {
                        reject(new Error('Image is too large. Please select a smaller image (under 900 KB).'));
                        return;
                    }

                    setUploadProgress(100);
                    setTimeout(() => setUploadProgress(0), 500);
                    resolve({
                        url: dataUrl,
                        type: 'image',
                        mimeType,
                    });
                };
                reader.onerror = () => {
                    console.error('❌ Failed to convert image to base64');
                    setUploadProgress(0);
                    reject(new Error('Failed to convert image to base64. Please try again.'));
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('❌ Image processing failed:', error);
            setUploadProgress(0);
            throw error;
        }
    };

    // Handle image upload
    const handleImageUpload = async () => {
        if (uploading) {
            Alert.alert('Processing in Progress', 'Please wait for the current operation to complete.');
            return;
        }

        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled && result.assets?.[0]) {
                setUploading(true);
                const asset = result.assets[0];
                const fileName = asset.fileName || `profile_${Date.now()}.jpg`;
                const mimeType = asset.mimeType || 'image/jpeg';

                if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
                    Alert.alert('Invalid Format', 'Please select a JPEG or PNG image.');
                    return;
                }

                const uploadResult = await convertImageToBase64(asset.uri, mimeType);

                // Update user document in Firestore
                const userDocRef = doc(db, "user", auth.currentUser.uid);
                await updateDoc(userDocRef, {
                    profilePic: uploadResult.url,
                    updatedAt: new Date(),
                });

                setProfilePic(uploadResult.url);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert(
                'Processing Failed',
                error.message || 'Failed to upload image. Please try again.',
                [
                    { text: 'OK', style: 'cancel' },
                    { text: 'Retry', onPress: handleImageUpload },
                ]
            );
        } finally {
            setUploading(false);
        }
    };

    // Fetch user data from Firebase
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    setEmail(currentUser.email);
                    const userDocRef = doc(db, "user", currentUser.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setName(userData.name || currentUser.displayName || 'No name set');
                        setProfilePic(userData.profilePic || null);
                    } else {
                        setName(currentUser.displayName || 'No name set');
                        setProfilePic(null);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user data for profile:", error);
                if (error.code === 'permission-denied') {
                    Alert.alert('Permission Error', 'Unable to access user data due to Firestore permissions.');
                } else {
                    Alert.alert('Error', 'Failed to fetch user data. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchUserData();
        }
    }, [isFocused]);

    // Function to open address in maps
    const openAddressInMaps = () => {
        const address = 'Brgy. Bulacao, Cebu City, Philippines';
        const encodedAddress = encodeURIComponent(address);
        
        // Try to open with Google Maps first, then fall back to Apple Maps
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;
        
        Linking.canOpenURL(googleMapsUrl).then(supported => {
            if (supported) {
                Linking.openURL(googleMapsUrl);
            } else {
                Linking.openURL(appleMapsUrl);
            }
        }).catch(err => {
            Alert.alert('Error', 'Could not open maps application');
            console.error('Error opening maps:', err);
        });
    };

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
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
    };

    // Fixed navigation function
    const handleNavigation = (screenName) => {
        try {
            // Try to use the current navigation first
            navigation.navigate(screenName);
        } catch (error) {
            console.error(`Navigation to ${screenName} failed:`, error);
            Alert.alert(
                'Navigation Error',
                `Cannot navigate to ${screenName}. Please make sure the screen is properly configured.`
            );
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
                    <TouchableOpacity onPress={handleImageUpload} disabled={uploading}>
                        <View style={styles.avatarContainer}>
                            {profilePic ? (
                                <Image source={{ uri: profilePic }} style={styles.avatar} />
                            ) : (
                                <Image source={require('../assets/profile.png')} style={styles.avatar} />
                            )}
                            <View style={styles.uploadIcon}>
                                <Icon name="camera" size={20} color="#fff" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    {uploading && uploadProgress > 0 && uploadProgress < 100 && (
                        <View style={styles.uploadProgressContainer}>
                            <View style={styles.uploadProgressHeader}>
                                <Text style={styles.uploadProgressText}>Processing image... {uploadProgress}%</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setUploadProgress(0);
                                        setUploading(false);
                                        Alert.alert('Processing Canceled', 'Image processing has been canceled.');
                                    }}
                                >
                                    <Icon name="close" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                            </View>
                        </View>
                    )}
                    <Text style={[styles.userName, loading && styles.skeletonName]}>
                        {loading ? ' ' : name}
                    </Text>
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
                    
                    {/* About Us Section - Added before Settings */}
                    <TouchableOpacity 
                        style={[styles.menuItem, styles.aboutUsItem]} 
                        onPress={() => handleNavigation('AboutUsScreen')}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={styles.iconCircle}>
                                <Icon name="information-outline" size={24} color="#A68B69" />
                            </View>
                            <Text style={styles.menuItemText}>About Us</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#777" />
                    </TouchableOpacity>
                    
                    <MenuItem
                        icon="cog-outline"
                        title="Setting"
                        onPress={() => handleNavigation('SettingScreen')}
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
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    uploadIcon: {
        position: 'absolute',
        bottom: 10,
        right: 0,
        backgroundColor: '#A68B69',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadProgressContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    uploadProgressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    uploadProgressText: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '500',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#A68B69',
        borderRadius: 4,
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
    aboutUsItem: {
        // Additional styling if needed for About Us item
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
    addressSection: {
        width: '100%',
        marginBottom: 20,
    },
    sectionTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        color: '#000',
        marginBottom: 12,
        marginLeft: 5,
    },
    addressCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    addressIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F3EFE9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    addressTextContainer: {
        flex: 1,
    },
    addressTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#000',
        marginBottom: 4,
    },
    addressText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
    },
    addressLink: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 12,
        color: '#A68B69',
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