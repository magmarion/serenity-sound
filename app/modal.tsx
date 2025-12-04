import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

export default function ModalScreen() {
  return (
    <Modal
      animationType="fade"
      transparent
      visible
      onRequestClose={() => router.back()}
    >
      {/* Background overlay */}
      <Pressable
        onPress={() => router.back()}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <View className="bg-white rounded-2xl p-6 mx-5 items-center min-w-[300px]">
          <Text className="text-xl font-bold mb-4">Modal</Text>

          <Text className="text-center mb-6 text-gray-600 leading-5">
            This is an example modal with proper fade animation.
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-500 px-6 py-3 rounded-lg min-w-[100px]"
          >
            <Text className="text-white font-semibold text-center">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </Modal>
  );
}
