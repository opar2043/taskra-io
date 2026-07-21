// Maps Firebase auth error codes to friendly, product-voice messages.
const MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Try again or reset it.",
  "auth/invalid-credential": "Email or password is incorrect.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/network-request-failed": "Network error — check your connection and retry.",
};

export function firebaseError(err, fallback = "Something went wrong. Please try again.") {
  const code = err?.code || "";
  return MESSAGES[code] || fallback;
}

// Alias kept so call sites can use either name.
export const getFirebaseAuthError = firebaseError;

export default firebaseError;
