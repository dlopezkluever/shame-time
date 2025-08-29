import React from 'react';
import { ScrollView } from 'react-native';
import { View } from '@tamagui/core';
import { H2, H3 } from '@tamagui/text';
import { Text } from '@tamagui/core';
import { Card } from '@tamagui/card';
import { XStack, YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Clock, TrendingDown, Target, Calendar } from '@tamagui/lucide-icons';

export default function PersonalDashboard() {
  return (
    <View flex={1} backgroundColor="$background">
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
                color="#6CC4A1"
                lineHeight={80}
              >
                42
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
                5h 23m
              </Text>
              <Text color="$placeholderColor" fontSize="$3">
                +32m from yesterday
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
                3
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
                7
              </Text>
              <Text color="$placeholderColor" fontSize="$2" textAlign="center">
                Day Streak
              </Text>
            </YStack>
          </Card>
        </XStack>
      </ScrollView>
    </View>
  );
}