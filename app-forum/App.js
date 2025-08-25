// App.js (na raiz do seu projeto meu-app-forum)

import React from 'react';
import AppNavigator from './src/AppNavigator';
import { AuthProvider } from './src/context/AuthContext'; // Importa o provedor

// Reduzir verbosidade do console em produção
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export default function App() {
  return (
    <AuthProvider> {/* Envolve o AppNavigator com AuthProvider */}
      <AppNavigator />
    </AuthProvider>
  );
}