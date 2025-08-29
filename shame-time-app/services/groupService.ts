import { supabase } from './supabase'
import { Group, GroupInsert, GroupUpdate, GroupMember, GroupMemberInsert } from '../types/database'

export class GroupService {
  /**
   * Create a new group
   */
  static async createGroup(groupData: GroupInsert): Promise<Group | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single()

      if (error) {
        console.error('Error creating group:', error)
        return null
      }

      // Add the creator as admin member
      if (data) {
        await this.addGroupMember({
          user_id: groupData.admin_id,
          group_id: data.id,
          role: 'admin'
        })
      }

      return data
    } catch (error) {
      console.error('Error creating group:', error)
      return null
    }
  }

  /**
   * Get groups where user is a member
   */
  static async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            created_at,
            updated_at,
            name,
            admin_id,
            privacy_level,
            shame_pool_enabled,
            shame_pool_amount,
            current_competition_period_start,
            competition_period_duration_days,
            is_active,
            max_members,
            join_code
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching user groups:', error)
        return []
      }

      return data?.map(item => item.groups).filter(Boolean) as Group[] || []
    } catch (error) {
      console.error('Error fetching user groups:', error)
      return []
    }
  }

  /**
   * Get group by ID
   */
  static async getGroupById(groupId: string): Promise<Group | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (error) {
        console.error('Error fetching group:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching group:', error)
      return null
    }
  }

  /**
   * Join group by join code
   */
  static async joinGroupByCode(userId: string, joinCode: string): Promise<Group | null> {
    try {
      // First, find the group by join code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('join_code', joinCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (groupError || !group) {
        console.error('Group not found with join code:', joinCode)
        return null
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('*')
        .eq('user_id', userId)
        .eq('group_id', group.id)
        .single()

      if (existingMember) {
        // If already member but inactive, reactivate
        if (!existingMember.is_active) {
          await supabase
            .from('group_members')
            .update({ is_active: true })
            .eq('user_id', userId)
            .eq('group_id', group.id)
        }
        return group
      }

      // Check if group has member limit
      if (group.max_members) {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact' })
          .eq('group_id', group.id)
          .eq('is_active', true)

        if (count && count >= group.max_members) {
          console.error('Group is full')
          return null
        }
      }

      // Add user as member
      const memberResult = await this.addGroupMember({
        user_id: userId,
        group_id: group.id,
        role: 'member'
      })

      return memberResult ? group : null
    } catch (error) {
      console.error('Error joining group:', error)
      return null
    }
  }

  /**
   * Add a member to a group
   */
  static async addGroupMember(memberData: GroupMemberInsert): Promise<GroupMember | null> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .insert(memberData)
        .select()
        .single()

      if (error) {
        console.error('Error adding group member:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error adding group member:', error)
      return null
    }
  }

  /**
   * Remove member from group (soft delete)
   */
  static async removeGroupMember(userId: string, groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('group_id', groupId)

      if (error) {
        console.error('Error removing group member:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error removing group member:', error)
      return false
    }
  }

  /**
   * Update group settings
   */
  static async updateGroup(groupId: string, updates: GroupUpdate): Promise<Group | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single()

      if (error) {
        console.error('Error updating group:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating group:', error)
      return null
    }
  }

  /**
   * Get group members with user details
   */
  static async getGroupMembers(groupId: string): Promise<(GroupMember & { users: any })[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
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
        .order('joined_at', { ascending: true })

      if (error) {
        console.error('Error fetching group members:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching group members:', error)
      return []
    }
  }

  /**
   * Check if user is admin of a group
   */
  static async isGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('admin_id')
        .eq('id', groupId)
        .single()

      if (error || !data) {
        return false
      }

      return data.admin_id === userId
    } catch (error) {
      console.error('Error checking group admin status:', error)
      return false
    }
  }

  /**
   * Transfer group ownership to another member
   */
  static async transferGroupOwnership(groupId: string, newAdminId: string): Promise<boolean> {
    try {
      // Update group admin
      const { error: groupError } = await supabase
        .from('groups')
        .update({ admin_id: newAdminId })
        .eq('id', groupId)

      if (groupError) {
        console.error('Error transferring group ownership:', groupError)
        return false
      }

      // Update member role to admin
      const { error: memberError } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('user_id', newAdminId)
        .eq('group_id', groupId)

      if (memberError) {
        console.error('Error updating member role:', memberError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error transferring group ownership:', error)
      return false
    }
  }

  /**
   * Delete group (soft delete)
   */
  static async deleteGroup(groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ is_active: false })
        .eq('id', groupId)

      if (error) {
        console.error('Error deleting group:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting group:', error)
      return false
    }
  }

  /**
   * Generate new join code for group
   */
  static async regenerateJoinCode(groupId: string): Promise<string | null> {
    try {
      // The trigger function will generate a new unique code
      const { data, error } = await supabase
        .from('groups')
        .update({ join_code: '' }) // This will trigger the automatic generation
        .eq('id', groupId)
        .select('join_code')
        .single()

      if (error || !data) {
        console.error('Error regenerating join code:', error)
        return null
      }

      return data.join_code
    } catch (error) {
      console.error('Error regenerating join code:', error)
      return null
    }
  }
}