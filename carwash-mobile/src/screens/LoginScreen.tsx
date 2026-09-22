import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../config/api";
import { AuthContext } from "../../App";
import useUserStore from '../userStore'
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, username, setUserRole } = useContext(AuthContext);
  const setUsername = useUserStore((state) => state.setUsername);
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Perhatian", "Mohon masukkan email dan password!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      const token = response.data.token;
      const data= response.data.user
      if (token) {
        signIn(token);
        username(data.name);
        setUserRole(data.role);
      } else {
        Alert.alert("Login Gagal", "Token tidak ditemukan dalam respon server.");
      }
    } catch (error: any) {
      console.error("Login error:", error?.response?.data || error.message);
      const message =
        error?.response?.data?.message ||
        "Login gagal! Periksa kembali email dan password Anda.";
      Alert.alert("Gagal Masuk", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-zinc-100"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Container */}
          <View className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-xl shadow-zinc-950/10 max-w-md w-full self-center">
            {/* Logo Badge */}
            <View className="items-center mb-3">
              <View className="w-14 h-14 rounded-2xl bg-zinc-900 items-center justify-center shadow-md shadow-zinc-900/20">
                <Ionicons name="car" size={28} color="#ffffff" />
              </View>
            </View>

            {/* Header Text */}
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-zinc-900 tracking-tight">
                CleanWash Pro
              </Text>
              <Text className="text-sm text-zinc-500 text-center mt-1.5 px-2 leading-5">
                Masukkan email dan password untuk masuk ke dashboard kasir
              </Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              {/* Field Email */}
              <View className="space-y-1.5 mb-3">
                <Text className="text-xs font-semibold text-zinc-700 tracking-wide">
                  Email
                </Text>
                <View className="flex-row items-center border border-zinc-300 rounded-xl px-3.5 bg-zinc-50/60 focus:border-zinc-900 focus:bg-white">
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#71717a"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="admin@cleanwash.com"
                    placeholderTextColor="#a1a1aa"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    className="flex-1 py-3 text-sm text-zinc-900"
                  />
                </View>
              </View>

              {/* Field Password */}
              <View className="space-y-1.5 mb-5">
                <Text className="text-xs font-semibold text-zinc-700 tracking-wide">
                  Password
                </Text>
                <View className="flex-row items-center border border-zinc-300 rounded-xl px-3.5 bg-zinc-50/60 focus:border-zinc-900 focus:bg-white">
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#71717a"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#a1a1aa"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 py-3 text-sm text-zinc-900"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#71717a"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
                className="w-full bg-zinc-900 py-3.5 rounded-xl items-center justify-center shadow-md shadow-zinc-900/15"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Masuk ke Dashboard
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
