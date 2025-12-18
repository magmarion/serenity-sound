import { create } from "zustand";
import { auth, db } from "@/services/firebase";
import { User, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    username?: string;
    phone?: string;
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
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    loadProfile: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,

    initializeAuth: () => {
        // First, try to restore the user from AsyncStorage
        AsyncStorage.getItem('user').then(async (persistedUser) => {
            if (persistedUser) {
                try {
                    const user = JSON.parse(persistedUser);
                    console.log("Restored user from AsyncStorage:", user);
                    set({ user, isAuthenticated: true });
                    await get().loadProfile(user.uid);
                } catch (error) {
                    console.error("Failed to parse user from AsyncStorage:", error);
                    set({ isLoading: false });
                }
            } else {
                set({ isLoading: false });
            }
        }).catch(error => {
            console.error("Failed to read from AsyncStorage:", error);
            set({ isLoading: false });
        });

        // Set up the Firebase Auth state listener
        const unsub = onAuthStateChanged(auth, async (user) => {
            console.log("AUTH STATE CHANGED - Current user:", user);
            if (user) {
                console.log("User is authenticated, loading profile...");
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });
                await get().loadProfile(user.uid);
                await AsyncStorage.setItem('user', JSON.stringify(user));
            } else {
                console.log("User is not authenticated");
                set({
                    user: null,
                    profile: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                await AsyncStorage.removeItem('user');
            }
        });

        return unsub;
    },

    signInWithEmail: async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        set({
            user,
            isAuthenticated: true
        });
        await AsyncStorage.setItem('user', JSON.stringify(user));

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            set({ profile: snap.data() as UserProfile });
        }
    },

    signUpWithEmail: async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        const profile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            name: "",
            createdAt: new Date(),
        };

        await setDoc(doc(db, "users", user.uid), profile);
        set({
            user,
            profile,
            isAuthenticated: true
        });
        await AsyncStorage.setItem('user', JSON.stringify(user));
    },

    signOut: async () => {
        await signOut(auth);
        set({
            user: null,
            profile: null,
            isAuthenticated: false
        });
        await AsyncStorage.removeItem('user');
    },

    updateProfile: async data => {
        const user = get().user;
        if (!user) return;

        await updateDoc(doc(db, "users", user.uid), {
            ...data,
            updatedAt: new Date(),
        });

        set(state => ({
            profile: state.profile ? { ...state.profile, ...data } : null,
        }));
    },

    loadProfile: async uid => {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
            set({ profile: snap.data() as UserProfile });
        }
    },
}));
