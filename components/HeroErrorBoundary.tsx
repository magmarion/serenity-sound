import React from "react";
import { View, Text } from "react-native";
// import Colors from "@/constants/colors";

type Props = { children: React.ReactNode };

type State = { hasError: boolean };

export default class HomeErrorBoundary extends React.Component<Props, State> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.log("[HomeErrorBoundary]", error.message);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 bg-black items-center justify-center p-6">
                    <Text className="text-white text-xl font-bold">Something went wrong</Text>
                    <Text className="text-gray-400 mt-2 text-base text-center">
                        Please refresh to try again.
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}
