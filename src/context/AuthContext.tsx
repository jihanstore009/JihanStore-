import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  fbUpdateProfile,
  fbSignOut, 
  User,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  db
} from '../firebase/config';
import { UserProfile } from '../types';

export function getAuthErrorMessage(error: any): string {
  if (!error) return 'একটি অজানা সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।';
  const code = error?.code || '';
  const message = error?.message || String(error);

  switch (code) {
    case 'auth/invalid-email':
      return 'ইমেইল অ্যাড্রেসের ফরম্যাট সঠিক নয়। অনুগ্রহ করে সঠিক ইমেইল দিন।';
    case 'auth/user-disabled':
      return 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। কাস্টমার সাপোর্টে যোগাযোগ করুন।';
    case 'auth/user-not-found':
      return 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক ইমেইল দিন বা নতুন অ্যাকাউন্ট তৈরি করুন।';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'ভুল ইমেইল অথবা পাসওয়ার্ড দিয়েছেন। দয়া করে আবার চেষ্টা করুন।';
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে লগইন করুন।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ডটি দুর্বল। অনুগ্রহ করে কমপক্ষে ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।';
    case 'auth/too-many-requests':
      return 'অতিরিক্ত ভুলের কারণে সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।';
    case 'auth/network-request-failed':
      return 'ইন্টারনেট সংযোগে ত্রুটি দেখা দিয়েছে। ইন্টারনেট কানেকশন চেক করুন।';
    case 'auth/requires-recent-login':
      return 'সুরক্ষার স্বার্থে পুনরায় লগইন করে আবার চেষ্টা করুন।';
    case 'auth/popup-closed-by-user':
      return 'লগইন উইন্ডো বন্ধ করা হয়েছে।';
    default:
      if (message.includes('password')) {
        return 'পাসওয়ার্ড সঠিক নয় অথবা অন্তত ৬ অক্ষরের হতে হবে।';
      }
      if (message.includes('network') || message.includes('offline')) {
        return 'ইন্টারনেট সংযোগ বিচ্ছিন্ন। সংযোগ নিশ্চিত করুন।';
      }
      return 'লগইন বা রেজিস্ট্রেশনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
  }
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    email: string, 
    pass: string, 
    name: string, 
    phone?: string,
    address?: string,
    deliveryArea?: 'inside_sandwip' | 'outside_sandwip'
  ) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  adminLogin: (password: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('jihan_admin_session') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync auth state
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
            // Initial profile creation if not exists
            const isAdminEmail = 
              user.email === 'jihanstore009@gmail.com' || 
              user.email === '28072026koi@gmail.com' || 
              (user.email && user.email.includes('admin'));
            
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
              phoneNumber: user.phoneNumber || '',
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
        // Only clear admin if not manually logged into admin via secret passcode
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
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const isAdEmail = 
        email === 'jihanstore009@gmail.com' || 
        email === '28072026koi@gmail.com' || 
        email.includes('admin');
      
      if (isAdEmail) {
        setIsAdmin(true);
        localStorage.setItem('jihan_admin_session', 'true');
      }

      // Fetch or ensure profile is populated immediately
      if (res.user) {
        const docRef = doc(db, 'users', res.user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string, 
    pass: string, 
    name: string, 
    phone?: string,
    address?: string,
    deliveryArea?: 'inside_sandwip' | 'outside_sandwip'
  ) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Update display name in Firebase Auth
      try {
        await fbUpdateProfile(res.user, { displayName: name.trim() });
      } catch (e) {
        console.warn('Update Auth Profile notice:', e);
      }

      const isAdminEmail = 
        email === 'jihanstore009@gmail.com' || 
        email === '28072026koi@gmail.com';

      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: email.trim(),
        displayName: name.trim(),
        phoneNumber: phone?.trim() || '',
        address: address?.trim() || '',
        deliveryArea: deliveryArea || 'inside_sandwip',
        role: isAdminEmail ? 'admin' : 'customer',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);

      if (newProfile.role === 'admin') {
        setIsAdmin(true);
        localStorage.setItem('jihan_admin_session', 'true');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!email.trim()) {
      throw new Error('অনুগ্রহ করে সঠিক ইমেইল প্রদান করুন।');
    }
    await sendPasswordResetEmail(auth, email.trim());
  };

  const updateUserProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('কোনো লগইন করা ব্যবহারকারী পাওয়া যায়নি।');
    
    // Safety: never permit non-admin to escalate role
    const sanitizedUpdates = { ...updates };
    if (userProfile?.role !== 'admin') {
      delete sanitizedUpdates.role;
    }
    sanitizedUpdates.updatedAt = new Date().toISOString();

    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, sanitizedUpdates);

    // If displayName changed, update in Firebase auth user
    if (sanitizedUpdates.displayName && currentUser) {
      try {
        await fbUpdateProfile(currentUser, { displayName: sanitizedUpdates.displayName });
      } catch {
        // Non-blocking
      }
    }

    setUserProfile(prev => prev ? { ...prev, ...sanitizedUpdates } : null);
  };

  const adminLogin = async (password: string, email: string = 'jihanstore009@gmail.com'): Promise<boolean> => {
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
    setLoading(true);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    } finally {
      setCurrentUser(null);
      setUserProfile(null);
      setLoading(false);
    }
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('jihan_admin_session');
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
        sendPasswordReset,
        updateUserProfileData,
        adminLogin,
        logout,
        adminLogout,
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
