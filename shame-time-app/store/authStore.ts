import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { AuthService, SignUpData, SignInData } from '../services/authService'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface AuthActions {
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (data: { firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  clearError: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  // Actions
  signUp: async (data: SignUpData) => {
    set({ isLoading: true, error: null })
    
    const { user, error } = await AuthService.signUp(data)
    
    if (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }

    if (user) {
      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    }

    set({ isLoading: false })
    return { success: true }
  },

  signIn: async (data: SignInData) => {
    set({ isLoading: true, error: null })
    
    const { user, error } = await AuthService.signIn(data)
    
    if (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }

    if (user) {
      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    }

    set({ isLoading: false })
    return { success: false, error: 'Unknown error occurred' }
  },

  signOut: async () => {
    set({ isLoading: true })
    
    const { error } = await AuthService.signOut()
    
    if (error) {
      set({ error: error.message, isLoading: false })
      return
    }

    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null })
    
    const { error } = await AuthService.resetPassword(email)
    
    if (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }

    set({ isLoading: false })
    return { success: true }
  },

  updatePassword: async (password: string) => {
    set({ isLoading: true, error: null })
    
    const { error } = await AuthService.updatePassword(password)
    
    if (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }

    set({ isLoading: false })
    return { success: true }
  },

  updateProfile: async (data: { firstName?: string; lastName?: string }) => {
    set({ isLoading: true, error: null })
    
    const { error } = await AuthService.updateProfile(data)
    
    if (error) {
      set({ isLoading: false, error: error.message })
      return { success: false, error: error.message }
    }

    // Update user data in store
    const { user } = get()
    if (user) {
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          first_name: data.firstName || user.user_metadata.first_name,
          last_name: data.lastName || user.user_metadata.last_name
        }
      }
      set({ user: updatedUser, isLoading: false })
    } else {
      set({ isLoading: false })
    }

    return { success: true }
  },

  setUser: (user: User | null) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      error: null
    })
  },

  setSession: (session: Session | null) => {
    set({ 
      session,
      user: session?.user || null,
      isAuthenticated: !!session?.user,
      error: null
    })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  initialize: async () => {
    set({ isLoading: true })
    
    // Get initial session
    const { session, error } = await AuthService.getSession()
    
    if (error) {
      set({ 
        isLoading: false, 
        error: error.message,
        user: null,
        session: null,
        isAuthenticated: false
      })
      return
    }

    // Set up auth state change listener
    AuthService.onAuthStateChange((event, session) => {
      const { setSession, setLoading } = get()
      setSession(session)
      
      if (event === 'SIGNED_OUT') {
        setSession(null)
      }
      
      setLoading(false)
    })

    set({
      session,
      user: session?.user || null,
      isAuthenticated: !!session?.user,
      isLoading: false,
      error: null
    })
  }
}))