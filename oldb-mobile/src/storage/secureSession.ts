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

export async function saveSession(user: SessionUser): Promise<void> {
  await SecureStore.setItemAsync(KEYS.token, user.token);
  await SecureStore.setItemAsync(KEYS.username, user.username);
  if (user.profileName) {
    await SecureStore.setItemAsync(KEYS.profileName, user.profileName);
  } else {
    await SecureStore.deleteItemAsync(KEYS.profileName);
  }
  if (user.role) {
    await SecureStore.setItemAsync(KEYS.role, user.role);
  } else {
    await SecureStore.deleteItemAsync(KEYS.role);
  }
  if (user.email) {
    await SecureStore.setItemAsync(KEYS.email, user.email);
  } else {
    await SecureStore.deleteItemAsync(KEYS.email);
  }
  if (user.avatarUrl) {
    await SecureStore.setItemAsync(KEYS.avatarUrl, user.avatarUrl);
  } else {
    await SecureStore.deleteItemAsync(KEYS.avatarUrl);
  }
}

export async function loadSession(): Promise<SessionUser | null> {
  const token = await SecureStore.getItemAsync(KEYS.token);
  const username = await SecureStore.getItemAsync(KEYS.username);
  if (!token || !username) return null;

  return {
    token,
    username,
    profileName: (await SecureStore.getItemAsync(KEYS.profileName)) ?? undefined,
    role: (await SecureStore.getItemAsync(KEYS.role)) ?? undefined,
    email: (await SecureStore.getItemAsync(KEYS.email)) ?? undefined,
    avatarUrl: (await SecureStore.getItemAsync(KEYS.avatarUrl)) ?? null,
  };
}

export async function clearSession(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key)));
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.token);
}
