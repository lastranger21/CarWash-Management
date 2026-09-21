import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export default function NewOrderScreen({ navigation }: any) {
  
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Avanza');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);

  
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Ambil daftar pelanggan & daftar layanan secara paralel
      const [custRes, servRes] = await Promise.all([
        api.get('/customers', { headers }),
        api.get('/service', { headers }),
      ]);

      const custList = custRes.data?.data || [];
      setCustomers(custList);
      if (custList.length > 0) {
        setSelectedCustomerId(custList[0].id); // Default ke pelanggan pertama
      }

      setServices(servRes.data?.data || []);
    } catch (error: any) {
      console.log('Fetch master error:', error);
      Alert.alert('Gagal', 'Tidak dapat memuat data pelanggan atau layanan');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle pilihan layanan cuci
  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Perhitungan Subtotal & Diskon Member
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const isMember = Boolean(selectedCustomer?.membership?.isActive);
  const discountPercent = isMember ? Number(selectedCustomer.membership.discountPercent) || 10 : 0;

  const subtotal = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, curr) => acc + curr.price, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  // Submit Order Baru ke Server (POST /order)
  const handleSubmit = async () => {
    if (!vehiclePlate.trim()) {
      Alert.alert('Peringatan', 'Plat nomor kendaraan wajib diisi!');
      return;
    }
    if (!selectedCustomerId) {
      Alert.alert('Peringatan', 'Silakan pilih pelanggan terlebih dahulu!');
      return;
    }
    if (selectedServices.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu layanan pencucian!');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await SecureStore.getItemAsync('userToken');

      const payload = {
        customerId: selectedCustomerId,
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim(),
        items: selectedServices.map((serviceId) => ({
          serviceId,
          quantity: 1,
        })),
      };

      await api.post('/order', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Sukses', 'Pesanan baru berhasil dibuat dan masuk antrean!');
      navigation.goBack(); // Kembali ke HomeScreen
    } catch (error: any) {
      console.log('Submit order error:', error);
      Alert.alert(
        'Gagal Menyimpan',
        error.response?.data?.message || 'Terjadi kesalahan saat membuat order'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB] justify-center items-center">
        <ActivityIndicator size="large" color="#18181b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* input vehicle */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">Data Kendaraan</Text>

          {/* Plat Nomor */}
          <View className="mb-3">
            <Text className="text-xs font-semibold text-gray-600 mb-1">Plat Nomor</Text>
            <TextInput
              placeholder="Contoh: B 1234 DW"
              placeholderTextColor="#9ca3af"
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              autoCapitalize="characters"
              className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-base font-bold text-gray-900 bg-zinc-50 font-mono"
            />
          </View>

          {/* Pilihan Cepat Model Mobil */}
          <Text className="text-xs font-semibold text-gray-600 mb-1.5">Model Kendaraan</Text>
          <View className="flex-row flex-wrap gap-2">
            {['Avanza', 'Innova', 'Sedan', 'SUV', 'Brio/City Car'].map((model) => (
              <TouchableOpacity
                key={model}
                onPress={() => setVehicleModel(model)}
                className={`px-3 py-1.5 rounded-full border ${
                  vehicleModel === model
                    ? 'bg-zinc-900 border-zinc-900'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    vehicleModel === model ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {model}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/*  pilih customer */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">Pilih Pelanggan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {customers.map((c) => {
              const isSelected = selectedCustomerId === c.id;
              const hasMember = Boolean(c.membership?.isActive);
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCustomerId(c.id)}
                  className={`p-3 rounded-2xl border min-w-[130px] ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-900'
                      : 'bg-zinc-50 border-gray-200'
                  }`}
                >
                  <Text
                    numberOfLines={1}
                    className={`text-xs font-bold ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {c.name}
                  </Text>
                  <Text
                    className={`text-[11px] mt-0.5 ${
                      isSelected ? 'text-zinc-400' : 'text-gray-500'
                    }`}
                  >
                    {c.phone}
                  </Text>
                  {hasMember && (
                    <Text className="text-[10px] font-bold text-emerald-500 mt-1">
                      ★ Member (10%)
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* orderItems */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">Pilih Paket Layanan</Text>
          {services.map((s) => {
            const isChecked = selectedServices.includes(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => toggleService(s.id)}
                activeOpacity={0.8}
                className={`flex-row justify-between items-center p-3.5 rounded-2xl border mb-2.5 ${
                  isChecked
                    ? 'bg-zinc-900 border-zinc-900'
                    : 'bg-white border-gray-200'
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1 mr-3">
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? '#ffffff' : '#9ca3af'}
                  />
                  <View className='flex-1'>
                    <Text
                      className={`text-sm font-bold ${
                        isChecked ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {s.name}
                    </Text>
                    {s.description && (
                      <Text
                        className={`text-sm font-light shrink-0 ${
                    isChecked ? 'text-white' : 'text-gray-900'
                  }`}
                      >
                        {s.description}
                      </Text>
                    )}
                  </View>
                </View>
                <Text
                  className={`text-sm font-extrabold ${
                    isChecked ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Rp {s.price.toLocaleString('id-ID')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/*subtotal dan submit*/}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-xs text-gray-500">Subtotal</Text>
            <Text className="text-xs font-semibold text-gray-900">
              Rp {subtotal.toLocaleString('id-ID')}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-emerald-600">
                Diskon Member ({discountPercent}%)
              </Text>
              <Text className="text-xs font-bold text-emerald-600">
                - Rp {discountAmount.toLocaleString('id-ID')}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between pt-2 mt-1 border-t border-gray-100 mb-4">
            <Text className="text-sm font-bold text-gray-900">Total Biaya</Text>
            <Text className="text-lg font-black text-gray-900">
              Rp {total.toLocaleString('id-ID')}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className="w-full bg-zinc-900 py-3.5 rounded-xl items-center justify-center shadow-xs"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-sm">
                🚀 Simpan & Masukkan ke Antrean
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}