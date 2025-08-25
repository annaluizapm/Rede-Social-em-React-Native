// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para salvar o token e o usuário
  const signIn = useCallback(async (token, user) => {
    try {
      console.log('AuthContext: Iniciando signIn com token e dados de usuário');
      
      // Salvar token e dados do usuário
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      
      // Atualizar estados
      setUserToken(token);
      setUserData(user);
      
      console.log('AuthContext: Login concluído, token e dados salvos');
      return true;
    } catch (error) {
      console.error('AuthContext: Erro ao salvar dados de autenticação:', error);
      Alert.alert('Erro de Login', 'Não foi possível salvar os dados de autenticação.');
      return false;
    }
  }, []);

  // Função para remover o token ao fazer logout
  const signOut = useCallback(async () => {
    console.log('AuthContext: Iniciando processo de logout');
    try {
      // Limpar o AsyncStorage primeiro
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      console.log('AuthContext: AsyncStorage limpo, atualizando estados...');
      
      // Limpar os estados depois
      setUserToken(null);
      setUserData(null);
      
      console.log('AuthContext: Logout concluído com sucesso');
      return true;
    } catch (error) {
      console.error('AuthContext: Erro ao fazer logout:', error);
      Alert.alert('Erro de Logout', 'Ocorreu um erro ao tentar sair da aplicação.');
      return false;
    }
  }, []);
  
  // Atualizar dados do usuário
  const updateUserData = useCallback(async (newUserData) => {
    try {
      const updatedUserData = { ...userData, ...newUserData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      return true;
    } catch (error) {
      console.error('AuthContext: Erro ao atualizar dados do usuário:', error);
      return false;
    }
  }, [userData]);

  // Carregar token e dados do usuário ao iniciar o aplicativo
  useEffect(() => {
    const bootstrapAsync = async () => {
      setIsLoading(true);
      try {
        console.log('AuthContext: Carregando dados de autenticação...');
        
        // Buscar token e dados do usuário
        const token = await AsyncStorage.getItem('userToken');
        const userDataString = await AsyncStorage.getItem('userData');
        
        // Se existe token, carregar nos estados
        if (token) {
          console.log('AuthContext: Token encontrado no AsyncStorage');
          setUserToken(token);
          
          // Se existem dados do usuário, carregar também
          if (userDataString) {
            console.log('AuthContext: Dados do usuário encontrados no AsyncStorage');
            setUserData(JSON.parse(userDataString));
          }
        } else {
          console.log('AuthContext: Nenhum token encontrado no AsyncStorage');
        }
      } catch (error) {
        console.error('AuthContext: Erro ao carregar dados de autenticação:', error);
        // Em caso de erro, limpar tudo para evitar estados inconsistentes
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      userToken, 
      userData, 
      isLoading, 
      signIn, 
      signOut, 
      updateUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;