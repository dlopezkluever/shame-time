import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { View } from '@tamagui/core';
import { H2, H3 } from '@tamagui/text';
import { Text } from '@tamagui/core';
import { Card } from '@tamagui/card';
import { XStack, YStack } from '@tamagui/stacks';
import { Button } from '@tamagui/button';
import { Spinner } from 'tamagui';
import { Users, Crown, MessageCircle, Plus, Trophy, Zap } from '@tamagui/lucide-icons';
import { RouteGuard } from '../components/common/RouteGuard';
import { GroupService } from '../services/groupService';
import { useAuthStore } from '../store/authStore';

export default function GroupView() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'shameboard'>('leaderboard');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    loadUserGroups();
  }, [user]);

  const loadUserGroups = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const userGroups = await GroupService.getUserGroups(user.id);
      setGroups(userGroups || []);
    } catch (err) {
      setError('Failed to load groups');
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback for development
  const mockGroups = [
    { 
      id: 1,
      name: 'Fam-o', 
      members: 5, 
      isAdmin: true, 
      shamePool: 50,
      period: '12 days left' 
    },
    { 
      id: 2,
      name: 'mental-health-queens', 
      members: 8, 
      isAdmin: false, 
      shamePool: 0,
      period: '5 days left' 
    },
    { 
      id: 3,
      name: 'Work Squad', 
      members: 12, 
      isAdmin: false, 
      shamePool: 120,
      period: '18 days left' 
    },
  ];

  const displayGroups = groups.length > 0 ? groups : mockGroups;

  if (loading) {
    return (
      <RouteGuard requireAuth={true}>
        <View flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
          <Spinner size="large" color="$color" />
          <Text marginTop="$4" color="$color">Loading groups...</Text>
        </View>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requireAuth={true}>
      <View flex={1} backgroundColor="$background">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
      >
        {/* Create New Group Button */}
        <Button
          backgroundColor="$primary"
          borderRadius="$6"
          marginBottom="$4"
          height={60}
          fontSize="$4"
          fontWeight="600"
          icon={<Plus color="$background" size={24} />}
          color="$background"
        >
          Create New Group
        </Button>

        {/* Error Display */}
        {error && (
          <Card 
            backgroundColor="$red2" 
            borderColor="$red9"
            borderWidth={1}
            borderRadius="$6" 
            marginBottom="$4"
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
              onPress={loadUserGroups}
            >
              Try Again
            </Button>
          </Card>
        )}

        {/* Active Groups List */}
        <YStack space="$4" marginBottom="$4">
          {displayGroups.map((group, index) => (
            <Card 
              key={index}
              backgroundColor="$cardBackground" 
              borderRadius="$6" 
              padding="$4"
              borderColor="$borderColor"
              borderWidth={1}
              pressStyle={{ opacity: 0.8 }}
              cursor="pointer"
            >
              <YStack space="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack alignItems="center" space="$3">
                    <Users color="$color" size={24} />
                    <YStack>
                      <XStack alignItems="center" space="$2">
                        <H3 color="$color" fontSize="$5" fontWeight="600">
                          {group.name}
                        </H3>
                        {group.isAdmin && (
                          <Crown color="#F7DC6F" size={18} />
                        )}
                      </XStack>
                      <Text color="$placeholderColor" fontSize="$3">
                        {group.members} members • {group.period}
                      </Text>
                    </YStack>
                  </XStack>
                  
                  {group.shamePool > 0 && (
                    <YStack alignItems="flex-end">
                      <Text color="#6CC4A1" fontSize="$4" fontWeight="600">
                        ${group.shamePool}
                      </Text>
                      <Text color="$placeholderColor" fontSize="$2">
                        Shame Pool
                      </Text>
                    </YStack>
                  )}
                </XStack>
                
                {/* Quick Actions */}
                <XStack space="$2">
                  <Button 
                    flex={1}
                    variant="outlined" 
                    borderColor="$borderColor"
                    color="$color"
                    size="$3"
                    fontSize="$3"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="$3"
                    color="$placeholderColor"
                    icon={<MessageCircle size={18} />}
                  />
                </XStack>
              </YStack>
            </Card>
          ))}
        </YStack>

        {/* Sample Group Detail View - "Fam-o" */}
        <Card 
          backgroundColor="$cardBackground" 
          borderRadius="$6" 
          marginBottom="$4"
          padding="$4"
          borderColor="$primary"
          borderWidth={2}
        >
          <YStack space="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <XStack alignItems="center" space="$3">
                <H2 color="$color" fontSize="$6" fontWeight="600">
                  Fam-o
                </H2>
                <Crown color="#F7DC6F" size={24} />
              </XStack>
              <YStack alignItems="flex-end">
                <Text color="#6CC4A1" fontSize="$5" fontWeight="bold">
                  $50
                </Text>
                <Text color="$placeholderColor" fontSize="$2">
                  Prize Pool
                </Text>
              </YStack>
            </XStack>

            {/* Competition Period */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text color="$placeholderColor" fontSize="$4">
                Competition ends in 12 days
              </Text>
              <Text color="#F7DC6F" fontSize="$4" fontWeight="500">
                Monthly Challenge
              </Text>
            </XStack>

            {/* Leaderboard/Shameboard Toggle */}
            <XStack backgroundColor="$background" borderRadius="$4" padding="$1">
              <Button
                flex={1}
                variant="outlined"
                backgroundColor={activeTab === 'leaderboard' ? '$primary' : 'transparent'}
                borderColor={activeTab === 'leaderboard' ? '$primary' : 'transparent'}
                color={activeTab === 'leaderboard' ? '$background' : '$color'}
                size="$3"
                fontSize="$3"
                fontWeight="500"
                onPress={() => setActiveTab('leaderboard')}
                icon={<Trophy size={16} />}
              >
                Leaderboard
              </Button>
              <Button
                flex={1}
                variant="outlined"
                backgroundColor={activeTab === 'shameboard' ? '$danger' : 'transparent'}
                borderColor={activeTab === 'shameboard' ? '$danger' : 'transparent'}
                color={activeTab === 'shameboard' ? 'white' : '$color'}
                size="$3"
                fontSize="$3"
                fontWeight="500"
                onPress={() => setActiveTab('shameboard')}
                icon={<Zap size={16} />}
              >
                Shameboard
              </Button>
            </XStack>

            {/* User Rankings */}
            <YStack space="$3">
              {activeTab === 'leaderboard' ? (
                // Leaderboard - Best performers
                <>
                  {[
                    { name: 'Mom', score: 32, screenTime: '4h 12m', change: -5, rank: 1 },
                    { name: 'You', score: 42, screenTime: '5h 23m', change: -8, rank: 2 },
                    { name: 'Sarah', score: 55, screenTime: '6h 45m', change: +2, rank: 3 },
                    { name: 'Dad', score: 78, screenTime: '8h 01m', change: +12, rank: 4 },
                    { name: 'Jake', score: 92, screenTime: '9h 33m', change: +18, rank: 5 },
                  ].map((user, index) => (
                    <XStack key={index} justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" space="$3">
                        <View
                          minWidth={32}
                          height={32}
                          backgroundColor={
                            user.rank === 1 ? '#FFD700' : 
                            user.rank === 2 ? '#C0C0C0' : 
                            user.rank === 3 ? '#CD7F32' : '$background'
                          }
                          borderRadius="$8"
                          justifyContent="center"
                          alignItems="center"
                          borderWidth={user.rank > 3 ? 1 : 0}
                          borderColor="$borderColor"
                        >
                          <Text 
                            color={user.rank <= 3 ? 'black' : '$color'} 
                            fontSize="$3" 
                            fontWeight="bold"
                          >
                            #{user.rank}
                          </Text>
                        </View>
                        <YStack>
                          <Text 
                            color={user.name === 'You' ? '$primary' : '$color'} 
                            fontSize="$4" 
                            fontWeight={user.name === 'You' ? '600' : '500'}
                          >
                            {user.name}
                          </Text>
                          <Text color="$placeholderColor" fontSize="$2">
                            Score: {user.score} • {user.screenTime}
                          </Text>
                        </YStack>
                      </XStack>
                      <XStack alignItems="center" space="$2">
                        <Text 
                          color={user.change < 0 ? '#6CC4A1' : '#E55B5B'} 
                          fontSize="$3" 
                          fontWeight="500"
                        >
                          {user.change > 0 ? '+' : ''}{user.change}
                        </Text>
                        <Button 
                          variant="outlined" 
                          size="$2"
                          color="$placeholderColor"
                          icon={<MessageCircle size={16} />}
                        />
                      </XStack>
                    </XStack>
                  ))}
                </>
              ) : (
                // Shameboard - Worst performers
                <>
                  {[
                    { name: 'Jake', score: 92, screenTime: '9h 33m', change: +18, rank: 1 },
                    { name: 'Dad', score: 78, screenTime: '8h 01m', change: +12, rank: 2 },
                    { name: 'Sarah', score: 55, screenTime: '6h 45m', change: +2, rank: 3 },
                    { name: 'You', score: 42, screenTime: '5h 23m', change: -8, rank: 4 },
                    { name: 'Mom', score: 32, screenTime: '4h 12m', change: -5, rank: 5 },
                  ].map((user, index) => (
                    <XStack key={index} justifyContent="space-between" alignItems="center">
                      <XStack alignItems="center" space="$3">
                        <View
                          minWidth={32}
                          height={32}
                          backgroundColor={
                            user.rank === 1 ? '#E55B5B' : 
                            user.rank === 2 ? '#F39C12' : 
                            user.rank === 3 ? '#F7DC6F' : '$background'
                          }
                          borderRadius="$8"
                          justifyContent="center"
                          alignItems="center"
                          borderWidth={user.rank > 3 ? 1 : 0}
                          borderColor="$borderColor"
                        >
                          <Text 
                            color={user.rank <= 3 ? 'black' : '$color'} 
                            fontSize="$3" 
                            fontWeight="bold"
                          >
                            #{user.rank}
                          </Text>
                        </View>
                        <YStack>
                          <Text 
                            color={user.name === 'You' ? '$primary' : '$color'} 
                            fontSize="$4" 
                            fontWeight={user.name === 'You' ? '600' : '500'}
                          >
                            {user.name}
                          </Text>
                          <Text color="$placeholderColor" fontSize="$2">
                            Score: {user.score} • {user.screenTime}
                          </Text>
                        </YStack>
                      </XStack>
                      <XStack alignItems="center" space="$2">
                        <Text 
                          color={user.change < 0 ? '#6CC4A1' : '#E55B5B'} 
                          fontSize="$3" 
                          fontWeight="500"
                        >
                          {user.change > 0 ? '+' : ''}{user.change}
                        </Text>
                        <Button 
                          variant="outlined" 
                          size="$2"
                          color="$placeholderColor"
                          icon={<MessageCircle size={16} />}
                        />
                      </XStack>
                    </XStack>
                  ))}
                </>
              )}
            </YStack>
          </YStack>
        </Card>
        </ScrollView>
      </View>
    </RouteGuard>
  );
}