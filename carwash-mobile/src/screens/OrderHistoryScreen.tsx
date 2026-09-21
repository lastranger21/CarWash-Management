import {View,Text,FlatList,ActivityIndicator,Alert,Image,SafeAreaView, TextInput, TouchableOpacity} from 'react-native'
import { useEffect,useState } from 'react'
import { api } from '../config/api'
import * as SecureStore from 'expo-secure-store'
import { Ionicons } from '@expo/vector-icons'

export default function OrderHistoryScreen({ navigation }: any) {
    const [orders, setOrders] = useState<any[]>([])
    const[isLoading,setIsLoading] =useState(true)
    const [isRefreshing,setIsRefreshing] =useState(false)
    useEffect(()=> {
        fetchOrder()
    },[])
    const fetchOrder = async()=> {
        try {
            const token = await SecureStore.getItemAsync('userToken')
            const response = await api.get('/order', {
                headers:{
                    Authorization: `Bearer ${token}`
                },
                
            })
            setOrders(response.data?.data || [])
            console.log('jalan kok')
            
        } catch (error:any) {
            console.log('fetch error:',error)
            Alert.alert('access denied',error.response?.data?.message || 'failed to get data')
        }
        finally{
            setIsLoading(false)

        }
    }
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'READY' | 'COMPLETED' | 'UNPAID'>('ALL')
    const today = new Date()
    const  todayOrder = orders.filter((order) => {
        const matchesSearch =
      order.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) 
    const createdAt = order.createdAt ? new Date(order.createdAt) : null
    const orderDate = order.createdAt ? new Date(order.createdAt).toDateString() : '';
    const isToday = createdAt &&
      !Number.isNaN(createdAt.getTime()) &&
      createdAt.getFullYear() === today.getFullYear() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getDate() === today.getDate()

    if (!matchesSearch || !isToday) return false

    if (statusFilter === 'ACTIVE') {
      return ['RECEIVED', 'QUEUED', 'WASHING', 'DRYING'].includes(order.status)
    }
    if (statusFilter === 'READY') {
      return order.status === 'READY'
    }
    if (statusFilter === 'COMPLETED') {
      return order.status === 'COMPLETED'
    }
    if (statusFilter === 'UNPAID') {
      return order.paymentStatus === 'UNPAID'
    }
    if (!order.createdAt) return true
    return true
    })
    const handleRefresh =async()=>{
        setIsRefreshing(true)
        await fetchOrder()
        setIsRefreshing(false)
    }
    const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WASHING':
        return { label: 'Dicuci', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'DRYING':
        return { label: 'Pengeringan', bg: 'bg-amber-100', text: 'text-amber-700' };
      case 'READY':
        return { label: 'Siap Ambil', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      case 'COMPLETED':
        return { label: 'Selesai', bg: 'bg-zinc-100', text: 'text-zinc-700' };
      default:
        return { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  }
  
    type FilterType = 'ALL' | 'ACTIVE' | 'READY' | 'COMPLETED' | 'UNPAID';
    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-[#1b1b24]">Riwayat Hari Ini</Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          Daftar antrean & transaksi cuci hari ini
        </Text>
        {/* Input Search */}
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2 mt-4 shadow-xs">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Cari plat, nama pelanggan, kode..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 ml-2 text-sm text-gray-900 py-1"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        {/* Horizontal Status Filter Chips */}
        <View className="flex-row gap-2 mt-3 pb-2 overflow-x-scroll">
          {(['ALL', 'ACTIVE', 'READY', 'COMPLETED', 'UNPAID'] as FilterType[]).map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-full border ${
                  statusFilter === tab
                    ? 'bg-zinc-900 border-zinc-900'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    statusFilter === tab ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tab === 'ALL'
                    ? 'Semua'
                    : tab === 'ACTIVE'
                    ? 'Proses'
                    : tab === 'READY'
                    ? 'Siap'
                    : tab === 'COMPLETED'
                    ? 'Selesai'
                    : 'Belum Lunas'}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
      {/* FlatList Orders */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#18181b" />
        </View>
      ) : (
        <FlatList
          data={todayOrder}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 font-medium mt-3 text-sm">
                Tidak ada transaksi yang cocok
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusInfo = getStatusBadge(item.status);
            const isPaid = item.paymentStatus === 'PAID';
            const orderTime = item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '-';
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DetailOrder', { id: item.id })}
                className="bg-white p-4 rounded-2xl mb-3 shadow-xs border border-gray-100"
              >
                {/* Baris Atas: Kode Order & Waktu */}
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-xs font-bold text-gray-500 font-mono">
                    {item.orderCode}
                  </Text>
                  <Text className="text-xs text-gray-400">{orderTime}</Text>
                </View>

                {/* Baris Tengah: Plat Nomor & Status Cuci */}
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <View className="bg-zinc-900 px-2.5 py-1 rounded-md self-start mb-1">
                      <Text className="text-sm font-black text-white font-mono tracking-wider">
                        {item.vehiclePlate}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-gray-800">
                      {item.customer?.name || 'Pelanggan'}
                    </Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${statusInfo.bg}`}>
                    <Text className={`text-xs font-bold ${statusInfo.text}`}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Baris Bawah: Info Layanan & Total Biaya */}
                <View className="flex-row justify-between items-center pt-2.5 mt-1 border-t border-gray-50">
                  <Text className="text-xs text-gray-500 truncate max-w-[55%]">
                    {item.orderItems?.[0]?.service?.name || 'Layanan Cuci'}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-bold text-gray-900">
                      Rp {item.total ? item.total.toLocaleString('id-ID') : '0'}
                    </Text>
                    <View
                      className={`px-1.5 py-0.5 rounded ${
                        isPaid ? 'bg-emerald-50' : 'bg-rose-50'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold ${
                          isPaid ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPaid ? 'LUNAS' : 'BELUM'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>

    )
}