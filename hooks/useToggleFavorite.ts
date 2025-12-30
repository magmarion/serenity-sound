import * as Haptics from "expo-haptics";
import { toast } from "@/services/toast";
import { useFavoritesStore } from "@/store/favorites-store";
import { Session } from "@/services/api";

export function useToggleFavorite() {
    const toggleFavorite = useFavoritesStore(
        (state) => state.toggleFavorite
    );

    const handleToggleFavorite = async (session: Session) => {
        await Haptics.selectionAsync();

        const result = await toggleFavorite(session);

        if (result === "added") {
            toast("Added to favorites");
        }

        if (result === "removed") {
            toast("Removed from favorites");
        }
    };

    return { handleToggleFavorite };
}
