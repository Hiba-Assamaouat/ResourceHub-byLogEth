// ============================================================
//  firebase-config.js  —  shared across all pages
//  Replace the firebaseConfig object with your own project's
//  values from: Firebase Console → Project Settings → General
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// 🔴 REPLACE THIS with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBXgJLnMecxrA4mSgf-MKWuB7cgIhezUtI",
  authDomain: "accountauth-9764e.firebaseapp.com",
  projectId: "accountauth-9764e",
  storageBucket: "accountauth-9764e.firebasestorage.app",
  messagingSenderId: "366213820576",
  appId: "1:366213820576:web:5da5e327c31a0dccd099c5"
};

const app       = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
