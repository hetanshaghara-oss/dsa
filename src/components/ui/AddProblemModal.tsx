import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Link as LinkIcon, Hash, Tag, Building2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMMON_TOPICS } from '../../data/problems';
import type { Difficulty } from '../../data/problems';

interface AddProblemModalProps {
  onClose: () => void;
  onAdded?: (newProblemId: string) => void;
}

export function AddProblemModal({ onClose, onAdded }: AddProblemModalProps) {
  const { addProblem } = useApp();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [number, setNumber] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [selectedTopic, setSelectedTopic] = useState<string>('Array');
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomTopicActive, setIsCustomTopicActive] = useState(false);
  const [companies, setCompanies] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a problem title.');
      return;
    }

    const finalTopic = isCustomTopicActive ? customTopic.trim() : selectedTopic;
    if (!finalTopic) {
      setError('Please select or specify a topic category.');
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl) {
      // Auto-generate search URL on LeetCode if no direct URL is provided
      finalUrl = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(title.trim())}`;
    }

    const parsedNumber = number.trim() ? parseInt(number.trim(), 10) : undefined;
    const parsedCompanies = companies
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    const newProblem = addProblem({
      title: title.trim(),
      url: finalUrl,
      difficulty,
      topic: finalTopic,
      number: parsedNumber && !isNaN(parsedNumber) ? parsedNumber : undefined,
      companies: parsedCompanies.length > 0 ? parsedCompanies : ['General Tech'],
      hint: hint.trim() || undefined,
    });

    if (onAdded) {
      onAdded(newProblem.id);
    }
    onClose();
  };

  return (
    <div
      className="overlay animate-fade-in"
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '92vh',
          background: 'var(--bg-card)',
          borderRadius: 18,
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Plus size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                Add New Question
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Expand your library beyond the 60 curated problems
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close modal"
            style={{ width: 32, height: 32, padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: 13,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Problem Title & Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Problem Title <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Trapping Rain Water"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                className="input-field"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                LeetCode #
              </label>
              <div style={{ position: 'relative' }}>
                <Hash size={13} style={{ position: 'absolute', left: 10, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  placeholder="42"
                  value={number}
                  onChange={e => setNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 28px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Difficulty Selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Difficulty
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => {
                const isSelected = difficulty === d;
                const colors = {
                  Easy: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
                  Medium: { border: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
                  Hard: { border: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
                }[d];

                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: isSelected ? `2px solid ${colors.border}` : '1px solid var(--border)',
                      background: isSelected ? colors.bg : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? colors.text : 'var(--text-secondary)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: 13.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={14} />}
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Selector */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Topic / Category <span style={{ color: '#f87171' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomTopicActive(v => !v)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue-light)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {isCustomTopicActive ? '← Choose from standard topics' : '+ Add custom category name'}
              </button>
            </div>

            {isCustomTopicActive ? (
              <input
                type="text"
                placeholder="e.g. Bit Manipulation, Geometry, System Design..."
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--accent-blue-light)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
            ) : (
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {COMMON_TOPICS.map(t => (
                  <option key={t} value={t} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* URL Input */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              LeetCode / Problem URL
            </label>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="url"
                placeholder="https://leetcode.com/problems/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 34px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Tip: If left blank, it will auto-link to a LeetCode search for this title.
            </div>
          </div>

          {/* Target Companies */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Target Companies (comma-separated)
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={14} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. Google, Meta, Amazon, Microsoft"
                value={companies}
                onChange={e => setCompanies(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 34px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                }}
              />
            </div>
          </div>

          {/* Quick Initial Intuition / Hint (Optional) */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Key Intuition / Hint (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Use monotonic stack to track previous greater elements..."
              value={hint}
              onChange={e => setHint(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: 13.5,
                resize: 'vertical',
              }}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '9px 18px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '9px 22px', gap: 6, fontWeight: 700 }}
            >
              <Plus size={16} /> Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
