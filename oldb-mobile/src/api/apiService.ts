/**
 * Typed port of flixly-fe APIService contracts used by the mobile MVP.
 * Staff/approval endpoints intentionally omitted.
 */

import { apiRequest } from '@/src/api/client';
import type {
  BookDto,
  DailyReadCheckin,
  DiscoverPage,
  LoginRequest,
  LoginResponse,
  ProfileSummary,
  SignupRequest,
  UserActivityPayload,
} from '@/src/domain/types';

function localDateIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function loginAccount(payload: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function createAccount(payload: SignupRequest): Promise<unknown> {
  return apiRequest('/api/auth/signup', {
    method: 'POST',
    body: payload,
  });
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  return apiRequest<ProfileSummary>('/profile/', { auth: true });
}

export async function getProfileSummaryByUsername(
  username: string
): Promise<ProfileSummary> {
  return apiRequest<ProfileSummary>(`/profile/${encodeURIComponent(username)}`, {
    auth: true,
  });
}

export async function updateProfile(payload: {
  yearlyBookGoal?: number;
  bio?: string;
  location?: string;
}): Promise<unknown> {
  return apiRequest('/profile/edit', {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export async function getProfileBookList(
  username: string,
  listType: string
): Promise<BookDto[]> {
  return apiRequest<BookDto[]>(
    `/profile/${encodeURIComponent(username)}/list/${encodeURIComponent(listType)}`,
    { auth: true }
  );
}

export async function getDailyReadCheckin(
  date = localDateIso()
): Promise<DailyReadCheckin> {
  const params = new URLSearchParams({ date });
  return apiRequest<DailyReadCheckin>(`/profile/me/read-today?${params}`, {
    auth: true,
  });
}

export async function setDailyReadCheckin(
  checkedIn: boolean,
  date = localDateIso()
): Promise<DailyReadCheckin> {
  return apiRequest<DailyReadCheckin>('/profile/me/read-today', {
    method: 'PUT',
    body: { checkedIn, date },
    auth: true,
  });
}

export async function getHomeFeed(): Promise<Record<string, unknown>> {
  return apiRequest('/home', { auth: true });
}

export async function getDiscoverBooks(
  filters: Record<string, string | number | boolean | undefined> = {},
  options?: { signal?: AbortSignal }
): Promise<DiscoverPage> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'boolean') {
      if (value) params.set(key, 'true');
      return;
    }
    params.set(key, String(value));
  });
  const qs = params.toString();
  return apiRequest<DiscoverPage>(`/books/discover${qs ? `?${qs}` : ''}`, {
    signal: options?.signal,
  });
}

export async function getSearchSuggestions(
  q: string,
  options?: { signal?: AbortSignal }
): Promise<unknown> {
  const params = new URLSearchParams({ q });
  return apiRequest(`/search/suggestions?${params}`, {
    signal: options?.signal,
  });
}

export async function getBookById(id: number | string): Promise<BookDto> {
  return apiRequest<BookDto>(`/books/${id}`, { auth: true });
}

export async function createUserActivity(
  activityDto: UserActivityPayload
): Promise<unknown> {
  return apiRequest('/userActivity/', {
    method: 'POST',
    body: activityDto,
    auth: true,
  });
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiRequest('/profile/change-password', {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}
