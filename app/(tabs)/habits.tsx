import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { FREE_HABIT_LIMIT } from '@/src/types';
import { Colors, Radius } from '@/src/theme';

export default function HabitsScreen() {
  const { habits, gameState, removeHabit, canAddHabit } = useStore();
  const isPremium = gameState.isPremium === 1;

  function handleAdd() {
    if (canAddHabit()) {
      router.push('/habit-edit');
    } else {
      router.push('/paywall');
    }
  }

  function handleEdit(habitId: string) {
    router.push({ pathname: '/habit-edit', params: { id: habitId } });
  }

  function handleDelete(habitId: string, title: string) {
    Alert.alert(
      'Habit löschen',
      `„${title}" wirklich löschen? Deine bisherigen Logs bleiben erhalten.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        { text: 'Löschen', style: 'destructive', onPress: () => removeHabit(habitId) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Habits</Text>
          <Text style={styles.headerSub}>
            {habits.length} / {isPremium ? '∞' : FREE_HABIT_LIMIT} aktiv
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+ Neu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!isPremium && (
          <View style={styles.freeHint}>
            <Text style={styles.freeHintText}>
              🆓 Kostenlos: {FREE_HABIT_LIMIT} Habits · mehr mit{' '}
              <Text style={styles.freeHintLink} onPress={() => router.push('/paywall')}>HabitPet Pro</Text>
            </Text>
          </View>
        )}

        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyTitle}>Noch kein Habit</Text>
            <Text style={styles.emptySub}>Starte mit einem kleinen Ziel — dein Tierchen freut sich über jeden Habit.</Text>
            <TouchableOpacity style={styles.startBtn} onPress={handleAdd}>
              <Text style={styles.startBtnText}>Ersten Habit erstellen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          habits.map(habit => (
            <View key={habit.id} style={styles.habitRow}>
              <TouchableOpacity style={styles.habitMain} onPress={() => handleEdit(habit.id)}>
                <Text style={styles.habitIcon}>{habit.icon}</Text>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitMeta}>
                    {habit.type === 'binary'
                      ? 'Täglich abhaken'
                      : `${habit.target} ${habit.unit} täglich`}
                  </Text>
                </View>
                <Text style={styles.editArrow}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(habit.id, habit.title)}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
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
  addBtn: {
    backgroundColor: Colors.mintDeep, paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: Radius.full,
  },
  addBtnText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  freeHint: {
    backgroundColor: 'rgba(55,224,176,0.1)', borderRadius: Radius.md,
    padding: 12, borderWidth: 1, borderColor: 'rgba(55,224,176,0.3)',
  },
  freeHintText: { fontSize: 13, color: Colors.inkMid, textAlign: 'center' },
  freeHintLink: { color: Colors.mintDeep, fontWeight: '700' },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden',
  },
  habitMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  habitIcon: { fontSize: 26 },
  habitInfo: { flex: 1 },
  habitTitle: { fontSize: 15.5, fontWeight: '700', color: Colors.ink },
  habitMeta: { fontSize: 12.5, color: Colors.inkMid, marginTop: 2 },
  editArrow: { fontSize: 22, color: Colors.inkLight, fontWeight: '300' },
  deleteBtn: {
    paddingHorizontal: 14, paddingVertical: 20,
    borderLeftWidth: 1, borderLeftColor: Colors.cardBorder,
    backgroundColor: '#fff5f7',
  },
  deleteBtnText: { fontSize: 14, color: Colors.danger, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40, gap: 12 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.ink },
  emptySub: { fontSize: 14, color: Colors.inkMid, textAlign: 'center', lineHeight: 20 },
  startBtn: {
    backgroundColor: Colors.mintDeep, paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: Radius.full, marginTop: 4,
  },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
