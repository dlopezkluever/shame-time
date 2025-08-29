import { TamaguiProvider as Provider } from '@tamagui/core'
import { tamaguiConfig } from '../tamagui.config'
import { ReactNode } from 'react'

interface TamaguiProviderProps {
  children: ReactNode
}

export function TamaguiProvider({ children }: TamaguiProviderProps) {
  return (
    <Provider config={tamaguiConfig} defaultTheme="dark">
      {children}
    </Provider>
  )
}