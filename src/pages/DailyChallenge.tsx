import { useParams, useNavigate } from 'react-router-dom';
import { PROBLEMS, DAY_INFO } from '../data/problems';
import { useApp } from '../context/AppContext';
import { ProblemCard } from '../components/ui/ProblemCard';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Lightbulb,
  Target, BookOpen, Calendar, ArrowLeft, Award
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { TopicBadge } from '../components/ui/Badges';

export function DailyChallenge() {
  const { day: dayParam } = useParams();
  const navigate = useNavigate();
  const { analytics, store, getProblemUserData } = useApp();

  const day = dayParam ? parseInt(dayParam, 10) : analytics.earliestIncompleteDay;
  const validDay = Math.min(Math.max(day || 1, 1), 30);

  const dayInfo = DAY_INFO[validDay - 1];
  const dayProblems = PROBLEMS.filter(p => p.day === validDay);
  const startDate = parseISO(store.settings.startDate);
  const dayDate = addDays(startDate, validDay - 1);

  const solved = dayProblems.filter(p => getProblemUserData(p.id).status === 'solved').length;
  const isComplete = solved === 2;
  const isPartial = solved === 1;

  return (
    <div className="page-container animate-fade-in">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="daily-nav-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <button
          onClick={() => navigate('/challenge')}
          className="btn btn-secondary btn-sm"
          style={{ gap: 6 }}
        >
          <ArrowLeft size={14} /> <span className="daily-back-text">All 30 Days</span>
        </button>

        {/* Day Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }} className="daily-day-switcher">
          <button
            onClick={() => navigate(`/challenge/${Math.max(validDay - 1, 1)}`)}
            className="btn btn-secondary btn-sm"
            disabled={validDay === 1}
            style={{ opacity: validDay === 1 ? 0.4 : 1, padding: '5px 10px' }}
            aria-label="Previous day"
          >
            <ChevronLeft size={15} /> <span className="daily-btn-text">Prev</span>
          </button>

          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              padding: '5px 10px',
              borderRadius: 8,
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: 'var(--accent-blue-light)',
              whiteSpace: 'nowrap',
            }}
          >
            Day {validDay}/30
          </span>

          <button
            onClick={() => navigate(`/challenge/${Math.min(validDay + 1, 30)}`)}
            className="btn btn-secondary btn-sm"
            disabled={validDay === 30}
            style={{ opacity: validDay === 30 ? 0.4 : 1, padding: '5px 10px' }}
            aria-label="Next day"
          >
            <span className="daily-btn-text">Next</span> <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Hero Day Header Banner */}
      <div
        className="card hero-banner daily-hero-banner"
        style={{
          marginBottom: 24,
          borderColor: isComplete ? 'rgba(16, 185, 129, 0.4)' : undefined,
          background: isComplete
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, var(--bg-card) 100%)'
            : undefined,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Big Day Number Squircle */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: isComplete
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                boxShadow: isComplete
                  ? '0 4px 18px rgba(16, 185, 129, 0.4)'
                  : '0 4px 18px rgba(99, 102, 241, 0.4)',
              }}
            >
              <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.85 }}>Day</span>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{validDay}</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <TopicBadge topic={dayInfo.topic} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {dayInfo.weekName}
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                {format(dayDate, 'EEEE, MMMM d, yyyy')}
              </h1>
            </div>
          </div>

          {/* Completion Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 18px',
              borderRadius: 12,
              background: isComplete
                ? 'rgba(16, 185, 129, 0.15)'
                : isPartial
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${
                isComplete
                  ? 'rgba(16, 185, 129, 0.35)'
                  : isPartial
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'var(--border)'
              }`,
            }}
          >
            {isComplete ? (
              <CheckCircle2 size={24} color="#10b981" />
            ) : isPartial ? (
              <Circle size={24} color="#fbbf24" />
            ) : (
              <Circle size={24} color="var(--text-muted)" />
            )}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isComplete ? '#34d399' : isPartial ? '#fbbf24' : 'var(--text-secondary)',
                }}
              >
                {isComplete ? 'Day Complete! 🎉' : isPartial ? '1 of 2 Solved' : '0 of 2 Solved'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isComplete ? 'Great job on this session' : 'Solve both to maintain streak'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar inside banner */}
        <div style={{ marginTop: 18 }}>
          <div className="progress-bar" style={{ height: 6 }}>
            <div
              className="progress-fill"
              style={{
                width: `${(solved / 2) * 100}%`,
                background: isComplete ? 'linear-gradient(90deg, #10b981, #34d399)' : undefined,
              }}
            />
          </div>
        </div>
      </div>

      {/* Objective & Key Patterns Split Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Objective */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <Lightbulb size={16} color="#fbbf24" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Today's Objective
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {dayInfo.objective}
          </p>
        </div>

        {/* Key Patterns */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <Target size={16} color="var(--accent-blue-light)" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Core Algorithmic Patterns
            </span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dayInfo.keyPatterns.map((p, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--accent-blue-light)',
                    flexShrink: 0,
                  }}
                />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Concept Deep Dive Box */}
      <div
        className="card"
        style={{
          padding: 22,
          marginBottom: 24,
          background: 'rgba(99, 102, 241, 0.04)',
          borderColor: 'rgba(99, 102, 241, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <BookOpen size={16} style={{ color: 'var(--accent-blue-light)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Concept Breakdown & Mental Model
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {dayInfo.concept}
        </p>
      </div>

      {/* Problems Section */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-heading">
          <BookOpen size={18} style={{ color: 'var(--accent-blue-light)' }} />
          Today's Challenge Problems
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-muted)',
              marginLeft: 4,
            }}
          >
            (Solve in C++)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {dayProblems.map((problem, i) => (
            <div key={problem.id}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Challenge {i + 1} of 2</span>
              </div>
              <ProblemCard problem={problem} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 28,
          paddingTop: 20,
          borderTop: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => navigate(`/challenge/${Math.max(validDay - 1, 1)}`)}
          className="btn btn-secondary"
          disabled={validDay === 1}
        >
          <ChevronLeft size={16} /> Day {Math.max(validDay - 1, 1)}
        </button>

        <button
          onClick={() => navigate('/challenge')}
          className="btn btn-secondary"
        >
          View Full 30-Day Plan
        </button>

        <button
          onClick={() => navigate(`/challenge/${Math.min(validDay + 1, 30)}`)}
          className="btn btn-secondary"
          disabled={validDay === 30}
        >
          Day {Math.min(validDay + 1, 30)} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
