import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PROBLEMS, DAY_INFO } from '../data/problems';
import { format, parseISO, addDays } from 'date-fns';
import {
  CheckCircle2, Target, Flame, Trophy, ArrowRight,
  TrendingUp, Zap, Sparkles, Calendar, BookOpen, Layers, Plus, Compass, Brain
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { Analytics } from '../store/analytics';
import { AchievementsList } from '../components/ui/AchievementsList';
import { AddProblemModal } from '../components/ui/AddProblemModal';
import { DifficultyBadge, TopicBadge } from '../components/ui/Badges';
import { isProblemDue } from '../services/spacedRepetition';

export function Dashboard() {
  const {
    analytics,
    store,
    allProblems,
    getProblemUserData,
    addProblemModalOpen,
    setAddProblemModalOpen,
    canInstallPWA,
    installPWA,
    isStandalone,
  } = useApp();

  const navigate = useNavigate();
  const [localAddModalOpen, setLocalAddModalOpen] = useState(false);
  const startDate = parseISO(store.settings.startDate);

  // Find next unsolved question across the whole library
  const nextUnsolvedProblem = allProblems.find(
    p => getProblemUserData(p.id).status !== 'solved'
  );

  // Up to 3 next unsolved questions in queue
  const queueProblems = allProblems
    .filter(p => getProblemUserData(p.id).status !== 'solved')
    .slice(0, 3);

  // Spaced repetition due questions
  const dueProblems = allProblems.filter(p => isProblemDue(getProblemUserData(p.id)));

  const stats = [
    {
      label: 'Questions Solved',
      value: analytics.completedProblems,
      total: analytics.totalProblems,
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.25)',
      desc: `${analytics.completionPct}% of all questions done`,
    },
    {
      label: 'Remaining Questions',
      value: analytics.remainingProblems,
      total: analytics.totalProblems,
      icon: Target,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.25)',
      desc: `${analytics.customProblemsCount} custom added questions`,
    },
    {
      label: 'Active Daily Streak',
      value: analytics.currentStreak,
      suffix: 'days',
      icon: Flame,
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.25)',
      desc: analytics.streakFreezesAvailable > 0
        ? `${analytics.streakFreezesAvailable} Streak Shield${analytics.streakFreezesAvailable !== 1 ? 's' : ''} Active 🛡️`
        : analytics.currentStreak > 0 ? 'Consistency is king 🔥' : 'Solve a question to begin streak',
    },
    {
      label: 'Next Milestone',
      value: analytics.completedProblems,
      total: analytics.nextMilestone.target,
      icon: Trophy,
      color: '#a78bfa',
      bg: 'rgba(139, 92, 246, 0.12)',
      border: 'rgba(139, 92, 246, 0.25)',
      desc: `${analytics.nextMilestone.remaining} more to reach ${analytics.nextMilestone.label}`,
    },
  ];

  const continueDay = analytics.earliestIncompleteDay;

  const showAddModal = localAddModalOpen || addProblemModalOpen;
  const handleCloseAddModal = () => {
    setLocalAddModalOpen(false);
    setAddProblemModalOpen(false);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Hero Welcome Banner - Question Centric */}
      <div className="card hero-banner dashboard-hero-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: 12 }}>
              <Sparkles size={13} color="#818cf8" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', color: '#818cf8', textTransform: 'uppercase' }}>
                Question-Wise Algorithm Mastery
              </span>
            </div>
            <h1 className="dashboard-hero-title" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 8 }}>
              Level Up Your <span className="gradient-text">Problem-Solving</span>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Progress question by question at your own pace. Solve the 60 curated challenges, or expand your library with custom problems anytime.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: 'auto', flexWrap: 'wrap' }} className="dashboard-hero-btn-wrap">
            <button
              onClick={() => setLocalAddModalOpen(true)}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: 14, gap: 6 }}
            >
              <Plus size={16} /> Add Question
            </button>

            {nextUnsolvedProblem ? (
              <button
                onClick={() => {
                  if (nextUnsolvedProblem.day) {
                    navigate(`/challenge/${nextUnsolvedProblem.day}`);
                  } else {
                    navigate('/problems');
                  }
                }}
                className="btn btn-primary dashboard-hero-btn"
                style={{ padding: '10px 20px', fontSize: 14, gap: 6 }}
              >
                Solve Next Question <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => navigate('/problems')}
                className="btn btn-primary dashboard-hero-btn"
                style={{ padding: '10px 20px', fontSize: 14, gap: 6 }}
              >
                View Library <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Global Questions Progress Bar */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.07)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Total Problem Completion
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ({analytics.completedProblems} of {analytics.totalProblems} solved)
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
            <span>Target: {analytics.nextMilestone.label}</span>
            <span>{analytics.customProblemsCount > 0 ? `${analytics.customProblemsCount} custom questions in library` : 'Expandable with custom questions'}</span>
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

      {/* Spaced Repetition Due Today Banner */}
      {dueProblems.length > 0 && (
        <div
          className="card animate-fade-in"
          style={{
            padding: '18px 22px',
            marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
            borderColor: 'rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Brain size={22} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                {dueProblems.length} Spaced Repetition Review{dueProblems.length !== 1 ? 's' : ''} Due Today
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                Keep your invariant recall sharp! Day 1, 3, 7, 14, and 30 recall intervals prevent forgetting.
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/revision')}
            className="btn btn-primary"
            style={{
              gap: 8,
              padding: '9px 20px',
              fontWeight: 800,
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)',
            }}
          >
            <span>Start Flashcards</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Question Milestone Road */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={18} color="#fbbf24" />
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>
              Question Milestones Road
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Next badge at {analytics.nextMilestone.target} questions ({analytics.nextMilestone.remaining} to go)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          {analytics.milestones.map(m => (
            <div
              key={m.target}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: m.achieved ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
                background: m.achieved ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 22 }}>{m.rewardIcon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.achieved ? '#34d399' : 'var(--text-primary)' }}>
                  {m.target} Solved
                </div>
                <div style={{ fontSize: 10.5, color: m.achieved ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                  {m.achieved ? 'Unlocked ✓' : 'Locked'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Queue of Questions + Topic Mastery */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 20,
          marginBottom: 24,
        }}
        className="main-grid-2col"
      >
        {/* Next Questions in Queue */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
            <div className="section-heading" style={{ margin: 0 }}>
              <Compass size={18} style={{ color: 'var(--accent-blue-light)' }} />
              Up Next to Solve
            </div>
            <button
              onClick={() => navigate('/problems')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, padding: '4px 10px' }}
            >
              Browse All ({allProblems.length}) →
            </button>
          </div>

          {queueProblems.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              🎉 Incredible work! You have solved all current questions in your library!
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={() => setLocalAddModalOpen(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={14} /> Add More Questions
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {queueProblems.map((p, index) => (
                <div
                  key={p.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: index === 0 ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)' : 'rgba(255, 255, 255, 0.02)',
                    border: index === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: index === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        color: index === 0 ? 'var(--accent-blue-light)' : 'var(--text-muted)',
                      }}
                    >
                      #{index + 1}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <DifficultyBadge difficulty={p.difficulty} />
                        <TopicBadge topic={p.topic} />
                        {p.isCustom && (
                          <span className="chip" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.25)', fontSize: 10 }}>
                            Custom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      LeetCode ↗
                    </a>
                    {p.day ? (
                      <button
                        onClick={() => navigate(`/challenge/${p.day}`)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        Solve
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/problems')}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        Solve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic Mastery Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className="section-heading" style={{ fontSize: 15, margin: 0 }}>
                <Layers size={16} style={{ color: 'var(--accent-blue-light)' }} />
                Topic Mastery
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {Object.keys(analytics.byTopic).length} Topics
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto' }}>
              {Object.entries(analytics.byTopic).map(([topic, data]) => {
                const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                return (
                  <div key={topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{topic}</span>
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

      {/* 30-Day Foundation Curriculum Matrix (Preserved Structured Track) */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="section-heading" style={{ margin: '0 0 4px 0' }}>
              <Calendar size={18} style={{ color: 'var(--accent-blue-light)' }} />
              30-Day Foundation Curriculum Track (60 Problems)
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              The curated core curriculum across Stack, Queue, Linked List, and Binary Tree.
            </p>
          </div>
          <button
            onClick={() => navigate('/challenge')}
            className="btn btn-secondary btn-sm"
          >
            Open 30-Day View →
          </button>
        </div>

        <CalendarGrid
          analytics={analytics}
          startDate={startDate}
          onDayClick={day => navigate(`/challenge/${day}`)}
        />
      </div>

      {/* Milestones & Gamification Achievements */}
      <AchievementsList />

      {/* Bottom Section: Weekly Chart & Difficulty Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 20,
        }}
        className="analytics-grid-2col"
      >
        {/* Weekly Solve Velocity Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="section-heading" style={{ margin: 0 }}>
                <TrendingUp size={18} style={{ color: 'var(--accent-cyan)' }} />
                Weekly Problem Velocity
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Problems completed over the last 7 days
              </div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {analytics.weeklyActivity.reduce((acc, curr) => acc + curr.count, 0)} Solved This Week
            </span>
          </div>

          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.weeklyActivity}>
                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-primary)',
                    fontSize: 12,
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analytics.weeklyActivity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count > 0 ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <div className="section-heading" style={{ marginBottom: 18 }}>
            <Zap size={18} style={{ color: '#fbbf24' }} />
            Difficulty Breakdown
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(['Easy', 'Medium', 'Hard'] as const).map(diff => {
              const data = analytics.byDifficulty[diff];
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              const color = diff === 'Easy' ? '#10b981' : diff === 'Medium' ? '#fbbf24' : '#f87171';

              return (
                <div key={diff} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{diff}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {data.completed}/{data.total} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <div style={{ height: '100%', borderRadius: 999, background: color, width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Problem Modal */}
      {showAddModal && (
        <AddProblemModal onClose={handleCloseAddModal} />
      )}
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
