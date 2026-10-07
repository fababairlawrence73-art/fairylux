import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  writeBatch,
  getDocs,
  where,
  setDoc,
} from '@react-native-firebase/firestore';


// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async (_notifId) => {},
  markAllAsRead: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ user, children }) {
  const db = getFirestore();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef(null);

  // Cleanup helper — always clean before attaching a new listener
  const detachListener = useCallback(() => {
    if (unsubscribeRef.current) {
      try {
        unsubscribeRef.current();
      } catch (e) {
        // ignore
      }
      unsubscribeRef.current = null;
    }
  }, []);

  useEffect(() => {
    const uid = user?.uid;

    if (!uid) {
      // No user — clear everything immediately
      detachListener();
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Attach onSnapshot for this specific UID
    setLoading(true);

    const notifRef = collection(db, 'users', uid, 'notifications');
    const q = query(notifRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            type: data.type ?? 'order_status',
            title: data.title ?? 'Notification',
            message: data.message ?? '',
            orderId: data.orderId ?? null,
            orderNumber: data.orderNumber ?? null,
            orderStatus: data.orderStatus ?? null,
            read: data.read === true,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          };
        });
        setNotifications(docs);
        setLoading(false);
      },
      (error) => {
        console.warn('[NotificationContext] onSnapshot error:', error);
        setLoading(false);
      },
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      detachListener();
      // Do NOT clear notifications here — clean only happens when uid changes
    };
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Mark a single notification as read.
   * Safe — only updates the 'read' field.
   */
  const markAsRead = useCallback(
    async (notifId) => {
      const uid = user?.uid;
      if (!uid || !notifId) return;

      try {
        const notifDocRef = doc(db, 'users', uid, 'notifications', notifId);
        await updateDoc(notifDocRef, { read: true });
      } catch (e) {
        console.warn('[NotificationContext] markAsRead error:', e);
      }
    },
    [user?.uid], // eslint-disable-line react-hooks/exhaustive-deps
  );

  /**
   * Mark all unread notifications as read in a single Firestore batch.
   */
  const markAllAsRead = useCallback(async () => {
    const uid = user?.uid;
    if (!uid) return;

    try {
      const notifRef = collection(db, 'users', uid, 'notifications');
      const q = query(notifRef, where('read', '==', false));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.warn('[NotificationContext] markAllAsRead error:', e);
    }
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Add a notification (used by testing / client dispatch).
   */
  const addNotification = useCallback(
    async (payload) => {
      const uid = user?.uid;
      if (!uid) {
        console.warn('[NotificationContext] No user UID for addNotification');
        return;
      }

      try {
        const notifId = 'notif_' + Date.now();
        const notifDocRef = doc(db, 'users', uid, 'notifications', notifId);
        await setDoc(notifDocRef, {
          type: payload.type ?? 'order_status',
          title: payload.title ?? 'Notification',
          message: payload.message ?? '',
          orderId: payload.orderId ?? null,
          orderNumber: payload.orderNumber ?? null,
          orderStatus: payload.orderStatus ?? null,
          read: false,
          createdAt: serverTimestamp(),
        });
        console.log('[NotificationContext] Test notification added:', notifId);
      } catch (e) {
        console.warn('[NotificationContext] addNotification error:', e);
      }
    },
    [user?.uid], // eslint-disable-line react-hooks/exhaustive-deps
  );


  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}


// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
  return useContext(NotificationContext);
}

export default NotificationContext;
