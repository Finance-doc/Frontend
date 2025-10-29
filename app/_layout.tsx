// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)', 
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="date" options={{ headerShown: false }} /> 
          <Stack.Screen name="input" options={{ headerShown: false }} />
          <Stack.Screen name="category" options={{ headerShown: false }} />
          <Stack.Screen name="categoryinput" options={{ headerShown: false }} />
          <Stack.Screen name="change" options={{ headerShown: false }} /> 
          <Stack.Screen name="inputaccount" options={{ headerShown: false }} /> 
        </Stack>
      <StatusBar style="dark" hidden={false} translucent={false} />
    </SafeAreaProvider>
  );
}
