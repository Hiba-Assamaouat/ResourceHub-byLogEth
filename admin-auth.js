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
//    organisation – string   (hackathon org they represent)
//    status       – "pending" | "approved" | "rejected"
//    role         – "admin"
//    requestedAt  – timestamp
//    approvedAt   – timestamp (set by super-admin)
//
// ─────────────────────────────────────────────────────────────


// ── Sign In (existing approved admin) ───────────────────────

export async function adminSignIn(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const uid    = result.user.uid;

    // Check Firestore for admin record
    const adminSnap = await getDoc(doc(db, "admins", uid));

    if (!adminSnap.exists()) {
      await signOut(auth);
      showError("No admin account found. Please request access first.");
      return;
    }

    const adminData = adminSnap.data();

    if (adminData.status === "pending") {
      await signOut(auth);
      showError("Your account is pending approval. You'll receive an email once approved.");
      return;
    }

    if (adminData.status === "rejected") {
      await signOut(auth);
      showError("Your admin request was not approved. Contact support for help.");
      return;
    }

    if (adminData.status === "approved" && adminData.role === "admin") {
      // ✅ All good — send to admin dashboard
      window.location.href = "./admin.html";
      return;
    }

    // Fallback
    await signOut(auth);
    showError("Access denied. Please contact the site administrator.");

  } catch (err) {
    console.error("Admin sign-in error:", err);
    showError(friendlyError(err.code));
  }
}


// ── Request Admin Access (self-register) ─────────────────────

/**
 * Creates a Firebase Auth account AND a Firestore "admins" doc
 * with status: "pending". A super-admin must approve it before
 * this person can log in.
 */
export async function requestAdminAccess(email, password, name, organisation) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const uid    = result.user.uid;

    // Write pending admin record
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

    // Sign them out immediately — they must wait for approval
    await signOut(auth);

    showSuccess("Request submitted! You'll be notified by email once approved.");

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
/**
 * Call this at the top of admin.html's script.
 * Redirects unauthenticated or non-approved users away immediately.
 *
 * Usage in admin.html:
 *   import { guardAdminPage } from "./admin-auth.js";
 *   guardAdminPage();
 */
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
  el.textContent = message;
  el.classList.add("visible");
}

function showSuccess(message) {
  const el = document.getElementById("errorMsg");
  if (!el) return;
  el.textContent = message;
  el.style.color           = "#2a6b65";
  el.style.background      = "#eaf4f3";
  el.style.borderColor     = "#c2d8d6";
  el.classList.add("visible");
}

function friendlyError(code) {
  const map = {
    "auth/user-not-found":       "No account found with that email.",
    "auth/wrong-password":       "Incorrect password.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/too-many-requests":    "Too many attempts. Please wait a moment.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}


// ── Wire up admin-login.html form ────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const loginForm    = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const showRegister = document.getElementById("showRegister");
  const showLogin    = document.getElementById("showLogin");

  // Toggle between sign-in and register panels
  showRegister?.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm?.classList.add("hidden");
    registerForm?.classList.remove("hidden");
    document.querySelector(".form-title").textContent = "Request access.";
    document.querySelector(".form-eyebrow").textContent = "New admin";
  });

  showLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm?.classList.add("hidden");
    loginForm?.classList.remove("hidden");
    document.querySelector(".form-title").textContent = "Welcome back.";
    document.querySelector(".form-eyebrow").textContent = "Admin access";
  });

  // Sign-in submit
  loginForm?.addEventListener("submit", async (e) => {
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
  registerForm?.addEventListener("submit", async (e) => {
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
});
