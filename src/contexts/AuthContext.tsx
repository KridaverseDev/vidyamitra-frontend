// Authentication Context
// Global authentication state management

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import { useCurrentUser } from "@/lib/api/hooks";
import type { User } from "@/lib/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // Only fetch user if Firebase user exists and auth is ready
    const shouldFetch = !!firebaseUser && isAuthReady;
    const { data: user, isLoading, refetch } = useCurrentUser(shouldFetch);

    // Override isLoading to be true if we're waiting for Firebase auth state
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Listen to Firebase auth state changes
    useEffect(() => {
        if (typeof window === "undefined") {
            setIsCheckingAuth(false);
            return;
        }

        try {
            const unsubscribe = auth.onAuthStateChanged(
                async (user) => {
                    setFirebaseUser(user);
                    setIsCheckingAuth(false);
                    // Wait for Firebase token to be available before enabling user fetch
                    if (user) {
                        try {
                            // Ensure token is available
                            await user.getIdToken();
                            setIsAuthReady(true);
                        } catch (error) {
                            console.error("Error getting Firebase token:", error);
                            setIsAuthReady(false);
                        }
                    } else {
                        setIsAuthReady(false);
                    }
                },
                (error) => {
                    console.error("Firebase auth state change error:", error);
                    setIsCheckingAuth(false);
                    // If it's a configuration error, log helpful message
                    const errorCode = (error as { code?: string })?.code;
                    const errorMessage = error?.message || "";
                    if (errorCode === "auth/invalid-api-key" || errorMessage.includes("API key")) {
                        console.error(
                            "Firebase configuration error. Please check your .env file and ensure all VITE_FIREBASE_* variables are set correctly."
                        );
                    }
                }
            );

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to set up Firebase auth listener:", error);
            setIsCheckingAuth(false);
        }
    }, []);

    const value: AuthContextType = {
        user: user || null,
        isLoading: isCheckingAuth || (shouldFetch && isLoading),
        isAuthenticated: !!firebaseUser && !!user,
        refetch,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

