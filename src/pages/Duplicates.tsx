'use client';

import { useStickers } from '../hooks/useStickers';
import { StickerCard } from '../components/StickerCard';

type Props = { userId: string };

const MONO = "'Courier New', Courier, monospace";

export function Duplicates({ userId }: Props) {
  const { stickerMap, loading, increment, decrement } = useStickers(userId);

  const dupes = [...stickerMap.entries()]
    .filter(([, q]) => q > 1)
    .sort(([a], [b]) => a.localeCompare(b));

  const totalSpares = dupes.reduce((acc, [, q]) => acc + (q - 1), 0);

  if (loading) {
    return (
      <div style={{ padding: 64, textAlign: 'center', color: '#7dd3e8', fontFamily: MONO, letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px', fontFamily: MONO }}>

      {/* Header row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'stretch' }}>
        <div style={{ background: '#132340', border: '1px solid #1e3550', borderRadius: 6, padding: '20px 28px', flex: 1 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>{dupes.length}</div>
          <div style={{ fontSize: 11, color: '#7dd3e8', marginTop: 6, letterSpacing: 2, textTransform: 'uppercase' }}>Sticker types with duplicates</div>
        </div>
        <div style={{ background: '#132340', border: '1px solid #1e3550', borderRadius: 6, padding: '20px 28px', flex: 1 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ffd700', lineHeight: 1 }}>{totalSpares}</div>
          <div style={{ fontSize: 11, color: '#7dd3e8', marginTop: 6, letterSpacing: 2, textTransform: 'uppercase' }}>Total spares to trade</div>
        </div>
      </div>

      {dupes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '72px 24px',
          background: '#132340',
          border: '1px dashed #1e3550',
          borderRadius: 6,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎴</div>
          <div style={{ fontSize: 14, color: '#f0f8ff', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>No duplicates yet</div>
          <div style={{ fontSize: 12, color: '#7dd3e8', marginTop: 8 }}>Keep collecting to get spare stickers!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {dupes.map(([id, qty]) => (
            <StickerCard key={id} id={id} quantity={qty} onIncrement={increment} onDecrement={decrement} />
          ))}
        </div>
      )}
    </div>
  );
}
