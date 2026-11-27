/**
 * Backend base URL.
 * - iOS Simulator: localhost works
 * - Android Emulator: use 10.0.2.2 instead of localhost
 * - Physical device: set EXPO_PUBLIC_API_URL to your machine LAN IP
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/$/, '');

export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
  ) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${API_BASE_URL}${value}`;
  }
  return value;
}
