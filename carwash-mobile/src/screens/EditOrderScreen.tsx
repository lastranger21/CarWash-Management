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

export default function EditOrderScreen({ route, navigation }: any) {
  const { id } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Avanza');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Ambil detail order dan master service secara paralel
      const [orderRes, servRes] = await Promise.all([
        api.get(`/order/${id}`, { headers }),
        api.get('/service', { headers }),
      ]);

      const orderData = orderRes.data?.data;
      const servicesData = servRes.data?.data || [];

      if (!orderData) {
        Alert.alert('Error', 'Data pesanan tidak ditemukan');
        navigation.goBack();
        return;
      }

      setOrder(orderData);
      setServices(servicesData);
      setVehiclePlate(orderData.vehiclePlate || '');
      setVehicleModel(orderData.vehicle?.modelName || 'Avanza');

      // Ambil ID layanan yang saat ini dipilih
      const currentServiceIds = (orderData.orderItems || []).map(
        (item: any) => item.serviceId || item.service?.id
      );
      setSelectedServices(currentServiceIds);
    } catch (error: any) {
      console.log('Fetch edit order error:', error);
      Alert.alert(
        'Gagal Memuat',
        error.response?.data?.message || 'Tidak dapat mengambil data pesanan'
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const isPaid = order?.paymentStatus === 'PAID';

  // Toggle pilihan layanan (hanya aktif jika pesanan BELUM LUNAS)
  const toggleService = (serviceId: number) => {
    if (isPaid) {
      Alert.alert(
        'Terkunci',
        'Pesanan sudah dibayar. Paket layanan tidak dapat diubah demi menjaga integritas data pembayaran kasir.'
      );
      return;
    }

    if (selectedServices.includes(serviceId)) {
      if (selectedServices.length === 1) {
        Alert.alert('Peringatan', 'Minimal harus memilih satu layanan cuci!');
        return;
      }
      setSelectedServices(selectedServices.filter((sid) => sid !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Kalkulasi subtotal dan diskon
  const isMember = Boolean(order?.customer?.membership?.isActive);
  const discountPercent = isMember
    ? Number(order?.customer?.membership?.discountPercent) || 10
    : 0;

  const subtotal = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, curr) => acc + curr.price, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  // Submit perubahan (PUT /order/:id)
  const handleSave = async () => {
    if (!vehiclePlate.trim()) {
      Alert.alert('Peringatan', 'Plat nomor kendaraan tidak boleh kosong!');
      return;
    }

    if (!isPaid && selectedServices.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu paket layanan cuci!');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await SecureStore.getItemAsync('userToken');

      const payload: any = {
        vehiclePlate: vehiclePlate.toUpperCase().trim(),
        vehicleModel: vehicleModel.trim(),
      };

      // Hanya kirim items jika status pesanan belum dibayar
      if (!isPaid) {
        payload.items = selectedServices.map((serviceId) => ({
          serviceId,
          quantity: 1,
        }));
      }

      await api.put(`/order/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Sukses', 'Perubahan pesanan berhasil disimpan!');
      navigation.goBack();
    } catch (error: any) {
      console.log('Update order error:', error);
      Alert.alert(
        'Gagal Menyimpan',
        error.response?.data?.message || 'Terjadi kesalahan saat memperbarui order'
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
        {/* Banner Status Pembayaran */}
        {isPaid ? (
          <View className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-4 flex-row items-center gap-3">
            <Ionicons name="information-circle" size={24} color="#d97706" />
            <Text className="text-xs text-amber-800 flex-1 leading-4">
              Pesanan ini <Text className="font-bold">SUDAH DIBAYAR</Text>. Anda hanya dapat
              mengubah Plat Nomor dan Model Kendaraan. Paket layanan dikunci.
            </Text>
          </View>
        ) : null}

        {/* Info Pelanggan & Kode Order (Read-only) */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <Text className="text-base font-bold text-gray-900 mb-2">Informasi Pesanan</Text>
          <View className="flex-row justify-between py-2 border-b border-gray-50">
            <Text className="text-xs text-gray-500">Kode Pesanan</Text>
            <Text className="text-xs font-bold font-mono text-gray-900">{order?.orderCode}</Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-gray-50">
            <Text className="text-xs text-gray-500">Pelanggan</Text>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-bold text-gray-900">{order?.customer?.name}</Text>
              {isMember && (
                <Text className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Member
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row justify-between pt-2">
            <Text className="text-xs text-gray-500">Status Pengerjaan</Text>
            <Text className="text-xs font-bold text-gray-900">{order?.status}</Text>
          </View>
        </View>

        {/* Data Kendaraan */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">Data Kendaraan</Text>

          {/* Input Plat Nomor */}
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

          {/* Quick Select Model Mobil */}
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

        {/* Paket Layanan */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-900">Paket Layanan</Text>
            {isPaid && (
              <Text className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                Terkunci (Lunas)
              </Text>
            )}
          </View>

          {services.map((s) => {
            const isChecked = selectedServices.includes(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                onPress={() => toggleService(s.id)}
                activeOpacity={isPaid ? 1 : 0.8}
                className={`flex-row justify-between items-center p-3.5 rounded-2xl border mb-2.5 ${
                  isChecked
                    ? isPaid
                      ? 'bg-zinc-800 border-zinc-800'
                      : 'bg-zinc-900 border-zinc-900'
                    : 'bg-white border-gray-200'
                } ${isPaid ? 'opacity-70' : 'opacity-100'}`}
              >
                <View className="flex-row items-center gap-3 flex-1 mr-3">
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? '#ffffff' : '#9ca3af'}
                  />
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-bold ${
                        isChecked ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {s.name}
                    </Text>
                    {s.description && (
                      <Text
                        className={`text-xs mt-0.5 ${
                          isChecked ? 'text-zinc-400' : 'text-gray-500'
                        }`}
                      >
                        {s.description}
                      </Text>
                    )}
                  </View>
                </View>

                <Text
                  className={`text-sm font-extrabold shrink-0 ${
                    isChecked ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Rp {s.price.toLocaleString('id-ID')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ringkasan Biaya */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
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

          <View className="flex-row justify-between pt-2 mt-1 border-t border-gray-100 mb-2">
            <Text className="text-sm font-bold text-gray-900">Total Biaya Baru</Text>
            <Text className="text-lg font-black text-gray-900">
              Rp {total.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Tombol Simpan Perubahan */}
        <TouchableOpacity
          onPress={handleSave}
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
              <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
              <Text className="text-white font-bold text-base ml-2">Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
