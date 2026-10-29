import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { AuthUser } from '../types';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  isFirebaseLive: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_PREVIEW_USER_KEY = 'student_planner_preview_user';
const LOCAL_ACCOUNTS_KEY = 'student_planner_local_accounts';

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`student_salt_v1:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          setCurrentUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0],
          });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // In unconfigured / preview mode, check if a test user was active
      try {
        const saved = localStorage.getItem(LOCAL_PREVIEW_USER_KEY);
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !pass) {
      throw new Error('Please enter both email and password.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        setCurrentUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email?.split('@')[0],
        });
      } catch (err: any) {
        let msg = 'Failed to sign in. Please verify your credentials.';
        if (err.code === 'auth/operation-not-allowed') {
          msg = 'Email/Password sign-in is disabled in your Firebase Console. Please enable "Email/Password" in Firebase Console > Authentication > Sign-in method, or sign in with Google below.';
        } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          msg = 'Invalid email or password. Please check your credentials.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Invalid email format. Please enter a valid email address.';
        } else if (err.code === 'auth/user-disabled') {
          msg = 'This student account has been disabled.';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'Too many failed login attempts. Please wait a moment or reset your password.';
        }
        setError(msg);
        throw new Error(msg);
      }
    } else {
      // Offline / Pre-Firebase connection mode
      try {
        const accountsRaw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
        const accounts: Record<string, { uid: string; email: string; passHash: string }> = accountsRaw
          ? JSON.parse(accountsRaw)
          : {};

        const existing = accounts[cleanEmail];
        if (!existing) {
          throw new Error('Account not found in preview database. Please Sign Up first.');
        }
        const inputHash = await hashPassword(pass);
        if (existing.passHash !== inputHash && existing.passHash !== btoa(pass)) {
          throw new Error('Incorrect password. Please try again.');
        }

        const user: AuthUser = {
          uid: existing.uid,
          email: existing.email,
          displayName: existing.email.split('@')[0],
        };
        setCurrentUser(user);
        localStorage.setItem(LOCAL_PREVIEW_USER_KEY, JSON.stringify(user));
      } catch (err: any) {
        setError(err.message || 'Login failed');
        throw err;
      }
    }
  };

  const signup = async (email: string, pass: string) => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !pass) {
      throw new Error('Please provide an email and password.');
    }
    if (pass.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        setCurrentUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email?.split('@')[0],
        });
      } catch (err: any) {
        let msg = 'Sign up failed. Please try again.';
        if (err.code === 'auth/operation-not-allowed') {
          msg = 'Email/Password accounts are disabled in your Firebase project. Please enable "Email/Password" in Firebase Console (Authentication > Sign-in method), or sign in with Google below.';
        } else if (err.code === 'auth/email-already-in-use') {
          msg = 'An account with this email already exists. Please log in.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'Password is too weak. Please use at least 6 characters.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Please enter a valid student email address.';
        }
        setError(msg);
        throw new Error(msg);
      }
    } else {
      // Offline / Pre-Firebase connection mode
      try {
        const accountsRaw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
        const accounts: Record<string, { uid: string; email: string; passHash: string }> = accountsRaw
          ? JSON.parse(accountsRaw)
          : {};

        if (accounts[cleanEmail]) {
          throw new Error('An account with this email already exists. Please log in.');
        }

        const newUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const inputHash = await hashPassword(pass);
        accounts[cleanEmail] = {
          uid: newUid,
          email: cleanEmail,
          passHash: inputHash,
        };
        localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));

        const user: AuthUser = {
          uid: newUid,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
        };
        setCurrentUser(user);
        localStorage.setItem(LOCAL_PREVIEW_USER_KEY, JSON.stringify(user));
      } catch (err: any) {
        setError(err.message || 'Sign up failed');
        throw err;
      }
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        setCurrentUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || res.user.email?.split('@')[0],
        });
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user') {
          return;
        }
        let msg = err.message || 'Google Sign-In failed.';
        if (err.code === 'auth/unauthorized-domain') {
          msg = 'This domain is not yet added to Authorized Domains in Firebase Authentication Settings.';
        }
        setError(msg);
        throw new Error(msg);
      }
    } else {
      // Offline fallback
      const user: AuthUser = {
        uid: 'user_preview_student',
        email: 'student@university.edu',
        displayName: 'College Student',
      };
      setCurrentUser(user);
      localStorage.setItem(LOCAL_PREVIEW_USER_KEY, JSON.stringify(user));
    }
  };

  const logout = async () => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_PREVIEW_USER_KEY);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your account email.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch (err: any) {
        let msg = 'Failed to send reset email.';
        if (err.code === 'auth/operation-not-allowed') {
          msg = 'Password reset requires Email/Password provider enabled in Firebase Console.';
        } else if (err.code === 'auth/user-not-found') {
          msg = 'No student account found with this email.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Invalid email address.';
        }
        setError(msg);
        throw new Error(msg);
      }
    } else {
      // Offline / Pre-Firebase connection mode
      const accountsRaw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
      const accounts: Record<string, any> = accountsRaw ? JSON.parse(accountsRaw) : {};
      if (!accounts[cleanEmail]) {
        throw new Error('No account found with this email in the preview database.');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirebaseLive: isFirebaseConfigured,
        login,
        signup,
        signInWithGoogle,
        logout,
        resetPassword,
        error,
        setError,
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
