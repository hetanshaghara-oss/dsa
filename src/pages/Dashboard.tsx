import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PROBLEMS, DAY_INFO } from '../data/problems';
import { format, parseISO, addDays } from 'date-fns';
import {
  CheckCircle2, Target, Flame, Trophy, ArrowRight,
  TrendingUp, Zap, Sparkles, Calendar, BookOpen, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { Analytics } from '../store/analytics';

export function Dashboard() {
  const { analytics, store } = useApp();
  const navigate = useNavigate();
  const startDate = parseISO(store.settings.startDate);

  const stats = [
    {
      label: 'Problems Solved',
      value: analytics.completedProblems,
      total: 60,
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      desc: `${analytics.completionPct}% of curriculum done`,
    },
    {
      label: 'Remaining',
      value: analytics.remainingProblems,
      total: 60,
      icon: Target,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.25)',
      desc: `${30 - Math.min(analytics.currentDay - 1, 30)} days schedule`,
    },
    {
      label: 'Current Streak',
      value: analytics.currentStreak,
      suffix: 'days',
      icon: Flame,
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
      desc: analytics.currentStreak > 0 ? 'Consistency is king 🔥' : 'Start your streak today',
    },
    {
      label: 'Longest Streak',
      value: analytics.longestStreak,
      suffix: 'days',
      icon: Trophy,
      color: '#a78bfa',
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.25)',
      desc: 'All-time best streak',
    },
  ];

  // Earliest incomplete day
  const continueDay = analytics.earliestIncompleteDay;
  const continueDayInfo = DAY_INFO[continueDay - 1];
  const continueDayProblems = PROBLEMS.filter(p => p.day === continueDay);

  return (
    <div className="page-container animate-fade-in">
      {/* Hero Welcome Banner */}
      {/* Hero Welcome Banner */}
      <div className="card hero-banner dashboard-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: 12 }}>
              <Sparkles size={13} color="#818cf8" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', color: '#818cf8', textTransform: 'uppercase' }}>
                30-Day Algorithm Mastery
              </span>
            </div>
            <h1 className="dashboard-hero-title" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 8 }}>
              Level Up Your <span className="gradient-text">Problem-Solving</span>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Two curated LeetCode challenges daily in C++. Master Stacks, Queues, Linked Lists, Binary Trees, and core patterns.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: 'auto' }} className="dashboard-hero-btn-wrap">
            <button
              onClick={() => navigate(`/challenge/${continueDay}`)}
              className="btn btn-primary dashboard-hero-btn"
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              Resume Day {continueDay} <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Global Progress Bar Bar */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Curriculum Completion
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ({analytics.completedProblems}/60 solved)
              </span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#818cf8' }}>
              {analytics.completionPct}%
            </span>
          </div>

          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${analytics.completionPct}%` }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap', gap: 4 }}>
            <span>Target: Day {analytics.currentDay} of 30</span>
            <span>Started {format(startDate, 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="dashboard-stats-grid">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="stat-card"
            style={{
              borderColor: stat.border,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.label}</span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${stat.border}`,
                }}
              >
                <stat.icon size={18} color={stat.color} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stat.value}
              </span>
              {stat.total && (
                <span style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600 }}>
                  /{stat.total}
                </span>
              )}
              {stat.suffix && (
                <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {stat.suffix}
                </span>
              )}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {stat.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Calendar Heatmap + Quick Focus */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 20,
          marginBottom: 24,
        }}
        className="main-grid-2col"
      >
        {/* 30-Day Interactive Calendar */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div className="section-heading" style={{ margin: 0 }}>
              <Calendar size={18} style={{ color: 'var(--accent-blue-light)' }} />
              30-Day Challenge Matrix
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Click any day to jump
            </span>
          </div>

          <CalendarGrid
            analytics={analytics}
            startDate={startDate}
            onDayClick={day => navigate(`/challenge/${day}`)}
          />
        </div>

        {/* Up Next & Topic Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Continue Card */}
          <div
            className="card"
            style={{
              padding: 22,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
              borderColor: 'rgba(99, 102, 241, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', color: '#818cf8', textTransform: 'uppercase' }}>
                Next in Queue
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                }}
              >
                Day {continueDay}
              </span>
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {continueDayInfo?.weekName}
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              {continueDayInfo?.objective}
            </div>

            {/* Problems preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {continueDayProblems.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>P{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </span>
                  <span className={`chip ${p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                    {p.difficulty}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(`/challenge/${continueDay}`)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Start Day {continueDay} <ArrowRight size={15} />
            </button>
          </div>

          {/* Topic Progress Breakdown */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-heading" style={{ fontSize: 15, marginBottom: 14 }}>
              <Layers size={16} style={{ color: 'var(--accent-blue-light)' }} />
              Topic Mastery
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(analytics.byTopic).map(([topic, data]) => {
                const pct = Math.round((data.completed / data.total) * 100);
                return (
                  <div key={topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{topic}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {data.completed}/{data.total} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Weekly Chart & Difficulty Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 20,
        }}
        className="main-grid-2col"
      >
        {/* Weekly Solve Bar Chart */}
        <div className="card" style={{ padding: 22 }}>
          <div className="section-heading">
            <TrendingUp size={18} style={{ color: 'var(--accent-blue-light)' }} />
            Weekly Solves Trend
          </div>

          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={analytics.weeklyActivity} barSize={32}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  boxShadow: 'var(--shadow-md)',
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                formatter={(val: any) => [`${val ?? 0} problem${val !== 1 ? 's' : ''}`, 'Solved']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {analytics.weeklyActivity.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.count > 0 ? '#6366f1' : 'rgba(255, 255, 255, 0.07)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Breakdown */}
        <div className="card" style={{ padding: 22 }}>
          <div className="section-heading">
            <BookOpen size={18} style={{ color: 'var(--accent-blue-light)' }} />
            Difficulty Breakdown
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, height: 'calc(100% - 40px)', alignItems: 'center' }}>
            {(['Easy', 'Medium', 'Hard'] as const).map(diff => {
              const data = analytics.byDifficulty[diff];
              const pct = Math.round((data.completed / data.total) * 100);
              const color = diff === 'Easy' ? '#34d399' : diff === 'Medium' ? '#fbbf24' : '#fb7185';
              const bg = diff === 'Easy' ? 'rgba(16, 185, 129, 0.1)' : diff === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(244, 63, 94, 0.1)';
              const border = diff === 'Easy' ? 'rgba(16, 185, 129, 0.25)' : diff === 'Medium' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(244, 63, 94, 0.25)';

              return (
                <div
                  key={diff}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    padding: '16px 12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>
                    {data.completed}
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                      /{data.total}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    {diff}
                  </div>
                  <div className="progress-bar" style={{ height: 5 }}>
                    <div style={{ height: '100%', borderRadius: 999, background: color, width: `${pct}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Calendar Heatmap Grid Component
function CalendarGrid({
  analytics,
  startDate,
  onDayClick,
}: {
  analytics: Analytics;
  startDate: Date;
  onDayClick: (day: number) => void;
}) {
  const today = new Date();

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { cls: 'complete', label: 'Complete (2/2)' },
          { cls: 'partial', label: 'Partial (1/2)' },
          { cls: 'incomplete', label: 'Incomplete' },
          { cls: 'future', label: 'Upcoming' },
        ].map(l => (
          <div key={l.cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className={`day-cell ${l.cls}`} style={{ width: 14, height: 14, borderRadius: 4, cursor: 'default' }} />
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* 5-Week Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { short: 'W1', label: 'W1 · Stack', days: [1, 2, 3, 4, 5, 6, 7] },
          { short: 'W2', label: 'W2 · Queue', days: [8, 9, 10, 11, 12, 13, 14] },
          { short: 'W3', label: 'W3 · Linked', days: [15, 16, 17, 18, 19, 20, 21] },
          { short: 'W4', label: 'W4 · Tree', days: [22, 23, 24, 25, 26, 27, 28] },
          { short: 'W5', label: 'W5 · Mixed', days: [29, 30] },
        ].map(week => (
          <div key={week.short} className="calendar-week-row">
            <span className="calendar-week-label">
              <span className="calendar-week-label-full">{week.label}</span>
              <span className="calendar-week-label-short">{week.short}</span>
            </span>

            <div className="calendar-days-row">
              {week.days.map(day => {
                const dayStat = analytics.dayStats[day - 1];
                const dayDate = addDays(startDate, day - 1);
                const isFuture = dayDate > today;
                const isToday = format(dayDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                let cls = 'incomplete';
                if (isFuture) cls = 'future';
                else if (dayStat.isComplete) cls = 'complete';
                else if (dayStat.isPartial) cls = 'partial';

                return (
                  <button
                    key={day}
                    className={`day-cell ${cls} ${isToday ? 'today' : ''}`}
                    onClick={() => onDayClick(day)}
                    title={`Day ${day} (${format(dayDate, 'MMM d')}) — ${dayStat.solved}/2 solved`}
                    aria-label={`Day ${day}`}
                  >
                    <span>{day}</span>
                    {dayStat.isComplete && (
                      <span style={{ fontSize: 9, lineHeight: 1, marginTop: 1 }}>✓</span>
                    )}
                    {dayStat.isPartial && (
                      <span style={{ fontSize: 8, lineHeight: 1, marginTop: 1 }}>●</span>
                    )}
                  </button>
                );
              })}

              {/* Pad week 5 */}
              {week.days.length < 7 &&
                Array.from({ length: 7 - week.days.length }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
