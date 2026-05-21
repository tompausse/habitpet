import { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, AppStateStatus } from 'react-native';
import { useStore } from '@/src/store/useStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const hydrate = useStore(s => s.hydrate);
  const tick = useStore(s => s.tick);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') tick();
    });
    return () => sub.remove();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="habit-edit" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
