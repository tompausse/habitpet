import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useStore } from '@/src/store/useStore';
import { Colors } from '@/src/theme';

export default function TabLayout() {
  const isHydrated = useStore(s => s.isHydrated);
  const onboarded = useStore(s => s.gameState.onboarded);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgDeep }}>
        <ActivityIndicator color={Colors.mint} size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopColor: '#eeecf5',
          height: 84,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.mintDeep,
        tabBarInactiveTintColor: Colors.inkLight,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Heute',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="heute" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="pet"
        options={{
          title: 'Tierchen',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="pet" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="habits" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="profile" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

// Simple SVG-free tab icon using text/emoji
import { Text } from 'react-native';
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, string> = {
    heute: '📅',
    pet: '🐾',
    habits: '✅',
    profile: '👤',
  };
  return <Text style={{ fontSize: size * 0.9, color }}>{icons[name] ?? '•'}</Text>;
}
