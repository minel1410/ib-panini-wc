import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string; stickerId: string }> }) {
  const { userId, stickerId } = await params;
  const { quantity } = (await req.json()) as { quantity: number };

  if (!stickerId) return NextResponse.json({ error: 'Invalid sticker ID' }, { status: 400 });
  if (typeof quantity !== 'number' || quantity < 0) return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });

  if (quantity === 0) {
    await db.execute({
      sql: 'DELETE FROM user_stickers WHERE user_id = ? AND sticker_id = ?',
      args: [userId, stickerId],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO user_stickers (user_id, sticker_id, quantity) VALUES (?, ?, ?)
            ON CONFLICT (user_id, sticker_id) DO UPDATE SET quantity = excluded.quantity`,
      args: [userId, stickerId, quantity],
    });
  }

  return NextResponse.json({ ok: true });
}
