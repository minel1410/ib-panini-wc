import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TOTAL_STICKERS } from '@/lib/stickerIds';

export async function GET() {
  const users = (await db.execute('SELECT id, name FROM users')).rows as unknown as { id: string; name: string }[];
  const rows = (await db.execute('SELECT user_id, sticker_id, quantity FROM user_stickers')).rows as unknown as { user_id: string; sticker_id: string; quantity: number }[];

  const byUser = new Map<string, { collected: number; duplicates: number; totalExtra: number }>();
  for (const user of users) byUser.set(user.id, { collected: 0, duplicates: 0, totalExtra: 0 });
  for (const row of rows) {
    const entry = byUser.get(row.user_id);
    if (!entry) continue;
    if (row.quantity >= 1) entry.collected++;
    if (row.quantity > 1) {
      entry.duplicates++;
      entry.totalExtra += row.quantity - 1;
    }
  }

  const ownedByUser = new Map<string, Set<string>>();
  for (const user of users) ownedByUser.set(user.id, new Set());
  for (const row of rows) {
    if (row.quantity >= 1) ownedByUser.get(row.user_id)?.add(row.sticker_id);
  }

  const dupsByUser = new Map<string, Set<string>>();
  for (const user of users) dupsByUser.set(user.id, new Set());
  for (const row of rows) {
    if (row.quantity > 1) dupsByUser.get(row.user_id)?.add(row.sticker_id);
  }

  const leaderboard = users.map(user => {
    const stats = byUser.get(user.id) ?? { collected: 0, duplicates: 0, totalExtra: 0 };
    const percent = Math.round((stats.collected / TOTAL_STICKERS) * 100);
    const missing = TOTAL_STICKERS - stats.collected;

    const myDupes = dupsByUser.get(user.id) ?? new Set<string>();
    let tradingValue = 0;
    for (const stickerId of myDupes) {
      const neededByAnyone = users.some(other => {
        if (other.id === user.id) return false;
        return !(ownedByUser.get(other.id)?.has(stickerId));
      });
      if (neededByAnyone) tradingValue++;
    }

    return { user, collected: stats.collected, duplicates: stats.duplicates, totalExtra: stats.totalExtra, missing, percent, tradingValue };
  });

  leaderboard.sort((a, b) => b.percent - a.percent || b.collected - a.collected);
  return NextResponse.json(leaderboard);
}
