import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Modal, Animated, TextInput, Keyboard, Dimensions,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// Subtle animated background sparkles
const SPARKLE_COUNT = 14;

function BackgroundSparkles({ glowColor }: { glowColor: string }) {
  const sparks = useRef(
    Array.from({ length: SPARKLE_COUNT }, (_, i) => {
      const anim = new Animated.Value(0);
      return {
        anim,
        x: Math.random() * SW,
        y: Math.random() * SH,
        size: 2 + Math.random() * 3,
        delay: i * 260,
        duration: 2200 + Math.random() * 1800,
      };
    })
  ).current;

  useEffect(() => {
    sparks.forEach(s => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(s.delay),
          Animated.timing(s.anim, { toValue: 1, duration: s.duration / 2, useNativeDriver: true }),
          Animated.timing(s.anim, { toValue: 0, duration: s.duration / 2, useNativeDriver: true }),
        ])
      );
      loop.start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sparks.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: glowColor,
            opacity: s.anim,
          }}
        />
      ))}
    </View>
  );
}
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { getStageConfig } from '@/src/game/creatures';
import { Creature3D } from '@/src/components/Creature3D';
import { STAGE_THRESHOLDS, STAGE_NAMES, daysToNextStage, MAX_STAGE, XP_PER_STAGE_FILL } from '@/src/engine/streak';
import { Colors, Radius } from '@/src/theme';

