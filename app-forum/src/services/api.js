// src/services/api.js

import axios from 'axios';
import { Platform } from 'react-native';

// A URL base do seu backend
// Configuração dinâmica baseada na plataforma
let API_BASE_URL;
let SERVER_BASE_URL; // URL base do servidor (sem /api)
const SERVER_PORT = 3001;

// Lista de possíveis IPs/hosts para tentar conectar
const possibleIPs = [
  '26.188.228.109',  // IP atual detectado
  '172.20.10.13',    // IP anterior detectado  
  '192.168.1.100',   // IP comum de rede local
  '10.0.2.2',        // Emulador Android
  'localhost'        // Para web/emulador iOS
];

// Função para gerar a URL base
const getApiUrl = (ip) => `http://${ip}:${SERVER_PORT}/api`;
const getServerUrl = (ip) => `http://${ip}:${SERVER_PORT}`;

// Detectar o IP do servidor automaticamente
const detectServerIP = async () => {
  for (const ip of possibleIPs) {
    try {
      const testUrl = getApiUrl(ip);
      // console.log(`Testando conexão com ${testUrl}...`);
      const response = await axios.get(`${testUrl}/test-connection`, { timeout: 3000 });
      if (response.status === 200) {
        // console.log(`✅ Conexão bem-sucedida com ${testUrl}`);
        API_BASE_URL = testUrl;
        SERVER_BASE_URL = getServerUrl(ip);
        return true;
      }
    } catch (error) {
      // console.log(`❌ Falha ao conectar em ${getApiUrl(ip)}: ${error.message}`);
    }
  }
  return false;
};

// Configuração inicial baseada na plataforma
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  // Para emuladores Android
  if (Platform.OS === 'android' && Platform.constants?.uiMode?.includes('tv')) {
    API_BASE_URL = getApiUrl('10.0.2.2');
    SERVER_BASE_URL = getServerUrl('10.0.2.2');
  }
  // Para dispositivos físicos ou emuladores iOS
  else {
    API_BASE_URL = getApiUrl('26.188.228.109');
    SERVER_BASE_URL = getServerUrl('26.188.228.109');
  }
} else {
  // Web ou outros dispositivos
  API_BASE_URL = getApiUrl('localhost');
  SERVER_BASE_URL = getServerUrl('localhost');
}

// Criar instância do axios com timeout aumentado
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Função para converter URLs relativas em URLs absolutas
const convertImageUrl = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string' || relativeUrl.trim() === '') return null;
  
  // Já é uma URL completa e válida
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    try {
      new URL(relativeUrl); // Validar se a URL está bem formada
      return relativeUrl;
    } catch {
      console.warn('URL malformada detectada:', relativeUrl);
      return null;
    }
  }
  
  // Caminho relativo válido
  if (relativeUrl.startsWith('/uploads/')) {
    try {
      const fullUrl = `${SERVER_BASE_URL}${relativeUrl}`;
      new URL(fullUrl); // Validar se a URL final está bem formada
      return fullUrl;
    } catch {
      console.warn('Erro ao formar URL completa:', relativeUrl);
      return null;
    }
  }
  
  console.warn('URL não reconhecida:', relativeUrl);
  return null;
};

// Interceptor para resposta - transformar URLs de imagens
api.interceptors.response.use(response => {
  // Se for um array de objetos (como lista de posts)
  if (Array.isArray(response.data)) {
    response.data = response.data.map(item => {
      if (item.image_url) {
        item.image_url = convertImageUrl(item.image_url);
      }
      if (item.profile_picture_url) {
        item.profile_picture_url = convertImageUrl(item.profile_picture_url);
      }
      return item;
    });
  } 
  // Se for um único objeto
  else if (typeof response.data === 'object' && response.data !== null) {
    if (response.data.image_url) {
      response.data.image_url = convertImageUrl(response.data.image_url);
    }
    if (response.data.profile_picture_url) {
      response.data.profile_picture_url = convertImageUrl(response.data.profile_picture_url);
    }
    // Para o retorno de upload de imagens
    if (response.data.imageUrl) {
      response.data.imageUrl = convertImageUrl(response.data.imageUrl);
    }
  }
  return response;
}, error => {
  // console.log('❌ API Error:', error.message);
  
  if (!error.response) {
    // console.error('Erro de conexão ao servidor:', error.message);
    if (error.message.includes('Network Error')) {
      // console.error('Erro de rede detectado. Tentando reconectar...');
      // Tentar detectar servidor novamente em caso de erro
      detectServerIP().then(connected => {
        if (connected) {
          // console.log('Reconexão bem-sucedida!');
          api.defaults.baseURL = API_BASE_URL;
        }
      });
    }
  }
  
  return Promise.reject(error);
});

// Função para testar conexão com o servidor
export const testServerConnection = async () => {
  return await detectServerIP();
};

// Tentar detectar o servidor na inicialização
detectServerIP().then(connected => {
  if (connected) {
    // console.log('🚀 Servidor detectado automaticamente!');
    api.defaults.baseURL = API_BASE_URL;
  } else {
    // console.log('⚠️ Não foi possível detectar o servidor automaticamente');
  }
}).catch(err => {
  // console.log('Erro ao detectar servidor:', err)
});

export { convertImageUrl, SERVER_BASE_URL };
export default api;