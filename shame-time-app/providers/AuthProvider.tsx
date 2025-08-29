import React, { useEffect, createContext, useContext } from 'react'
import { useAuthStore } from '../store/authStore'

interface AuthContextType {
  isInitialized: boolean
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false
})

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize)
  const isLoading = useAuthStore((state) => state.isLoading)
  const [isInitialized, setIsInitialized] = React.useState(false)

  useEffect(() => {
    const initAuth = async () => {
      await initialize()
      setIsInitialized(true)
    }
    
    initAuth()
  }, [initialize])

  const contextValue = {
    isInitialized: isInitialized && !isLoading
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}