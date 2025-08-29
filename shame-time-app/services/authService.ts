import { supabase } from './supabase'
import { AuthError, User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user?: User
  error?: AuthError
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp({ email, password, firstName, lastName }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      })

      if (error) {
        return { error: error || undefined }
      }

      return { user: data.user || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error || undefined }
      }

      return { user: data.user || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Get the current user session
   */
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      return { session: null, error: error as AuthError }
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  /**
   * Reset password for user
   */
  static async resetPassword(email: string): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'shameTime://reset-password'
      })
      return { error: error || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(password: string): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error: error || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Update user profile data
   */
  static async updateProfile(userData: { firstName?: string; lastName?: string }): Promise<{ error?: AuthError }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName
        }
      })
      return { error: error || undefined }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  /**
   * Subscribe to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}