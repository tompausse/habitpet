import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StageConfig } from '../game/creatures';
import { Colors } from '../theme';

interface Props {
  children: ReactNode;
  config: StageConfig;
  size?: number;
}

interface State {
  hasError: boolean;
}

export class CreatureErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <CreatureFallback config={this.props.config} size={this.props.size ?? 260} />;
    }
    return this.props.children;
  }
}

// Emoji-based fallback when 3D fails — always works
const SPECIES_EMOJI: Record<string, string[]> = {
  mossy: ['🌱', '🌿', '🌳', '🦖', '🐲', '🐉'],
  ember: ['🔥', '🦊', '🦁', '🐯', '🔱', '👑'],
  aqua: ['💧', '🐬', '🐳', '🦭', '🌊', '🔱'],
};

function CreatureFallback({ config, size }: { config: StageConfig; size: number }) {
  return (
    <View style={[styles.fallback, { width: size, height: size }]}>
      <View style={[styles.glow, { backgroundColor: config.glowColor + '33', width: size * 0.85, height: size * 0.85, borderRadius: size }]}>
        <Text style={{ fontSize: size * 0.45 * config.scale }}>🐾</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
