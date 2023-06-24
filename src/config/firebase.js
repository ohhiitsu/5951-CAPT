// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfigjai = {
  apiKey: "AIzaSyBFFiXz1wA3Hb54g-afFP2CPSsiez7zdR0",
  authDomain: "clapp-44e5c.firebaseapp.com",
  projectId: "clapp-44e5c",
  storageBucket: "clapp-44e5c.appspot.com",
  messagingSenderId: "139441689721",
  appId: "1:139441689721:web:4254b77478fb2fef4830a8",
  measurementId: "G-M4T7Z2KGGQ"
};

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHRiZrcKcYR7NpmAn8wdqLeKiRFg3Kxo0",
  authDomain: "orbital2023-3e7ce.firebaseapp.com",
  projectId: "orbital2023-3e7ce",
  storageBucket: "orbital2023-3e7ce.appspot.com",
  messagingSenderId: "794986056398",
  appId: "1:794986056398:web:a36ceb3c242f874efa5e9f",
  measurementId: "G-FE7QDSDJ24"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);