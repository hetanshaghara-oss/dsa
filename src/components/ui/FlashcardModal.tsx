import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Brain, Clock, Database, Check, Sparkles, ChevronRight, ChevronLeft,
  RotateCcw, Eye, Code, Copy, Bookmark, Lightbulb, Trophy, AlertCircle,
  ThumbsDown, ThumbsUp, Zap, HelpCircle
} from 'lucide-react';
import type { Problem, SpacedRepetitionGrade } from '../../data/problems';
import { getProblemMetadata } from '../../data/problemMetadata';
import { getProblemSolution } from '../../data/problemSolutions';
import { useApp } from '../../context/AppContext';
import { DifficultyBadge, TopicBadge } from './Badges';
import { CompanyLogo } from '../../data/companyLogos';
import { getSRSStageInfo, SRS_INTERVALS } from '../../services/spacedRepetition';

interface FlashcardModalProps {
  problems: Problem[];
  initialIndex?: number;
  onClose: () => void;
}

const COMPLEXITY_TIME_OPTIONS = ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)', 'O(N²)', 'O(2^N)'];
const COMPLEXITY_SPACE_OPTIONS = ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'];

export function FlashcardModal({ problems, initialIndex = 0, onClose }: FlashcardModalProps) {
  const { getProblemUserData, reviewSpacedProblem } = useApp();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [revealed, setRevealed] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [userInvariantText, setUserInvariantText] = useState('');
  const [showHintNudge, setShowHintNudge] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState<{ hard: number; medium: number; easy: number }>({
    hard: 0,
    medium: 0,
    easy: 0,
  });

  const currentProblem = problems[currentIndex];
  const userData = currentProblem ? getProblemUserData(currentProblem.id) : null;
  const meta = currentProblem ? getProblemMetadata(currentProblem.id) : null;
  const srsInfo = userData ? getSRSStageInfo(userData.srs) : null;
  const solutionCode = currentProblem ? getProblemSolution(currentProblem.id, currentProblem.title) : '';

  // Reset card state when moving to next problem
  useEffect(() => {
    setRevealed(false);
    setSelectedTime(null);
    setSelectedSpace(null);
    setUserInvariantText('');
    setShowHintNudge(false);
    setCopiedCode(false);
  }, [currentIndex]);

  // Keyboard navigation & quick grading shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in a textarea or input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (sessionCompleted) return;

      if (!revealed) {
        if (e.code === 'Space' && !isInput) {
          e.preventDefault();
          setRevealed(true);
        }
      } else {
        if (!isInput) {
          if (e.key === '1') {
            e.preventDefault();
            handleGrade('hard');
          } else if (e.key === '2') {
            e.preventDefault();
            handleGrade('medium');
          } else if (e.key === '3') {
            e.preventDefault();
            handleGrade('easy');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, currentIndex, sessionCompleted, onClose]);

  if (!currentProblem || !meta || !userData) {
    return null;
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(solutionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGrade = (grade: SpacedRepetitionGrade) => {
    reviewSpacedProblem(currentProblem.id, grade);

    setStats(prev => ({
      ...prev,
      [grade]: prev[grade] + 1,
    }));

    if (currentIndex + 1 < problems.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const currentStep = userData.srs?.step ?? 0;
  const nextMediumInterval = currentStep + 1 < SRS_INTERVALS.length
    ? SRS_INTERVALS[currentStep + 1]
    : Math.round((userData.srs?.interval || 30) * (userData.srs?.easeFactor || 2.5));
  const nextEasyInterval = currentStep + 2 < SRS_INTERVALS.length
    ? SRS_INTERVALS[currentStep + 2]
    : Math.round((userData.srs?.interval || 30) * (userData.srs?.easeFactor || 2.5) * 1.35);

  const companiesList = (currentProblem.companies && currentProblem.companies.length > 0)
    ? currentProblem.companies
    : meta.companies;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '94vh',
          background: 'var(--bg-card)',
          borderRadius: 20,
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Session Completed Celebratory View */}
        {sessionCompleted ? (
          <div style={{ padding: '50px 30px', textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
              }}
            >
              <Trophy size={36} color="#34d399" />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Spaced Repetition Session <span className="gradient-text">Complete!</span>
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.6 }}>
              You reviewed {problems.length} problem{problems.length !== 1 ? 's' : ''}. Your active recall schedule has been updated automatically.
            </p>

            {/* Session Stats Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
                maxWidth: 480,
                margin: '0 auto 32px',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f87171' }}>{stats.hard}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>🔴 Hard (Day 1)</div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: '#fbbf24' }}>{stats.medium}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>🟡 Medium (+1 Interval)</div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399' }}>{stats.easy}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>🟢 Easy (+2 Intervals)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setSessionCompleted(false);
                  setRevealed(false);
                  setStats({ hard: 0, medium: 0, easy: 0 });
                }}
                className="btn btn-secondary"
                style={{ gap: 8 }}
              >
                <RotateCcw size={16} /> Review Again
              </button>
              <button
                onClick={onClose}
                className="btn btn-primary"
                style={{ gap: 8, padding: '10px 28px' }}
              >
                <Check size={16} /> Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(99, 102, 241, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Brain size={18} color="#818cf8" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Active Recall Flashcard
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Card {currentIndex + 1} of {problems.length}
                    </span>
                  </div>
                  {srsInfo && (
                    <div style={{ fontSize: 11, color: srsInfo.color, fontWeight: 600, marginTop: 2 }}>
                      SRS Stage: {srsInfo.label} • {srsInfo.intervalText}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Previous / Next buttons */}
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(i => i - 1)}
                  className="icon-button"
                  style={{ width: 32, height: 32, opacity: currentIndex === 0 ? 0.35 : 1 }}
                  title="Previous Problem"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentIndex === problems.length - 1}
                  onClick={() => setCurrentIndex(i => i + 1)}
                  className="icon-button"
                  style={{ width: 32, height: 32, opacity: currentIndex === problems.length - 1 ? 0.35 : 1 }}
                  title="Next Problem"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="icon-button"
                  style={{ width: 32, height: 32 }}
                  title="Close Flashcards (Esc)"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Session Progress Bar */}
            <div style={{ height: 3, background: 'var(--border)', width: '100%' }}>
              <div
                style={{
                  height: '100%',
                  width: `${((currentIndex + 1) / problems.length) * 100}%`,
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Card Content Body (Scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Problem Title & Meta Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <DifficultyBadge difficulty={currentProblem.difficulty} />
                  <TopicBadge topic={currentProblem.topic} />
                  {currentProblem.number && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--accent-blue-light)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(99, 102, 241, 0.1)',
                      }}
                    >
                      #{currentProblem.number}
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
                  {currentProblem.title}
                </h1>

                {/* Companies Chips */}
                {companiesList && companiesList.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Asked by:
                    </span>
                    {companiesList.slice(0, 4).map(c => (
                      <span
                        key={c}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '2px 7px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                        }}
                      >
                        <CompanyLogo company={c} size={12} />
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 🧠 STEP 1: ACTIVE RECALL PROMPTS (Always shown to train memory) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {/* Prompt A: Core Pattern / Invariant */}
                <div
                  style={{
                    padding: '18px 20px',
                    borderRadius: 14,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Brain size={18} color="#818cf8" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        What is the core pattern or invariant for this problem?
                      </span>
                    </div>
                    {!revealed && (
                      <button
                        onClick={() => setShowHintNudge(v => !v)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fbbf24',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Lightbulb size={13} />
                        {showHintNudge ? 'Hide Nudge' : 'Need a nudge?'}
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                    Before flipping, mentally recall: Which data structure solves this, what invariant is preserved, or what state is tracked?
                  </p>

                  {showHintNudge && !revealed && (
                    <div
                      className="animate-fade-in"
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        fontSize: 12.5,
                        color: '#fef08a',
                        marginBottom: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      💡 <strong>Nudge:</strong> {meta.hints[0]}
                    </div>
                  )}

                  {!revealed ? (
                    <textarea
                      value={userInvariantText}
                      onChange={e => setUserInvariantText(e.target.value)}
                      placeholder="Type your mental model / invariant here (e.g., 'Monotonic stack maintaining decreasing order' or 'Fast & slow pointers to detect cycle')..."
                      rows={2}
                      className="input-base"
                      style={{ fontSize: 13, resize: 'vertical' }}
                    />
                  ) : (
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: 10,
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: 4 }}>
                        ✓ True Core Invariant & Blueprint:
                      </div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                        {meta.hints[0]}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                        <strong>Approach:</strong> {meta.hints[1]}
                      </div>
                    </div>
                  )}
                </div>

                {/* Prompt B: Time & Space Complexities */}
                <div
                  style={{
                    padding: '18px 20px',
                    borderRadius: 14,
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Clock size={17} color="#22d3ee" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      What are the optimal Time & Space Complexities?
                    </span>
                  </div>

                  {!revealed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                          TIME COMPLEXITY:
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {COMPLEXITY_TIME_OPTIONS.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setSelectedTime(opt)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                background: selectedTime === opt ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedTime === opt ? '#fff' : 'var(--text-secondary)',
                                border: selectedTime === opt ? '1px solid #22d3ee' : '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                          SPACE COMPLEXITY:
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {COMPLEXITY_SPACE_OPTIONS.map(opt => (
                            <button
                              key={opt}
                              onClick={() => setSelectedSpace(opt)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 700,
                                background: selectedSpace === opt ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedSpace === opt ? '#fff' : 'var(--text-secondary)',
                                border: selectedSpace === opt ? '1px solid #a78bfa' : '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 }}>
                      <div
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Clock size={15} color="#22d3ee" />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Time:</span>
                        <strong style={{ fontSize: 13, color: '#22d3ee' }}>{meta.timeComplexity}</strong>
                      </div>

                      <div
                        style={{
                          padding: '8px 16px',
                          borderRadius: 8,
                          background: 'rgba(167, 139, 250, 0.12)',
                          border: '1px solid rgba(167, 139, 250, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Database size={15} color="#a78bfa" />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Space:</span>
                        <strong style={{ fontSize: 13, color: '#a78bfa' }}>{meta.spaceComplexity}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 👁️ FLIP / REVEAL BUTTON (Before Answer is revealed) */}
              {!revealed && (
                <div style={{ textAlign: 'center', margin: '28px 0 10px' }}>
                  <button
                    onClick={() => setRevealed(true)}
                    className="btn btn-primary btn-lg"
                    style={{
                      padding: '14px 40px',
                      fontSize: 15,
                      fontWeight: 800,
                      gap: 10,
                      boxShadow: '0 0 25px rgba(99, 102, 241, 0.45)',
                    }}
                  >
                    <Eye size={18} /> Reveal Answer & Code Solution <span style={{ opacity: 0.7, fontSize: 12 }}>(Space)</span>
                  </button>
                </div>
              )}

              {/* 💻 STEP 2: REVEALED SOLUTION CODE & LOGIC */}
              {revealed && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Optimal C++ Implementation */}
                  <div
                    style={{
                      borderRadius: 14,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                        <Code size={14} color="#06b6d4" />
                        <span>Optimal C++ Solution</span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: 11, gap: 5 }}
                      >
                        {copiedCode ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                        {copiedCode ? 'Copied' : 'Copy Code'}
                      </button>
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        padding: '16px',
                        fontSize: 12.5,
                        lineHeight: 1.6,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#e2e8f0',
                        overflowX: 'auto',
                        background: '#0a0e1a',
                      }}
                    >
                      <code>{solutionCode}</code>
                    </pre>
                  </div>

                  {/* Personal Notes (if user has any saved) */}
                  {userData.notes && (
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: 12,
                        background: 'rgba(245, 158, 11, 0.06)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Bookmark size={14} color="#fbbf24" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
                          Your Personal Approach & Notes:
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {userData.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 🎯 STEP 3: SELF-GRADING (ANKI / SUPERMEMO) FOOTER (Shown after answer is revealed) */}
            {revealed && (
              <div
                className="animate-fade-in"
                style={{
                  padding: '18px 24px',
                  borderTop: '1px solid var(--border)',
                  background: 'rgba(15, 23, 42, 0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Self-Grade Your Recall (SuperMemo / Anki):
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Press <strong>1</strong> (Hard), <strong>2</strong> (Medium), <strong>3</strong> (Easy)
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                  }}
                >
                  {/* HARD (Reset to 1 Day) */}
                  <button
                    onClick={() => handleGrade('hard')}
                    className="btn"
                    style={{
                      flexDirection: 'column',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 800 }}>
                      <ThumbsDown size={15} /> 1. Hard
                    </div>
                    <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 3 }}>
                      Repeat Tomorrow (Day 1)
                    </div>
                  </button>

                  {/* MEDIUM (Next Interval Ladder: 1 -> 3 -> 7 -> 14 -> 30) */}
                  <button
                    onClick={() => handleGrade('medium')}
                    className="btn"
                    style={{
                      flexDirection: 'column',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      color: '#fbbf24',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 800 }}>
                      <ThumbsUp size={15} /> 2. Medium
                    </div>
                    <div style={{ fontSize: 11, color: '#fde68a', marginTop: 3 }}>
                      Next: In {nextMediumInterval} days
                    </div>
                  </button>

                  {/* EASY (Accelerate +2 Intervals) */}
                  <button
                    onClick={() => handleGrade('easy')}
                    className="btn"
                    style={{
                      flexDirection: 'column',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#34d399',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 800 }}>
                      <Zap size={15} /> 3. Easy
                    </div>
                    <div style={{ fontSize: 11, color: '#a7f3d0', marginTop: 3 }}>
                      Mastered: In {nextEasyInterval} days
                    </div>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
