import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import {View,Text,Image, TouchableOpacity, Modal, TouchableWithoutFeedback} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { AuthContext } from '../../App'
import { useCallback, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import { api } from '../config/api'
import { useFocusEffect } from '@react-navigation/native'
import { useLayoutEffect } from 'react'
export default function AdminHomeScreen({navigation}:any){
    const{signOut} = useContext(AuthContext)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [username,setUsername] = useState('')
    const [dashboard,setDashboard] = useState<any>([])
    const insets = useSafeAreaInsets()


     useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsProfileMenuOpen(true)}
          style={{ marginRight: 16 }}
          className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden shadow-xs"
        >
          <Image
            source={{
              uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm3rLggSDwIEV6XsEMSBZ6NB639QOOvUgZYlW5EhKu2kv1Vj0to9ttZiDf&s=10',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

    //focusEffect agar autoupdate ketika home ditekan
    useFocusEffect(
        useCallback(() => {
         fetchUser()
         fetchDashboard();
        }, [])
      );
    const fetchUser = async()=> {
        try {
            const nama =await SecureStore.getItemAsync('username')
            setUsername(nama||'USER')
        } catch (error) {
            console.log(error, 'ini error ')
        }
    }
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const fetchDashboard = async()=> {
    try {
        const token = await SecureStore.getItemAsync('userToken')
        const response = await api.get('/dashboard/summary',{
            headers:{
                Authorization: `Bearer ${token}`
            }}
        )
        setDashboard(response.data.data)
        
    } catch (error) {
        console.log(error,'fetching dashboard data error')
    }
  }
return(
    <SafeAreaView className='flex-1 bg-white'>
        <View className="px-4 pb-6 pt-2">
                <Text className="text-[24px] font-bold text-[#1b1b24] tracking-tight">
                  Hello, {username}
                </Text>
                <Text className="text-[14px] text-[#575e72] mt-0.5">{todayFormatted}</Text>
              </View>
              <Modal
                  visible={isProfileMenuOpen}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setIsProfileMenuOpen(false)}
                >
                  <TouchableWithoutFeedback onPress={() => setIsProfileMenuOpen(false)}>
                    <View className="flex-1 bg-black/10">
                      <View
                        style={{
                          position: 'absolute',
                          top: insets.top + 45, // Otomatis pas tepat di bawah avatar navbar
                          right: 16,
                          elevation: 10,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                        }}
                        className="bg-white rounded-2xl p-2 border border-gray-100 min-w-[170px]"
                      >
                        <View className="px-3 py-2 border-b border-gray-100">
                          <Text className="text-xs font-bold text-gray-900" numberOfLines={1}>
                            {username}
                          </Text>
                          <Text className="text-[10px] text-gray-400">Akun Terhubung</Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setIsProfileMenuOpen(false);
                            signOut();
                          }}
                          className="flex-row items-center gap-2 px-3 py-2.5 rounded-xl active:bg-rose-50 mt-1"
                        >
                          <MaterialIcons name="logout" size={16} color="#e11d48" />
                          <Text className="text-xs font-bold text-rose-600">Keluar (Logout)</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
        <View className='flex-row flex-wrap justify-between px-4'>

        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <Ionicons  name='card-outline' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#10d981]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#10b981'}/>
                        <Text className='text-[11px] font-bold text-[#10b981] ml-1'>2.4%</Text>
                    </View>
                </View>
                <Text className='text-[20px] font-bold text-[#64748b] mb-1'>Rp {(dashboard?.metrics?.todayRevenue||0).toLocaleString('id-ID')}</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Penghasilan Hari ini</Text>
        </View>
        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <Ionicons  name='bag-check-outline' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#b5cec6]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#b5cec6'}/>
                        <Text className='text-[11px] font-bold text-[#b5cec6] ml-1'>-0.05%</Text>
                    </View>
                </View>
                <Text className='text-[24px] font-bold text-[#64748b] mb-1'>{dashboard?.pipeline?.COMPLETED||0}</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Order Selesai</Text>
        </View>
        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <Ionicons  name='timer-outline' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#10d981]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#10b981'}/>
                        <Text className='text-[11px] font-bold text-[#10b981] ml-1'>2.4%</Text>
                    </View>
                </View>
                <Text className='text-[24px] font-bold text-[#64748b] mb-1'>{dashboard?.metrics?.queued||0}</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Antrean Mobil</Text>
        </View>
        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <Ionicons  name='water-outline' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#10d981]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#10b981'}/>
                        <Text className='text-[11px] font-bold text-[#10b981] ml-1'>2.4%</Text>
                    </View>
                </View>
                <Text className='text-[24px] font-bold text-[#64748b] mb-1'>{dashboard?.metrics?.washing||0}</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Sedang Dicuci</Text>
        </View>
        </View>
        <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('NewOrder')}
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
        <Text className="text-white font-bold text-sm">Order Baru</Text>
      </TouchableOpacity>
    </SafeAreaView>
)
}