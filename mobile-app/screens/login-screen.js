import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import AuthContext from '../context/AuthContext';
import { useState, useContext } from 'react';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
    const navigation = useNavigation();
    let { loginUser } = useContext(AuthContext)
    const [email, setEmail] = useState("")
    const [pwd, setPwd] = useState("")

    const handleSubmit = async () => {
        // TODO : add validation of user input
        let result = await loginUser(email, pwd)
        if (!result) {
            Toast.show({
                type: 'error',
                position: 'top',
                text1: 'Niepoprawne dane logowania.',
                visibilityTime: 4000,
                autoHide: true,
                topOffset: 120,
                bottomOffset: 40,
              });
        }
    };

    return (
        <ScrollView style={styles.mainContainer}>
            <Text style={styles.mainText}>Logowanie</Text>
            <Text style={styles.subText}>Witaj z powrotem bilardzisto!</Text>

            <View style={styles.loginForm}>
                <Text>Email:</Text>
                <TextInput
                    style={styles.inputField}
                    inputMode='email'
                    keyboardType='email-address'
                    onChangeText={text => setEmail(text)}
                    placeholder="Wprowadź adres e-mail"
                />
                <Text>Hasło:</Text>
                <TextInput
                    style={styles.inputField}
                    placeholder="Wprowadź hasło"
                    onChangeText={text => setPwd(text)}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.loginBtn} onPress={() => handleSubmit()}>
                    <Text style={styles.buttonText}>Zaloguj się!</Text>
                </TouchableOpacity>

                <Text style={styles.subText2}>Nie masz jeszcze konta?</Text>
                <TouchableOpacity style={styles.signupBtn} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.signupText}>Dołącz do nas!</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        marginHorizontal: '2.5%',
        marginVertical: '40%',
        paddingVertical: 20,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        width: '95',
    },
    mainText: {
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    subText: {
        color: '#949494',
        fontSize: 15,
        alignSelf: 'center',
    },
    subText2: {
        color: '#949494',
        fontSize: 15,
        alignSelf: 'flex-end',
    },
    loginForm: {
        width: '80%',
        alignSelf:  'center',
        marginVertical: 20,
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
    loginBtn: {
        backgroundColor: '#299ad7',
        marginVertical: 20,
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
        width: '80%',
        alignSelf:  'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
    },
    signupBtn: {
        alignSelf: 'flex-end',
    },
    signupText: {
        color: '#0051ff',
        fontSize: 15,
    }
});

export default LoginScreen;