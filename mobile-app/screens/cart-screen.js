import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';

const CartScreen = () => {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user, authTokens } = useContext(AuthContext);
    const apiUrl = Platform.OS === 'ios' ? 'http://127.0.0.1:8000/api/' : 'http://10.0.2.2:8000/api/';
    const navigation = useNavigation();

    const getImageUrl = (productId) => `${apiUrl}get_product_image/${productId}`;

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [user, authTokens])
    );

    const fetchCart = async () => {
        try {
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
            console.log(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Wystąpił błąd podczas próby pobrania koszyka:', error);
            setIsLoading(false);
        }
    };

    const changeQuantity = (productId, quantity) => {
        var data = {
            amount: quantity,
            product_id: productId,
            cart_id: cart.cart_id,
        };

        console.log(data);

        var tempApiUrl = null;

        let headers = {
            'Content-Type': 'application/json',
        };

        if (user) {
            headers['Authorization'] = `Bearer ${authTokens.access}`;
        }

        if (quantity > 0) {
            tempApiUrl = `${apiUrl}cart_add_product/`;
        }
        else {
            tempApiUrl = `${apiUrl}cart_subtract_product/`;
            data.amount *= -1;
        }

        axios.post(tempApiUrl, data, {headers})
        .then(() => {
            console.log("Zmieniono stan produktu", productId, "w koszyku: ", cart.cart_id);
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Pomyślnie zmieniono stan koszyka.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
              fetchCart();
        })
        .catch(error => {
            console.error("Wystąpił błąd: ", error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Wystąpił nieoczekiwany błąd.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
        });
    };

    const renderProduct = ({ item }) => {
        const productName = item.product_name.length > 13 ? item.product_name.substring(0, 13) + '...' : item.product_name;

        return (
            <View style={styles.product}>
            <View style={styles.infoFirst}>
                <Image
                    style={styles.productImage}
                    source={{ uri: getImageUrl(item.product) }}
                />
                <Text style={styles.productName}>{productName}</Text>
            </View>

            <View style={styles.infoSecond}>
                <Text style={styles.textQuantity}>Ilość:</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={() => changeQuantity(item.product, -1)}>
                    <Text style={styles.buttonText}>&#10134;</Text>
                </TouchableOpacity>
                <Text style={styles.productQuantity}>{item.quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={() => changeQuantity(item.product, 1)}>
                    <Text style={styles.buttonText}>&#10133;</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoThird}>
                <TouchableOpacity style={styles.removeButton} onPress={() => changeQuantity(item.product, item.quantity * -1)}>
                    <Text style={styles.buttonText}>&#128465;</Text>
                </TouchableOpacity>
                <Text style={styles.productPrice}>Łącznie: {item.unit_price * item.quantity} zł</Text>
            </View>
        </View>
        );
    };


    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Ładowanie zawartości koszyka...</Text>
            </View>
        );
    }
    else {
        return (
            <>
                <FlatList
                    data={cart.entries}
                    renderItem={renderProduct}
                    keyExtractor={(_item, index) => String(index)}
                    numColumns={1} />
                <View style={styles.summarize}>
                    <Text style={styles.productName}>Wartość całkowita: {cart.total_price} zł</Text>
                    {cart.total_price > 0 && (
                        <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('Order')}>
                            <Text style={styles.buttonText}>Złóż zamówienie</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </>
        );
    }
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
    product: {
        flex: 1,
        marginHorizontal: '2.5%',
        marginTop: '1%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        marginBottom: '1%',
    },
    infoFirst: {
        flexDirection: 'row',
        justifyContent: "flex-start",
        alignItems: 'center',
        width: '50%',

    },
    infoSecond: {
        flexDirection: 'row',
        justifyContent: "flex-end",
        alignItems: 'center',
        marginTop: '-5%',
    },
    infoThird: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        direction: 'rtl',
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    textQuantity: {
        fontSize: 20,
    },
    productQuantity: {
        fontSize: 25,
        fontWeight: 'bold',
        width: '10%',
        textAlign: 'center',
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: '#299ad7',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 5,
    },
    quantityButton: {
        backgroundColor: '#e5e7eb',
        marginHorizontal: 10,
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
        alignItems:'center',
    },
    buttonText: {
        fontSize: 20,
        color: 'white',
    },
    summarize: {
        height: '12%',
        color: 'white',
        backgroundColor: '#fff',
        alignItems: 'center',

    },
    removeButton: {
        backgroundColor: '#fc4e4e',
        margin: 2,
        borderRadius: 10,
        padding: 2,
        width: '10%',
        alignItems: 'center',
        fontSize: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
    },
    orderButton: {
        backgroundColor: '#299ad7',
        margin: 2,
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
    }
});

export default CartScreen;