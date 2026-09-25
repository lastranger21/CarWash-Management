import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export default function NewOrderScreen({ navigation }: any) {
  // Data Form
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Avanza');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Data Master
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Dropdown & Search
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [isManualPlateInput, setIsManualPlateInput] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const headers = { Authorization: `Bearer ${token}` };

      // Ambil daftar pelanggan (limit 100) & daftar layanan
      const [custRes, servRes] = await Promise.all([
        api.get('/customers?limit=100', { headers }),
        api.get('/service', { headers }),
      ]);

      const custList = custRes.data?.data || [];
      setCustomers(custList);

      if (custList.length > 0) {
        const firstCust = custList[0];
        setSelectedCustomerId(firstCust.id);

        // Jika customer pertama punya kendaraan tersimpan, gunakan sebagai default
        if (firstCust.vehicles && firstCust.vehicles.length > 0) {
          setVehiclePlate(firstCust.vehicles[0].plateNumber);
          setVehicleModel(firstCust.vehicles[0].modelName || 'Avanza');
          setIsManualPlateInput(false);
        } else {
          setIsManualPlateInput(true);
        }
      }

      setServices(servRes.data?.data || []);
    } catch (error: any) {
      console.log('Fetch master error:', error);
      Alert.alert('Gagal', 'Tidak dapat memuat data pelanggan atau layanan');
    } finally {
      setIsLoading(false);
    }
  };

  // Pilih Customer dari Search Modal
  const handleSelectCustomer = (c: any) => {
    setSelectedCustomerId(c.id);
    setIsCustomerModalOpen(false);
    setCustomerSearchQuery('');

    if (c.vehicles && c.vehicles.length > 0) {
      setVehiclePlate(c.vehicles[0].plateNumber);
      setVehicleModel(c.vehicles[0].modelName || 'Avanza');
      setIsManualPlateInput(false);
    } else {
      setVehiclePlate('');
      setIsManualPlateInput(true);
    }
  };

  // Pilih Kendaraan dari Dropdown Plat
  const handleSelectVehicle = (v: any) => {
    setVehiclePlate(v.plateNumber);
    setVehicleModel(v.modelName || 'Avanza');
    setIsManualPlateInput(false);
    setIsPlateModalOpen(false);
  };

  // Tambah & Kurang Quantity Layanan
  const handleIncrement = (serviceId: number) => {
    setQuantities((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1,
    }));
  };

  const handleDecrement = (serviceId: number) => {
    setQuantities((prev) => {
      const currentQty = prev[serviceId] || 0;
      if (currentQty <= 1) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return { ...prev, [serviceId]: currentQty - 1 };
    });
  };

  // Pelanggan Terpilih & Kalkulasi Biaya
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const isMember = Boolean(selectedCustomer?.membership?.isActive);
  const discountPercent = isMember
    ? Number(selectedCustomer?.membership?.discountPercent) || 10
    : 0;

  const subtotal = services.reduce((acc, curr) => {
    const qty = quantities[curr.id] || 0;
    return acc + curr.price * qty;
  }, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  // Filter Pelanggan untuk Search Modal
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = c.name?.toLowerCase().includes(q);
    const phoneMatch = c.phone?.includes(q);
    return nameMatch || phoneMatch;
  });

  // Submit Order Baru ke Server
  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Peringatan', 'Silakan pilih pelanggan terlebih dahulu!');
      return;
    }
    if (!vehiclePlate.trim()) {
      Alert.alert('Peringatan', 'Plat nomor kendaraan wajib diisi!');
      return;
    }
    

    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([serviceId, qty]) => ({
        serviceId: Number(serviceId),
        quantity: qty,
      }));

    if (orderItems.length === 0) {
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
        items: orderItems,
      };

      await api.post('/order', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Sukses', 'Pesanan baru berhasil dibuat dan masuk antrean!');
      navigation.goBack();
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

  const customerVehicles = selectedCustomer?.vehicles || [];

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* PELANGGAN & KONTAK */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">Informasi Pelanggan</Text>

          {/*DROPDOWN PELANGGAN DENGAN SEARCHBAR */}
          <Text className="text-xs font-semibold text-gray-600 mb-1.5">Pelanggan</Text>
          <TouchableOpacity
            onPress={() => setIsCustomerModalOpen(true)}
            activeOpacity={0.8}
            className="flex-row items-center justify-between border border-gray-200 rounded-2xl px-4 py-3 bg-zinc-50 mb-3.5"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-8 h-8 rounded-full bg-zinc-200 items-center justify-center mr-2.5">
                <Ionicons name="person" size={16} color="#18181b" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                  {selectedCustomer?.name || 'Pilih Pelanggan...'}
                </Text>
                {isMember && (
                  <Text className="text-[10px] font-bold text-emerald-600">
                    ★ Member Aktif (Diskon {discountPercent}%)
                  </Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-down" size={18} color="#6b7280" />
          </TouchableOpacity>

          {/*NO TELEPON PELANGGAN */}
          <Text className="text-xs font-semibold text-gray-600 mb-1.5">Nomor Telepon / WA</Text>
          <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 bg-zinc-50">
            <Ionicons name="call-outline" size={16} color="#71717a" style={{ marginRight: 8 }} />
            <Text className="text-sm font-mono text-gray-900 font-semibold flex-1">
              {selectedCustomer?.phone || '-'}
            </Text>
          </View>
        </View>

        {/* DATA KENDARAAN */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-gray-900">Kendaraan</Text>
            {customerVehicles.length > 0 && isManualPlateInput && (
              <TouchableOpacity
                onPress={() => setIsManualPlateInput(false)}
                className="bg-zinc-100 px-2.5 py-1 rounded-lg"
              >
                <Text className="text-[11px] font-bold text-zinc-800">
                  Pilih dari Kendaraan Terdaftar
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* DROPDOWN PLAT KENDARAAN (jika pernah) */}
          {customerVehicles.length > 0 && !isManualPlateInput ? (
            <View className="mb-2">
              <Text className="text-xs font-semibold text-gray-600 mb-1.5">
                Pilih Plat Nomor Kendaraan
              </Text>
              <TouchableOpacity
                onPress={() => setIsPlateModalOpen(true)}
                activeOpacity={0.8}
                className="flex-row items-center justify-between border border-gray-200 rounded-2xl px-4 py-3 bg-zinc-50"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="car-sport" size={20} color="#18181b" style={{ marginRight: 10 }} />
                  <View>
                    <Text className="text-sm font-black text-gray-900 font-mono tracking-wider">
                      {vehiclePlate || 'Pilih Kendaraan'}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">{vehicleModel}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ) : (
            /* INPUT MANUAL PLAT NOMOR */
            <View>
              <View className="mb-3">
                <Text className="text-xs font-semibold text-gray-600 mb-1">
                  Plat Nomor Kendaraan
                </Text>
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
          )}
        </View>

        {/* PAKET LAYANAN DENGAN QUANTITY (+ / -) */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">Pilih Paket Layanan</Text>
          {services.map((s) => {
            const qty = quantities[s.id] || 0;
            const isSelected = qty > 0;
            return (
              <View
                key={s.id}
                className={`p-3.5 rounded-2xl border mb-2.5 bg-white ${
                  isSelected ? 'border-zinc-900 bg-zinc-50/50' : 'border-gray-200'
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-bold text-gray-900">{s.name}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      Rp {s.price.toLocaleString('id-ID')}
                    </Text>
                  </View>

                  {isSelected ? (
                    <View className="flex-row items-center bg-zinc-900 rounded-xl px-1.5 py-1">
                      <TouchableOpacity
                        onPress={() => handleDecrement(s.id)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center"
                      >
                        <Ionicons name="remove" size={16} color="#ffffff" />
                      </TouchableOpacity>

                      <Text className="text-white font-extrabold text-sm px-3">{qty}</Text>

                      <TouchableOpacity
                        onPress={() => handleIncrement(s.id)}
                        className="w-7 h-7 rounded-lg bg-zinc-800 items-center justify-center"
                      >
                        <Ionicons name="add" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleIncrement(s.id)}
                      className="border border-zinc-300 px-3 py-1.5 rounded-xl bg-zinc-50"
                    >
                      <Text className="text-xs font-bold text-zinc-800">+ Tambah</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {qty >= 1 && (
                  <View className="pt-2 mt-2 border-t border-gray-100 flex-row justify-between">
                    <Text className="text-[11px] text-gray-400">Subtotal Layanan:</Text>
                    <Text className="text-xs font-bold text-zinc-900">
                      Rp {(s.price * qty).toLocaleString('id-ID')}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* RINGKASAN BIAYA & SUBMIT */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-xs text-gray-500">Subtotal</Text>
            <Text className="text-xs font-semibold text-gray-900">
              Rp {subtotal.toLocaleString('id-ID')}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-emerald-600">Diskon Member ({discountPercent}%)</Text>
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

      {/* PENCARIAN CUSTOMER DENGAN SEARCHBAR */}
      <Modal
        visible={isCustomerModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCustomerModalOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
          {/* Header Searchbar */}
          <View className="p-4 bg-white border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Pilih Pelanggan</Text>
              <TouchableOpacity onPress={() => setIsCustomerModalOpen(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Input Pencarian */}
            <View className="flex-row items-center bg-zinc-100 rounded-2xl px-3.5 py-2.5">
              <Ionicons name="search" size={18} color="#71717a" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Cari nama atau nomor HP..."
                placeholderTextColor="#9ca3af"
                value={customerSearchQuery}
                onChangeText={setCustomerSearchQuery}
                className="flex-1 text-sm text-gray-900"
                autoFocus
              />
              {customerSearchQuery ? (
                <TouchableOpacity onPress={() => setCustomerSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#9ca3af" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* List Pelanggan */}
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => {
                const isSelected = selectedCustomerId === c.id;
                const hasMember = Boolean(c.membership?.isActive);
                const vehicleCount = c.vehicles?.length || 0;

                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => handleSelectCustomer(c)}
                    className={`p-4 rounded-2xl border mb-2.5 bg-white ${
                      isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200'
                    }`}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-2">
                        <Text className="text-base font-bold text-gray-900">{c.name}</Text>
                        <Text className="text-xs text-gray-500 mt-0.5 font-mono">{c.phone}</Text>
                        {vehicleCount > 0 && (
                          <Text className="text-[11px] text-gray-400 mt-1">
                            🚗 {vehicleCount} kendaraan tersimpan
                          </Text>
                        )}
                      </View>

                      {hasMember && (
                        <View className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Text className="text-[10px] font-bold text-emerald-700">
                            ★ Member (10%)
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="items-center py-12">
                <Ionicons name="person-outline" size={48} color="#d1d5db" />
                <Text className="text-sm font-semibold text-gray-500 mt-2">
                  Pelanggan tidak ditemukan
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsCustomerModalOpen(false);
                    navigation.navigate('NewCustomer');
                  }}
                  className="mt-4 bg-zinc-900 px-4 py-2.5 rounded-xl flex-row items-center gap-1.5"
                >
                  <Ionicons name="person-add" size={16} color="#ffffff" />
                  <Text className="text-white text-xs font-bold">Daftarkan Pelanggan Baru</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/*DROPDOWN PLAT KENDARAAN */}
      <Modal
        visible={isPlateModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsPlateModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-base font-bold text-gray-900">Pilih Kendaraan</Text>
              <TouchableOpacity onPress={() => setIsPlateModalOpen(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* List Kendaraan Milik Customer */}
            <ScrollView style={{ maxHeight: 240 }} className="mb-3">
              {customerVehicles.map((v: any) => {
                const isSelected = vehiclePlate === v.plateNumber;
                return (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => handleSelectVehicle(v)}
                    className={`p-3.5 rounded-2xl border mb-2 flex-row justify-between items-center ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-900'
                        : 'bg-zinc-50 border-gray-200'
                    }`}
                  >
                    <View>
                      <Text
                        className={`text-sm font-black font-mono tracking-wider ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {v.plateNumber}
                      </Text>
                      <Text
                        className={`text-xs mt-0.5 ${
                          isSelected ? 'text-zinc-300' : 'text-gray-500'
                        }`}
                      >
                        {v.modelName || 'Mobil'}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color="#ffffff" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Opsi Ketik Plat Kendaraan Lain */}
            <TouchableOpacity
              onPress={() => {
                setIsPlateModalOpen(false);
                setIsManualPlateInput(true);
                setVehiclePlate('');
              }}
              className="py-3 rounded-xl border border-dashed border-gray-300 items-center justify-center bg-gray-50"
            >
              <Text className="text-xs font-bold text-zinc-800">+ Ketik Plat Kendaraan Lain</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}