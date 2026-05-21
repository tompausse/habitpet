import { GameState, XP_PER_FREEZE, FREE_FREEZE_CAP, PREMIUM_FREEZE_CAP } from '../types';
import { daysBetween, yesterdayOf } from '../utils/dates';

/** Streak thresholds (in consecutive days) that unlock each evolution stage. */
export const STAGE_THRESHOLDS = [0, 7, 14, 30, 90, 365];
export const STAGE_NAMES = ['Baby', 'Kind', 'Jungtier', 'Gefährte', 'Wächter', 'Legende'];
export const MAX_STAGE = STAGE_THRESHOLDS.length; // 6

/** Highest stage (1..6) unlocked by a given streak length. */
export function stageForStreak(streak: number): number {
  let stage = 1;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (streak >= STAGE_THRESHOLDS[i]) stage = i + 1;
  }
  return stage;
}

/** Days of streak still needed to reach the next stage. null if maxed. */
export function daysToNextStage(currentStreak: number): { nextStage: number; daysLeft: number } | null {
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (currentStreak < STAGE_THRESHOLDS[i]) {
      return { nextStage: i + 1, daysLeft: STAGE_THRESHOLDS[i] - currentStreak };
    }
  }
  return null;
}

export function freezeCap(isPremium: number): number {
  return isPremium ? PREMIUM_FREEZE_CAP : FREE_FREEZE_CAP;
}

/**
 * Resolve missed days on app open. Covers each fully-missed day with a freeze
 * if available; otherwise the streak breaks. Does NOT count today yet — today
 * only counts once a habit is completed (see registerCompletion).
 * Returns a NEW state object.
 */
export function resolveMissedDays(state: GameState, today: string): GameState {
  if (!state.lastActiveDate) return state;

  const gap = daysBetween(state.lastActiveDate, today);

  // gap 0 => already active today; gap 1 => yesterday active, today still open.
  if (gap <= 1) return state;

  const missedDays = gap - 1; // full days with no activity before today
  const next = { ...state };

  if (next.freezes >= missedDays) {
    // Cover the gap; pretend yesterday was active so today continues the streak.
    next.freezes -= missedDays;
    next.lastActiveDate = yesterdayOf(today);
    // health dips a bit when freezes are spent
    next.health = Math.max(40, next.health - missedDays * 8);
  } else {
    // Streak breaks. Evolution form is preserved (maxStageReached unchanged).
    next.currentStreak = 0;
    next.lastActiveDate = null;
    next.health = 25;
  }
  return next;
}

/**
 * Mark today as an active day (called when the first habit of the day is
 * completed). Increments the streak, awards XP/freezes, updates evolution.
 * `extraHabitsCompleted` = completed habits beyond the first today.
 * Returns a NEW state object.
 */
export function registerCompletion(
  state: GameState,
  today: string,
  xpGained: number,
): GameState {
  const next = { ...state };

  if (next.lastActiveDate === today) {
    // Day already counted — just add XP for the extra habit.
    next.xp += xpGained;
  } else {
    if (next.lastActiveDate && daysBetween(next.lastActiveDate, today) === 1) {
      next.currentStreak += 1;
    } else {
      next.currentStreak = 1; // fresh start or after a break
    }
    next.lastActiveDate = today;
    next.xp += xpGained;
    next.health = 100;
  }

  next.longestStreak = Math.max(next.longestStreak, next.currentStreak);
  next.maxStageReached = Math.max(next.maxStageReached, stageForStreak(next.currentStreak));

  // Award freezes from XP (capped).
  const cap = freezeCap(next.isPremium);
  const earnedFreezes = Math.floor(next.xp / XP_PER_FREEZE);
  const spentFreezesBaseline = state.metaFreezesEarned ?? 0;
  const newFreezes = earnedFreezes - spentFreezesBaseline;
  if (newFreezes > 0) {
    next.freezes = Math.min(cap, next.freezes + newFreezes);
    next.metaFreezesEarned = earnedFreezes;
  }

  return next;
}

/** XP awarded for completing a habit. Quantity habits give a bit more. */
export function xpForHabit(type: 'binary' | 'quantity'): number {
  return type === 'quantity' ? 15 : 10;
}
