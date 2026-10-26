import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProblemCard } from '../components/ui/ProblemCard';
import { FlashcardModal } from '../components/ui/FlashcardModal';
import {
  Bookmark, Brain, Calendar, Flame, CheckCircle, Clock, Sparkles,
  RotateCcw, ArrowRight, Play, Check, Zap, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isProblemDue, getDaysUntilDue, getTodayYMD, SRS_INTERVALS } from '../services/spacedRepetition';

type RevisionTab = 'due' | 'upcoming' | 'mastered' | 'all-revision';

export function RevisionList() {
  const { getProblemUserData, allProblems } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<RevisionTab>('due');
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [sessionProblems, setSessionProblems] = useState<typeof allProblems>([]);

  const todayStr = getTodayYMD();

  // Categorize problems according to Spaced Repetition state
  const { dueProblems, upcomingProblems, masteredProblems, allRevisionProblems } = useMemo(() => {
    const due: typeof allProblems = [];
    const upcoming: typeof allProblems = [];
    const mastered: typeof allProblems = [];
    const allRev: typeof allProblems = [];

    allProblems.forEach(p => {
      const ud = getProblemUserData(p.id);
      const isFlagged = ud.needsRevision || ud.status === 'needs-revision';
      const isDue = isProblemDue(ud, todayStr);

      if (isFlagged || isDue) {
        allRev.push(p);
      }

      if (isDue) {
        due.push(p);
      } else if (ud.srs && ud.status === 'solved') {
        const daysLeft = getDaysUntilDue(ud.srs.dueDate, todayStr);
        if (daysLeft > 0) {
          if (ud.srs.step >= 4 || ud.srs.interval >= 30) {
            mastered.push(p);
          } else {
            upcoming.push(p);
          }
        }
      }
    });

    // If no problems are strictly due today, but there are flagged problems or solved problems,
    // ensure user can still start a practice session
    return {
      dueProblems: due,
      upcomingProblems: upcoming,
      masteredProblems: mastered,
      allRevisionProblems: allRev,
    };
  }, [allProblems, getProblemUserData, todayStr]);

  // Problems to display for the currently active tab
  const displayedProblems = useMemo(() => {
    switch (activeTab) {
      case 'due':
        return dueProblems.length > 0 ? dueProblems : allRevisionProblems;
      case 'upcoming':
        return upcomingProblems;
      case 'mastered':
        return masteredProblems;
      case 'all-revision':
        return allRevisionProblems;
      default:
        return dueProblems;
    }
  }, [activeTab, dueProblems, upcomingProblems, masteredProblems, allRevisionProblems]);

  const handleStartReviewSession = (problemsToReview: typeof allProblems) => {
    if (problemsToReview.length === 0) return;
    setSessionProblems(problemsToReview);
    setSessionModalOpen(true);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Page Title & SuperMemo SRS Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
            🧠 Smart Spaced <span className="gradient-text">Repetition</span>
          </h1>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 999,
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-blue-light)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            Anki / SuperMemo SM-2
          </span>
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', maxWidth: 680, lineHeight: 1.5 }}>
          Automated revision intervals on <strong>Day 1, 3, 7, 14, and 30</strong>. Practice active flashcard recall before checking solutions to build permanent invariant memory.
        </p>
      </div>

      {/* Interval Ladder & Active Session Banner */}
      <div
        className="card"
        style={{
          padding: '22px 24px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={20} color="#f59e0b" />
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                {dueProblems.length} Problem{dueProblems.length !== 1 ? 's' : ''} Due For Review Today
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {dueProblems.length > 0
                ? 'Test your core pattern invariants and complexities without peeking at the code.'
                : 'All scheduled revisions caught up! You can also practice any upcoming or flagged questions anytime.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleStartReviewSession(dueProblems.length > 0 ? dueProblems : allRevisionProblems)}
              disabled={allRevisionProblems.length === 0}
              className="btn btn-primary btn-lg"
              style={{
                gap: 8,
                padding: '11px 24px',
                fontWeight: 800,
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                opacity: allRevisionProblems.length === 0 ? 0.5 : 1,
              }}
            >
              <Play size={16} fill="white" />
              {dueProblems.length > 0 ? 'Start Daily Recall Session' : 'Practice Flashcard Recall'}
            </button>
          </div>
        </div>

        {/* 5-Step Interval Ladder Visualizer */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
            SuperMemo Recall Ladder:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
            }}
          >
            {[
              { day: 'Day 1', label: 'Initial Check', color: '#f87171', bg: 'rgba(239, 68, 68, 0.1)' },
              { day: 'Day 3', label: 'Consolidation', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)' },
              { day: 'Day 7', label: 'Retention', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
              { day: 'Day 14', label: 'Consolidation', color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
              { day: 'Day 30', label: 'Mastery', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)' },
            ].map((step, idx) => (
              <div
                key={step.day}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: step.bg,
                  border: `1px solid ${step.color}35`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: step.color }}>{step.day}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 18,
          borderBottom: '1px solid var(--border)',
          paddingBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('due')}
          className={`btn btn-sm ${activeTab === 'due' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: 6 }}
        >
          <Flame size={14} color={activeTab === 'due' ? '#fff' : '#f59e0b'} />
          Due Today ({dueProblems.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`btn btn-sm ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: 6 }}
        >
          <Calendar size={14} />
          Upcoming Intervals ({upcomingProblems.length})
        </button>

        <button
          onClick={() => setActiveTab('mastered')}
          className={`btn btn-sm ${activeTab === 'mastered' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: 6 }}
        >
          <CheckCircle size={14} color={activeTab === 'mastered' ? '#fff' : '#34d399'} />
          Mastered ({masteredProblems.length})
        </button>

        <button
          onClick={() => setActiveTab('all-revision')}
          className={`btn btn-sm ${activeTab === 'all-revision' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: 6 }}
        >
          <Bookmark size={14} />
          All Flagged / In Queue ({allRevisionProblems.length})
        </button>
      </div>

      {/* Problem Cards List or Empty State */}
      {displayedProblems.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Brain size={26} color="#818cf8" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {activeTab === 'due' ? 'No Problems Due Right Now' : 'No Problems in this Category'}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.6 }}>
            {activeTab === 'due'
              ? 'Great job! You are all caught up on scheduled reviews. As you mark problems as solved, they are automatically queued for Day 1, 3, 7, 14, and 30 intervals.'
              : 'Mark problems as solved or click "Revise" on any problem card to build your spaced repetition deck.'}
          </p>
          <button onClick={() => navigate('/problems')} className="btn btn-primary btn-sm">
            Browse Questions Library
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayedProblems.map(problem => (
            <ProblemCard key={problem.id} problem={problem} showDay />
          ))}
        </div>
      )}

      {/* Full-Screen Spaced Repetition Flashcard Session Modal */}
      {sessionModalOpen && sessionProblems.length > 0 && (
        <FlashcardModal
          problems={sessionProblems}
          onClose={() => setSessionModalOpen(false)}
        />
      )}
    </div>
  );
}
