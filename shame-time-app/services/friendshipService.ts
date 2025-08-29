import { supabase } from './supabase'
import { Friendship, FriendshipInsert, User } from '../types/database'

export class FriendshipService {
  /**
   * Send a friend request
   */
  static async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship | null> {
    try {
      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),` +
          `and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`
        )
        .single()

      if (existing) {
        console.log('Friendship already exists')
        return existing
      }

      const friendshipData: FriendshipInsert = {
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert(friendshipData)
        .select()
        .single()

      if (error) {
        console.error('Error sending friend request:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error sending friend request:', error)
      return null
    }
  }

  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)

      if (error) {
        console.error('Error accepting friend request:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error accepting friend request:', error)
      return false
    }
  }

  /**
   * Decline a friend request
   */
  static async declineFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', friendshipId)

      if (error) {
        console.error('Error declining friend request:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error declining friend request:', error)
      return false
    }
  }

  /**
   * Block a user
   */
  static async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      // First, update any existing friendship to blocked
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${userId},addressee_id.eq.${blockedUserId}),` +
          `and(requester_id.eq.${blockedUserId},addressee_id.eq.${userId})`
        )
        .single()

      if (existing) {
        const { error } = await supabase
          .from('friendships')
          .update({ status: 'blocked' })
          .eq('id', existing.id)

        return !error
      } else {
        // Create new blocked relationship
        const { error } = await supabase
          .from('friendships')
          .insert({
            requester_id: userId,
            addressee_id: blockedUserId,
            status: 'blocked'
          })

        return !error
      }
    } catch (error) {
      console.error('Error blocking user:', error)
      return false
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(userId: string, unblockedUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(
          `and(requester_id.eq.${userId},addressee_id.eq.${unblockedUserId}),` +
          `and(requester_id.eq.${unblockedUserId},addressee_id.eq.${userId})`
        )
        .eq('status', 'blocked')

      if (error) {
        console.error('Error unblocking user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error unblocking user:', error)
      return false
    }
  }

  /**
   * Remove friendship
   */
  static async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(
          `and(requester_id.eq.${userId},addressee_id.eq.${friendId}),` +
          `and(requester_id.eq.${friendId},addressee_id.eq.${userId})`
        )
        .eq('status', 'accepted')

      if (error) {
        console.error('Error removing friend:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error removing friend:', error)
      return false
    }
  }

  /**
   * Get user's friends
   */
  static async getUserFriends(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          requester_id,
          addressee_id,
          requester:users!friendships_requester_id_fkey (
            id, name, email, avatar_url, privacy_level
          ),
          addressee:users!friendships_addressee_id_fkey (
            id, name, email, avatar_url, privacy_level
          )
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (error) {
        console.error('Error fetching friends:', error)
        return []
      }

      // Extract friend data (the user who is NOT the current user)
      const friends: User[] = data?.map(friendship => {
        if (friendship.requester_id === userId) {
          return friendship.addressee as User
        } else {
          return friendship.requester as User
        }
      }).filter(Boolean) || []

      return friends
    } catch (error) {
      console.error('Error fetching friends:', error)
      return []
    }
  }

  /**
   * Get pending friend requests (incoming)
   */
  static async getPendingRequests(userId: string): Promise<(Friendship & { requester: User })[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:users!friendships_requester_id_fkey (
            id, name, email, avatar_url
          )
        `)
        .eq('addressee_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending requests:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching pending requests:', error)
      return []
    }
  }

  /**
   * Get sent friend requests (outgoing)
   */
  static async getSentRequests(userId: string): Promise<(Friendship & { addressee: User })[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          addressee:users!friendships_addressee_id_fkey (
            id, name, email, avatar_url
          )
        `)
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching sent requests:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching sent requests:', error)
      return []
    }
  }

  /**
   * Get blocked users
   */
  static async getBlockedUsers(userId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          requester_id,
          addressee_id,
          requester:users!friendships_requester_id_fkey (
            id, name, email, avatar_url
          ),
          addressee:users!friendships_addressee_id_fkey (
            id, name, email, avatar_url
          )
        `)
        .eq('requester_id', userId)
        .eq('status', 'blocked')

      if (error) {
        console.error('Error fetching blocked users:', error)
        return []
      }

      // Return the addressee (blocked user)
      return data?.map(friendship => friendship.addressee as User).filter(Boolean) || []
    } catch (error) {
      console.error('Error fetching blocked users:', error)
      return []
    }
  }

  /**
   * Check friendship status between two users
   */
  static async getFriendshipStatus(userId1: string, userId2: string): Promise<{
    status: 'none' | 'pending' | 'accepted' | 'declined' | 'blocked'
    isRequester: boolean
    friendshipId?: string
  }> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(
          `and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),` +
          `and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`
        )
        .single()

      if (error || !data) {
        return { status: 'none', isRequester: false }
      }

      return {
        status: data.status as any,
        isRequester: data.requester_id === userId1,
        friendshipId: data.id
      }
    } catch (error) {
      console.error('Error checking friendship status:', error)
      return { status: 'none', isRequester: false }
    }
  }

  /**
   * Cancel sent friend request
   */
  static async cancelFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)
        .eq('status', 'pending')

      if (error) {
        console.error('Error canceling friend request:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error canceling friend request:', error)
      return false
    }
  }
}