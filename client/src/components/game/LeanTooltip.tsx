import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LEAN_TERMS, type LeanTerm } from '@/data/leanTerms';

interface LeanTooltipTextProps {
  text: string;
  className?: string;
}

interface MatchSegment {
  type: 'text' | 'term';
  content: string;
  term?: LeanTerm;
  id?: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseTextWithTerms(text: string): MatchSegment[] {
  const allKeywords: { keyword: string; term: LeanTerm }[] = [];
  for (const t of LEAN_TERMS) {
    for (const kw of t.keywords) {
      allKeywords.push({ keyword: kw, term: t });
    }
  }
  allKeywords.sort((a, b) => b.keyword.length - a.keyword.length);

  const matches: { start: number; end: number; keyword: string; term: LeanTerm }[] = [];
  const used = new Set<number>();

  for (const { keyword, term } of allKeywords) {
    const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'g');
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      let overlaps = false;
      for (let i = start; i < end; i++) {
        if (used.has(i)) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) {
        matches.push({ start, end, keyword: match[0], term });
        for (let i = start; i < end; i++) {
          used.add(i);
        }
        break;
      }
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const segments: MatchSegment[] = [];
  let cursor = 0;
  let idCounter = 0;

  for (const m of matches) {
    if (m.start > cursor) {
      segments.push({ type: 'text', content: text.slice(cursor, m.start) });
    }
    segments.push({
      type: 'term',
      content: m.keyword,
      term: m.term,
      id: `lt-${idCounter++}`,
    });
    cursor = m.end;
  }

  if (cursor < text.length) {
    segments.push({ type: 'text', content: text.slice(cursor) });
  }

  return segments;
}

interface TooltipPosition {
  top: number;
  left: number;
}

interface TermSpanProps {
  segment: MatchSegment;
}

function TermSpan({ segment }: TermSpanProps) {
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!spanRef.current) return;
    const rect = spanRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, []);

  useEffect(() => {
    if (hovered) {
      updatePosition();
    }
  }, [hovered, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <>
      <span
        ref={spanRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-testid={`tooltip-term-${segment.term?.term}`}
        className="border-b border-dotted border-blue-400/60 cursor-help"
      >
        {segment.content}
      </span>
      {hovered && position && segment.term && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: `${position.top - 8}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
          className="z-[500] max-w-xs"
        >
          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
            <div className="font-bold text-blue-300 mb-0.5">{segment.term.term}</div>
            <div>{segment.term.definition}</div>
          </div>
          <div
            className="w-0 h-0 mx-auto"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid rgb(15 23 42)',
            }}
          />
        </div>,
        document.body,
      )}
    </>
  );
}

export const LeanTooltipText: React.FC<LeanTooltipTextProps> = ({ text, className }) => {
  const segments = useMemo(() => parseTextWithTerms(text), [text]);

  return (
    <span className={className} data-testid="lean-tooltip-text">
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        }
        return <TermSpan key={segment.id} segment={segment} />;
      })}
    </span>
  );
};
