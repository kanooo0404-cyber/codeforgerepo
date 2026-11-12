import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase.js';
import {
  getDemoSessionUid,
  loadDemoState,
  saveDemoState,
  setDemoSessionUid,
} from '../data/localStore.js';

export function subscribeToAuthState(callback) {
  if (isFirebaseConfigured && auth && db) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!snap.exists()) {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Student',
            role: 'student',
          });
          return;
        }
        const profile = snap.data();
        if (profile.isSuspended) {
          await signOut(auth);
          callback(null);
          return;
        }
        callback({ uid: firebaseUser.uid, ...profile });
      } catch {
        callback(null);
      }
    });
  }

  // Local Demo Mode
  const uid = getDemoSessionUid();
  if (!uid) {
    callback(null);
  } else {
    const state = loadDemoState();
    const user = state.users.find((u) => u.uid === uid && !u.isSuspended) || null;
    callback(user);
  }

  return () => {};
}

export async function registerStudent({
  name,
  email,
  password,
  studentId = '',
  department = '',
  phone = '',
}) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  if (!cleanName || !cleanEmail || !password || password.length < 6) {
    throw new Error('Provide a valid name, email, and password (at least 6 characters).');
  }

  if (isFirebaseConfigured && auth && db) {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(cred.user, { displayName: cleanName });
    // Security rule enforces role === 'student' on public registration
    const userDoc = {
      uid: cred.user.uid,
      name: cleanName,
      email: cleanEmail,
      role: 'student',
      studentId: studentId.trim(),
      department: department.trim(),
      phone: phone.trim(),
      isSuspended: false,
      notificationsEnabled: true,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userDoc);
    return userDoc;
  }

  const state = loadDemoState();
  const exists = state.users.some((u) => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    throw new Error('An account with this campus email already exists.');
  }

  const newUser = {
    uid: `student_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    password,
    role: 'student', // Public registration NEVER grants admin role
    studentId: studentId.trim() || `ST-${Math.floor(1000 + Math.random() * 9000)}`,
    department: department.trim() || 'General Studies',
    phone: phone.trim(),
    isSuspended: false,
    notificationsEnabled: true,
    createdAt: new Date().toISOString(),
  };

  state.users.push(newUser);
  saveDemoState(state);
  setDemoSessionUid(newUser.uid);

  const { password: _pw, ...safeUser } = newUser;
  return safeUser;
}

export async function loginWithEmail({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    throw new Error('Please enter both email and password.');
  }

  if (isFirebaseConfigured && auth && db) {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    const profile = snap.exists() ? snap.data() : { role: 'student', name: cred.user.displayName };
    if (profile.isSuspended) {
      await signOut(auth);
      throw new Error('This account has been suspended by Campus Security.');
    }
    return { uid: cred.user.uid, email: cred.user.email, ...profile };
  }

  const state = loadDemoState();
  const user = state.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    throw new Error('Invalid campus email or password.');
  }
  if (user.password && user.password !== password) {
    throw new Error('Invalid campus email or password.');
  }
  if (user.isSuspended) {
    throw new Error('This account has been suspended by Campus Security.');
  }

  setDemoSessionUid(user.uid);
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

export async function loginDemoAccount(uid) {
  if (isFirebaseConfigured) {
    throw new Error('Quick demo accounts are disabled when Firebase is connected.');
  }
  const state = loadDemoState();
  const user = state.users.find((u) => u.uid === uid);
  if (!user) throw new Error('Demo account not found.');
  if (user.isSuspended) throw new Error('Demo account is suspended.');
  setDemoSessionUid(user.uid);
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
    return;
  }
  setDemoSessionUid(null);
}

export async function updateUserProfile(uid, updates) {
  const safeUpdates = {
    name: updates.name?.trim(),
    studentId: updates.studentId?.trim(),
    department: updates.department?.trim(),
    phone: updates.phone?.trim(),
    notificationsEnabled: updates.notificationsEnabled,
  };

  Object.keys(safeUpdates).forEach(
    (k) => safeUpdates[k] === undefined && delete safeUpdates[k]
  );

  if (isFirebaseConfigured && db) {
    await updateDoc(doc(db, 'users', uid), safeUpdates);
    const snap = await getDoc(doc(db, 'users', uid));
    return { uid, ...snap.data() };
  }

  const state = loadDemoState();
  const idx = state.users.findIndex((u) => u.uid === uid);
  if (idx === -1) throw new Error('User not found.');
  state.users[idx] = { ...state.users[idx], ...safeUpdates };
  saveDemoState(state);
  const { password: _pw, ...safeUser } = state.users[idx];
  return safeUser;
}
