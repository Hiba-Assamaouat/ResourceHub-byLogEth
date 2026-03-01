// ============================================================
//  admin-auth.js  —  Admin login page (admin-login.html)
//  Handles: Admin sign-in, self-registration with approval,
//           role check before allowing access to admin.html
// ============================================================

import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ── Firestore structure for admins ───────────────────────────
//
//  Collection: "admins"
//  Document ID: user.uid
//  Fields:
//    uid          – string
//    email        – string
//    name         – string
//    organisation – string
//    status       – "pending" | "approved" | "rejected"
//    role         – "admin"
//    requestedAt  – timestamp
//    approvedAt   – timestamp (set by you in Firebase Console)
//
// ─────────────────────────────────────────────────────────────


// ── Sign In (existing approved admin) ───────────────────────

export async function adminSignIn(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const uid    = result.user.uid;

    const adminSnap = await getDoc(doc(db, "admins", uid));

    if (!adminSnap.exists()) {
      await signOut(auth);
      showError("No admin account found. Please request access first.");
      return;
    }

    const adminData = adminSnap.data();

    if (adminData.status === "pending") {
      await signOut(auth);
      showError("Your account is pending approval. You'll be notified once approved.");
      return;
    }

    if (adminData.status === "rejected") {
      await signOut(auth);
      showError("Your admin request was not approved. Contact support for help.");
      return;
    }

    if (adminData.status === "approved" && adminData.role === "admin") {
      window.location.href = "./admin.html";
      return;
    }

    await signOut(auth);
    showError("Access denied. Please contact the site administrator.");

  } catch (err) {
    console.error("Admin sign-in error:", err);
    showError(friendlyError(err.code));
  }
}


// ── Request Admin Access (self-register) ─────────────────────

export async function requestAdminAccess(email, password, name, organisation) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid    = result.user.uid;

    await setDoc(doc(db, "admins", uid), {
      uid,
      email,
      name,
      organisation,
      status:      "pending",
      role:        "admin",
      requestedAt: serverTimestamp(),
      approvedAt:  null,
    });

    await signOut(auth);
    showSuccess("Request submitted! You will be notified by email once approved.");

  } catch (err) {
    console.error("Admin registration error:", err);
    showError(friendlyError(err.code));
  }
}


// ── Sign Out ─────────────────────────────────────────────────

export async function adminSignOut() {
  await signOut(auth);
  window.location.href = "./admin-login.html";
}


// ── Guard: protect admin.html ────────────────────────────────

export function guardAdminPage() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "./admin-login.html";
      return;
    }

    const snap = await getDoc(doc(db, "admins", user.uid));

    if (!snap.exists() || snap.data().status !== "approved") {
      await signOut(auth);
      window.location.href = "./admin-login.html";
    }
  });
}


// ── UI Helpers ───────────────────────────────────────────────

function showError(message) {
  const el = document.getElementById("errorMsg");
  if (!el) return;
  el.textContent        = message;
  el.style.color        = "#b94a48";
  el.style.background   = "#fdf0ef";
  el.style.borderColor  = "#f5c6c5";
  el.classList.add("visible");
}

function showSuccess(message) {
  const el = document.getElementById("errorMsg");
  if (!el) return;
  el.textContent        = message;
  el.style.color        = "#2a6b65";
  el.style.background   = "#eaf4f3";
  el.style.borderColor  = "#c2d8d6";
  el.classList.add("visible");
}

function friendlyError(code) {
  const map = {
    "auth/user-not-found":         "No account found with that email.",
    "auth/wrong-password":         "Incorrect password.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/email-already-in-use":   "An account with this email already exists.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/too-many-requests":      "Too many attempts. Please wait a moment.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}


// ── Wire up admin-login.html form ────────────────────────────
// Wrapped in a page check so this safely does nothing when
// admin-auth.js is imported from admin.html for guardAdminPage().

if (document.getElementById("loginForm")) {

  const loginForm    = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const showRegister = document.getElementById("showRegister");
  const showLogin    = document.getElementById("showLogin");
  const formTitle    = document.querySelector(".form-title");
  const formEyebrow  = document.querySelector(".form-eyebrow");

  // Show register form
  showRegister?.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    if (formTitle)   formTitle.textContent   = "Request access.";
    if (formEyebrow) formEyebrow.textContent = "New admin";
  });

  // Back to sign-in
  showLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    if (formTitle)   formTitle.textContent   = "Welcome back.";
    if (formEyebrow) formEyebrow.textContent = "Admin access";
  });

  // Sign-in submit
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) {
      showError("Please fill in both fields.");
      return;
    }
    await adminSignIn(email, password);
  });

  // Registration submit
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name         = document.getElementById("regName").value.trim();
    const organisation = document.getElementById("regOrg").value.trim();
    const email        = document.getElementById("regEmail").value.trim();
    const password     = document.getElementById("regPassword").value;
    const confirm      = document.getElementById("regConfirm").value;

    if (!name || !organisation || !email || !password) {
      showError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      showError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    await requestAdminAccess(email, password, name, organisation);
  });

} // end page guard