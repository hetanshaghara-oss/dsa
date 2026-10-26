import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { PROBLEMS } from '../data/problems';
import type { UserProblemData, ProblemStatus, Problem, SpacedRepetitionGrade } from '../data/problems';
import {
  loadStore,
  saveProblemData,
  saveSettings,
  saveTheme,
  getProblemData,
  markProblemSolved,
  unmarkProblemSolved,
  recordSpacedReview,
  updateProblemData,
  updateProblemStatus,
  exportProgress,
  importProgress,
  resetProgress,
  addCustomProblem as addCustomProblemStorage,
  deleteCustomProblem as deleteCustomProblemStorage,
  editCustomProblem as editCustomProblemStorage,
  saveCustomProblems,
  useStreakFreeze,
  refillStreakFreeze,
} from '../store/localStorage';
import type { AppStore, Settings } from '../store/localStorage';
import { computeAnalytics } from '../store/analytics';
import type { Analytics } from '../store/analytics';
import {
  registerServiceWorker,
  setupPWAInstallListener,
  promptPWAInstall,
  isAppInstalled,
  sendDailyHabitReminder,
} from '../services/pwaAndNotifications';
import { isProblemDue } from '../services/spacedRepetition';
import {
  sendTelegramMessage,
  sendWhatsAppMessage,
  sendCustomWebhook,
  type MessagePayload,
} from '../services/mobileMessageService';

