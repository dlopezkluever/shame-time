import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { View } from '@tamagui/core';
import { H2, H3 } from '@tamagui/text';
import { Text } from '@tamagui/core';
import { Card } from '@tamagui/card';
import { XStack, YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Input, Separator, Switch } from 'tamagui';
import { 
  User, 
  Settings, 
  Eye, 
  EyeOff, 
  Shield, 
  Bell, 
  Smartphone,
  LogOut,
  Save 
} from '@tamagui/lucide-icons';
import { RouteGuard } from '../components/common/RouteGuard';
import { useAuthStore } from '../store/authStore';
import { AuthService } from '../services/authService';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || ''
  });

  const [settings, setSettings] = useState({
    privacyLevel: 'full', // 'full' | 'limited'
    notifications: true,
    screenTimeSharing: true,
    appCategorySharing: true
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const result = await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (result.success) {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <RouteGuard requireAuth={true}>
      <View flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          padding="$4" 
          paddingTop="$6"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <H2 color="$color" fontSize="$6" fontWeight="600">
            Profile & Settings
          </H2>
          <Button
            onPress={handleSignOut}
            variant="outlined"
            size="$3"
            borderColor="$red9"
            color="$red9"
            icon={<LogOut size={16} />}
          >
            Sign Out
          </Button>
        </XStack>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        >
          {/* Profile Information */}
          <Card 
            backgroundColor="$cardBackground" 
            borderRadius="$6" 
            marginBottom="$4"
            padding="$4"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <YStack space="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" space="$3">
                  <User color="$color" size={24} />
                  <H3 color="$color" fontSize="$5" fontWeight="600">
                    Profile Information
                  </H3>
                </XStack>
                <Button
                  onPress={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outlined" : "text"}
                  size="$3"
                  color="$green9"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </XStack>

              <YStack space="$3">
                <XStack space="$3">
                  <YStack flex={1} space="$2">
                    <Text color="$gray11" fontSize="$3">First Name</Text>
                    {isEditing ? (
                      <Input
                        value={formData.firstName}
                        onChangeText={(text: string) => setFormData(prev => ({ ...prev, firstName: text }))}
                        backgroundColor="$backgroundStrong"
                      />
                    ) : (
                      <Text color="$color" fontSize="$4">{formData.firstName || 'Not set'}</Text>
                    )}
                  </YStack>
                  
                  <YStack flex={1} space="$2">
                    <Text color="$gray11" fontSize="$3">Last Name</Text>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChangeText={(text: string) => setFormData(prev => ({ ...prev, lastName: text }))}
                        backgroundColor="$backgroundStrong"
                      />
                    ) : (
                      <Text color="$color" fontSize="$4">{formData.lastName || 'Not set'}</Text>
                    )}
                  </YStack>
                </XStack>

                <YStack space="$2">
                  <Text color="$gray11" fontSize="$3">Email</Text>
                  <Text color="$color" fontSize="$4">{formData.email}</Text>
                </YStack>

                {isEditing && (
                  <Button
                    onPress={handleSaveProfile}
                    disabled={loading}
                    backgroundColor="$green9"
                    color="white"
                    icon={<Save size={16} />}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </YStack>
            </YStack>
          </Card>

          {/* Privacy Settings */}
          <Card 
            backgroundColor="$cardBackground" 
            borderRadius="$6" 
            marginBottom="$4"
            padding="$4"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <YStack space="$4">
              <XStack alignItems="center" space="$3">
                <Shield color="$color" size={24} />
                <H3 color="$color" fontSize="$5" fontWeight="600">
                  Privacy Settings
                </H3>
              </XStack>

              <YStack space="$4">
                <YStack space="$2">
                  <Text color="$color" fontSize="$4" fontWeight="500">Privacy Level</Text>
                  <Text color="$gray11" fontSize="$3">
                    Control how much information friends can see about your screen time
                  </Text>
                  
                  <XStack space="$2" marginTop="$2">
                    <Button
                      flex={1}
                      variant="outlined"
                      backgroundColor={settings.privacyLevel === 'full' ? '$green9' : 'transparent'}
                      borderColor={settings.privacyLevel === 'full' ? '$green9' : '$borderColor'}
                      color={settings.privacyLevel === 'full' ? 'white' : '$color'}
                      onPress={() => setSettings(prev => ({ ...prev, privacyLevel: 'full' }))}
                      icon={<Eye size={16} />}
                    >
                      Full Access
                    </Button>
                    <Button
                      flex={1}
                      variant="outlined"
                      backgroundColor={settings.privacyLevel === 'limited' ? '$yellow9' : 'transparent'}
                      borderColor={settings.privacyLevel === 'limited' ? '$yellow9' : '$borderColor'}
                      color={settings.privacyLevel === 'limited' ? 'black' : '$color'}
                      onPress={() => setSettings(prev => ({ ...prev, privacyLevel: 'limited' }))}
                      icon={<EyeOff size={16} />}
                    >
                      Limited Access
                    </Button>
                  </XStack>
                </YStack>

                <Separator />

                <YStack space="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <Text color="$color" fontSize="$4">Screen Time Sharing</Text>
                      <Text color="$gray11" fontSize="$3">Allow friends to see your detailed screen time</Text>
                    </YStack>
                    <Switch
                      checked={settings.screenTimeSharing}
                      onCheckedChange={(checked: boolean) => setSettings(prev => ({ ...prev, screenTimeSharing: checked }))}
                    />
                  </XStack>

                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <Text color="$color" fontSize="$4">App Category Sharing</Text>
                      <Text color="$gray11" fontSize="$3">Share which app categories you use most</Text>
                    </YStack>
                    <Switch
                      checked={settings.appCategorySharing}
                      onCheckedChange={(checked: boolean) => setSettings(prev => ({ ...prev, appCategorySharing: checked }))}
                    />
                  </XStack>
                </YStack>
              </YStack>
            </YStack>
          </Card>

          {/* Notification Settings */}
          <Card 
            backgroundColor="$cardBackground" 
            borderRadius="$6" 
            marginBottom="$4"
            padding="$4"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <YStack space="$4">
              <XStack alignItems="center" space="$3">
                <Bell color="$color" size={24} />
                <H3 color="$color" fontSize="$5" fontWeight="600">
                  Notifications
                </H3>
              </XStack>

              <XStack justifyContent="space-between" alignItems="center">
                <YStack flex={1}>
                  <Text color="$color" fontSize="$4">Push Notifications</Text>
                  <Text color="$gray11" fontSize="$3">Receive shame reminders and group updates</Text>
                </YStack>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked: boolean) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </XStack>
            </YStack>
          </Card>

          {/* App Integration */}
          <Card 
            backgroundColor="$cardBackground" 
            borderRadius="$6" 
            marginBottom="$4"
            padding="$4"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <YStack space="$4">
              <XStack alignItems="center" space="$3">
                <Smartphone color="$color" size={24} />
                <H3 color="$color" fontSize="$5" fontWeight="600">
                  Screen Time Integration
                </H3>
              </XStack>

              <YStack space="$3">
                <Text color="$gray11" fontSize="$3">
                  Connect with your device's screen time tracking to automatically sync your usage data.
                </Text>
                
                <Button
                  variant="outlined"
                  borderColor="$green9"
                  color="$green9"
                >
                  Enable Screen Time Access
                </Button>
              </YStack>
            </YStack>
          </Card>

          {/* Account Actions */}
          <Card 
            backgroundColor="$cardBackground" 
            borderRadius="$6" 
            marginBottom="$4"
            padding="$4"
            borderColor="$red9"
            borderWidth={1}
          >
            <YStack space="$3">
              <H3 color="$red9" fontSize="$5" fontWeight="600">
                Account Actions
              </H3>
              
              <YStack space="$2">
                <Button
                  variant="outlined"
                  borderColor="$red9"
                  color="$red9"
                >
                  Reset Password
                </Button>
                
                <Button
                  variant="outlined"
                  borderColor="$red9"
                  color="$red9"
                >
                  Delete Account
                </Button>
              </YStack>
            </YStack>
          </Card>
        </ScrollView>
      </View>
    </RouteGuard>
  );
}