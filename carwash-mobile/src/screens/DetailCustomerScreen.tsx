import {View,Text,Button} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../App'


type Props = NativeStackScreenProps<RootStackParamList,'DetailCustomer'>
export default function DetailCustomerScreen({route,navigation}:any){
    const {id,name} = route.params
    
return(
    <View style={{flex:1, alignItems:'center', justifyContent: 'center'}}>
        <Text>ID Produk: {id}</Text>
        <Text>Nama Produk: {name}</Text>
        <Button title='Go to Home'
        onPress={()=> navigation.goBack()} />
    </View>
)
}