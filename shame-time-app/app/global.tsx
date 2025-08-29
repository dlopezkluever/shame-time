import React from 'react';
import { ScrollView } from 'react-native';
import { View } from '@tamagui/core';
import { H2, H3 } from '@tamagui/text';
import { Text } from '@tamagui/core';
import { Card } from '@tamagui/card';
import { XStack, YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Globe, Trophy, TrendingUp, MapPin } from '@tamagui/lucide-icons';

export default function GlobalStats() {
  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
      >
        {/* Your Global Rank */}
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
                Your Global Ranking
              </H2>
              <Globe color="#6CC4A1" size={28} />
            </XStack>
            
            {/* Percentile Display */}
            <YStack alignItems="center" space="$2">
              <Text 
                fontSize={48} 
                fontWeight="bold" 
                color="#6CC4A1"
                lineHeight={56}
              >
                Top 15%
              </Text>
              <Text color="$placeholderColor" fontSize="$3">
                Better than 85% of users
              </Text>
            </YStack>
            
            {/* Regional Breakdown */}
            <YStack space="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color" fontSize="$4">
                  🌍 Global
                </Text>
                <Text color="#6CC4A1" fontSize="$4" fontWeight="600">
                  15th percentile
                </Text>
              </XStack>
              
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color" fontSize="$4">
                  🇺🇸 United States
                </Text>
                <Text color="#6CC4A1" fontSize="$4" fontWeight="600">
                  12th percentile
                </Text>
              </XStack>
              
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color" fontSize="$4">
                  🏙️ New York
                </Text>
                <Text color="#6CC4A1" fontSize="$4" fontWeight="600">
                  8th percentile
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </Card>

        {/* Top Improvers */}
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
                Top Improvers This Week
              </H3>
              <TrendingUp color="#6CC4A1" size={24} />
            </XStack>
            
            <YStack space="$3">
              {[
                { name: 'Sarah M.', improvement: '-42 points', region: '🇨🇦 Canada' },
                { name: 'Alex K.', improvement: '-38 points', region: '🇬🇧 UK' },
                { name: 'Jordan P.', improvement: '-35 points', region: '🇦🇺 Australia' },
                { name: 'Maya T.', improvement: '-31 points', region: '🇺🇸 USA' },
                { name: 'Chris L.', improvement: '-28 points', region: '🇩🇪 Germany' },
              ].map((user, index) => (
                <XStack key={index} justifyContent="space-between" alignItems="center">
                  <XStack alignItems="center" space="$3">
                    <Text color="#F7DC6F" fontSize="$4" fontWeight="bold" minWidth={20}>
                      #{index + 1}
                    </Text>
                    <YStack>
                      <Text color="$color" fontSize="$4" fontWeight="500">
                        {user.name}
                      </Text>
                      <Text color="$placeholderColor" fontSize="$2">
                        {user.region}
                      </Text>
                    </YStack>
                  </XStack>
                  <Text color="#6CC4A1" fontSize="$4" fontWeight="600">
                    {user.improvement}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </YStack>
        </Card>

        {/* Global Stats Overview */}
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
                Global Overview
              </H3>
              <Trophy color="#F7DC6F" size={24} />
            </XStack>
            
            <YStack space="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color" fontSize="$4">
                  Total Users
                </Text>
                <Text color="$color" fontSize="$4" fontWeight="600">
                  2.4M+
                </Text>
              </XStack>
              
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color" fontSize="$4">
                  Average Shame Score
                </Text>
                <Text color="#F7DC6F" fontSize="$4" fontWeight="600">
                  68 points
                </Text>
              </XStack>
              
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color" fontSize="$4">
                  Average Screen Time
                </Text>
                <Text color="#F7DC6F" fontSize="$4" fontWeight="600">
                  7h 12m/day
                </Text>
              </XStack>
              
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$color" fontSize="$4">
                  Best Performing Country
                </Text>
                <Text color="#6CC4A1" fontSize="$4" fontWeight="600">
                  🇯🇵 Japan
                </Text>
              </XStack>
            </YStack>
          </YStack>
        </Card>

        {/* Regional Comparison */}
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
                Regional Comparison
              </H3>
              <MapPin color="$placeholderColor" size={24} />
            </XStack>
            
            {/* Map Placeholder */}
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
                🗺️ Interactive World Map
              </Text>
              <Text color="$placeholderColor" fontSize="$3" marginTop="$2">
                Coming Soon
              </Text>
            </View>
            
            {/* Region Selector */}
            <XStack justifyContent="center" space="$2" flexWrap="wrap">
              {['Global', 'Americas', 'Europe', 'Asia', 'Oceania'].map((region) => (
                <Button
                  key={region}
                  size="$2"
                  variant="outlined"
                  backgroundColor={region === 'Global' ? '$primary' : 'transparent'}
                  borderColor={region === 'Global' ? '$primary' : '$borderColor'}
                  color={region === 'Global' ? '$background' : '$color'}
                  fontSize="$2"
                  fontWeight="500"
                  minWidth={44}
                  height={44}
                >
                  {region}
                </Button>
              ))}
            </XStack>
          </YStack>
        </Card>

        {/* Personal vs Global */}
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
              <Text color="$color" fontSize="$5" fontWeight="bold">
                42
              </Text>
              <Text color="$placeholderColor" fontSize="$2" textAlign="center">
                Your Score
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
              <Text color="#F7DC6F" fontSize="$5" fontWeight="bold">
                68
              </Text>
              <Text color="$placeholderColor" fontSize="$2" textAlign="center">
                Global Average
              </Text>
            </YStack>
          </Card>
        </XStack>
      </ScrollView>
    </View>
  );
}