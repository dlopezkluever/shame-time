import { supabase } from './supabase'
import { DailyAppUsage, DailyAppUsageInsert, AppUsageSummary, ShameScore } from '../types/database'

export class AppUsageService {
  /**
   * Save daily app usage data
   */
  static async saveAppUsage(usageData: DailyAppUsageInsert[]): Promise<DailyAppUsage[]> {
    try {
      const { data, error } = await supabase
        .from('daily_app_usage')
        .upsert(usageData, {
          onConflict: 'user_id,date,app_bundle_id'
        })
        .select()

      if (error) {
        console.error('Error saving app usage:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error saving app usage:', error)
      return []
    }
  }

  /**
   * Get app usage for a user on a specific date
   */
  static async getUserAppUsage(userId: string, date: string): Promise<DailyAppUsage[]> {
    try {
      const { data, error } = await supabase
        .from('daily_app_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('time_minutes', { ascending: false })

      if (error) {
        console.error('Error fetching app usage:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching app usage:', error)
      return []
    }
  }

  /**
   * Get app usage for a user over a date range
   */
  static async getUserAppUsageRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DailyAppUsage[]> {
    try {
      const { data, error } = await supabase
        .from('daily_app_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('time_minutes', { ascending: false })

      if (error) {
        console.error('Error fetching app usage range:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching app usage range:', error)
      return []
    }
  }

  /**
   * Get daily usage summary for a user
   */
  static async getUserDailySummary(userId: string, date: string): Promise<AppUsageSummary | null> {
    try {
      const usageData = await this.getUserAppUsage(userId, date)
      
      if (!usageData.length) {
        return null
      }

      const summary: AppUsageSummary = {
        date,
        totalMinutes: usageData.reduce((sum, app) => sum + app.time_minutes, 0),
        categories: {
          bad: usageData.filter(app => app.category === 'bad').reduce((sum, app) => sum + app.time_minutes, 0),
          neutral: usageData.filter(app => app.category === 'neutral').reduce((sum, app) => sum + app.time_minutes, 0),
          good: usageData.filter(app => app.category === 'good').reduce((sum, app) => sum + app.time_minutes, 0),
        },
        topApps: usageData
          .slice(0, 5) // Top 5 apps
          .map(app => ({
            appName: app.app_name,
            category: app.category,
            minutes: app.time_minutes
          }))
      }

      return summary
    } catch (error) {
      console.error('Error getting daily summary:', error)
      return null
    }
  }

  /**
   * Calculate shame score for a user on a specific date
   */
  static async calculateShameScore(userId: string, date: string): Promise<ShameScore | null> {
    try {
      const usageData = await this.getUserAppUsage(userId, date)
      
      if (!usageData.length) {
        return null
      }

      const badAppMinutes = usageData
        .filter(app => app.category === 'bad')
        .reduce((sum, app) => sum + app.time_minutes, 0)

      const neutralAppMinutes = usageData
        .filter(app => app.category === 'neutral')
        .reduce((sum, app) => sum + app.time_minutes, 0)

      const goodAppMinutes = usageData
        .filter(app => app.category === 'good')
        .reduce((sum, app) => sum + app.time_minutes, 0)

      // Get breach penalties for the date
      const breachPenalty = await this.getBreachPenaltyForDate(userId, date)

      // Calculate base shame score
      // Bad apps: +2 points per minute
      // Neutral apps: +0.5 points per minute
      // Good apps: -1 point per minute (capped at 0)
      const baseScore = (badAppMinutes * 2) + (neutralAppMinutes * 0.5) - goodAppMinutes
      const totalScore = Math.max(0, baseScore + breachPenalty)

      return {
        userId,
        date,
        totalScore,
        badAppMinutes,
        neutralAppMinutes,
        goodAppMinutes,
        breachPenalty
      }
    } catch (error) {
      console.error('Error calculating shame score:', error)
      return null
    }
  }

  /**
   * Get breach penalty for a user on a specific date
   */
  private static async getBreachPenaltyForDate(userId: string, date: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('breaches')
        .select('penalty_applied')
        .eq('user_id', userId)
        .gte('breach_time', `${date} 00:00:00`)
        .lte('breach_time', `${date} 23:59:59`)

      if (error) {
        console.error('Error fetching breach penalties:', error)
        return 0
      }

      return data?.reduce((sum, breach) => sum + breach.penalty_applied, 0) || 0
    } catch (error) {
      console.error('Error fetching breach penalties:', error)
      return 0
    }
  }

  /**
   * Get group members' app usage for comparison (respecting privacy settings)
   */
  static async getGroupAppUsage(groupId: string, date: string): Promise<{
    userId: string
    userName: string
    avatarUrl: string | null
    totalMinutes: number
    shameScore: number | null
    canViewDetails: boolean
  }[]> {
    try {
      // Get group members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select(`
          user_id,
          users (
            id,
            name,
            avatar_url,
            privacy_level
          )
        `)
        .eq('group_id', groupId)
        .eq('is_active', true)

      if (membersError || !members) {
        console.error('Error fetching group members:', membersError)
        return []
      }

      const results = []

      for (const member of members) {
        if (!member.users) continue

        const user = member.users
        const canViewDetails = user.privacy_level === 'friends_only'

        if (canViewDetails) {
          // Can view detailed usage
          const summary = await this.getUserDailySummary(user.id, date)
          const shameScore = await this.calculateShameScore(user.id, date)

          results.push({
            userId: user.id,
            userName: user.name,
            avatarUrl: user.avatar_url,
            totalMinutes: summary?.totalMinutes || 0,
            shameScore: shameScore?.totalScore || null,
            canViewDetails: true
          })
        } else {
          // Privacy mode - only show limited info
          results.push({
            userId: user.id,
            userName: user.name,
            avatarUrl: user.avatar_url,
            totalMinutes: 0, // Hidden
            shameScore: null, // Hidden
            canViewDetails: false
          })
        }
      }

      return results
    } catch (error) {
      console.error('Error fetching group app usage:', error)
      return []
    }
  }

  /**
   * Hide/unhide specific app from being visible to others
   */
  static async toggleAppVisibility(
    userId: string, 
    date: string, 
    appBundleId: string, 
    isHidden: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('daily_app_usage')
        .update({ is_hidden: isHidden })
        .eq('user_id', userId)
        .eq('date', date)
        .eq('app_bundle_id', appBundleId)

      if (error) {
        console.error('Error toggling app visibility:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error toggling app visibility:', error)
      return false
    }
  }

  /**
   * Get app usage trends over time
   */
  static async getUsageTrends(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    date: string
    totalMinutes: number
    shameScore: number
    categories: { bad: number; neutral: number; good: number }
  }[]> {
    try {
      const usageData = await this.getUserAppUsageRange(userId, startDate, endDate)
      
      // Group by date
      const groupedByDate = usageData.reduce((acc, usage) => {
        if (!acc[usage.date]) {
          acc[usage.date] = []
        }
        acc[usage.date].push(usage)
        return acc
      }, {} as Record<string, DailyAppUsage[]>)

      const trends = []

      for (const [date, dayUsage] of Object.entries(groupedByDate)) {
        const totalMinutes = dayUsage.reduce((sum, app) => sum + app.time_minutes, 0)
        const shameScore = await this.calculateShameScore(userId, date)
        
        const categories = {
          bad: dayUsage.filter(app => app.category === 'bad').reduce((sum, app) => sum + app.time_minutes, 0),
          neutral: dayUsage.filter(app => app.category === 'neutral').reduce((sum, app) => sum + app.time_minutes, 0),
          good: dayUsage.filter(app => app.category === 'good').reduce((sum, app) => sum + app.time_minutes, 0),
        }

        trends.push({
          date,
          totalMinutes,
          shameScore: shameScore?.totalScore || 0,
          categories
        })
      }

      // Sort by date
      return trends.sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('Error getting usage trends:', error)
      return []
    }
  }
}