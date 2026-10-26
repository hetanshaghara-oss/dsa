import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon, Calendar, Target, RefreshCcw,
  Download, Upload, Sun, Moon, Bell, BellOff, AlertTriangle,
  Sparkles, Key, CheckCircle, Eye, EyeOff, Smartphone, Shield,
  ShieldCheck, Clock, Send, Laptop, MessageSquare, ExternalLink,
  CheckCircle2, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { testAiConnection } from '../services/aiService';
import {
  requestNotificationPermission,
  sendDailyHabitReminder,
  isNotificationSupported,
  getNotificationPermission,
} from '../services/pwaAndNotifications';
import { StreakShieldModal } from '../components/ui/StreakShieldModal';
import {
  DEFAULT_MOBILE_REMINDERS,
  type MessageChannel,
  type MobileNotificationSettings,
} from '../store/localStorage';

export function SettingsPage() {
  const {
    store,
    analytics,
    updateSettings,
    toggleTheme,
    exportData,
    importData,
    resetAll,
    showNotification,
    canInstallPWA,
    installPWA,
    isStandalone,
    refillStreakShields,
    sendMobileReminderNow,
  } = useApp();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [shieldModalOpen, setShieldModalOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [mobileTestStatus, setMobileTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [mobileTestMessage, setMobileTestMessage] = useState('');
  const [activeSlotTesting, setActiveSlotTesting] = useState<'test' | 'morning' | 'afternoon' | 'evening' | null>(null);
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

      </div>

      {/* 📱 Offline-First PWA (Progressive Web App) */}
      <div className="card" style={{ padding: 24, marginBottom: 16, border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(99, 102, 241, 0.03) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Smartphone size={18} style={{ color: '#38bdf8' }} />
            Progressive Web App (PWA) & Offline Mode
          </div>
          <span
            className="badge"
            style={{
              background: isStandalone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              color: isStandalone ? '#34d399' : '#38bdf8',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
            }}
          >
            {isStandalone ? 'Installed as Native App' : 'Offline-Ready'}
          </span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Install DSA 30 on your desktop or mobile home screen. Features offline caching, instant app launch, and zero browser chrome.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {canInstallPWA && !isStandalone && (
            <button
              onClick={installPWA}
              className="btn btn-primary"
              style={{ gap: 8, padding: '9px 20px', fontWeight: 800 }}
            >
              <Smartphone size={16} /> Install App to Device
            </button>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Laptop size={14} color="#38bdf8" />
            <span>Service Worker active: Works 100% offline with local cache</span>
          </div>
        </div>
      </div>

      {/* 📱 Daily 3-Time Mobile Reminders & Notifications */}
      {(() => {
        const mobileReminders: MobileNotificationSettings = {
          ...DEFAULT_MOBILE_REMINDERS,
          ...(store.settings.mobileReminders || {}),
        };

        const updateMobileReminders = (updates: Partial<MobileNotificationSettings>) => {
          updateSettings({
            mobileReminders: {
              ...mobileReminders,
              ...updates,
            },
          });
        };

        const handleTestMobile = async (slot: 'test' | 'morning' | 'afternoon' | 'evening' = 'test') => {
          setMobileTestStatus('testing');
          setActiveSlotTesting(slot);
          setMobileTestMessage(
            slot === 'test'
              ? `Dispatching test ping to ${mobileReminders.channel.toUpperCase()}...`
              : `Dispatching ${slot} preview to ${mobileReminders.channel.toUpperCase()}...`
          );

          if (mobileReminders.channel === 'push') {
            const granted = await requestNotificationPermission();
            if (!granted) {
              setMobileTestStatus('error');
              setMobileTestMessage('Browser notification permission was denied. Please allow notifications in site permissions.');
              showNotification('Notification permission denied', 'error');
              setActiveSlotTesting(null);
              return;
            }
          }

          try {
            const res = await sendMobileReminderNow(slot);
            if (res.success) {
              setMobileTestStatus('success');
              setMobileTestMessage(
                mobileReminders.channel === 'telegram'
                  ? '🚀 Message delivered to your Telegram! Check your phone right now.'
                  : mobileReminders.channel === 'whatsapp'
                  ? '📲 Dispatched to WhatsApp! Check your WhatsApp chat.'
                  : mobileReminders.channel === 'webhook'
                  ? '⚡ Webhook payload posted successfully!'
                  : '🔔 Local Web Push notification triggered!'
              );
              showNotification('📲 Mobile alert sent successfully!', 'success');
            } else {
              setMobileTestStatus('error');
              setMobileTestMessage(res.error || 'Failed to dispatch message. Verify your token or credentials.');
              showNotification(res.error || 'Failed to send alert', 'error');
            }
          } catch (err: any) {
            setMobileTestStatus('error');
            setMobileTestMessage(err?.message || 'Network error sending alert.');
          } finally {
            setActiveSlotTesting(null);
          }
        };

        return (
          <div className="card" style={{ padding: 24, marginBottom: 16, border: '1px solid rgba(59, 130, 246, 0.3)', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(139, 92, 246, 0.03) 100%)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={20} style={{ color: 'var(--accent-blue)' }} />
                Daily 3-Time Mobile Alerts & Reminders
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="badge"
                  style={{
                    background: store.settings.remindersEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: store.settings.remindersEnabled ? '#34d399' : '#f87171',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                  }}
                >
                  {store.settings.remindersEnabled ? '3x Daily Active' : 'Reminders Disabled'}
                </span>
                <button
                  onClick={() => {
                    updateSettings({ remindersEnabled: !store.settings.remindersEnabled });
                    showNotification(
                      !store.settings.remindersEnabled ? '🔔 3-Time Daily Reminders Activated!' : 'Reminders paused',
                      'success'
                    );
                  }}
                  className={`btn btn-sm ${store.settings.remindersEnabled ? 'btn-success' : 'btn-secondary'}`}
                  style={{ gap: 6 }}
                >
                  {store.settings.remindersEnabled ? <><Bell size={13} /> Active</> : <><BellOff size={13} /> Disabled</>}
                </button>
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>
              Receive automated reminders on your mobile phone <strong>3 times a day</strong> (Morning challenge kickoff, Midday flashcard recall, Evening streak saver) through Telegram, WhatsApp, Webhooks, or Native Web Push.
            </p>

            {/* Step 1: Channel Selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                1. Select Mobile Delivery Channel
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                {([
                  { id: 'telegram', name: 'Telegram Bot', icon: MessageSquare, badge: 'Recommended', color: '#38bdf8' },
                  { id: 'whatsapp', name: 'WhatsApp', icon: Smartphone, badge: 'CallMeBot', color: '#22c55e' },
                  { id: 'webhook', name: 'Webhook', icon: Send, badge: 'Discord / Make', color: '#a855f7' },
                  { id: 'push', name: 'Browser Push', icon: Bell, badge: 'PWA Web', color: '#fbbf24' },
                ] as const).map(ch => {
                  const Icon = ch.icon;
                  const isSelected = mobileReminders.channel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => updateMobileReminders({ channel: ch.id })}
                      className="btn"
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 6,
                        background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-card)',
                        border: isSelected ? '1.5px solid var(--accent-blue)' : '1px solid var(--border)',
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Icon size={18} color={isSelected ? 'var(--accent-blue)' : ch.color} />
                        <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: isSelected ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.06)', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                          {ch.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {ch.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Channel Configuration Credentials */}
            <div style={{ marginBottom: 22, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Key size={14} color="var(--accent-blue)" />
                2. Configure {mobileReminders.channel.toUpperCase()} Connection
              </div>

              {mobileReminders.channel === 'telegram' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        Telegram Bot Token
                      </label>
                      <input
                        type="password"
                        className="input-base"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
                        value={mobileReminders.telegramBotToken || ''}
                        onChange={e => updateMobileReminders({ telegramBotToken: e.target.value.trim() })}
                        placeholder="e.g. 7123456789:AAHk..."
                        aria-label="Telegram Bot Token"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        Your Telegram Chat ID
                      </label>
                      <input
                        type="text"
                        className="input-base"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
                        value={mobileReminders.telegramChatId || ''}
                        onChange={e => updateMobileReminders({ telegramChatId: e.target.value.trim() })}
                        placeholder="e.g. 987654321"
                        aria-label="Telegram Chat ID"
                      />
                    </div>
                  </div>

                  {/* 3-Step Guide */}
                  <div style={{ padding: 12, background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Info size={13} /> Quick 60-second setup on your phone:
                    </div>
                    <div>1. Open Telegram & search for <strong>@BotFather</strong>. Send <code>/newbot</code>, give it any name, and copy the <strong>HTTP API Token</strong> above.</div>
                    <div>2. Search for <strong>@userinfobot</strong> on Telegram & tap Start to see your numeric <strong>Id</strong> (Chat ID).</div>
                    <div>3. Open your new bot's chat and tap <strong>Start</strong> so it has permission to message you!</div>
                  </div>
                </div>
              )}

              {mobileReminders.channel === 'whatsapp' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        WhatsApp Phone Number (with Country Code)
                      </label>
                      <input
                        type="tel"
                        className="input-base"
                        style={{ width: '100%', fontSize: 12 }}
                        value={mobileReminders.whatsappPhone || ''}
                        onChange={e => updateMobileReminders({ whatsappPhone: e.target.value.trim() })}
                        placeholder="e.g. +919876543210 or +1234567890"
                        aria-label="WhatsApp Phone Number"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        CallMeBot API Key
                      </label>
                      <input
                        type="password"
                        className="input-base"
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
                        value={mobileReminders.whatsappApiKey || ''}
                        onChange={e => updateMobileReminders({ whatsappApiKey: e.target.value.trim() })}
                        placeholder="e.g. 123456"
                        aria-label="CallMeBot API Key"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Guide */}
                  <div style={{ padding: 12, background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Info size={13} /> How to get free WhatsApp API key in 30 seconds:
                    </div>
                    <div>1. Save phone number <strong>+34 941 86 00 25</strong> as <em>CallMeBot</em> in your mobile contacts.</div>
                    <div>2. Send message: <code>I allow callmebot to send me messages</code> to that number on WhatsApp.</div>
                    <div>3. CallMeBot will instantly reply with your personal <strong>apikey</strong>. Paste it above!</div>
                  </div>
                </div>
              )}

              {mobileReminders.channel === 'webhook' && (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Webhook Endpoint URL (Discord, Make, Zapier, Slack)
                    </label>
                    <input
                      type="url"
                      className="input-base"
                      style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
                      value={mobileReminders.customWebhookUrl || ''}
                      onChange={e => updateMobileReminders({ customWebhookUrl: e.target.value.trim() })}
                      placeholder="https://discord.com/api/webhooks/... or https://hook.eu1.make.com/..."
                      aria-label="Custom Webhook URL"
                    />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    DSA 30 sends a JSON POST request containing the problem titles, LeetCode links, difficulty, and your current streak. Compatible with Discord webhooks directly.
                  </p>
                </div>
              )}

              {mobileReminders.channel === 'push' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Local Browser & PWA Web Push
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Sends native push notifications on desktop or Android mobile when installed as PWA.
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const granted = await requestNotificationPermission();
                      if (granted) showNotification('Notification permission granted!', 'success');
                      else showNotification('Permission denied by browser', 'error');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 6 }}
                  >
                    <Bell size={13} />
                    Status: {getNotificationPermission()}
                  </button>
                </div>
              )}
            </div>

            {/* Step 3: 3-Times Daily Schedule Grid */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                3. Daily 3-Time Schedule & Triggers
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {/* Slot 1: Morning */}
                <div
                  style={{
                    padding: 14,
                    background: 'var(--bg-card)',
                    border: mobileReminders.slot1Enabled ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      🌅 Slot 1: Morning
                    </span>
                    <input
                      type="checkbox"
                      checked={mobileReminders.slot1Enabled}
                      onChange={e => updateMobileReminders({ slot1Enabled: e.target.checked })}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                      aria-label="Enable morning slot"
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Day challenge problems & streak motivation kickoff.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <input
                      type="time"
                      className="input-base"
                      style={{ padding: '4px 8px', fontSize: 12, width: 110 }}
                      value={mobileReminders.slot1Time || '09:00'}
                      onChange={e => updateMobileReminders({ slot1Time: e.target.value })}
                      disabled={!mobileReminders.slot1Enabled}
                    />
                  </div>
                </div>

                {/* Slot 2: Midday */}
                <div
                  style={{
                    padding: 14,
                    background: 'var(--bg-card)',
                    border: mobileReminders.slot2Enabled ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      ☀️ Slot 2: Midday
                    </span>
                    <input
                      type="checkbox"
                      checked={mobileReminders.slot2Enabled}
                      onChange={e => updateMobileReminders({ slot2Enabled: e.target.checked })}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                      aria-label="Enable midday slot"
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Spaced repetition recall check for due flashcards.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <input
                      type="time"
                      className="input-base"
                      style={{ padding: '4px 8px', fontSize: 12, width: 110 }}
                      value={mobileReminders.slot2Time || '14:00'}
                      onChange={e => updateMobileReminders({ slot2Time: e.target.value })}
                      disabled={!mobileReminders.slot2Enabled}
                    />
                  </div>
                </div>

                {/* Slot 3: Evening */}
                <div
                  style={{
                    padding: 14,
                    background: 'var(--bg-card)',
                    border: mobileReminders.slot3Enabled ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      🌙 Slot 3: Evening
                    </span>
                    <input
                      type="checkbox"
                      checked={mobileReminders.slot3Enabled}
                      onChange={e => updateMobileReminders({ slot3Enabled: e.target.checked })}
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                      aria-label="Enable evening slot"
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Streak saver reminder to protect shields before midnight.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <input
                      type="time"
                      className="input-base"
                      style={{ padding: '4px 8px', fontSize: 12, width: 110 }}
                      value={mobileReminders.slot3Time || '20:00'}
                      onChange={e => updateMobileReminders({ slot3Time: e.target.value })}
                      disabled={!mobileReminders.slot3Enabled}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Test & Live Verification */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Test message delivery right now to verify your phone gets alerted:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleTestMobile('test')}
                    disabled={mobileTestStatus === 'testing'}
                    className="btn btn-primary"
                    style={{ gap: 8, fontWeight: 700, padding: '8px 16px' }}
                  >
                    {mobileTestStatus === 'testing' && activeSlotTesting === 'test' ? (
                      <RefreshCcw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    📲 Send Test Message to Phone Now
                  </button>
                </div>
              </div>

              {/* Status Alert */}
              {mobileTestStatus !== 'idle' && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 12,
                    background: mobileTestStatus === 'success' ? 'rgba(34, 197, 94, 0.1)' : mobileTestStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${mobileTestStatus === 'success' ? 'rgba(34, 197, 94, 0.3)' : mobileTestStatus === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                    color: mobileTestStatus === 'success' ? '#22c55e' : mobileTestStatus === 'error' ? '#ef4444' : '#3b82f6',
                  }}
                >
                  {mobileTestStatus === 'success' && <CheckCircle size={16} />}
                  {mobileTestStatus === 'error' && <AlertTriangle size={16} />}
                  {mobileTestStatus === 'testing' && <RefreshCcw size={16} className="animate-spin" />}
                  <span>{mobileTestMessage}</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 🛡️ Streak Freeze & Recovery (Duolingo-style) */}
      <div className="card" style={{ padding: 24, marginBottom: 16, border: '1px solid rgba(245, 158, 11, 0.3)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(99, 102, 241, 0.02) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} style={{ color: '#fbbf24' }} />
            Duolingo-Style Streak Shields & Freeze Protection
          </div>
          <span
            className="badge"
            style={{
              background: analytics.streakFreezesAvailable > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: analytics.streakFreezesAvailable > 0 ? '#fbbf24' : '#f87171',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
            }}
          >
            {analytics.streakFreezesAvailable} / 3 Shields Active
          </span>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Prevent quitting if you miss a single day of practice. Streak shields automatically absorb missed days so your streak counter remains unbroken.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3].map(slot => (
                <Shield
                  key={slot}
                  size={20}
                  color={slot <= analytics.streakFreezesAvailable ? '#fbbf24' : 'var(--text-muted)'}
                  fill={slot <= analytics.streakFreezesAvailable ? '#fbbf24' : 'none'}
                />
              ))}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {analytics.streakFreezesAvailable > 0
                ? `${analytics.streakFreezesAvailable} Streak Freeze${analytics.streakFreezesAvailable !== 1 ? 's' : ''} Equipped`
                : 'Shield depleted! Refill below'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {analytics.streakFreezesAvailable < 3 && (
              <button
                onClick={() => refillStreakShields()}
                className="btn btn-secondary btn-sm"
                style={{ gap: 6 }}
              >
                <Sparkles size={13} /> Refill (+1 Shield)
              </button>
            )}
            <button
              onClick={() => setShieldModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: 6 }}
            >
              <Shield size={14} /> Manage Shields & History
            </button>
          </div>
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

      {/* Streak Shield Modal */}
      {shieldModalOpen && (
        <StreakShieldModal onClose={() => setShieldModalOpen(false)} />
      )}
    </div>
  );
}
