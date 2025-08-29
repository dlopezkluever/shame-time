import React, { useState } from 'react'
import { Link, router } from 'expo-router'
import { View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native'
import { RouteGuard } from '../../components/common/RouteGuard'
import { useAuthStore } from '../../store/authStore'

export default function SignInScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { signIn, resetPassword, isLoading, error, clearError } = useAuthStore()
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async () => {
    clearError()
    if (!validateForm()) return

    const result = await signIn({
      email: formData.email,
      password: formData.password
    })

    if (result.success) {
      router.replace('/')
    }
  }

  const handleResetPassword = async () => {
    if (!formData.email.trim()) {
      setErrors({ email: 'Please enter your email address first' })
      return
    }

    setIsResettingPassword(true)
    const result = await resetPassword(formData.email)
    setIsResettingPassword(false)

    if (result.success) {
      setResetEmailSent(true)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    clearError()
  }

  if (resetEmailSent) {
    return (
      <RouteGuard requireAuth={false}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.centerContent}>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to {formData.email}
              </Text>
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => setResetEmailSent(false)}
              >
                <Text style={styles.outlineButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requireAuth={false}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your shame-free journey
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email address"
                  placeholderTextColor="#757575"
                  value={formData.email}
                  onChangeText={(text: string) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor="#757575"
                  value={formData.password}
                  onChangeText={(text: string) => updateFormData('password', text)}
                  secureTextEntry
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? (
                    <ActivityIndicator size="small" color="#6CC4A1" />
                  ) : (
                    <Text style={styles.linkText}>Forgot password?</Text>
                  )}
                </TouchableOpacity>
              </View>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footerSection}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/auth/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </RouteGuard>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: '#0F0F0F',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F5F5F5',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#F5F5F5',
  },
  inputError: {
    borderColor: '#E55B5B',
  },
  errorText: {
    color: '#E55B5B',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  linkText: {
    color: '#6CC4A1',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    backgroundColor: '#6CC4A1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  outlineButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#BDBDBD',
    fontSize: 14,
  },
  centerContent: {
    alignItems: 'center',
  },
})