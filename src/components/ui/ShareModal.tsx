import { useState } from 'react';
import { X, Share2, Copy, Check, Zap, Flame, Award, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShareModalProps {
  onClose: () => void;
}

export function ShareModal({ onClose }: ShareModalProps) {
  const { analytics, store } = useApp();
  const [copied, setCopied] = useState(false);

  const shareText = `🚀 Conquered Day ${analytics.currentDay} of the 30-Day DSA Challenge!\n\n` +
    `✅ Problems Solved: ${analytics.completedProblems}/60 (${analytics.completionPct}%)\n` +
    `🔥 Current Streak: ${analytics.currentStreak} day${analytics.currentStreak !== 1 ? 's' : ''}\n` +
    `📚 Mastering Stack, Queue, Linked List & Binary Tree in C++.\n\n` +
    `#30DaysOfCode #DSA #LeetCode #CodingChallenge #Cpp`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkedInShare = () => {
    // Open LinkedIn feed share
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="overlay animate-fade-in" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          background: 'var(--bg-card)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 size={18} color="var(--accent-blue-light)" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              Share Your Daily Progress
            </span>
          </div>

          <button
            onClick={onClose}
            className="icon-button"
            style={{ width: 32, height: 32, padding: 0 }}
            aria-label="Close share modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Visual Social Card Preview */}
        <div style={{ padding: '22px 24px' }}>
          <div
            id="share-card-element"
            style={{
              padding: '24px 26px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #0d1224 0%, #171d38 50%, #0e1328 100%)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Brand Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
                  }}
                >
                  <Zap size={17} color="white" fill="white" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                    DSA <span className="gradient-text">30</span>
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    The 60 Problem Challenge
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>🔥</span>
                <span>{analytics.currentStreak} Day Streak</span>
              </div>
            </div>

            {/* Middle Stats Showcase */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
              <div
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--accent-blue-light)', marginTop: 2 }}>
                  Day {analytics.currentDay}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>of 30 Days</div>
              </div>

              <div
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Solved</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#34d399', marginTop: 2 }}>
                  {analytics.completedProblems}/60
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Problems</div>
              </div>

              <div
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Progress</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#a78bfa', marginTop: 2 }}>
                  {analytics.completionPct}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Completed</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="progress-bar" style={{ height: 8, marginBottom: 14 }}>
              <div className="progress-fill" style={{ width: `${analytics.completionPct}%` }} />
            </div>

            {/* Topics Covered Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Stack', 'Queue', 'Linked List', 'Binary Tree'].map(t => {
                const stat = analytics.byTopic[t];
                const done = stat ? stat.completed > 0 : false;
                return (
                  <span
                    key={t}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: done ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: done ? '#818cf8' : 'var(--text-muted)',
                      border: done ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {t}: {stat ? `${stat.completed}/${stat.total}` : '0/14'}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Social Share Buttons */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <button
                onClick={handleTwitterShare}
                className="btn btn-primary"
                style={{
                  background: '#000000',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  gap: 8,
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share to X (Twitter)</span>
              </button>

              <button
                onClick={handleLinkedInShare}
                className="btn btn-primary"
                style={{
                  background: '#0a66c2',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  gap: 8,
                }}
              >
                <Share2 size={15} />
                <span>Share to LinkedIn</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{ width: '100%', gap: 8 }}
            >
              {copied ? (
                <>
                  <Check size={15} color="#34d399" />
                  <span style={{ color: '#34d399' }}>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy Formatted Update for WhatsApp/Discord</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
