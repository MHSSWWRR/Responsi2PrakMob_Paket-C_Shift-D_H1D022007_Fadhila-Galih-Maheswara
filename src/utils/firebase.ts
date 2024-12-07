// src/utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCtzkod2aIInEc1D5ScIukOv3__-LuhK9g",
    authDomain: "reponsi2.firebaseapp.com",
    projectId: "reponsi2",
    storageBucket: "reponsi2.firebasestorage.app",
    messagingSenderId: "614302842451",
    appId: "1:614302842451:web:a98b5357201c58b40bd0a6"
  };

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const db = getFirestore(firebase);

export {auth, googleProvider, db};