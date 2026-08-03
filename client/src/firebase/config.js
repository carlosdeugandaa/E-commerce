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
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  addDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB1kYWgXyq0I8nkFtyb-ENMOqs58pf6RPk",
  authDomain: "e-commerce-8619f.firebaseapp.com",
  projectId: "e-commerce-8619f",
  storageBucket: "e-commerce-8619f.firebasestorage.app",
  messagingSenderId: "764491808759",
  appId: "1:764491808759:web:e36e55711b7a9e7e3938f2",
  measurementId: "G-4Z3J0B3XNG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };

// ============================================
// AUTH FUNCTIONS
// ============================================

export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      createdAt: serverTimestamp(),
      role: 'user'
    });
    return { success: true, user: { uid: user.uid, name, email } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    let userData = { uid: user.uid, email: user.email };
    if (docSnap.exists()) {
      userData = { ...userData, ...docSnap.data() };
    }
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const googleLogin = async () => {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL || '',
        createdAt: serverTimestamp(),
        role: 'user'
      });
    }
    let userData = { uid: user.uid, email: user.email, name: user.displayName || 'User' };
    if (docSnap.exists()) {
      userData = { ...userData, ...docSnap.data() };
    }
    return { success: true, user: userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// PROFILE FUNCTIONS
// ============================================

export const updateUserProfile = async (uid, data) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    if (data.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.name });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// PRODUCT FUNCTIONS
// ============================================

export const getProducts = async (filters = {}) => {
  try {
    let q = collection(db, 'products');
    const queryConstraints = [];
    
    if (filters.category && filters.category !== 'all') {
      queryConstraints.push(where('category', '==', filters.category));
    }
    
    if (filters.sort === 'createdAt') {
      queryConstraints.push(orderBy('createdAt', 'desc'));
    }
    
    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }
    
    const snapshot = await getDocs(q);
    const products = [];
    snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    return { success: true, products };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getProduct = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, product: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Product not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addProduct = async (productData) => {
  try {
    if (!productData.name || !productData.price || !productData.category || productData.stock === undefined) {
      return { success: false, error: 'Missing required fields' };
    }
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rating: 0,
      reviewCount: 0
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// BANNER FUNCTIONS
// ============================================

export const getBanners = async () => {
  try {
    const q = collection(db, 'banners');
    const snapshot = await getDocs(q);
    const banners = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.isActive !== false) {
        banners.push({ id: doc.id, ...data });
      }
    });
    banners.sort((a, b) => (a.order || 0) - (b.order || 0));
    return { success: true, banners };
  } catch (error) {
    console.error('Error fetching banners:', error);
    return { success: true, banners: [] };
  }
};

