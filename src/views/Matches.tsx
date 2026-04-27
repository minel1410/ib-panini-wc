'use client';

import { useState } from 'react';
import { getMatches } from '../api';
import type { MatchResult, TradePair } from '../types';

type Props = { userId: string };

const MONO = "'Courier New', Courier, monospace";

export function Matches({ userId }: Props) {
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const findMatches = async () => {
    setLoading(true);
    try {
      const data = await getMatches(userId);
      setMatches(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', fontFamily: MONO }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f0f8ff', letterSpacing: 2, textTransform: 'uppercase' }}>
            Trade Matches
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#7dd3e8', letterSpacing: 1 }}>
            Mutual matches only — both of you benefit from every listed trade
          </p>
        </div>
        <button
          onClick={findMatches}
          disabled={loading}
          style={{
            padding: '12px 28px',
            background: loading ? 'rgba(255,215,0,0.08)' : 'linear-gradient(135deg, #b8860b, #ffd700, #b8860b)',
            color: loading ? 'rgba(255,215,0,0.5)' : '#0d1929',
            border: '2px solid rgba(255,215,0,0.5)',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: MONO,
            whiteSpace: 'nowrap',
            boxShadow: loading ? 'none' : '0 0 20px rgba(255,215,0,0.25)',
            transition: 'all 0.15s',
          }}
        >
          {loading ? '⏳ Calculating...' : '🔍 Find Matches'}
        </button>
      </div>

      {/* Empty state */}
      {matches === null && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '72px 24px',
          background: '#132340',
          border: '1px dashed #1e3550',
          borderRadius: 6,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
          <div style={{ fontSize: 14, color: '#f0f8ff', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Find your trade partners
          </div>
          <div style={{ fontSize: 12, color: '#7dd3e8', marginTop: 8 }}>
            Click "Find Matches" to discover who you can trade with
          </div>
        </div>
      )}

      {/* No matches */}
      {matches !== null && matches.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '72px 24px',
          background: '#132340',
          border: '1px dashed #1e3550',
          borderRadius: 6,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
          <div style={{ fontSize: 14, color: '#f0f8ff', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>No matches found</div>
          <div style={{ fontSize: 12, color: '#7dd3e8', marginTop: 8 }}>Update your album and try again!</div>
        </div>
      )}

      {/* Match cards */}
      {matches && matches.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, color: '#7dd3e8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: -2 }}>
            {matches.length} match{matches.length !== 1 ? 'es' : ''} found · sorted by trade potential
          </div>

          {matches.map((match, i) => (
            <div key={match.user.id} style={{
              background: '#132340',
              border: `2px solid ${i === 0 ? 'rgba(255,215,0,0.6)' : '#1e3550'}`,
              borderRadius: 6,
              padding: '20px 24px',
              position: 'relative',
              boxShadow: i === 0 ? '0 0 24px rgba(255,215,0,0.12)' : 'none',
            }}>
              {i === 0 && (
                <span style={{
                  position: 'absolute',
                  top: -12,
                  left: 20,
                  background: 'linear-gradient(135deg, #b8860b, #ffd700)',
                  color: '#0d1929',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 12px',
                  borderRadius: 3,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  fontFamily: MONO,
                }}>
                  ★ Best Match
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <span style={{ fontSize: 22 }}>🤝</span>
                <strong style={{ fontSize: 16, color: '#f0f8ff', letterSpacing: 0.5 }}>{match.user.name}</strong>
                <span style={{
                  marginLeft: 'auto',
                  background: i === 0 ? 'rgba(255,215,0,0.15)' : 'rgba(125,211,232,0.1)',
                  color: i === 0 ? '#ffd700' : '#7dd3e8',
                  padding: '5px 16px',
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1,
                  border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.4)' : 'rgba(125,211,232,0.3)'}`,
                }}>
                  {match.score} trade{match.score !== 1 ? 's' : ''}
                </span>
              </div>

              <PairList pairs={match.pairs} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PairList({ pairs }: { pairs: TradePair[] }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 10;
  const shown = expanded ? pairs : pairs.slice(0, PREVIEW);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '96px 24px 96px', gap: '6px 0', alignItems: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', letterSpacing: 2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: '1px solid rgba(92,64,14,0.5)' }}>You give</div>
        <div />
        <div style={{ fontSize: 10, fontWeight: 700, color: '#4ade80', letterSpacing: 2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: '1px solid rgba(22,101,52,0.5)' }}>You get</div>

        {shown.map((p, i) => (
          <>
            <span key={`give-${i}`} style={{ padding: '4px 10px', background: '#2e1f00', border: '1px solid #92400e', borderRadius: 3, fontSize: 12, fontWeight: 700, color: '#fbbf24', fontFamily: MONO, textAlign: 'center' }}>
              {p.give}
            </span>
            <span key={`arrow-${i}`} style={{ textAlign: 'center', color: '#5a7a9a', fontSize: 14 }}>⇄</span>
            <span key={`get-${i}`} style={{ padding: '4px 10px', background: '#0a2e1e', border: '1px solid #166534', borderRadius: 3, fontSize: 12, fontWeight: 700, color: '#4ade80', fontFamily: MONO, textAlign: 'center' }}>
              {p.get}
            </span>
          </>
        ))}
      </div>

      {!expanded && pairs.length > PREVIEW && (
        <button onClick={() => setExpanded(true)} style={{
          marginTop: 10,
          padding: '4px 14px',
          fontSize: 11,
          background: 'rgba(125,211,232,0.08)',
          border: '1px solid rgba(125,211,232,0.3)',
          color: '#7dd3e8',
          borderRadius: 3,
          cursor: 'pointer',
          fontFamily: MONO,
          fontWeight: 700,
        }}>
          +{pairs.length - PREVIEW} more trades
        </button>
      )}
    </div>
  );
}
