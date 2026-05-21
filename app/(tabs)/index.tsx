import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Modal, Animated,
} from 'react-native';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { Habit, HabitLog } from '@/src/types';
import { Colors, Radius } from '@/src/theme';
import { getStreakHistory } from '@/src/db/database';

const DE_DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

interface DayCell {
  dateStr: string;
  label: string;
  num: string;
  isToday: boolean;
}

function WeekCalendar({ today, todayActive }: { today: string; todayActive: boolean }) {
  const [activityMap, setActivityMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const from = dayjs(today).subtract(6, 'day').format('YYYY-MM-DD');
    getStreakHistory(from, today).then(rows => {
      const map: Record<string, boolean> = {};
      rows.forEach(r => { map[r.date] = r.count > 0; });
      setActivityMap(map);
    }).catch(() => {});
  }, [today]);

  const days: DayCell[] = Array.from({ length: 7 }, (_, i) => {
    const d = dayjs(today).subtract(6 - i, 'day');
    return {
      dateStr: d.format('YYYY-MM-DD'),
      label: DE_DAYS[d.day()],
      num: d.format('D'),
      isToday: i === 6,
    };
  });

  return (
    <View style={calStyles.card}>
      {days.map(({ dateStr, label, num, isToday }) => {
        const active = isToday ? todayActive : (activityMap[dateStr] ?? false);
        return (
          <View key={dateStr} style={calStyles.col}>
            <Text style={[calStyles.dayLabel, isToday && calStyles.dayLabelToday]}>{label}</Text>
            <View style={[
              calStyles.circle,
              active && calStyles.circleActive,
              isToday && !active && calStyles.circleToday,
            ]}>
              <Text style={[calStyles.dayNum, active && calStyles.dayNumActive, isToday && !active && calStyles.dayNumToday]}>
                {num}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function HeuteScreen() {
  const { habits, todayLogs, gameState, today, logHabit, uncompleteHabit } = useStore();
  const { petName, currentStreak, freezes } = gameState;
  const [quantityHabit, setQuantityHabit] = useState<Habit | null>(null);
  const [quantityInput, setQuantityInput] = useState('');

  const fed = todayLogs.some(l => l.completed === 1);
  const completedCount = todayLogs.filter(l => l.completed === 1).length;

  function getLog(habitId: string) {
    return todayLogs.find(l => l.habitId === habitId);
  }

  function handleBinaryTap(habit: Habit) {
    const log = getLog(habit.id);
    if (log?.completed) {
      uncompleteHabit(habit.id);
    } else {
      logHabit(habit.id, 1);
    }
  }

  function handleQuantityTap(habit: Habit) {
    setQuantityInput(String(getLog(habit.id)?.value ?? ''));
    setQuantityHabit(habit);
  }

  function handleQuantityConfirm() {
    if (!quantityHabit) return;
    const value = parseFloat(quantityInput);
    if (!isNaN(value) && value >= 0) {
      logHabit(quantityHabit.id, value);
    }
    setQuantityHabit(null);
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Heute</Text>
          <Text style={styles.headerSub}>{completedCount} von {habits.length} erledigt</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {currentStreak}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* 7-day streak calendar */}
        <WeekCalendar today={today} todayActive={fed} />

        {/* Fed / waiting banner */}
        <View style={[styles.fedBanner, fed ? styles.fedBannerOk : styles.fedBannerWait]}>
          <Text style={styles.fedIcon}>{fed ? '✅' : '⏳'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fedTitle, { color: fed ? Colors.mintDeep : Colors.flame }]}>
              {fed ? `${petName} ist heute gefüttert` : `${petName} wartet auf dich`}
            </Text>
            <Text style={styles.fedSub}>
              {fed
                ? 'Mach weiter — jeder Habit gibt extra XP ✨'
                : `Erledige mindestens 1 Habit, um ${petName} zu füttern`}
            </Text>
          </View>
        </View>

        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🐾</Text>
            <Text style={styles.emptyTitle}>Keine Habits — kein Futter!</Text>
            <Text style={styles.emptySub}>Dein Tierchen wartet hungrig auf dich. Erstelle deinen ersten Habit, damit es wachsen kann.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/habits')}>
              <Text style={styles.addBtnText}>Ersten Habit erstellen →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          habits.map(habit => {
            const log = getLog(habit.id);
            return (
              <HabitRow
                key={habit.id}
                habit={habit}
                log={log}
                onBinaryTap={() => handleBinaryTap(habit)}
                onQuantityTap={() => handleQuantityTap(habit)}
              />
            );
          })
        )}

        {freezes > 0 && (
          <View style={styles.freezeHint}>
            <Text style={styles.freezeText}>
              ❄️ {freezes} Streak-Freeze{freezes !== 1 ? 's' : ''} aktiv — du bist geschützt
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={!!quantityHabit} transparent animationType="fade" onRequestClose={() => setQuantityHabit(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{quantityHabit?.icon} {quantityHabit?.title}</Text>
            <Text style={styles.modalSub}>Wie viel {quantityHabit?.unit ?? ''} heute?</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={setQuantityInput}
              placeholder="0"
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.modalTarget}>Ziel: {quantityHabit?.target} {quantityHabit?.unit}</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setQuantityHabit(null)}>
                <Text style={styles.cancelBtnText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleQuantityConfirm}>
                <Text style={styles.confirmBtnText}>Speichern</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Animated habit row
interface HabitRowProps {
  habit: Habit;
  log: HabitLog | undefined;
  onBinaryTap: () => void;
  onQuantityTap: () => void;
}

function HabitRow({ habit, log, onBinaryTap, onQuantityTap }: HabitRowProps) {
  const done = log?.completed === 1;
  const checkScale = useRef(new Animated.Value(done ? 1 : 0)).current;
  const xpY = useRef(new Animated.Value(0)).current;
  const xpOp = useRef(new Animated.Value(0)).current;
  const prevDone = useRef(done);

  useEffect(() => {
    if (done === prevDone.current) return;
    prevDone.current = done;
    if (done) {
      // Spring-bounce checkmark
      checkScale.setValue(0);
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 220, friction: 8 }).start();
      // Float-up XP toast
      xpY.setValue(0);
      xpOp.setValue(1);
      Animated.parallel([
        Animated.timing(xpY, { toValue: -34, duration: 950, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(380),
          Animated.timing(xpOp, { toValue: 0, duration: 570, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      Animated.timing(checkScale, { toValue: 0, duration: 120, useNativeDriver: true }).start();
      xpOp.setValue(0);
    }
  }, [done]);

  const progress = habit.type === 'quantity' && habit.target
    ? Math.min(1, (log?.value ?? 0) / habit.target)
    : done ? 1 : 0;
  const xpLabel = `+${habit.type === 'quantity' ? 15 : 10} XP ✨`;

  return (
    <View>
      <TouchableOpacity
        style={[styles.habitRow, done && styles.habitRowDone]}
        onPress={() => habit.type === 'binary' ? onBinaryTap() : onQuantityTap()}
        activeOpacity={0.7}
      >
        <View style={[styles.checkBox, done && styles.checkBoxDone]}>
          <Animated.Text style={[styles.checkmark, { transform: [{ scale: checkScale }] }]}>✓</Animated.Text>
        </View>
        <View style={styles.habitBody}>
          <Text style={[styles.habitTitle, done && styles.habitTitleDone]}>
            {habit.icon} {habit.title}
          </Text>
          {habit.type === 'quantity' && habit.target ? (
            <View>
              <Text style={styles.habitSub}>{log?.value ?? 0} / {habit.target} {habit.unit}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
              </View>
            </View>
          ) : (
            <Text style={styles.habitSub}>{done ? 'Erledigt ✓' : 'Tippen zum Abhaken'}</Text>
          )}
        </View>
        {habit.type === 'quantity' && <Text style={styles.logBtn}>📊</Text>}
      </TouchableOpacity>
      {/* Floating XP toast — always rendered, animates in/out */}
      <Animated.Text
        style={[styles.xpToast, { transform: [{ translateY: xpY }], opacity: xpOp }]}
        pointerEvents="none"
      >
        {xpLabel}
      </Animated.Text>
    </View>
  );
}

// Week calendar styles
const calStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    paddingVertical: 14, paddingHorizontal: 12,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  col: { alignItems: 'center', gap: 6, flex: 1 },
  dayLabel: { fontSize: 11, fontWeight: '600', color: Colors.inkLight },
  dayLabelToday: { color: Colors.mintDeep, fontWeight: '800' },
  circle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F0EFF8', alignItems: 'center', justifyContent: 'center',
  },
  circleActive: { backgroundColor: Colors.mintDeep },
  circleToday: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.mintDeep },
  dayNum: { fontSize: 13, fontWeight: '700', color: Colors.inkMid },
  dayNumActive: { color: Colors.white },
  dayNumToday: { color: Colors.mintDeep },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sheet },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.ink },
  headerSub: { fontSize: 13, color: Colors.inkMid, marginTop: 2 },
  streakBadge: {
    backgroundColor: 'rgba(255,107,53,0.1)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.flame,
  },
  streakText: { fontSize: 16, fontWeight: '800', color: Colors.flame },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  fedBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: Radius.lg, borderWidth: 1,
  },
  fedBannerOk: { backgroundColor: '#E9FBF4', borderColor: '#BdEEDC' },
  fedBannerWait: { backgroundColor: '#FFF4EE', borderColor: '#FFD4BC' },
  fedIcon: { fontSize: 28, lineHeight: 34 },
  fedTitle: { fontSize: 14, fontWeight: '700' },
  fedSub: { fontSize: 12, color: Colors.inkMid, marginTop: 2 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    padding: 14, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  habitRowDone: { opacity: 0.75 },
  checkBox: {
    width: 32, height: 32, borderRadius: 10, borderWidth: 2.5,
    borderColor: '#d9d7e6', alignItems: 'center', justifyContent: 'center',
  },
  checkBoxDone: { backgroundColor: Colors.mintDeep, borderColor: Colors.mintDeep },
  checkmark: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  habitBody: { flex: 1 },
  habitTitle: { fontSize: 15.5, fontWeight: '700', color: Colors.ink },
  habitTitleDone: { textDecorationLine: 'line-through', color: Colors.inkLight },
  habitSub: { fontSize: 12.5, color: Colors.inkMid, marginTop: 2 },
  progressBar: { height: 6, backgroundColor: '#eceaf3', borderRadius: 6, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.flame, borderRadius: 6 },
  logBtn: { fontSize: 20 },
  emptyState: { alignItems: 'center', padding: 32, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.ink },
  emptySub: { fontSize: 14, color: Colors.inkMid, textAlign: 'center' },
  addBtn: {
    backgroundColor: Colors.mintDeep, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: Radius.full, marginTop: 8,
  },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  xpToast: {
    position: 'absolute', top: 8, left: 54,
    fontSize: 13, fontWeight: '800', color: Colors.mintDeep,
  },
  freezeHint: {
    backgroundColor: 'rgba(126,200,255,0.12)', borderRadius: Radius.md,
    padding: 12, borderWidth: 1, borderColor: 'rgba(126,200,255,0.3)',
  },
  freezeText: { fontSize: 13, color: Colors.freeze, fontWeight: '600', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  modalCard: {
    backgroundColor: Colors.card, borderRadius: Radius.xl, padding: 24,
    width: '80%', gap: 12, alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.ink, textAlign: 'center' },
  modalSub: { fontSize: 13, color: Colors.inkMid, textAlign: 'center' },
  modalInput: {
    width: '100%', borderWidth: 2, borderColor: Colors.cardBorder, borderRadius: Radius.md,
    padding: 12, fontSize: 28, fontWeight: '700', color: Colors.ink, textAlign: 'center',
  },
  modalTarget: { fontSize: 12, color: Colors.inkLight },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.sheet, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.inkMid },
  confirmBtn: { flex: 1, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.mintDeep, alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
