// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA413L380WWqoXm0LipUB8gxE-jkdgtrgg",
    authDomain: "neuroscan-c40c9.firebaseapp.com",
    projectId: "neuroscan-c40c9",
    storageBucket: "neuroscan-c40c9.appspot.com",
    messagingSenderId: "1062398989863",
    appId: "1:1062398989863:web:ccdd0f8d58bb73e04b2002",
    measurementId: "G-ZWJ6DHZ3C4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
