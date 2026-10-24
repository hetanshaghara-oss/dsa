import { useState } from 'react';
import { X, Lightbulb, Compass, Code, Clock, Database, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Problem } from '../../data/problems';
import { getProblemMetadata } from '../../data/problemMetadata';
import { CompanyLogo } from '../../data/companyLogos';
import { DifficultyBadge, TopicBadge } from './Badges';

interface HintsModalProps {
  problem: Problem;
  onClose: () => void;
}

export function HintsModal({ problem, onClose }: HintsModalProps) {
  const meta = getProblemMetadata(problem.id);
  const [unlockedTier, setUnlockedTier] = useState<1 | 2 | 3>(1);

  return (
    <div className="overlay animate-fade-in" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-blue-light)' }}>
                Day {problem.day} · 3-Tier Hints
              </span>
              <DifficultyBadge difficulty={problem.difficulty} />
              <TopicBadge topic={problem.topic} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {problem.number ? `#${problem.number} ` : ''}{problem.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="icon-button"
            style={{ width: 32, height: 32, padding: 0 }}
            aria-label="Close hints"
          >
            <X size={16} />
          </button>
        </div>

        {/* Company Tags & Complexity Pills */}
        <div style={{ padding: '12px 22px', background: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)' }}>Asked at:</span>
            {meta.companies.map(comp => (
              <span
                key={comp}
                className="chip"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                }}
              >
                <CompanyLogo company={comp} size={13} />
                <span>{comp}</span>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan-light)' }}>
              <Clock size={12} /> Time: <strong>{meta.timeComplexity}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#a78bfa' }}>
              <Database size={12} /> Space: <strong>{meta.spaceComplexity}</strong>
            </span>
          </div>
        </div>

        {/* Hints Body */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Tier 1: Intuition (Unlocked) */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.07)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lightbulb size={14} color="var(--accent-blue-light)" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue-light)' }}>
                  Tier 1 — Core Intuition (Nudge)
                </span>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 999 }}>
                Unlocked
              </span>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {meta.hints[0]}
            </p>
          </div>

          {/* Tier 2: Approach & Pattern */}
          {unlockedTier >= 2 ? (
            <div
              className="animate-fade-in"
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: 'rgba(6, 182, 212, 0.07)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Compass size={14} color="var(--accent-cyan-light)" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan-light)' }}>
                    Tier 2 — Algorithmic Approach & Pattern
                  </span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 999 }}>
                  Unlocked
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {meta.hints[1]}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setUnlockedTier(2)}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '14px 18px',
                justifyContent: 'space-between',
                borderStyle: 'dashed',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Unlock Tier 2: Algorithmic Blueprint</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', gap: 3 }}>
                Reveal Hint <ChevronRight size={14} />
              </span>
            </button>
          )}

          {/* Tier 3: Pseudocode & Invariant */}
          {unlockedTier >= 3 ? (
            <div
              className="animate-fade-in"
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.07)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Code size={14} color="#fbbf24" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>
                    Tier 3 — Pseudocode & Key Edge Cases
                  </span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 999 }}>
                  Unlocked
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {meta.hints[2]}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setUnlockedTier(3)}
              disabled={unlockedTier < 2}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '14px 18px',
                justifyContent: 'space-between',
                borderStyle: 'dashed',
                background: 'rgba(255, 255, 255, 0.02)',
                opacity: unlockedTier < 2 ? 0.4 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Unlock Tier 3: Step-by-Step Logic</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', gap: 3 }}>
                Reveal Hint <ChevronRight size={14} />
              </span>
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            💡 Progressive hints protect your problem-solving memory.
          </span>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
