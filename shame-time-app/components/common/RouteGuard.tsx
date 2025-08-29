import React from 'react'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { useAuthContext } from '../../providers/AuthProvider'
import { View, ActivityIndicator, Text } from 'react-native'

// RouteGuard component for protecting authenticated routes

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/auth/sign-in'
}) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { isInitialized } = useAuthContext()

  // Debug logging
  console.log('RouteGuard:', { isAuthenticated, isLoading, isInitialized, requireAuth })

  // Show loading spinner while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F0F' }}>
        <ActivityIndicator size="large" color="#6CC4A1" />
        <Text style={{ marginTop: 16, color: '#F5F5F5' }}>Loading...</Text>
      </View>
    )
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    router.replace(redirectTo as any)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#F5F5F5' }}>Redirecting...</Text>
      </View>
    )
  }

  // If route doesn't require authentication but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    router.replace('/')
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#F5F5F5' }}>Redirecting...</Text>
      </View>
    )
  }

  return <>{children}</>
}