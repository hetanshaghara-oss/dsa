import { PROBLEMS } from '../data/problems';
import type { Problem } from '../data/problems';
import type { AppStore } from './localStorage';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';

export interface DayStats {
  day: number;
  solved: number;
  total: 2;
  isComplete: boolean;
  isPartial: boolean;
  date?: string; // computed from startDate
}

export interface QuestionMilestone {
  target: number;
  label: string;
  achieved: boolean;
  rewardIcon: string;
}

export interface Analytics {
  totalProblems: number;
  customProblemsCount: number;
  completedProblems: number;
  remainingProblems: number;
  completionPct: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezesAvailable: number;
  streakFreezesUsed: { date: string; reason: string }[];
  isStreakProtectedToday: boolean;
  currentDay: number;
  dayStats: DayStats[];
  byTopic: Record<string, { total: number; completed: number }>;
  byDifficulty: { Easy: { total: number; completed: number }; Medium: { total: number; completed: number }; Hard: { total: number; completed: number } };
  weeklyActivity: { label: string; count: number }[];
  earliestIncompleteDay: number;
  avgProblemsPerActiveDay: number;
  incompleteDays: number;
  milestones: QuestionMilestone[];
  nextMilestone: { target: number; label: string; remaining: number; pct: number };
}

export function computeAnalytics(store: AppStore, allProblems: Problem[] = PROBLEMS): Analytics {
  const { problemData, settings } = store;
  const startDate = parseISO(settings.startDate);
  const today = new Date();

  // Day stats (calculated for the 30-day curriculum)
  const dayStats: DayStats[] = [];
  for (let d = 1; d <= 30; d++) {
    const dayProblems = PROBLEMS.filter(p => p.day === d);
    const solved = dayProblems.filter(p => problemData[p.id]?.status === 'solved').length;
    const total = 2 as const;
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + d - 1);
    dayStats.push({
      day: d,
      solved,
      total,
      isComplete: solved === 2,
      isPartial: solved === 1,
      date: format(dayDate, 'yyyy-MM-dd'),
    });
  }

  const customProblemsCount = store.customProblems?.length || 0;
  const completedProblems = allProblems.filter(p => problemData[p.id]?.status === 'solved').length;
  const totalProblems = allProblems.length;

  // Current day based on start date
  const daysDiff = differenceInCalendarDays(today, startDate);
  const currentDay = Math.min(Math.max(daysDiff + 1, 1), 30);

  // Streaks based on calendar days with at least one problem solved or protected by streak freeze
  const completionTimestamps = Object.values(problemData)
    .filter(pd => pd.status === 'solved' && pd.completedAt)
    .map(pd => format(parseISO(pd.completedAt!), 'yyyy-MM-dd'));

  const frozenDaysList = (settings.streakFreezesUsed || []).map(f => f.date);
  const frozenDaysSet = new Set(frozenDaysList);
  const activeDaysSet = new Set([...completionTimestamps, ...frozenDaysSet]);

  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
  const isStreakProtectedToday = frozenDaysSet.has(todayStr) || frozenDaysSet.has(yesterdayStr);

  // Streak calculation
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Build sorted list of unique active dates
  const activeDays = Array.from(activeDaysSet).sort();

  if (activeDays.length > 0) {
    tempStreak = 1;
    for (let i = 1; i < activeDays.length; i++) {
      const prev = parseISO(activeDays[i - 1]);
      const curr = parseISO(activeDays[i]);
      const diff = differenceInCalendarDays(curr, prev);
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak (ending today or yesterday)
    const checkDate = activeDaysSet.has(todayStr) ? today : (activeDaysSet.has(yesterdayStr) ? yesterday : null);
    if (checkDate) {
      currentStreak = 1;
      const prevCheck = new Date(checkDate);
      prevCheck.setDate(prevCheck.getDate() - 1);
      while (activeDaysSet.has(format(prevCheck, 'yyyy-MM-dd'))) {
        currentStreak++;
        prevCheck.setDate(prevCheck.getDate() - 1);
      }
    }
  }

  // By topic across ALL problems (curriculum + custom)
  const byTopic: Record<string, { total: number; completed: number }> = {};
  allProblems.forEach(p => {
    if (!byTopic[p.topic]) byTopic[p.topic] = { total: 0, completed: 0 };
    byTopic[p.topic].total++;
    if (problemData[p.id]?.status === 'solved') byTopic[p.topic].completed++;
  });

  // By difficulty across ALL problems
  const byDifficulty = {
    Easy: { total: 0, completed: 0 },
    Medium: { total: 0, completed: 0 },
    Hard: { total: 0, completed: 0 },
  };
  allProblems.forEach(p => {
    if (byDifficulty[p.difficulty]) {
      byDifficulty[p.difficulty].total++;
      if (problemData[p.id]?.status === 'solved') byDifficulty[p.difficulty].completed++;
    }
  });

  // Weekly activity (last 7 days across all problems)
  const weeklyActivity: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const label = format(d, 'EEE');
    const count = allProblems.filter(p => {
      const pd = problemData[p.id];
      if (!pd?.completedAt) return false;
      return format(parseISO(pd.completedAt), 'yyyy-MM-dd') === dateStr;
    }).length;
    weeklyActivity.push({ label, count });
  }

  // Earliest incomplete day
  const earliestIncompleteDay = dayStats.find(d => !d.isComplete)?.day ?? 30;

  // Active days count
  const incompleteDays = dayStats.filter(d => d.solved < 2 && d.day <= currentDay).length;
  const activeDaysCount = activeDays.length;
  const avgProblemsPerActiveDay = activeDaysCount > 0
    ? Math.round((completedProblems / activeDaysCount) * 10) / 10
    : 0;

  // Question-based milestones
  const milestoneConfig: { target: number; label: string; rewardIcon: string }[] = [
    { target: 10, label: '10 Problems Solved', rewardIcon: '🌱' },
    { target: 25, label: '25 Problems Mastered', rewardIcon: '⚡' },
    { target: 50, label: '50 Problems Conquered', rewardIcon: '⚔️' },
    { target: 60, label: 'Curriculum Complete (60)', rewardIcon: '👑' },
    { target: 75, label: '75 Elite Problems', rewardIcon: '💎' },
    { target: 100, label: 'The 100 Centurion Club', rewardIcon: '🏆' },
    { target: 150, label: '150 DSA Legend', rewardIcon: '🔥' },
  ];

  const milestones: QuestionMilestone[] = milestoneConfig.map(m => ({
    ...m,
    achieved: completedProblems >= m.target,
  }));

  const nextUnachieved = milestoneConfig.find(m => completedProblems < m.target) || {
    target: completedProblems + 25,
    label: `${completedProblems + 25} Problems Milestone`,
    rewardIcon: '🌟',
  };

  const nextMilestone = {
    target: nextUnachieved.target,
    label: nextUnachieved.label,
    remaining: Math.max(0, nextUnachieved.target - completedProblems),
    pct: Math.min(100, Math.round((completedProblems / nextUnachieved.target) * 100)),
  };

  return {
    totalProblems,
    customProblemsCount,
    completedProblems,
    remainingProblems: Math.max(0, totalProblems - completedProblems),
    completionPct: totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0,
    currentStreak,
    longestStreak,
    streakFreezesAvailable: settings.streakFreezesAvailable ?? 2,
    streakFreezesUsed: settings.streakFreezesUsed || [],
    isStreakProtectedToday,
    currentDay,
    dayStats,
    byTopic,
    byDifficulty,
    weeklyActivity,
    earliestIncompleteDay,
    avgProblemsPerActiveDay,
    incompleteDays,
    milestones,
    nextMilestone,
  };
}
