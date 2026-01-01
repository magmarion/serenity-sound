import { Stack } from "expo-router";

export default function SettingsLayout() {
    return (
        <Stack
            screenOptions={{
                presentation: "card",
                animation: "slide_from_right",
                headerShown: false,
            }}
        />
    );
}
