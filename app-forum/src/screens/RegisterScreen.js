// src/screens/RegisterScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import api from '../services/api'; // Importa a instância do Axios

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    // Validações básicas do lado do cliente
    if (!username.trim()) {
      Alert.alert('Erro', 'O nome de usuário é obrigatório');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'O email é obrigatório');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      console.log('Tentando registrar com:', { username, email, password });
      console.log('URL da API:', api.defaults.baseURL);
      
      // Mostrar para o usuário que estamos processando
      Alert.alert('Processando...', 'Estamos criando sua conta, aguarde um momento.');
      
      const response = await api.post('/auth/register', { username, email, password });
      console.log('Cadastro bem-sucedido:', response.data);
      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso! Faça login para continuar.');
      navigation.navigate('Login'); // Volta para a tela de login após o cadastro
    } catch (error) {
      console.error('Erro completo:', error);
      
      if (error.response) {
        // O servidor respondeu com um código de status fora do intervalo 2xx
        console.error('Detalhes da resposta:', error.response.data);
        console.error('Status:', error.response.status);
        Alert.alert('Erro no Cadastro', error.response.data.message || 'Erro de servidor');
      } else if (error.request) {
        // A requisição foi feita mas não recebeu resposta
        console.error('Sem resposta do servidor:', error.request);
        Alert.alert('Erro de Conexão', 
          'Não foi possível conectar ao servidor. Verifique sua conexão de internet e se o servidor está rodando.');
      } else {
        // Algo aconteceu na configuração da requisição que causou o erro
        console.error('Erro na requisição:', error.message);
        Alert.alert('Erro na Requisição', error.message || 'Ocorreu um erro inesperado');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.content}>
        <Text style={styles.title}>Crie sua conta</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome de Usuário"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Cadastrar" onPress={handleRegister} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Já tem uma conta? Faça login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  loginText: {
    marginTop: 20,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;