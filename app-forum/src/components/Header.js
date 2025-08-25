// src/components/Header.js

import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  useWindowDimensions,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';

const Header = ({ 
  title, 
  showBackButton = false, 
  showLogout = false, 
  rightComponent = null,
  user = null
}) => {
  const navigation = useNavigation();
  const { signOut } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  
  // Ajusta layout baseado no dispositivo/tela
  const isMobile = width < 768;
  
  const handleLogout = async () => {
    try {
      await signOut();
      // O redirecionamento deve acontecer automaticamente via AuthProvider
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View style={[
      styles.header,
      // Ajusta estilo para web vs mobile
      Platform.OS === 'web' && !isMobile && styles.headerWeb
    ]}>
      <View style={styles.headerLeft}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.headerRight}>
        {user && (
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => navigation.navigate('Profile', { userId: user.id })}
          >
            {user.profilePictureUrl ? (
              <Image 
                source={{ uri: user.profilePictureUrl }} 
                style={styles.userAvatar} 
              />
            ) : (
              <View style={styles.userInitials}>
                <Text style={styles.initialsText}>
                  {user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.username}>
              {isMobile ? `@${user.username.slice(0, 8)}...` : `@${user.username}`}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightComponent}
        
        {showLogout && (
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#ff4d4d" />
            {!isMobile && (
              <Text style={styles.logoutText}>Sair</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // Garantir que o header não sobreponha o status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
  },
  headerWeb: {
    paddingHorizontal: 24,
    height: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  userInitials: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0066cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  logoutText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#ff4d4d',
    fontWeight: '500',
  },
});

export default Header;
