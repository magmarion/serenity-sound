import { auth, db } from "@/services/firebase";
import {
    createUserWithEmailAndPassword,
    deleteUser,
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    User,
} from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { create } from "zustand";
import { useFavoritesStore } from "@/store/favorites-store"; // ✅ ADD

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

    changePassword: (
        currentPassword: string,
        newPassword: string
    ) => Promise<void>;

    deleteAccount: (currentPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,

    initializeAuth: () => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                });

                await get().loadProfile(user.uid);

                // ✅ LOAD FAVORITES FOR AUTHENTICATED USER
                await useFavoritesStore
                    .getState()
                    .loadFavoritesFromDb();
            } else {
                set({
                    user: null,
                    profile: null,
                    isAuthenticated: false,
                    isLoading: false,
                });

                // ✅ CLEAR FAVORITES ON LOGOUT
                useFavoritesStore.getState().clearFavorites();
            }
        });

        return unsub;
    },

    signInWithEmail: async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;

        set({
            user,
            isAuthenticated: true,
        });

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            set({ profile: snap.data() as UserProfile });
        }

        // ✅ LOAD FAVORITES AFTER SIGN IN
        await useFavoritesStore
            .getState()
            .loadFavoritesFromDb();
    },

    signUpWithEmail: async (email, password) => {
        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
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
            isAuthenticated: true,
        });

        // ✅ NEW USER → EMPTY FAVORITES
        useFavoritesStore.getState().clearFavorites();
    },

    signOut: async () => {
        await signOut(auth);

        // ✅ CLEAR FAVORITES ON SIGN OUT
        useFavoritesStore.getState().clearFavorites();

        set({
            user: null,
            profile: null,
            isAuthenticated: false,
        });
    },

    updateProfile: async (data) => {
        const user = get().user;
        if (!user) return;

        await updateDoc(doc(db, "users", user.uid), {
            ...data,
            updatedAt: new Date(),
        });

        set((state) => ({
            profile: state.profile ? { ...state.profile, ...data } : null,
        }));
    },

    loadProfile: async (uid) => {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
            set({ profile: snap.data() as UserProfile });
        }
    },

    changePassword: async (currentPassword, newPassword) => {
        const user = auth.currentUser;

        if (!user || !user.email) {
            throw new Error("Not authenticated");
        }

        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
    },

    deleteAccount: async (currentPassword) => {
        const user = auth.currentUser;

        if (!user || !user.email) {
            throw new Error("Not authenticated");
        }

        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword
        );

        await reauthenticateWithCredential(user, credential);

        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(user);

        // ✅ CLEAR FAVORITES AFTER ACCOUNT DELETION
        useFavoritesStore.getState().clearFavorites();

        set({
            user: null,
            profile: null,
            isAuthenticated: false,
        });
    },
}));
