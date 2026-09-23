import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  User,
  doc,
  getDoc,
  setDoc,
  db
} from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  adminLogin: (password: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('jihan_admin_session') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const profile = snap.data() as UserProfile;
            setUserProfile(profile);
            if (profile.role === 'admin') {
              setIsAdmin(true);
              localStorage.setItem('jihan_admin_session', 'true');
            }
          } else {
            const isAdminEmail = user.email === 'jihanstore009@gmail.com' || user.email === '28072026koi@gmail.com' || user.email?.includes('admin');
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
              role: isAdminEmail ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            if (newProfile.role === 'admin') {
              setIsAdmin(true);
              localStorage.setItem('jihan_admin_session', 'true');
            }
          }
        } catch (e) {
          console.warn('User profile fetch notice:', e);
        }
      } else {
        setUserProfile(null);
        // Only clear admin if not set via admin direct key
        if (localStorage.getItem('jihan_admin_session') !== 'true') {
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (email === 'jihanstore009@gmail.com' || email === '28072026koi@gmail.com' || email.includes('admin')) {
        setIsAdmin(true);
        localStorage.setItem('jihan_admin_session', 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, phone?: string) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: email,
        displayName: name,
        phoneNumber: phone || '',
        role: email === 'jihanstore009@gmail.com' ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (password: string, email: string = 'jihanstore009@gmail.com'): Promise<boolean> => {
    // Official admin access check
    const validKeys = ['jihan2026', 'admin123456', 'sandwip4301'];
    if (validKeys.includes(password.trim())) {
      setIsAdmin(true);
      localStorage.setItem('jihan_admin_session', 'true');
      return true;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAdmin(true);
      localStorage.setItem('jihan_admin_session', 'true');
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setIsAdmin(false);
    localStorage.removeItem('jihan_admin_session');
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        login,
        register,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
