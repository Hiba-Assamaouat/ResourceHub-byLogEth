// ============================================================
//  auth.js  —  Main site sign-in (index.html)
//  Handles: Google sign-in, Email/Password sign-in,
//           new user profile creation in Firestore
// ============================================================

import { auth, db, storage } from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ── Helpers ─────────────────────────────────────────────────

/**
 * Creates or updates the user's profile document in Firestore.
 * Called after every successful sign-in so new users are auto-registered.
 */
async function ensureUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap    = await getDoc(userRef);

  if (!snap.exists()) {
    // First time — create full profile
    await setDoc(userRef, {
      uid:                  user.uid,
      name:                 user.displayName  ?? "",
      email:                user.email        ?? "",
      photoURL:             user.photoURL     ?? "",
      savedArticles:        [],   // array of article IDs
      hackathonRegistrations: [], // array of hackathon IDs
      createdAt:            serverTimestamp(),
      lastLogin:            serverTimestamp(),
      role:                 "user",  // never "admin" from here
    });
  } else {
    // Returning user — just update lastLogin + any changed display info
    await setDoc(userRef, {
      lastLogin: serverTimestamp(),
      name:      user.displayName ?? snap.data().name,
      photoURL:  user.photoURL    ?? snap.data().photoURL,
    }, { merge: true });
  }
}


// ── Google Sign-In ───────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

/**
 * Call this when the "Continue with Google" button is clicked.
 * Works for both sign-in and sign-up — Firestore profile is
 * created automatically on first login.
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(result.user);
    closeModal();
    updateNavUI(result.user);
    return result.user;
  } catch (err) {
    console.error("Google sign-in error:", err.message);
    showAuthError(err.message);
  }
}


// ── Email / Password Sign-In ─────────────────────────────────

/**
 * Sign in an existing user with email + password.
 */
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserProfile(result.user);
    closeModal();
    updateNavUI(result.user);
    return result.user;
  } catch (err) {
    console.error("Email sign-in error:", err.message);
    showAuthError(friendlyError(err.code));
  }
}


// ── Email / Password Sign-Up ─────────────────────────────────

/**
 * Register a brand-new user with email + password.
 * Optionally pass a displayName to store on the profile.
 */
export async function signUpWithEmail(email, password, displayName = "") {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Attach display name to the Auth record
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }

    await ensureUserProfile(result.user);
    closeModal();
    updateNavUI(result.user);
    return result.user;
  } catch (err) {
    console.error("Sign-up error:", err.message);
    showAuthError(friendlyError(err.code));
  }
}


// ── Sign Out ─────────────────────────────────────────────────

export async function logOut() {
  await signOut(auth);
  updateNavUI(null);
}


// ── Auth State Listener ──────────────────────────────────────
// Runs on every page load — keeps nav in sync with login state

onAuthStateChanged(auth, (user) => {
  updateNavUI(user);
});


// ── UI Helpers ───────────────────────────────────────────────

/** Swap "Sign In" button for user's name/avatar when logged in */
function updateNavUI(user) {
  const signInLink = document.querySelector(".signUpLink a");
  if (!signInLink) return;

  if (user) {
    signInLink.textContent = user.displayName?.split(" ")[0] ?? "Account";
    signInLink.href = "./profile.html"; // link to profile page
    signInLink.removeAttribute("id");   // detach modal trigger
  } else {
    signInLink.textContent = "Sign In";
    signInLink.href = "#";
    signInLink.id = "openModal";
    attachModalTrigger();
  }
}

function closeModal() {
  document.getElementById("modalOverlay")?.classList.remove("active");
}

function showAuthError(message) {
  // Look for an existing error element inside the modal, or create one
  let errEl = document.getElementById("authError");
  if (!errEl) {
    errEl = document.createElement("p");
    errEl.id = "authError";
    errEl.style.cssText = "color:#b94a48;font-size:13px;margin-bottom:10px;text-align:center;";
    const submitBtn = document.querySelector(".modal .submit-btn");
    submitBtn?.parentNode.insertBefore(errEl, submitBtn);
  }
  errEl.textContent = message;
}

/** Convert Firebase error codes to readable messages */
function friendlyError(code) {
  const map = {
    "auth/user-not-found":       "No account found with that email.",
    "auth/wrong-password":       "Incorrect password. Please try again.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/too-many-requests":    "Too many attempts. Please wait a moment.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}


// ── Wire up modal buttons ────────────────────────────────────

function attachModalTrigger() {
  document.getElementById("openModal")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("modalOverlay")?.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  attachModalTrigger();

  // Close modal on overlay click
  document.getElementById("modalOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Close button
  document.getElementById("closeModal")?.addEventListener("click", closeModal);

  // Google button inside modal
  document.querySelectorAll(".social-btn").forEach((btn) => {
    if (btn.textContent.includes("Google")) {
      btn.addEventListener("click", signInWithGoogle);
    }
  });

  // Email/password submit
  document.querySelector(".modal .submit-btn")?.addEventListener("click", async () => {
    const email    = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    if (email && password) {
      await signInWithEmail(email, password);
    } else {
      showAuthError("Please enter your email and password.");
    }
  });
});
