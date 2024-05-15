import React, { useCallback, useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';

const OrderScreen = () => {
    const [cart, setCart] = useState(null);
    const [cartIsLoading, setCartIsLoading] = useState(true);
    const [userIsLoading, setUserIsLoading] = useState(true);
    const { user, authTokens } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        gender: '',
        city: '',
        street: '',
        house_number: '',
        postal_code: '',
        phone_number: '',
        shopping_cart_id:''
    });

    const navigation = useNavigation();
    const apiUrl = Platform.OS === 'ios' ? 'http://127.0.0.1:8000/api/' : 'http://10.0.2.2:8000/api/';
    
    const getImageUrl = (productId) => `${apiUrl}get_product_image/${productId}`;

    useFocusEffect(
        useCallback(() => {
            fetchCart();
            fetchUserData();
        }, [user, authTokens])
    );

    const fetchUserData = async () => {
        if ( user )
        {
            try {
                setUserIsLoading(true);
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authTokens.access}`,
                };
                
                const response = await axios.get(`${apiUrl}profile/`, {headers});
                setFormData(response.data);
                setUserIsLoading(false);
            } catch (error) {
                console.error('Wystąpił błąd podczas próby pobrania danych użytkownika:', error);
                setUserIsLoading(false);
            }
        } 
        
    };

    const fetchCart = async () => {
        try {
            setCartIsLoading(true);
            let headers = {
                'Content-Type': 'application/json',
            };

            let url = ``;

            if (user) {
                headers['Authorization'] = `Bearer ${authTokens.access}`;
                url = `${apiUrl}cart_get/`;
            }
            else {
                storedCartId = await AsyncStorage.getItem('cart_id');
                if (storedCartId){
                    url = `${apiUrl}cart_get/${storedCartId}`;
                }
                else {
                    url = `${apiUrl}cart_get/`;
                }  
            }
            
            const response = await axios.get(url, {headers});
            setCart(response.data);
            setCartIsLoading(false);
        } catch (error) {
            console.error('Wystąpił błąd podczas próby pobrania koszyka:', error);
            setCartIsLoading(false);
        }
    };

    const handleInputChange = (key, value) => {
        setFormData({
            ...formData,
            [key]: value
        });
    };

    const handleOrderSubmit = async () => {
        formData.shopping_cart_id = cart.cart_id;
        if (   !formData.city 
            || !formData.street 
            || !formData.house_number 
            || !formData.postal_code 
            || !formData.phone_number) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Błąd',
                text2: 'Proszę uzupełnić adres dostawy!',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
            });
            return;
        }

        try {
            let headers = {
                'Content-Type': 'application/json',
            };

            if (user) {
                headers['Authorization'] = `Bearer ${authTokens.access}`;
            }

            console.log(formData);
            const response = await axios.post(`${apiUrl}create_order/`, {
                city: formData.city,
                street: formData.street,
                house_number: formData.house_number,
                postal_code: formData.postal_code,
                phone_number: formData.phone_number,
                shopping_cart_id: cart.cart_id,
            }, {headers});
            
            Toast.show({
                type:  'success',
                position: 'top',
                text1: 'Pomyślnie złożono zamówienie.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
            navigation.navigate('Home');

        } catch (error) {
            console.error('Error creating order:', error);
            // Obsłuż błąd (np. wyświetl komunikat o błędzie)
        }
    };

    const renderProduct = ({ item, index }) => {
        const productName = item.product_name.length > 15 ? item.product_name.substring(0, 15) + '...' : item.product_name;
        
        return(
            <View>
                <View style={styles.products}>
                    <View style={styles.infoFirst}>
                        <Image
                            style={styles.productImage}
                            source={{ uri: getImageUrl(item.product) }}
                        />
                        <Text style={styles.productName}>{productName}</Text>
                    </View>
                    <View style={styles.infoSecond}>
                        <Text style={styles.textQuantity}>Ilość:</Text>
                        <Text style={styles.productQuantity}>{item.quantity}</Text>
                    </View>
                </View>
                <View style={styles.infoThird}>
                    <Text>Łącznie: </Text>
                    <Text>{item.unit_price * item.quantity} zł</Text>
                </View>
                {index < cart.entries.length - 1 && <View style={styles.line}></View>}
            </View>
        );
    };

    if (cartIsLoading || userIsLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Ładowanie zawartości koszyka...</Text>
            </View>
        );
    } 
    else {
        return (
            <ScrollView>
                <FlatList
                    data={cart.entries}
                    renderItem={renderProduct}
                    keyExtractor={(_item, index) => String(index)}
                    numColumns={1} 
                    scrollEnabled={false}
                    contentContainerStyle={styles.flatListContainer}
                />
                <View style={styles.adressContainer}>
                    <Text style={styles.sectionTitle}>Adres dostawy</Text>

                    <Text>Miejscowość</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleInputChange('city', text)}
                        value={formData.city}
                    />
                    <Text>Ulica</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleInputChange('street', text)}
                        value={formData.street}
                    />
                    <Text>Numer domu</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleInputChange('house_number', text)}
                        value={formData.house_number}
                    />
                    <Text>Kod pocztowy</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleInputChange('postal_code', text)}
                        value={formData.postal_code}
                    />
                    <Text>Numer telefonu</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='tel'
                        keyboardType='phone-pad'
                        onChangeText={(text) => handleInputChange('phone_number', text)}
                        value={formData.phone_number}
                    />
                </View>
                <View style={styles.totalPriceContainer}>
                    <View style={styles.totalPriceRow}>
                        <Text style={styles.productName}>Kwota do zapłaty:</Text>
                        <Text style={styles.productName}>{cart.total_price} zł</Text>
                    </View>
                    <TouchableOpacity style={styles.orderButton} onPress={handleOrderSubmit}>
                        <Text style={styles.buttonText}>Zapłać</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
    );};
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    products: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    flatListContainer: { 
        margin: '2.5%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    totalPriceContainer: {
        marginHorizontal: '2.5%',
        marginBottom: '2.5%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    adressContainer: {
        marginHorizontal: '2.5%',
        marginBottom: '2.5%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    infoFirst: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: 'center',
        width: '50%',

    },
    infoSecond: {
        width: '30%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoThird: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        justifyContent: 'space-between',
        width: '30%',
        marginTop: -15,
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    textQuantity: {
        fontSize: 20,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#299ad7',
    },
    productQuantity: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    line: {
        marginTop: 5,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#299ad7',
        width: '90%',
        alignSelf: 'center',
    },
    sectionTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        marginLeft: 10,
        marginBottom: 10,
        alignSelf: 'center',
    },
    inputField: {
        backgroundColor: '#d3eaf2',
        borderRadius: 10,
        borderColor: '#e5e7eb',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        opacity: 80,
        height: 40,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    orderButton: {
        backgroundColor: '#299ad7',
        margin: 10,
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
        alignSelf:'center',
        width: '50%',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
        textAlign: 'center',
    },
    totalPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default OrderScreen;