// app/src/screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { colors, spacing, typography, shadows } = useTheme();
  const { login, loginWithGoogle, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  // Configure Google Sign-In
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const configureGoogleSignIn = () => {
    const googleWebClientId = Constants.expoConfig?.extra?.googleWebClientId;
    
    if (!googleWebClientId) {
      console.log('⚠️ Google Web Client ID not found in app.json');
      return;
    }

    try {
      GoogleSignin.configure({
        webClientId: googleWebClientId,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      console.log('✅ Google Sign-In configured');
    } catch (error) {
      console.error('❌ Google Sign-In configuration error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
    // Success is handled by auth context navigation
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    
    try {
      // Check Play Services
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google Sign-In successful:', userInfo.user.email);
      
      // Get ID token
      const idToken = userInfo.idToken;
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Send to your API
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.1.100:8000/api';
      
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_token: idToken,
        }),
      });

      const data = await response.json();
      console.log('📡 API Response:', data);

      if (response.ok && data.success) {
        // Store auth data (you might want to update your AuthContext to handle this)
        Alert.alert('Success!', `Welcome ${data.user.name}!\n\nGoogle login successful.`);
        
        // TODO: Update your AuthContext to handle the login response
        // For now, we'll just show success
        
      } else {
        Alert.alert('Login Failed', data.message || 'Google login failed');
      }

    } catch (error) {
      console.error('❌ Google login error:', error);
      
      let errorMessage = 'Google login failed';
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Sign-in already in progress';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services not available';
      }
      
      Alert.alert('Google Login Error', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: spacing.xxxl,
    },
    logo: {
      fontSize: typography.fontSize['4xl'],
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    form: {
      marginBottom: spacing.lg,
    },
    inputGroup: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: colors.error,
      marginTop: spacing.xs,
    },
    loginButton: {
      backgroundColor: colors.primary,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
      ...shadows.md,
    },
    loginButtonDisabled: {
      backgroundColor: colors.secondaryLight,
    },
    loginButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
    },
    googleButton: {
      backgroundColor: colors.surface,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      marginBottom: spacing.lg,
      ...shadows.sm,
    },
    googleButtonDisabled: {
      backgroundColor: colors.surfaceSecondary,
    },
    googleIcon: {
      fontSize: 18,
      marginRight: spacing.sm,
    },
    googleButtonText: {
      color: colors.textPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    registerText: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
    },
    registerLink: {
      color: colors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      marginLeft: spacing.xs,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      marginLeft: spacing.sm,
    },
  });

  const isLoading = loading || googleLoading;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Okan Assist account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textLight}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textLight}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.textOnPrimary} size="small" />
                <Text style={[styles.loginButtonText, styles.loadingText]}>
                  Signing In...
                </Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          {googleLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.textPrimary} size="small" />
              <Text style={[styles.googleButtonText, styles.loadingText]}>
                Connecting...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.googleIcon}>🔍</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
          >
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}