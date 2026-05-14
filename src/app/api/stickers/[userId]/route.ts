import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const result = await db.execute({
    sql: 'SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ? ORDER BY sticker_id ASC',
    args: [userId],
  });
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { stickers } = (await req.json()) as { stickers: string[] };

  if (!Array.isArray(stickers) || stickers.length === 0) {
    return NextResponse.json({ error: 'Invalid stickers array' }, { status: 400 });
  }

  // Count occurrences so "USA 1, USA 1, USA 1" adds qty+3, not qty+1 three times
  const inputCounts = new Map<string, number>();
  for (const id of stickers) {
    inputCounts.set(id, (inputCounts.get(id) ?? 0) + 1);
  }

  const uniqueIds = [...inputCounts.keys()];
  const placeholders = uniqueIds.map(() => '?').join(', ');
  const existing = await db.execute({
    sql: `SELECT sticker_id, quantity FROM user_stickers WHERE user_id = ? AND sticker_id IN (${placeholders})`,
    args: [userId, ...uniqueIds],
  });

  const currentMap = new Map(
    existing.rows.map(r => [r.sticker_id as string, r.quantity as number])
  );

  const added: Array<{ stickerId: string; newQuantity: number }> = [];
  const duplicates: Array<{ stickerId: string; previousQuantity: number; newQuantity: number; count: number }> = [];

  for (const [stickerId, count] of inputCounts) {
    const current = currentMap.get(stickerId) ?? 0;
    const newQty = current + count;

    await db.execute({
      sql: `INSERT INTO user_stickers (user_id, sticker_id, quantity) VALUES (?, ?, ?)
            ON CONFLICT (user_id, sticker_id) DO UPDATE SET quantity = excluded.quantity`,
      args: [userId, stickerId, newQty],
    });

    if (current === 0) {
      // First copy goes to album; any extra copies from the same input are duplicates
      added.push({ stickerId, newQuantity: newQty });
      if (count > 1) {
        duplicates.push({ stickerId, previousQuantity: 0, newQuantity: newQty, count: count - 1 });
      }
    } else {
      duplicates.push({ stickerId, previousQuantity: current, newQuantity: newQty, count });
    }
  }

  return NextResponse.json({ added, duplicates });
}