export const addBanner = async (bannerData) => {
  try {
    const docRef = await addDoc(collection(db, 'banners'), {
      ...bannerData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateBanner = async (bannerId, bannerData) => {
  try {
    const docRef = doc(db, 'banners', bannerId);
    await updateDoc(docRef, bannerData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteBanner = async (bannerId) => {
  try {
    const docRef = doc(db, 'banners', bannerId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// CART FUNCTIONS
// ============================================

export const getCart = async (userId) => {
  try {
    const docRef = doc(db, 'cart', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, cart: docSnap.data().items || [] };
    }
    return { success: true, cart: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const cartRef = doc(db, 'cart', userId);
    const cartSnap = await getDoc(cartRef);
    const productResult = await getProduct(productId);
    if (!productResult.success) {
      return { success: false, error: 'Product not found' };
    }
    const product = productResult.product;
    let cartData;
    if (cartSnap.exists()) {
      cartData = cartSnap.data();
    } else {
      cartData = { userId, items: [] };
    }
    const existingItem = cartData.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartData.items.push({
        productId: productId,
        name: product.name,
        price: product.discountedPrice || product.price,
        image: product.images?.[0] || product.image || '',
        quantity: quantity
      });
    }
    await setDoc(cartRef, cartData);
    return { success: true, cart: cartData.items };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const cartRef = doc(db, 'cart', userId);
    const cartSnap = await getDoc(cartRef);
    if (!cartSnap.exists()) {
      return { success: false, error: 'Cart not found' };
    }
    const cartData = cartSnap.data();
    cartData.items = cartData.items.filter(item => item.productId !== productId);
    await setDoc(cartRef, cartData);
    return { success: true, cart: cartData.items };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const clearCart = async (userId) => {
  try {
    const cartRef = doc(db, 'cart', userId);
    await setDoc(cartRef, { userId, items: [] });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// WISHLIST FUNCTIONS
// ============================================

export const getWishlist = async (userId) => {
  try {
    const docRef = doc(db, 'wishlist', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, wishlist: docSnap.data().products || [] };
    }
    return { success: true, wishlist: [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addToWishlist = async (userId, productId) => {
  try {
    const wishlistRef = doc(db, 'wishlist', userId);
    const wishlistSnap = await getDoc(wishlistRef);
    let wishlistData;
    if (wishlistSnap.exists()) {
      wishlistData = wishlistSnap.data();
    } else {
      wishlistData = { userId, products: [] };
    }
    if (wishlistData.products.includes(productId)) {
      return { success: false, error: 'Product already in wishlist' };
    }
    wishlistData.products.push(productId);
    await setDoc(wishlistRef, wishlistData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const removeFromWishlist = async (userId, productId) => {
  try {
    const wishlistRef = doc(db, 'wishlist', userId);
    const wishlistSnap = await getDoc(wishlistRef);
    if (!wishlistSnap.exists()) {
      return { success: false, error: 'Wishlist not found' };
    }
    const wishlistData = wishlistSnap.data();
    wishlistData.products = wishlistData.products.filter(id => id !== productId);
    await setDoc(wishlistRef, wishlistData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ORDER FUNCTIONS
// ============================================

export const createOrder = async (userId, orderData) => {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId: userId,
      ...orderData,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: serverTimestamp()
    });
    return { success: true, orderId: orderRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getOrders = async (userId) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    return { success: true, orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getOrder = async (orderId) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, order: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: false, error: 'Order not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, {
      orderStatus: status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

export const getAllOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    return { success: true, orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = [];
    snapshot.forEach(doc => users.push({ id: doc.id, ...doc.data() }));
    return { success: true, users };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, { role });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ============================================
// REVIEW FUNCTIONS (FIXED)
// ============================================

// Add a review to a product
export const addReview = async (productId, userId, userName, rating, comment) => {
  try {
    // Validate input
    if (!productId || !userId || !rating || !comment) {
      return { success: false, error: 'All fields are required' };
    }
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' };
    }

    // ✅ Store productId as string to match product document ID
    const productIdStr = String(productId);

    // Check if user already reviewed this product
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('productId', '==', productIdStr),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { success: false, error: 'You have already reviewed this product' };
    }

    // Add review
    const docRef = await addDoc(collection(db, 'reviews'), {
      productId: productIdStr,
      userId,
      userName,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      helpful: 0,
      helpfulUsers: [],
    });

    console.log('✅ Review added with ID:', docRef.id);

    // Update product rating
    await updateProductRating(productIdStr);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, error: error.message };
  }
};

// Get all reviews for a product
export const getProductReviews = async (productId) => {
  try {
    const productIdStr = String(productId);
    console.log('🔍 Fetching reviews for productId:', productIdStr);

    // ✅ Remove orderBy to avoid index requirement
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('productId', '==', productIdStr));
    const snapshot = await getDocs(q);
    
    console.log('📄 Found', snapshot.size, 'reviews');

    const reviews = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Format date safely
      let date = 'Recently';
      if (data.createdAt) {
        try {
          const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
          date = 'Recently';
        }
      }
      
      reviews.push({ 
        id: doc.id, 
        ...data, 
        date,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
      });
    });

    // Manual sort by date (newest first)
    reviews.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    console.log('✅ Reviews loaded:', reviews.length);
    return { success: true, reviews };
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return { success: false, error: error.message };
  }
};

// Delete a review (Admin or Owner)
export const deleteReview = async (reviewId, userId, isAdmin = false) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'Review not found' };
    }

    const reviewData = docSnap.data();
    
    // Check if user owns this review or is admin
    if (reviewData.userId !== userId && !isAdmin) {
      return { success: false, error: 'You are not authorized to delete this review' };
    }

    const productId = reviewData.productId;
    
    // Delete review
    await deleteDoc(docRef);
    
    // Update product rating
    await updateProductRating(productId);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    return { success: false, error: error.message };
  }
};

// Update product rating (calculate average)
export const updateProductRating = async (productId) => {
  try {
    const productIdStr = String(productId);
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productIdStr)
    );
    const snapshot = await getDocs(q);
    
    let totalRating = 0;
    let reviewCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      totalRating += data.rating || 0;
      reviewCount += 1;
    });
    
    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
    
    // Update product
    const productRef = doc(db, 'products', productIdStr);
    await updateDoc(productRef, {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviewCount,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating product rating:', error);
    return { success: false, error: error.message };
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId, userId) => {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'Review not found' };
    }
    
    const reviewData = docSnap.data();
    const helpfulUsers = reviewData.helpfulUsers || [];
    
    // Check if user already marked as helpful
    if (helpfulUsers.includes(userId)) {
      return { success: false, error: 'You already marked this as helpful' };
    }
    
    helpfulUsers.push(userId);
    
    await updateDoc(docRef, {
      helpful: helpfulUsers.length,
      helpfulUsers: helpfulUsers,
    });
    
    return { success: true, helpful: helpfulUsers.length };
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return { success: false, error: error.message };
  }
};
