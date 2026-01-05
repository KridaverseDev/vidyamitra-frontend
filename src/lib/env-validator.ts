// Environment variable validation

// Define all required environment variables here
const requiredEnvVars = {
  // Firebase env vars
  VITE_FIREBASE_API_KEY: "Firebase API Key",
  VITE_FIREBASE_AUTH_DOMAIN: "Firebase Auth Domain",
  VITE_FIREBASE_PROJECT_ID: "Firebase Project ID",
  VITE_FIREBASE_STORAGE_BUCKET: "Firebase Storage Bucket",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "Firebase Messaging Sender ID",
  VITE_FIREBASE_APP_ID: "Firebase App ID",

  // API url
  VITE_API_URL: "API URL",

  // Add any future environment variables here
};

// Interface for environment validation
export interface EnvValidationResult {
  valid: boolean;
  missingVars: Array<{
    key: string;
    description: string;
  }>;
}

/**
 * Validates that all required environment variables are present
 */
export function validateEnv(): EnvValidationResult {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key]) => !import.meta.env[key] || import.meta.env[key] === "")
    .map(([key, description]) => ({ key, description }));

  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}

/**
 * Determines if the app is running in the browser
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Gets the validation result or null if in the browser
 * Use this to avoid exposing env validation in client-side code
 */
export function getValidationResult(): EnvValidationResult | null {
  // We only want to check on the server side
  if (isBrowser()) return null;

  return validateEnv();
}
