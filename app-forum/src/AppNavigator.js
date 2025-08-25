// src/AppNavigator.js

import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native'; // Para o indicador de carregamento

import AuthContext from './context/AuthContext'; // Importa o AuthContext
import AuthStack from './screens/AuthStack';
import HomeScreen from './screens/HomeScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  // console.log('AppNavigator: userToken atual:', userToken, 'isLoading:', isLoading);

  return (
    <NavigationContainer
      accessibilityState={{}} // Desabilita o comportamento padrão de acessibilidade
    >
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: 'white' } // Evita transparência que pode causar problemas com aria-hidden
        }}
      >
        {userToken ? (
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ unmountOnBlur: true }} // Desmonta a tela completamente quando não estiver em foco
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthStack}
            options={{ unmountOnBlur: true }} // Desmonta a tela completamente quando não estiver em foco
          />
        )}
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

