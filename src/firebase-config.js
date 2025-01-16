import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, getDocs, query, where } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW4mRlxxr3kFUI7mmDl6Rx5ZgWEje6XL4",
  authDomain: "qmsd-562d1.firebaseapp.com",
  projectId: "qmsd-562d1",
  storageBucket: "qmsd-562d1.appspot.com",
  messagingSenderId: "1065663541085",
  appId: "1:1065663541085:web:00066abf10015bb55f02b4",
  measurementId: "G-XGXZWV4GDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export the necessary functionalities
export { auth, db, collection, addDoc, onSnapshot, getDocs, query, where };
