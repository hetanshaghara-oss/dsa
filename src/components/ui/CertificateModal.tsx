import { useState, useRef } from 'react';
import { X, Award, Download, Printer, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

interface CertificateModalProps {
  onClose: () => void;
}

export function CertificateModal({ onClose }: CertificateModalProps) {
  const { analytics } = useApp();
  const [userName, setUserName] = useState('DSA Challenger');
  const [isEditing, setIsEditing] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="overlay animate-fade-in" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Controls Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} color="#fbbf24" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              Official Certificate of Mastery
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="icon-button"
              style={{ width: 32, height: 32, padding: 0 }}
              aria-label="Close certificate"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Name input row */}
        <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Recipient Name:
          </label>
          <input
            type="text"
            className="input-base"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Enter your full name"
            style={{ maxWidth: 260, height: 34, fontSize: 13, padding: '0 10px' }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            (Type your name to personalize your credential)
          </span>
        </div>

        {/* Certificate Canvas Area */}
        <div style={{ padding: 24, overflowY: 'auto' }}>
          <div
            ref={certRef}
            className="certificate-container"
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #0b0f19 0%, #151d33 50%, #0c1122 100%)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 16,
              padding: '40px 36px',
              textAlign: 'center',
              boxShadow: '0 0 35px rgba(245, 158, 11, 0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Corner Decorative Borders */}
            <div style={{ position: 'absolute', top: 12, left: 12, width: 30, height: 30, borderTop: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24' }} />
            <div style={{ position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderTop: '2px solid #fbbf24', borderRight: '2px solid #fbbf24' }} />
            <div style={{ position: 'absolute', bottom: 12, left: 12, width: 30, height: 30, borderBottom: '2px solid #fbbf24', borderLeft: '2px solid #fbbf24' }} />
            <div style={{ position: 'absolute', bottom: 12, right: 12, width: 30, height: 30, borderBottom: '2px solid #fbbf24', borderRight: '2px solid #fbbf24' }} />

            {/* Certificate Header */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: 16 }}>
              <Sparkles size={14} color="#fbbf24" />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', color: '#fbbf24', textTransform: 'uppercase' }}>
                Verified DSA 30 Completion Credential
              </span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '0.5px', color: '#ffffff', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
              Certificate of Achievement
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              This certifies that
            </p>

            {/* Recipient Name */}
            <div style={{ fontSize: 32, fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.5px', marginBottom: 16, textShadow: '0 0 20px rgba(245, 158, 11, 0.35)' }}>
              {userName || 'Candidate'}
            </div>

            <p style={{ fontSize: 14.5, color: '#e2e8f0', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.65 }}>
              has successfully completed the intensive <strong style={{ color: '#818cf8' }}>30-Day Algorithm Mastery Challenge</strong>, solving 60 curated LeetCode algorithmic problems across Stack, Queue, Deque, Linked List, and Binary Tree data structures.
            </p>

            {/* Badges in Certificate */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
              {[
                { label: '60 Problems Solved', icon: '🏆' },
                { label: 'All 5 Topics Mastered', icon: '⚡' },
                { label: 'Spaced Repetition Verified', icon: '🧠' },
                { label: 'C++ STL Mastery', icon: '💻' },
              ].map(b => (
                <div
                  key={b.label}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>

            {/* Signatures & Seal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 20, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Issue Date</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {format(new Date(), 'MMMM d, yyyy')}
                </div>
              </div>

              {/* Verified Seal */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    border: '2px solid #fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
                    marginBottom: 6,
                  }}
                >
                  <ShieldCheck size={28} color="#fbbf24" />
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  DSA 30 Certified
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>
                  {analytics.completedProblems}/60 Completed ({analytics.completionPct}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Share your milestone on LinkedIn or your tech portfolio!
          </span>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            Print Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
