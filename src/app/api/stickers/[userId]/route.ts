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
