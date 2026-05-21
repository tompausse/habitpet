import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { STAGE_NAMES } from '@/src/engine/streak';
import { Colors, Radius } from '@/src/theme';

export default function ProfileScreen() {
  const { gameState, habits } = useStore();
  const { petName, species, currentStreak, longestStreak, maxStageReached, xp, freezes, isPremium } = gameState;

  const stageLabel = STAGE_NAMES[maxStageReached - 1] ?? 'Baby';

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        {!isPremium && (
          <TouchableOpacity style={styles.proBtn} onPress={() => router.push('/paywall')}>
            <Text style={styles.proBtnText}>⭐ Pro</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Pet summary */}
        <View style={styles.petCard}>
          <Text style={styles.petEmoji}>{species === 'ember' ? '🔥' : species === 'aqua' ? '💧' : '🌿'}</Text>
          <View>
            <Text style={styles.petName}>{petName}</Text>
            <Text style={styles.petStage}>Stufe {maxStageReached} · {stageLabel}</Text>
          </View>
          {isPremium && <View style={styles.proBadge}><Text style={styles.proBadgeText}>⭐ Pro</Text></View>}
        </View>

        {/* Stats grid */}
        <Text style={styles.sectionTitle}>Statistiken</Text>
        <View style={styles.grid}>
          <StatCard label="Aktuelle Streak" value={`${currentStreak} 🔥`} />
          <StatCard label="Längste Streak" value={`${longestStreak} 🔥`} />
          <StatCard label="Gesamt XP" value={`${xp} ✨`} />
          <StatCard label="Streak Freezes" value={`${freezes} ❄️`} />
          <StatCard label="Aktive Habits" value={`${habits.length}`} />
          <StatCard label="Evolution" value={`${maxStageReached} / 6`} />
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Einstellungen</Text>
        <View style={styles.actionList}>
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/paywall')}>
            <Text style={styles.actionLabel}>🛍 {isPremium ? 'HabitPet Pro — aktiv' : 'HabitPet Pro freischalten'}</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() =>
              Alert.alert('Benachrichtigungen', 'Tägliche Erinnerungen werden in Kürze konfigurierbar sein.')
            }
          >
            <Text style={styles.actionLabel}>🔔 Tägliche Erinnerung</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>HabitPet v0.1 · made with ❤️ & Claude</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sheet },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.ink },
  proBtn: {
    backgroundColor: 'rgba(255,208,54,0.15)', borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: '#FFD036',
  },
  proBtnText: { fontSize: 14, fontWeight: '700', color: '#b8950a' },
  content: { padding: 20, gap: 12, paddingBottom: 60 },
  petCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.card, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  petEmoji: { fontSize: 44 },
  petName: { fontSize: 20, fontWeight: '800', color: Colors.ink },
  petStage: { fontSize: 13, color: Colors.inkMid, marginTop: 2 },
  proBadge: {
    marginLeft: 'auto' as any, backgroundColor: 'rgba(255,208,54,0.2)', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: '#FFD036',
  },
  proBadgeText: { fontSize: 12, fontWeight: '700', color: '#b8950a' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.inkMid, letterSpacing: 0.8, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder, padding: 14, gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.ink },
  statLabel: { fontSize: 12, color: Colors.inkMid },
  actionList: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  actionLabel: { fontSize: 15, color: Colors.ink },
  actionArrow: { fontSize: 22, color: Colors.inkLight },
  footer: { fontSize: 12, color: Colors.inkLight, textAlign: 'center', marginTop: 8 },
});
