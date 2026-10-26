import type { UserProblemData, ProblemStatus, Problem, SpacedRepetitionGrade } from '../data/problems';
import { initSpacedRepetition, calculateNextReview } from '../services/spacedRepetition';

const STORAGE_VERSION = 3;
const KEYS = {
  VERSION: 'dsa30_version',
  PROBLEM_DATA: 'dsa30_problem_data',
  SETTINGS: 'dsa30_settings',
  THEME: 'dsa30_theme',
  CUSTOM_PROBLEMS: 'dsa30_custom_problems',
};

export interface StreakFreezeRecord {
  date: string; // YYYY-MM-DD
  reason: string;
}

export type MessageChannel = 'telegram' | 'whatsapp' | 'webhook' | 'push';

export interface MobileNotificationSettings {
  channel: MessageChannel;
  telegramBotToken?: string;
  telegramChatId?: string;
  whatsappPhone?: string;
  whatsappApiKey?: string;
  customWebhookUrl?: string;
  emailAddress?: string;
  slot1Time: string; // Morning (e.g. "09:00")
  slot2Time: string; // Midday (e.g. "14:00")
  slot3Time: string; // Evening (e.g. "20:00")
  slot1Enabled: boolean;
  slot2Enabled: boolean;
  slot3Enabled: boolean;
  lastSentSlotDate?: {
    slot1?: string;
    slot2?: string;
    slot3?: string;
  };
}

export interface Settings {
  startDate: string; // ISO date string YYYY-MM-DD
  dailyTarget: 1 | 2 | 3;
  remindersEnabled: boolean;
  reminderTime: string; // e.g. "20:00" (8:00 PM)
  streakFreezesAvailable: number; // default 2 shields
  streakFreezesUsed: StreakFreezeRecord[];
  lastNotificationDate?: string;
  mobileReminders: MobileNotificationSettings;
  openRouterApiKey?: string;
  aiModel?: string;
}

export interface AppStore {
  problemData: Record<string, UserProblemData>;
  settings: Settings;
  theme: 'dark' | 'light';
  customProblems: Problem[];
}

export const DEFAULT_MOBILE_REMINDERS: MobileNotificationSettings = {
  channel: 'telegram',
  telegramBotToken: '',
  telegramChatId: '',
  whatsappPhone: '',
  whatsappApiKey: '',
  customWebhookUrl: '',
  emailAddress: '',
  slot1Time: '09:00',
  slot2Time: '14:00',
  slot3Time: '20:00',
  slot1Enabled: true,
  slot2Enabled: true,
  slot3Enabled: true,
  lastSentSlotDate: {},
};

const DEFAULT_SETTINGS: Settings = {
  startDate: new Date().toISOString().split('T')[0],
  dailyTarget: 2,
  remindersEnabled: false,
  reminderTime: '20:00', // 8:00 PM default
  streakFreezesAvailable: 2, // 2 shields granted
  streakFreezesUsed: [],
  mobileReminders: DEFAULT_MOBILE_REMINDERS,
  openRouterApiKey: (import.meta.env.VITE_OPENROUTER_API_KEY as string) || '',
  aiModel: 'deepseek/deepseek-chat',
};

const DEFAULT_USER_PROBLEM: UserProblemData = {
  status: 'not-started',
  completedAt: undefined,
  notes: '',
  needsRevision: false,
  personalDifficulty: 0,
};

function migrateStorage(): void {
  const version = parseInt(localStorage.getItem(KEYS.VERSION) || '0', 10);
  if (version < STORAGE_VERSION) {
    // Run migrations if needed
    localStorage.setItem(KEYS.VERSION, String(STORAGE_VERSION));
  }
}

export function loadStore(): AppStore {
  try {
    migrateStorage();
    const rawProblemData = localStorage.getItem(KEYS.PROBLEM_DATA);
    const rawSettings = localStorage.getItem(KEYS.SETTINGS);
    const rawTheme = localStorage.getItem(KEYS.THEME);
    const rawCustomProblems = localStorage.getItem(KEYS.CUSTOM_PROBLEMS);

    const problemData: Record<string, UserProblemData> = rawProblemData
      ? JSON.parse(rawProblemData)
      : {};

    const parsedSettings = rawSettings ? JSON.parse(rawSettings) : {};
    const settings: Settings = {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
      mobileReminders: {
        ...DEFAULT_MOBILE_REMINDERS,
        ...(parsedSettings.mobileReminders || {}),
      },
    };

    const customProblems: Problem[] = rawCustomProblems
      ? JSON.parse(rawCustomProblems)
      : [];

    // Auto-migrate decommissioned models like google/gemini-2.0-flash-001
    if (!settings.aiModel || settings.aiModel.includes('gemini-2.0-flash-001') || settings.aiModel.includes('gemini-2.0-flash-exp')) {
      settings.aiModel = 'deepseek/deepseek-chat';
    }

    const theme = (rawTheme === 'light' ? 'light' : 'dark') as 'dark' | 'light';

    return { problemData, settings, theme, customProblems };
  } catch (e) {
    console.warn('Failed to load store, using defaults:', e);
    return {
      problemData: {},
      settings: DEFAULT_SETTINGS,
      theme: 'dark',
      customProblems: [],
    };
  }
}

export function saveCustomProblems(customProblems: Problem[]): void {
  try {
    localStorage.setItem(KEYS.CUSTOM_PROBLEMS, JSON.stringify(customProblems));
  } catch (e) {
    console.error('Failed to save custom problems:', e);
  }
}