interface AppContextValue {
  store: AppStore;
  allProblems: Problem[];
  analytics: Analytics;
  getProblemUserData: (problemId: string) => UserProblemData;
  toggleSolved: (problemId: string) => void;
  setProblemStatus: (problemId: string, status: ProblemStatus) => void;
  updateNotes: (problemId: string, notes: string) => void;
  toggleRevision: (problemId: string) => void;
  reviewSpacedProblem: (problemId: string, grade: SpacedRepetitionGrade) => void;
  setPersonalDifficulty: (problemId: string, rating: number) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  toggleTheme: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetAll: () => void;
  addProblem: (problem: Omit<Problem, 'id' | 'isCustom' | 'createdAt'>) => Problem;
  deleteProblem: (problemId: string) => void;
  editProblem: (problemId: string, updates: Partial<Problem>) => void;
  addProblemModalOpen: boolean;
  setAddProblemModalOpen: (open: boolean) => void;
  useStreakShield: (dateStr?: string) => void;
  refillStreakShields: () => void;
  canInstallPWA: boolean;
  installPWA: () => Promise<void>;
  isStandalone: boolean;
  sendMobileReminderNow: (slot?: 'morning' | 'afternoon' | 'evening' | 'test') => Promise<{ success: boolean; error?: string }>;
  notification: { message: string; type: 'success' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore>(() => loadStore());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [addProblemModalOpen, setAddProblemModalOpen] = useState(false);

  // Dynamically merge standard curriculum problems with user's custom added questions
  const allProblems = useMemo(() => {
    return [...PROBLEMS, ...(store.customProblems || [])];
  }, [store.customProblems]);

  const analytics = useMemo(() => {
    return computeAnalytics(store, allProblems);
  }, [store, allProblems]);

  // Apply theme to document
  useEffect(() => {
    if (store.theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [store.theme]);

  // PWA install prompt state
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isStandalone] = useState(() => isAppInstalled());

  useEffect(() => {
    registerServiceWorker();
    const cleanup = setupPWAInstallListener(canInstall => {
      setCanInstallPWA(canInstall);
    });
    return cleanup;
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const installPWA = useCallback(async () => {
    const outcome = await promptPWAInstall();
    if (outcome === 'accepted') {
      setCanInstallPWA(false);
      showNotification('📱 DSA 30 App installed successfully!', 'success');
    }
  }, [showNotification]);

  const useStreakShield = useCallback((dateStr?: string) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    setStore(prev => {
      const next = useStreakFreeze(prev, targetDate, 'Manual Streak Protection');
      showNotification('🛡️ Streak Shield Activated! Day protected.', 'success');
      return next;
    });
  }, [showNotification]);

  const refillStreakShields = useCallback(() => {
    setStore(prev => {
      const next = refillStreakFreeze(prev, 1);
      showNotification('🛡️ +1 Streak Shield added to your inventory!', 'success');
      return next;
    });
  }, [showNotification]);

  // Duolingo-style automatic streak shield protection on day miss
  useEffect(() => {
    if ((store.settings.streakFreezesAvailable || 0) <= 0) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    const dayBeforeStr = dayBefore.toISOString().split('T')[0];

    const completionDates = new Set(
      Object.values(store.problemData)
        .filter(pd => pd.status === 'solved' && pd.completedAt)
        .map(pd => pd.completedAt!.split('T')[0])
    );
    const frozenDates = new Set((store.settings.streakFreezesUsed || []).map(f => f.date));

    // If user was active day-before-yesterday, but missed yesterday and not yet shielded:
    if (
      (completionDates.has(dayBeforeStr) || frozenDates.has(dayBeforeStr)) &&
      !completionDates.has(yesterdayStr) &&
      !frozenDates.has(yesterdayStr)
    ) {
      setStore(prev => {
        const next = useStreakFreeze(prev, yesterdayStr, 'Duolingo-style Auto Streak Shield');
        showNotification(
          '🛡️ Streak Shield Activated! Yesterday was missed, but your shield protected your streak!',
          'success'
        );
        return next;
      });
    }
  }, []);

  // Dispatch reminder to chosen channel (Telegram / WhatsApp / Webhook / Push)
  const sendMobileReminderNow = useCallback(async (
    slot: 'morning' | 'afternoon' | 'evening' | 'test' = 'test'
  ): Promise<{ success: boolean; error?: string }> => {
    const config = store.settings.mobileReminders;
    const dueCount = allProblems.filter(p => isProblemDue(getProblemData(p.id, store))).length;
    const dayProblems = allProblems.filter(p => p.day === analytics.currentDay);

    let title = 'DSA 30 Practice Reminder';
    let body = 'Keep your daily momentum alive!';

    if (slot === 'morning') {
      title = `DSA 30: Morning Kickoff (Day ${analytics.currentDay})`;
      body = `Solve 2 algorithmic questions today to keep your ${analytics.currentStreak}-day streak alive!`;
    } else if (slot === 'afternoon') {
      title = `DSA 30: Midday Memory & Recall Check`;
      body = dueCount > 0
        ? `You have ${dueCount} questions due for Spaced Repetition review today. Test your invariant memory!`
        : `Check in on today's Day ${analytics.currentDay} challenge! Consistency is king.`;
    } else if (slot === 'evening') {
      title = `DSA 30: Evening Streak Alert! 🔥`;
      body = `Don't break your ${analytics.currentStreak}-day streak! Shield intact: ${analytics.streakFreezesAvailable} left.`;
    } else {
      title = `DSA 30: Mobile Connection Test ✅`;
      body = `Your mobile reminder channel (${config.channel.toUpperCase()}) is connected successfully! You will receive daily 3-time updates on your phone.`;
    }

    const payload: MessagePayload = {
      title,
      body,
      slot,
      day: analytics.currentDay,
      streak: analytics.currentStreak,
      srsDueCount: dueCount,
      problems: dayProblems.map(p => ({
        title: p.title,
        number: p.number,
        difficulty: p.difficulty,
        url: p.url,
      })),
    };

    if (config.channel === 'telegram') {
      return sendTelegramMessage(config.telegramBotToken || '', config.telegramChatId || '', payload);
    } else if (config.channel === 'whatsapp') {
      return sendWhatsAppMessage(config.whatsappPhone || '', config.whatsappApiKey || '', payload);
    } else if (config.channel === 'webhook') {
      return sendCustomWebhook(config.customWebhookUrl || '', payload);
    } else {
      // Local push fallback
      const sent = await sendDailyHabitReminder(analytics.currentStreak, analytics.currentDay, dueCount);
      return { success: sent, error: sent ? undefined : 'Push notification failed or not granted.' };
    }
  }, [
    store.settings.mobileReminders,
    allProblems,
    analytics.currentDay,
    analytics.currentStreak,
    analytics.streakFreezesAvailable,
    store,
  ]);

  // Daily 3-Time Reminders Scheduler (Morning, Midday, Evening)
  useEffect(() => {
    if (!store.settings.remindersEnabled) return;

    const check3TimesSlots = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      const config = store.settings.mobileReminders;
      const lastSent = config.lastSentSlotDate || {};

      const checkSlot = (
        slotKey: 'slot1' | 'slot2' | 'slot3',
        timeStr: string,
        slotType: 'morning' | 'afternoon' | 'evening'
      ) => {
        if (lastSent[slotKey] === todayStr) return;
        const [h, m] = (timeStr || '09:00').split(':').map(Number);
        if (currentH > h || (currentH === h && currentM >= m)) {
          sendMobileReminderNow(slotType);
          setStore(prev => {
            const nextSettings: Settings = {
              ...prev.settings,
              mobileReminders: {
                ...config,
                lastSentSlotDate: {
                  ...lastSent,
                  [slotKey]: todayStr,
                },
              },
            };
            saveSettings(nextSettings);
            return { ...prev, settings: nextSettings };
          });
        }
      };

      if (config.slot1Enabled) checkSlot('slot1', config.slot1Time || '09:00', 'morning');
      if (config.slot2Enabled) checkSlot('slot2', config.slot2Time || '14:00', 'afternoon');
      if (config.slot3Enabled) checkSlot('slot3', config.slot3Time || '20:00', 'evening');
    };

    check3TimesSlots();
    const interval = setInterval(check3TimesSlots, 60000);
    return () => clearInterval(interval);
  }, [store.settings.remindersEnabled, store.settings.mobileReminders, sendMobileReminderNow]);

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

  const reviewSpacedProblem = useCallback((problemId: string, grade: SpacedRepetitionGrade) => {
    setStore(prev => {
      const nextStore = recordSpacedReview(prev, problemId, grade);
      const updatedSrs = nextStore.problemData[problemId]?.srs;
      const feedback = grade === 'hard'
        ? '🔁 Reset to Day 1 review (tomorrow)'
        : grade === 'medium'
        ? `👍 Good recall! Next review in ${updatedSrs?.interval || 3} days`
        : `⚡ Easy! Pushed ahead to ${updatedSrs?.interval || 7} days`;
      showNotification(feedback, 'success');
      return nextStore;
    });
  }, [showNotification]);

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

  const addProblem = useCallback((problemInput: Omit<Problem, 'id' | 'isCustom' | 'createdAt'>): Problem => {
    let created: Problem | null = null;
    setStore(prev => {
      const { nextStore, newProblem } = addCustomProblemStorage(prev, problemInput);
      created = newProblem;
      return nextStore;
    });
    showNotification('✨ Question added successfully to your library!', 'success');
    return created!;
  }, [showNotification]);

  const deleteProblem = useCallback((problemId: string) => {
    setStore(prev => deleteCustomProblemStorage(prev, problemId));
    showNotification('Question deleted from your library', 'success');
  }, [showNotification]);

  const editProblem = useCallback((problemId: string, updates: Partial<Problem>) => {
    setStore(prev => editCustomProblemStorage(prev, problemId, updates));
    showNotification('Question updated successfully', 'success');
  }, [showNotification]);

  return (
    <AppContext.Provider value={{
      store,
      allProblems,
      analytics,
      getProblemUserData,
      toggleSolved,
      setProblemStatus,
      updateNotes,
      toggleRevision,
      reviewSpacedProblem,
      setPersonalDifficulty,
      updateSettings,
      toggleTheme,
      exportData,
      importData,
      resetAll,
      addProblem,
      deleteProblem,
      editProblem,
      addProblemModalOpen,
      setAddProblemModalOpen,
      useStreakShield,
      refillStreakShields,
      canInstallPWA,
      installPWA,
      isStandalone,
      sendMobileReminderNow,
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
