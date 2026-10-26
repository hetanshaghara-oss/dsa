import React from 'react';
import { createPortal } from 'react-dom';
import {
  X, Shield, ShieldCheck, ShieldAlert, Sparkles, Flame, Check, RotateCcw,
  Calendar, AlertCircle, Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StreakShieldModalProps {
  onClose: () => void;
}

export function StreakShieldModal({ onClose }: StreakShieldModalProps) {
  const { analytics, refillStreakShields, useStreakShield } = useApp();
  const shieldsAvailable = analytics.streakFreezesAvailable;
  const shieldsUsed = analytics.streakFreezesUsed;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-card)',
          borderRadius: 20,
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15)',
          padding: '28px',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="icon-button"
          style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32 }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Hero Shield Visual */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '2px solid rgba(56, 189, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.35)',
            }}
          >
            <ShieldCheck size={38} color="#38bdf8" />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Duolingo-Style <span className="gradient-text">Streak Shields</span>
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Never lose your momentum. Streak shields automatically freeze your streak if you miss a single day of practice.
          </p>
        </div>

        {/* Shield Inventory Counter */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map(slot => (
                <div
                  key={slot}
                  style={{
                    width: 32,
                    height: 38,
                    borderRadius: 8,
                    background: slot <= shieldsAvailable ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: slot <= shieldsAvailable ? '1.5px solid #38bdf8' : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Shield size={18} color={slot <= shieldsAvailable ? '#38bdf8' : 'var(--text-muted)'} fill={slot <= shieldsAvailable ? '#38bdf8' : 'none'} />
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                {shieldsAvailable} of 3 Shields Equipped
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {shieldsAvailable > 0 ? 'Your streak is fully protected' : 'No shields active! Re-equip below'}
              </div>
            </div>
          </div>

          {shieldsAvailable < 3 && (
            <button
              onClick={() => refillStreakShields()}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, padding: '7px 14px' }}
            >
              <Sparkles size={13} /> Refill (+1)
            </button>
          )}
        </div>

        {/* How It Works Card */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <Flame size={16} color="#fbbf24" />
            <span><strong>Automatic Protection:</strong> If you miss a day, 1 shield is consumed to freeze your streak.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <Sparkles size={16} color="#38bdf8" />
            <span><strong>Earn Refills:</strong> Maintaining a 7-day streak or completing weekend review unlocks free refills.</span>
          </div>
        </div>

        {/* History of Protected Days */}
        {shieldsUsed.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Protection History ({shieldsUsed.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
              {shieldsUsed.map((record, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={13} color="#38bdf8" />
                    {record.date} — {record.reason}
                  </span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Saved</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="btn btn-primary"
          style={{ width: '100%', padding: '10px' }}
        >
          Got it!
        </button>
      </div>
    </div>,
    document.body
  );
}
