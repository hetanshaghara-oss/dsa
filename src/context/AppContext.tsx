import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserProblemData, ProblemStatus } from '../data/problems';
import {
  loadStore,
  saveProblemData,
  saveSettings,
  saveTheme,
  getProblemData,
  markProblemSolved,
  unmarkProblemSolved,
  updateProblemData,
  updateProblemStatus,
  exportProgress,
  importProgress,
  resetProgress,
} from '../store/localStorage';
import type { AppStore, Settings } from '../store/localStorage';
import { computeAnalytics } from '../store/analytics';
import type { Analytics } from '../store/analytics';

interface AppContextValue {
  store: AppStore;
  analytics: Analytics;
  getProblemUserData: (problemId: string) => UserProblemData;
  toggleSolved: (problemId: string) => void;
  setProblemStatus: (problemId: string, status: ProblemStatus) => void;
  updateNotes: (problemId: string, notes: string) => void;
  toggleRevision: (problemId: string) => void;
  setPersonalDifficulty: (problemId: string, rating: number) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  toggleTheme: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAll: () => void;
  notification: { message: string; type: 'success' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore>(() => loadStore());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const analytics = computeAnalytics(store);

  // Apply theme to document
  useEffect(() => {
    if (store.theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [store.theme]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const getProblemUserData = useCallback((problemId: string): UserProblemData => {
    return getProblemData(problemId, store);
  }, [store]);

  const toggleSolved = useCallback((problemId: string) => {
    setStore(prev => {
      const pd = getProblemData(problemId, prev);
      const next = pd.status === 'solved'
        ? unmarkProblemSolved(prev, problemId)
        : markProblemSolved(prev, problemId);
      const wasSolved = pd.status === 'solved';
      showNotification(
        wasSolved ? 'Problem unmarked' : '🎉 Problem marked as solved!',
        'success'
      );
      return next;
    });
  }, [showNotification]);

  const setProblemStatus = useCallback((problemId: string, status: ProblemStatus) => {
    setStore(prev => updateProblemStatus(prev, problemId, status));
  }, []);

  const updateNotes = useCallback((problemId: string, notes: string) => {
    setStore(prev => updateProblemData(prev, problemId, { notes }));
  }, []);

  const toggleRevision = useCallback((problemId: string) => {
    setStore(prev => {
      const pd = getProblemData(problemId, prev);
      return updateProblemData(prev, problemId, { needsRevision: !pd.needsRevision });
    });
  }, []);

  const setPersonalDifficulty = useCallback((problemId: string, rating: number) => {
    setStore(prev => updateProblemData(prev, problemId, { personalDifficulty: rating }));
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setStore(prev => {
      const newSettings = { ...prev.settings, ...updates };
      saveSettings(newSettings);
      return { ...prev, settings: newSettings };
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setStore(prev => {
      const newTheme = prev.theme === 'dark' ? 'light' : 'dark';
      saveTheme(newTheme);
      return { ...prev, theme: newTheme };
    });
  }, []);

  const exportData = useCallback((): string => {
    return exportProgress(store);
  }, [store]);

  const importData = useCallback((json: string): boolean => {
    const imported = importProgress(json);
    if (!imported) {
      showNotification('Failed to import — invalid format', 'error');
      return false;
    }
    setStore(prev => {
      const next = { ...prev, ...imported };
      if (imported.problemData) saveProblemData(imported.problemData);
      if (imported.settings) saveSettings(imported.settings);
      return next;
    });
    showNotification('Progress imported successfully!', 'success');
    return true;
  }, [showNotification]);

  const resetAll = useCallback(() => {
    resetProgress();
    setStore(prev => ({ ...prev, problemData: {} }));
    showNotification('Progress has been reset', 'success');
  }, [showNotification]);

  return (
    <AppContext.Provider value={{
      store,
      analytics,
      getProblemUserData,
      toggleSolved,
      setProblemStatus,
      updateNotes,
      toggleRevision,
      setPersonalDifficulty,
      updateSettings,
      toggleTheme,
      exportData,
      importData,
      resetAll,
      notification,
      showNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
