import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, BarChart2, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/challenge"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <Calendar size={20} />
        <span>Daily</span>
      </NavLink>

      <NavLink
        to="/problems"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <BookOpen size={20} />
        <span>Problems</span>
      </NavLink>

      <NavLink
        to="/analytics"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <BarChart2 size={20} />
        <span>Analytics</span>
      </NavLink>

      <button
        onClick={onOpenMenu}
        className="bottom-nav-item bottom-nav-menu-btn"
        aria-label="Open full menu"
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}
