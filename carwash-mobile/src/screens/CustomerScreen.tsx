import {View,Text,FlatList,ActivityIndicator,Alert,Image,TouchableOpacity, TextInput} from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../config/api'
import * as SecureStore from 'expo-secure-store'
import { Ionicons } from '@expo/vector-icons'

export default function CustomerScreen({ navigation }: any) {
    const [customers,setCustomers] = useState<any[]>([])
    const[isLoading,setIsLoading] =useState(true)
    const [isRefreshing,setIsRefreshing] =useState(false)
    useFocusEffect(
      useCallback(() => {
        fetchCustomer();
      }, [])
    );
    const fetchCustomer = async()=> {
        try {
            const token = await SecureStore.getItemAsync('userToken')
            const response = await api.get('/customers', {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            setCustomers(response.data.data)
            console.log('jalan kok')
            
        } catch (error:any) {
            console.log('fetch error:',error)
            Alert.alert('access denied',error.response?.data?.message || 'failed to get data')
        }
        finally{
            setIsLoading(false)

        }
    }
    const handleRefresh =async()=>{
        setIsRefreshing(true)
        await fetchCustomer()
        setIsRefreshing(false)
    }
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
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Reguler' | 'Member'>('ALL')
    const filteredCustomers =customers.filter((customer)=>{
        const matchesSearch =
            customer.vehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        if (statusFilter==='Reguler'){
            return customer.isActive === false;
        }
        if (statusFilter==='Member'){
            return customer.isActive ===true
        }
        if (!matchesSearch ) return false
        return true
    })
        return (
        <View className='flex-1 bg-[#F9FAFB] px-4 pt-12'>
            <Text className='text-2xl font-bold text-[#1b1b24] mb-6'>List Customer</Text>
            {/* Input Search */}
                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2 mt-4 mb-3 shadow-xs">
                      <Ionicons name="search-outline" size={18} color="#9ca3af" />
                      <TextInput
                        placeholder="Cari Customer dan Member."
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
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#18181b" />
                </View>
            ):(

            <FlatList
            data = {filteredCustomers}
            keyExtractor={(cust)=> cust.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle ={{paddingBottom:100}}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => {
            // status  membership
            const isMember = Boolean(item.membership);
            const isActive = item.membership?.isActive;
            return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DetailCustomer', { id: item.id, name: item.name })}
                className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100"
            >
                {/* Baris Atas: Nama di kiri, Badge Membership di kanan */}
                <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                    <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                    {item.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">{item.phone}</Text>
                </View>
                {/* Badge Status Membership */}
                {isMember ? (
                    <View
                    className={`px-2.5 py-1 rounded-full border ${
                        isActive
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                    >
                    <Text
                        className={`text-xs font-semibold ${
                        isActive ? "text-emerald-700" : "text-amber-700"
                        }`}
                    >
                        {isActive ? "Member Aktif" : "Nonaktif"}
                    </Text>
                    </View>
                ) : (
                    <View className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                    <Text className="text-xs font-medium text-gray-500">Reguler</Text>
                    </View>
                )}
                </View>
                {/* Baris Bawah: Kode Member & Plat Nomor */}
                <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
                <Text className="text-xs text-gray-400">
                    {item.membership ? item.membership.memberCode : "Belum ada kartu"}
                </Text>
                
                {/* Catatan: data plat nomor dari backend berada di item.vehicles */}
                <Text className="text-xs font-medium text-gray-600">
                    {item.vehicles?.[0]?.plateNumber || item.vehicleplate || "-"}
                </Text>
                </View>
            </TouchableOpacity>
            
        );
      }}
                  />
            )}
            <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('NewCustomer')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        }}
        className="bg-zinc-900 flex-row items-center px-5 py-3.5 rounded-full"
      >
        <Ionicons name="add" size={24} color="#ffffff" style={{ marginRight: 6 }} />
        <Text className="text-white font-bold text-sm">Customer Baru</Text>
      </TouchableOpacity>
        </View>

    )
}