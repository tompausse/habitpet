import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { Habit } from '@/src/types';
import { Colors, Radius } from '@/src/theme';

export default function HeuteScreen() {
  const { habits, todayLogs, gameState, logHabit, uncompleteHabit } = useStore();
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
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>Noch keine Habits</Text>
            <Text style={styles.emptySub}>Erstelle deinen ersten Habit im Habits-Tab.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/habits')}>
              <Text style={styles.addBtnText}>Habits erstellen →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          habits.map(habit => {
            const log = getLog(habit.id);
            const done = log?.completed === 1;
            const progress = habit.type === 'quantity' && habit.target
              ? Math.min(1, (log?.value ?? 0) / habit.target)
              : done ? 1 : 0;

            return (
              <TouchableOpacity
                key={habit.id}
                style={[styles.habitRow, done && styles.habitRowDone]}
                onPress={() => habit.type === 'binary' ? handleBinaryTap(habit) : handleQuantityTap(habit)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkBox, done && styles.checkBoxDone]}>
                  {done && <Text style={styles.checkmark}>✓</Text>}
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
