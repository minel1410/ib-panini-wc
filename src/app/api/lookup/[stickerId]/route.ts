import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ stickerId: string }> }) {
  const { stickerId } = await params;

  if (!stickerId) return NextResponse.json({ error: 'Invalid sticker ID' }, { status: 400 });

  const result = await db.execute({
    sql: `SELECT u.id, u.name, us.quantity
          FROM user_stickers us
          JOIN users u ON u.id = us.user_id
          WHERE us.sticker_id = ? AND us.quantity > 1
          ORDER BY u.name ASC`,
    args: [stickerId],
  });

  return NextResponse.json(result.rows);
}
