'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getMyStickers, updateSticker, bulkAddStickers, type BulkAddResult } from '../api';
import { TOTAL_STICKERS } from '../lib/stickerIds';
import type { StickerRow } from '../types';

export function useStickers(userId: string | null) {
  const [stickerMap, setStickerMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const pendingUpdates = useRef<Map<string, number>>(new Map());
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getMyStickers(userId).then((rows: StickerRow[]) => {
      setStickerMap(new Map(rows.map(r => [r.sticker_id, r.quantity])));
      setLoading(false);
    });
  }, [userId]);

  const setQuantity = useCallback(
    (stickerId: string, quantity: number) => {
      if (!userId) return;

      setStickerMap(prev => {
        const next = new Map(prev);
        if (quantity === 0) next.delete(stickerId);
        else next.set(stickerId, quantity);
        return next;
      });

      const existing = debounceTimers.current.get(stickerId);
      if (existing) clearTimeout(existing);

      pendingUpdates.current.set(stickerId, quantity);

      const timer = setTimeout(() => {
        const qty = pendingUpdates.current.get(stickerId) ?? quantity;
        updateSticker(userId, stickerId, qty);
        pendingUpdates.current.delete(stickerId);
        debounceTimers.current.delete(stickerId);
      }, 300);

      debounceTimers.current.set(stickerId, timer);
    },
    [userId]
  );

  const increment = useCallback(
    (stickerId: string) => {
      const current = stickerMap.get(stickerId) ?? 0;
      setQuantity(stickerId, current + 1);
    },
    [stickerMap, setQuantity]
  );

  const decrement = useCallback(
    (stickerId: string) => {
      const current = stickerMap.get(stickerId) ?? 0;
      if (current > 0) setQuantity(stickerId, current - 1);
    },
    [stickerMap, setQuantity]
  );

  const bulkAdd = useCallback(
    async (stickers: string[]): Promise<BulkAddResult> => {
      if (!userId) return { added: [], duplicates: [] };
      const result = await bulkAddStickers(userId, stickers);
      setStickerMap(prev => {
        const next = new Map(prev);
        for (const { stickerId, newQuantity } of [...result.added, ...result.duplicates]) {
          next.set(stickerId, newQuantity);
        }
        return next;
      });
      return result;
    },
    [userId]
  );

  const stats = {
    collected: stickerMap.size,
    total: TOTAL_STICKERS,
    percent: Math.round((stickerMap.size / TOTAL_STICKERS) * 100),
    duplicates: [...stickerMap.values()].filter(q => q > 1).reduce((acc, q) => acc + (q - 1), 0),
  };

  return { stickerMap, loading, increment, decrement, bulkAdd, stats };
}
