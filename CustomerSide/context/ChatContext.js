import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, appId } from '../Backend/firebaseConfig.js'; // Adjust path
import { collection, query, where, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [adminMessages, setAdminMessages] = useState([]);
  const [lastReadMillis, setLastReadMillis] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const threadRef = doc(db, `artifacts/${appId}/public/data/chats/${user.uid}`);

    const unsubscribeThread = onSnapshot(threadRef, (snap) => {
      setLastReadMillis(snap.data()?.userLastRead?.toMillis() || 0);
    }, err => console.error(err));

    const messagesRef = collection(threadRef, 'messages');
    const q = query(messagesRef, where('senderId', '==', 'mirrora-admin'));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestampMillis: doc.data().timestamp?.toMillis() || 0
      }));
      setAdminMessages(msgs);
    }, err => console.error(err));

    return () => {
      unsubscribeThread();
      unsubscribeMessages();
    };
  }, [user]);

  useEffect(() => {
    const unread = adminMessages.filter(msg => msg.timestampMillis > lastReadMillis).length;
    setUnreadCount(unread);
  }, [adminMessages, lastReadMillis]);

  return (
    <ChatContext.Provider value={{ unreadCount }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);