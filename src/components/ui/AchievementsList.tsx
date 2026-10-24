import { useState } from 'react';
import { ACHIEVEMENTS, type Achievement } from '../../data/achievements';
import { useApp } from '../../context/AppContext';
import { Award, Lock, CheckCircle2, Sparkles, ChevronRight, Share2 } from 'lucide-react';
import { CertificateModal } from './CertificateModal';
import { ShareModal } from './ShareModal';

export function AchievementsList() {
  const { analytics, store } = useApp();
  const [certOpen, setCertOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const unlockedCount = ACHIEVEMENTS.filter(a => a.isUnlocked(analytics, store)).length;

  return (
    <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.08))',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={18} color="#fbbf24" />
          </div>
          <div>
            <h3 style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
              Milestones & Badges
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {unlockedCount} of {ACHIEVEMENTS.length} Badges Unlocked
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShareOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Share2 size={13} color="var(--accent-blue-light)" /> Share Progress
          </button>

          <button
            onClick={() => setCertOpen(true)}
            className="btn btn-primary btn-sm"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              color: '#ffffff',
              gap: 6,
            }}
          >
            <Sparkles size={13} /> Certificate
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 12,
        }}
      >
        {ACHIEVEMENTS.map(badge => {
          const unlocked = badge.isUnlocked(analytics, store);
          const prog = badge.progress(analytics, store);

          const rarityColor = {
            Common: '#94a3b8',
            Rare: '#38bdf8',
            Epic: '#a78bfa',
            Legendary: '#fbbf24',
          }[badge.rarity];

          return (
            <div
              key={badge.id}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: unlocked
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)'
                  : 'rgba(0, 0, 0, 0.2)',
                border: unlocked
                  ? `1px solid ${rarityColor}40`
                  : '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                opacity: unlocked ? 1 : 0.65,
              }}
            >
              {unlocked && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${rarityColor}, transparent)`,
                  }}
                />
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24, filter: unlocked ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'grayscale(1)' }}>
                      {badge.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: unlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {badge.title}
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: rarityColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
                        }}
                      >
                        {badge.rarity}
                      </span>
                    </div>
                  </div>

                  {unlocked ? (
                    <CheckCircle2 size={16} color="#34d399" />
                  ) : (
                    <Lock size={14} color="var(--text-muted)" />
                  )}
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.45 }}>
                  {badge.description}
                </p>
              </div>

              {/* Progress bar if locked or status */}
              <div>
                {unlocked ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✓ Conquered
                  </span>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Progress</span>
                      <span>{prog.current}/{prog.total}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${prog.pct}%`,
                          background: `linear-gradient(90deg, ${rarityColor}, #6366f1)`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {certOpen && <CertificateModal onClose={() => setCertOpen(false)} />}
      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
    </div>
  );
}
