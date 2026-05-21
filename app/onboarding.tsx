import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '@/src/store/useStore';
import { SPECIES } from '@/src/game/creatures';
import { Creature3D } from '@/src/components/Creature3D';
import { getStageConfig } from '@/src/game/creatures';
import { Colors, Radius } from '@/src/theme';

export default function OnboardingScreen() {
  const [selectedSpecies, setSelectedSpecies] = useState(SPECIES[0].id);
  const [petName, setPetName] = useState('');
  const [step, setStep] = useState<'species' | 'name'>('species');
  const { setSpeciesAndName, completeOnboarding } = useStore();

  const selectedSp = SPECIES.find(s => s.id === selectedSpecies) ?? SPECIES[0];

  async function finish() {
    const name = petName.trim() || selectedSp.name;
    await setSpeciesAndName(selectedSpecies, name);
    await completeOnboarding();
    router.replace('/(tabs)/pet');
  }

  return (
    <LinearGradient colors={[Colors.bgDeep, Colors.bgMid, '#C56B8E']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {step === 'species' ? (
          <SpeciesStep
            selectedSpecies={selectedSpecies}
            onSelect={setSelectedSpecies}
            onNext={() => setStep('name')}
          />
        ) : (
          <NameStep
            species={selectedSp}
            petName={petName}
            onChangeName={setPetName}
            onBack={() => setStep('species')}
            onFinish={finish}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function SpeciesStep({
  selectedSpecies, onSelect, onNext,
}: { selectedSpecies: string; onSelect: (id: string) => void; onNext: () => void }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.headline}>Wähle dein Tierchen</Text>
      <Text style={styles.sub}>Dein Begleiter auf dem Weg zu deinen Habits.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speciesRow} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
        {SPECIES.map(sp => {
          const cfg = getStageConfig(sp.id, 1);
          const selected = sp.id === selectedSpecies;
          return (
            <TouchableOpacity
              key={sp.id}
              style={[styles.speciesCard, selected && styles.speciesCardSelected]}
              onPress={() => onSelect(sp.id)}
            >
              <Creature3D config={cfg} mood="happy" size={140} />
              <Text style={[styles.speciesName, selected && styles.speciesNameSelected]}>{sp.emoji} {sp.name}</Text>
              <Text style={styles.speciesDesc}>{sp.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity style={styles.primaryBtn} onPress={onNext}>
        <Text style={styles.primaryBtnText}>Weiter →</Text>
      </TouchableOpacity>
    </View>
  );
}

function NameStep({
  species, petName, onChangeName, onBack, onFinish,
}: { species: typeof SPECIES[0]; petName: string; onChangeName: (v: string) => void; onBack: () => void; onFinish: () => void }) {
  const cfg = getStageConfig(species.id, 1);
  return (
    <View style={styles.stepContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Zurück</Text>
      </TouchableOpacity>
      <Creature3D config={cfg} mood="happy" size={200} />
      <Text style={styles.headline}>Wie heißt dein{'\n'}{species.name}?</Text>
      <TextInput
        style={styles.nameInput}
        placeholder={species.name}
        placeholderTextColor={Colors.inkLight}
        value={petName}
        onChangeText={onChangeName}
        maxLength={18}
        autoFocus
      />
      <Text style={styles.nameHint}>Kein Name? Es wird {species.name} heißen.</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onFinish}>
        <Text style={styles.primaryBtnText}>Los geht's 🎉</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  stepContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 16 },
  headline: { fontSize: 28, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: -8 },
  speciesRow: { flexGrow: 0, marginVertical: 8 },
  speciesCard: {
    width: 180, padding: 16, borderRadius: Radius.lg,
    backgroundColor: Colors.glass, borderWidth: 1.5, borderColor: Colors.glassBorder,
    alignItems: 'center', gap: 8,
  },
  speciesCardSelected: {
    borderColor: Colors.mint, backgroundColor: 'rgba(55,224,176,0.18)',
  },
  speciesName: { fontSize: 17, fontWeight: '700', color: Colors.white },
  speciesNameSelected: { color: Colors.mint },
  speciesDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  primaryBtn: {
    backgroundColor: Colors.mint, paddingVertical: 16, paddingHorizontal: 44,
    borderRadius: Radius.full, marginTop: 8,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: Colors.bgDeep },
  backBtn: { position: 'absolute', top: 20, left: 20 },
  backBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  nameInput: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.glassBorder,
    paddingHorizontal: 18, paddingVertical: 14, fontSize: 20, fontWeight: '700',
    color: Colors.white, textAlign: 'center',
  },
  nameHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
});