export function addCustomProblem(
  store: AppStore,
  input: Omit<Problem, 'id' | 'isCustom' | 'createdAt'>
): { nextStore: AppStore; newProblem: Problem } {
  const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newProblem: Problem = {
    ...input,
    id,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
  const nextCustom = [newProblem, ...(store.customProblems || [])];
  saveCustomProblems(nextCustom);
  const nextStore: AppStore = { ...store, customProblems: nextCustom };
  return { nextStore, newProblem };
}

export function deleteCustomProblem(store: AppStore, problemId: string): AppStore {
  const nextCustom = (store.customProblems || []).filter(p => p.id !== problemId);
  saveCustomProblems(nextCustom);
  const nextProblemData = { ...store.problemData };
  delete nextProblemData[problemId];
  saveProblemData(nextProblemData);
  return { ...store, customProblems: nextCustom, problemData: nextProblemData };
}

export function editCustomProblem(
  store: AppStore,
  problemId: string,
  updates: Partial<Problem>
): AppStore {
  const nextCustom = (store.customProblems || []).map(p =>
    p.id === problemId ? { ...p, ...updates } : p
  );
  saveCustomProblems(nextCustom);
  return { ...store, customProblems: nextCustom };
}

export function saveProblemData(problemData: Record<string, UserProblemData>): void {
  try {
    localStorage.setItem(KEYS.PROBLEM_DATA, JSON.stringify(problemData));
  } catch (e) {
    console.error('Failed to save problem data:', e);
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function saveTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}

export function getProblemData(problemId: string, store: AppStore): UserProblemData {
  return store.problemData[problemId] ?? { ...DEFAULT_USER_PROBLEM };
}

export function updateProblemData(
  store: AppStore,
  problemId: string,
  updates: Partial<UserProblemData>
): AppStore {
  const existing = getProblemData(problemId, store);
  const updated: UserProblemData = { ...existing, ...updates };
  const newProblemData = { ...store.problemData, [problemId]: updated };
  saveProblemData(newProblemData);
  return { ...store, problemData: newProblemData };
}

export function markProblemSolved(store: AppStore, problemId: string): AppStore {
  const existing = getProblemData(problemId, store);
  const srs = existing.srs || initSpacedRepetition();
  return updateProblemData(store, problemId, {
    status: 'solved',
    completedAt: new Date().toISOString(),
    srs,
  });
}

export function recordSpacedReview(
  store: AppStore,
  problemId: string,
  grade: SpacedRepetitionGrade
): AppStore {
  const existing = getProblemData(problemId, store);
  const nextSrs = calculateNextReview(existing.srs, grade);
  return updateProblemData(store, problemId, {
    srs: nextSrs,
    // When review completed, clear manual revision flag if it was set
    needsRevision: grade === 'hard',
  });
}

export function unmarkProblemSolved(store: AppStore, problemId: string): AppStore {
  return updateProblemData(store, problemId, {
    status: 'not-started',
    completedAt: undefined,
  });
}

export function exportProgress(store: AppStore): string {
  return JSON.stringify({
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    problemData: store.problemData,
    settings: store.settings,
    customProblems: store.customProblems || [],
  }, null, 2);
}

export function importProgress(jsonStr: string): Partial<AppStore> | null {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.problemData || !data.settings) {
      throw new Error('Invalid format');
    }
    return {
      problemData: data.problemData,
      settings: { ...DEFAULT_SETTINGS, ...data.settings },
      customProblems: Array.isArray(data.customProblems) ? data.customProblems : [],
    };
  } catch (e) {
    console.error('Failed to import progress:', e);
    return null;
  }
}

export function resetProgress(): void {
  localStorage.removeItem(KEYS.PROBLEM_DATA);
}

export function updateProblemStatus(
  store: AppStore,
  problemId: string,
  status: ProblemStatus
): AppStore {
  const existing = getProblemData(problemId, store);
  const updates: Partial<UserProblemData> = { status };
  if (status === 'solved' && !existing.completedAt) {
    updates.completedAt = new Date().toISOString();
  } else if (status !== 'solved') {
    updates.completedAt = undefined;
  }
  return updateProblemData(store, problemId, updates);
}

export interface ProblemChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export function getProblemChatHistory(problemId: string): ProblemChatMessage[] {
  try {
    const raw = localStorage.getItem(`dsa30_ai_chat_${problemId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveProblemChatHistory(problemId: string, messages: ProblemChatMessage[]): void {
  try {
    localStorage.setItem(`dsa30_ai_chat_${problemId}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
}

export function clearProblemChatHistory(problemId: string): void {
  try {
    localStorage.removeItem(`dsa30_ai_chat_${problemId}`);
  } catch (e) {
    console.error('Failed to clear chat history:', e);
  }
}

/**
 * Consumes 1 streak freeze to protect a missed calendar date
 */
export function useStreakFreeze(
  store: AppStore,
  dateStr: string,
  reason: string = 'Automatic Streak Shield'
): AppStore {
  if (store.settings.streakFreezesAvailable <= 0) return store;

  // Avoid duplicate freezes on the same date
  if (store.settings.streakFreezesUsed.some(f => f.date === dateStr)) {
    return store;
  }

  const nextSettings: Settings = {
    ...store.settings,
    streakFreezesAvailable: Math.max(0, store.settings.streakFreezesAvailable - 1),
    streakFreezesUsed: [...store.settings.streakFreezesUsed, { date: dateStr, reason }],
  };

  saveSettings(nextSettings);
  return { ...store, settings: nextSettings };
}

/**
 * Refills available streak freezes (e.g. earned by 7-day streak or repair)
 */
export function refillStreakFreeze(store: AppStore, count: number = 1): AppStore {
  const nextSettings: Settings = {
    ...store.settings,
    streakFreezesAvailable: Math.min(3, (store.settings.streakFreezesAvailable || 0) + count),
  };

  saveSettings(nextSettings);
  return { ...store, settings: nextSettings };
}
