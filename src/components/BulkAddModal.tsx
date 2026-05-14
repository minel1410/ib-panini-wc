'use client';

import { useState, useCallback, useEffect } from 'react';
import { ALL_STICKER_IDS } from '../lib/stickerIds';
import type { BulkAddResult } from '../api';

const MONO = "'Courier New', Courier, monospace";
const VALID_IDS = new Set(ALL_STICKER_IDS);

function parseInput(input: string): { valid: string[]; unknown: string[] } {
  const tokens = input.split(/[,\s]+/).filter(Boolean);
  const valid: string[] = [];
  const unknown: string[] = [];

  for (const token of tokens) {
    const upper = token.toUpperCase();
    if (VALID_IDS.has(upper)) {
      valid.push(upper);
      continue;
    }
    // Try inserting space: "MEX5" → "MEX 5"
    const m = upper.match(/^([A-Z]+)(\d+)$/);
    if (m) {
      const candidate = `${m[1]} ${m[2]}`;
      if (VALID_IDS.has(candidate)) {
        valid.push(candidate);
        continue;
      }
    }
    unknown.push(token);
  }

  return { valid, unknown };
}

type Phase = 'input' | 'result';

interface Props {
  onClose: () => void;
  onBulkAdd: (stickers: string[]) => Promise<BulkAddResult>;
}

export function BulkAddModal({ onClose, onBulkAdd }: Props) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [result, setResult] = useState<BulkAddResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { valid, unknown } = parseInput(input);

  const handleSubmit = useCallback(async () => {
    if (valid.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onBulkAdd(valid);
      setResult(res);
      setPhase('result');
    } catch {
      setError('Failed to add stickers. Try again.');
    } finally {
      setLoading(false);
    }
  }, [valid, onBulkAdd]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1f35',
          border: '1px solid #1e3550',
          borderRadius: 10,
          padding: '32px 36px',
          width: 520,
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflowY: 'auto',
          fontFamily: MONO,
          boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,215,0,0.08)',
        }}
      >
        {phase === 'input' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ffd700', letterSpacing: 2, textTransform: 'uppercase' }}>
                Bulk Add Stickers
              </span>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a7a9a', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ fontSize: 12, color: '#5a7a9a', marginBottom: 12, letterSpacing: 0.5 }}>
              Enter sticker codes separated by commas or spaces.<br />
              Both <span style={{ color: '#7dd3e8' }}>MEX 5</span> and <span style={{ color: '#7dd3e8' }}>MEX5</span> are accepted.
            </div>

            <textarea
              autoFocus
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="BIH1, MEX5, FWC3, KOR 12..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                fontFamily: MONO,
                background: '#071220',
                border: '2px solid #1e3550',
                borderRadius: 4,
                color: '#f0f8ff',
                resize: 'vertical',
                outline: 'none',
                letterSpacing: 1,
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#ffd700'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#1e3550'; }}
            />

            {/* Parse preview */}
            {input.trim() && (
              <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {valid.length > 0 && (
                  <div style={{ background: '#0a2e1e', border: '1px solid #166534', borderRadius: 4, padding: '6px 12px', fontSize: 12, color: '#4ade80' }}>
                    {valid.length} valid
                  </div>
                )}
                {unknown.length > 0 && (
                  <div style={{ background: '#2e0a0a', border: '1px solid #7f1d1d', borderRadius: 4, padding: '6px 12px', fontSize: 12, color: '#f87171' }}>
                    {unknown.length} unknown: {unknown.slice(0, 5).join(', ')}{unknown.length > 5 ? '...' : ''}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#f87171' }}>{error}</div>
            )}

            <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px', fontSize: 12, fontFamily: MONO,
                  background: 'none', border: '1px solid #1e3550',
                  borderRadius: 4, color: '#7dd3e8', cursor: 'pointer', letterSpacing: 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={valid.length === 0 || loading}
                style={{
                  padding: '10px 24px', fontSize: 12, fontFamily: MONO,
                  background: valid.length > 0 && !loading ? '#ffd700' : '#1e3550',
                  border: 'none',
                  borderRadius: 4,
                  color: valid.length > 0 && !loading ? '#071220' : '#5a7a9a',
                  cursor: valid.length > 0 && !loading ? 'pointer' : 'default',
                  fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? 'Adding...' : `Add ${valid.length} sticker${valid.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ffd700', letterSpacing: 2, textTransform: 'uppercase' }}>
                Done
              </span>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a7a9a', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#0a2e1e', border: '1px solid #166534', borderRadius: 6, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, color: '#4ade80', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>New</div>
                <div style={{ fontSize: 42, fontWeight: 700, color: '#4ade80', lineHeight: 1 }}>{result?.added.length ?? 0}</div>
                <div style={{ fontSize: 12, color: '#4ade80', marginTop: 6, opacity: 0.7 }}>new to album</div>
              </div>
              <div style={{ background: '#2e1f00', border: '1px solid #92400e', borderRadius: 6, padding: '18px 20px' }}>
                <div style={{ fontSize: 11, color: '#fbbf24', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Duplicates</div>
                <div style={{ fontSize: 42, fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>
                  {result?.duplicates.reduce((acc, d) => acc + d.count, 0) ?? 0}
                </div>
                <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 6, opacity: 0.7 }}>ready to trade</div>
              </div>
            </div>

            {result && result.duplicates.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#fbbf24', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Duplicate stickers</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.duplicates.map(d => (
                    <span key={d.stickerId} style={{
                      padding: '4px 10px', fontSize: 12, fontFamily: MONO,
                      background: '#1a1000', border: '1px solid #92400e',
                      borderRadius: 3, color: '#fbbf24',
                    }}>
                      {d.stickerId}{d.count > 1 ? ` ×${d.count}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result && result.added.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#4ade80', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Added to album</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.added.map(d => (
                    <span key={d.stickerId} style={{
                      padding: '4px 10px', fontSize: 12, fontFamily: MONO,
                      background: '#001a0d', border: '1px solid #166534',
                      borderRadius: 3, color: '#4ade80',
                    }}>
                      {d.stickerId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={() => { setPhase('input'); setInput(''); setResult(null); }}
                style={{
                  padding: '10px 20px', fontSize: 12, fontFamily: MONO,
                  background: 'none', border: '1px solid #1e3550',
                  borderRadius: 4, color: '#7dd3e8', cursor: 'pointer', letterSpacing: 1,
                }}
              >
                Add more
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 24px', fontSize: 12, fontFamily: MONO,
                  background: '#ffd700', border: 'none',
                  borderRadius: 4, color: '#071220', cursor: 'pointer',
                  fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
