import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStore } from '@/src/store/useStore';
import { Colors, Radius } from '@/src/theme';

const FEATURES = [
  { icon: '📋', title: 'Unbegrenzte Habits', desc: 'Tracke so viele Ziele wie du willst' },
  { icon: '🐾', title: 'Alle 3 Tierchen', desc: 'Mossy, Ember und Aqua — alle entsperrt' },
  { icon: '❄️', title: 'Mehr Streak-Freezes', desc: 'Bis zu 5 Freezes — dein Streak ist sicher' },
  { icon: '⚡', title: 'Schnelleres Wachstum', desc: 'Mehr Habits = mehr XP = schnellere Evolution' },
  { icon: '📊', title: 'Statistiken', desc: 'Deine Geschichte auf einen Blick' },
];

export default function PaywallScreen() {
  const { setPremium, gameState } = useStore();

  function handleSubscribe(plan: 'monthly' | 'yearly' | 'lifetime') {
    // RevenueCat would be wired here. For now, simulate unlock.
    Alert.alert(
      'Bald verfügbar',
      'Käufe werden mit RevenueCat aktiviert — für den Beta-Test kannst du einfach freischalten.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: '🎉 Jetzt freischalten (Beta)',
          onPress: async () => {
            await setPremium(true);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.bgDeep, Colors.bgMid]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.closeRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.close}>✕ Schließen</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.badge}>🌟 HabitPet Pro</Text>
          <Text style={styles.headline}>Dein Tierchen verdient das Beste</Text>
          <Text style={styles.sub}>Entsperre alle Features und bringe dein Tierchen zur vollen Evolution.</Text>

          <View style={styles.featuresCard}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureDivider]}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <View>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Plans */}
          <TouchableOpacity style={[styles.planBtn, styles.planBtnHighlight]} onPress={() => handleSubscribe('yearly')}>
            <View style={styles.planTop}>
              <Text style={styles.planTitle}>Jährlich</Text>
              <View style={styles.bestValueBadge}><Text style={styles.bestValue}>Bestes Angebot</Text></View>
            </View>
            <Text style={styles.planPrice}>19,99 €/Jahr</Text>
            <Text style={styles.planSub}>~ 1,67 € / Monat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.planBtn} onPress={() => handleSubscribe('monthly')}>
            <Text style={styles.planTitle}>Monatlich</Text>
            <Text style={styles.planPrice}>3,99 €/Monat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.planBtn, styles.planBtnLifetime]} onPress={() => handleSubscribe('lifetime')}>
            <Text style={styles.planTitle}>🔑 Lifetime</Text>
            <Text style={styles.planPrice}>Einmalig 9,99 €</Text>
            <Text style={styles.planSub}>Für immer — kein Abo</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Abo beginnt nach Bestätigung. Kündigung jederzeit im App Store. Preise inkl. MwSt.{'\n'}
            Lifetime = Einmalkauf ohne Abo.
          </Text>

          {gameState.isPremium === 1 && (
            <View style={styles.alreadyPro}>
              <Text style={styles.alreadyProText}>✅ Du bist bereits Pro — danke! 🙏</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  closeRow: { alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 8 },
  close: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  badge: { fontSize: 13, fontWeight: '800', color: Colors.mint, textAlign: 'center', letterSpacing: 1 },
  headline: { fontSize: 26, fontWeight: '800', color: Colors.white, textAlign: 'center', lineHeight: 32 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20 },
  featuresCard: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  featureDivider: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  featureIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  featureDesc: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  planBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.glassBorder, padding: 18, gap: 4,
  },
  planBtnHighlight: { borderColor: Colors.mint, backgroundColor: 'rgba(55,224,176,0.18)' },
  planBtnLifetime: { borderColor: '#FFD36E', backgroundColor: 'rgba(255,211,110,0.15)' },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planTitle: { fontSize: 16, fontWeight: '800', color: Colors.white },
  planPrice: { fontSize: 22, fontWeight: '800', color: Colors.white },
  planSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  bestValueBadge: { backgroundColor: Colors.mint, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  bestValue: { fontSize: 11, fontWeight: '800', color: Colors.bgDeep },
  legal: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 16 },
  alreadyPro: {
    backgroundColor: 'rgba(55,224,176,0.2)', borderRadius: Radius.md,
    padding: 16, borderWidth: 1, borderColor: Colors.mint, alignItems: 'center',
  },
  alreadyProText: { color: Colors.mint, fontWeight: '700', fontSize: 15 },
});
