import { Tabs } from 'expo-router';
import { View } from '@tamagui/core';
import { Home, Globe, Users } from '@tamagui/lucide-icons';

export default function TabLayout() {
  return (
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
    </Tabs>
  );
}