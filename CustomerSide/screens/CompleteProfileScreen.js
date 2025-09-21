import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    ScrollView,
    Platform,
    Modal,
    Pressable,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFonts as useLeagueSpartan, LeagueSpartan_700Bold } from '@expo-google-fonts/league-spartan';
import { useFonts as useMontserrat, Montserrat_400Regular, Montserrat_600SemiBold } from '@expo-google-fonts/montserrat';
import * as ImagePicker from 'expo-image-picker';

// --- Firebase Imports ---
import { auth, db } from '../Backend/firebaseConfig';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function CompleteProfileScreen() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [leagueSpartanLoaded] = useLeagueSpartan({ LeagueSpartan_700Bold });
    const [montserratLoaded] = useMontserrat({ Montserrat_400Regular, Montserrat_600SemiBold });

    // Phone number validation
    const handlePhoneNumberChange = (text) => {
        const cleanedText = text.replace(/[^0-9]/g, '');
        if (cleanedText.length <= 10) {
            setPhoneNumber(cleanedText);
        }
    };

    // Request permissions
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

    // Convert image to base64
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

    // Profile image selection
    const pickImage = async () => {
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
                const mimeType = asset.mimeType || 'image/jpeg';

                if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
                    Alert.alert('Invalid Format', 'Please select a JPEG or PNG image.');
                    return;
                }

                const uploadResult = await convertImageToBase64(asset.uri, mimeType);
                setProfilePic(uploadResult.url);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert(
                'Processing Failed',
                error.message || 'Failed to pick image. Please try again.',
                [
                    { text: 'OK', style: 'cancel' },
                    { text: 'Retry', onPress: pickImage },
                ]
            );
        } finally {
            setUploading(false);
        }
    };

    // Fetch existing profile data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && !auth.currentUser) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                }

                const currentUser = auth.currentUser;
                if (currentUser) {
                    const userDocRef = doc(db, 'user', currentUser.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setName(userData.name || currentUser.displayName || '');
                        setPhoneNumber(userData.phoneNumber || '');
                        setGender(userData.gender || '');
                        setProfilePic(userData.profilePic || null);
                    } else {
                        setName(currentUser.displayName || '');
                        setProfilePic(null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                Alert.alert('Error', 'Could not load profile data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Save profile data
    const handleSaveProfile = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            Alert.alert('Error', 'User not authenticated.');
            return;
        }

        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter your full name.');
            return;
        }

        if (phoneNumber && phoneNumber.length !== 10) {
            Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
            return;
        }

        setSaving(true);
        try {
            const userDocRef = doc(db, 'user', currentUser.uid);
            await setDoc(userDocRef, {
                name: name,
                phoneNumber: phoneNumber,
                gender: gender,
                profilePic: profilePic,
                email: currentUser.email,
                updatedAt: new Date(),
            }, { merge: true });

            Alert.alert('Success', 'Your profile has been updated.');
            navigation.goBack();
        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', 'Could not update your profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!leagueSpartanLoaded || !montserratLoaded) {
        return null;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#A68B69" />
            </View>
        );
    }

    const GenderModal = () => {
        const genders = ['Female', 'Male', 'Other'];
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.centeredView} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Select Gender</Text>
                        {genders.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.genderOption}
                                onPress={() => {
                                    setGender(item);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={styles.genderOptionText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Complete Your Profile</Text>
                    <Text style={styles.headerSubtitle}>
                        Don't worry, only you can see your personal data. No one else will be able to see it.
                    </Text>
                </View>

                {/* Profile Picture Section */}
                <View style={styles.profileImageContainer}>
                    {profilePic ? (
                        <Image 
                            source={{ uri: profilePic }} 
                            style={styles.profileImage}
                        />
                    ) : (
                        <Icon name="account" size={80} color="#A68B69" />
                    )}
                    <TouchableOpacity style={styles.editIcon} onPress={pickImage} disabled={uploading}>
                        {uploading && uploadProgress > 0 && uploadProgress < 100 ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Icon name="pencil" size={16} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>
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

                {/* Form Inputs */}
                <View style={styles.formSection}>
                    {/* Name Input */}
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Phone Number Input */}
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.phoneInputContainer}>
                        <View style={styles.countryCodeContainer}>
                            <Text style={styles.countryCodeText}>+63</Text>
                            <Icon name="chevron-down" size={16} color="#999" />
                        </View>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="9123456789"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={handlePhoneNumberChange}
                            maxLength={10}
                        />
                    </View>
                    {phoneNumber.length > 0 && phoneNumber.length < 10 && (
                        <Text style={styles.errorText}>Phone number must be 10 digits</Text>
                    )}

                    {/* Gender Dropdown */}
                    <Text style={styles.label}>Gender</Text>
                    <TouchableOpacity style={styles.dropdownContainer} onPress={() => setModalVisible(true)}>
                        <Text style={[styles.dropdownValue, !gender && styles.placeholderText]}>
                            {gender || 'Select'}
                        </Text>
                        <Icon name="chevron-down" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Complete Profile Button */}
                <TouchableOpacity 
                    style={[styles.completeButton, (saving || uploading) && styles.disabledButton]} 
                    onPress={handleSaveProfile} 
                    disabled={saving || uploading}
                >
                    {saving || uploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.completeButtonText}>Complete Profile</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Gender Selection Modal */}
            <GenderModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F2EC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F2EC',
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 35,
        paddingHorizontal: 5,
    },
    headerTitle: {
        fontFamily: 'LeagueSpartan_700Bold',
        fontSize: 32,
        color: '#2C2C2C',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 38,
    },
    headerSubtitle: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    profileImageContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#E8E2D7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
        position: 'relative',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
    },
    editIcon: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
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
    formSection: {
        width: '100%',
        marginBottom: 40,
    },
    label: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 16,
        color: '#2C2C2C',
        marginBottom: 5,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        marginBottom: 24,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#2C2C2C',
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
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        height: 45,
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
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRightWidth: 1,
        borderRightColor: '#E5E5E5',
        height: '100%',
        justifyContent: 'center',
        minWidth: 80,
    },
    countryCodeText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        marginRight: 6,
        color: '#2C2C2C',
    },
    phoneInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#2C2C2C',
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        height: 45,
        justifyContent: 'space-between',
        marginBottom: 24,
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
    dropdownValue: {
        flex: 1,
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
        color: '#2C2C2C',
    },
    placeholderText: {
        color: '#999',
    },
    completeButton: {
        width: '100%',
        backgroundColor: '#A68B69',
        paddingVertical: 18,
        alignItems: 'center',
        borderRadius: 28,
        marginTop: -25,
        ...Platform.select({
            ios: {
                shadowColor: '#A68B69',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    disabledButton: {
        opacity: 0.6,
    },
    completeButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 18,
        letterSpacing: 0.5,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginBottom: 16,
        marginLeft: 4,
        fontFamily: 'Montserrat_400Regular',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',    
    },
    genderOption: {
        padding: 10,
        width: '100%',
        alignItems: 'center',
    },
    genderOptionText: {
        fontFamily: 'Montserrat_400Regular',
        fontSize: 16,
    },
});