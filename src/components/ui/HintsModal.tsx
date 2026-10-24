import { useState, useRef, useEffect } from 'react';
import {
  X, Lightbulb, Compass, Code, Clock, Database, ChevronRight,
  Sparkles, Bot, Send, Loader2, Copy, Check, RotateCcw, User, Trash2
} from 'lucide-react';
import type { Problem } from '../../data/problems';
import { getProblemMetadata } from '../../data/problemMetadata';
import { CompanyLogo } from '../../data/companyLogos';
import { DifficultyBadge, TopicBadge } from './Badges';
import { generateAiHint, generateAiSolution } from '../../services/aiService';
import { useApp } from '../../context/AppContext';

interface HintsModalProps {
  problem: Problem;
  onClose: () => void;
}

export function HintsModal({ problem, onClose }: HintsModalProps) {
  const meta = getProblemMetadata(problem.id);
  const { store } = useApp();
  const [activeTab, setActiveTab] = useState<'curated' | 'ai'>('curated');
  const [unlockedTier, setUnlockedTier] = useState<1 | 2 | 3>(1);

  // AI Chat Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string; time: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === 'ai') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  const handleAskAi = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isLoading) return;

    const userMsgId = 'u-' + Date.now();
    const assistantMsgId = 'a-' + Date.now();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text, time: currentTime }]);
    setAiPrompt('');
    setIsLoading(true);
    setErrorMsg('');
    setActiveTab('ai');

    try {
      let response = '';
      const apiKey = store.settings.openRouterApiKey;
      const model = store.settings.aiModel || 'deepseek/deepseek-chat';

      if (text.includes('full C++ optimal solution') || text.includes('solution code')) {
        response = await generateAiSolution(problem.title, problem.topic, problem.difficulty, apiKey, model);
      } else {
        response = await generateAiHint(problem.title, problem.topic, problem.difficulty, text, apiKey, model);
      }

      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', text: response, time: currentTime }]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to connect to OpenRouter AI. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorMsg('');
  };

  return (
    <div className="overlay animate-fade-in" onClick={onClose}>
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 880,
          height: 'min(88vh, 840px)',
          minHeight: 480,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border)',
          overflow: 'hidden',
          margin: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 26px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-blue-light)' }}>
                Day {problem.day}
              </span>
              <DifficultyBadge difficulty={problem.difficulty} />
              <TopicBadge topic={problem.topic} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
              {problem.number ? `#${problem.number} ` : ''}{problem.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="icon-button"
            style={{ width: 34, height: 34, padding: 0 }}
            aria-label="Close hints"
          >
            <X size={18} />
          </button>
        </div>

        {/* Company Tags & Complexity Pills */}
        <div style={{ padding: '10px 26px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Asked at:</span>
            {meta.companies.map(comp => (
              <span
                key={comp}
                className="chip"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                }}
              >
                <CompanyLogo company={comp} size={13} />
                <span>{comp}</span>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan-light)' }}>
              <Clock size={13} /> Time: <strong>{meta.timeComplexity}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#a78bfa' }}>
              <Database size={13} /> Space: <strong>{meta.spaceComplexity}</strong>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', padding: '0 26px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <button
            onClick={() => setActiveTab('curated')}
            style={{
              padding: '13px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'curated' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'curated' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <Lightbulb size={16} color={activeTab === 'curated' ? 'var(--accent-blue-light)' : 'currentColor'} />
            3-Tier Progressive Hints
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            style={{
              padding: '13px 18px',
              fontSize: 13.5,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'ai' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'ai' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease',
            }}
          >
            <Bot size={16} color={activeTab === 'ai' ? 'var(--accent-cyan)' : 'currentColor'} />
            ✨ OpenRouter AI Coach
          </button>
        </div>

        {/* Tab Content - Scrollable with minHeight 0 */}
        <div className="modal-scrollable" style={{ padding: '22px 26px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeTab === 'curated' ? (
            <>
              {/* Tier 1: Intuition */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.07)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lightbulb size={13} color="var(--accent-blue-light)" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue-light)' }}>
                      Tier 1 — Core Intuition (Nudge)
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 999 }}>
                    Unlocked
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {meta.hints[0]}
                </p>
              </div>

              {/* Tier 2: Approach & Pattern */}
              {unlockedTier >= 2 ? (
                <div
                  className="animate-fade-in"
                  style={{
                    padding: '16px 18px',
                    borderRadius: 12,
                    background: 'rgba(6, 182, 212, 0.07)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Compass size={13} color="var(--accent-cyan-light)" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-cyan-light)' }}>
                        Tier 2 — Algorithmic Approach & Pattern
                      </span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 999 }}>
                      Unlocked
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {meta.hints[1]}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setUnlockedTier(2)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    justifyContent: 'space-between',
                    borderStyle: 'dashed',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={15} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Unlock Tier 2: Algorithmic Blueprint</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    Reveal Hint <ChevronRight size={14} />
                  </span>
                </button>
              )}

              {/* Tier 3: Pseudocode & Invariant */}
              {unlockedTier >= 3 ? (
                <div
                  className="animate-fade-in"
                  style={{
                    padding: '16px 18px',
                    borderRadius: 12,
                    background: 'rgba(245, 158, 11, 0.07)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Code size={13} color="#fbbf24" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>
                        Tier 3 — Pseudocode & Key Edge Cases
                      </span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 7px', borderRadius: 999 }}>
                      Unlocked
                    </span>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {meta.hints[2]}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setUnlockedTier(3)}
                  disabled={unlockedTier < 2}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    justifyContent: 'space-between',
                    borderStyle: 'dashed',
                    background: 'rgba(255, 255, 255, 0.02)',
                    opacity: unlockedTier < 2 ? 0.4 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code size={15} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Unlock Tier 3: Step-by-Step Logic</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    Reveal Hint <ChevronRight size={14} />
                  </span>
                </button>
              )}
            </>
          ) : (
            /* OpenRouter AI Coach Interactive Full-Featured Chat Layout */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 440, gap: 14 }}>
              {/* Quick Prompt Chips & Actions Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Quick Prompts:
                  </span>
                  {[
                    '💡 Core Invariant',
                    '⚠️ Subtle Edge Cases',
                    '🔍 Why this Data Structure?',
                    '⚡ Optimal C++ Code',
                  ].map(quickPrompt => (
                    <button
                      key={quickPrompt}
                      onClick={() => handleAskAi(quickPrompt)}
                      disabled={isLoading}
                      className="chip"
                      style={{
                        padding: '5px 11px',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: 'var(--accent-cyan)',
                        cursor: 'pointer',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 8,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {quickPrompt}
                    </button>
                  ))}
                </div>

                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '3px 8px', gap: 4, color: 'var(--text-muted)' }}
                    title="Clear chat history"
                  >
                    <Trash2 size={12} /> Clear Chat
                  </button>
                )}
              </div>

              {/* Chat Message Stream */}
              <div
                className="modal-scrollable"
                style={{
                  flex: 1,
                  minHeight: 280,
                  maxHeight: 460,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  paddingRight: 4,
                }}
              >
                {messages.length === 0 && !isLoading && !errorMsg ? (
                  <div
                    style={{
                      margin: 'auto',
                      padding: '40px 24px',
                      borderRadius: 16,
                      background: 'var(--bg-secondary)',
                      border: '1px dashed var(--border)',
                      textAlign: 'center',
                      maxWidth: 520,
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Bot size={24} color="var(--accent-cyan)" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                      Ask Your AI DSA Coach
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      Ask for intuition, algorithm trade-offs, edge cases, or full optimal C++ walkthroughs for <strong>{problem.title}</strong>.
                    </p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className="animate-fade-in"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        gap: 4,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', padding: '0 4px' }}>
                        {msg.role === 'user' ? (
                          <>
                            <span>You</span>
                            <User size={11} />
                            <span>• {msg.time}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={11} color="var(--accent-cyan)" />
                            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>AI Coach</span>
                            <span>• {msg.time}</span>
                          </>
                        )}
                      </div>

                      <div
                        style={{
                          maxWidth: msg.role === 'user' ? '82%' : '100%',
                          width: msg.role === 'user' ? 'auto' : '100%',
                          padding: msg.role === 'user' ? '12px 16px' : '18px 22px',
                          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: msg.role === 'user'
                            ? 'linear-gradient(135deg, var(--accent-blue), #4f46e5)'
                            : 'var(--bg-secondary)',
                          color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                          border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: 13.5,
                          lineHeight: 1.65,
                          whiteSpace: 'pre-wrap',
                          position: 'relative',
                        }}
                      >
                        {msg.role === 'assistant' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                            <button
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: 11, gap: 4 }}
                            >
                              {copiedId === msg.id ? <><Check size={12} color="#34d399" /> Copied</> : <><Copy size={12} /> Copy</>}
                            </button>
                          </div>
                        )}
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  ))
                )}

                {/* Loading State */}
                {isLoading && (
                  <div
                    className="animate-fade-in"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 20px',
                      borderRadius: 14,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      width: 'fit-content',
                    }}
                  >
                    <Loader2 size={18} color="var(--accent-cyan)" className="animate-spin" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      AI Coach is analyzing <strong>{problem.title}</strong>...
                    </span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMsg && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 12,
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      fontSize: 13,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>Connection Error</div>
                    <div>{errorMsg}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                      💡 Tip: Verify your key in <strong>Settings → AI DSA Coach</strong> or switch to another model like <em>DeepSeek V3</em> or <em>OpenRouter Auto</em>.
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Big Interactive Chat Textarea */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 14,
                  border: '1px solid var(--border)',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAskAi(aiPrompt);
                    }
                  }}
                  rows={3}
                  placeholder={`Ask a question or request code for ${problem.title} (e.g. "What is the monotonic queue invariant here?" or "Why does recursion fail on large inputs?")...`}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                  disabled={isLoading}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Press <kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 10 }}>Enter ↵</kbd> to send, <kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 10 }}>Shift + Enter</kbd> for new line
                  </span>

                  <button
                    onClick={() => handleAskAi(aiPrompt)}
                    disabled={isLoading || !aiPrompt.trim()}
                    className="btn btn-primary btn-sm"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
                      borderColor: 'rgba(6, 182, 212, 0.4)',
                      padding: '7px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>Ask Coach</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 26px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={13} color="#06b6d4" /> Powered by OpenRouter AI API
          </span>
          <button onClick={onClose} className="btn btn-primary btn-sm" style={{ padding: '6px 18px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
