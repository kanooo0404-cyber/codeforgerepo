import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  loginDemoAccount,
  loginWithEmail,
  logoutUser,
  registerStudent,
  subscribeToAuthState,
  updateUserProfile,
} from '../services/authService.js';
import { isFirebaseConfigured } from '../config/firebase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const login = async (credentials) => {
    const signedIn = await loginWithEmail(credentials);
    setUser(signedIn);
    return signedIn;
  };

  const register = async (form) => {
    const created = await registerStudent(form);
    setUser(created);
    return created;
  };

  const demoLogin = async (uid) => {
    const demoUser = await loginDemoAccount(uid);
    setUser(demoUser);
    return demoUser;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const refreshProfile = async (updates) => {
    if (!user?.uid) return null;
    const updated = await updateUserProfile(user.uid, updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode: !isFirebaseConfigured,
        login,
        register,
        demoLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
