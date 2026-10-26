import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, Zap, Flame, Calendar, Sparkles, Share2, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Notification } from '../ui/Notification';
import { ShareModal } from '../ui/ShareModal';
import { AddProblemModal } from '../ui/AddProblemModal';
import { useApp } from '../../context/AppContext';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { analytics, store, toggleTheme, addProblemModalOpen, setAddProblemModalOpen } = useApp();
  const location = useLocation();

  // Close sidebar drawer on route navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/challenge/')) return `Day ${path.split('/')[2]} Challenge`;
    if (path === '/challenge') return '30-Day Curriculum Track';
    if (path === '/problems') return `Question Library (${analytics.totalProblems})`;
    if (path === '/analytics') return 'Progress & Analytics';
    if (path === '/revision') return 'Smart Spaced Repetition';
    if (path === '/resources') return 'C++ STL Reference';
    if (path === '/settings') return 'Settings';
    return 'DSA 30';
  };

  return (
    <div className="layout-root">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="top-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="mobile-menu-btn icon-button"
              aria-label="Toggle sidebar menu"
            >
              <Menu size={18} />
            </button>

            {/* Mobile Brand Logo */}
            <Link to="/" className="mobile-brand-link" aria-label="DSA 30 Home">
              <div className="mobile-brand-icon">
                <Zap size={14} color="white" fill="white" />
              </div>
              <span className="mobile-brand-title">
                DSA <span className="gradient-text">30</span>
              </span>
            </Link>

            {/* Page Title or Breadcrumb */}
            <div className="desktop-page-title">
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                {getPageTitle()}
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Quick Metrics Badges */}
          <div className="header-badges-group">
            {/* Current Day Badge */}
            <div className="header-badge header-badge-day">
              <Calendar size={13} />
              <span>Day {analytics.currentDay}</span>
            </div>

            {/* Problems Solved Badge */}
            <div className="header-badge header-badge-solved">
              <span>{analytics.completedProblems}/{analytics.totalProblems} Solved</span>
            </div>

            {/* Streak Badge */}
            <div
              className={`header-badge header-badge-streak ${analytics.currentStreak > 0 ? 'active' : ''}`}
            >
              <span className={analytics.currentStreak > 0 ? 'flame-anim' : ''}>🔥</span>
              <span>{analytics.currentStreak}d</span>
            </div>

            {/* Quick Add Question Button */}
            <button
              onClick={() => setAddProblemModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 12px', fontSize: 12, gap: 5, borderRadius: 8 }}
              title="Add a custom question to your library"
            >
              <Plus size={13} />
              <span className="desktop-page-title">Add Question</span>
            </button>

            {/* Share Progress Button */}
            <button
              onClick={() => setShareOpen(true)}
              className="icon-button"
              style={{ padding: '6px 10px', gap: 5, fontSize: 12, borderRadius: 8 }}
              aria-label="Share progress"
              title="Share your daily progress"
            >
              <Share2 size={14} color="var(--accent-blue-light)" />
              <span className="desktop-page-title" style={{ fontSize: 12, fontWeight: 600 }}>Share</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              aria-label="Toggle theme"
              title={`Switch to ${store.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {store.theme === 'dark' ? (
                <Sun size={15} color="#fbbf24" />
              ) : (
                <Moon size={15} color="#6366f1" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="main-viewport">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
      {addProblemModalOpen && <AddProblemModal onClose={() => setAddProblemModalOpen(false)} />}
      <Notification />
    </div>
  );
}
