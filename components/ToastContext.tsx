import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { registerToast } from "@/services/toast";

type ToastType = "success" | "info";

type ToastContextType = {
    showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState<string | null>(null);

    // Slide from above header
    const translateY = useRef(new Animated.Value(-160)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const showToast = useCallback(
        (text: string, type: ToastType = "info") => {
            setMessage(text);

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 260,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(2000),
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -160,
                        duration: 260,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => setMessage(null));
        },
        [opacity, translateY]
    );

    useEffect(() => {
        registerToast(showToast);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {message && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.toastContainer,
                        {
                            paddingTop: insets.top + 8,
                            opacity,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <View style={styles.toastContent}>
                        <Text style={styles.toastText}>{message}</Text>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used inside ToastProvider");
    }
    return ctx;
}

const styles = StyleSheet.create({
    toastContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 130,
        backgroundColor: "#0B0E14",
        zIndex: 9999,
    },
    toastContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        lineHeight: 20,
    },
});
