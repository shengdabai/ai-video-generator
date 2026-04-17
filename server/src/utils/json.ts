/**
 * VidCraft AI - JSON Utilities
 * Safe JSON parsing with fallback support
 */

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
