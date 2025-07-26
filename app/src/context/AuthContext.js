import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// this file defines the AuthContext for managing user authentication state in the app, for future implementation of user login, registration, and profile management functionalities.
// here i should adjust to call the API for user authentication and profile management, but for now, it uses mock data for demonstration purposes.

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data for development
const MOCK_USERS = [
  {
    id: '1',
    email: 'user@okanassist.com',
    password: '123456',
    name: 'John Doe',
    phone: '+1234567890',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
  },
  {
    id: '2',
    email: 'demo@test.com',
    password: 'demo123',
    name: 'Demo User',
    phone: '+0987654321',
    currency: 'EUR',
    language: 'en',
    timezone: 'UTC',
  },
];

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (foundUser) {
        // Remove password from stored user data
        const { password: _, ...userWithoutPassword } = foundUser;
        
        // Store user data
        await AsyncStorage.setItem('userData', JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if email already exists
      const existingUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (existingUser) {
        return { success: false, message: 'Email already exists' };
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        phone: userData.phone || '',
        currency: userData.currency || 'USD',
        language: userData.language || 'en',
        timezone: userData.timezone || 'UTC',
      };
      
      // Add to mock users (in real app, this would be API call)
      MOCK_USERS.push({ ...newUser, password: userData.password });
      
      // Store user data (without password)
      await AsyncStorage.setItem('userData', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};