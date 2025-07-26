import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

// Auth Stack Navigator
function AuthNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.textPrimary,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ 
          title: 'Create Account',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

// Main App Stack Navigator
function MainNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.textOnPrimary,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'Okan Assist',
          headerLeft: null, // Disable back button on home
        }}
      />
      {/* Future screens will be added here:
      <Stack.Screen name="Expenses" component={ExpensesScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      */}
    </Stack.Navigator>
  );
}

// Loading Screen Component
function LoadingScreen() {
  const { colors, spacing, typography } = useTheme();
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    }}>
      <Text style={{
        fontSize: typography.fontSize['2xl'],
        marginBottom: spacing.md,
      }}>💰</Text>
      <Text style={{
        fontSize: typography.fontSize.lg,
        color: colors.primary,
        fontWeight: typography.fontWeight.medium,
      }}>Loading...</Text>
    </View>
  );
}

// Root App Navigator
export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer
      theme={{
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
      }}
    >
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}