import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home-screen';
import CartScreen from '../screens/cart-screen';
import ProductScreen from '../screens/product-screen';
import LoginScreen from '../screens/login-screen';
import RegisterScreen from '../screens/register-screen';
import OrderScreen from '../screens/order-screen';
import AuthContext from '../context/AuthContext';
import AccountScreen from '../screens/account-screen';
import { Ionicons } from '@expo/vector-icons';
import { useContext } from 'react';

const HomeStack = createStackNavigator();
const CartStack = createStackNavigator();
const AccountStack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerShown: false, // Ukrywa nagłówek dla wszystkich ekranów
            }}
        >
            <HomeStack.Screen name="Home" component={HomeScreen} />
            <HomeStack.Screen name="Product" component={ProductScreen} />
        </HomeStack.Navigator>
    );
}
  
function CartStackScreen() {
    return (
        <CartStack.Navigator
            screenOptions={{
                headerShown: false, // Ukrywa nagłówek dla wszystkich ekranów
            }}
        >
            <CartStack.Screen name="Cart" component={CartScreen} />
            <CartStack.Screen name="Order" component={OrderScreen} />
        </CartStack.Navigator>
    );
}

function AccountStackScreen() {
    const { user, authTokens } = useContext(AuthContext);
    
    return (
        <AccountStack.Navigator
            screenOptions={{
                headerShown: false, // Ukrywa nagłówek dla wszystkich ekranów
            }}
        >   
            {!user && (
                <>
                    <AccountStack.Screen name="Login" component={LoginScreen} />
                    <AccountStack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
            {user && (
                <AccountStack.Screen name="Account" component={AccountScreen} />
            )}
        </AccountStack.Navigator>
    );
}
  
export default function Navigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route, navigation }) => ({
                headerShown: false, 
                tabBarActiveTintColor: '#299ad7',
                tabBarInactiveTintColor: 'gray',
                headerTitle: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'HomeStack') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'CartStack') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'AccountStack') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return (
                        <Ionicons 
                            name={iconName} 
                            size={size} 
                            color={color} 
                            onPress={() => { navigation.reset({
                                    index: 0,
                                    routes: [{ name: route.name }],
                                });
                            }}
                        />
                    );
                },
            })}
        >
            <Tab.Screen name="HomeStack" component={HomeStackScreen} options={{ title: 'Sklep' }} />
            <Tab.Screen name="CartStack" component={CartStackScreen} options={{ title: 'Koszyk' }} />
            <Tab.Screen name="AccountStack" component={AccountStackScreen} options={{ title: 'Konto' }} />
        </Tab.Navigator>
    );
}
