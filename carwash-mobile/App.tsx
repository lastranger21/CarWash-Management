import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import "./global.css"
import { createContext, useContext } from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import * as SecureStore from 'expo-secure-store'
import CustomerScreen from './src/screens/CustomerScreen';
import HomeScreen from './src/screens/HomeScreen';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useState,useEffect,useMemo } from 'react';
import DetailCustomerScreen from './src/screens/DetailCustomerScreen';
import DetailOrderScreen from './src/screens/DetailOrderScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import BayMonitor from './src/screens/BayMonitor';
import NewOrderScreen from './src/screens/NewOrderScreen';
import EditOrderScreen from './src/screens/EditOrderScreen';
import NewCustomerScreen from './src/screens/NewCustomerScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import { api, setupAxiosInterceptor } from './src/config/api';
import { Alert } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
  DetailCustomer: { id: number; name: string };
  NewCustomer:undefined
  DetailOrder: { id: number };
  NewOrder: undefined;
  EditOrder: { id: number };
};
export type RootTabParamList = {
  HomeTab: undefined;
  AdminHomeTab:undefined
  BayMonitor: undefined
  Order: undefined;
  Customers: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<RootTabParamList>()
function BottomTabs(){
  const { userRole } = useContext(AuthContext);
  
  return(
    <Tab.Navigator
      screenOptions={({route})=>({
        tabBarIcon: ({focused,color,size}) => {
          let iconName: keyof typeof Ionicons.glyphMap ='home';
          if (route.name ==='HomeTab' || route.name==='AdminHomeTab'){
            iconName=focused ?'home': 'home-outline'
          }else if(route.name ==='BayMonitor'){
            iconName = focused? 'tv':'tv-outline'
          }
          else if(route.name ==='Order'){
            iconName = focused? 'document-text-sharp':'document-text-outline'
          }
          else if(route.name ==='Customers'){
            iconName = focused? 'people':'people-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#080808',
        tabBarInactiveTintColor:'gray',
        
      })}
      >
          {userRole ==='ADMIN'?(<Tab.Screen name ="AdminHomeTab" component={AdminHomeScreen} options={{title:'Admin Home'}} />):(<Tab.Screen name ="HomeTab" component={HomeScreen} options={{title:'Home'}} />)}
          
          <Tab.Screen name ="BayMonitor" component={BayMonitor} options={{title:'Bay Monitor'}} />
          <Tab.Screen name ="Order" component={OrderHistoryScreen} options={{title:'Order'}} />
          <Tab.Screen name ="Customers" component={CustomerScreen} options={{title:'Customers'}} />
    </Tab.Navigator>
  )
}


export const AuthContext = createContext<any>(null)
export default function App() {
  
  const [isLoading,setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    setupAxiosInterceptor(() => {
      Alert.alert(
        'Sesi Berakhir',
        'Sesi login Anda telah habis. Silakan masuk kembali.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await SecureStore.deleteItemAsync('userToken');
              await SecureStore.deleteItemAsync('userRole');
              await SecureStore.deleteItemAsync('username');
              setUserToken(null);
              setUserRole('');
            },
          },
        ]
      );
    });
  }, []);
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const role =await SecureStore.getItemAsync('userRole');
        setUserToken(token);
        setUserRole(role ||'STAFF')
      } catch (error) {
        console.error('gagal mengambil token', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);
const authContext = useMemo(()=> ({
  signIn:async(token:string,data:any) =>{
    await SecureStore.setItemAsync('userToken',token)
    setUserToken(token)
    
  },
    signOut: async () => {
      await SecureStore.deleteItemAsync('userToken');
      setUserToken(null);
      setUserRole(''); 
    },username: async(data:string)=> {
      await SecureStore.setItemAsync('username',data)
    },setUserRole:async(role:string)=>{
      await SecureStore.setItemAsync('userRole',role)
      setUserRole(role)
    }
  }), []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f5' }}>
        <ActivityIndicator size="large" color="#18181b" />
      </View>
    );
  }
  
  return (
    <AuthContext.Provider value={{...authContext,userRole}}>
    <NavigationContainer>
      <Stack.Navigator>{userToken == null? (
       
        
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
        
      ):(
        <>
        <Stack.Screen name="MainApp" component={BottomTabs} options={{headerShown:false}}/>
        <Stack.Screen
          name="DetailCustomer"
          options={{
            title: 'Detail Pelanggan',
            headerStyle: { backgroundColor: '#18181b' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'Kembali',
          }}
          component={DetailCustomerScreen}
        />
        <Stack.Screen
          name="NewCustomer"
          options={{
            title: 'Daftar Customer Baru',
            headerStyle: { backgroundColor: '#18181b' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'Kembali',
          }}
          component={NewCustomerScreen}
        />
        <Stack.Screen
          name="DetailOrder"
          options={{
            title: 'Detail Pesanan',
            headerStyle: { backgroundColor: '#18181b' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'Kembali',
          }}
          component={DetailOrderScreen}
        />
        <Stack.Screen
          name="NewOrder"
          options={{
            title: 'Buat Pesanan Baru',
            headerStyle: { backgroundColor: '#18181b' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'Kembali',
          }}
          component={NewOrderScreen}
        />
        <Stack.Screen
          name="EditOrder"
          options={{
            title: 'Edit Pesanan',
            headerStyle: { backgroundColor: '#18181b' },
            headerTintColor: '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackTitle: 'Kembali',
          }}
          component={EditOrderScreen}
        />
        </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </AuthContext.Provider>
  )
}


