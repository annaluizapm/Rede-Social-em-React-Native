// src/components/CustomButton.js

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomButton = ({ 
  title, 
  onPress, 
  type = 'primary', // primary, secondary, danger
  loading = false,
  disabled = false,
  icon = null,
  style = {},
  textStyle = {},
  fullWidth = false,
}) => {
  // Determinar estilo baseado no tipo
  const getButtonStyle = () => {
    switch(type) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      case 'outline':
        return styles.buttonOutline;
      default:
        return styles.buttonPrimary;
    }
  };
  
  // Determinar cor do texto baseado no tipo
  const getTextStyle = () => {
    switch(type) {
      case 'secondary':
        return styles.textSecondary;
      case 'danger':
        return styles.textDanger;
      case 'outline':
        return styles.textOutline;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator 
          color={type === 'primary' ? '#fff' : '#0066cc'} 
          size="small" 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={18} 
              color={type === 'primary' ? '#fff' : '#0066cc'} 
              style={styles.icon} 
            />
          )}
          <Text style={[
            styles.buttonText, 
            getTextStyle(),
            disabled && styles.textDisabled,
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#0066cc',
  },
  buttonSecondary: {
    backgroundColor: '#e9f0f7',
  },
  buttonDanger: {
    backgroundColor: '#ff4d4d',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#0066cc',
  },
  textDanger: {
    color: '#fff',
  },
  textOutline: {
    color: '#0066cc',
  },
  textDisabled: {
    color: '#888',
  },
  icon: {
    marginRight: 6,
  }
});

export default CustomButton;
