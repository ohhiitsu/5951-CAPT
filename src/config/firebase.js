// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFFiXz1wA3Hb54g-afFP2CPSsiez7zdR0",
  authDomain: "clapp-44e5c.firebaseapp.com",
  projectId: "clapp-44e5c",
  storageBucket: "clapp-44e5c.appspot.com",
  messagingSenderId: "139441689721",
  appId: "1:139441689721:web:4254b77478fb2fef4830a8",
  measurementId: "G-M4T7Z2KGGQ"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);