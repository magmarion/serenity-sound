import { playerStyles as styles } from "@/styles/modal/player.styles";
import { Text, View } from "react-native";

interface Props {
    title: string;
    subtitle: string;
}

export function PlayerHeader({ title, subtitle }: Props) {
    return (
        <View style={styles.header}>
            <Text
                style={styles.title}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {title}
            </Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
}
