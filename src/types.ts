export type HabitType = 'binary' | 'quantity';

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  unit: string | null; // e.g. "min", "Seiten", "Gläser"
  target: number | null; // target value for quantity habits
  icon: string; // emoji
  createdAt: string;
  archived: number; // 0 | 1
  sortOrder: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number; // logged amount (binary => 1 when done)
  completed: number; // 0 | 1 (target reached / checked)
}

export interface GameState {
  species: string;
  petName: string;
  currentStreak: number;
  longestStreak: number;
  maxStageReached: number; // 1..6, never decreases
  xp: number;
  freezes: number;
  lastActiveDate: string | null; // last date that "counted"
  health: number; // 0..100
  onboarded: number; // 0 | 1
  isPremium: number; // 0 | 1
  createdAt: string;
  metaFreezesEarned: number; // lifetime freezes earned via XP (for delta-tracking)
}

export const FREE_HABIT_LIMIT = 3;
export const FREE_FREEZE_CAP = 2;
export const PREMIUM_FREEZE_CAP = 5;
export const XP_PER_FREEZE = 100;
