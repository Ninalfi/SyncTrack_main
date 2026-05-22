import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgRh6KOtVfp0AYt6Vnq8iw3t99U30TGWg",
  authDomain: "synctrack-12aa3.firebaseapp.com",
  projectId: "synctrack-12aa3",
  storageBucket: "synctrack-12aa3.firebasestorage.app",
  messagingSenderId: "243375052636",
  appId: "1:243375052636:web:ae826cb6db861c63185399",
  measurementId: "G-DN8BCCCB66"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
