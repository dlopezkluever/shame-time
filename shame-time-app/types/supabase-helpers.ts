import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database'

// Helper type to extract table types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']  
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Type-safe helper to get typed Supabase client
export function getTypedSupabase(supabase: SupabaseClient) {
  return supabase as SupabaseClient<Database>
}

// Helper to assert correct types for insert/update operations
export function createTypedInsert<T extends keyof Database['public']['Tables']>(
  tableName: T,
  data: TablesInsert<T>
): TablesInsert<T> {
  return data
}

export function createTypedUpdate<T extends keyof Database['public']['Tables']>(
  tableName: T, 
  data: TablesUpdate<T>
): TablesUpdate<T> {
  return data
}