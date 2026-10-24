import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon, Calendar, Target, RefreshCcw,
  Download, Upload, Sun, Moon, Bell, BellOff, AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

export function SettingsPage() {
  const { store, updateSettings, toggleTheme, exportData, importData, resetAll, showNotification } = useApp();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa30-progress-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Progress exported!', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const success = importData(text);
      if (!success) {
        setImportError('Invalid file format. Please use a valid DSA 30 export file.');
      } else {
        setImportError('');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    resetAll();
    setResetConfirm(false);
  };

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <SettingsIcon size={22} style={{ color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Settings
          </h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Customize your challenge experience and manage your data.
        </p>
      </div>

      {/* Challenge Settings */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} style={{ color: 'var(--accent-blue)' }} />
          Challenge Settings
        </div>

        {/* Start date */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Challenge Start Date
          </label>
          <input
            type="date"
            className="input-base"
            style={{ maxWidth: 220 }}
            value={store.settings.startDate}
            onChange={e => updateSettings({ startDate: e.target.value })}
            aria-label="Challenge start date"
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Changes the calendar display. Your completion history is preserved.
          </p>
        </div>

        {/* Daily target */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Daily Target
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            {([1, 2, 3] as const).map(n => (
              <button
                key={n}
                onClick={() => updateSettings({ dailyTarget: n })}
                className="btn"
                style={{
                  minWidth: 64,
                  background: store.settings.dailyTarget === n ? 'var(--accent-blue)' : 'var(--bg-card)',
                  color: store.settings.dailyTarget === n ? 'white' : 'var(--text-secondary)',
                  border: store.settings.dailyTarget === n ? '1px solid var(--accent-blue)' : '1px solid var(--border)',
                }}
                aria-label={`Set daily target to ${n}`}
              >
                {n} {n === 1 ? 'problem' : 'problems'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            Default is 2 problems/day. Changing this won't affect completed problems.
          </p>
        </div>

        {/* Reminders */}
        <div>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            Daily Reminders
          </label>
          <button
            onClick={() => updateSettings({ remindersEnabled: !store.settings.remindersEnabled })}
            className={`btn ${store.settings.remindersEnabled ? 'btn-success' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            aria-label="Toggle daily reminders"
          >
            {store.settings.remindersEnabled
              ? <><Bell size={15} /> Reminders On</>
              : <><BellOff size={15} /> Reminders Off</>
            }
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
            In-app reminder notification (no external notifications required).
          </p>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sun size={18} style={{ color: '#fbbf24' }} />
          Appearance
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Theme</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Currently: {store.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </div>
          </div>
          <button
            id="settings-theme-toggle-btn"
            onClick={toggleTheme}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            aria-label="Toggle theme"
          >
            {store.theme === 'dark'
              ? <><Sun size={15} /> Switch to Light</>
              : <><Moon size={15} /> Switch to Dark</>
            }
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={18} style={{ color: 'var(--accent-purple)' }} />
          Data Management
        </div>

        {/* Export */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Export Progress</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            Download your progress, notes, and settings as a JSON backup file.
          </div>
          <button onClick={handleExport} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={15} /> Export as JSON
          </button>
        </div>

        {/* Import */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Import Progress</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            Restore from a previously exported JSON file. This will overwrite your current progress.
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            aria-label="Import progress file"
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={15} /> Import from JSON
          </button>
          {importError && (
            <div style={{ fontSize: 13, color: 'var(--danger)', marginTop: 8, display: 'flex', gap: 6 }}>
              <AlertTriangle size={14} /> {importError}
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: 24, borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f87171', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} />
          Danger Zone
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Reset all progress data. This action cannot be undone. All completed problems, notes, and revision flags will be permanently deleted.
        </div>

        {resetConfirm ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={16} color="#f87171" />
            <span style={{ fontSize: 13, color: '#f87171', flex: 1 }}>Are you sure? All progress will be lost.</span>
            <button onClick={handleReset} className="btn btn-danger btn-sm">Confirm Reset</button>
            <button onClick={() => setResetConfirm(false)} className="btn btn-secondary btn-sm">Cancel</button>
          </div>
        ) : (
          <button onClick={handleReset} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCcw size={15} /> Reset All Progress
          </button>
        )}
      </div>
    </div>
  );
}
