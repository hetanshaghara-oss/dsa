import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

interface FormattedAiMessageProps {
  content: string;
}

export function FormattedAiMessage({ content }: FormattedAiMessageProps) {
  // Parse message into blocks: code blocks vs text blocks
  const blocks = parseBlocks(content);

  return (
    <div className="formatted-ai-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeSnippetBlock key={idx} language={block.language} code={block.text} />;
        }
        return <TextBlock key={idx} text={block.text} />;
      })}
    </div>
  );
}

interface Block {
  type: 'text' | 'code';
  text: string;
  language?: string;
}

function parseBlocks(raw: string): Block[] {
  const blocks: Block[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = raw.slice(lastIndex, match.index).trim();
      if (textChunk) {
        blocks.push({ type: 'text', text: textChunk });
      }
    }

    blocks.push({
      type: 'code',
      language: match[1]?.trim() || 'cpp',
      text: match[2]?.trimEnd() || '',
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < raw.length) {
    const trailing = raw.slice(lastIndex).trim();
    if (trailing) {
      blocks.push({ type: 'text', text: trailing });
    }
  }

  if (blocks.length === 0 && raw) {
    blocks.push({ type: 'text', text: raw });
  }

  return blocks;
}

function CodeSnippetBlock({ language, code }: { language?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language ? language.toUpperCase() : 'CODE';

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        margin: '6px 0',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Code Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          fontSize: 11.5,
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.5px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Code size={14} color="var(--accent-cyan)" />
          <span style={{ color: 'var(--accent-cyan)' }}>{displayLang}</span>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-secondary btn-sm"
          style={{ padding: '3px 9px', fontSize: 11, gap: 5, borderRadius: 6 }}
        >
          {copied ? (
            <>
              <Check size={12} color="#34d399" />
              <span style={{ color: '#34d399' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre
        className="modal-scrollable font-mono"
        style={{
          margin: 0,
          padding: '14px 18px',
          overflowX: 'auto',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          background: 'transparent',
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Heading 3: ### Heading
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: '10px 0 4px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ width: 4, height: 16, borderRadius: 2, background: 'var(--accent-cyan)', display: 'inline-block' }} />
              {renderFormattedInline(trimmed.replace(/^###\s*/, ''))}
            </h3>
          );
        }

        // Heading 2: ## Heading
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              style={{
                fontSize: 16.5,
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: '14px 0 6px',
                borderBottom: '1px solid var(--border)',
                paddingBottom: 6,
              }}
            >
              {renderFormattedInline(trimmed.replace(/^##\s*/, ''))}
            </h2>
          );
        }

        // List block: lines starting with - , * or numbers
        const lines = trimmed.split('\n');
        const isList = lines.every(l => /^(\s*[-*•]|\s*\d+\.)\s+/.test(l));

        if (isList) {
          return (
            <ul key={idx} style={{ paddingLeft: 22, margin: '4px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lines.map((l, lIdx) => {
                const clean = l.replace(/^(\s*[-*•]|\s*\d+\.)\s+/, '');
                return (
                  <li key={lIdx} style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-primary)' }}>
                    {renderFormattedInline(clean)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p
            key={idx}
            style={{
              fontSize: 13.5,
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Formats inline elements:
 * - Mathematical / Big-O symbols: O(N), O(log N), O(1), O(N^2), etc.
 * - Bold: **text**
 * - Inline code: `code`
 * - Math characters: <=, >=, !=, ->, <-
 */
function renderFormattedInline(rawText: string): React.ReactNode {
  // First, convert common ASCII math characters to standard mathematical unicode
  let text = rawText
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/!=/g, '≠')
    .replace(/->/g, ' → ')
    .replace(/<-/g, ' ← ');

  // Tokenize by inline code `...` and bold **...** and math notation $...$
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\$[^$]+\$)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Inline Code: `...`
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="font-mono"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            padding: '2px 6px',
            borderRadius: 5,
            fontSize: '0.88em',
            color: 'var(--accent-cyan-light)',
          }}
        >
          {code}
        </code>
      );
    }

    // Bold text: **...**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {formatMathCharacters(boldText)}
        </strong>
      );
    }

    // Math block: $...$
    if (part.startsWith('$') && part.endsWith('$')) {
      const mathExpr = part.slice(1, -1);
      return (
        <span
          key={index}
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            padding: '1px 4px',
            background: 'rgba(6, 182, 212, 0.08)',
            borderRadius: 4,
            color: 'var(--accent-cyan)',
            fontWeight: 600,
          }}
        >
          {formatMathCharacters(mathExpr)}
        </span>
      );
    }

    // Plain text with math symbol & Big-O highlighting
    return <span key={index}>{formatMathCharacters(part)}</span>;
  });
}

/**
 * Replaces Big-O patterns like O(N), O(N^2), O(log N), O(1) with formatted math tags
 */
function formatMathCharacters(text: string): React.ReactNode {
  // Regex to match Big-O notation like O(N), O(log n), O(N^2), O(V + E), O(1)
  const bigORegex = /\b(O\([^)]+\))/g;
  const parts = text.split(bigORegex);

  if (parts.length === 1) {
    return text;
  }

  return parts.map((seg, i) => {
    if (bigORegex.test(seg)) {
      // Format superscripts like ^2 or ^N
      const inner = seg.slice(2, -1);
      const mathFormatted = inner.split(/(\^[0-9a-zA-Z]+)/).map((piece, pi) => {
        if (piece.startsWith('^')) {
          return <sup key={pi} style={{ fontSize: '0.75em' }}>{piece.slice(1)}</sup>;
        }
        return piece;
      });

      return (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 6px',
            borderRadius: 5,
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: 'var(--accent-blue-light)',
            fontWeight: 700,
            fontFamily: 'monospace',
            fontSize: '0.9em',
            margin: '0 2px',
          }}
        >
          <em>O</em>({mathFormatted})
        </span>
      );
    }
    return seg;
  });
}
