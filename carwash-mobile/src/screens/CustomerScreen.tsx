import {View,Text,FlatList,ActivityIndicator,Alert,Image} from 'react-native'
import { useEffect,useState } from 'react'
import { api } from '../config/api'
import * as SecureStore from 'expo-secure-store'

export default function(){
    const [customers,setCustomers] = useState<any[]>([])
    const[isLoading,setIsLoading] =useState(true)
    const [isRefreshing,setIsRefreshing] =useState(false)
    useEffect(()=> {
        fetchCustomer()
    },[])
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
    return (
        <View className='flex-1 bg-[#F9FAFB] px-4 pt-12'>
            <Text className='text-2xl font-bold text-[#1b1b24] mb-6'>List Customer</Text>
            <FlatList
            data = {customers}
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
            <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm border border-gray-100">
                {/* Baris Atas: Nama di kiri, Badge Membership di kanan */}
                <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                    <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                    {item.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">{item.phone}</Text>
                </View>
                {/* 2. Badge Status Membership */}
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
            </View>
  );
}}
            />
        </View>

    )
}