export default function PetScreen() {
  const { gameState, todayLogs, setSpeciesAndName } = useStore();
  const { species, petName, currentStreak, longestStreak, maxStageReached, xp, freezes, health, isPremium } = gameState;

  const stageConfig = useMemo(() => getStageConfig(species, maxStageReached), [species, maxStageReached]);
  const todayFed = todayLogs.some(l => l.completed === 1);
  const mood = todayFed ? 'happy' : health < 40 ? 'sad' : 'neutral';
  const nextStageInfo = daysToNextStage(currentStreak);
  const moodLabel = mood === 'happy' ? '😊 Bestens gelaunt · satt' : mood === 'sad' ? '😔 Hungrig · braucht dich' : '😐 Wartet auf dich';

  // XP energy bar
  const xpInBar = xp % XP_PER_STAGE_FILL;
  const xpBarPct = xpInBar / XP_PER_STAGE_FILL;

  // Evolution celebration modal
  const prevMaxStageRef = useRef<number | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [celebStage, setCelebStage] = useState(1);
  const celebScale = useRef(new Animated.Value(0.3)).current;
  const celebOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prevMaxStageRef.current === null) {
      prevMaxStageRef.current = maxStageReached;
      return;
    }
    if (maxStageReached > prevMaxStageRef.current) {
      setCelebStage(maxStageReached);
      prevMaxStageRef.current = maxStageReached;
      celebScale.setValue(0.3);
      celebOpacity.setValue(0);
      setShowEvolution(true);
      Animated.parallel([
        Animated.spring(celebScale, { toValue: 1, useNativeDriver: true, tension: 55, friction: 7 }),
        Animated.timing(celebOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    }
  }, [maxStageReached]);

  const dismissEvolution = () => {
    Animated.timing(celebOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setShowEvolution(false);
    });
  };

  // Inline pet name editing
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(petName);
  const nameInputRef = useRef<TextInput>(null);

  const startEditing = () => {
    setNameInput(petName);
    setEditing(true);
    setTimeout(() => nameInputRef.current?.focus(), 80);
  };

  const commitName = () => {
    const trimmed = nameInput.trim();
    setEditing(false);
    Keyboard.dismiss();
    if (trimmed && trimmed !== petName) {
      setSpeciesAndName(species, trimmed);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.bgDeep, Colors.bgMid, '#4A3187']} style={StyleSheet.absoluteFill} />
      <BackgroundSparkles glowColor={stageConfig.glowColor} />

      <SafeAreaView style={styles.safe}>
        {/* HUD */}
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
          {/* XP energy bar */}
          <View style={styles.xpBarRow}>
            <Text style={styles.xpLabel}>⚡ Energie</Text>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.round(xpBarPct * 100)}%` as any }]} />
            </View>
            <Text style={styles.xpCount}>{xpInBar}/{XP_PER_STAGE_FILL}</Text>
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

        {/* Pet name (tap to edit) */}
        <View style={styles.nameRow}>
          {editing ? (
            <TextInput
              ref={nameInputRef}
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              onBlur={commitName}
              onSubmitEditing={commitName}
              maxLength={20}
              returnKeyType="done"
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity onPress={startEditing} activeOpacity={0.7}>
              <Text style={styles.petName}>{petName} ✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Evolution celebration modal */}
      <Modal visible={showEvolution} transparent animationType="none" statusBarTranslucent>
        <TouchableOpacity style={styles.celebOverlay} activeOpacity={1} onPress={dismissEvolution}>
          <Animated.View style={[styles.celebCard, { transform: [{ scale: celebScale }], opacity: celebOpacity }]}>
            <Text style={styles.celebStars}>✨🎉✨</Text>
            <Text style={styles.celebTitle}>EVOLUTION!</Text>
            <Text style={styles.celebStageName}>{STAGE_NAMES[celebStage - 1]}</Text>
            <Text style={styles.celebSub}>Dein Tierchen hat Stufe {celebStage} erreicht!</Text>
            <Creature3D config={getStageConfig(species, celebStage)} mood="happy" size={180} />
            <Text style={styles.celebStars}>🌟⭐🌟</Text>
            <TouchableOpacity style={styles.celebBtn} onPress={dismissEvolution}>
              <Text style={styles.celebBtnText}>Weiter</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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

  stageBlock: { alignItems: 'center', marginTop: 14, gap: 7 },
  stageName: { fontSize: 13, letterSpacing: 2.5, fontWeight: '800', color: 'rgba(255,255,255,0.85)' },
  segBar: { flexDirection: 'row', gap: 6 },
  seg: { width: 26, height: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.22)' },
  segOn: { backgroundColor: '#FFD36E' },

  xpBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  xpLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600', width: 64 },
  xpTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden',
  },
  xpFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.mint },
  xpCount: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500', width: 44, textAlign: 'right' },

  stageSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },

  creatureContainer: { marginTop: 4, alignItems: 'center', justifyContent: 'center', width: 300, height: 300 },
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
  nameInput: {
    fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: 0.5,
    borderBottomWidth: 2, borderBottomColor: Colors.mint, minWidth: 120, textAlign: 'center',
    paddingVertical: 2, paddingHorizontal: 8,
  },

  // Evolution celebration
  celebOverlay: {
    flex: 1, backgroundColor: 'rgba(18,8,50,0.88)',
    alignItems: 'center', justifyContent: 'center',
  },
  celebCard: {
    backgroundColor: '#1D1040', borderRadius: 28, padding: 32,
    alignItems: 'center', gap: 10, maxWidth: 320, width: '85%',
    borderWidth: 1, borderColor: 'rgba(255,211,110,0.4)',
    shadowColor: '#FFD36E', shadowOpacity: 0.35, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  celebStars: { fontSize: 28, letterSpacing: 4 },
  celebTitle: {
    fontSize: 30, fontWeight: '900', color: '#FFD36E',
    letterSpacing: 3, textShadowColor: 'rgba(255,211,110,0.5)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 },
  },
  celebStageName: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: 1.5 },
  celebSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500', textAlign: 'center' },
  celebBtn: {
    marginTop: 8, backgroundColor: Colors.mint, paddingHorizontal: 40, paddingVertical: 14,
    borderRadius: Radius.full,
  },
  celebBtnText: { fontSize: 16, fontWeight: '800', color: Colors.bgDeep },
});
