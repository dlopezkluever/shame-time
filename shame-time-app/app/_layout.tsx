import { Slot, Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, Globe, Users, User } from '@tamagui/lucide-icons';
import { TamaguiProvider } from '../providers/TamaguiProvider';
import { AuthProvider } from '../providers/AuthProvider';

export default function RootLayout() {
  return (
    <TamaguiProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#0F0F0F" />
        <Tabs
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#0F0F0F',
              borderTopColor: '#333333',
              borderTopWidth: 1,
              height: 60,
            },
            tabBarActiveTintColor: '#6CC4A1',
            tabBarInactiveTintColor: '#757575',
            tabBarLabelStyle: {
              fontSize: 12,
              fontFamily: 'Inter',
              fontWeight: '500',
            },
            headerStyle: {
              backgroundColor: '#0F0F0F',
            },
            headerTintColor: '#F5F5F5',
            headerTitleStyle: {
              fontFamily: 'Inter',
              fontWeight: '600',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Home color={color} size={size} />
              ),
              headerTitle: 'Personal Dashboard',
            }}
          />
          <Tabs.Screen
            name="global"
            options={{
              title: 'Global Stats',
              tabBarIcon: ({ color, size }) => (
                <Globe color={color} size={size} />
              ),
              headerTitle: 'Global & Regional Stats',
            }}
          />
          <Tabs.Screen
            name="groups"
            options={{
              title: 'Groups',
              tabBarIcon: ({ color, size }) => (
                <Users color={color} size={size} />
              ),
              headerTitle: 'Group View',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <User color={color} size={size} />
              ),
              headerTitle: 'Profile & Settings',
            }}
          />
          <Tabs.Screen
            name="auth"
            options={{
              href: null, // Hide from tabs
            }}
          />
        </Tabs>
      </AuthProvider>
    </TamaguiProvider>
  );
}