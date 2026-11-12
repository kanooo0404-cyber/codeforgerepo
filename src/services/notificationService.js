import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';
import { loadDemoState, saveDemoState } from '../data/localStore.js';

export async function createNotification({ userId, title, message, type = 'info', link = '' }) {
  if (!userId) return null;
  const payload = {
    userId,
    title,
    message,
    type,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'notifications'), payload);
    return { id: docRef.id, ...payload };
  }

  const state = loadDemoState();
  const item = { id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...payload };
  state.notifications.unshift(item);
  saveDemoState(state);
  return item;
}

export async function listUserNotifications(userId) {
  if (!userId) return [];

  if (isFirebaseConfigured && db) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  const state = loadDemoState();
  return state.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function markNotificationRead(notificationId) {
  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    return;
  }
  const state = loadDemoState();
  const target = state.notifications.find((n) => n.id === notificationId);
  if (target) {
    target.read = true;
    saveDemoState(state);
  }
}

export async function markAllNotificationsRead(userId) {
  if (isFirebaseConfigured && db) {
    const items = await listUserNotifications(userId);
    await Promise.all(
      items.filter((i) => !i.read).map((i) => updateDoc(doc(db, 'notifications', i.id), { read: true }))
    );
    return;
  }

  const state = loadDemoState();
  state.notifications.forEach((n) => {
    if (n.userId === userId) n.read = true;
  });
  saveDemoState(state);
}
