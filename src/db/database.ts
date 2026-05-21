import * as SQLite from 'expo-sqlite';
import type { GameState, Habit, HabitLog } from '../types';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('habitpet.db');
  }
  return _db;
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

export async function initDB(): Promise<void> {
  const db = await getDB();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS game_state (
      id INTEGER PRIMARY KEY DEFAULT 1,
      species TEXT NOT NULL DEFAULT 'mossy',
      pet_name TEXT NOT NULL DEFAULT 'Mossy',
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      max_stage_reached INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      freezes INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      health INTEGER NOT NULL DEFAULT 80,
      onboarded INTEGER NOT NULL DEFAULT 0,
      is_premium INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      meta_freezes_earned INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'binary',
      unit TEXT,
      target REAL,
      icon TEXT NOT NULL DEFAULT '⭐',
      created_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      value REAL NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      UNIQUE(habit_id, date)
    );
  `);
}

export async function getGameState(): Promise<GameState> {
  const db = await getDB();
  const row = await db.getFirstAsync<{
    species: string; pet_name: string; current_streak: number; longest_streak: number;
    max_stage_reached: number; xp: number; freezes: number; last_active_date: string | null;
    health: number; onboarded: number; is_premium: number; created_at: string;
    meta_freezes_earned: number;
  }>('SELECT * FROM game_state WHERE id = 1');

  if (!row) return DEFAULT_GAME_STATE;

  return {
    species: row.species,
    petName: row.pet_name,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    maxStageReached: row.max_stage_reached,
    xp: row.xp,
    freezes: row.freezes,
    lastActiveDate: row.last_active_date,
    health: row.health,
    onboarded: row.onboarded,
    isPremium: row.is_premium,
    createdAt: row.created_at,
    metaFreezesEarned: row.meta_freezes_earned,
  };
}

export async function saveGameState(state: GameState): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO game_state
      (id, species, pet_name, current_streak, longest_streak, max_stage_reached,
       xp, freezes, last_active_date, health, onboarded, is_premium, created_at, meta_freezes_earned)
     VALUES (1,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      state.species, state.petName, state.currentStreak, state.longestStreak,
      state.maxStageReached, state.xp, state.freezes, state.lastActiveDate,
      state.health, state.onboarded, state.isPremium, state.createdAt,
      state.metaFreezesEarned,
    ]
  );
}

export async function getActiveHabits(): Promise<Habit[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{
    id: string; title: string; type: string; unit: string | null;
    target: number | null; icon: string; created_at: string; archived: number; sort_order: number;
  }>('SELECT * FROM habits WHERE archived = 0 ORDER BY sort_order ASC, created_at ASC');

  return rows.map(r => ({
    id: r.id,
    title: r.title,
    type: r.type as 'binary' | 'quantity',
    unit: r.unit,
    target: r.target,
    icon: r.icon,
    createdAt: r.created_at,
    archived: r.archived,
    sortOrder: r.sort_order,
  }));
}

export async function upsertHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO habits (id, title, type, unit, target, icon, created_at, archived, sort_order)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [habit.id, habit.title, habit.type, habit.unit, habit.target, habit.icon,
     habit.createdAt, habit.archived, habit.sortOrder]
  );
}

export async function archiveHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE habits SET archived = 1 WHERE id = ?', [id]);
}

export async function getLogsForDate(date: string): Promise<HabitLog[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{
    id: string; habit_id: string; date: string; value: number; completed: number;
  }>('SELECT * FROM habit_logs WHERE date = ?', [date]);

  return rows.map(r => ({
    id: r.id,
    habitId: r.habit_id,
    date: r.date,
    value: r.value,
    completed: r.completed,
  }));
}

export async function upsertLog(log: HabitLog): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO habit_logs (id, habit_id, date, value, completed)
     VALUES (?,?,?,?,?)`,
    [log.id, log.habitId, log.date, log.value, log.completed]
  );
}

export async function getStreakHistory(fromDate: string, toDate: string): Promise<{ date: string; count: number }[]> {
  const db = await getDB();
  return db.getAllAsync<{ date: string; count: number }>(
    `SELECT date, COUNT(*) as count FROM habit_logs
     WHERE date BETWEEN ? AND ? AND completed = 1
     GROUP BY date ORDER BY date DESC`,
    [fromDate, toDate]
  );
}
