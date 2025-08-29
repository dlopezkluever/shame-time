import React, { useState } from 'react'
import { Link, router } from 'expo-router'
import { YStack, XStack } from '@tamagui/stacks'
import { Input } from '@tamagui/core'
import { Button } from '@tamagui/button'
import { Text, H2 } from '@tamagui/text'
import { Card } from '@tamagui/card'
import { Form, Spinner } from 'tamagui'
import { ScrollView } from 'react-native'
import { RouteGuard } from '../../components/common/RouteGuard'
import { useAuthStore } from '../../store/authStore'

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { signUp, isLoading, error } = useAuthStore()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async () => {
    if (!validateForm()) return

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    })

    if (result.success) {
      router.replace('/')
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <RouteGuard requireAuth={false}>
      <ScrollView flex={1} backgroundColor="$background">
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Card
            width="100%"
            maxWidth={400}
            padding="$6"
            backgroundColor="$background"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$4"
          >
            <YStack space="$4">
              <YStack space="$2" alignItems="center">
                <H2 color="$color" textAlign="center">Create Account</H2>
                <Text color="$gray11" textAlign="center">
                  Join Shame Time and start reducing your screen time
                </Text>
              </YStack>

              <Form onSubmit={handleSignUp}>
                <YStack space="$3">
                  <YStack space="$2">
                    <XStack space="$3">
                      <YStack flex={1} space="$1">
                        <Input
                          placeholder="First name"
                          value={formData.firstName}
                          onChangeText={(text: string) => updateFormData('firstName', text)}
                          backgroundColor="$backgroundStrong"
                          borderColor={errors.firstName ? '$red9' : '$borderColor'}
                        />
                        {errors.firstName && (
                          <Text color="$red9" fontSize="$2">{errors.firstName}</Text>
                        )}
                      </YStack>
                      
                      <YStack flex={1} space="$1">
                        <Input
                          placeholder="Last name"
                          value={formData.lastName}
                          onChangeText={(text: string) => updateFormData('lastName', text)}
                          backgroundColor="$backgroundStrong"
                          borderColor={errors.lastName ? '$red9' : '$borderColor'}
                        />
                        {errors.lastName && (
                          <Text color="$red9" fontSize="$2">{errors.lastName}</Text>
                        )}
                      </YStack>
                    </XStack>
                  </YStack>

                  <YStack space="$1">
                    <Input
                      placeholder="Email address"
                      value={formData.email}
                      onChangeText={(text: string) => updateFormData('email', text)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      backgroundColor="$backgroundStrong"
                      borderColor={errors.email ? '$red9' : '$borderColor'}
                    />
                    {errors.email && (
                      <Text color="$red9" fontSize="$2">{errors.email}</Text>
                    )}
                  </YStack>

                  <YStack space="$1">
                    <Input
                      placeholder="Password"
                      value={formData.password}
                      onChangeText={(text: string) => updateFormData('password', text)}
                      secureTextEntry
                      backgroundColor="$backgroundStrong"
                      borderColor={errors.password ? '$red9' : '$borderColor'}
                    />
                    {errors.password && (
                      <Text color="$red9" fontSize="$2">{errors.password}</Text>
                    )}
                  </YStack>

                  <YStack space="$1">
                    <Input
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChangeText={(text: string) => updateFormData('confirmPassword', text)}
                      secureTextEntry
                      backgroundColor="$backgroundStrong"
                      borderColor={errors.confirmPassword ? '$red9' : '$borderColor'}
                    />
                    {errors.confirmPassword && (
                      <Text color="$red9" fontSize="$2">{errors.confirmPassword}</Text>
                    )}
                  </YStack>

                  {error && (
                    <Text color="$red9" fontSize="$3" textAlign="center">
                      {error}
                    </Text>
                  )}

                  <Button
                    onPress={handleSignUp}
                    disabled={isLoading}
                    backgroundColor="$green9"
                    color="white"
                    pressStyle={{ backgroundColor: '$green10' }}
                    height="$5"
                  >
                    {isLoading ? (
                      <Spinner color="white" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </YStack>
              </Form>

              <XStack justifyContent="center" space="$2">
                <Text color="$gray11">Already have an account?</Text>
                <Link href="/auth/sign-in" asChild>
                  <Text color="$green9" textDecorationLine="underline">
                    Sign in
                  </Text>
                </Link>
              </XStack>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </RouteGuard>
  )
}