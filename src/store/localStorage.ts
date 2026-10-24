import type { UserProblemData, ProblemStatus } from '../data/problems';

const STORAGE_VERSION = 2;
const KEYS = {
  VERSION: 'dsa30_version',
  PROBLEM_DATA: 'dsa30_problem_data',
  SETTINGS: 'dsa30_settings',
  THEME: 'dsa30_theme',
};

export interface Settings {
  startDate: string; // ISO date string YYYY-MM-DD
  dailyTarget: 1 | 2 | 3;
  remindersEnabled: boolean;
  openRouterApiKey?: string;
  aiModel?: string;
}

export interface AppStore {
  problemData: Record<string, UserProblemData>;
  settings: Settings;
  theme: 'dark' | 'light';
}

const DEFAULT_SETTINGS: Settings = {
  startDate: new Date().toISOString().split('T')[0],
  dailyTarget: 2,
  remindersEnabled: false,
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

    const problemData: Record<string, UserProblemData> = rawProblemData
      ? JSON.parse(rawProblemData)
      : {};

    const settings: Settings = rawSettings
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) }
      : DEFAULT_SETTINGS;

    // Auto-migrate decommissioned models like google/gemini-2.0-flash-001
    if (!settings.aiModel || settings.aiModel.includes('gemini-2.0-flash-001') || settings.aiModel.includes('gemini-2.0-flash-exp')) {
      settings.aiModel = 'deepseek/deepseek-chat';
    }

    const theme = (rawTheme === 'light' ? 'light' : 'dark') as 'dark' | 'light';

    return { problemData, settings, theme };
  } catch (e) {
    console.warn('Failed to load store, using defaults:', e);
    return {
      problemData: {},
      settings: DEFAULT_SETTINGS,
      theme: 'dark',
    };
  }
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
  return updateProblemData(store, problemId, {
    status: 'solved',
    completedAt: new Date().toISOString(),
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
