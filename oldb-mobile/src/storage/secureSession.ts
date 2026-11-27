import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { SessionUser } from '@/src/domain/types';

const KEYS = {
  token: 'oldb.token',
  username: 'oldb.username',
  profileName: 'oldb.profileName',
  role: 'oldb.role',
  email: 'oldb.email',
  avatarUrl: 'oldb.avatarUrl',
} as const;

/** In-memory fallback when SecureStore is unavailable (rare Expo Go / web edge cases). */
const memory = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  memory.set(key, value);
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Expo Go / web may reject; memory keeps the session for this runtime.
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value != null) {
      memory.set(key, value);
      return value;
    }
  } catch {
    // fall through to memory
  }
  return memory.get(key) ?? null;
}

async function deleteItem(key: string): Promise<void> {
  memory.delete(key);
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

export async function saveSession(user: SessionUser): Promise<void> {
  await setItem(KEYS.token, user.token);
  await setItem(KEYS.username, user.username);
  if (user.profileName) await setItem(KEYS.profileName, user.profileName);
  else await deleteItem(KEYS.profileName);
  if (user.role) await setItem(KEYS.role, user.role);
  else await deleteItem(KEYS.role);
  if (user.email) await setItem(KEYS.email, user.email);
  else await deleteItem(KEYS.email);
  if (user.avatarUrl) await setItem(KEYS.avatarUrl, user.avatarUrl);
  else await deleteItem(KEYS.avatarUrl);
}

export async function loadSession(): Promise<SessionUser | null> {
  const token = await getItem(KEYS.token);
  const username = await getItem(KEYS.username);
  if (!token || !username) return null;

  return {
    token,
    username,
    profileName: (await getItem(KEYS.profileName)) ?? undefined,
    role: (await getItem(KEYS.role)) ?? undefined,
    email: (await getItem(KEYS.email)) ?? undefined,
    avatarUrl: (await getItem(KEYS.avatarUrl)) ?? null,
  };
}

export async function clearSession(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((key) => deleteItem(key)));
}

export async function getToken(): Promise<string | null> {
  return getItem(KEYS.token);
}

export function getSecureStorePlatformNote(): string {
  return Platform.OS;
}
