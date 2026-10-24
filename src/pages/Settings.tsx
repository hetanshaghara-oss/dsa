import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon, Calendar, Target, RefreshCcw,
  Download, Upload, Sun, Moon, Bell, BellOff, AlertTriangle,
  Sparkles, Key, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { testAiConnection } from '../services/aiService';

export function SettingsPage() {
  const { store, updateSettings, toggleTheme, exportData, importData, resetAll, showNotification } = useApp();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importError, setImportError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
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

  const handleTestAi = async () => {
    setTestStatus('testing');
    setTestMessage('Connecting to OpenRouter...');
    const res = await testAiConnection(store.settings.openRouterApiKey, store.settings.aiModel);
    if (res.ok) {
      setTestStatus('success');
      setTestMessage('Connected! OpenRouter API key is valid.');
      showNotification('OpenRouter AI connected successfully!', 'success');
    } else {
      setTestStatus('error');
      setTestMessage(res.message);
      showNotification('Failed to connect to OpenRouter', 'error');
    }
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

      {/* AI Coach (OpenRouter) */}
      <div className="card" style={{ padding: 24, marginBottom: 16, border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(99, 102, 241, 0.02) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
            AI DSA Coach (OpenRouter)
          </div>
          <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', fontSize: 11, fontWeight: 700, padding: '3px 8px' }}>
            Active
          </span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
          Powers dynamic hints, code analysis, edge cases, and algorithmic complexity walkthroughs inside every problem's Hints modal.
        </p>

        {/* API Key */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            OpenRouter API Key
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                className="input-base"
                style={{ width: '100%', paddingRight: 40, fontFamily: 'monospace', fontSize: 13 }}
                value={store.settings.openRouterApiKey || ''}
                onChange={e => updateSettings({ openRouterApiKey: e.target.value.trim() })}
                placeholder="sk-or-v1-..."
                aria-label="OpenRouter API Key"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="Toggle API key visibility"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={handleTestAi}
              disabled={testStatus === 'testing'}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontSize: 13 }}
            >
              <Key size={14} />
              {testStatus === 'testing' ? 'Testing...' : 'Test Key'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
            Key is saved privately in your local browser storage and requests go directly to OpenRouter.
          </p>
        </div>

        {/* Model Selection */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            AI Model
          </label>
          <select
            className="input-base"
            style={{ width: '100%', maxWidth: 360, fontSize: 13 }}
            value={store.settings.aiModel || 'deepseek/deepseek-chat'}
            onChange={e => updateSettings({ aiModel: e.target.value })}
            aria-label="Select AI Model"
          >
            <option value="deepseek/deepseek-chat">DeepSeek V3 (Coding Specialist & Recommended)</option>
            <option value="openrouter/auto">OpenRouter Auto (Highest Availability)</option>
            <option value="meta-llama/llama-3.3-70b-instruct">Meta Llama 3.3 70B Instruct</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini</option>
          </select>
        </div>

        {/* Test Result Feedback */}
        {testStatus !== 'idle' && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 10,
              background: testStatus === 'success' ? 'rgba(34, 197, 94, 0.1)' : testStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              border: `1px solid ${testStatus === 'success' ? 'rgba(34, 197, 94, 0.3)' : testStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              color: testStatus === 'success' ? '#22c55e' : testStatus === 'error' ? '#ef4444' : '#3b82f6'
            }}
          >
            {testStatus === 'success' && <CheckCircle size={16} />}
            {testStatus === 'error' && <AlertTriangle size={16} />}
            {testStatus === 'testing' && <RefreshCcw size={16} className="animate-spin" />}
            <span>{testMessage}</span>
          </div>
        )}
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
