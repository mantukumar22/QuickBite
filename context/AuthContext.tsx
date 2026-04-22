'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

const DEMO_USER = {
  uid: 'demo-user-id',
  displayName: 'QuickBite Explorer',
  email: 'demo@quickbite.com',
  photoURL: 'https://picsum.photos/seed/avatar/200',
} as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Granting admin to the demo user for full exploration

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        setUser(authenticatedUser);
        // Check admin status
        const adminDoc = await getDoc(doc(db, 'admins', authenticatedUser.uid));
        const userDoc = await getDoc(doc(db, 'users', authenticatedUser.uid));
        
        const isDefaultAdmin = authenticatedUser.email === 'amritguru2007@gmail.com';
        setIsAdmin(adminDoc.exists() || (userDoc.exists() && userDoc.data()?.role === 'admin') || isDefaultAdmin);
        
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', authenticatedUser.uid), {
            name: authenticatedUser.displayName,
            email: authenticatedUser.email,
            profilePic: authenticatedUser.photoURL,
            role: isDefaultAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // Keep DEMO_USER if not authenticated
        setUser(DEMO_USER);
        setIsAdmin(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
