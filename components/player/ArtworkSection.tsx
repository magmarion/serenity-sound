import { playerStyles as styles } from "@/styles/modal/player.styles";
import { Image } from "expo-image";
import { View } from "react-native";

interface Props {
    artworkUrl: string;
}

export function ArtworkSection({ artworkUrl }: Props) {
    return (
        <View style={styles.artContainer}>
            <View style={styles.artWrapper}>
                <Image
                    source={artworkUrl}
                    style={styles.art}
                    contentFit="cover"
                />
            </View>
        </View>
    );
}
