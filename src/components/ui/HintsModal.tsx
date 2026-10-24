import { useState } from 'react';
import {
  X, Lightbulb, Compass, Code, Clock, Database, ChevronRight,
  Sparkles, Bot, Send, Loader2, Copy, Check, RotateCcw
} from 'lucide-react';
import type { Problem } from '../../data/problems';
import { getProblemMetadata } from '../../data/problemMetadata';
import { CompanyLogo } from '../../data/companyLogos';
import { DifficultyBadge, TopicBadge } from './Badges';
import { generateAiHint, generateAiSolution } from '../../services/aiService';

interface HintsModalProps {
  problem: Problem;
  onClose: () => void;
}

export function HintsModal({ problem, onClose }: HintsModalProps) {
  const meta = getProblemMetadata(problem.id);
  const [activeTab, setActiveTab] = useState<'curated' | 'ai'>('curated');
  const [unlockedTier, setUnlockedTier] = useState<1 | 2 | 3>(1);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAskAi = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    setActiveTab('ai');

    try {
      let response = '';
      if (promptText.includes('full C++ optimal solution') || promptText.includes('solution code')) {
        response = await generateAiSolution(problem.title, problem.topic, problem.difficulty);
      } else {
        response = await generateAiHint(problem.title, problem.topic, problem.difficulty, promptText);
      }
      setAiResponse(response);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to connect to OpenRouter AI. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAi = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overlay animate-fade-in" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-blue-light)' }}>
                Day {problem.day}
              </span>
              <DifficultyBadge difficulty={problem.difficulty} />
              <TopicBadge topic={problem.topic} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
              {problem.number ? `#${problem.number} ` : ''}{problem.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="icon-button"
            style={{ width: 32, height: 32, padding: 0 }}
            aria-label="Close hints"
          >
            <X size={16} />
          </button>
        </div>

        {/* Company Tags & Complexity Pills */}
        <div style={{ padding: '10px 22px', background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
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
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2px 7px',
                  borderRadius: 5,
                  fontSize: 10.5,
                  color: 'var(--text-secondary)',
                }}
              >
                <CompanyLogo company={comp} size={12} />
                <span>{comp}</span>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent-cyan-light)' }}>
              <Clock size={12} /> Time: <strong>{meta.timeComplexity}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#a78bfa' }}>
              <Database size={12} /> Space: <strong>{meta.spaceComplexity}</strong>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', padding: '0 22px', borderBottom: '1px solid var(--border)', background: 'rgba(0, 0, 0, 0.1)' }}>
          <button
            onClick={() => setActiveTab('curated')}
            style={{
              padding: '11px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'curated' ? '2px solid var(--accent-blue-light)' : '2px solid transparent',
              color: activeTab === 'curated' ? '#ffffff' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Lightbulb size={15} color={activeTab === 'curated' ? 'var(--accent-blue-light)' : 'currentColor'} />
            3-Tier Progressive Hints
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            style={{
              padding: '11px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'ai' ? '2px solid #06b6d4' : '2px solid transparent',
              color: activeTab === 'ai' ? '#38bdf8' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Bot size={15} color={activeTab === 'ai' ? '#06b6d4' : 'currentColor'} />
            ✨ OpenRouter AI Coach
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            /* OpenRouter AI Coach Interactive Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Quick Prompt Chips */}
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Ask AI Coach:
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    'Explain intuition with real-world analogy',
                    'What subtle edge cases could fail?',
                    'Walk me through a dry run step-by-step',
                    'Generate full C++ optimal solution',
                  ].map(quickPrompt => (
                    <button
                      key={quickPrompt}
                      onClick={() => handleAskAi(quickPrompt)}
                      disabled={isLoading}
                      className="chip"
                      style={{
                        padding: '5px 10px',
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: 'var(--accent-cyan-light)',
                        cursor: 'pointer',
                        fontSize: 11.5,
                        textAlign: 'left',
                        borderRadius: 7,
                      }}
                    >
                      {quickPrompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Response Display */}
              {isLoading ? (
                <div
                  style={{
                    padding: '30px 20px',
                    borderRadius: 12,
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Loader2 size={24} color="#06b6d4" className="animate-spin" />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    OpenRouter AI is crafting tailored hints for <strong>{problem.title}</strong>...
                  </span>
                </div>
              ) : errorMsg ? (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: 13,
                  }}
                >
                  {errorMsg}
                </div>
              ) : aiResponse ? (
                <div
                  className="animate-fade-in"
                  style={{
                    padding: '16px 18px',
                    borderRadius: 12,
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} color="#06b6d4" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan-light)' }}>
                        AI Coach Guidance
                      </span>
                    </div>

                    <button
                      onClick={handleCopyAi}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '3px 8px', fontSize: 11, gap: 4 }}
                    >
                      {copied ? <><Check size={12} color="#34d399" /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>

                  <div style={{ fontSize: 13.5, color: '#e2e8f0', lineHeight: 1.65, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                    {aiResponse}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '24px 20px',
                    borderRadius: 12,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed var(--border)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                  }}
                >
                  Click any prompt chip above or ask a custom question below to get real-time hints powered by OpenRouter AI!
                </div>
              )}

              {/* Custom Input Box */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-base"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAskAi(aiPrompt);
                  }}
                  placeholder="Ask anything about this problem (e.g. why stack instead of queue?)..."
                  style={{ flex: 1, height: 38, fontSize: 13 }}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleAskAi(aiPrompt)}
                  disabled={isLoading || !aiPrompt.trim()}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                    borderColor: 'rgba(6, 182, 212, 0.4)',
                    padding: '0 14px',
                  }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--border)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={13} color="#06b6d4" /> Powered by OpenRouter AI API
          </span>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
