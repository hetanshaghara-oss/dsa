import { useApp } from '../context/AppContext';
import { PROBLEMS } from '../data/problems';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  CheckCircle2, Target, Flame, Trophy, TrendingUp,
  BarChart2, Clock, Zap, Activity, Layers, BookOpen, Award
} from 'lucide-react';
import { AchievementsList } from '../components/ui/AchievementsList';

const TOPIC_COLORS: Record<string, string> = {
  Stack: '#818cf8',
  Queue: '#a78bfa',
  Deque: '#f472b6',
  'Linked List': '#2dd4bf',
  'Binary Tree': '#34d399',
  Mixed: '#fbbf24',
};

const DIFF_COLORS = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#fb7185' };

export function Analytics() {
  const { analytics } = useApp();

  const topicData = Object.entries(analytics.byTopic).map(([topic, data]) => ({
    topic,
    completed: data.completed,
    total: data.total,
    pct: Math.round((data.completed / data.total) * 100),
    color: TOPIC_COLORS[topic] || '#818cf8',
  }));

  const diffData = [
    { name: 'Easy', ...analytics.byDifficulty.Easy, color: DIFF_COLORS.Easy },
    { name: 'Medium', ...analytics.byDifficulty.Medium, color: DIFF_COLORS.Medium },
    { name: 'Hard', ...analytics.byDifficulty.Hard, color: DIFF_COLORS.Hard },
  ];

  const pieData = diffData.map(d => ({ name: d.name, value: d.completed, color: d.color }));

  const statCards = [
    { label: 'Completed', value: analytics.completedProblems, sub: 'of 60 problems', icon: CheckCircle2, color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)' },
    { label: 'Curriculum Done', value: `${analytics.completionPct}%`, sub: 'overall progress', icon: Target, color: '#818cf8', bg: 'rgba(99, 102, 241, 0.12)' },
    { label: 'Current Streak', value: `${analytics.currentStreak}d`, sub: 'consecutive active days', icon: Flame, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)' },
    { label: 'Longest Streak', value: `${analytics.longestStreak}d`, sub: 'all-time record', icon: Trophy, color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.12)' },
    { label: 'Avg / Active Day', value: analytics.avgProblemsPerActiveDay, sub: 'problems per day', icon: TrendingUp, color: '#2dd4bf', bg: 'rgba(20, 184, 166, 0.12)' },
    { label: 'Incomplete Days', value: analytics.incompleteDays, sub: 'days remaining', icon: Clock, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.12)' },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
          Performance & <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
          Real-time metrics, difficulty distribution, and algorithmic topic completion.
        </p>
      </div>

      {/* 6 Key Stats Grid */}
      <div className="analytics-stats-grid">
        {statCards.map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.label}</span>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <stat.icon size={16} color={stat.color} />
              </div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 20,
          marginBottom: 24,
        }}
        className="main-grid-2col"
      >
        {/* Weekly Solves Bar Chart */}
        <div className="card" style={{ padding: 22 }}>
          <div className="section-heading">
            <BarChart2 size={18} style={{ color: 'var(--accent-blue-light)' }} />
            Weekly Solves Distribution
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.weeklyActivity} barSize={34}>
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                formatter={(val: any) => [`${val ?? 0} problem${val !== 1 ? 's' : ''}`, 'Solved']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {analytics.weeklyActivity.map((entry, i) => (
                  <Cell key={i} fill={entry.count > 0 ? '#6366f1' : 'rgba(255, 255, 255, 0.07)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Breakdown */}
        <div className="card" style={{ padding: 22 }}>
          <div className="section-heading">
            <BookOpen size={18} style={{ color: 'var(--accent-blue-light)' }} />
            Difficulty Solves
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {diffData.map(d => {
              const pct = Math.round((d.completed / d.total) * 100);
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`chip ${d.name === 'Easy' ? 'badge-easy' : d.name === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                        {d.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {d.completed}/{d.total} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 7 }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: 999,
                        background: d.color,
                        width: `${pct}%`,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Topic Mastery Progress Table */}
      <div className="card" style={{ padding: 22 }}>
        <div className="section-heading">
          <Layers size={18} style={{ color: 'var(--accent-blue-light)' }} />
          Topic Mastery Breakdown
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {topicData.map(t => (
            <div
              key={t.topic}
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.topic}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: t.color }}>
                  {t.completed}/{t.total} ({t.pct}%)
                </span>
              </div>
              <div className="progress-bar" style={{ height: 6 }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    background: t.color,
                    width: `${t.pct}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamification Badges & Certificate Trigger */}
      <div style={{ marginTop: 24 }}>
        <AchievementsList />
      </div>
    </div>
  );
}
