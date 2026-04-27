import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ALL_STICKER_IDS } from '@/lib/stickerIds';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const otherUsers = (await db.execute({ sql: 'SELECT id, name FROM users WHERE id != ?', args: [userId] })).rows as unknown as { id: string; name: string }[];

  const myRows = (await db.execute({ sql: 'SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ?', args: [userId] })).rows as unknown as { sticker_id: string; quantity: number }[];

  const myMap = new Map(myRows.map(r => [r.sticker_id, r.quantity]));
  const myNeeds = ALL_STICKER_IDS.filter(id => !myMap.has(id));
  const myDupes = [...myMap.entries()].filter(([, q]) => q > 1).map(([id]) => id);

  const matches = [];

  for (const user of otherUsers) {
    const theirRows = (await db.execute({ sql: 'SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ?', args: [user.id] })).rows as unknown as { sticker_id: string; quantity: number }[];

    const theirMap = new Map(theirRows.map(r => [r.sticker_id, r.quantity]));
    const theirDupeSet = new Set([...theirMap.entries()].filter(([, q]) => q > 1).map(([id]) => id));
    const theirNeedSet = new Set(ALL_STICKER_IDS.filter(id => !theirMap.has(id)));

    const theyGive = myNeeds.filter(id => theirDupeSet.has(id));
    const youGive = myDupes.filter(id => theirNeedSet.has(id));

    const count = Math.min(theyGive.length, youGive.length);
    if (count > 0) {
      const pairs = Array.from({ length: count }, (_, i) => ({
        give: youGive[i],
        get: theyGive[i],
      }));
      matches.push({ user, pairs, score: count });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return NextResponse.json(matches);
}
