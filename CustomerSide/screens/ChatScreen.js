import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { db, auth, appId } from '../Backend/firebaseConfig.js';
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
  deleteDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { width: screenWidth } = Dimensions.get('window');

const ChatScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
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
          if (error.code === 'resource-exhausted') {
            Alert.alert('Quota Exceeded', 'Firestore quota limit reached. User data may not display correctly.');
          }
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
          if (error.code === 'resource-exhausted') {
            Alert.alert('Quota Exceeded', 'Unable to send welcome message due to Firestore quota limits.');
          }
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

        const fetchedMessages = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });
        setMessages(fetchedMessages);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching messages: ", error);
        if (error.code === 'resource-exhausted') {
          Alert.alert('Quota Exceeded', 'Unable to fetch messages due to Firestore quota limits. Displaying local messages.');
          setLoading(false);
        } else {
          Alert.alert('Error', 'Failed to fetch messages. Please try again.');
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (isFocused && user) {
      const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}`);
      const updateLastRead = async () => {
        try {
          await setDoc(chatThreadRef, { userLastRead: serverTimestamp() }, { merge: true });
        } catch (error) {
          console.error('Error updating last read:', error);
        }
      };
      updateLastRead();
    }
  }, [isFocused, user]);

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

  const sendFileMessage = async (fileUri, fileName, mimeType, fileSize) => {
    if (!user || sendingMessage || !fileUri || !fileName) {
      Alert.alert('Error', 'Cannot send file. Please try again.');
      return;
    }

    setSendingMessage(true);

    try {
      const uploadResult = await convertImageToBase64(fileUri, mimeType);

      const messageText = 'Sent an image';
      const messageData = {
        id: `local-${Date.now()}`,
        text: messageText,
        timestamp: new Date(),
        senderId: user.uid,
        senderName: userName,
        senderAvatar: userName.substring(0, 2).toUpperCase(),
        messageType: 'file',
        fileData: {
          url: uploadResult.url,
          name: fileName,
          type: 'image',
          size: fileSize,
          mimeType: mimeType,
        },
      };

      setMessages((prevMessages) => [...prevMessages, messageData]);

      const chatThreadRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}`);
      const messagesRef = collection(chatThreadRef, 'messages');

      await setDoc(chatThreadRef, {
        lastMessage: messageText,
        timestamp: serverTimestamp(),
        userName: userName,
        userAvatar: userName.substring(0, 2).toUpperCase(),
        isRead: false,
      }, { merge: true });

      const docRef = await addDoc(messagesRef, {
        text: messageText,
        timestamp: serverTimestamp(),
        senderId: user.uid,
        senderName: userName,
        senderAvatar: userName.substring(0, 2).toUpperCase(),
        messageType: 'file',
        fileData: {
          url: uploadResult.url,
          name: fileName,
          type: 'image',
          size: fileSize,
          mimeType: mimeType,
        },
      });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageData.id ? { ...msg, id: docRef.id } : msg
        )
      );

      console.log('✅ Image message sent successfully to Firestore');
    } catch (error) {
      console.error('❌ Image message send failed:', error);
      if (error.code === 'resource-exhausted') {
        Alert.alert(
          'Quota Exceeded',
          'Unable to send image to admin due to Firestore quota limits. Image is displayed locally.',
          [{ text: 'OK', style: 'cancel' }]
        );
        const messageText = 'Sent an image (local only)';
        const messageData = {
          id: `local-${Date.now()}`,
          text: messageText,
          timestamp: new Date(),
          senderId: user.uid,
          senderName: userName,
          senderAvatar: userName.substring(0, 2).toUpperCase(),
          messageType: 'file',
          fileData: {
            url: fileUri,
            name: fileName,
            type: 'image',
            size: fileSize,
            mimeType: mimeType,
          },
        };
        setMessages((prevMessages) => [...prevMessages, messageData]);
      } else {
        Alert.alert(
          'Processing Failed',
          error.message || 'Failed to send image. Please try again.',
          [
            { text: 'OK', style: 'cancel' },
            { text: 'Retry', onPress: () => sendFileMessage(fileUri, fileName, mimeType, fileSize) },
          ]
        );
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAttachment = () => {
    if (sendingMessage) {
      Alert.alert('Processing in Progress', 'Please wait for the current operation to complete.');
      return;
    }

    Alert.alert(
      'Select Attachment',
      'Choose the type of attachment to send',
      [
        { text: 'Camera', onPress: handleCamera },
        { text: 'Photo Library', onPress: handleImagePicker },
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
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const fileName = `camera_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        await sendFileMessage(asset.uri, fileName, mimeType, asset.fileSize || 0);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `image_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
          Alert.alert('Invalid Format', 'Please select a JPEG or PNG image.');
          return;
        }
        await sendFileMessage(asset.uri, fileName, mimeType, asset.fileSize || 0);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
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
      console.error('Error sending message: ', error);
      if (error.code === 'resource-exhausted') {
        Alert.alert(
          'Quota Exceeded',
          'Unable to send message due to Firestore quota limits. Saving locally.',
          [{ text: 'OK', style: 'cancel' }]
        );
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: `local-${Date.now()}`,
            text: messageText,
            timestamp: new Date(),
            senderId: user.uid,
            senderName: userName,
            senderAvatar: userName.substring(0, 2).toUpperCase(),
            messageType: 'text',
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
        setNewMessage(messageText);
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (messageId.startsWith('local-')) {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
      return;
    }

    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const messageDocRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}/messages`, messageId);
              await deleteDoc(messageDocRef);
            } catch (error) {
              console.error('Error deleting message: ', error);
              if (error.code === 'resource-exhausted') {
                Alert.alert('Quota Exceeded', 'Unable to delete message due to Firestore quota limits.');
              } else {
                Alert.alert('Error', 'Failed to delete message. Please try again.');
              }
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderProposalMessage = (msg, isUserMessage) => {
    if (!msg.proposalData) return null;

    return (
      <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.supportBubble]}>
        <View style={styles.proposalContainer}>
          <View style={styles.proposalHeader}>
            <Icon name="file-document-outline" size={20} color={isUserMessage ? '#fff' : '#7F5539'} />
            <Text style={[styles.proposalTitle, isUserMessage && styles.userMessageText]}>
              Custom Order Proposal
            </Text>
          </View>

          <View style={styles.proposalContent}>
            <Text style={[styles.proposalText, isUserMessage && styles.userMessageText]}>
              Order ID: {msg.proposalData.orderId}
            </Text>
            <Text style={[styles.proposalText, isUserMessage && styles.userMessageText]}>
              Total Price: ₱{msg.proposalData.price}
            </Text>
            <Text style={[styles.proposalText, isUserMessage && styles.userMessageText]}>
              Timeline: {msg.proposalData.timeline}
            </Text>

            {msg.proposalData.downPayment && (
              <Text style={[styles.proposalText, isUserMessage && styles.userMessageText]}>
                Down Payment: ₱{msg.proposalData.downPayment}
              </Text>
            )}

            {msg.proposalData.notes && (
              <Text style={[styles.proposalNotes, isUserMessage && styles.userMessageText]}>
                Notes: {msg.proposalData.notes}
              </Text>
            )}
          </View>

          {msg.proposalData.canProceedToCheckout && !isUserMessage && (
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() =>
                navigation.navigate('CustomOrderCheckoutScreen', {
                  proposalData: msg.proposalData,
                  threadId: user.uid,
                })
              }
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              <Icon name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          )}

          {!msg.proposalData.canProceedToCheckout && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Status: {msg.proposalData.status || 'proposal_sent'}</Text>
            </View>
          )}
        </View>
      </View>
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

    const { productInfo, dimensions, frameStyle, frameColor, mirrorType, budget } = customizationData;

    return (
      <TouchableOpacity
        style={[styles.customizationAttachment, isUserMessage && styles.userCustomizationAttachment]}
        onPress={() => handleCustomizationPress(customizationData)}
      >
        <View style={styles.customizationHeader}>
          <Icon name="tools" size={20} color={isUserMessage ? '#fff' : '#7F5539'} />
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
          <Icon name="chevron-right" size={16} color={isUserMessage ? '#fff' : '#6B7280'} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFileAttachment = (fileData, isUserMessage) => {
    if (!fileData?.url) {
      return (
        <View style={[styles.errorAttachment, isUserMessage && styles.userErrorAttachment]}>
          <Icon name="alert-circle" size={20} color={isUserMessage ? '#fff' : '#EF4444'} />
          <Text style={[styles.errorText, isUserMessage && styles.userErrorText]}>Image unavailable</Text>
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
            onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
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
                onPress: () =>
                  Linking.openURL(fileData.url).catch((err) => {
                    console.error('Failed to open file:', err);
                    Alert.alert('Error', 'Unable to open file.');
                  }),
              },
            ]
          );
        }}
      >
        <View style={styles.documentIcon}>
          <Icon name="file-document-outline" size={24} color="#fff" />
        </View>
        <View style={styles.documentInfo}>
          <Text style={[styles.documentName, isUserMessage && styles.userDocumentText]} numberOfLines={1}>
            {fileData.name}
          </Text>
          <Text style={[styles.documentSize, isUserMessage && styles.userDocumentText]}>
            {formatFileSize(fileData.size)}
          </Text>
        </View>
        <Icon name="download" size={20} color={isUserMessage ? '#fff' : '#6B7280'} />
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

  const renderMessage = ({ item }) => {
    const isUserMessage = item.senderId === user?.uid;

    if (item.messageType === 'customization_proposal') {
      return renderProposalMessage(item, isUserMessage);
    }

    if (item.messageType === 'customization_request') {
      return (
        <View style={[styles.messageRow, { justifyContent: isUserMessage ? 'flex-end' : 'flex-start' }]}>
          {!isUserMessage && (
            <View style={styles.avatarContainer}>
              <View style={styles.supportAvatarGradient}>
                <Text style={styles.avatarText}>{item.senderAvatar || 'MS'}</Text>
              </View>
            </View>
          )}
          <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.supportBubble]}>
            {renderCustomizationAttachment(item.customizationData, isUserMessage)}
            <Text style={[styles.timestamp, isUserMessage && styles.userTimestamp]}>
              {item.timestamp
                ? item.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Sending...'}
            </Text>
          </View>
          {isUserMessage && (
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatarGradient}>
                <Text style={styles.avatarText}>{userName.substring(0, 2).toUpperCase()}</Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    if (item.messageType === 'file') {
      return (
        <View style={[styles.messageRow, { justifyContent: isUserMessage ? 'flex-end' : 'flex-start' }]}>
          {!isUserMessage && (
            <View style={styles.avatarContainer}>
              <View style={styles.supportAvatarGradient}>
                <Text style={styles.avatarText}>{item.senderAvatar || 'MS'}</Text>
              </View>
            </View>
          )}
          <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.supportBubble]}>
            {renderFileAttachment(item.fileData, isUserMessage)}
            <Text style={[styles.timestamp, isUserMessage && styles.userTimestamp]}>
              {item.timestamp
                ? item.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Sending...'}
            </Text>
          </View>
          {isUserMessage && (
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatarGradient}>
                <Text style={styles.avatarText}>{userName.substring(0, 2).toUpperCase()}</Text>
              </View>
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, { justifyContent: isUserMessage ? 'flex-end' : 'flex-start' }]}>
        {!isUserMessage && (
          <View style={styles.avatarContainer}>
            <View style={styles.supportAvatarGradient}>
              <Text style={styles.avatarText}>{item.senderAvatar || 'MS'}</Text>
            </View>
          </View>
        )}
        <View style={[styles.messageBubble, isUserMessage ? styles.userBubble : styles.supportBubble]}>
          <Text style={isUserMessage ? styles.userBubbleText : styles.supportBubbleText}>{item.text}</Text>
          <Text style={[styles.timestamp, isUserMessage && styles.userTimestamp]}>
            {item.timestamp
              ? item.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Sending...'}
          </Text>
        </View>
        {isUserMessage && (
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatarGradient}>
              <Text style={styles.avatarText}>{userName.substring(0, 2).toUpperCase()}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#7F5539" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerAvatarContainer}>
              <View style={styles.headerAvatarGradient}>
                <Icon name="account-tie" size={20} color="#fff" />
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Mirrora Support</Text>
              <Text style={styles.headerSubtitle}>{isTyping ? 'Typing...' : 'Online • Instant replies'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
            <Icon name="dots-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7F5539" />
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

          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.uploadProgressContainer}>
              <View style={styles.uploadProgressHeader}>
                <Text style={styles.uploadProgressText}>Processing image... {uploadProgress}%</Text>
                <TouchableOpacity
                  onPress={() => {
                    setUploadProgress(0);
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

          <View
            style={[
              styles.inputOuterContainer,
              keyboardVisible && styles.inputOuterContainerKeyboard,
            ]}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="center"
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
                    size={24}
                    color={sendingMessage ? '#9CA3AF' : '#7F5539'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sendButton, newMessage.trim() && !sendingMessage && styles.sendButtonActive]}
                  onPress={handleSend}
                  disabled={!newMessage.trim() || sendingMessage}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.sendButtonGradient, newMessage.trim() && !sendingMessage ? styles.sendButtonGradientActive : null]}
                  >
                    {sendingMessage ? (
                      <ActivityIndicator size={18} color="#fff" />
                    ) : (
                      <Icon
                        name={newMessage.trim() ? 'send' : 'send-outline'}
                        size={22}
                        color="#fff"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={showImageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageModal(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowImageModal(false)}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowImageModal(false)}>
                  <Icon name="close" size={28} color="#fff" />
                </TouchableOpacity>
                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.modalImage}
                    resizeMode="contain"
                    onError={(e) => console.error('Modal image load error:', e.nativeEvent.error)}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

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
                      {selectedCustomization.dimensions?.depth &&
                        ` × ${selectedCustomization.dimensions.depth} cm`}
                    </Text>
                  </View>

                  <View style={styles.customizationModalSection}>
                    <Text style={styles.customizationModalSectionTitle}>Specifications</Text>
                    <Text style={styles.customizationModalText}>
                      Frame: {selectedCustomization.frameStyle}
                    </Text>
                    <Text style={styles.customizationModalText}>
                      Color: {selectedCustomization.frameColor}
                    </Text>
                    <Text style={styles.customizationModalText}>
                      Mirror: {selectedCustomization.mirrorType}
                    </Text>
                    <Text style={styles.customizationModalText}>
                      Mounting: {selectedCustomization.mountingType}
                    </Text>
                  </View>

                  {selectedCustomization.additionalFeatures?.length > 0 && (
                    <View style={styles.customizationModalSection}>
                      <Text style={styles.customizationModalSectionTitle}>Additional Features</Text>
                      {selectedCustomization.additionalFeatures.map((feature, index) => (
                        <Text key={index} style={styles.customizationModalText}>
                          • {feature}
                        </Text>
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
                      <Text style={styles.customizationModalText}>
                        {selectedCustomization.deliveryDate}
                      </Text>
                    </View>
                  )}

                  {selectedCustomization.specialInstructions && (
                    <View style={styles.customizationModalSection}>
                      <Text style={styles.customizationModalSectionTitle}>Special Instructions</Text>
                      <Text style={styles.customizationModalText}>
                        {selectedCustomization.specialInstructions}
                      </Text>
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
    backgroundColor: '#7F5539',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#7F5539',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerAvatarContainer: {
    position: 'relative',
    marginRight: 10,
  },
  headerAvatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9C6644',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#7F5539',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  moreButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chatContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  userAvatarContainer: {
    marginLeft: 8,
    marginBottom: 4,
  },
  supportAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9C6644',
  },
  userAvatarGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7F5539',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#7F5539',
    borderBottomRightRadius: 4,
    marginLeft: 16,
  },
  supportBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubbleText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  supportBubbleText: {
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    alignSelf: 'flex-end',
    marginTop: 6,
    opacity: 0.8,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.85)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  typingBubble: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginHorizontal: 3,
  },
  dot1: {
    opacity: 0.5,
  },
  dot2: {
    opacity: 0.75,
  },
  dot3: {
    opacity: 1,
  },
  imageAttachment: {
    width: screenWidth * 0.55,
    height: screenWidth * 0.45,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  documentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7F5539',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  userDocumentText: {
    color: '#fff',
  },
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
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 8,
  },
  userErrorText: {
    color: '#fff',
  },
  customizationAttachment: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: screenWidth * 0.65,
  },
  userCustomizationAttachment: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  customizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F5539',
    marginLeft: 8,
  },
  userCustomizationText: {
    color: '#fff',
  },
  customizationPreview: {
    marginBottom: 10,
  },
  customizationProduct: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  customizationDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  customizationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  customizationViewText: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
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
    backgroundColor: '#7F5539',
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
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
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  customizationModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeModalButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  customizationModalContent: {
    padding: 20,
  },
  customizationModalSection: {
    marginBottom: 20,
  },
  customizationModalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F5539',
    marginBottom: 10,
  },
  customizationModalText: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  customizationModalPrice: {
    fontSize: 15,
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 4,
  },
  customizationModalButton: {
    backgroundColor: '#7F5539',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  customizationModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputOuterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  inputOuterContainerKeyboard: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
    maxHeight: 120,
    lineHeight: 22,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  attachButton: {
    padding: 8,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9CA3AF',
  },
  sendButtonGradientActive: {
    backgroundColor: '#7F5539',
  },
  sendButtonActive: {},
  proposalContainer: {
    width: '100%',
  },
  proposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  proposalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  proposalContent: {
    marginBottom: 12,
  },
  proposalText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#1F2937',
  },
  proposalNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    color: '#6B7280',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7F5539',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 8,
  },
  statusContainer: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  userMessageText: {
    color: '#fff',
  },
});

export default ChatScreen;