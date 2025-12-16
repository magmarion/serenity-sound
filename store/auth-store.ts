// store/auth-store.ts
import { create } from "zustand";
import { auth, db } from "@/services/firebase";
import { User, signOut, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

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
        const unsub = onAuthStateChanged(auth, async user => {
            if (user) {
                set({ user, isAuthenticated: true, isLoading: false });
                await get().loadProfile(user.uid);
            } else {
                set({
                    user: null,
                    profile: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        });
        return unsub;
    },


    signInWithEmail: async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;

        set({ user, isAuthenticated: true });

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
        set({ user, profile, isAuthenticated: true });
    },

    signOut: async () => {
        await signOut(auth);
        set({ user: null, profile: null, isAuthenticated: false });
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
