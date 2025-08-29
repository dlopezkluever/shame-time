// import 'expo-dev-client'; // Not needed for basic web setup
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from './providers/TamaguiProvider';

export default function RootLayout() {
  return (
    <TamaguiProvider>
      <StatusBar style="light" backgroundColor="#0F0F0F" />
      <Slot />
    </TamaguiProvider>
  );
}
