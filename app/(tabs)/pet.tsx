import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { getStageConfig } from '@/src/game/creatures';
import { Creature3D } from '@/src/components/Creature3D';
import { STAGE_THRESHOLDS, STAGE_NAMES, daysToNextStage, MAX_STAGE } from '@/src/engine/streak';
import { Colors, Radius } from '@/src/theme';

export default function PetScreen() {
  const { gameState, todayLogs } = useStore();
  const { species, petName, currentStreak, longestStreak, maxStageReached, xp, freezes, health, isPremium } = gameState;

  const stageConfig = useMemo(() => getStageConfig(species, maxStageReached), [species, maxStageReached]);

  const todayFed = todayLogs.some(l => l.completed === 1);
  const mood = todayFed ? 'happy' : health < 40 ? 'sad' : 'neutral';
  const nextStageInfo = daysToNextStage(currentStreak);

  const moodLabel = mood === 'happy' ? '😊 Bestens gelaunt · satt' : mood === 'sad' ? '😔 Hungrig · braucht dich' : '😐 Wartet auf dich';

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient colors={[Colors.bgDeep, Colors.bgMid, '#4A3187']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safe}>
        {/* HUD top */}
        <View style={styles.hud}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>🔥</Text>
            <Text style={styles.pillText}>{currentStreak}</Text>
            <Text style={styles.pillSub}> Tage</Text>
          </View>
          <View style={styles.hudRight}>
            <View style={styles.pill}>
              <Text style={styles.pillIcon}>❄️</Text>
              <Text style={styles.pillText}>{freezes}</Text>
            </View>
            {isPremium ? (
              <View style={[styles.pill, styles.pillGold]}>
                <Text style={styles.pillText}>⭐ Pro</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.pill, styles.pillCta]} onPress={() => router.push('/paywall')}>
                <Text style={styles.pillText}>🔓 Pro</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stage info */}
        <View style={styles.stageBlock}>
          <Text style={styles.stageName}>STUFE {maxStageReached} · {STAGE_NAMES[maxStageReached - 1]?.toUpperCase()}</Text>
          <View style={styles.segBar}>
            {Array.from({ length: MAX_STAGE }).map((_, i) => (
              <View key={i} style={[styles.seg, i < maxStageReached && styles.segOn]} />
            ))}
          </View>
          <Text style={styles.stageSub}>
            {nextStageInfo
              ? `Noch ${nextStageInfo.daysLeft} Streak-Tage bis Stufe ${nextStageInfo.nextStage} ✦`
              : '🏆 Maximale Evolution erreicht!'}
          </Text>
        </View>

        {/* Creature */}
        <View style={styles.creatureContainer}>
          <View style={styles.glow} />
          <View style={styles.petShadow} />
          <Creature3D config={stageConfig} mood={mood} size={280} />
        </View>

        {/* Mood chip */}
        <View style={styles.moodChip}>
          <Text style={styles.moodText}>{moodLabel}</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatChip label="Längste Streak" value={`${longestStreak}🔥`} />
          <StatChip label="Gesamt XP" value={`${xp}✨`} />
          <StatChip label="Gesundheit" value={`${health}%`} />
        </View>

        {/* Name */}
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{petName}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, alignItems: 'center' },

  hud: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, width: '100%',
  },
  hudRight: { flexDirection: 'row', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full,
  },
  pillGold: { borderColor: 'rgba(255,208,54,0.6)', backgroundColor: 'rgba(255,208,54,0.2)' },
  pillCta: { borderColor: 'rgba(55,224,176,0.5)', backgroundColor: 'rgba(55,224,176,0.15)' },
  pillIcon: { fontSize: 16 },
  pillText: { fontSize: 16, fontWeight: '800', color: Colors.white },
  pillSub: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  stageBlock: { alignItems: 'center', marginTop: 14, gap: 8 },
  stageName: { fontSize: 13, letterSpacing: 2.5, fontWeight: '800', color: 'rgba(255,255,255,0.85)' },
  segBar: { flexDirection: 'row', gap: 6 },
  seg: { width: 26, height: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.22)' },
  segOn: { backgroundColor: '#FFD36E' },
  stageSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  creatureContainer: { marginTop: 8, alignItems: 'center', justifyContent: 'center', width: 300, height: 300 },
  glow: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'transparent',
    shadowColor: Colors.mint, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 60,
  },
  petShadow: {
    position: 'absolute', bottom: 10, width: 120, height: 24,
    borderRadius: 60, backgroundColor: 'rgba(0,0,0,0.25)',
  },

  moodChip: {
    backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingHorizontal: 20, paddingVertical: 9, borderRadius: Radius.full, marginTop: -8,
  },
  moodText: { color: Colors.white, fontSize: 13.5, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14, paddingHorizontal: 20 },
  statChip: {
    flex: 1, backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    paddingVertical: 12, paddingHorizontal: 8, borderRadius: Radius.md, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 15, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'center' },

  nameRow: { marginTop: 12 },
  petName: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: 0.5 },
});
