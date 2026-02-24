'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, AuthContextType, SignUpData } from '@/types';
import toast from 'react-hot-toast';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Firebase user to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          phoneNumber: firebaseUser.phoneNumber || userData.phoneNumber,
          farmName: userData.farmName,
          farmLocation: userData.farmLocation,
          language: userData.language || 'ms',
          registrationDate: userData.registrationDate?.toDate() || new Date(),
          plan: userData.plan || 'none',
          billingCycle: userData.billingCycle || undefined,
          status: userData.status || 'active',
          subscriptionStatus: userData.subscriptionStatus || undefined,
          cancelAtPeriodEnd: userData.cancelAtPeriodEnd || false,
          stripeCustomerId: userData.stripeCustomerId,
          stripeSubscriptionId: userData.stripeSubscriptionId,
          paymentMethod: userData.paymentMethod || undefined,
          uploadsUsed: userData.uploadsUsed || 0,
          uploadsLimit: userData.uploadsLimit || 0,
          lastLogin: new Date(),
          preferences: userData.preferences || {
            notifications: true,
            language: 'ms',
            theme: 'light',
            units: 'metric',
          },
          profilePictureUrl: userData.profilePictureUrl || firebaseUser.photoURL || undefined,
          currentPeriodEnd: userData.currentPeriodEnd?.toDate() || undefined,
        };
      } else {
        // Create new user document if it doesn't exist - NO PLAN BY DEFAULT
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          language: 'ms',
          registrationDate: new Date(),
          plan: 'none',
          status: 'active',
          uploadsUsed: 0,
          uploadsLimit: 0,
          lastLogin: new Date(),
          preferences: {
            notifications: true,
            language: 'ms',
            theme: 'light',
            units: 'metric',
          },
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          registrationDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });

        return newUser;
      }
    } catch (error) {
      console.error('Error converting Firebase user:', error);
      return null;
    }
  };

  const signIn = async (email: string, password: string, language: 'en' | 'ms' = 'ms'): Promise<void> => {
    try {
      setLoading(true);
      const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const requiresVerification = userData.requiresEmailVerification === true;

      if (requiresVerification && !result.user.emailVerified) {
        await firebaseSignOut(auth);
        toast.error(
          language === 'ms'
            ? 'Sila sahkan emel anda terlebih dahulu. Semak peti masuk anda untuk pautan pengesahan.'
            : 'Please verify your email first. Check your inbox for the verification link.'
        );
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      // Update last login
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: serverTimestamp(),
      });
      
      // Create login notification (only if user has notifications enabled)
      const notificationsEnabled = userData.preferences?.notifications !== false;
      if (notificationsEnabled) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: result.user.uid,
            type: 'info',
            title: 'Login Detected',
            titleMs: 'Log Masuk Dikesan',
            message: `You successfully logged in on ${new Date().toLocaleDateString(language === 'ms' ? 'ms-MY' : 'en-US', { dateStyle: 'full' })}.`,
            messageMs: `Anda berjaya log masuk pada ${new Date().toLocaleDateString('ms-MY', { dateStyle: 'full' })}.`,
            read: false,
            createdAt: serverTimestamp(),
          });
        } catch (notifError) {
          console.error('Error creating login notification:', notifError);
        }
      }

      // Don't show success toast here - let the login page handle it
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error?.message === 'EMAIL_NOT_VERIFIED') {
        // Toast already shown above
      } else if (error.code === 'auth/user-not-found') {
        toast.error(language === 'ms' ? 'Akaun tidak dijumpai. Sila daftar terlebih dahulu.' : 'Account not found. Please register first.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error(language === 'ms' ? 'Emel atau kata laluan tidak sah.' : 'Invalid email or password.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error(language === 'ms' ? 'Terlalu banyak percubaan. Sila cuba lagi nanti.' : 'Too many attempts. Please try again later.');
      } else {
        toast.error(language === 'ms' ? 'Ralat log masuk. Sila cuba lagi.' : 'Login error. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (userData: SignUpData, language: 'en' | 'ms' = 'ms'): Promise<void> => {
    try {
      setLoading(true);
      const result: UserCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

      // Update Firebase Auth profile
      await firebaseUpdateProfile(result.user, {
        displayName: userData.displayName,
      });

      // Send custom verification email (CropDrive-branded, no Firebase branding)
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          displayName: userData.displayName,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send verification email');
      }

      // Create user document in Firestore - NO PLAN BY DEFAULT
      const newUser: Omit<User, 'uid'> = {
        email: userData.email,
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        farmName: userData.farmName,
        farmLocation: userData.farmLocation,
        language: userData.language || language,
        registrationDate: new Date(),
        plan: 'none',
        status: 'active',
        uploadsUsed: 0,
        uploadsLimit: 0,
        lastLogin: new Date(),
        preferences: {
          notifications: true,
          language: userData.language || language,
          theme: 'light',
          units: 'metric',
        },
      };

      await setDoc(doc(db, 'users', result.user.uid), {
        ...newUser,
        registrationDate: serverTimestamp(),
        lastLogin: serverTimestamp(),
        requiresEmailVerification: true, // Only new users need to verify; existing users can log in
      });

      // Create welcome notification
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: result.user.uid,
          type: 'success',
          title: 'Welcome to CropDrive!',
          titleMs: 'Selamat Datang ke CropDrive!',
          message: 'Thank you for registering. Please verify your email to access all features.',
          messageMs: 'Terima kasih kerana mendaftar. Sila sahkan emel anda untuk mengakses semua ciri.',
          read: false,
          createdAt: serverTimestamp(),
        });
      } catch (notifError) {
        console.error('Error creating welcome notification:', notifError);
      }

      // Sign out the user so they need to log in after verifying email
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error(language === 'ms' ? 'Emel sudah digunakan. Sila guna emel lain.' : 'Email already in use. Please use a different email.');
      } else if (error.code === 'auth/weak-password') {
        toast.error(language === 'ms' ? 'Kata laluan terlalu lemah.' : 'Password is too weak.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error(language === 'ms' ? 'Format emel tidak sah.' : 'Invalid email format.');
      } else if (error?.message?.includes('verification') || error?.message?.includes('Email service not configured') || error?.code === 'auth/too-many-requests') {
        const msg = error?.code === 'auth/too-many-requests'
          ? (language === 'ms' ? 'Terlalu banyak emel pengesahan. Sila cuba lagi nanti.' : 'Too many verification emails. Please try again later.')
          : (language === 'ms' ? 'Gagal menghantar emel pengesahan. Sila hubungi sokongan.' : 'Failed to send verification email. Please contact support.');
        toast.error(msg);
      } else {
        toast.error(language === 'ms' ? 'Ralat pendaftaran. Sila cuba lagi.' : 'Registration error. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (language: 'en' | 'ms' = 'ms'): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error(language === 'ms' ? 'Ralat log keluar.' : 'Logout error.');
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>, language: 'en' | 'ms' = 'ms'): Promise<void> => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);

      toast.success(language === 'ms' ? 'Profil berjaya dikemaskini!' : 'Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(language === 'ms' ? 'Ralat mengemaskini profil.' : 'Error updating profile.');
    }
  };

  // Refresh user data from Firestore
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        console.log('🔄 Refreshing user data from Firestore for user:', currentUser.uid);
        const convertedUser = await convertFirebaseUser(currentUser);
        if (convertedUser) {
          console.log('✅ User data refreshed:', {
            uid: convertedUser.uid,
            plan: convertedUser.plan,
            uploadsUsed: convertedUser.uploadsUsed,
            uploadsLimit: convertedUser.uploadsLimit
          });
        setUser(convertedUser);
        } else {
          console.error('❌ Failed to convert user data');
        }
      } else {
        console.warn('⚠️ No current user found when refreshing');
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? `User logged in: ${firebaseUser.email}` : 'No user');
      
      if (firebaseUser) {
        const convertedUser = await convertFirebaseUser(firebaseUser);
        setUser(convertedUser);
        console.log('User data loaded:', convertedUser?.email);
      } else {
        setUser(null);
        console.log('User set to null');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
