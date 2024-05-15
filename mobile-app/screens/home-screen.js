import React, { useCallback, useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Platform, TextInput } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';

const HomeScreen = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState(null);
    const [isTextInputVisible, setIsTextInputVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [cartIsLoading, setCartIsLoading] = useState(true);
    const [productsAreLoading, setProductsAreLoading] = useState(true);
    const { user, authTokens } = useContext(AuthContext);
    const navigation = useNavigation();
    const apiUrl = Platform.OS === 'ios' ? 'http://127.0.0.1:8000/api/' : 'http://10.0.2.2:8000/api/';
    
    const getImageUrl = (productId) => `${apiUrl}get_product_image/${productId}`;
    
    useFocusEffect(
        useCallback(() => {
            setProductsAreLoading(true);
            axios.get(`${apiUrl}get_all_products/`)
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error(error);
            });
            setProductsAreLoading(false);
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [user, authTokens])
    );

    const fetchCart = async () => {
        try {
            setCartIsLoading(true)
            let headers = {
                'Content-Type': 'application/json',
            };

            let url = ``;
            let storedCartId = null;

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

            if ( !user && !storedCartId) {
                AsyncStorage.setItem('cart_id', response.data.cart_id);
            }
            setCartIsLoading(false);
        } catch (error) {
            console.error('Wystąpił błąd podczas próby pobrania koszyka:', error);
            setCartIsLoading(false);
        }
    };

    const addToCart = (productId) => {
        if (!cart) {
            console.error("Dane koszyka nie są jeszcze dostępne");
            return;
        }

        let headers = {
            'Content-Type': 'application/json',
        };

        if (user) {
            headers['Authorization'] = `Bearer ${authTokens.access}`;
        }

        const data = {
            amount: 1,
            product_id: productId,
            cart_id: cart.cart_id,
        };

        axios.post(`${apiUrl}cart_add_product/`, data, {headers})
        .then(() => {
            console.log("Dodano produkt ", productId, "do koszyka: ", cart.cart_id);

            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Dodano produkt do koszyka.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
        })
        .catch(error => {
            console.error("Wystąpił błąd przy dodawaniu do koszyka: ", error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Wystąpił błąd przy dodawaniu do koszyka.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
        });
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderProduct = ({ item }) => {
        // Ograniczenie długości nazwy produktu do maksymalnie 30 znaków
        const productName = item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name;
    
        return (
            <TouchableOpacity style={styles.product} onPress={() => navigation.navigate('Product', { productId: item.id })}>
                <Image
                    style={styles.productImage}
                    source={{ uri: getImageUrl(item.id) }}
                />
                <Text style={styles.productName}>{productName}</Text>
                <Text style={styles.productPrice}>Cena: {item.price} zł</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item.id)}>
                    <Text style={styles.buttonText}>Do koszyka</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const toggleTextInputVisibility = () => {
        setIsTextInputVisible(!isTextInputVisible);
        if (isTextInputVisible) {
            setSearchText('');
        }
    };


    if (cartIsLoading || productsAreLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Trwa ładowanie...</Text>
            </View>
        );
    }
    else {
        return (
            <>
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={(_item, index) => String(index)}
                    numColumns={2}
                />
                <View style={styles.searchBar}>
                    <TouchableOpacity style={styles.searchIcon} onPress={toggleTextInputVisibility}>
                        <Text style={styles.icon}>&#128269;</Text>
                    </TouchableOpacity>
                    {isTextInputVisible && (
                        <TextInput
                            style={styles.searchField}
                            inputMode='text'
                            keyboardType='default'
                            placeholder=" Szukaj..."
                            value={searchText}
                            onChangeText={text => setSearchText(text)}
                        />
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
    product: {
        marginHorizontal: '2.5%',
        marginVertical: '1%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        width: '45%',
        alignItems: 'center',
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    productImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#299ad7',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 5,
    },
    addButton: {
        backgroundColor: '#299ad7',
        margin: 2,
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
    },
    searchField: {
        alignSelf:'flex-end',
        backgroundColor: '#d3eaf2',
        borderRadius: 20,
        fontSize: 20,
        height: 50,
        opacity: 80,
        paddingLeft: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        width: '100%',

        marginLeft: -40,
    },
    searchBar: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        height: 50,
        bottom: 0,
    },
    searchIcon: {
        borderWidth: 3,
        borderRadius: 25,
        borderColor: '#299ad7',
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        width: 50,
        zIndex: 2,
    },
    icon: {
        fontSize: 25,
        borderRadius: 25,
        textAlign: 'center',
    }
});

export default HomeScreen;