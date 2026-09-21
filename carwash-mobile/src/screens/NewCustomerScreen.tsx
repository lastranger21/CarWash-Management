import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export default function NewCustomerScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    //  Validasi Input Dasar
    if (!name.trim()) {
      Alert.alert('Peringatan', 'Nama pelanggan wajib diisi!');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Peringatan', 'Nomor telepon / WhatsApp wajib diisi!');
      return;
    }
    if (phone.trim().length < 8) {
      Alert.alert('Peringatan', 'Nomor telepon minimal 8 digit!');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await SecureStore.getItemAsync('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      //  Buat Customer Baru (POST /customers)
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
      };
      if (plate.trim()) {
        payload.plate = plate.toUpperCase().trim();
      }

      const res = await api.post('/customers', payload, { headers });
      const createdCustomer = res.data?.data;

      //  Jika Opsi Member Aktif, Panggil PATCH /customers/:id/membership
      if (isMember && createdCustomer?.id) {
        try {
          await api.patch(`/customers/${createdCustomer.id}/membership`, {}, { headers });
        } catch (memberErr) {
          console.log('Gagal aktivasi member:', memberErr);
          // Kita tidak batalkan seluruh proses, cukup catat log
        }
      }

      //  beri alur order atau ke customer screen
      Alert.alert(
        'Berhasil Terdaftar! 🎉',
        `Pelanggan ${createdCustomer?.name || name} telah tersimpan.${
          isMember ? ' Status Member Aktif (Diskon 10%).' : ''
        }\n\nApakah ingin langsung membuat order pencucian?`,
        [
          {
            text: 'Kembali ke Daftar',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
          {
            text: 'Langsung Cuci Mobil',
            onPress: () => navigation.replace('NewOrder'),
          },
        ]
      );
    } catch (error: any) {
      console.log('Error create customer:', error);
      Alert.alert(
        'Gagal Menyimpan',
        error.response?.data?.message || 'Terjadi kesalahan saat mendaftarkan customer'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          {/* Header Card / Info Singkat */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-gray-900">Registrasi Pelanggan</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Daftarkan pelanggan baru untuk riwayat layanan & aktivasi program membership.
            </Text>
          </View>

          {/* Section 1: Data Identitas Pelanggan (Wajib) */}
          <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-7 h-7 rounded-full bg-zinc-100 items-center justify-center">
                <Ionicons name="person" size={14} color="#18181b" />
              </View>
              <Text className="text-base font-bold text-gray-900">Data Diri Pelanggan</Text>
            </View>

            {/* Input Nama */}
            <View className="mb-3.5">
              <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                Nama Lengkap <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Contoh: Budi Santoso"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-zinc-50"
              />
            </View>

            {/* Input No HP */}
            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                Nomor Telepon / WhatsApp <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Contoh: 081234567890"
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-zinc-50 font-mono"
              />
            </View>
          </View>

          {/* Section 2: Data Kendaraan Awal (Opsional) */}
          <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-7 h-7 rounded-full bg-zinc-100 items-center justify-center">
                <Ionicons name="car" size={14} color="#18181b" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">Kendaraan Awal</Text>
                <Text className="text-[11px] text-gray-400">Opsional, bisa diisi nanti ketika order</Text>
              </View>
            </View>

            {/* Input Plat Nomor */}
            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-1.5">Plat Nomor Kendaraan</Text>
              <TextInput
                placeholder="Contoh: B 1234 DW"
                placeholderTextColor="#9ca3af"
                value={plate}
                onChangeText={setPlate}
                autoCapitalize="characters"
                className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-gray-900 bg-zinc-50 font-mono"
              />
            </View>
          </View>

          {/* Section 3: Opsi Membership Instan */}
          <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-3">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="sparkles" size={16} color="#059669" />
                  <Text className="text-sm font-bold text-gray-900">Segera Daftar Member</Text>
                </View>
                <Text className="text-xs text-gray-500 leading-4">
                  Terbitkan Membership secara instan.
                </Text>
              </View>
              <Switch
                value={isMember}
                onValueChange={setIsMember}
                trackColor={{ false: '#e4e4e7', true: '#10b981' }}
                thumbColor={isMember ? '#ffffff' : '#f4f4f5'}
              />
            </View>

            {isMember && (
              <View className="mt-3.5 pt-3 border-t border-gray-50 flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text className="text-xs font-semibold text-emerald-700">
                  Nikmati benefit diskon 10% bagi  member
                </Text>
              </View>
            )}
          </View>

          {/* Tombol Simpan */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className={`p-4 rounded-2xl flex-row justify-center items-center ${
              isSubmitting ? 'bg-zinc-700' : 'bg-zinc-900'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="person-add" size={18} color="#ffffff" />
                <Text className="text-white font-bold text-base ml-2">Simpan Pelanggan</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}