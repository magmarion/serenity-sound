import { db } from "@/services/firebase";
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, } from "firebase/firestore";
import { Session } from "@/store/favorites-store";

export const favoritesService = {
    addFavorite: async (uid: string, session: Session) => {
        const ref = doc(db, "users", uid, "favorites", session.id);

        await setDoc(ref, {
            ...session,
            createdAt: serverTimestamp(),
        });
    },

    removeFavorite: async (uid: string, sessionId: string) => {
        const ref = doc(db, "users", uid, "favorites", sessionId);
        await deleteDoc(ref);
    },

    getFavorites: async (uid: string): Promise<Session[]> => {
        const colRef = collection(db, "users", uid, "favorites");
        const snapshot = await getDocs(colRef);

        return snapshot.docs.map((docSnap) => {
            const data = docSnap.data();

            return {
                id: docSnap.id,
                title: data.title,
                durationLabel: data.durationLabel,
                moodId: data.moodId,
                category: data.category,
                soundUrl: data.soundUrl,
                duration: data.duration,
                artworkUrl: data.artworkUrl,
            } as Session;
        });
    },
};
