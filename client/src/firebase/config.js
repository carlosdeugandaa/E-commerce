// client/src/firebase/config.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1kYWgXyq0I8nkFtyb-ENMOqs58pf6RPk",
  authDomain: "e-commerce-8619f.firebaseapp.com",
  projectId: "e-commerce-8619f",
  storageBucket: "e-commerce-8619f.firebasestorage.app",
  messagingSenderId: "764491808759",
  appId: "1:764491808759:web:e36e55711b7a9e7e3938f2",
  measurementId: "G-4Z3J0B3XNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Export the instances
export { auth, db, googleProvider };

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user with email and password
 */
export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with the user's name
    await updateProfile(user, { displayName: name });

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp(),
      role: 'user'
    });

    return {
      success: true,
      user: { uid: user.uid, name, email }
    };
  } catch (error) {
    console.error('Registration error:', error);
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    return { success: false, error: errorMessage };
  }
};

/**
 * Login a user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    let userData = {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    };

    if (docSnap.exists()) {
      userData = { ...userData, ...docSnap.data() };
    } else {
      // If user exists in auth but not in Firestore, create it
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        createdAt: serverTimestamp(),
        role: 'user'
      });
      userData.name = user.displayName || 'User';
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    }
    return { success: false, error: errorMessage };
  }
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Login with Google Popup
 */
export const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in Firestore
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // If not, save user data to Firestore
      await setDoc(docRef, {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        role: 'user'
      });
    }

    let userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'User'
    };
    if (docSnap.exists()) {
      userData = { ...userData, ...docSnap.data() };
    }

    return { success: true, user: userData };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    }
    return { success: false, error: errorMessage };
  }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (uid, data) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    // Also update auth profile if name is being updated
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.name });
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User data not found' };
    }
  } catch (error) {
    console.error('Get user data error:', error);
    return { success: false, error: error.message };
  }
};
