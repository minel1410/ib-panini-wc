'use client';

import { memo } from 'react';

type Props = {
  id: string;
  quantity: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
};

type ColorScheme = { bg: string; text: string; border: string };

const COLORS: Record<number, ColorScheme> = {
  0: { bg: '#0e1e30',  text: '#5a7a9a', border: '#1e3a58' },
  1: { bg: '#0a2e1e',  text: '#4ade80', border: '#166534' },
  2: { bg: '#2e1f00',  text: '#fbbf24', border: '#92400e' },
};

function getColors(quantity: number): ColorScheme {
  if (quantity === 0) return COLORS[0];
  if (quantity === 1) return COLORS[1];
  return COLORS[2];
}

export const StickerCard = memo(({ id, quantity, onIncrement, onDecrement }: Props) => {
  const { bg, text, border } = getColors(quantity);

  return (
    <div
      id={`sticker-${id}`}
      onClick={() => onIncrement(id)}
      onContextMenu={e => { e.preventDefault(); onDecrement(id); }}
      title={`${id}  qty: ${quantity}\nLeft click → add  |  Right click → remove`}
      style={{
        width: 58,
        height: 42,
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: text,
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        transition: 'transform 0.07s, box-shadow 0.07s',
        flexShrink: 0,
        fontFamily: "'Courier New', Courier, monospace",
        letterSpacing: 0.3,
        boxShadow: quantity >= 1 ? `0 0 8px ${border}66` : 'none',
      }}
      onMouseDown={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.88)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      {id}
      {quantity >= 2 && (
        <span style={{
          position: 'absolute',
          top: -7,
          right: -7,
          background: '#fbbf24',
          color: '#1a0f00',
          borderRadius: '50%',
          width: 18,
          height: 18,
          fontSize: 9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          lineHeight: 1,
          pointerEvents: 'none',
          border: '2px solid #92400e',
        }}>
          {quantity}
        </span>
      )}
    </div>
  );
});
