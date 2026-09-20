import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import "./global.css"
import { createContext } from 'react';
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
import useUserStore from './src/userStore';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import BayMonitor from './src/screens/BayMonitor';
export type RootStackParamList = {
  Login: undefined
  MainApp:undefined;
  DetailCustomer:{id:number, name:string};
}
export type RootTabParamList = {
  HomeTab: undefined;
  BayMonitor: undefined
  Order: undefined;
  Customers: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<RootTabParamList>()
function BottomTabs(){
  return(
    <Tab.Navigator
      screenOptions={({route})=>({
        tabBarIcon: ({focused,color,size}) => {
          let iconName: keyof typeof Ionicons.glyphMap ='home';
          if (route.name ==='HomeTab'){
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
          
          <Tab.Screen name ="HomeTab" component={HomeScreen} options={{title:'Home'}} />
          <Tab.Screen name ="BayMonitor" component={BayMonitor} options={{title:'Bay Monitor'}} />
          <Tab.Screen name ="Order" component={OrderHistoryScreen} options={{title:'Order'}} />
          <Tab.Screen name ="Customers" component={CustomerScreen} options={{title:'Customers'}} />
    </Tab.Navigator>
  )
}


export const AuthContext = createContext<any>(null)
export default function App() {
  const [userToken,setUserToken] = useState<string | null>(null)
  const [isLoading,setIsLoading] = useState(true)
  

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setUserToken(token);
        
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
    },username: async(data:string)=> {
      await SecureStore.setItemAsync('username',data)
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
    <AuthContext.Provider value={authContext}>
    <NavigationContainer>
      <Stack.Navigator>{userToken == null? (
       
        
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
        
      ):(
        <>
        <Stack.Screen name="MainApp" component={BottomTabs} options={{headerShown:false}}/>
        <Stack.Screen name="DetailCustomer" 
        
        options={{
          title:'Product Information',
          headerStyle:{backgroundColor:'#2e7d32'},
        headerTintColor:'#fff',headerTitleStyle:{fontWeight:'bold'}}}
        component={DetailCustomerScreen}
        />
        </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </AuthContext.Provider>
  )
}


