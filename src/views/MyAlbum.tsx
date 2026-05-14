'use client';

import { useState, useCallback } from 'react';
import { StickerCard } from '../components/StickerCard';
import { BulkAddModal } from '../components/BulkAddModal';
import { useStickers } from '../hooks/useStickers';
import { COUNTRIES, ALL_STICKER_IDS, TOTAL_STICKERS } from '../lib/stickerIds';

type Props = { userId: string };

const MONO = "'Courier New', Courier, monospace";
const CARD = { background: '#132340', border: '1px solid #1e3550', borderRadius: 6 } as const;

const GROUPS = [
  { label: '00', ids: ['00'] },
  { label: 'FWC', ids: Array.from({ length: 13 }, (_, i) => `FWC ${i + 1}`) },
  ...COUNTRIES.map(c => ({
    label: c,
    ids: Array.from({ length: 20 }, (_, i) => `${c} ${i + 1}`),
  })),
];

const ID_SET = new Set(ALL_STICKER_IDS);

export function MyAlbum({ userId }: Props) {
  const { stickerMap, loading, increment, decrement, bulkAdd, stats } = useStickers(userId);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSearch(val);
    if (ID_SET.has(val)) {
      document.getElementById(`sticker-${val}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleSearchKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const val = search.toUpperCase();
        if (ID_SET.has(val)) {
          document.getElementById(`sticker-${val}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          increment(val);
        }
      }
    },
    [search, increment]
  );

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#7dd3e8', fontFamily: MONO, letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>
        Loading album...
      </div>
    );
  }

  return (
    <>
    <div style={{ display: 'flex', gap: 28, padding: '24px 28px', fontFamily: MONO, alignItems: 'flex-start' }}>

      {/* Right — sticky photo */}
      <div style={{ order: 2, flex: '0 0 auto', width: 'clamp(300px, 30vw, 520px)', alignSelf: 'stretch', position: 'relative' }}>
        <div style={{ position: 'sticky', top: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 88px)' }}>
          <div style={{
            borderRadius: 10,
            overflow: 'hidden',
            border: '2px solid rgba(255,215,0,0.4)',
            boxShadow: '0 0 60px rgba(255,215,0,0.15), 0 0 0 1px rgba(255,215,0,0.08), 0 16px 64px rgba(0,0,0,0.8)',
          }}>
            <img src="/album-photo.jpg" alt="Album" style={{ width: '100%', display: 'block' }} />
          </div>
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: '#ffd700', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700, textShadow: '0 0 12px rgba(255,215,0,0.5)' }}>
            I AM FROM BOSNIA, TAKE ME TO AMERICA
          </div>
        </div>
      </div>

      {/* Left — main content */}
      <div style={{ order: 1, flex: 1, minWidth: 0 }}>
      {/* Stats tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {/* Collected */}
        <div style={{ ...CARD, padding: '24px 28px' }}>
          <div style={{ fontSize: 14, color: '#7dd3e8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Collected</div>
          <div style={{ fontSize: 52, fontWeight: 700, color: '#ffd700', lineHeight: 1 }}>
            {stats.collected}
          </div>
          <div style={{ fontSize: 15, color: '#7dd3e8', marginTop: 8 }}>out of {TOTAL_STICKERS}</div>
        </div>

        {/* Progress */}
        <div style={{ ...CARD, padding: '24px 28px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: '#7dd3e8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>Progress</span>
            <span style={{ fontSize: 44, fontWeight: 700, color: '#ffd700', lineHeight: 1 }}>{stats.percent}%</span>
          </div>
          <div style={{ height: 14, background: '#0a1628', borderRadius: 4, overflow: 'hidden', border: '1px solid #1e3550' }}>
            <div style={{
              height: '100%',
              width: `${stats.percent}%`,
              background: 'linear-gradient(90deg, #7dd3e8, #ffd700)',
              borderRadius: 4,
              transition: 'width 0.4s ease',
              boxShadow: '0 0 12px rgba(255,215,0,0.4)',
            }} />
          </div>
          <div style={{ fontSize: 14, color: '#7dd3e8', marginTop: 10 }}>
            <strong style={{ color: '#f0f8ff' }}>{TOTAL_STICKERS - stats.collected}</strong> stickers still needed
          </div>
        </div>

        {/* Spares */}
        <div style={{ ...CARD, padding: '24px 28px' }}>
          <div style={{ fontSize: 14, color: '#7dd3e8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Spare Stickers</div>
          <div style={{ fontSize: 52, fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>
            {stats.duplicates}
          </div>
          <div style={{ fontSize: 15, color: '#7dd3e8', marginTop: 8 }}>ready to trade</div>
        </div>
      </div>

      {/* Search + legend row */}
      <div style={{ ...CARD, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Jump to sticker (e.g. MEX 5, FWC 3)"
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKey}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            padding: '11px 16px',
            fontSize: 14,
            fontFamily: MONO,
            border: `2px solid ${searchFocused ? '#ffd700' : '#1e3550'}`,
            borderRadius: 4,
            width: 300,
            outline: 'none',
            background: '#0a1628',
            color: '#f0f8ff',
            letterSpacing: 1,
            boxShadow: searchFocused ? '0 0 14px rgba(255,215,0,0.25)' : 'none',
            transition: 'all 0.15s',
          }}
        />
        <span style={{ fontSize: 13, color: '#f0f8ff', letterSpacing: 1, fontWeight: 600 }}>
          Left click <strong style={{ color: '#4ade80' }}>+1</strong> · Right click <strong style={{ color: '#f87171' }}>−1</strong>
        </span>

        <button
          onClick={() => setBulkModalOpen(true)}
          style={{
            padding: '10px 18px',
            fontSize: 12,
            fontFamily: MONO,
            background: '#ffd700',
            border: 'none',
            borderRadius: 4,
            color: '#071220',
            cursor: 'pointer',
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            boxShadow: '0 0 12px rgba(255,215,0,0.3)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(255,215,0,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px rgba(255,215,0,0.3)'; }}
        >
          Bulk Add
        </button>

        {/* Legend */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
          {[
            { bg: '#0e1e30', border: '#1e3a58', text: '#5a7a9a', label: 'Missing',   count: TOTAL_STICKERS - stats.collected },
            { bg: '#0a2e1e', border: '#166534', text: '#4ade80', label: 'Owned',     count: stats.collected },
            { bg: '#2e1f00', border: '#92400e', text: '#fbbf24', label: 'Duplicate', count: stats.duplicates },
          ].map(({ bg, border, text, label, count }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ minWidth: 52, height: 34, background: bg, border: `2px solid ${border}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: text, fontFamily: MONO }}>{count}</span>
              </div>
              <span style={{ fontSize: 13, color: '#f0f8ff', fontWeight: 600, letterSpacing: 0.5 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {GROUPS.map(group => {
          const owned = group.ids.filter(id => (stickerMap.get(id) ?? 0) >= 1).length;
          const pct = Math.round((owned / group.ids.length) * 100);
          return (
            <div key={group.label} style={{ ...CARD, padding: '14px 18px' }}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffd700', letterSpacing: 2, textTransform: 'uppercase', minWidth: 60 }}>
                  {group.label}
                </span>
                <div style={{ flex: 1, height: 6, background: '#0a1628', borderRadius: 2, overflow: 'hidden', border: '1px solid #1e3550' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: pct === 100 ? '#4ade80' : 'linear-gradient(90deg, #7dd3e8, #ffd700)',
                    borderRadius: 2,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <span style={{ fontSize: 12, color: pct === 100 ? '#4ade80' : '#7dd3e8', fontWeight: 700, minWidth: 60, textAlign: 'right' }}>
                  {owned}/{group.ids.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {group.ids.map(id => (
                  <StickerCard
                    key={id}
                    id={id}
                    quantity={stickerMap.get(id) ?? 0}
                    onIncrement={increment}
                    onDecrement={decrement}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* end left column */}
    </div>

    {bulkModalOpen && (
      <BulkAddModal
        onClose={() => setBulkModalOpen(false)}
        onBulkAdd={bulkAdd}
      />
    )}
    </>
  );
}
