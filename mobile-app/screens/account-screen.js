import React, { useCallback, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';

const AccountScreen = () => {
    const [ordeersAreLoading, setOrdersAreLoading] = useState(true);
    const [userIsLoading, setUserIsLoading] = useState(true);
    const { user, authTokens } = useContext(AuthContext);
    const navigation = useNavigation();
    const apiUrl = Platform.OS === 'ios' ? 'http://127.0.0.1:8000/api/' : 'http://10.0.2.2:8000/api/';
    let { logoutUser } = useContext(AuthContext);
    const [orderHistory, setOrderHistory] = useState(null);
    const [adressFormData, setAdressFormData] = useState({
        gender: '',
        city: '',
        street: '',
        house_number: '',
        postal_code: '',
        phone_number: ''
    });
    const [pwdFormData, setPwdFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    useFocusEffect(
        useCallback(() => {
            fetchUserData();
            fetchOrderHistory();
        }, [])
    );

    const fetchUserData = async () => {
        try {
            setUserIsLoading(true);
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authTokens.access}`,
            };
            
            console.log(user);
            const response = await axios.get(`${apiUrl}profile/`, {headers});
            setAdressFormData(response.data);
            console.log(response.data);
            setUserIsLoading(false);
        } catch (error) {
            console.error('Wystąpił błąd podczas próby pobrania danych użytkownika:', error);
            setUserIsLoading(false);
        }
    };

    const fetchOrderHistory = async () => {
        try {
            setOrdersAreLoading(true);
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authTokens.access}`,
            };
            
            const response = await axios.get(`${apiUrl}order_history/`, {headers});
            setOrderHistory(response.data);
            setOrdersAreLoading(false);
        } catch (error) {
            console.error('Wystąpił błąd podczas próby pobrania historii zamówień:', error);
            setOrdersAreLoading(false);
        }
    };

    const handleAdressInputChange = (key, value) => {
        setAdressFormData({
            ...adressFormData,
            [key]: value
        });
    };

    const handlePwdInputChange = (key, value) => {
        setPwdFormData({
            ...pwdFormData,
            [key]: value
        });
    };

    const handleChangePwdSubmit = async () => {
        const { old_password, new_password, confirm_password } = pwdFormData;
    
        // Sprawdzenie czy wszystkie pola są uzupełnione
        if (!old_password || !new_password || !confirm_password) {
            console.error('Proszę wypełnić wszystkie pola.');
            return;
        }
    
        // Sprawdzenie czy stare hasło jest różne od nowego hasła
        if (old_password === new_password) {
            console.error('Nowe hasło musi się różnić od starego hasła.');
            return;
        }
    
        // Sprawdzenie czy nowe hasła są takie same
        if (new_password !== confirm_password) {
            console.error('Nowe hasło i potwierdzenie hasła nie są takie same.');
            return;
        }
    
        // Wysłanie zapytania do API w przypadku poprawnie wypełnionego formularza
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authTokens.access}`,
            };
    
            const response = await axios.post(`${apiUrl}change_password/`, {
                old_password,
                new_password,
            }, { headers });
    
            console.log(response.data);
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Pomyślnie zmieniono hasło!',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
            });
        } catch (error) {
            console.error('Wystąpił błąd podczas zmiany hasła:', error);
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Wystąpił błąd podczas zmiany hasła.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
            });
        }
    };

    const handleChangeAdressSubmit = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authTokens.access}`,
            };
            
            console.log(adressFormData);
            const response = await axios.post(`${apiUrl}update_profile/`, adressFormData,{headers});
            console.log(response.data);
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Pomyślnie zapisano dane!',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
        } catch (error) {
            console.error('Wystąpił błąd podczas zapisywania danych:', error);
        }
    };

    const handleLogoutSubmit = async () => {
        let result = await logoutUser()
        if (result) {
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Pomyślnie wylogowano!',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
            navigation.navigate("Home");
        }
        else
        {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Wystąpił nieoczekiwany błąd.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
        }
    };

    if (ordeersAreLoading || userIsLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Ładowanie zawartości koszyka...</Text>
            </View>
        );
    } 
    else {
        return (
            <ScrollView>
                <View style={styles.adressContainer}>
                    <Text style={styles.sectionTitle}>Adres dostawy</Text>

                    <Text>Miejscowość</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleAdressInputChange('city', text)}
                        value={adressFormData.city}
                    />
                    <Text>Ulica</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleAdressInputChange('street', text)}
                        value={adressFormData.street}
                    />
                    <Text>Numer domu</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleAdressInputChange('house_number', text)}
                        value={adressFormData.house_number}
                    />
                    <Text>Kod pocztowy</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='text'
                        keyboardType='default'
                        onChangeText={(text) => handleAdressInputChange('postal_code', text)}
                        value={adressFormData.postal_code}
                    />
                    <Text>Numer telefonu</Text>
                    <TextInput
                        style={styles.inputField}
                        inputMode='tel'
                        keyboardType='phone-pad'
                        onChangeText={(text) => handleAdressInputChange('phone_number', text)}
                        value={adressFormData.phone_number}
                    />
                    <Text>Płeć</Text>
                    <Picker
                        selectedValue={adressFormData.gender}
                        onValueChange={(itemValue, itemIndex) => handleAdressInputChange('gender', itemValue)}>
                        <Picker.Item label="Mężczyzna" value="M" />
                        <Picker.Item label="Kobieta" value="K" />
                    </Picker>
                    <TouchableOpacity style={styles.orderButton} onPress={() => handleChangeAdressSubmit()}>
                        <Text style={styles.buttonText}>Zapisz zmiany</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.adressContainer}>
                <Text style={styles.sectionTitle}>Zmiana hasła</Text>

                    <Text style={styles.fieldName}>Stare hasło:</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder="Wprowadź stare hasło"
                        secureTextEntry
                        onChangeText={(value) => handlePwdInputChange('old_password', value)}
                    />

                    <Text style={styles.fieldName}>Nowe hasło hasło:</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder="Wprowadź nowe hasło"
                        secureTextEntry
                        onChangeText={(value) => handlePwdInputChange('new_password', value)}
                    />

                    <Text style={styles.fieldName}>Potwierdzenie nowego hasła:</Text>
                    <TextInput
                        style={styles.inputField}
                        placeholder="Potwierdź hasło"
                        secureTextEntry
                        onChangeText={(value) => handlePwdInputChange('confirm_password', value)}
                    />
                    <TouchableOpacity style={styles.orderButton} onPress={() => handleChangePwdSubmit()}>
                        <Text style={styles.buttonText}>Zapisz zmiany</Text>
                    </TouchableOpacity>
                </View>

                
                <View style={styles.totalPriceContainer}>
                    <TouchableOpacity style={styles.orderButton} onPress={() => handleLogoutSubmit()}>
                        <Text style={styles.buttonText}>Wyloguj się...</Text>
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
        marginTop: '1.5%',
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
        marginBottom: '1.5%',
        marginTop: '1.5%',
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
        fontSize: 25,
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

export default AccountScreen;