import type { Problem, SpacedRepetitionData, SpacedRepetitionGrade, UserProblemData } from '../data/problems';

/**
 * Standard Spaced Repetition interval ladder as requested:
 * Day 1, 3, 7, 14, and 30 after solving.
 */
export const SRS_INTERVALS = [1, 3, 7, 14, 30] as const;

export function formatDateToYMD(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(baseDate: Date | string, days: number): string {
  const d = typeof baseDate === 'string' ? new Date(baseDate) : new Date(baseDate.getTime());
  d.setDate(d.getDate() + days);
  return formatDateToYMD(d);
}

export function getTodayYMD(): string {
  return formatDateToYMD(new Date());
}

/**
 * Initial SRS state when a problem is first marked as solved.
 * Schedules review for Day 1 (tomorrow).
 */
export function initSpacedRepetition(fromDate: Date = new Date()): SpacedRepetitionData {
  return {
    interval: 1,
    step: 0,
    easeFactor: 2.5,
    dueDate: addDaysToDate(fromDate, 1),
    reviewCount: 0,
  };
}

/**
 * SuperMemo / Anki based adjustment algorithm:
 * - Hard: Resets interval to 1 day (tomorrow), reduces ease factor by 0.2
 * - Medium: Advances to next interval in ladder (1 -> 3 -> 7 -> 14 -> 30), maintains ease factor
 * - Easy: Advances +2 intervals (or scales up by easeFactor * 1.3), increases ease factor by 0.15
 */
export function calculateNextReview(
  current: SpacedRepetitionData | undefined,
  grade: SpacedRepetitionGrade
): SpacedRepetitionData {
  const existing = current || initSpacedRepetition();
  let nextStep = existing.step;
  let nextInterval = existing.interval;
  let nextEase = existing.easeFactor;

  if (grade === 'hard') {
    // Lapse / Failure to recall: reset to Day 1
    nextStep = 0;
    nextInterval = 1;
    nextEase = Math.max(1.3, nextEase - 0.2);
  } else if (grade === 'medium') {
    // Normal successful recall: advance 1 step
    nextStep = nextStep + 1;
    if (nextStep < SRS_INTERVALS.length) {
      nextInterval = SRS_INTERVALS[nextStep];
    } else {
      // Past 30 days: multiply by ease factor
      nextInterval = Math.max(35, Math.round(existing.interval * nextEase));
    }
  } else if (grade === 'easy') {
    // Quick / effortless recall: advance 2 steps or scale higher
    nextStep = nextStep + 2;
    if (nextStep < SRS_INTERVALS.length) {
      nextInterval = SRS_INTERVALS[nextStep];
    } else {
      nextInterval = Math.max(45, Math.round(existing.interval * nextEase * 1.35));
    }
    nextEase = Math.min(3.0, nextEase + 0.15);
  }

  const nextDueDate = addDaysToDate(new Date(), nextInterval);

  return {
    interval: nextInterval,
    step: nextStep,
    easeFactor: Math.round(nextEase * 100) / 100,
    dueDate: nextDueDate,
    lastReviewedAt: new Date().toISOString(),
    reviewCount: existing.reviewCount + 1,
    lastGrade: grade,
  };
}

/**
 * Returns true if the problem is due for review today or overdue,
 * or if it was manually flagged for revision.
 */
export function isProblemDue(userData: UserProblemData, today: string = getTodayYMD()): boolean {
  if (userData.needsRevision || userData.status === 'needs-revision') {
    return true;
  }
  if (userData.status === 'solved' && userData.srs?.dueDate) {
    return userData.srs.dueDate <= today;
  }
  return false;
}

/**
 * Get difference in days from today to due date
 * <= 0 means due today or overdue
 * > 0 means due in N days
 */
export function getDaysUntilDue(dueDateStr?: string, todayStr: string = getTodayYMD()): number {
  if (!dueDateStr) return 0;
  const due = new Date(dueDateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns human-readable stage badge info for Spaced Repetition level
 */
export function getSRSStageInfo(srs?: SpacedRepetitionData): {
  label: string;
  badge: string;
  color: string;
  bg: string;
  border: string;
  intervalText: string;
} {
  if (!srs || srs.reviewCount === 0) {
    return {
      label: 'Initial Day 1',
      badge: 'Day 1',
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.3)',
      intervalText: '1 day interval',
    };
  }

  const step = srs.step;
  if (step === 0) {
    return {
      label: 'Day 1 Recall',
      badge: 'Day 1',
      color: '#f87171',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      intervalText: '1 day interval',
    };
  }
  if (step === 1) {
    return {
      label: 'Day 3 Interval',
      badge: 'Day 3',
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      intervalText: '3 days interval',
    };
  }
  if (step === 2) {
    return {
      label: 'Day 7 Retention',
      badge: 'Day 7',
      color: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.12)',
      border: 'rgba(167, 139, 250, 0.3)',
      intervalText: '7 days interval',
    };
  }
  if (step === 3) {
    return {
      label: 'Day 14 Consolidation',
      badge: 'Day 14',
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.12)',
      border: 'rgba(52, 211, 153, 0.3)',
      intervalText: '14 days interval',
    };
  }
  if (step === 4) {
    return {
      label: 'Day 30 Mastery',
      badge: 'Day 30',
      color: '#22d3ee',
      bg: 'rgba(34, 211, 238, 0.12)',
      border: 'rgba(34, 211, 238, 0.3)',
      intervalText: '30 days interval',
    };
  }
  return {
    label: `Mastered (${srs.interval}d)`,
    badge: `${srs.interval}d`,
    color: '#e879f9',
    bg: 'rgba(232, 121, 249, 0.12)',
    border: 'rgba(232, 121, 249, 0.3)',
    intervalText: `${srs.interval} days interval`,
  };
}
