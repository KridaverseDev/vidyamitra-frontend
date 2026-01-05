// Firebase configuration and initialization

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  signInWithPopup,
  OAuthProvider,
  AuthErrorCodes,
  signOut,
} from "firebase/auth";

// Validate Firebase environment variables
function validateFirebaseConfig() {
  const requiredVars = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value || value === "")
    .map(([key]) => {
      // Convert camelCase to UPPER_SNAKE_CASE
      const snakeCase = key.replace(/([A-Z])/g, "_$1").toUpperCase();
      return `VITE_FIREBASE_${snakeCase}`;
    });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(", ")}\n` +
      `Please create a .env file in the project root with these variables.\n` +
      `See .env.example for reference.`
    );
  }

  return requiredVars;
}

// Firebase configuration
const firebaseConfig = (() => {
  try {
    return validateFirebaseConfig();
  } catch (error) {
    console.error("Firebase configuration error:", error);
    // Return a minimal config to prevent immediate crash, but Firebase will fail on initialization
    return {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
    };
  }
})();

// Lazy initialization - only on client side
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let microsoftProviderInstance: OAuthProvider | null = null;

// Get Firebase app instance - only initializes on client side
function getApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be accessed on the client side");
  }

  if (!appInstance) {
    if (getApps().length === 0) {
      // Validate config before initializing
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
        const error = new Error(
          "Firebase API key is missing. Please set VITE_FIREBASE_API_KEY in your .env file."
        );
        console.error(error);
        throw error;
      }
      try {
        appInstance = initializeApp(firebaseConfig);
      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        if (error instanceof Error && error.message.includes("invalid-api-key")) {
          throw new Error(
            "Invalid Firebase API key. Please check your VITE_FIREBASE_API_KEY in .env file."
          );
        }
        throw error;
      }
    } else {
      appInstance = getApps()[0];
    }
  }

  return appInstance;
}

// Get auth instance - only initializes on client side
function getAuthInstance(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be accessed on the client side");
  }

  if (!authInstance) {
    const app = getApp();
    authInstance = getAuth(app);
  }

  return authInstance;
}

// Get Microsoft provider - only initializes on client side
function getMicrosoftProvider(): OAuthProvider {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth can only be accessed on the client side");
  }

  if (!microsoftProviderInstance) {
    microsoftProviderInstance = new OAuthProvider("microsoft.com");
  }

  return microsoftProviderInstance;
}

// Export auth as a Proxy for backward compatibility
// This ensures auth is only accessed on the client side
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    // Only initialize if we're in the browser
    if (typeof window === "undefined") {
      // During SSR, return safe defaults to prevent errors
      if (prop === "currentUser") {
        return null;
      }
      // Return a no-op function for methods
      if (typeof prop === "string" && prop !== "then" && prop !== "constructor") {
        return () => {
          throw new Error("Firebase Auth can only be used on the client side");
        };
      }
      return undefined;
    }

    try {
      const instance = getAuthInstance();
      const value = instance[prop as keyof Auth];
      if (typeof value === "function") {
        return value.bind(instance);
      }
      return value;
    } catch (error) {
      // If it's a configuration error, provide helpful message
      if (error instanceof Error && error.message.includes("API key")) {
        console.error(
          "Firebase configuration error. Please check your .env file and ensure all VITE_FIREBASE_* variables are set correctly."
        );
      }
      // For onAuthStateChanged and similar methods, return a no-op that logs the error
      if (typeof prop === "string" && prop.startsWith("on")) {
        return () => {
          console.error("Firebase Auth not initialized:", error);
          return () => { }; // Return unsubscribe function
        };
      }
      // For currentUser, return null instead of throwing
      if (prop === "currentUser") {
        return null;
      }
      throw error;
    }
  },
});

// Export app getter for backward compatibility
export const app = new Proxy({} as FirebaseApp, {
  get(_target, prop) {
    if (typeof window === "undefined") {
      return undefined;
    }
    const appInstance = getApp();
    const value = appInstance[prop as keyof FirebaseApp];
    if (typeof value === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (value as any).bind(appInstance);
    }
    return value;
  },
});

// Helper function for Microsoft authentication
export async function signInWithMicrosoft() {
  try {
    const authInstance = getAuthInstance();
    const provider = getMicrosoftProvider();
    const result = await signInWithPopup(authInstance, provider);
    const idToken = await result.user.getIdToken();
    return { success: true, idToken, error: null };
  } catch (err) {
    console.error("Microsoft authentication error:", err);
    let errorMessage =
      "An error occurred during authentication. Please try again.";

    if (err && typeof err === "object" && "code" in err) {
      switch (err.code) {
        case AuthErrorCodes.POPUP_CLOSED_BY_USER:
          errorMessage = "Authentication was cancelled. Please try again.";
          break;
        case AuthErrorCodes.POPUP_BLOCKED:
          errorMessage =
            "Authentication popup was blocked by your browser. Please enable popups and try again.";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage =
            "An account already exists with the same email address but different sign-in credentials.";
          break;
        default:
          // Cast to unknown first, then to an object with message property
          errorMessage =
            (err as unknown as { message?: string })?.message || errorMessage;
      }
    }

    return { success: false, idToken: null, error: errorMessage };
  }
}

// Helper function for signing out
export async function signOutUser() {
  try {
    const authInstance = getAuthInstance();
    await signOut(authInstance);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error };
  }
}

// Helper to get the real auth instance (for use with onAuthStateChanged, etc.)
// Only use this in client components
export function getAuthInstanceForListener(): Auth | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const instance = getAuthInstance();
    return instance;
  } catch {
    return null;
  }
}
