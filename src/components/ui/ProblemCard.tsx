import { useState } from 'react';
import { ExternalLink, Check, Bookmark, StickyNote, Star, ChevronDown, ChevronUp, RotateCcw, Sparkles, Lightbulb, Trash2, Brain } from 'lucide-react';
import type { Problem, ProblemStatus } from '../../data/problems';
import { useApp } from '../../context/AppContext';
import { DifficultyBadge, TopicBadge } from './Badges';
import { CompanyLogo } from '../../data/companyLogos';
import { getProblemMetadata } from '../../data/problemMetadata';
import { HintsModal } from './HintsModal';
import { FlashcardModal } from './FlashcardModal';
import { getSRSStageInfo, getDaysUntilDue } from '../../services/spacedRepetition';

interface ProblemCardProps {
  problem: Problem;
  showDay?: boolean;
}

const STATUS_OPTIONS: { value: ProblemStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'solved', label: 'Solved' },
  { value: 'needs-revision', label: 'Needs Revision' },
];

export function ProblemCard({ problem, showDay = false }: ProblemCardProps) {
  const {
    getProblemUserData,
    toggleSolved,
    setProblemStatus,
    updateNotes,
    toggleRevision,
    setPersonalDifficulty,
    deleteProblem,
  } = useApp();
  const userData = getProblemUserData(problem.id);
  const meta = getProblemMetadata(problem.id);
  const [notesOpen, setNotesOpen] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [notesText, setNotesText] = useState(userData.notes);
  const [notesSaved, setNotesSaved] = useState(true);

  const isSolved = userData.status === 'solved';
  const srsInfo = getSRSStageInfo(userData.srs);
  const daysUntilDue = userData.srs?.dueDate ? getDaysUntilDue(userData.srs.dueDate) : null;

  const handleSaveNotes = () => {
    updateNotes(problem.id, notesText);
    setNotesSaved(true);
  };

  const handleStarClick = (rating: number) => {
    setPersonalDifficulty(problem.id, userData.personalDifficulty === rating ? 0 : rating);
  };

  const statusConfig = {
    'not-started': { color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)', label: 'Not Started' },
    'attempted': { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', label: 'Attempted' },
    'solved': { color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', label: 'Solved' },
    'needs-revision': { color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.15)', label: 'Needs Revision' },
  }[userData.status];

  return (
    <div
      className={`card animate-fade-in`}
      style={{
        padding: '18px 20px',
        borderColor: isSolved ? 'rgba(16, 185, 129, 0.35)' : undefined,
        background: isSolved
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(17, 23, 42, 0.9) 100%)'
          : undefined,
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        {/* Custom Interactive Checkbox */}
        <button
          onClick={() => toggleSolved(problem.id)}
          className={`custom-checkbox ${isSolved ? 'checked' : ''}`}
          style={{ marginTop: 2 }}
          aria-label={isSolved ? 'Unmark as solved' : 'Mark as solved'}
          title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
        >
          {isSolved && (
            <Check size={14} color="white" strokeWidth={3} />
          )}
        </button>

        {/* Title & Metadata */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            {problem.number && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--accent-blue-light)',
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                #{problem.number}
              </span>
            )}
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: isSolved ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: isSolved ? 'line-through' : 'none',
                textDecorationColor: 'rgba(255,255,255,0.2)',
                letterSpacing: '-0.2px',
              }}
            >
              {problem.title}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <DifficultyBadge difficulty={problem.difficulty} />
            <TopicBadge topic={problem.topic} />
            {problem.isCustom && (
              <span
                className="chip"
                style={{
                  background: 'rgba(236, 72, 153, 0.12)',
                  color: '#f472b6',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 700,
                }}
              >
                <Sparkles size={11} /> Custom
              </span>
            )}
            {showDay && problem.day && (
              <span
                className="chip"
                style={{
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent-blue-light)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                Day {problem.day}
              </span>
            )}
            <span
              className="chip"
              style={{
                background: statusConfig.bg,
                color: statusConfig.color,
                border: `1px solid ${statusConfig.color}40`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: statusConfig.color,
                  display: 'inline-block',
                }}
              />
              {statusConfig.label}
            </span>

            {/* Spaced Repetition SRS Level Badge */}
            {userData.srs && (
              <span
                className="chip"
                style={{
                  background: srsInfo.bg,
                  color: srsInfo.color,
                  border: `1px solid ${srsInfo.border}`,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title={`Spaced Repetition: ${srsInfo.label} (${srsInfo.intervalText}). Due date: ${userData.srs.dueDate}`}
              >
                <Brain size={11} color={srsInfo.color} />
                {daysUntilDue !== null && daysUntilDue <= 0
                  ? `${srsInfo.badge} Recall Due`
                  : `${srsInfo.badge} (in ${daysUntilDue}d)`}
              </span>
            )}

            {/* Authentic Company Tags */}
            {((problem.companies && problem.companies.length > 0) ? problem.companies : meta.companies) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 2, flexWrap: 'wrap' }}>
                {((problem.companies && problem.companies.length > 0) ? problem.companies : meta.companies).slice(0, 3).map(comp => (
                  <span
                    key={comp}
                    className="chip"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      padding: '2px 7px',
                      borderRadius: 5,
                      fontSize: 10.5,
                      color: 'var(--text-secondary)',
                    }}
                    title={`Asked at ${comp}`}
                  >
                    <CompanyLogo company={comp} size={11} />
                    <span>{comp}</span>
                  </span>
                ))}
                {((problem.companies && problem.companies.length > 0) ? problem.companies : meta.companies).length > 3 && (
                  <span
                    className="chip"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-muted)',
                      fontSize: 10,
                      padding: '2px 5px',
                    }}
                    title={`Also asked at ${((problem.companies && problem.companies.length > 0) ? problem.companies : meta.companies).slice(3).join(', ')}`}
                  >
                    +{((problem.companies && problem.companies.length > 0) ? problem.companies : meta.companies).length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div
        className="problem-card-actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          paddingTop: 12,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="problem-card-action-group" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* LeetCode Link */}
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={13} />
            LeetCode
          </a>

          {/* Mark Solved Toggle */}
          <button
            onClick={() => toggleSolved(problem.id)}
            className={`btn btn-sm ${isSolved ? 'btn-success active' : 'btn-success'}`}
          >
            {isSolved ? (
              <>
                <RotateCcw size={13} /> Unmark Solved
              </>
            ) : (
              <>
                <Check size={13} /> Mark Solved
              </>
            )}
          </button>

          {/* Notes Toggle */}
          <button
            onClick={() => {
              setNotesOpen(o => !o);
              setNotesText(getProblemUserData(problem.id).notes);
            }}
            className="btn btn-sm btn-secondary"
            style={
              userData.notes
                ? {
                    borderColor: 'rgba(139, 92, 246, 0.45)',
                    color: 'var(--accent-purple-light)',
                    background: 'rgba(139, 92, 246, 0.1)',
                  }
                : {}
            }
          >
            <StickyNote size={13} />
            {userData.notes ? 'View Notes' : 'Add Notes'}
            {userData.notes && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent-purple)',
                }}
              />
            )}
          </button>

          {/* Revision Flag */}
          <button
            onClick={() => toggleRevision(problem.id)}
            className="btn btn-sm btn-secondary"
            style={
              userData.needsRevision
                ? {
                    borderColor: 'rgba(245, 158, 11, 0.45)',
                    color: '#fbbf24',
                    background: 'rgba(245, 158, 11, 0.1)',
                  }
                : {}
            }
            title="Flag problem for later revision"
          >
            <Bookmark size={13} fill={userData.needsRevision ? '#fbbf24' : 'none'} />
            {userData.needsRevision ? 'Flagged' : 'Revise'}
          </button>

          {/* 3-Tier Progressive Hints Button */}
          <button
            onClick={() => setHintsOpen(true)}
            className="btn btn-sm btn-secondary"
            style={{
              borderColor: 'rgba(99, 102, 241, 0.35)',
              color: 'var(--accent-blue-light)',
              background: 'rgba(99, 102, 241, 0.08)',
            }}
            title="Open 3-Tier Progressive Hints"
          >
            <Lightbulb size={13} color="var(--accent-blue-light)" />
            Hints (3)
          </button>

          {/* Active Recall Flashcard Button */}
          <button
            onClick={() => setFlashcardOpen(true)}
            className="btn btn-sm btn-secondary"
            style={{
              borderColor: daysUntilDue !== null && daysUntilDue <= 0 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(168, 85, 247, 0.35)',
              color: daysUntilDue !== null && daysUntilDue <= 0 ? '#f87171' : '#c084fc',
              background: daysUntilDue !== null && daysUntilDue <= 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(168, 85, 247, 0.08)',
            }}
            title="Test recall with Anki/SuperMemo flashcard"
          >
            <Brain size={13} color={daysUntilDue !== null && daysUntilDue <= 0 ? '#f87171' : '#c084fc'} />
            {daysUntilDue !== null && daysUntilDue <= 0 ? 'Recall Due' : 'Recall'}
          </button>

          {/* Delete custom question */}
          {problem.isCustom && (
            <button
              onClick={() => {
                if (window.confirm(`Delete custom question "${problem.title}"?`)) {
                  deleteProblem(problem.id);
                }
              }}
              className="btn btn-sm btn-secondary"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.08)',
                padding: '6px 9px',
              }}
              title="Delete question from library"
              aria-label="Delete question"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Right Side: Status Selector & Rating */}
        <div className="problem-card-status-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select
            className="input-base"
            value={userData.status}
            onChange={e => setProblemStatus(problem.id, e.target.value as ProblemStatus)}
            style={{
              width: 135,
              padding: '5px 28px 5px 10px',
              fontSize: 12.5,
              height: 32,
              borderRadius: 7,
            }}
            aria-label="Set problem status"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Rating</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  aria-label={`Rate ${star} star`}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Star
                    size={14}
                    fill={userData.personalDifficulty >= star ? '#fbbf24' : 'none'}
                    color={userData.personalDifficulty >= star ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Notes Drawer */}
      {notesOpen && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: 14,
            padding: '14px 16px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: 10,
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <StickyNote size={14} style={{ color: 'var(--accent-purple-light)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Personal Approach & Notes</span>
            </div>
            <button
              onClick={() => setNotesOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronUp size={16} />
            </button>
          </div>

          <textarea
            className="input-base"
            value={notesText}
            onChange={e => {
              setNotesText(e.target.value);
              setNotesSaved(false);
            }}
            placeholder="Record edge cases, optimal time/space complexity, pattern tricks, or pitfalls to avoid..."
            rows={4}
            style={{ fontSize: 13, lineHeight: 1.6 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {notesSaved ? '✓ All changes saved' : 'Unsaved edits'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {userData.notes && (
                <button
                  onClick={() => {
                    setNotesText('');
                    updateNotes(problem.id, '');
                    setNotesSaved(true);
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Clear Notes
                </button>
              )}
              <button
                onClick={handleSaveNotes}
                className="btn btn-primary btn-sm"
                disabled={notesSaved}
                style={{ opacity: notesSaved ? 0.7 : 1 }}
              >
                {notesSaved ? 'Saved' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Tier Progressive Hints Modal */}
      {hintsOpen && (
        <HintsModal problem={problem} onClose={() => setHintsOpen(false)} />
      )}

      {/* Active Recall Flashcard Modal */}
      {flashcardOpen && (
        <FlashcardModal
          problems={[problem]}
          onClose={() => setFlashcardOpen(false)}
        />
      )}
    </div>
  );
}
