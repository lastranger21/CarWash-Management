import { MaterialIcons } from '@expo/vector-icons'
import {View,Text,Image, TouchableOpacity} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthContext } from '../../App'
import { useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
export default function HomeScreen({navigation}:any){
    const{signOut} = useContext(AuthContext)
    //const username = useUserStore((state) => state.username);
    const [username,setUsername] = useState('')
    useEffect(()=> {
        fetchUser()
    },[])
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
return(
    <SafeAreaView className='flex-1 bg-white'>
        <View className='flex-row justify-between items-center px-4 pb-8'>
            <View>
                <Text className='text-[24px] font-bold text-[#1b1b24] tracking-light'>Hello,{username}</Text>
                <Text className='text-[14px] text-[#575e72] mt-1'>{todayFormatted}</Text>
            </View>

            <TouchableOpacity onPress={signOut}>
                <MaterialIcons name='logout' />
            </TouchableOpacity>
            <View className='w-11 h-11 rounded-full shadow-sm overflow-hidden'>
                <Image 
                   source = {{uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm3rLggSDwIEV6XsEMSBZ6NB639QOOvUgZYlW5EhKu2kv1Vj0to9ttZiDf&s=10'}} 
                   className='w-full h-full' 
                   resizeMode='cover'
                    />
            </View>
            
        </View>
        <View className='flex-row flex-wrap justify-between px-4'>

        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <MaterialIcons  name='people-outline' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#10d981]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#10b981'}/>
                        <Text className='text-[11px] font-bold text-[#10b981] ml-1'>2.4%</Text>
                    </View>
                </View>
                <Text className='text-[24px] font-bold text-[#64748b] mb-1'>1,024</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Followers</Text>
        </View>
        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <MaterialIcons  name='chat-bubble-outline' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#b5cec6]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#b5cec6'}/>
                        <Text className='text-[11px] font-bold text-[#b5cec6] ml-1'>-0.05%</Text>
                    </View>
                </View>
                <Text className='text-[24px] font-bold text-[#64748b] mb-1'>45</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Threads</Text>
        </View>
        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <MaterialIcons  name='favorite-outline' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#10d981]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#10b981'}/>
                        <Text className='text-[11px] font-bold text-[#10b981] ml-1'>2.4%</Text>
                    </View>
                </View>
                <Text className='text-[24px] font-bold text-[#64748b] mb-1'>8,430</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Likes</Text>
        </View>
        <View className='bg-white rounded-2xl p-4 shadow-sm w-[48%] mb-4 border border-gray-50'>
                <View className='flex-row justify-between items-start mb-4'>
                    <MaterialIcons  name='reply' size={24} color={'#575e72'}/>
                    <View className='flex-row items-center bg-[#10d981]/10 px-2 py-1 rounded-full'>
                        <MaterialIcons name='arrow-upward' size={12} color={'#10b981'}/>
                        <Text className='text-[11px] font-bold text-[#10b981] ml-1'>2.4%</Text>
                    </View>
                </View>
                <Text className='text-[24px] font-bold text-[#64748b] mb-1'>1,120</Text>
                <Text className='text-[12px] font-bold text-[#575e72] uppercase tracking wider'>Followers</Text>
        </View>
        </View>
    </SafeAreaView>
)
}