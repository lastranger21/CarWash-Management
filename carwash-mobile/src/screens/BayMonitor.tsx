import {View,Text,FlatList,ActivityIndicator,Alert,Image,TouchableOpacity} from 'react-native'
import { useEffect,useState } from 'react'
import { api } from '../config/api'
import * as SecureStore from 'expo-secure-store'
import { Ionicons } from '@expo/vector-icons'

export default function(){
    const [bay,setBay] = useState<any[]>([])
    const [isLoading,setIsLoading] = useState(true)
    const [isRefreshing,setIsRefreshing] =useState(false)
    const [queuedOrders, setQueuedOrders] = useState<any[]>([])
    useEffect(()=>{
        fetchBay()
    },[])
    const fetchBay = async() =>{
        try {
            
            const token = await SecureStore.getItemAsync('userToken')
            const response = await api.get('/bay',{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            const orderRes = await api.get('/order?status=QUEUED', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const unassigned = (orderRes.data?.data || []).filter(
        (o: any) => !o.bayId && (o.status === 'QUEUED' || o.status === 'RECEIVED')
      );
            setQueuedOrders(unassigned);
            setBay(response.data.data)
            console.log('fetch data bay berhasil')
        } catch (error:any) {
            console.log('fetch error',error)
            Alert.alert('access denied', error.response?.data?.message||'failed to fetch data')
        }
        finally{
            setIsLoading(false)
        }
    }
    const handleRefresh= async()=>{
        setIsRefreshing(true)
        await fetchBay()
        setIsRefreshing(false)
    }
    const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await api.patch(
        `/order/${orderId}/status`,
        { nextStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Sukses', `Status diperbarui menjadi ${nextStatus}`);
      fetchBay(); 
    } catch (error: any) {
      Alert.alert(
        'Gagal Update',
        error.response?.data?.message || 'Tidak dapat memperbarui status'
      );
    }
  };
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WASHING':
        return { label: 'Sedang Dicuci', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'DRYING':
        return { label: 'Pengeringan', bg: 'bg-amber-100', text: 'text-amber-700' };
      case 'READY':
        return { label: 'Siap Ambil', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      default:
        return { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };
    const handleAssignToBay = async (orderId: number) => {
    // cari bilik kosong
    const availableBay = bay.find(
      (b) => b.status && (!b.orders || b.orders.length === 0)
    );
    if (!availableBay) {
      Alert.alert('Bilik Penuh', 'Semua bilik cuci saat ini sedang terisi mobil!');
      return;
    }
    try {
      const token = await SecureStore.getItemAsync('userToken');
      // Kirim status WASHING dan sertakan bayId tujuan
      await api.patch(
        `/order/${orderId}/status`,
        {
          nextStatus: 'WASHING',
          bayId: availableBay.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Sukses', `Mobil berhasil masuk ke ${availableBay.name}`);
      fetchBay(); // Refresh bay
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal memasukkan mobil ke bilik');
    }
  };
    return(
        <View className='flex-1 bg-[#f9fafb] px-4 pt-12'>
            <Text>Live Monitor Bay</Text>
            {queuedOrders.length > 0 && (
  <View className="bg-amber-50 p-4 rounded-2xl border border-amber-200 mb-4 shadow-xs">
    <View className="flex-row justify-between items-center mb-2">
      <View className="flex-row items-center gap-1.5">
        <Ionicons name="time-outline" size={18} color="#b45309" />
        <Text className="text-sm font-bold text-amber-900">
          Antrean Menunggu ({queuedOrders.length} Mobil)
        </Text>
      </View>
    </View>
    {/* Daftar mobil antrean */}
    {queuedOrders.map((order) => (
      <View
        key={order.id}
        className="flex-row justify-between items-center bg-white p-3 rounded-xl border border-amber-100 mb-2"
      >
        <View>
          <View className="bg-zinc-900 px-2 py-0.5 rounded self-start mb-1">
            <Text className="text-xs font-bold text-white font-mono">
              {order.vehiclePlate}
            </Text>
          </View>
          <Text className="text-xs text-gray-700 font-medium">
            {order.customer?.name || 'Pelanggan'}
          </Text>
        </View>
        {/* Tombol aksi cepat: Masuk Bilik */}
        <TouchableOpacity
          onPress={() => handleAssignToBay(order.id)}
          className="bg-amber-600 px-3 py-2 rounded-lg"
        >
          <Text className="text-xs font-bold text-white">+ Masuk Bay</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
)}
            <FlatList
            data={bay}
            keyExtractor={(bays)=> bays.id.toString()}
            contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10}}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            renderItem={({item}) =>{
                const isMaintenance = !item.status;
                const currentOrder = item.orders && item.orders.length > 0 ? item.orders[0] : null;
                const nextStatus = currentOrder ? getNextStatus(currentOrder.status) : null;
                const statusInfo = currentOrder ? getStatusBadge(currentOrder.status) : null;
                return(

                    <View className='bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100'>
                         <View className='flex-row justify-between items-center mb-3'>
                            
                                <Text className='text-lg font-bold text-gray-500' numberOfLines={1}>{item.name}</Text>
                                
                            {isMaintenance ?(
                                <View className={`px-2.5 py-1 rounded-full border ${
                        isMaintenance
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-amber-50 border-amber-200"
                    }`}>
                                    <Text>Maintenance</Text>
                                </View>
                            ):currentOrder && statusInfo ? (
                    <View className={`px-2.5 py-1 rounded-full ${statusInfo.bg}`}>
                      <Text className={`text-xs font-bold ${statusInfo.text}`}>
                        {statusInfo.label}
                      </Text>
                    </View>): (<View className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                    <Text className="text-xs font-medium text-green-500">Kosong</Text>
                    </View>)}
                         </View>
                         {/* content bay */}
                        {isMaintenance ? (
                  <View className="py-4 items-center justify-center">
                    <Ionicons name="construct-outline" size={28} color="#f43f5e" />
                    <Text className="text-xs text-rose-500 font-medium mt-1">
                      Bilik sedang dalam perbaikan
                    </Text>
                  </View>
                ) : currentOrder ? (
                  <View>
                    {/* Badge Plat Nomor */}
                    <View className="bg-zinc-900 px-3 py-1.5 rounded-lg self-start mb-2 shadow-xs">
                      <Text className="text-sm font-extrabold text-white font-mono tracking-widest">
                        {currentOrder.vehiclePlate}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-gray-800">
                      Pelanggan: {currentOrder.customer?.name || '-'}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      Layanan: {currentOrder.orderItems?.[0]?.service?.name || 'Cuci Standar'}
                    </Text>
                    {/* Tombol Aksi Lanjut Status */}
                    {nextStatus && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleUpdateStatus(currentOrder.id, nextStatus)}
                        className="mt-4 w-full bg-zinc-900 py-3 rounded-xl flex-row justify-center items-center shadow-xs"
                      >
                        <Text className="text-white font-semibold text-sm mr-1.5">
                          Lanjut: {nextStatus}
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <View className="py-3 items-center justify-center">
                    <Text className="text-xs text-gray-400">
                      Bilik siap menerima kendaraan berikutnya
                    </Text>
                  </View>
                )}
                    </View>

                )
            }}
            />
        </View>
    )
} 