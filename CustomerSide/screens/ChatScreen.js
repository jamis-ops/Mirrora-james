// screens/ChatScreen.js - Complete with Customization Support
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  StatusBar,
  Image,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
// Firebase imports
import { db, auth, storage } from '../Backend/firebaseConfig.js';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

const { width: screenWidth } = Dimensions.get('window');

const ChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState(null);
  const flatListRef = useRef();

  // App ID constant
  const appId = 'mirrora-app';

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.fullName || userData.firstName || userData.name || 'User');
          } else {
            setUserName('User');
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setUserName('User');
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const sendWelcomeMessage = async () => {
    if (!user) return;
    const messagesRef = collection(db, `artifacts/${appId}/public/data/chats/${user.uid}/messages`);
    
    try {
      setIsTyping(true);
      setTimeout(async () => {
        try {
          await addDoc(messagesRef, {
            text: 'Hello! Welcome to Mirrora 🪞 How can I help you find the perfect mirror today?',
            timestamp: serverTimestamp(),
            senderId: 'mirrora-admin', 
            senderName: 'Mirrora Support',
            senderAvatar: 'MS',
            messageType: 'text',
          });
        } catch (error) {
          console.error("Error sending welcome message: ", error);
        }
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error("Error in sendWelcomeMessage: ", error);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (user) {
      const messagesRef = collection(db, `artifacts/${appId}/public/data/chats/${user.uid}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
          sendWelcomeMessage();
        }
        
        const fetchedMessages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate(),
          };
        });
        setMessages(fetchedMessages);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching messages: ", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const uploadFileToFirebase = async (fileUri, fileName, mimeType) => {
    try {
      setUploadProgress(0);
      console.log('🔄 Starting upload:', { fileUri, fileName, mimeType });

      if (!auth.currentUser) {
        throw new Error('Authentication required. Please sign in again.');
      }

      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          throw new Error('Selected file no longer exists. Please try selecting again.');
        }
        console.log('✅ File exists:', fileInfo);
      } catch (fileInfoError) {
        console.error('❌ Error getting file info:', fileInfoError);
        throw new Error('Unable to access the selected file. Please try selecting again.');
      }

      let blob;
      try {
        console.log('📁 Reading file as base64...');
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
        
        console.log('✅ Blob created from base64:', { size: blob.size, type: blob.type });
      } catch (base64Error) {
        console.log('⚠️ Base64 method failed, trying fetch method...');
        
        try {
          const response = await fetch(fileUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
          }
          blob = await response.blob();
          console.log('✅ Blob created from fetch:', { size: blob.size, type: blob.type });
        } catch (fetchError) {
          console.error('❌ Both upload methods failed:', { base64Error, fetchError });
          throw new Error('Unable to read the selected file. Please try a different file.');
        }
      }

      if (!blob || blob.size === 0) {
        throw new Error('File appears to be empty or corrupted. Please select a different file.');
      }

      if (blob.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB. Please select a smaller file.');
      }

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);
      const storagePath = `chat-files/${user.uid}/${timestamp}_${randomId}_${safeFileName}`;

      console.log('📤 Uploading to path:', storagePath);
      console.log('📤 User authenticated:', !!auth.currentUser, 'UID:', auth.currentUser?.uid);

      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: mimeType,
        customMetadata: {
          uploadedBy: user.uid,
          originalName: fileName,
          uploadTimestamp: timestamp.toString(),
        },
      });

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgress(progress);
            console.log('📊 Upload progress:', progress + '%');
          },
          (error) => {
            console.error('❌ Upload failed:', error);
            setUploadProgress(0);
            
            let errorMessage = 'Upload failed. Please try again.';
            
            if (error.code) {
              switch (error.code) {
                case 'storage/unauthorized':
                  errorMessage = 'Upload permission denied. Please check your Firebase Storage rules or contact support.';
                  break;
                case 'storage/canceled':
                  errorMessage = 'Upload was canceled.';
                  break;
                case 'storage/quota-exceeded':
                  errorMessage = 'Storage quota exceeded. Please try a smaller file or contact support.';
                  break;
                case 'storage/unauthenticated':
                  errorMessage = 'Authentication expired. Please sign in again.';
                  break;
                case 'storage/retry-limit-exceeded':
                  errorMessage = 'Network error. Please check your connection and try again.';
                  break;
                case 'storage/invalid-format':
                case 'storage/invalid-argument':
                  errorMessage = 'Invalid file format. Please try a different file.';
                  break;
                case 'storage/server-file-wrong-size':
                  errorMessage = 'File size mismatch. Please try uploading again.';
                  break;
                default:
                  if (error.message.includes('network')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                  } else if (error.message.includes('permission')) {
                    errorMessage = 'Permission denied. Please contact support.';
                  } else {
                    errorMessage = `Upload error: ${error.message}`;
                  }
              }
            }
            
            reject(new Error(errorMessage));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ Upload successful! Download URL:', downloadURL);
              setUploadProgress(0);
              
              resolve({
                url: downloadURL,
                name: fileName,
                size: blob.size,
                type: mimeType,
                path: storagePath,
              });
            } catch (urlError) {
              console.error('❌ Failed to get download URL:', urlError);
              setUploadProgress(0);
              reject(new Error('Upload completed but failed to get download link. Please try again.'));
            }
          }
        );
      });

    } catch (error) {
      console.error('❌ Upload preparation failed:', error);
      setUploadProgress(0);
      throw error;
    }
  };

  const requestPermissions = async () => {
    try {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Camera and photo library permissions are required to use this feature. Please enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // Deep linking to settings can be implemented here if needed
            }}
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const handleAttachment = () => {
    if (sendingMessage) {
      Alert.alert('Upload in Progress', 'Please wait for the current upload to complete.');
      return;
    }

    Alert.alert(
      'Select Attachment',
      'Choose the type of file you want to send',
      [
        { text: 'Camera', onPress: handleCamera },
        { text: 'Photo Library', onPress: handleImagePicker },
        { text: 'Document', onPress: handleDocumentPicker },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const fileName = `camera_${Date.now()}.jpg`;
        await sendFileMessage(asset.uri, fileName, 'image/jpeg', asset.fileSize);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        await sendFileMessage(asset.uri, fileName, mimeType, asset.fileSize);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Image Selection Error', 'Failed to select image. Please try again.');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        
        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }
        
        const mimeType = asset.mimeType || 'application/octet-stream';
        await sendFileMessage(asset.uri, asset.name, mimeType, asset.size);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Document Selection Error', 'Failed to select document. Please try again.');
    }
  };

  const sendFileMessage = async (fileUri, fileName, mimeType, fileSize) => {
    if (!user || sendingMessage || !fileUri || !fileName) {
      return;
    }

    setSendingMessage(true);

    try {
      console.log('🚀 Starting file message send:', { fileUri, fileName, mimeType, fileSize });
      
      const uploadResult = await uploadFileToFirebase(fileUri, fileName, mimeType);
      
      if (!uploadResult?.url) {
        throw new Error('Upload failed - no download URL received');
      }

      const fileType = mimeType?.startsWith('image/') ? 'image' : 'document';
      const messageText = fileType === 'image' ? 'Sent an image' : `Sent a file: ${fileName}`;

      const messageData = {
        text: messageText,
        timestamp: serverTimestamp(),
        senderId: user.uid,
        senderName: userName,
        senderAvatar: userName.substring(0, 2).toUpperCase(),
        messageType: 'file',
        fileData: {
          url: uploadResult.url,
          name: fileName,
          type: fileType,
          size: uploadResult.size,
          mimeType: mimeType,
          path: uploadResult.path,
        },
      };

      const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}`);
      const messagesRef = collection(chatThreadRef, 'messages');

      await setDoc(chatThreadRef, {
        lastMessage: messageText,
        timestamp: serverTimestamp(),
        userName: userName,
        userAvatar: userName.substring(0, 2).toUpperCase(),
        isRead: false,
      }, { merge: true });

      await addDoc(messagesRef, messageData);
      
      console.log('✅ File message sent successfully');
      
    } catch (error) {
      console.error('❌ File message send failed:', error);
      
      Alert.alert(
        'Upload Failed', 
        error.message || 'Failed to send file. Please try again.',
        [
          { text: 'OK' },
          { text: 'Retry', onPress: () => sendFileMessage(fileUri, fileName, mimeType, fileSize) }
        ]
      );
    } finally {
      setSendingMessage(false);
      setUploadProgress(0);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim() === '' || !user || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    try {
      const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}`);
      const messagesRef = collection(chatThreadRef, 'messages');
      
      await setDoc(chatThreadRef, {
        lastMessage: messageText,
        timestamp: serverTimestamp(),
        userName: userName,
        userAvatar: userName.substring(0, 2).toUpperCase(),
        isRead: false,
      }, { merge: true });

      await addDoc(messagesRef, {
        text: messageText,
        timestamp: serverTimestamp(),
        senderId: user.uid,
        senderName: userName,
        senderAvatar: userName.substring(0, 2).toUpperCase(),
        messageType: 'text',
      });
      
    } catch (error) {
      console.error("Error sending message: ", error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };
  
  const handleDeleteMessage = (messageId) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              const messageDocRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}/messages`, messageId);
              await deleteDoc(messageDocRef);
            } catch (error) {
              console.error("Error deleting message: ", error);
              Alert.alert('Error', 'Failed to delete message. Please try again.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCustomizationPress = (customizationData) => {
    setSelectedCustomization(customizationData);
    setShowCustomizationModal(true);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderCustomizationAttachment = (customizationData, isUserMessage) => {
    if (!customizationData) return null;

    const { productInfo, dimensions, frameStyle, frameColor, mirrorType, budget, additionalFeatures } = customizationData;

    return (
      <TouchableOpacity 
        style={[styles.customizationAttachment, isUserMessage && styles.userCustomizationAttachment]}
        onPress={() => handleCustomizationPress(customizationData)}
      >
        <View style={styles.customizationHeader}>
          <Icon name="tools" size={20} color={isUserMessage ? "#FFFFFF" : "#A67B5B"} />
          <Text style={[styles.customizationTitle, isUserMessage && styles.userCustomizationText]}>
            Customization Request
          </Text>
        </View>
        
        <View style={styles.customizationPreview}>
          <Text style={[styles.customizationProduct, isUserMessage && styles.userCustomizationText]}>
            {productInfo?.name || 'Unknown Product'}
          </Text>
          <Text style={[styles.customizationDetail, isUserMessage && styles.userCustomizationText]}>
            {dimensions?.height}×{dimensions?.width} cm • {frameStyle} • {frameColor}
          </Text>
          <Text style={[styles.customizationDetail, isUserMessage && styles.userCustomizationText]}>
            Budget: ₱{budget}
          </Text>
        </View>

        <View style={styles.customizationFooter}>
          <Text style={[styles.customizationViewText, isUserMessage && styles.userCustomizationText]}>
            Tap to view details
          </Text>
          <Icon name="chevron-right" size={16} color={isUserMessage ? "#FFFFFF" : "#6B7280"} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFileAttachment = (fileData, isUserMessage) => {
    if (!fileData?.url) {
      return (
        <View style={[styles.errorAttachment, isUserMessage && styles.userErrorAttachment]}>
          <Icon name="alert-circle" size={20} color={isUserMessage ? "#FFFFFF" : "#EF4444"} />
          <Text style={[styles.errorText, isUserMessage && styles.userErrorText]}>
            File unavailable
          </Text>
        </View>
      );
    }

    if (fileData.type === 'image') {
      return (
        <TouchableOpacity onPress={() => handleImagePress(fileData.url)}>
          <Image 
            source={{ uri: fileData.url }} 
            style={styles.imageAttachment}
            resizeMode="cover"
            onError={() => console.error('Image load error for:', fileData.url)}
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={[styles.documentAttachment, isUserMessage && styles.userDocumentAttachment]}
        onPress={() => {
          Alert.alert(
            'Open File',
            `Would you like to open ${fileData.name}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open', 
                onPress: () => Alert.alert('Info', 'File opening feature coming soon.')
              }
            ]
          );
        }}
      >
        <View style={styles.documentIcon}>
          <Icon name="file-document-outline" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.documentInfo}>
          <Text style={[styles.documentName, isUserMessage && styles.userDocumentText]} numberOfLines={1}>
            {fileData.name}
          </Text>
          <Text style={[styles.documentSize, isUserMessage && styles.userDocumentText]}>
            {formatFileSize(fileData.size)}
          </Text>
        </View>
        <Icon name="download" size={20} color={isUserMessage ? "#FFFFFF" : "#6B7280"} />
      </TouchableOpacity>
    );
  };

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.supportAvatarGradient}>
          <Text style={styles.avatarText}>MS</Text>
        </View>
      </View>
      <View style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  const renderMessage = ({ item, index }) => { 
    const isUserMessage = item.senderId === user?.uid;
    const isLastMessage = index === messages.length - 1;
    const hasFileAttachment = item.messageType === 'file' && item.fileData;
    const hasCustomizationAttachment = item.messageType === 'customization_request' && item.customizationData;
    
    return (
      <TouchableOpacity
        onLongPress={() => isUserMessage && handleDeleteMessage(item.id)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.messageRow, 
          { justifyContent: isUserMessage ? 'flex-end' : 'flex-start' },
          isLastMessage && styles.lastMessage
        ]}>
          {!isUserMessage && (
            <View style={styles.avatarContainer}>
              <View style={styles.supportAvatarGradient}>
                <Text style={styles.avatarText}>{item.senderAvatar || 'MS'}</Text>
              </View>
            </View>
          )}

          <View style={[
            styles.messageBubble, 
            isUserMessage ? styles.userBubble : styles.supportBubble,
            (hasFileAttachment || hasCustomizationAttachment) && styles.fileMessageBubble
          ]}>
            {hasFileAttachment && renderFileAttachment(item.fileData, isUserMessage)}
            {hasCustomizationAttachment && renderCustomizationAttachment(item.customizationData, isUserMessage)}
            
            <Text 
              style={isUserMessage ? styles.userBubbleText : styles.supportBubbleText}
              numberOfLines={0}
            >
              {item.text || 'No message content'}
            </Text>
            <Text style={[styles.timestamp, isUserMessage && styles.userTimestamp]}>
              {item.timestamp ? item.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 'Sending...'}
            </Text>
          </View>

          {isUserMessage && (
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatarGradient}>
                <Text style={styles.avatarText}>
                  {userName.substring(0, 1).toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#A67B5B" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatarContainer}>
              <View style={styles.headerAvatarGradient}>
                <Icon name="account-tie" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Mirrora Support</Text>
              <Text style={styles.headerSubtitle}>
                {isTyping ? 'typing...' : 'Online • Usually replies instantly'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.moreButton}
            activeOpacity={0.7}
          >
            <Icon name="dots-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A67B5B" />
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : (
            <>
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
              {isTyping && <TypingIndicator />}
            </>
          )}
          
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.uploadProgressContainer}>
              <View style={styles.uploadProgressHeader}>
                <Text style={styles.uploadProgressText}>
                  Uploading file... {uploadProgress}%
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    Alert.alert('Cancel Upload', 'Upload cancellation will be available in a future update.');
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
          
          {/* Input Container */}
          <View style={[
            styles.inputOuterContainer,
            keyboardVisible && styles.inputOuterContainerKeyboard
          ]}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                maxLength={1000}
                editable={!sendingMessage}
              />
              
              <View style={styles.inputActions}>
                <TouchableOpacity 
                  style={styles.attachButton}
                  onPress={handleAttachment}
                  activeOpacity={0.7}
                  disabled={sendingMessage}
                >
                  <Icon 
                    name="attachment" 
                    size={22} 
                    color={sendingMessage ? "#9CA3AF" : "#6B7280"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    (newMessage.trim() && !sendingMessage) && styles.sendButtonActive
                  ]} 
                  onPress={handleSend}
                  disabled={!newMessage.trim() || sendingMessage}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.sendButtonGradient,
                    (newMessage.trim() && !sendingMessage) && styles.sendButtonGradientActive
                  ]}>
                    {sendingMessage ? (
                      <ActivityIndicator size={16} color="#FFFFFF" />
                    ) : (
                      <Icon 
                        name={newMessage.trim() ? "send" : "send-outline"} 
                        size={20} 
                        color="#FFFFFF" 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Image Preview Modal */}
        <Modal
          visible={showImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalOverlay}
              onPress={() => setShowImageModal(false)}
            >
              <View style={styles.modalContent}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowImageModal(false)}
                >
                  <Icon name="close" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                {selectedImage && (
                  <Image 
                    source={{ uri: selectedImage }} 
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Customization Details Modal */}
        <Modal
          visible={showCustomizationModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCustomizationModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.customizationModal}>
              <View style={styles.customizationModalHeader}>
                <Text style={styles.customizationModalTitle}>Customization Request</Text>
                <TouchableOpacity 
                  style={styles.closeModalButton}
                  onPress={() => setShowCustomizationModal(false)}
                >
                  <Icon name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              
              {selectedCustomization && (
                <ScrollView style={styles.customizationModalContent}>
                  <View style={styles.customizationModalSection}>
                    <Text style={styles.customizationModalSectionTitle}>Product</Text>
                    <Text style={styles.customizationModalText}>
                      {selectedCustomization.productInfo?.name}
                    </Text>
                    <Text style={styles.customizationModalPrice}>
                      Base Price: ₱{selectedCustomization.productInfo?.price}
                    </Text>
                  </View>

                  <View style={styles.customizationModalSection}>
                    <Text style={styles.customizationModalSectionTitle}>Dimensions</Text>
                    <Text style={styles.customizationModalText}>
                      {selectedCustomization.dimensions?.height} × {selectedCustomization.dimensions?.width} cm
                      {selectedCustomization.dimensions?.depth && ` × ${selectedCustomization.dimensions.depth} cm`}
                    </Text>
                  </View>

                  <View style={styles.customizationModalSection}>
                    <Text style={styles.customizationModalSectionTitle}>Specifications</Text>
                    <Text style={styles.customizationModalText}>Frame: {selectedCustomization.frameStyle}</Text>
                    <Text style={styles.customizationModalText}>Color: {selectedCustomization.frameColor}</Text>
                    <Text style={styles.customizationModalText}>Mirror: {selectedCustomization.mirrorType}</Text>
                    <Text style={styles.customizationModalText}>Mounting: {selectedCustomization.mountingType}</Text>
                  </View>

                  {selectedCustomization.additionalFeatures?.length > 0 && (
                    <View style={styles.customizationModalSection}>
                      <Text style={styles.customizationModalSectionTitle}>Additional Features</Text>
                      {selectedCustomization.additionalFeatures.map((feature, index) => (
                        <Text key={index} style={styles.customizationModalText}>• {feature}</Text>
                      ))}
                    </View>
                  )}

                  <View style={styles.customizationModalSection}>
                    <Text style={styles.customizationModalSectionTitle}>Budget</Text>
                    <Text style={styles.customizationModalText}>₱{selectedCustomization.budget}</Text>
                  </View>

                  {selectedCustomization.deliveryDate && (
                    <View style={styles.customizationModalSection}>
                      <Text style={styles.customizationModalSectionTitle}>Preferred Delivery</Text>
                      <Text style={styles.customizationModalText}>{selectedCustomization.deliveryDate}</Text>
                    </View>
                  )}

                  {selectedCustomization.specialInstructions && (
                    <View style={styles.customizationModalSection}>
                      <Text style={styles.customizationModalSectionTitle}>Special Instructions</Text>
                      <Text style={styles.customizationModalText}>{selectedCustomization.specialInstructions}</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.customizationModalButton}
                    onPress={() => setShowCustomizationModal(false)}
                  >
                    <Text style={styles.customizationModalButtonText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#A67B5B'
  },
  container: { 
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#A67B5B',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatarGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5E3C',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#A67B5B',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chatContainer: { 
    flex: 1,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 16,
  },
  messageList: { 
    padding: 20, 
    flexGrow: 1,
    paddingBottom: 10,
  },
  messageRow: { 
    flexDirection: 'row', 
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  lastMessage: {
    marginBottom: 10,
  },
  avatarContainer: {
    marginRight: 10,
    marginBottom: 5,
  },
  userAvatarContainer: {
    marginLeft: 10,
    marginBottom: 5,
  },
  supportAvatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A67B5B',
  },
  userAvatarGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5E3C',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '75%',
    minWidth: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  fileMessageBubble: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  userBubble: { 
    backgroundColor: '#A67B5B',
    borderBottomRightRadius: 6,
    marginLeft: 20,
    alignSelf: 'flex-end',
  },
  supportBubble: { 
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    marginRight: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubbleText: { 
    color: '#FFFFFF', 
    fontSize: 16,
    lineHeight: 22,
  },
  supportBubbleText: { 
    color: '#374151', 
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: { 
    fontSize: 11, 
    color: '#6B7280', 
    alignSelf: 'flex-end', 
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    padding: 16,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.6,
  },
  dot2: {
    opacity: 0.8,
  },
  dot3: {
    opacity: 1,
  },
  // File attachment styles
  imageAttachment: {
    width: screenWidth * 0.5,
    height: screenWidth * 0.4,
    borderRadius: 12,
    marginBottom: 8,
  },
  documentAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userDocumentAttachment: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A67B5B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  documentSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  userDocumentText: {
    color: '#FFFFFF',
  },
  // Error attachment styles
  errorAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  userErrorAttachment: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
  },
  userErrorText: {
    color: '#FFFFFF',
  },
  // Customization attachment styles
  customizationAttachment: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: screenWidth * 0.7,
  },
  userCustomizationAttachment: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  customizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A67B5B',
    marginLeft: 8,
  },
  userCustomizationText: {
    color: '#FFFFFF',
  },
  customizationPreview: {
    marginBottom: 8,
  },
  customizationProduct: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  customizationDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  customizationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  customizationViewText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  // Upload progress styles
  uploadProgressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  uploadProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadProgressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A67B5B',
    borderRadius: 3,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  // Customization modal styles
  customizationModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
  },
  customizationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  customizationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeModalButton: {
    padding: 5,
  },
  customizationModalContent: {
    padding: 20,
    maxHeight: '90%',
  },
  customizationModalSection: {
    marginBottom: 16,
  },
  customizationModalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A67B5B',
    marginBottom: 8,
  },
  customizationModalText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
    lineHeight: 20,
  },
  customizationModalPrice: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  customizationModalButton: {
    backgroundColor: '#A67B5B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  customizationModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputOuterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  inputOuterContainerKeyboard: {
    paddingBottom: Platform.OS === 'ios' ? 15 : 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 5,
    maxHeight: 100,
    lineHeight: 20,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  attachButton: {
    padding: 8,
    marginRight: 5,
  },
  sendButton: {
    padding: 2,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9CA3AF',
  },
  sendButtonGradientActive: {
    backgroundColor: '#A67B5B',
  },
  sendButtonActive: {
    // Additional styling for active state
  },
});

export default ChatScreen;