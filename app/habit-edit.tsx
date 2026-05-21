import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { Colors, Radius } from '@/src/theme';

const ICONS = ['⭐', '🏃', '📚', '💧', '🛏️', '🧘', '💪', '🎵', '🍎', '✍️', '🚶', '🧹', '🌅', '💊', '🧠'];
const UNITS = ['min', 'Seiten', 'Gläser', 'km', 'mal', 'h', 'Sätze', 'Runden'];

export default function HabitEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { habits, addHabit, updateHabit } = useStore();

  const existing = id ? habits.find(h => h.id === id) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [type, setType] = useState<'binary' | 'quantity'>(existing?.type ?? 'binary');
  const [unit, setUnit] = useState(existing?.unit ?? 'min');
  const [target, setTarget] = useState(String(existing?.target ?? '30'));
  const [icon, setIcon] = useState(existing?.icon ?? '⭐');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Kein Titel', 'Bitte gib einen Namen für den Habit ein.');
      return;
    }
    setSaving(true);
    if (existing) {
      await updateHabit(existing.id, {
        title: title.trim(), type,
        unit: type === 'quantity' ? unit : null,
        target: type === 'quantity' ? parseFloat(target) || 1 : null,
        icon,
      });
    } else {
      const result = await addHabit({
        title: title.trim(), type,
        unit: type === 'quantity' ? unit : undefined,
        target: type === 'quantity' ? parseFloat(target) || 1 : undefined,
        icon,
      });
      if (result === null) {
        // Free limit reached — shouldn't happen (blocked in habits screen), but be safe
        router.replace('/paywall');
        return;
      }
    }
    router.back();
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Abbrechen</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{existing ? 'Habit bearbeiten' : 'Neuer Habit'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.save}>Speichern</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Icon picker */}
        <Text style={styles.label}>Icon</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow} contentContainerStyle={{ gap: 8 }}>
          {ICONS.map(ic => (
            <TouchableOpacity
              key={ic}
              style={[styles.iconBtn, icon === ic && styles.iconBtnSelected]}
              onPress={() => setIcon(ic)}
            >
              <Text style={styles.iconText}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="z.B. Spazieren gehen"
          value={title}
          onChangeText={setTitle}
          maxLength={40}
          returnKeyType="done"
        />

        {/* Type */}
        <Text style={styles.label}>Typ</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'binary' && styles.typeBtnSelected]}
            onPress={() => setType('binary')}
          >
            <Text style={[styles.typeBtnText, type === 'binary' && styles.typeBtnTextSelected]}>✓ Abhaken</Text>
            <Text style={styles.typeDesc}>„Habe ich gemacht"</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'quantity' && styles.typeBtnSelected]}
            onPress={() => setType('quantity')}
          >
            <Text style={[styles.typeBtnText, type === 'quantity' && styles.typeBtnTextSelected]}>📊 Menge</Text>
            <Text style={styles.typeDesc}>Minuten, Seiten, etc.</Text>
          </TouchableOpacity>
        </View>

        {/* Quantity settings */}
        {type === 'quantity' && (
          <>
            <Text style={styles.label}>Ziel</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.input, styles.targetInput]}
                keyboardType="numeric"
                value={target}
                onChangeText={setTarget}
                placeholder="30"
                maxLength={6}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitRow} contentContainerStyle={{ gap: 8 }}>
                {UNITS.map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitBtn, unit === u && styles.unitBtnSelected]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextSelected]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={styles.hint}>
              Heute erledigt, wenn du {target || '…'} {unit} loggst.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sheet },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  cancel: { fontSize: 16, color: Colors.inkMid },
  title: { fontSize: 17, fontWeight: '700', color: Colors.ink },
  save: { fontSize: 16, color: Colors.mintDeep, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 8, paddingBottom: 60 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.inkMid, letterSpacing: 0.8, marginTop: 16 },
  input: {
    backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.cardBorder,
    borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 16, color: Colors.ink, marginTop: 4,
  },
  iconRow: { flexGrow: 0, marginTop: 8 },
  iconBtn: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card,
  },
  iconBtnSelected: { borderColor: Colors.mintDeep, backgroundColor: 'rgba(19,185,140,0.1)' },
  iconText: { fontSize: 22 },
  typeRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  typeBtn: {
    flex: 1, padding: 14, borderRadius: Radius.md, borderWidth: 2,
    borderColor: Colors.cardBorder, backgroundColor: Colors.card, gap: 4,
  },
  typeBtnSelected: { borderColor: Colors.mintDeep, backgroundColor: 'rgba(19,185,140,0.08)' },
  typeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.inkMid },
  typeBtnTextSelected: { color: Colors.mintDeep },
  typeDesc: { fontSize: 11.5, color: Colors.inkLight },
  quantityRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 4 },
  targetInput: { width: 90 },
  unitRow: { flexGrow: 0, flexShrink: 1, marginTop: 4 },
  unitBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.cardBorder, backgroundColor: Colors.card,
  },
  unitBtnSelected: { borderColor: Colors.mintDeep, backgroundColor: Colors.mintDeep },
  unitBtnText: { fontSize: 13.5, fontWeight: '600', color: Colors.inkMid },
  unitBtnTextSelected: { color: Colors.white },
  hint: { fontSize: 12, color: Colors.inkLight, marginTop: 4 },
});
