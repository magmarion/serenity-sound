import { COLORS, profileStyles as styles } from "@/styles/modal/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TextInput, View } from "react-native";

type FieldKey = "name" | "email" | "phone" | "username";

type Props = {
    localFields: Record<FieldKey, string>;
    fieldConfigs: {
        key: FieldKey;
        label: string;
        icon: any;
        keyboardType: any;
    }[];
    onChangeField: (key: FieldKey, value: string) => void;
};

export function UserInfo({
    localFields,
    fieldConfigs,
    onChangeField,
}: Props) {
    return (
        <>
            <Text style={styles.sectionTitle} testID="profile/personalInfoTitle">
                User Info
            </Text>

            <LinearGradient
                colors={[COLORS.cardTop, COLORS.cardBottom]}
                style={styles.card}
            >
                <View style={styles.cardTopHighlight} />

                {fieldConfigs.map((config) => {
                    const showError = false;

                    return (
                        <View key={config.key} style={styles.fieldBlock}>
                            <Text
                                style={styles.fieldLabel}
                                testID={`profile/fieldLabel/${config.key}`}
                            >
                                {config.label}
                            </Text>

                            <View style={styles.securityRow}>
                                <View style={styles.securityLeft}>
                                    <View style={styles.securityIconWrap}>
                                        <Ionicons
                                            name={config.icon}
                                            size={16}
                                            color={COLORS.subText}
                                        />
                                    </View>

                                    <TextInput
                                        style={styles.editableRow}
                                        value={localFields[config.key]}
                                        keyboardType={config.keyboardType}
                                        placeholder={`Enter ${config.label}`}
                                        placeholderTextColor={COLORS.subText}
                                        onChangeText={(text) =>
                                            onChangeField(config.key, text)
                                        }
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {showError && (
                                <View style={styles.errorRow}>
                                    <View style={styles.errorAsterisk} />
                                    <Text style={styles.errorText}>
                                        Error message
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </LinearGradient>
        </>
    );
}
