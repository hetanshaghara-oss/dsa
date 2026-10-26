import { useState, useMemo } from 'react';
import type { Difficulty, Topic, ProblemStatus, Problem } from '../data/problems';
import { ProblemCard } from '../components/ui/ProblemCard';
import { useApp } from '../context/AppContext';
import { Search, Filter, X, BookOpen, Sparkles, Building2, Plus, CheckCircle2 } from 'lucide-react';
import { CompanyLogo, TOP_COMPANIES } from '../data/companyLogos';
import { getProblemMetadata } from '../data/problemMetadata';
import { AddProblemModal } from '../components/ui/AddProblemModal';

type StatusFilter = 'all' | 'not-started' | 'attempted' | 'solved' | 'needs-revision';
type SortOption = 'day-asc' | 'day-desc' | 'difficulty' | 'status' | 'title';
type SourceFilter = 'all' | 'curriculum' | 'custom';

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
  const {
    getProblemUserData,
    allProblems,
    analytics,
    addProblemModalOpen,
    setAddProblemModalOpen,
  } = useApp();

  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<string | 'all'>('all');
  const [companyFilter, setCompanyFilter] = useState<string | 'all'>('all');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [dayFilter, setDayFilter] = useState<number | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('day-asc');
  const [localAddModalOpen, setLocalAddModalOpen] = useState(false);

  // Dynamic topics extracted from current problem set
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    allProblems.forEach(p => set.add(p.topic));
    return ['all', ...Array.from(set)];
  }, [allProblems]);

  const filtered = useMemo(() => {
    let result = [...allProblems];

    // Source Filter (Curriculum 60 vs Custom)
    if (sourceFilter === 'curriculum') {
      result = result.filter(p => !p.isCustom);
    } else if (sourceFilter === 'custom') {
      result = result.filter(p => p.isCustom);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.number && String(p.number).includes(q))
      );
    }

    // Company
    if (companyFilter !== 'all') {
      result = result.filter(p => {
        const customCompanies = p.companies;
        if (customCompanies && customCompanies.length > 0) {
          return customCompanies.some(c => c.toLowerCase() === companyFilter.toLowerCase());
        }
        const meta = getProblemMetadata(p.id);
        return meta.companies.some(c => c.toLowerCase() === companyFilter.toLowerCase());
      });
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
        case 'day-asc': {
          const dayA = a.day ?? 999;
          const dayB = b.day ?? 999;
          if (dayA !== dayB) return dayA - dayB;
          return (a.orderInDay ?? 1) - (b.orderInDay ?? 1);
        }
        case 'day-desc': {
          const dayA = a.day ?? -1;
          const dayB = b.day ?? -1;
          if (dayA !== dayB) return dayB - dayA;
          return (a.orderInDay ?? 1) - (b.orderInDay ?? 1);
        }
        case 'difficulty': return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
        case 'status': {
          const sa = getProblemUserData(a.id).status;
          const sb = getProblemUserData(b.id).status;
          const order = { 'solved': 0, 'needs-revision': 1, 'attempted': 2, 'not-started': 3 };
          return (order[sa] ?? 4) - (order[sb] ?? 4);
        }
        case 'title': return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

    return result;
  }, [allProblems, sourceFilter, search, companyFilter, topicFilter, diffFilter, statusFilter, dayFilter, sort, getProblemUserData]);

  const hasActiveFilters = search || topicFilter !== 'all' || companyFilter !== 'all' || diffFilter !== 'all' || statusFilter !== 'all' || sourceFilter !== 'all' || dayFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setTopicFilter('all');
    setCompanyFilter('all');
    setDiffFilter('all');
    setStatusFilter('all');
    setSourceFilter('all');
    setDayFilter('all');
    setSort('day-asc');
  };

  const showAddModal = localAddModalOpen || addProblemModalOpen;
  const handleCloseAddModal = () => {
    setLocalAddModalOpen(false);
    setAddProblemModalOpen(false);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Top Header Row with Add Question Button */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 6 }}>
            Question Library <span className="gradient-text">({allProblems.length} Problems)</span>
          </h1>
          <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', margin: 0 }}>
            Curated questions + your custom added challenges. Filter by topic, difficulty, or company.
          </p>
        </div>

        <button
          onClick={() => setLocalAddModalOpen(true)}
          className="btn btn-primary"
          style={{
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 700,
            gap: 8,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          }}
        >
          <Plus size={17} /> Add Question
        </button>
      </div>

      {/* Filter Control Box */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 22 }}>
        {/* Source Toggle Pills (All, Curriculum 60, Custom) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginRight: 4 }}>
            Source:
          </span>
          {[
            { id: 'all', label: `All Questions (${allProblems.length})` },
            { id: 'curriculum', label: 'Curriculum (60)' },
            { id: 'custom', label: `Custom Added (${analytics.customProblemsCount})` },
          ].map(tab => {
            const active = sourceFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSourceFilter(tab.id as SourceFilter)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: active ? '1px solid var(--accent-blue-light)' : '1px solid var(--border)',
                  background: active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Topic Quick Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid var(--border)' }}>
          {availableTopics.map(t => {
            const active = topicFilter === t;
            const count = t === 'all' ? allProblems.length : allProblems.filter(p => p.topic === t).length;
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
                {t === 'all' ? `All Topics (${allProblems.length})` : `${t} (${count})`}
              </button>
            );
          })}
        </div>

        {/* Company Quick Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', whiteSpace: 'nowrap', marginRight: 4 }}>
            Company:
          </span>
          <button
            onClick={() => setCompanyFilter('all')}
            style={{
              padding: '5px 11px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: companyFilter === 'all' ? '1px solid var(--accent-cyan)' : '1px solid var(--border)',
              background: companyFilter === 'all' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: companyFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            All Companies
          </button>
          {TOP_COMPANIES.map(company => {
            const active = companyFilter.toLowerCase() === company.toLowerCase();
            return (
              <button
                key={company}
                onClick={() => setCompanyFilter(active ? 'all' : company)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  border: active ? '1px solid var(--accent-blue-light)' : '1px solid var(--border)',
                  background: active ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.2))' : 'rgba(255, 255, 255, 0.03)',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <CompanyLogo company={company} size={13} />
                <span>{company}</span>
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
            placeholder="Search questions by name or LeetCode number (e.g. 20, Trapping Rain Water)..."
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <select className="input-base" value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} aria-label="Filter by company">
            <option value="all">All Companies</option>
            {TOP_COMPANIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select className="input-base" value={diffFilter} onChange={e => setDiffFilter(e.target.value as Difficulty | 'all')} aria-label="Filter by difficulty">
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'all' ? 'All Difficulties' : d}</option>)}
          </select>

          <select className="input-base" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} aria-label="Filter by status">
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select className="input-base" value={sort} onChange={e => setSort(e.target.value as SortOption)} aria-label="Sort problems">
            <option value="day-asc">Sort: Day 1 → 30</option>
            <option value="day-desc">Sort: Day 30 → 1</option>
            <option value="difficulty">Sort: Difficulty</option>
            <option value="status">Sort: Solved Status</option>
            <option value="title">Sort: Alphabetical</option>
          </select>
        </div>

        {/* Active Filters Clear Button */}
        {hasActiveFilters && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--accent-blue-light)' }}>
              Active filters applied ({filtered.length} matches)
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
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {allProblems.length} questions
        </span>
      </div>

      {/* Problem Cards List */}
      {filtered.length === 0 ? (
        <div className="card empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <BookOpen size={44} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No Matching Questions
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 18 }}>
            Try adjusting your search query, or add this problem to your personal collection.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={clearFilters} className="btn btn-secondary btn-sm">
              Reset Filters
            </button>
            <button onClick={() => setLocalAddModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={14} /> Add This Question
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(problem => (
            <ProblemCard key={problem.id} problem={problem} showDay={!problem.isCustom} />
          ))}
        </div>
      )}

      {/* Add Problem Modal */}
      {showAddModal && (
        <AddProblemModal onClose={handleCloseAddModal} />
      )}
    </div>
  );
}
