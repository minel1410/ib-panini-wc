'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';
import type { LeaderboardEntry } from '../types';

type Props = { userId: string };

const MONO = "'Courier New', Courier, monospace";
const CARD = { background: '#132340', border: '1px solid #1e3550', borderRadius: 6 } as const;

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard({ userId }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#7dd3e8', fontFamily: MONO, letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>
        Loading leaderboard...
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#7dd3e8', fontFamily: MONO }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase' }}>No collectors yet</div>
      </div>
    );
  }

  const leader = entries[0];

  return (
    <div style={{ padding: '24px 28px', fontFamily: MONO, maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffd700', letterSpacing: 3, textTransform: 'uppercase', textShadow: '0 0 20px rgba(255,215,0,0.4)' }}>
          🏆 Leaderboard
        </h2>
        <div style={{ fontSize: 11, color: '#7dd3e8', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>
          {entries.length} collector{entries.length !== 1 ? 's' : ''} · ranked by completion
        </div>
      </div>

      {/* Leader spotlight */}
      {leader && (
        <div style={{ ...CARD, padding: '20px 24px', marginBottom: 20, border: '1px solid rgba(255,215,0,0.35)', boxShadow: '0 0 24px rgba(255,215,0,0.08)' }}>
          <div style={{ fontSize: 11, color: '#ffd700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
            🥇 Current Leader
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#ffd700' }}>{leader.user.name}</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: '#ffd700', lineHeight: 1, textShadow: '0 0 24px rgba(255,215,0,0.5)' }}>
              {leader.percent}%
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ height: 10, background: '#0a1628', borderRadius: 4, overflow: 'hidden', border: '1px solid #1e3550' }}>
                <div style={{
                  height: '100%',
                  width: `${leader.percent}%`,
                  background: 'linear-gradient(90deg, #7dd3e8, #ffd700)',
                  borderRadius: 4,
                  boxShadow: '0 0 10px rgba(255,215,0,0.4)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ fontSize: 12, color: '#7dd3e8', marginTop: 6 }}>
                <strong style={{ color: '#f0f8ff' }}>{leader.collected}</strong> collected · <strong style={{ color: '#f0f8ff' }}>{leader.missing}</strong> missing
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div style={{ ...CARD, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 90px 90px 90px 90px 100px',
          padding: '12px 18px',
          borderBottom: '1px solid #1e3550',
          fontSize: 10,
          color: '#7dd3e8',
          letterSpacing: 2,
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          <span>#</span>
          <span>Name</span>
          <span style={{ textAlign: 'center' }}>%</span>
          <span style={{ textAlign: 'center' }}>Collected</span>
          <span style={{ textAlign: 'center' }}>Missing</span>
          <span style={{ textAlign: 'center' }}>Spares</span>
          <span style={{ textAlign: 'center' }}>Trade value</span>
        </div>

        {/* Rows */}
        {entries.map((entry, idx) => {
          const isMe = entry.user.id === userId;
          const medal = MEDALS[idx] ?? null;

          return (
            <div
              key={entry.user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 90px 90px 90px 90px 100px',
                padding: '14px 18px',
                borderBottom: idx < entries.length - 1 ? '1px solid rgba(30,53,80,0.6)' : 'none',
                alignItems: 'center',
                background: isMe ? 'rgba(255,215,0,0.05)' : 'transparent',
                borderLeft: isMe ? '3px solid #ffd700' : '3px solid transparent',
                transition: 'background 0.15s',
              }}
            >
              {/* Rank */}
              <span style={{ fontSize: 16 }}>{medal ?? <span style={{ fontSize: 13, color: '#5a7a9a', fontWeight: 700 }}>{idx + 1}</span>}</span>

              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: isMe ? '#ffd700' : '#f0f8ff' }}>
                  {entry.user.name}
                </span>
                {isMe && (
                  <span style={{ fontSize: 9, color: '#ffd700', background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 3, padding: '2px 6px', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    You
                  </span>
                )}
              </div>

              {/* Progress % with mini bar */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: entry.percent === 100 ? '#4ade80' : '#ffd700', lineHeight: 1 }}>
                  {entry.percent}%
                </div>
                <div style={{ height: 3, background: '#0a1628', borderRadius: 2, overflow: 'hidden', marginTop: 4, border: '1px solid #1e3550' }}>
                  <div style={{
                    height: '100%',
                    width: `${entry.percent}%`,
                    background: entry.percent === 100 ? '#4ade80' : 'linear-gradient(90deg, #7dd3e8, #ffd700)',
                    borderRadius: 2,
                  }} />
                </div>
              </div>

              {/* Collected */}
              <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#4ade80' }}>
                {entry.collected}
              </span>

              {/* Missing */}
              <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: entry.missing === 0 ? '#4ade80' : '#5a7a9a' }}>
                {entry.missing}
              </span>

              {/* Spares */}
              <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: entry.duplicates > 0 ? '#fbbf24' : '#5a7a9a' }}>
                {entry.duplicates}
              </span>

              {/* Trading value */}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: entry.tradingValue > 0 ? '#7dd3e8' : '#5a7a9a',
                  background: entry.tradingValue > 0 ? 'rgba(125,211,232,0.1)' : 'transparent',
                  border: entry.tradingValue > 0 ? '1px solid rgba(125,211,232,0.25)' : '1px solid transparent',
                  borderRadius: 4,
                  padding: '3px 10px',
                }}>
                  {entry.tradingValue > 0 ? `+${entry.tradingValue}` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, fontSize: 11, color: '#5a7a9a', letterSpacing: 1, lineHeight: 1.8 }}>
        <strong style={{ color: '#7dd3e8' }}>Trade value</strong> — number of your spare stickers that at least one other collector still needs.
      </div>
    </div>
  );
}
