// app/sign-in.tsx
import { useLocalSearchParams, router } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/store/auth-store';
import { AuthForm } from '@/components/auth';

export default function SignInScreen() {
    const params = useLocalSearchParams();
    const initialMode = params.mode === 'signup' ? 'signup' : 'signin';
    const { signInWithEmail, signUpWithEmail, updateProfile } = useAuthStore();

    const handleSubmit = async (
        mode: 'signin' | 'signup',
        data: {
            email: string;
            password: string;
            name?: string;
            username?: string;
            phone?: string;
            confirmPassword?: string;
        }
    ) => {
        if (mode === 'signin') {
            await signInWithEmail(data.email, data.password);
            router.replace('/(tabs)/home'); // Will be renamed to home
        } else {
            // Sign up flow
            await signUpWithEmail(data.email, data.password);

            // Update profile with additional info
            if (data.name || data.username || data.phone) {
                await updateProfile({
                    name: data.name || '',
                    username: data.username || (data.name ? `@${data.name.toLowerCase().replace(/\s/g, "")}` : ''),
                    phone: data.phone || '',
                });
            }

            router.replace('/(tabs)/home'); // Will be renamed to home
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={{ flex: 1 }}>
            <AuthForm
                mode={initialMode}
                onSubmit={handleSubmit}
                onBack={handleBack}
                showBackButton={true}
                isInModal={false}
            />
        </View>
    );
}