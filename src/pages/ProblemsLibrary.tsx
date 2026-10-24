import { useState, useMemo } from 'react';
import { PROBLEMS } from '../data/problems';
import type { Difficulty, Topic, ProblemStatus } from '../data/problems';
import { ProblemCard } from '../components/ui/ProblemCard';
import { useApp } from '../context/AppContext';
import { Search, Filter, X, BookOpen, Sparkles } from 'lucide-react';

type StatusFilter = 'all' | 'not-started' | 'attempted' | 'solved' | 'needs-revision';
type SortOption = 'day-asc' | 'day-desc' | 'difficulty' | 'status';

const TOPICS: (Topic | 'all')[] = ['all', 'Stack', 'Queue', 'Deque', 'Linked List', 'Binary Tree', 'Mixed'];
const DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'Easy', 'Medium', 'Hard'];
const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'not-started', label: 'Not Started' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'solved', label: 'Solved' },
  { value: 'needs-revision', label: 'Needs Revision' },
];

const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

export function ProblemsLibrary() {
  const { getProblemUserData } = useApp();
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<Topic | 'all'>('all');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dayFilter, setDayFilter] = useState<number | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('day-asc');

  const filtered = useMemo(() => {
    let result = [...PROBLEMS];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.number && String(p.number).includes(q))
      );
    }

    // Topic
    if (topicFilter !== 'all') {
      result = result.filter(p => p.topic === topicFilter);
    }

    // Difficulty
    if (diffFilter !== 'all') {
      result = result.filter(p => p.difficulty === diffFilter);
    }

    // Status
    if (statusFilter !== 'all') {
      result = result.filter(p => {
        const ud = getProblemUserData(p.id);
        return ud.status === statusFilter;
      });
    }

    // Day
    if (dayFilter !== 'all') {
      result = result.filter(p => p.day === dayFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'day-asc': return a.day - b.day || a.orderInDay - b.orderInDay;
        case 'day-desc': return b.day - a.day || a.orderInDay - b.orderInDay;
        case 'difficulty': return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
        case 'status': {
          const sa = getProblemUserData(a.id).status;
          const sb = getProblemUserData(b.id).status;
          const order = { 'solved': 0, 'needs-revision': 1, 'attempted': 2, 'not-started': 3 };
          return (order[sa] ?? 4) - (order[sb] ?? 4);
        }
        default: return 0;
      }
    });

    return result;
  }, [search, topicFilter, diffFilter, statusFilter, dayFilter, sort, getProblemUserData]);

  const hasActiveFilters = search || topicFilter !== 'all' || diffFilter !== 'all' || statusFilter !== 'all' || dayFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setTopicFilter('all');
    setDiffFilter('all');
    setStatusFilter('all');
    setDayFilter('all');
    setSort('day-asc');
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Title */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
          All 60 <span className="gradient-text">Challenge Problems</span>
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--text-secondary)' }}>
          Search, sort, and filter across the complete 30-day curriculum.
        </p>
      </div>

      {/* Filter Control Box */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 22 }}>
        {/* Topic Quick Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
          {TOPICS.map(t => {
            const active = topicFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '1px solid var(--accent-blue-light)' : '1px solid var(--border)',
                  background: active ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.15))' : 'rgba(255, 255, 255, 0.03)',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {t === 'all' ? 'All Topics (60)' : t}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-base"
            style={{ paddingLeft: 38, height: 42, fontSize: 14 }}
            placeholder="Search problems by name or LeetCode number (e.g. 20, Valid Parentheses)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search problems"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdowns Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <select className="input-base" value={diffFilter} onChange={e => setDiffFilter(e.target.value as Difficulty | 'all')} aria-label="Filter by difficulty">
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'all' ? 'All Difficulties' : d}</option>)}
          </select>

          <select className="input-base" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filter by status">
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select className="input-base" value={dayFilter} onChange={e => setDayFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))} aria-label="Filter by day">
            <option value="all">All Days (1–30)</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>

          <select className="input-base" value={sort} onChange={e => setSort(e.target.value as SortOption)} aria-label="Sort problems">
            <option value="day-asc">Sort: Day 1 → 30</option>
            <option value="day-desc">Sort: Day 30 → 1</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {/* Active Filters Clear Button */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--accent-blue-light)' }}>
              Active filters applied
            </span>
            <button onClick={clearFilters} className="btn btn-sm btn-secondary">
              <X size={13} /> Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Count Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of 60 problems
        </span>
      </div>

      {/* Problem Cards List */}
      {filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px' }}>
          <BookOpen size={44} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No Matching Problems
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>
            Try adjusting your search query, difficulty, or topic filter.
          </p>
          <button onClick={clearFilters} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(problem => (
            <ProblemCard key={problem.id} problem={problem} showDay />
          ))}
        </div>
      )}
    </div>
  );
}
