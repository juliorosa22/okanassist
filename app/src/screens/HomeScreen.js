import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { colors, spacing, typography, shadows } = useTheme();
  const { user, logout } = useAuth();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.lg,
    },
    header: {
      marginBottom: spacing.xl,
    },
    welcomeText: {
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    nameText: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
    },
    dashboardCard: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: 12,
      marginBottom: spacing.lg,
      ...shadows.md,
    },
    cardTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    placeholderText: {
      fontSize: typography.fontSize.base,
      color: colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    logoutButton: {
      backgroundColor: colors.error,
      padding: spacing.md,
      borderRadius: 8,
      marginTop: spacing.xl,
      ...shadows.sm,
    },
    logoutButtonText: {
      color: colors.textOnPrimary,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    },
    userInfo: {
      backgroundColor: colors.surfaceSecondary,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.lg,
    },
    userInfoText: {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user?.name || 'User'}</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userInfoText}>Email: {user?.email}</Text>
        <Text style={styles.userInfoText}>Currency: {user?.currency}</Text>
        <Text style={styles.userInfoText}>Phone: {user?.phone || 'Not provided'}</Text>
      </View>

      <View style={styles.dashboardCard}>
        <Text style={styles.cardTitle}>💰 Recent Expenses</Text>
        <Text style={styles.placeholderText}>
          Expense tracking coming soon...
        </Text>
      </View>

      <View style={styles.dashboardCard}>
        <Text style={styles.cardTitle}>🔔 Upcoming Reminders</Text>
        <Text style={styles.placeholderText}>
          Reminder system coming soon...
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}