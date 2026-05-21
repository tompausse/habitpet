/** Per-stage visual config for each creature species. */
export interface StageConfig {
  scale: number;
  bodyColor: string;      // main body hex
  bellyColor: string;
  accentColor: string;    // eyes, features
  glowColor: string;
  hasLeaf: boolean;
  hasHorns: boolean;
  hasWings: boolean;
  hasCrown: boolean;
  particleColor: string;
}

export interface Species {
  id: string;
  name: string;           // creature name shown in onboarding
  emoji: string;
  description: string;
  stages: StageConfig[];  // index 0..5 => stage 1..6
}

const mossyStages: StageConfig[] = [
  { scale: 0.6, bodyColor: '#7BFFD4', bellyColor: '#EAFFF8', accentColor: '#23304a', glowColor: '#37E0B0', hasLeaf: true,  hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#A0FFE0' },
  { scale: 0.72, bodyColor: '#5EEFC2', bellyColor: '#DCFFF3', accentColor: '#1a2836', glowColor: '#2ED4A6', hasLeaf: true,  hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#80FFD4' },
  { scale: 0.86, bodyColor: '#37E0B0', bellyColor: '#C7F6E8', accentColor: '#1a2836', glowColor: '#1FB895', hasLeaf: true,  hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#60EFC8' },
  { scale: 1.0,  bodyColor: '#22C99A', bellyColor: '#AFEEDD', accentColor: '#10293A', glowColor: '#13B98C', hasLeaf: true,  hasHorns: true,  hasWings: false, hasCrown: false, particleColor: '#44DDB4' },
  { scale: 1.18, bodyColor: '#18B88E', bellyColor: '#90E8CE', accentColor: '#0a1d28', glowColor: '#0EA87E', hasLeaf: true,  hasHorns: true,  hasWings: true,  hasCrown: false, particleColor: '#33CEAD' },
  { scale: 1.36, bodyColor: '#0FAA82', bellyColor: '#72D8BE', accentColor: '#071520', glowColor: '#09986F', hasLeaf: true,  hasHorns: true,  hasWings: true,  hasCrown: true,  particleColor: '#22B898' },
];

const emberStages: StageConfig[] = [
  { scale: 0.6, bodyColor: '#FFB259', bellyColor: '#FFF3E0', accentColor: '#3a1a08', glowColor: '#FF8C42', hasLeaf: false, hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#FFCC80' },
  { scale: 0.72, bodyColor: '#FF9E3D', bellyColor: '#FFECD5', accentColor: '#2e1406', glowColor: '#F07A2A', hasLeaf: false, hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#FFB86C' },
  { scale: 0.86, bodyColor: '#F08030', bellyColor: '#FFE0C0', accentColor: '#2a1205', glowColor: '#D96A22', hasLeaf: false, hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#FFA060' },
  { scale: 1.0,  bodyColor: '#D96A1E', bellyColor: '#FFCFA8', accentColor: '#1e0e04', glowColor: '#C4581A', hasLeaf: false, hasHorns: true,  hasWings: false, hasCrown: false, particleColor: '#F09050' },
  { scale: 1.18, bodyColor: '#C85A14', bellyColor: '#FFBC90', accentColor: '#160904', glowColor: '#B04A10', hasLeaf: false, hasHorns: true,  hasWings: true,  hasCrown: false, particleColor: '#E08040' },
  { scale: 1.36, bodyColor: '#B84A0C', bellyColor: '#FFAA78', accentColor: '#0e0603', glowColor: '#9C3C0A', hasLeaf: false, hasHorns: true,  hasWings: true,  hasCrown: true,  particleColor: '#D07030' },
];

const aquaStages: StageConfig[] = [
  { scale: 0.6, bodyColor: '#7EC8FF', bellyColor: '#E8F8FF', accentColor: '#0a2a3a', glowColor: '#5BB4FF', hasLeaf: false, hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#A0D8FF' },
  { scale: 0.72, bodyColor: '#5ABBFF', bellyColor: '#D8F4FF', accentColor: '#082230', glowColor: '#40A8F5', hasLeaf: false, hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#80C8FF' },
  { scale: 0.86, bodyColor: '#3AABF0', bellyColor: '#C0ECFF', accentColor: '#061C28', glowColor: '#2898E0', hasLeaf: false, hasHorns: false, hasWings: false, hasCrown: false, particleColor: '#60B8F8' },
  { scale: 1.0,  bodyColor: '#2298E0', bellyColor: '#A8E4FF', accentColor: '#041420', glowColor: '#1888CC', hasLeaf: false, hasHorns: true,  hasWings: false, hasCrown: false, particleColor: '#44AAFF' },
  { scale: 1.18, bodyColor: '#1688CC', bellyColor: '#88D8FF', accentColor: '#030E18', glowColor: '#1078B8', hasLeaf: false, hasHorns: true,  hasWings: true,  hasCrown: false, particleColor: '#2898F0' },
  { scale: 1.36, bodyColor: '#0E78B8', bellyColor: '#68CCFF', accentColor: '#020A12', glowColor: '#0A68A0', hasLeaf: false, hasHorns: true,  hasWings: true,  hasCrown: true,  particleColor: '#1888E0' },
];

export const SPECIES: Species[] = [
  {
    id: 'mossy',
    name: 'Mossy',
    emoji: '🌿',
    description: 'Ein sanftes Waldwesen. Wächst mit deinen Habits wie ein Baum im Frühling.',
    stages: mossyStages,
  },
  {
    id: 'ember',
    name: 'Ember',
    emoji: '🔥',
    description: 'Ein feuriges Wesen voller Energie. Deine Disziplin entfacht seine Flamme.',
    stages: emberStages,
  },
  {
    id: 'aqua',
    name: 'Aqua',
    emoji: '💧',
    description: 'Ein ruhiges Wasserwesen. Stetig wie ein Fluss — konsistent ist sein Weg.',
    stages: aquaStages,
  },
];

export function getSpecies(id: string): Species {
  return SPECIES.find(s => s.id === id) ?? SPECIES[0];
}

export function getStageConfig(speciesId: string, stage: number): StageConfig {
  const sp = getSpecies(speciesId);
  const idx = Math.max(0, Math.min(stage - 1, sp.stages.length - 1));
  return sp.stages[idx];
}
