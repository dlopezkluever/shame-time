import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { View } from '@tamagui/core';
import { H2, H3 } from '@tamagui/text';
import { Text } from '@tamagui/core';
import { Card } from '@tamagui/card';
import { XStack, YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Spinner } from 'tamagui';
import { Clock, TrendingDown, Target, Calendar, LogOut } from '@tamagui/lucide-icons';
import { RouteGuard } from '../components/common/RouteGuard';
import { useAuthStore } from '../store/authStore';
import { UserService } from '../services/userService';
import { AppUsageService } from '../services/appUsageService';

export default function PersonalDashboard() {
  const { signOut, user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>({
    shameScore: 42,
    screenTime: '5h 23m',
    screenTimeChange: '+32m',
    breaches: 3,
    dayStreak: 7,
    categories: {
      bad: '3h 45m',
      neutral: '1h 12m', 
      good: '26m'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load user profile and usage data
      const [userProfile, appUsage] = await Promise.all([
        UserService.getUserProfile(user.id),
        AppUsageService.getDailyUsage(user.id, new Date().toISOString().split('T')[0])
      ]);

      if (userProfile) {
        setDashboardData((prev: any) => ({
          ...prev,
          shameScore: userProfile.shame_score || prev.shameScore,
          dayStreak: userProfile.current_streak || prev.dayStreak
        }));
      }

      if (appUsage && appUsage.length > 0) {
        const totalScreenTime = appUsage.reduce((total: number, app: any) => total + app.usage_minutes, 0);
        const hours = Math.floor(totalScreenTime / 60);
        const minutes = totalScreenTime % 60;
        
        setDashboardData((prev: any) => ({
          ...prev,
          screenTime: `${hours}h ${minutes}m`,
          breaches: appUsage.filter((app: any) => app.breach_count > 0).length
        }));
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut()
  }

  return (
    <RouteGuard requireAuth={true}>
      <View flex={1} backgroundColor="$background">
        {/* Header with Sign Out */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          padding="$4" 
          paddingTop="$6"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <YStack>
            <H2 color="$color" fontSize="$6" fontWeight="600">
              Welcome back
            </H2>
            <Text color="$gray11" fontSize="$3">
              {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
            </Text>
          </YStack>
          <XStack space="$2">
            <Button
              onPress={loadDashboardData}
              variant="outlined"
              size="$3"
              borderColor="$green9"
              color="$green9"
              disabled={loading}
            >
              {loading ? <Spinner size="small" /> : 'Refresh'}
            </Button>
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
        </XStack>

        {/* Error Display */}
        {error && (
          <Card 
            margin="$4"
            backgroundColor="$red2" 
            borderColor="$red9"
            borderWidth={1}
            borderRadius="$6" 
            padding="$4"
          >
            <Text color="$red11" fontSize="$4" textAlign="center">
              {error}
            </Text>
            <Button 
              marginTop="$3"
              variant="outlined"
              borderColor="$red9"
              color="$red9"
              onPress={loadDashboardData}
            >
              Try Again
            </Button>
          </Card>
        )}

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        >
        {/* Shame Score Card */}
        <Card 
          backgroundColor="$cardBackground" 
          borderRadius="$6" 
          marginBottom="$4"
          padding="$4"
          borderColor="$borderColor"
          borderWidth={1}
        >
          <YStack space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H2 color="$color" fontSize="$6" fontWeight="600">
                Shame Score
              </H2>
              <Target color="#6CC4A1" size={28} />
            </XStack>
            
            {/* Large Score Display */}
            <YStack alignItems="center" space="$2">
              <Text 
                fontSize={72} 
                fontWeight="bold" 
                color={
                  dashboardData.shameScore <= 25 ? "#6CC4A1" :
                  dashboardData.shameScore <= 75 ? "#F7DC6F" : "#E55B5B"
                }
                lineHeight={80}
              >
                {loading ? "--" : dashboardData.shameScore}
              </Text>
              <Text color="$placeholderColor" fontSize="$3">
                Lower is better
              </Text>
            </YStack>
            
            {/* Score Change Indicator */}
            <XStack justifyContent="center" alignItems="center" space="$2">
              <TrendingDown color="#6CC4A1" size={20} />
              <Text color="#6CC4A1" fontSize="$4" fontWeight="500">
                -8 from yesterday
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* Total Screen Time Card */}
        <Card 
          backgroundColor="$cardBackground" 
          borderRadius="$6" 
          marginBottom="$4"
          padding="$4"
          borderColor="$borderColor"
          borderWidth={1}
        >
          <YStack space="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <H2 color="$color" fontSize="$6" fontWeight="600">
                Today's Screen Time
              </H2>
              <Clock color="#F7DC6F" size={28} />
            </XStack>
            
            <YStack alignItems="center" space="$2">
              <Text 
                fontSize={48} 
                fontWeight="bold" 
                color="#F7DC6F"
                lineHeight={56}
              >
                {loading ? "--" : dashboardData.screenTime}
              </Text>
              <Text color="$placeholderColor" fontSize="$3">
                {dashboardData.screenTimeChange} from yesterday
              </Text>
            </YStack>
          </YStack>
        </Card>

        {/* Chart Placeholder */}
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
              <H3 color="$color" fontSize="$5" fontWeight="600">
                Usage Trends
              </H3>
              <Calendar color="$placeholderColor" size={24} />
            </XStack>
            
            {/* Chart Placeholder */}
            <View 
              height={200} 
              backgroundColor="$background" 
              borderRadius="$4"
              justifyContent="center"
              alignItems="center"
              borderColor="$borderColor"
              borderWidth={1}
            >
              <Text color="$placeholderColor" fontSize="$4">
                📊 Interactive Chart
              </Text>
              <Text color="$placeholderColor" fontSize="$3" marginTop="$2">
                Coming Soon
              </Text>
            </View>
            
            {/* Time Period Selector */}
            <XStack justifyContent="center" space="$2" flexWrap="wrap">
              {['1W', '1M', '1Y', '5Y', 'All'].map((period) => (
                <Button
                  key={period}
                  size="$2"
                  variant="outlined"
                  backgroundColor={period === '1W' ? '$primary' : 'transparent'}
                  borderColor={period === '1W' ? '$primary' : '$borderColor'}
                  color={period === '1W' ? '$background' : '$color'}
                  fontSize="$2"
                  fontWeight="500"
                  minWidth={44}
                  height={44}
                >
                  {period}
                </Button>
              ))}
            </XStack>
          </YStack>
        </Card>

        {/* App Categories Breakdown */}
        <Card 
          backgroundColor="$cardBackground" 
          borderRadius="$6" 
          marginBottom="$4"
          padding="$4"
          borderColor="$borderColor"
          borderWidth={1}
        >
          <YStack space="$3">
            <H3 color="$color" fontSize="$5" fontWeight="600">
              App Categories
            </H3>
            
            <YStack space="$3">
              {/* Bad Apps */}
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" space="$3">
                  <View 
                    width={16} 
                    height={16} 
                    backgroundColor="#E55B5B" 
                    borderRadius="$2" 
                  />
                  <Text color="$color" fontSize="$4">
                    Social Media & Entertainment
                  </Text>
                </XStack>
                <Text color="#E55B5B" fontSize="$4" fontWeight="600">
                  3h 45m
                </Text>
              </XStack>
              
              {/* Neutral Apps */}
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" space="$3">
                  <View 
                    width={16} 
                    height={16} 
                    backgroundColor="#F7DC6F" 
                    borderRadius="$2" 
                  />
                  <Text color="$color" fontSize="$4">
                    Neutral
                  </Text>
                </XStack>
                <Text color="#F7DC6F" fontSize="$4" fontWeight="600">
                  1h 12m
                </Text>
              </XStack>
              
              {/* Good Apps */}
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" space="$3">
                  <View 
                    width={16} 
                    height={16} 
                    backgroundColor="#6CC4A1" 
                    borderRadius="$2" 
                  />
                  <Text color="$color" fontSize="$4">
                    Educational & Productivity
                  </Text>
                </XStack>
                <Text color="#6CC4A1" fontSize="$4" fontWeight="600">
                  26m
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </Card>

        {/* Quick Stats */}
        <XStack space="$3" marginBottom="$4">
          <Card 
            flex={1}
            backgroundColor="$cardBackground" 
            borderRadius="$6" 
            padding="$3"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <YStack space="$2" alignItems="center">
              <Text color="#E55B5B" fontSize="$6" fontWeight="bold">
                {loading ? "--" : dashboardData.breaches}
              </Text>
              <Text color="$placeholderColor" fontSize="$2" textAlign="center">
                Breaches Today
              </Text>
            </YStack>
          </Card>
          
          <Card 
            flex={1}
            backgroundColor="$cardBackground" 
            borderRadius="$6" 
            padding="$3"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <YStack space="$2" alignItems="center">
              <Text color="#6CC4A1" fontSize="$6" fontWeight="bold">
                {loading ? "--" : dashboardData.dayStreak}
              </Text>
              <Text color="$placeholderColor" fontSize="$2" textAlign="center">
                Day Streak
              </Text>
            </YStack>
          </Card>
        </XStack>
        </ScrollView>
      </View>
    </RouteGuard>
  );
}