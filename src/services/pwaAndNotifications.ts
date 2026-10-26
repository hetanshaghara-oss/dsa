// PWA Service Worker & Web Push Notifications Service

let deferredPrompt: any = null;

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !import.meta.env.DEV) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service Worker registration skipped or failed:', err);
      });
    });
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return false;
  }
}

export async function sendLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions: NotificationOptions = {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    body: options?.body || 'DSA 30 Daily Habit Reminder',
    tag: options?.tag || 'dsa30-daily-habit',
    ...options,
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    }
    // Fallback to window.Notification
    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.error('Failed to trigger notification:', err);
    return false;
  }
}

/**
 * Builds and sends the daily habit notification based on current user streak, day, and SRS due count
 */
export async function sendDailyHabitReminder(
  streak: number,
  currentDay: number,
  dueSRSCount: number
): Promise<boolean> {
  let title = 'DSA 30 Practice Time! 🚀';
  let body = `Day ${currentDay} problems are ready. Solve today to keep progressing!`;

  if (dueSRSCount > 0 && streak > 0) {
    title = `🔥 Don't break your ${streak}-day streak!`;
    body = `Day ${currentDay} problems + ${dueSRSCount} Spaced Repetition questions are waiting.`;
  } else if (streak > 0) {
    title = `🔥 Keep your ${streak}-day streak alive!`;
    body = `Day ${currentDay} problems are waiting. Only 2 questions to keep your shield intact!`;
  } else if (dueSRSCount > 0) {
    title = `🧠 Memory Check Due (${dueSRSCount} Questions)`;
    body = `Review your core patterns today before forgetting. Day ${currentDay} is live!`;
  }

  return sendLocalNotification(title, {
    body,
    tag: 'dsa30-daily-habit',
    data: { url: dueSRSCount > 0 ? '/revision' : `/challenge/${currentDay}` },
  });
}

// PWA Install Prompt Listener
export function setupPWAInstallListener(callback: (canInstall: boolean) => void): () => void {
  const handler = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    callback(true);
  };

  window.addEventListener('beforeinstallprompt', handler);

  return () => {
    window.removeEventListener('beforeinstallprompt', handler);
  };
}

export async function promptPWAInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome;
  } catch (e) {
    console.error('Error during PWA install prompt:', e);
    return 'unavailable';
  }
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}
