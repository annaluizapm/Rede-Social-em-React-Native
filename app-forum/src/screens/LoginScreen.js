import React, { useState, useContext } from 'react'; // Importa useContext
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import api from '../services/api';
import AuthContext from '../context/AuthContext'; // Importa o AuthContext

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext); // Pega a função signIn do contexto

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu usuário ou email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, digite sua senha');
      return;
    }

    try {
      console.log('Tentando fazer login com:', { identifier });
      console.log('URL da API:', api.defaults.baseURL);
      
      // Primeiro, tentar testar a conexão se disponível
      try {
        const { testServerConnection } = require('../services/api');
        if (testServerConnection) {
          const connected = await testServerConnection();
          if (connected) {
            console.log('Conexão testada com sucesso, prosseguindo com o login');
          } else {
            console.log('Falha no teste de conexão, tentando o login mesmo assim');
          }
        }
      } catch (connErr) {
        console.log('Erro ao testar conexão:', connErr);
      }
      
      const response = await api.post('/auth/login', { identifier, password });
      console.log('Login bem-sucedido:', response.data);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      // Chamar signIn para salvar o token e atualizar o estado global
      await signIn(response.data.token, response.data.user); // Passa o token e os dados do usuário
      // Não precisa de navigation.replace('Home') aqui, o AppNavigator fará a transição
    } catch (error) {
      console.error('Erro completo:', error);
      
      if (error.response) {
        // O servidor respondeu com um código de status fora do intervalo 2xx
        console.error('Detalhes da resposta:', error.response.data);
        console.error('Status:', error.response.status);
        
        if (error.response.status === 401) {
          Alert.alert('Credenciais Inválidas', 'Usuário/email ou senha incorretos');
        } else {
          Alert.alert('Erro no Servidor', 
            error.response.data.message || 'O servidor encontrou um erro ao processar sua solicitação');
        }
      } else if (error.request) {
        // A requisição foi feita mas não recebeu resposta
        console.error('Sem resposta do servidor:', error.request);
        Alert.alert(
          'Erro de Conexão', 
          'Não foi possível conectar ao servidor. Verifique sua conexão de internet e se o servidor está rodando.\n\n' +
          `Servidor atual: ${api.defaults.baseURL}\n` +
          'Dica: Certifique-se de estar conectado à mesma rede Wi-Fi do servidor.'
        );
      } else {
        // Algo aconteceu na configuração da requisição que causou o erro
        console.error('Erro na requisição:', error.message);
        Alert.alert('Erro Inesperado', error.message || 'Ocorreu um erro inesperado');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuário ou E-mail"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Entrar" onPress={handleLogin} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Não tem uma conta? Cadastre-se</Text>
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
  registerText: {
    marginTop: 20,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;