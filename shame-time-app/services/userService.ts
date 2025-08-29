import { supabase } from './supabase'
import { User, UserInsert, UserUpdate } from '../types/database'

export class UserService {
  /**
   * Get the current authenticated user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      // Get the user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Create or update user profile after authentication
   */
  static async upsertUserProfile(userProfile: UserInsert): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userProfile, {
          onConflict: 'id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error upserting user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: UserUpdate): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  /**
   * Get user by ID (for viewing friends' profiles)
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }
  }

  /**
   * Search users by name or email (for adding friends)
   */
  static async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .or(`name.ilike.%${query}%, email.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(limit)

      if (error) {
        console.error('Error searching users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  /**
   * Get users in a specific group
   */
  static async getUsersInGroup(groupId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          users (
            id,
            name,
            email,
            avatar_url,
            privacy_level
          )
        `)
        .eq('group_id', groupId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching group users:', error)
        return []
      }

      // Extract users from the joined data
      return data?.map(item => item.users).filter(Boolean) as User[] || []
    } catch (error) {
      console.error('Error fetching group users:', error)
      return []
    }
  }

  /**
   * Update user privacy settings
   */
  static async updatePrivacySettings(
    userId: string, 
    privacyLevel: 'friends_only' | 'private'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ privacy_level: privacyLevel })
        .eq('id', userId)

      if (error) {
        console.error('Error updating privacy settings:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      return false
    }
  }

  /**
   * Delete user account (soft delete by marking as inactive)
   */
  static async deactivateUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)

      if (error) {
        console.error('Error deactivating user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deactivating user:', error)
      return false
    }
  }
}