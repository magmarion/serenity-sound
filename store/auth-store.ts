// /store/auth-store.ts
import { create } from 'zustand';
import { auth, db } from '@/services/firebase';
import {
    User,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

interface UserProfile {
    uid: string;
    email: string;
    name: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt?: Date;
}

interface AuthStore {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    initializeAuth: () => () => void;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    loadProfile: (uid: string) => Promise<void>;
    handleRedirectResult: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,

    initializeAuth: () => {
        get().handleRedirectResult();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                set({ user: firebaseUser, isAuthenticated: true, isLoading: false });
                await get().loadProfile(firebaseUser.uid);
            } else {
                set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
            }
        });

        return unsubscribe;
    },

    signInWithGoogle: async () => {
        try {
            // Get authDomain from your firebaseConfig
            // It looks like: "your-project-id.firebaseapp.com"
            const authDomain = 'YOUR_AUTH_DOMAIN_HERE'; // IMPORTANT: Replace this!

            const provider = new GoogleAuthProvider();

            // Create the Firebase OAuth URL
            const authUrl = `https://${authDomain}/__/auth/handler?authType=signInWithRedirect&provider=google.com&redirect_uri=${encodeURIComponent(Linking.createURL('/'))}&scopes=profile email`;

            // Open in-app browser
            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                Linking.createURL('/') // This must match the redirect_uri above
            );

            if (result.type === 'success') {
                // After returning from browser, check the redirect result
                await get().handleRedirectResult();
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    },

    handleRedirectResult: async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result?.user) {
                const { user } = result;

                // Check if user exists in Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));

                if (!userDoc.exists()) {
                    // New user - create profile
                    const newProfile: UserProfile = {
                        uid: user.uid,
                        email: user.email!,
                        name: user.displayName || user.email!.split('@')[0],
                        photoURL: user.photoURL || '',
                        createdAt: new Date(),
                    };

                    await setDoc(doc(db, 'users', user.uid), newProfile);
                    set({ profile: newProfile });
                } else {
                    // Existing user - load profile
                    await get().loadProfile(user.uid);
                }

                set({ user, isAuthenticated: true });
            }
        } catch (error) {
            console.error('Error handling redirect result:', error);
        }
    },

    signOut: async () => {
        await signOut(auth);
        set({
            user: null,
            profile: null,
            isAuthenticated: false
        });
    },

    updateProfile: async (data: Partial<UserProfile>) => {
        const { user } = get();
        if (!user) throw new Error('No user logged in');

        const updateData = {
            ...data,
            updatedAt: new Date(),
        };

        await updateDoc(doc(db, 'users', user.uid), updateData);

        set((state) => ({
            profile: state.profile ? { ...state.profile, ...updateData } : null
        }));
    },

    loadProfile: async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const profileData = userDoc.data() as UserProfile;
                set({ profile: profileData });
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    },
}));