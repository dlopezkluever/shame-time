export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          avatar_url: string | null
          privacy_level: 'friends_only' | 'private'
          timezone: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          avatar_url?: string | null
          privacy_level?: 'friends_only' | 'private'
          timezone?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          avatar_url?: string | null
          privacy_level?: 'friends_only' | 'private'
          timezone?: string
          is_active?: boolean
        }
      }
      groups: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          admin_id: string
          privacy_level: 'full_access' | 'limited_access'
          shame_pool_enabled: boolean
          shame_pool_amount: number
          current_competition_period_start: string
          competition_period_duration_days: number
          is_active: boolean
          max_members: number | null
          join_code: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          admin_id: string
          privacy_level?: 'full_access' | 'limited_access'
          shame_pool_enabled?: boolean
          shame_pool_amount?: number
          current_competition_period_start?: string
          competition_period_duration_days?: number
          is_active?: boolean
          max_members?: number | null
          join_code?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          admin_id?: string
          privacy_level?: 'full_access' | 'limited_access'
          shame_pool_enabled?: boolean
          shame_pool_amount?: number
          current_competition_period_start?: string
          competition_period_duration_days?: number
          is_active?: boolean
          max_members?: number | null
          join_code?: string
        }
      }
      group_members: {
        Row: {
          user_id: string
          group_id: string
          joined_at: string
          role: 'admin' | 'member'
          is_active: boolean
        }
        Insert: {
          user_id: string
          group_id: string
          joined_at?: string
          role?: 'admin' | 'member'
          is_active?: boolean
        }
        Update: {
          user_id?: string
          group_id?: string
          joined_at?: string
          role?: 'admin' | 'member'
          is_active?: boolean
        }
      }
      daily_app_usage: {
        Row: {
          id: string
          user_id: string
          date: string
          app_name: string
          app_bundle_id: string | null
          time_minutes: number
          category: 'bad' | 'neutral' | 'good'
          is_hidden: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          app_name: string
          app_bundle_id?: string | null
          time_minutes: number
          category: 'bad' | 'neutral' | 'good'
          is_hidden?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          app_name?: string
          app_bundle_id?: string | null
          time_minutes?: number
          category?: 'bad' | 'neutral' | 'good'
          is_hidden?: boolean
          created_at?: string
        }
      }
      breaches: {
        Row: {
          id: string
          user_id: string
          group_id: string | null
          breach_time: string
          app_or_genre: string
          time_limit_minutes: number
          actual_time_minutes: number
          penalty_applied: number
          breach_number: number
          competition_period_start: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id?: string | null
          breach_time?: string
          app_or_genre: string
          time_limit_minutes: number
          actual_time_minutes: number
          penalty_applied?: number
          breach_number?: number
          competition_period_start: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string | null
          breach_time?: string
          app_or_genre?: string
          time_limit_minutes?: number
          actual_time_minutes?: number
          penalty_applied?: number
          breach_number?: number
          competition_period_start?: string
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          group_id: string
          amount: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
          stripe_payment_intent_id: string | null
          stripe_payment_method_id: string | null
          payment_type: 'entry_fee' | 'penalty' | 'payout'
          competition_period_start: string
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
          stripe_payment_intent_id?: string | null
          stripe_payment_method_id?: string | null
          payment_type?: 'entry_fee' | 'penalty' | 'payout'
          competition_period_start: string
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded'
          stripe_payment_intent_id?: string | null
          stripe_payment_method_id?: string | null
          payment_type?: 'entry_fee' | 'penalty' | 'payout'
          competition_period_start?: string
          processed_at?: string | null
          created_at?: string
        }
      }
      app_categories: {
        Row: {
          id: string
          app_name: string
          app_bundle_id: string | null
          category: 'bad' | 'neutral' | 'good'
          default_time_limit_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_name: string
          app_bundle_id?: string | null
          category: 'bad' | 'neutral' | 'good'
          default_time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          app_name?: string
          app_bundle_id?: string | null
          category?: 'bad' | 'neutral' | 'good'
          default_time_limit_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common use cases
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Group = Database['public']['Tables']['groups']['Row']
export type GroupInsert = Database['public']['Tables']['groups']['Insert']
export type GroupUpdate = Database['public']['Tables']['groups']['Update']

export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type GroupMemberInsert = Database['public']['Tables']['group_members']['Insert']
export type GroupMemberUpdate = Database['public']['Tables']['group_members']['Update']

export type DailyAppUsage = Database['public']['Tables']['daily_app_usage']['Row']
export type DailyAppUsageInsert = Database['public']['Tables']['daily_app_usage']['Insert']
export type DailyAppUsageUpdate = Database['public']['Tables']['daily_app_usage']['Update']

export type Breach = Database['public']['Tables']['breaches']['Row']
export type BreachInsert = Database['public']['Tables']['breaches']['Insert']
export type BreachUpdate = Database['public']['Tables']['breaches']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export type AppCategory = Database['public']['Tables']['app_categories']['Row']
export type AppCategoryInsert = Database['public']['Tables']['app_categories']['Insert']
export type AppCategoryUpdate = Database['public']['Tables']['app_categories']['Update']

export type Friendship = Database['public']['Tables']['friendships']['Row']
export type FriendshipInsert = Database['public']['Tables']['friendships']['Insert']
export type FriendshipUpdate = Database['public']['Tables']['friendships']['Update']

// Utility types for calculated values
export type ShameScore = {
  userId: string
  date: string
  totalScore: number
  badAppMinutes: number
  neutralAppMinutes: number
  goodAppMinutes: number
  breachPenalty: number
}

export type LeaderboardEntry = {
  userId: string
  userName: string
  avatarUrl: string | null
  totalScreenTime: number
  shameScore: number
  rank: number
}

export type AppUsageSummary = {
  date: string
  totalMinutes: number
  categories: {
    bad: number
    neutral: number
    good: number
  }
  topApps: Array<{
    appName: string
    category: 'bad' | 'neutral' | 'good'
    minutes: number
  }>
}