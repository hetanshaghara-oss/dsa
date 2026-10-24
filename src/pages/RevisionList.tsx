import { PROBLEMS } from '../data/problems';
import { useApp } from '../context/AppContext';
import { ProblemCard } from '../components/ui/ProblemCard';
import { Bookmark, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RevisionList() {
  const { getProblemUserData } = useApp();
  const navigate = useNavigate();

  const revisionProblems = PROBLEMS.filter(p => {
    const ud = getProblemUserData(p.id);
    return ud.needsRevision || ud.status === 'needs-revision';
  });

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
          Revision <span className="gradient-text">Queue</span>
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
          Problems flagged for spaced repetition or marked as needing revision.
        </p>
      </div>

      {revisionProblems.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Bookmark size={24} color="#fbbf24" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            No Problems Flagged For Revision
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.6 }}>
            When solving a problem, click the "Revise" bookmark button to save it here for quick practice before interviews.
          </p>
          <button onClick={() => navigate('/problems')} className="btn btn-primary btn-sm">
            Browse All Problems
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              marginBottom: 18,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Bookmark size={16} color="#fbbf24" />
            <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600 }}>
              {revisionProblems.length} problem{revisionProblems.length !== 1 ? 's' : ''} currently queued for review
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {revisionProblems.map(problem => (
              <ProblemCard key={problem.id} problem={problem} showDay />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
