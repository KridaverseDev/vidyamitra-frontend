import { auth } from "@/lib/firebase";

export async function getFirebaseToken(): Promise<string | null> {
    try {
        if (typeof window === "undefined") {
            return null;
        }

        const user = auth.currentUser;
        if (!user) {
            return null;
        }

        const token = await user.getIdToken();
        return token;
    } catch (error) {
        console.error("Error getting Firebase token:", error);
        return null;
    }
}

export function getCurrentFirebaseUser() {
    if (typeof window === "undefined") {
        return null;
    }
    return auth.currentUser;
}

export function isAuthenticated(): boolean {
    return getCurrentFirebaseUser() !== null;
}

export async function refreshFirebaseToken(): Promise<string | null> {
    try {
        if (typeof window === "undefined") {
            return null;
        }

        const user = auth.currentUser;
        if (!user) {
            return null;
        }

        const token = await user.getIdToken(true);
        return token;
    } catch (error) {
        console.error("Error refreshing Firebase token:", error);
        return null;
    }
}

export function waitForAuth() {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(null);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        });
    });
}
