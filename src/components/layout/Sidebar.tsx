import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart2,
  Bookmark,
  Code2,
  Settings,
  Zap,
  X,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/challenge', icon: Calendar, label: 'Daily Challenge' },
  { to: '/problems', icon: BookOpen, label: 'All Problems' },
  { to: '/analytics', icon: BarChart2, label: 'Progress & Analytics' },
  { to: '/revision', icon: Bookmark, label: 'Revision List' },
  { to: '/resources', icon: Code2, label: 'C++ STL & Resources' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const { analytics } = useApp();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div className="overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Brand Logo Header */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
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
                flexShrink: 0,
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)',
              }}
            >
              <Zap size={20} color="white" fill="white" />
            </div>
            <div>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
                DSA <span className="gradient-text">30</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: 3 }}>
                60 Problem Challenge
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'none',
                padding: 4,
              }}
              className="mobile-close-btn"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Overall Progress Mini-Widget */}
          <div
            style={{
              marginTop: 18,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Progress</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-blue-light)' }}>
                {analytics.completionPct}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${analytics.completionPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10.5, color: 'var(--text-muted)' }}>
              <span>{analytics.completedProblems}/60 Solved</span>
              <span>Day {analytics.currentDay}/30</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 10px 8px' }}>
            Menu
          </div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Streak Widget */}
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)', background: 'rgba(0, 0, 0, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: analytics.currentStreak > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${analytics.currentStreak > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border)'}`,
                }}
              >
                <Flame size={16} color={analytics.currentStreak > 0 ? '#fbbf24' : 'var(--text-muted)'} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {analytics.currentStreak > 0 ? `${analytics.currentStreak} Day Streak` : 'No Streak Yet'}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                  Target: 2 problems/day
                </div>
              </div>
            </div>

            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: analytics.currentStreak > 0 ? '#10b981' : 'var(--text-muted)',
                boxShadow: analytics.currentStreak > 0 ? '0 0 8px #10b981' : 'none',
              }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
