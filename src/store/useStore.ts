import { create } from 'zustand';
import { uid } from '../utils/id';
import type { GameState, Habit, HabitLog } from '../types';
import { FREE_HABIT_LIMIT } from '../types';
import * as DB from '../db/database';
import { todayStr } from '../utils/dates';
import { resolveMissedDays, registerCompletion, xpForHabit } from '../engine/streak';
import { requestNotificationPermissions, scheduleDailyReminder } from '../utils/notifications';

interface StoreState {
  gameState: GameState;
  habits: Habit[];
  todayLogs: HabitLog[]; // logs for the current calendar day
  today: string;
  isLoading: boolean;
  isHydrated: boolean;

  // Lifecycle
  hydrate: () => Promise<void>;
  tick: () => Promise<void>; // call on foreground resume to resolve missed days

  // Game actions
  setSpeciesAndName: (species: string, petName: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setPremium: (premium: boolean) => Promise<void>;

  // Habit actions
  addHabit: (data: { title: string; type: 'binary' | 'quantity'; unit?: string; target?: number; icon?: string }) => Promise<Habit | null>;
  updateHabit: (id: string, data: Partial<Pick<Habit, 'title' | 'type' | 'unit' | 'target' | 'icon'>>) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;

  // Logging actions
  logHabit: (habitId: string, value: number) => Promise<void>;
  uncompleteHabit: (habitId: string) => Promise<void>;

  // Selectors (derived)
  todayCompleted: () => number;
  todayFed: () => boolean;
  canAddHabit: () => boolean;
}

const DEFAULT_GAME_STATE: GameState = {
  species: 'mossy',
  petName: 'Mossy',
  currentStreak: 0,
  longestStreak: 0,
  maxStageReached: 1,
  xp: 0,
  freezes: 0,
  lastActiveDate: null,
  health: 80,
  onboarded: 0,
  isPremium: 0,
  createdAt: new Date().toISOString(),
  metaFreezesEarned: 0,
};

async function persistState(state: GameState) {
  await DB.saveGameState(state);
}

export const useStore = create<StoreState>((set, get) => ({
  gameState: DEFAULT_GAME_STATE,
  habits: [],
  todayLogs: [],
  today: todayStr(),
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    set({ isLoading: true });
    await DB.initDB();
    const today = todayStr();
    let gs = await DB.getGameState();
    gs = resolveMissedDays(gs, today);
    await persistState(gs);
    const habits = await DB.getActiveHabits();
    const todayLogs = await DB.getLogsForDate(today);
    set({ gameState: gs, habits, todayLogs, today, isLoading: false, isHydrated: true });
  },

  tick: async () => {
    const today = todayStr();
    const { gameState } = get();
    const resolved = resolveMissedDays(gameState, today);
    if (resolved !== gameState) {
      await persistState(resolved);
      set({ gameState: resolved, today });
    }
    // Refresh today's logs in case date changed
    if (today !== get().today) {
      const todayLogs = await DB.getLogsForDate(today);
      set({ todayLogs, today });
    }
  },

  setSpeciesAndName: async (species, petName) => {
    const next = { ...get().gameState, species, petName };
    set({ gameState: next });
    await persistState(next);
  },

  completeOnboarding: async () => {
    const next = { ...get().gameState, onboarded: 1 };
    set({ gameState: next });
    await persistState(next);
    // Request notification permission and schedule daily reminder
    const granted = await requestNotificationPermissions();
    if (granted) {
      await scheduleDailyReminder(next.petName);
    }
  },

  setPremium: async (premium) => {
    const next = { ...get().gameState, isPremium: premium ? 1 : 0 };
    set({ gameState: next });
    await persistState(next);
  },

  addHabit: async (data) => {
    const { habits, gameState } = get();
    if (!gameState.isPremium && habits.length >= FREE_HABIT_LIMIT) {
      return null; // caller should open paywall
    }
    const habit: Habit = {
      id: uid(),
      title: data.title,
      type: data.type,
      unit: data.unit ?? null,
      target: data.target ?? null,
      icon: data.icon ?? '⭐',
      createdAt: new Date().toISOString(),
      archived: 0,
      sortOrder: habits.length,
    };
    await DB.upsertHabit(habit);
    set({ habits: [...habits, habit] });
    return habit;
  },

  updateHabit: async (id, data) => {
    const habits = get().habits.map(h =>
      h.id === id ? { ...h, ...data } : h
    );
    const updated = habits.find(h => h.id === id);
    if (updated) {
      await DB.upsertHabit(updated);
      set({ habits });
    }
  },

  removeHabit: async (id) => {
    await DB.archiveHabit(id);
    set({ habits: get().habits.filter(h => h.id !== id) });
  },

  logHabit: async (habitId, value) => {
    const { habits, todayLogs, today } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const target = habit.type === 'binary' ? 1 : (habit.target ?? 1);
    const completed = value >= target ? 1 : 0;

    const existingLog = todayLogs.find(l => l.habitId === habitId);
    const log: HabitLog = {
      id: existingLog?.id ?? uid(),
      habitId,
      date: today,
      value,
      completed,
    };

    await DB.upsertLog(log);
    const newLogs = [
      ...todayLogs.filter(l => l.habitId !== habitId),
      log,
    ];
    set({ todayLogs: newLogs });

    // If this habit is now completed and the day wasn't already counted, register.
    if (completed) {
      const wasAlreadyFed = todayLogs.some(l => l.completed === 1);
      if (!wasAlreadyFed) {
        const xp = xpForHabit(habit.type);
        let next = registerCompletion(get().gameState, today, xp);
        await persistState(next);
        set({ gameState: next });
      } else {
        // Extra habit completed after feeding — add XP bonus
        const xp = xpForHabit(habit.type);
        let next = registerCompletion(get().gameState, today, xp);
        await persistState(next);
        set({ gameState: next });
      }
    }
  },

  uncompleteHabit: async (habitId) => {
    const { todayLogs, today } = get();
    const log = todayLogs.find(l => l.habitId === habitId);
    if (!log) return;
    const updated: HabitLog = { ...log, value: 0, completed: 0 };
    await DB.upsertLog(updated);
    set({ todayLogs: todayLogs.map(l => l.habitId === habitId ? updated : l) });
  },

  todayCompleted: () => get().todayLogs.filter(l => l.completed === 1).length,
  todayFed: () => get().todayLogs.some(l => l.completed === 1),
  canAddHabit: () => get().gameState.isPremium === 1 || get().habits.length < FREE_HABIT_LIMIT,
}));
