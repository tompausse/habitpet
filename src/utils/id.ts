/** Generate a compact unique ID (crypto.randomUUID available on Hermes/RN 0.71+). */
export function uid(): string {
  // crypto.randomUUID is available in React Native >= 0.71 (Hermes)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older envs / tests
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
