import type { Analytics } from '../store/analytics';
import type { AppStore } from '../store/localStorage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progress' | 'streak' | 'topic' | 'mastery';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  isUnlocked: (analytics: Analytics, store: AppStore) => boolean;
  progress: (analytics: Analytics, store: AppStore) => { current: number; total: number; pct: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-solve',
    title: 'First Blood',
    description: 'Solve your very first DSA challenge problem.',
    icon: '⚔️',
    category: 'progress',
    rarity: 'Common',
    isUnlocked: (analytics) => analytics.completedProblems >= 1,
    progress: (analytics) => ({
      current: Math.min(analytics.completedProblems, 1),
      total: 1,
      pct: analytics.completedProblems >= 1 ? 100 : 0,
    }),
  },
  {
    id: 'streak-3',
    title: 'Flame Starter',
    description: 'Maintain a 3-day problem-solving streak.',
    icon: '🔥',
    category: 'streak',
    rarity: 'Common',
    isUnlocked: (analytics) => analytics.currentStreak >= 3 || analytics.longestStreak >= 3,
    progress: (analytics) => {
      const best = Math.max(analytics.currentStreak, analytics.longestStreak);
      return {
        current: Math.min(best, 3),
        total: 3,
        pct: Math.min(100, Math.round((best / 3) * 100)),
      };
    },
  },
  {
    id: 'week-1-stack',
    title: 'Stack Sorcerer',
    description: 'Solve all 14 Stack problems in Week 1.',
    icon: '⚡',
    category: 'topic',
    rarity: 'Rare',
    isUnlocked: (analytics) => (analytics.byTopic['Stack']?.completed ?? 0) >= 14,
    progress: (analytics) => {
      const cur = analytics.byTopic['Stack']?.completed ?? 0;
      return { current: Math.min(cur, 14), total: 14, pct: Math.min(100, Math.round((cur / 14) * 100)) };
    },
  },
  {
    id: 'week-2-queue',
    title: 'Queue Commander',
    description: 'Master all Queue and Deque challenges in Week 2.',
    icon: '🔄',
    category: 'topic',
    rarity: 'Rare',
    isUnlocked: (analytics) => {
      const q = (analytics.byTopic['Queue']?.completed ?? 0) + (analytics.byTopic['Deque']?.completed ?? 0);
      return q >= 14;
    },
    progress: (analytics) => {
      const cur = (analytics.byTopic['Queue']?.completed ?? 0) + (analytics.byTopic['Deque']?.completed ?? 0);
      return { current: Math.min(cur, 14), total: 14, pct: Math.min(100, Math.round((cur / 14) * 100)) };
    },
  },
  {
    id: 'week-3-linked',
    title: 'Pointer Prodigy',
    description: 'Conquer all 14 Linked List challenges in Week 3.',
    icon: '🔗',
    category: 'topic',
    rarity: 'Rare',
    isUnlocked: (analytics) => (analytics.byTopic['Linked List']?.completed ?? 0) >= 14,
    progress: (analytics) => {
      const cur = analytics.byTopic['Linked List']?.completed ?? 0;
      return { current: Math.min(cur, 14), total: 14, pct: Math.min(100, Math.round((cur / 14) * 100)) };
    },
  },
  {
    id: 'week-4-tree',
    title: 'Tree Whisperer',
    description: 'Conquer all 14 Binary Tree challenges in Week 4.',
    icon: '🌲',
    category: 'topic',
    rarity: 'Rare',
    isUnlocked: (analytics) => (analytics.byTopic['Binary Tree']?.completed ?? 0) >= 14,
    progress: (analytics) => {
      const cur = analytics.byTopic['Binary Tree']?.completed ?? 0;
      return { current: Math.min(cur, 14), total: 14, pct: Math.min(100, Math.round((cur / 14) * 100)) };
    },
  },
  {
    id: 'streak-7',
    title: 'Unstoppable Force',
    description: 'Maintain a 7-day active daily streak.',
    icon: '🌟',
    category: 'streak',
    rarity: 'Epic',
    isUnlocked: (analytics) => analytics.currentStreak >= 7 || analytics.longestStreak >= 7,
    progress: (analytics) => {
      const best = Math.max(analytics.currentStreak, analytics.longestStreak);
      return { current: Math.min(best, 7), total: 7, pct: Math.min(100, Math.round((best / 7) * 100)) };
    },
  },
  {
    id: 'halfway',
    title: 'Halfway Hero',
    description: 'Solve 30 out of 60 problems (50% curriculum mark).',
    icon: '🎯',
    category: 'progress',
    rarity: 'Epic',
    isUnlocked: (analytics) => analytics.completedProblems >= 30,
    progress: (analytics) => ({
      current: Math.min(analytics.completedProblems, 30),
      total: 30,
      pct: Math.min(100, Math.round((analytics.completedProblems / 30) * 100)),
    }),
  },
  {
    id: 'revisionist',
    title: 'Memory Architect',
    description: 'Flag 5 or more problems for revision.',
    icon: '🔖',
    category: 'mastery',
    rarity: 'Rare',
    isUnlocked: (_, store) => {
      const count = Object.values(store.problemData).filter(p => p.needsRevision || p.status === 'needs-revision').length;
      return count >= 5;
    },
    progress: (_, store) => {
      const count = Object.values(store.problemData).filter(p => p.needsRevision || p.status === 'needs-revision').length;
      return { current: Math.min(count, 5), total: 5, pct: Math.min(100, Math.round((count / 5) * 100)) };
    },
  },
  {
    id: 'grandmaster',
    title: 'DSA Grandmaster',
    description: 'Solve all 60 problems in the 30-Day curriculum!',
    icon: '👑',
    category: 'mastery',
    rarity: 'Legendary',
    isUnlocked: (analytics) => analytics.completedProblems >= 60,
    progress: (analytics) => ({
      current: analytics.completedProblems,
      total: 60,
      pct: analytics.completionPct,
    }),
  },
];
