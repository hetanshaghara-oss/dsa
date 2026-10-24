import { useNavigate } from 'react-router-dom';
import { PROBLEMS, DAY_INFO } from '../data/problems';
import { useApp } from '../context/AppContext';
import { format, addDays, parseISO } from 'date-fns';
import { CheckCircle2, Circle, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { TopicBadge } from '../components/ui/Badges';

export function ChallengeList() {
  const navigate = useNavigate();
  const { analytics, store, getProblemUserData } = useApp();
  const startDate = parseISO(store.settings.startDate);

  const weeks = [
    { label: 'Week 1 — Stack Deep Dive', desc: 'LIFO principle, monotonic stacks, bracket matching, string simplification', days: [1, 2, 3, 4, 5, 6, 7] },
    { label: 'Week 2 — Queue & Deque Mastery', desc: 'FIFO queue, sliding window maximum, circular queues, stream processing', days: [8, 9, 10, 11, 12, 13, 14] },
    { label: 'Week 3 — Linked List Fundamentals & Advanced', desc: 'Pointers manipulation, two-pointer fast/slow, reversal, merging sorted lists', days: [15, 16, 17, 18, 19, 20, 21] },
    { label: 'Week 4 — Binary Trees & Traversals', desc: 'Recursion, DFS, BFS level order, height, symmetry, BST validations', days: [22, 23, 24, 25, 26, 27, 28] },
    { label: 'Days 29–30 — Comprehensive Revision & Mock Contests', desc: 'Mixed hard problems, time-constrained simulations, key patterns recap', days: [29, 30] },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
          30-Day <span className="gradient-text">Curriculum Plan</span>
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
          Systematically master core data structures in 30 days. Click any day to view problem breakdowns, approaches, and code.
        </p>
      </div>

      {/* Week Groups */}
      {weeks.map(week => (
        <div key={week.label} style={{ marginBottom: 30 }}>
          {/* Week Section Header */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#818cf8' }}>{week.label}</span>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{week.desc}</p>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--text-muted)',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              {week.days.length * 2} Problems
            </span>
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {week.days.map(day => {
              const dayStat = analytics.dayStats[day - 1];
              const dayInfo = DAY_INFO[day - 1];
              const dayDate = addDays(startDate, day - 1);
              const problems = PROBLEMS.filter(p => p.day === day);

              return (
                <div
                  key={day}
                  onClick={() => navigate(`/challenge/${day}`)}
                  className="card"
                  style={{
                    padding: '16px 18px',
                    cursor: 'pointer',
                    borderColor: dayStat.isComplete
                      ? 'rgba(16, 185, 129, 0.4)'
                      : dayStat.isPartial
                      ? 'rgba(245, 158, 11, 0.4)'
                      : undefined,
                    background: dayStat.isComplete
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(17, 23, 42, 0.9) 100%)'
                      : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: dayStat.isComplete
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'rgba(99, 102, 241, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 800,
                          color: dayStat.isComplete ? 'white' : '#818cf8',
                        }}
                      >
                        {day}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                          Day {day}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {format(dayDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>

                    {/* Completion icon badge */}
                    {dayStat.isComplete ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.15)',
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        <CheckCircle2 size={13} color="#34d399" />
                        Done
                      </span>
                    ) : dayStat.isPartial ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#fbbf24',
                          background: 'rgba(245, 158, 11, 0.15)',
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        1/2
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>0/2</span>
                    )}
                  </div>

                  {/* Topic badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <TopicBadge topic={dayInfo.topic} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dayInfo.objective.slice(0, 48)}...
                    </span>
                  </div>

                  {/* Problem titles list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {problems.map((p, i) => {
                      const isSolved = getProblemUserData(p.id).status === 'solved';
                      return (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            padding: '4px 8px',
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          <span
                            style={{
                              color: isSolved ? 'var(--text-secondary)' : 'var(--text-primary)',
                              textDecoration: isSolved ? 'line-through' : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 180,
                            }}
                          >
                            {p.title}
                          </span>
                          <span className={`chip ${p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'}`}>
                            {p.difficulty}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
