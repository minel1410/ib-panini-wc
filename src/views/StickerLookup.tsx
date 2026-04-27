'use client';

import { useState } from 'react';
import { lookupSticker } from '../api';
import { ALL_STICKER_IDS } from '../lib/stickerIds';
import type { LookupResult } from '../types';

const MONO = "'Courier New', Courier, monospace";
const ID_SET = new Set(ALL_STICKER_IDS);

export function StickerLookup() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<LookupResult[] | null>(null);
  const [searched, setSearched] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const normalized = input.trim().toUpperCase();
  const isValid = ID_SET.has(normalized);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const data = await lookupSticker(normalized);
      setResults(data);
      setSearched(normalized);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 600, fontFamily: MONO }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f0f8ff', letterSpacing: 2, textTransform: 'uppercase' }}>
        Sticker Lookup
      </h2>
      <p style={{ margin: '6px 0 28px', fontSize: 12, color: '#7dd3e8', letterSpacing: 1 }}>
        Find colleagues who have spare copies of a specific sticker
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <input
          type="text"
          placeholder="e.g. MEX 5, FWC 3, 00"
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 15,
            fontFamily: MONO,
            border: `2px solid ${focused ? '#ffd700' : '#1e3550'}`,
            borderRadius: 4,
            outline: 'none',
            background: '#132340',
            color: '#f0f8ff',
            letterSpacing: 1,
            boxShadow: focused ? '0 0 14px rgba(255,215,0,0.2)' : 'none',
            transition: 'all 0.15s',
            textTransform: 'uppercase',
          }}
        />
        <button
          type="submit"
          disabled={loading || !isValid}
          style={{
            padding: '12px 28px',
            background: loading || !isValid ? 'rgba(255,215,0,0.08)' : 'linear-gradient(135deg, #b8860b, #ffd700, #b8860b)',
            color: loading || !isValid ? 'rgba(255,215,0,0.4)' : '#0d1929',
            border: '2px solid rgba(255,215,0,0.5)',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            cursor: loading || !isValid ? 'not-allowed' : 'pointer',
            fontFamily: MONO,
            boxShadow: !loading && isValid ? '0 0 16px rgba(255,215,0,0.25)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {results !== null && searched !== null && (
        <div>
          <div style={{ fontSize: 13, color: '#7dd3e8', marginBottom: 16, letterSpacing: 1 }}>
            Sticker <strong style={{ color: '#ffd700' }}>{searched}</strong> — users with spare copies:
          </div>

          {results.length === 0 ? (
            <div style={{
              padding: '40px 24px',
              textAlign: 'center',
              background: '#132340',
              border: '1px dashed #1e3550',
              borderRadius: 6,
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>😔</div>
              <div style={{ fontSize: 14, color: '#f0f8ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Nobody has spare {searched}
              </div>
              <div style={{ fontSize: 12, color: '#7dd3e8', marginTop: 6 }}>Check back after others update their albums</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map(r => (
                <div key={r.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  background: '#132340',
                  border: '1px solid #1e3550',
                  borderRadius: 6,
                }}>
                  <span style={{ fontSize: 18 }}>👤</span>
                  <strong style={{ fontSize: 15, color: '#f0f8ff', letterSpacing: 0.5 }}>{r.name}</strong>
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(251,191,36,0.15)',
                    color: '#fbbf24',
                    padding: '5px 16px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1,
                    border: '1px solid rgba(251,191,36,0.4)',
                  }}>
                    {r.quantity - 1} spare{r.quantity - 1 !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
