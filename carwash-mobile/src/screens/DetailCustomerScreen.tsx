import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export default function DetailCustomerScreen({ route, navigation }: any) {
  const { id } = route.params;

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const fetchCustomerDetail = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const response = await api.get(`/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data;
      setCustomer(data);
      if (data) {
        setEditName(data.name || '');
        setEditPhone(data.phone || '');
      }
    } catch (error: any) {
      console.log('Error fetch customer detail:', error);
      Alert.alert(
        'Gagal Memuat',
        error.response?.data?.message || 'Tidak dapat memuat detail pelanggan'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Fungsi Update Data Pelanggan (PUT /customers/:id)
  const handleUpdateCustomer = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Peringatan', 'Nama dan nomor telepon tidak boleh kosong');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await SecureStore.getItemAsync('userToken');
      const response = await api.put(
        `/customers/${id}`,
        {
          name: editName.trim(),
          phone: editPhone.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Sukses', 'Data pelanggan berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchCustomerDetail(); // Refresh data
    } catch (error: any) {
      console.log('Update error:', error);
      Alert.alert(
        'Gagal Memperbarui',
        error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Fungsi Toggle Status Membership (PATCH /customers/:id/membership)
  const handleToggleMembership = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await api.patch(
        `/customers/${id}/membership`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Sukses', response.data?.message || 'Status membership diubah');
      fetchCustomerDetail();
    } catch (error: any) {
      console.log('Toggle membership error:', error);
      Alert.alert(
        'Gagal',
        error.response?.data?.message || 'Gagal mengubah status membership'
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB] justify-center items-center">
        <ActivityIndicator size="large" color="#18181b" />
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB] justify-center items-center p-4">
        <Text className="text-gray-500 font-medium">Pelanggan tidak ditemukan</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 bg-zinc-900 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isMember = Boolean(customer.membership);
  const isMemberActive = customer.membership?.isActive;

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Header Profil Card */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-14 h-14 rounded-2xl bg-zinc-900 items-center justify-center shadow-xs">
                <Text className="text-xl font-bold text-white">
                  {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                </Text>
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">{customer.name}</Text>
                <Text className="text-sm text-gray-500">{customer.phone}</Text>
              </View>
            </View>

            {/* Tombol Edit */}
            <TouchableOpacity
              onPress={() => setIsEditModalOpen(true)}
              className="p-2.5 bg-gray-100 rounded-xl"
            >
              <Ionicons name="create-outline" size={20} color="#18181b" />
            </TouchableOpacity>
          </View>

          <View className="pt-3 border-t border-gray-50 flex-row justify-between items-center">
            <Text className="text-xs text-gray-400">
              Terdaftar sejak:{' '}
              {customer.createdAt
                ? new Date(customer.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '-'}
            </Text>
          </View>
        </View>

        {/*  Kartu Status Membership */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="card-outline" size={20} color="#18181b" />
              <Text className="text-base font-bold text-gray-900">Membership</Text>
            </View>

            {isMember ? (
              <View
                className={`px-3 py-1 rounded-full ${
                  isMemberActive ? 'bg-emerald-50' : 'bg-amber-50'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isMemberActive ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isMemberActive ? 'Member Aktif' : 'Nonaktif'}
                </Text>
              </View>
            ) : (
              <View className="px-3 py-1 rounded-full bg-gray-100">
                <Text className="text-xs font-semibold text-gray-500">Reguler</Text>
              </View>
            )}
          </View>

          {isMember ? (
            <View className="bg-zinc-50 p-3.5 rounded-2xl mb-4">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-xs text-gray-500">Kode Member</Text>
                <Text className="text-xs font-bold text-gray-800 font-mono">
                  {customer.membership.memberCode}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-500">Diskon Cucian</Text>
                <Text className="text-xs font-bold text-emerald-600">
                  {customer.membership.discountPercent}%
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-xs text-gray-400 mb-4">
              Pelanggan ini belum memiliki kartu member. Aktifkan membership untuk memberikan diskon otomatis 10%.
            </Text>
          )}

          {/* Tombol Toggle Membership */}
          <TouchableOpacity
            onPress={handleToggleMembership}
            activeOpacity={0.8}
            className={`py-3 rounded-xl items-center justify-center border ${
              isMember && isMemberActive
                ? 'bg-rose-50 border-rose-200'
                : 'bg-zinc-900 border-zinc-900'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isMember && isMemberActive ? 'text-rose-700' : 'text-white'
              }`}
            >
              {isMember
                ? isMemberActive
                  ? 'Nonaktifkan Membership'
                  : 'Aktifkan Kembali Membership'
                : '+ Daftarkan Sebagai Member'}
            </Text>
          </TouchableOpacity>
        </View>

        {/*  List Kendaraan Terdaftar */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="car-sport-outline" size={20} color="#18181b" />
            <Text className="text-base font-bold text-gray-900">Kendaraan Terdaftar</Text>
          </View>

          {customer.vehicles && customer.vehicles.length > 0 ? (
            customer.vehicles.map((v: any) => (
              <View
                key={v.id}
                className="flex-row justify-between items-center p-3 bg-zinc-50 rounded-xl mb-2"
              >
                <View className="bg-zinc-950 px-2.5 py-1 rounded-md">
                  <Text className="text-xs font-bold text-white font-mono tracking-wider">
                    {v.plateNumber}
                  </Text>
                </View>
                <Text className="text-xs text-gray-600 font-medium">
                  {v.modelName || 'Mobil Standar'}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-xs text-gray-400 py-2">Belum ada data kendaraan</Text>
          )}
        </View>

        {/*  Riwayat Transaksi latest*/}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="receipt-outline" size={20} color="#18181b" />
            <Text className="text-base font-bold text-gray-900">Riwayat Terakhir</Text>
          </View>

          {customer.orders && customer.orders.length > 0 ? (
            customer.orders.map((o: any) => (
              <View
                key={o.id}
                className="py-2.5 border-b border-gray-50 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-xs font-bold text-gray-800 font-mono">
                    {o.orderCode}
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    {new Date(o.createdAt).toLocaleDateString('id-ID')} • {o.status}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-gray-900">
                  Rp {o.total ? o.total.toLocaleString('id-ID') : '0'}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-xs text-gray-400 py-2">Belum ada riwayat pesanan</Text>
          )}
        </View>
      </ScrollView>

      {/* MODAL EDIT PELANGGAN */}
      <Modal
        visible={isEditModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Edit Pelanggan</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Field Nama */}
            <View className="mb-3.5">
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Nama Lengkap
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Nama Pelanggan"
                className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-zinc-50"
              />
            </View>

            {/* Field Nomor Telepon */}
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-700 mb-1">
                Nomor Telepon
              </Text>
              <TextInput
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="08123456789"
                keyboardType="phone-pad"
                className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 bg-zinc-50"
              />
            </View>

            {/* Tombol Simpan & Batal */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 items-center"
              >
                <Text className="text-xs font-semibold text-gray-600">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpdateCustomer}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-zinc-900 items-center justify-center"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-xs font-bold text-white">Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}