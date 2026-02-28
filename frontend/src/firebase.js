import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyADs1YrQZqgkiVudUoRAI1fXIz03Z07jiw",
  authDomain: "fintech-bankapp.firebaseapp.com",
  projectId: "fintech-bankapp",
  storageBucket: "fintech-bankapp.firebasestorage.app",
  messagingSenderId: "793091776076",
  appId: "1:793091776076:web:f72e64c2ed0c03def61ee9",
  measurementId: "G-9KCBG5YT52"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);