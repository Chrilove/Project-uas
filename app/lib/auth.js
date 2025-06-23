// app/lib/auth.js
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile 
  } from 'firebase/auth';
  import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection, // ← tambahkan ini
    getDocs     // ← tambahkan ini
  } from 'firebase/firestore';
  
  import { auth, db } from './firebase';
  
  // Register new user
  export const registerUser = async (email, password, userData) => {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Update display name
      await updateProfile(user, {
        displayName: userData.name
      });
  
      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        phone: userData.phone || '',
        role: userData.role || 'reseller', // Default role is reseller
        status: 'active',
        address: userData.address || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      await setDoc(doc(db, 'users', user.uid), userDoc);
  
      return { success: true, user: userDoc };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Login user
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return { success: true, user: userDoc.data() };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Logout user
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Get user profile
  export const getUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return { success: true, user: userDoc.data() };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Update user profile
  export const updateUserProfile = async (uid, updateData) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Get all users (for admin)
  export const getAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, users };
    } catch (error) {
      console.error('Error getting all users:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Update user status (for admin)
  export const updateUserStatus = async (uid, status, adminNotes = '') => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        status,
        adminNotes,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error: error.message };
    }
  };