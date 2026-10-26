import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Lightbulb, Compass, Code, Clock, Database, ChevronRight,
  Sparkles, Bot, Send, Loader2, Copy, Check, RotateCcw, User, Trash2,
  Maximize2, Minimize2, ExternalLink, Bookmark, StickyNote, Star, Save,
  Columns2
} from 'lucide-react';
import type { Problem } from '../../data/problems';
import { getProblemMetadata } from '../../data/problemMetadata';
import { CompanyLogo } from '../../data/companyLogos';
import { DifficultyBadge, TopicBadge } from './Badges';
import { generateAiHint, generateAiSolution } from '../../services/aiService';
import { useApp } from '../../context/AppContext';
import {
  getProblemChatHistory, saveProblemChatHistory, clearProblemChatHistory,
  type ProblemChatMessage
} from '../../store/localStorage';
import { FormattedAiMessage } from './FormattedAiMessage';

interface HintsModalProps {
  problem: Problem;
  onClose: () => void;
}

export function HintsModal({ problem, onClose }: HintsModalProps) {
  const meta = getProblemMetadata(problem.id);
  const { store, getProblemUserData, updateNotes, setPersonalDifficulty, toggleRevision } = useApp();
  const userData = getProblemUserData(problem.id);

  const [activeTab, setActiveTab] = useState<'curated' | 'ai' | 'notes'>('curated');
  const [unlockedTier, setUnlockedTier] = useState<1 | 2 | 3>(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sideBySide, setSideBySide] = useState(false);

  // Notes state
  const [notesText, setNotesText] = useState(userData.notes || '');
  const [notesSaved, setNotesSaved] = useState(true);

  // AI Chat Assistant State - Separate for every single question
  const [aiPrompt, setAiPrompt] = useState('');
  const [messages, setMessages] = useState<ProblemChatMessage[]>(() => getProblemChatHistory(problem.id));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reload problem-specific chat and notes when question changes
  useEffect(() => {
    setMessages(getProblemChatHistory(problem.id));
    setNotesText(userData.notes || '');
    setErrorMsg('');
  }, [problem.id, userData.notes]);

  useEffect(() => {
    if (activeTab === 'ai') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  const handleSaveNotes = () => {
    updateNotes(problem.id, notesText);
    setNotesSaved(true);
  };

  const handleAskAi = async (promptText: string) => {
    const text = promptText.trim();
    if (!text || isLoading) return;

    const userMsgId = 'u-' + Date.now();
    const assistantMsgId = 'a-' + Date.now();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessages: ProblemChatMessage[] = [
      ...messages,
      { id: userMsgId, role: 'user', text, time: currentTime }
    ];
    setMessages(newMessages);
    saveProblemChatHistory(problem.id, newMessages);

    setAiPrompt('');
    setIsLoading(true);
    setErrorMsg('');
    setActiveTab('ai');

    try {
      let response = '';
      const apiKey = store.settings.openRouterApiKey;
      const model = store.settings.aiModel || 'deepseek/deepseek-chat';

      if (text.includes('full C++ optimal solution') || text.includes('solution code') || text.includes('⚡ Optimal C++ Code')) {
        response = await generateAiSolution(problem.title, problem.topic, problem.difficulty, apiKey, model);
      } else {
        response = await generateAiHint(problem.title, problem.topic, problem.difficulty, text, apiKey, model);
      }

      const finalMessages: ProblemChatMessage[] = [
        ...newMessages,
        { id: assistantMsgId, role: 'assistant', text: response, time: currentTime }
      ];
      setMessages(finalMessages);
      saveProblemChatHistory(problem.id, finalMessages);
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
    clearProblemChatHistory(problem.id);
    setMessages([]);
    setErrorMsg('');
  };

  const companiesList = (problem.companies && problem.companies.length > 0) ? problem.companies : meta.companies;

  return createPortal(
    <>
      {/* Clean Dimming Backdrop for the left half (NO backdropFilter blur to prevent screen blushing/shimmering) */}
      {!sideBySide && (
        <div
          className="animate-fade-in"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.16)',
            zIndex: 999,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Big Half-Screen Slide-Over Page Drawer on the Right */}
      <aside
        className="slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: isExpanded ? '86vw' : '52vw',
          minWidth: 'min(500px, 100vw)',
          maxWidth: '100vw',
          height: '100vh',
          background: 'var(--bg-card)',
          borderLeft: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '-15px 0 50px rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '18px 24px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 14,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, transparent 100%)',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 8 }}>
              {problem.day ? (
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-blue-light)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  Day {problem.day}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: 'rgba(236, 72, 153, 0.15)',
                    color: '#f472b6',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                  }}
                >
                  ✨ Custom Question
                </span>
              )}
              <DifficultyBadge difficulty={problem.difficulty} />
              <TopicBadge topic={problem.topic} />
            </div>

            <h2
              style={{
                fontSize: 21,
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.3px',
                margin: 0,
                lineHeight: 1.25,
              }}
            >
              {problem.number ? `#${problem.number} ` : ''}{problem.title}
            </h2>
          </div>

          {/* Action Tools: LeetCode link, Resize, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ gap: 5, padding: '6px 11px', fontSize: 12 }}
              title="Open problem on LeetCode"
            >
              <ExternalLink size={13} />
              <span>LeetCode</span>
            </a>

            <button
              onClick={() => setSideBySide(v => !v)}
              className="icon-button"
              style={{
                width: 34,
                height: 34,
                padding: 0,
                color: sideBySide ? '#38bdf8' : 'var(--text-muted)',
                background: sideBySide ? 'rgba(56, 189, 248, 0.15)' : undefined,
                border: sideBySide ? '1px solid rgba(56, 189, 248, 0.4)' : undefined,
              }}
              title={sideBySide ? 'Exit Side-by-Side Mode (Restore Backdrop)' : 'Side-by-Side Mode (Interact with left screen directly)'}
              aria-label={sideBySide ? 'Exit Side-by-Side Mode' : 'Side-by-Side Mode'}
            >
              <Columns2 size={16} />
            </button>

            <button
              onClick={() => setIsExpanded(v => !v)}
              className="icon-button"
              style={{ width: 34, height: 34, padding: 0 }}
              title={isExpanded ? 'Switch to 50% Half Screen' : 'Expand to Wide Screen (85%)'}
              aria-label={isExpanded ? 'Switch to 50% Half Screen' : 'Expand to Wide Screen (85%)'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              onClick={onClose}
              className="icon-button"
              style={{ width: 34, height: 34, padding: 0 }}
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Company Tags & Complexity Pills Row */}
        <div
          style={{
            padding: '10px 24px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Asked at:
            </span>
            {companiesList && companiesList.slice(0, 4).map(comp => (
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

        {/* Navigation Tabs Header */}
        <div
          style={{
            display: 'flex',
            padding: '0 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
            gap: 6,
          }}
        >
          <button
            onClick={() => setActiveTab('curated')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'curated' ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeTab === 'curated' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
            }}
          >
            <Lightbulb size={15} color={activeTab === 'curated' ? 'var(--accent-blue-light)' : 'currentColor'} />
            3-Tier Hints
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'ai' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'ai' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
            }}
          >
            <Bot size={15} color={activeTab === 'ai' ? 'var(--accent-cyan)' : 'currentColor'} />
            ✨ AI Tutor & Solutions
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 700,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'notes' ? '2px solid #fbbf24' : '2px solid transparent',
              color: activeTab === 'notes' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s ease',
            }}
          >
            <StickyNote size={15} color={activeTab === 'notes' ? '#fbbf24' : 'currentColor'} />
            Notes & Rating
          </button>
        </div>

        {/* Drawer Scrollable Content Body */}
        <div
          className="modal-scrollable"
          style={{
            padding: '22px 24px',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {activeTab === 'curated' && (
            <>
              {/* Tier 1: Core Intuition */}
              <div
                style={{
                  padding: '18px 20px',
                  borderRadius: 12,
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lightbulb size={14} color="var(--accent-blue-light)" />
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent-blue-light)' }}>
                      Tier 1 — Core Intuition (Mental Model)
                    </span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 999 }}>
                    Unlocked
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  {meta.hints[0]}
                </p>
              </div>

              {/* Tier 2: Algorithmic Approach & Pattern */}
              {unlockedTier >= 2 ? (
                <div
                  className="animate-fade-in"
                  style={{
                    padding: '18px 20px',
                    borderRadius: 12,
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Compass size={14} color="var(--accent-cyan-light)" />
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent-cyan-light)' }}>
                        Tier 2 — Algorithmic Approach & Data Structure
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 999 }}>
                      Unlocked
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                    {meta.hints[1]}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setUnlockedTier(2)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    justifyContent: 'space-between',
                    borderStyle: 'dashed',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600 }}>Unlock Tier 2: Algorithmic Blueprint</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Reveal Hint <ChevronRight size={14} />
                  </span>
                </button>
              )}

              {/* Tier 3: Pseudocode & Invariant */}
              {unlockedTier >= 3 ? (
                <div
                  className="animate-fade-in"
                  style={{
                    padding: '18px 20px',
                    borderRadius: 12,
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Code size={14} color="#fbbf24" />
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fbbf24' }}>
                        Tier 3 — Step-by-Step Logic & Edge Cases
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 999 }}>
                      Unlocked
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
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
                    padding: '14px 18px',
                    justifyContent: 'space-between',
                    borderStyle: 'dashed',
                    background: 'rgba(255, 255, 255, 0.02)',
                    opacity: unlockedTier < 2 ? 0.45 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Code size={16} color="var(--text-muted)" />
                    <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 600 }}>Unlock Tier 3: Invariant & Pseudocode</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Reveal Hint <ChevronRight size={14} />
                  </span>
                </button>
              )}

              {/* Direct Callout to AI Code generator */}
              <div
                style={{
                  marginTop: 10,
                  padding: '16px 20px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Need full C++ implementation with line-by-line explanation?
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Our AI Coach writes interview-grade C++ solutions.
                  </div>
                </div>
                <button
                  onClick={() => handleAskAi('⚡ Optimal C++ Code')}
                  className="btn btn-primary btn-sm"
                  style={{ background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)', gap: 6 }}
                >
                  <Bot size={14} /> Generate C++ Solution
                </button>
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            /* AI Coach Full Interactive Chat */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 450, gap: 14 }}>
              {/* Quick Prompt Chips */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Quick Prompts:
                  </span>
                  {[
                    '💡 Core Invariant',
                    '⚠️ Subtle Edge Cases',
                    '🔍 Data Structure Trade-offs',
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

              {/* Message Stream */}
              <div
                className="modal-scrollable"
                style={{
                  flex: 1,
                  minHeight: 280,
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
                      maxWidth: 480,
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
                          padding: msg.role === 'user' ? '12px 18px' : '20px 22px',
                          borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: msg.role === 'user'
                            ? 'linear-gradient(135deg, var(--accent-blue), #4f46e5)'
                            : 'var(--bg-secondary)',
                          color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                          border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: 13.5,
                          position: 'relative',
                        }}
                      >
                        {msg.role === 'assistant' ? (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                              <button
                                onClick={() => handleCopyText(msg.id, msg.text)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '2px 8px', fontSize: 11, gap: 4 }}
                              >
                                {copiedId === msg.id ? <><Check size={12} color="#34d399" /> Copied Full Text</> : <><Copy size={12} /> Copy All</>}
                              </button>
                            </div>
                            <FormattedAiMessage content={msg.text} />
                          </>
                        ) : (
                          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.text}</div>
                        )}
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
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>Connection Error</div>
                    <div>{errorMsg}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                      💡 Tip: Verify your key in <strong>Settings → AI Coach</strong> or switch to another model.
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Interactive Chat Input Textarea */}
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
                  placeholder={`Ask a question or request code for ${problem.title} (e.g. "Explain time complexity" or "Provide full C++ optimal solution")...`}
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
                    Press <kbd style={{ padding: '1px 5px', borderRadius: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 10 }}>Enter ↵</kbd> to send
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

          {activeTab === 'notes' && (
            /* Notes & Rating Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Rating and Revision row */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: 12,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Personal Difficulty Rating
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setPersonalDifficulty(problem.id, userData.personalDifficulty === star ? 0 : star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                      >
                        <Star
                          size={18}
                          fill={userData.personalDifficulty >= star ? '#fbbf24' : 'none'}
                          color={userData.personalDifficulty >= star ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => toggleRevision(problem.id)}
                  className={`btn btn-sm ${userData.needsRevision ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ gap: 6 }}
                >
                  <Bookmark size={14} fill={userData.needsRevision ? 'currentColor' : 'none'} />
                  {userData.needsRevision ? 'Flagged for Revision' : 'Flag for Revision'}
                </button>
              </div>

              {/* Editable Notes Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    My Problem Notes & Key Takeaways
                  </label>
                  {!notesSaved && (
                    <span style={{ fontSize: 11, color: '#fbbf24' }}>● Unsaved changes</span>
                  )}
                </div>

                <textarea
                  rows={8}
                  value={notesText}
                  onChange={e => {
                    setNotesText(e.target.value);
                    setNotesSaved(false);
                  }}
                  placeholder="Record your invariants, subtle edge cases, interview mistakes, or custom mental models here..."
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 12,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={handleSaveNotes}
                    className="btn btn-primary btn-sm"
                    style={{ gap: 6, padding: '7px 16px' }}
                  >
                    <Save size={14} /> Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Sparkles size={13} color="#06b6d4" /> Powered by OpenRouter AI API
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px 18px' }}
          >
            Close Drawer
          </button>
        </div>
      </aside>
    </>,
    document.body
  );
}
