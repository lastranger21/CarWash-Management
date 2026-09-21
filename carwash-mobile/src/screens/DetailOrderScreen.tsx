import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export default function DetailOrderScreen({ route, navigation }: any) {
  const { id } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Modal Pembayaran
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'TRANSFER' | 'QRIS'>('CASH');
  const [isPaying, setIsPaying] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchOrder();
    }, [id])
  );

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const response = await api.get(`/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data?.data || null);
    } catch (error: any) {
      console.log('Fetch order error:', error);
      Alert.alert(
        'Gagal Memuat',
        error.response?.data?.message || 'Tidak dapat mengambil detail pesanan'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Alur Status Pengerjaan
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'RECEIVED':
      case 'QUEUED':
        return 'WASHING';
      case 'WASHING':
        return 'DRYING';
      case 'DRYING':
        return 'READY';
      case 'READY':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  //  Fungsi Update Status Pengerjaan
  const handleUpdateStatus = async (nextStatus: string) => {
    // Validasi order harus sudah PAID
    if (nextStatus === 'COMPLETED' && order?.paymentStatus !== 'PAID') {
      Alert.alert(
        'Belum Bisa Selesai',
        'Pesanan belum lunas! Mohon selesaikan pembayaran terlebih dahulu sebelum menyelesaikan order.'
      );
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const token = await SecureStore.getItemAsync('userToken');
      await api.patch(
        `/order/${id}/status`,
        { nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sukses', `Status berhasil diperbarui menjadi ${nextStatus}`);
      fetchOrder();
    } catch (error: any) {
      console.log('Update status error:', error);
      Alert.alert(
        'Gagal Update',
        error.response?.data?.message || 'Gagal mengubah status pengerjaan'
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 2. Fungsi Proses Pembayaran
  const handleProcessPayment = async () => {
    try {
      setIsPaying(true);
      const token = await SecureStore.getItemAsync('userToken');
      await api.post(
        '/payments',
        {
          orderId: order.id,
          amount: order.total,
          method: selectedMethod,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Sukses', 'Pembayaran berhasil dicatat!');
      setIsPaymentModalOpen(false);
      fetchOrder();
    } catch (error: any) {
      console.log('Payment error:', error);
      Alert.alert(
        'Gagal Bayar',
        error.response?.data?.message || 'Gagal memproses pembayaran'
      );
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WASHING':
        return { label: 'Sedang Dicuci', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'DRYING':
        return { label: 'Pengeringan', bg: 'bg-amber-100', text: 'text-amber-700' };
      case 'READY':
        return { label: 'Siap Ambil', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      case 'COMPLETED':
        return { label: 'Selesai', bg: 'bg-zinc-100', text: 'text-zinc-700' };
      default:
        return { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB] justify-center items-center">
        <ActivityIndicator size="large" color="#18181b" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9FAFB] justify-center items-center p-4">
        <Text className="text-gray-500 font-medium">Pesanan tidak ditemukan</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 bg-zinc-900 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const nextStatus = getNextStatus(order.status);
  const statusInfo = getStatusBadge(order.status);
  const isPaid = order.paymentStatus === 'PAID';
  const discountAmount = Math.round(
    (order.subtotal * (Number(order.discount) || 0)) / 100
  );
  const canDeleteOrder =
    (order.status === 'QUEUED' || order.status === 'RECEIVED') &&
    order.paymentStatus === 'UNPAID';
  const handleDeleteOrder=async(id:number)=>{
    Alert.alert(
      'Hapus Pesanan',
      `Apakah Anda yakin ingin menghapus pesanan ${order?.orderCode}? Tindakan ini tidak dapat dibatalkan.`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = SecureStore.getItemAsync('userToken')
              await api.delete(`/order/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
              Alert.alert('Sukses', 'Pesanan berhasil dihapus!', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(), 
                },
              ]);
              
            } catch (error) {
              console.log(error,'error delete order')
            }finally{
              setIsLoading(false)
            }

  }}])
  }
  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* KARTU HEADER ORDER & KENDARAAN */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs font-bold text-gray-500 font-mono tracking-wide">
              {order.orderCode}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-400">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </Text>
              {order.status !== 'COMPLETED' && (
                <>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditOrder', { id: order.id })}
                  activeOpacity={0.7}
                  className="bg-zinc-100 px-2.5 py-1 rounded-lg flex-row items-center gap-1 border border-zinc-200"
                >
                  <Ionicons name="pencil" size={12} color="#18181b" />
                  <Text className="text-[11px] font-bold text-zinc-900">Edit</Text>
                </TouchableOpacity>
                {canDeleteOrder &&(

                <TouchableOpacity
                  onPress={() => handleDeleteOrder(order.id)}
                  activeOpacity={0.7}
                  className="bg-zinc-100 px-2.5 py-1 rounded-lg flex-row items-center gap-1 border border-zinc-200"
                >
                  <Ionicons name="trash-outline" size={12} color="#ee0d0d" />
                  <Text className="text-[11px] font-bold text-zinc-900">Hapus</Text>
                </TouchableOpacity>
                )}
                </>
              )}

            </View>
          </View>

          {/* Plat Nomor & Status */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="bg-zinc-900 px-3.5 py-1.5 rounded-xl self-start shadow-xs">
              <Text className="text-base font-black text-white font-mono tracking-widest">
                {order.vehiclePlate}
              </Text>
            </View>

            <View className={`px-3 py-1 rounded-full ${statusInfo.bg}`}>
              <Text className={`text-xs font-bold ${statusInfo.text}`}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Lokasi Bilik (Bay) */}
          <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
            <Text className="text-xs text-gray-500">Lokasi Bilik</Text>
            <Text className="text-xs font-bold text-gray-900">
              {order.bay?.name || 'Antrean (Belum Masuk Bilik)'}
            </Text>
          </View>

          {/* Tombol Lanjut Status */}
          {nextStatus && (
            <TouchableOpacity
              onPress={() => handleUpdateStatus(nextStatus)}
              disabled={isUpdatingStatus}
              activeOpacity={0.85}
              className="mt-4 w-full bg-zinc-900 py-3.5 rounded-xl flex-row justify-center items-center shadow-xs"
            >
              {isUpdatingStatus ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-semibold text-sm mr-2">
                    Lanjut ke: {nextStatus}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/*  INFORMASI PELANGGAN */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="person-outline" size={18} color="#18181b" />
            <Text className="text-base font-bold text-gray-900">Informasi Pelanggan</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-gray-500">Nama Pelanggan</Text>
            <Text className="text-xs font-bold text-gray-900">
              {order.customer?.name || '-'}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-gray-500">Nomor Telepon</Text>
            <Text className="text-xs font-medium text-gray-800">
              {order.customer?.phone || '-'}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-500">Membership</Text>
            <Text
              className={`text-xs font-bold ${
                order.customer?.membership?.isActive ? 'text-emerald-700' : 'text-gray-500'
              }`}
            >
              {order.customer?.membership?.isActive ? 'Member Aktif (10% Off)' : 'Reguler'}
            </Text>
          </View>
        </View>

        {/* 3. RINCIAN LAYANAN (ORDER ITEMS) */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="water-outline" size={18} color="#18181b" />
            <Text className="text-base font-bold text-gray-900">Layanan Cuci</Text>
          </View>

          {order.orderItems && order.orderItems.length > 0 ? (
            order.orderItems.map((item: any) => (
              <View
                key={item.id}
                className="py-2.5 border-b border-gray-50 flex-row justify-between items-center"
              >
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-bold text-gray-900">
                    {item.service?.name || 'Paket Layanan'}
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    {item.quantity}x @ Rp{' '}
                    {(item.priceSnapshot || item.service?.price || 0).toLocaleString('id-ID')}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-gray-900">
                  Rp {(item.subtotal || 0).toLocaleString('id-ID')}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-xs text-gray-400 py-2">Tidak ada rincian layanan</Text>
          )}
        </View>

        {/*  RINCIAN PEMBAYARAN */}
        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="wallet-outline" size={18} color="#18181b" />
              <Text className="text-base font-bold text-gray-900">Rincian Biaya</Text>
            </View>

            <View
              className={`px-2.5 py-0.5 rounded ${
                isPaid ? 'bg-emerald-50' : 'bg-rose-50'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isPaid ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isPaid ? 'LUNAS' : 'BELUM LUNAS'}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-1.5">
            <Text className="text-xs text-gray-500">Subtotal</Text>
            <Text className="text-xs text-gray-900 font-medium">
              Rp {(order.subtotal || 0).toLocaleString('id-ID')}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs text-emerald-600">Diskon Member ({order.discount}%)</Text>
              <Text className="text-xs text-emerald-600 font-bold">
                - Rp {discountAmount.toLocaleString('id-ID')}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between pt-2.5 mt-2 border-t border-gray-100">
            <Text className="text-sm font-bold text-gray-900">Total Tagihan</Text>
            <Text className="text-base font-extrabold text-gray-900">
              Rp {(order.total || 0).toLocaleString('id-ID')}
            </Text>
          </View>

          {/* Tombol Terima Pembayaran jika belum lunas */}
          {!isPaid && (
            <TouchableOpacity
              onPress={() => setIsPaymentModalOpen(true)}
              activeOpacity={0.85}
              className="mt-4 w-full bg-emerald-600 py-3 rounded-xl items-center justify-center shadow-xs"
            >
              <Text className="text-white font-bold text-xs">
                💵 Terima Pembayaran (Kasir)
              </Text>
            </TouchableOpacity>
          )}

          {isPaid && order.payment && (
            <View className="mt-3 p-3 bg-zinc-50 rounded-xl">
              <Text className="text-[11px] text-gray-500">
                Dibayar via <Text className="font-bold text-gray-800">{order.payment.method}</Text>{' '}
                pada{' '}
                {new Date(order.payment.paidAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL PEMBAYARAN */}
      <Modal
        visible={isPaymentModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPaymentModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Konfirmasi Pembayaran</Text>
              <TouchableOpacity onPress={() => setIsPaymentModalOpen(false)}>
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="bg-zinc-50 p-4 rounded-2xl mb-4 items-center">
              <Text className="text-xs text-gray-500">Total yang harus dibayar</Text>
              <Text className="text-2xl font-black text-gray-900 mt-1">
                Rp {(order.total || 0).toLocaleString('id-ID')}
              </Text>
            </View>

            <Text className="text-xs font-semibold text-gray-700 mb-2">
              Pilih Metode Pembayaran
            </Text>
            <View className="flex-row gap-2 mb-5">
              {(['CASH', 'TRANSFER', 'QRIS'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  onPress={() => setSelectedMethod(method)}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    selectedMethod === method
                      ? 'bg-zinc-900 border-zinc-900'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selectedMethod === method ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 items-center"
              >
                <Text className="text-xs font-semibold text-gray-600">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleProcessPayment}
                disabled={isPaying}
                className="flex-1 py-3 rounded-xl bg-emerald-600 items-center justify-center"
              >
                {isPaying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-xs font-bold text-white">Konfirmasi Lunas</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}